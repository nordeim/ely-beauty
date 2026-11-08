"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Banknote, CreditCard, Tag, Truck } from "lucide-react";

import type { CartLine } from "@/lib/cart";
import { formatMoney } from "@/lib/money";
import { shippingMethodForCity } from "@/lib/order-money";
import { newRequestId } from "@/lib/random-id";
import { isPublishableKeyConfigured } from "@/lib/stripe-config";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toaster";
import { StripeCheckout, type StripeMintSnapshot } from "@/components/checkout/stripe-pay";
// sessionStorage handoff key written by the cart page's CouponBox — single-
// sourced there so the two ends of the handoff can never drift (S6-12).
import { COUPON_STORAGE_KEY } from "../cart/coupon-box";

export type CheckoutAddress = {
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

type ShippingConfig = {
  standardCents: number;
  expressCents: number;
  freeThresholdCents: number;
  taxRatePercent: number;
};

type AppliedCoupon = {
  code: string;
  discount: number;
  freeShipping?: boolean;
  description?: string;
};

type CouponApplyResponse = {
  ok?: boolean;
  code?: string;
  discount?: number;
  freeShipping?: boolean;
  description?: string;
  error?: string;
};

type PaymentMethod = "cod" | "card";
type ShippingMethod = "standard" | "express";

function Field({
  label,
  htmlFor,
  error,
  children,
  optional = false,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="eyebrow-label text-muted-foreground">
        {label}
        {optional ? " (optional)" : " *"}
      </label>
      <div className="mt-2">{children}</div>
      {error && (
        <p id={`${htmlFor}-error`} className="mt-1.5 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

const inputCls =
  "h-11 w-full border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40";

/**
 * CheckoutClient — the ElyBeauty single-page checkout (reference parity):
 * CONTACT → SHIPPING ADDRESS → PAYMENT METHOD (Cash on Delivery default;
 * Card appears only when Stripe is configured — the superset activation) →
 * Order Notes, with the ORDER SUMMARY sidebar (line items w/ variants,
 * coupon box, city-tiered shipping, total) and the PLACE ORDER — ৳NNN bar.
 *
 * Every hardened invariant is retained: the idempotency key is minted once
 * per visit, totals re-derive through computeOrderMoney inputs server-side,
 * the coupon re-validates in the transaction, the cart clear is scoped to
 * the ordered lines, and the receipt is token-gated.
 */
export function CheckoutClient({
  lines,
  subtotal,
  user,
  defaultAddress,
  shipping,
  stripeEnabled = false,
  publishableKey,
}: {
  lines: CartLine[];
  subtotal: number;
  user: { name: string; email: string; phone: string | null } | null;
  defaultAddress: CheckoutAddress | null;
  shipping: ShippingConfig;
  stripeEnabled?: boolean;
  publishableKey?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();

  // The Stripe sentinel mirror (PAY-STRIPE-1): both sides must agree the
  // real path is live before the Payment Element island can mount.
  const stripeOn = stripeEnabled && isPublishableKeyConfigured(publishableKey);

  const [email, setEmail] = React.useState(user?.email ?? "");
  const [fullName, setFullName] = React.useState(defaultAddress?.fullName ?? user?.name ?? "");
  const [phone, setPhone] = React.useState(defaultAddress?.phone ?? user?.phone ?? "");
  const [addr, setAddr] = React.useState<CheckoutAddress>({
    fullName: defaultAddress?.fullName ?? user?.name ?? "",
    phone: defaultAddress?.phone ?? user?.phone ?? "",
    line1: defaultAddress?.line1 ?? "",
    line2: defaultAddress?.line2 ?? "",
    city: defaultAddress?.city ?? "",
    state: defaultAddress?.state ?? "",
    postalCode: defaultAddress?.postalCode ?? "",
    country: "Bangladesh",
  });
  const [saveAddress, setSaveAddress] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>("cod");
  const [notes, setNotes] = React.useState("");

  const [coupon, setCoupon] = React.useState<AppliedCoupon | null>(null);
  const [couponInput, setCouponInput] = React.useState("");
  const [couponPending, setCouponPending] = React.useState(false);
  const [couponError, setCouponError] = React.useState<string | null>(null);
  const couponAutoTried = React.useRef(false);

  // Session-7 S7-10: minted ONCE per checkout visit (crypto.randomUUID with
  // the non-secure-context fallback) — a retry (double-click, network fail)
  // reuses the same key and resolves to the already-placed order.
  const [idempotencyKey] = React.useState<string>(() => newRequestId());

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  // ---- Money mirror (display only — the server re-derives in the tx) ----
  const discount = coupon?.discount ?? 0;
  const taxable = Math.max(0, subtotal - discount);
  const couponFreeShipping = coupon?.freeShipping === true;
  // Run-72: the shipping TIER derives from the City/District field (Dhaka vs
  // outside) — no city typed yet renders "Enter city to calculate".
  const cityTyped = addr.city.trim().length >= 2;
  const shippingMethod: ShippingMethod = cityTyped ? shippingMethodForCity(addr.city) : "standard";
  const meetsThreshold = taxable >= shipping.freeThresholdCents;
  const shippingCost = !cityTyped
    ? null
    : couponFreeShipping || meetsThreshold
      ? 0
      : shippingMethod === "express"
        ? shipping.expressCents
        : shipping.standardCents;
  const tax = Math.round((taxable * shipping.taxRatePercent) / 100);
  const total = taxable + (shippingCost ?? 0) + tax;

  const applyCoupon = React.useCallback(
    async (rawCode: string, silent = false) => {
      const code = rawCode.trim();
      if (!code) return;
      setCouponPending(true);
      setCouponError(null);
      try {
        const res = await fetch("/api/coupon/apply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });
        const data = (await res.json()) as CouponApplyResponse;
        if (!res.ok || !data.ok) {
          const message = data.error ?? "This code could not be applied.";
          if (!silent) setCouponError(message);
          setCoupon(null);
          return;
        }
        setCoupon({
          code: data.code ?? code,
          discount: data.discount ?? 0,
          freeShipping: data.freeShipping,
          description: data.description,
        });
      } catch {
        if (!silent) setCouponError("Could not check this code — please try again.");
      } finally {
        setCouponPending(false);
      }
    },
    [],
  );

  // Coupon handoff (S6-12): the cart page's CouponBox stashes the applied
  // code in sessionStorage; the checkout re-applies it once, silently.
  React.useEffect(() => {
    if (couponAutoTried.current) return;
    couponAutoTried.current = true;
    const stored = window.sessionStorage.getItem(COUPON_STORAGE_KEY);
    if (stored) {
      const timer = window.setTimeout(() => void applyCoupon(stored, true), 0);
      return () => window.clearTimeout(timer);
    }
  }, [applyCoupon]);

  function removeCoupon() {
    setCoupon(null);
    setCouponInput("");
    setCouponError(null);
    window.sessionStorage.removeItem(COUPON_STORAGE_KEY);
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (fullName.trim().length < 2) errs.fullName = "Full name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = "Enter a valid email address";
    if (phone.trim().length < 7) errs.phone = "Phone number is required";
    if (addr.line1.trim().length < 4) errs.line1 = "Address is required";
    if (addr.city.trim().length < 2) errs.city = "City / District is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // ---- Place order ----
  // The Stripe path (PAY-STRIPE-1): the island's CONFIRMED PaymentIntent id
  // rides the body — card data itself never crosses (the Payment Element
  // owns it). A null/absent id keeps the COD path byte-identical.
  async function handlePlaceOrder(stripePaymentIntentId?: string) {
    if (!validate()) {
      setFormError("Please complete the required fields above.");
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          customerName: fullName.trim(),
          shippingMethod: cityTyped ? shippingMethodForCity(addr.city) : "standard",
          paymentMethod,
          couponCode: coupon?.code ?? "",
          notes: notes.trim(),
          saveAddress: Boolean(user) && saveAddress,
          idempotencyKey,
          ...(stripePaymentIntentId ? { stripePaymentIntentId } : {}),
          address: {
            label: "Home",
            fullName: fullName.trim(),
            phone: phone.trim(),
            line1: addr.line1.trim(),
            line2: addr.line2.trim(),
            city: addr.city.trim(),
            state: (addr.state || addr.city).trim(),
            postalCode: addr.postalCode.trim(),
            country: "Bangladesh",
          },
        }),
      });
      const data = (await res.json()) as { orderNumber?: string; token?: string; error?: string };
      if (!res.ok || !data.orderNumber) {
        const message = data.error ?? "Could not place your order. Please try again.";
        setFormError(message);
        toast({ title: "Order failed", description: message, variant: "destructive" });
        return;
      }
      window.sessionStorage.removeItem(COUPON_STORAGE_KEY);
      // The success page renders the receipt only for a valid order+token pair
      // (minted server-side) — guessable numbers alone show nothing.
      const params = new URLSearchParams({ order: data.orderNumber, token: data.token ?? "" });
      router.push(`/checkout/success?${params.toString()}`);
    } catch {
      const message = "Network error — please try again.";
      setFormError(message);
      toast({ title: "Order failed", description: message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  // The Stripe island's mint snapshot (PAY-STRIPE-1): the placement subset
  // of the checkout input — the mint re-derives the amount server-side and
  // the intent's metadata carries this so the webhook backstop can rebuild
  // the placement if the browser dies between confirm and submit.
  const stripeSnapshot: StripeMintSnapshot = {
    email: email.trim(),
    customerName: fullName.trim(),
    shippingMethod: cityTyped ? shippingMethodForCity(addr.city) : "standard",
    couponCode: coupon?.code ?? "",
    idempotencyKey,
    address: {
      fullName: fullName.trim(),
      phone: phone.trim(),
      line1: addr.line1.trim(),
      line2: addr.line2.trim(),
      city: addr.city.trim(),
      state: (addr.state || addr.city).trim(),
      postalCode: addr.postalCode.trim(),
      country: "Bangladesh",
    },
  };

  const sectionTitle = "font-display text-xl font-medium";
  const placeLabel = `PLACE ORDER — ${formatMoney(total)}`;

  return (
    <div className="container-page flex flex-col gap-8 py-10 sm:py-14">
      <div>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Continue Shopping
        </Link>
      </div>

      <h1 className="font-display text-4xl font-light tracking-tight sm:text-5xl">Checkout</h1>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_400px]">
        {/* ---- LEFT: the form ---- */}
        <form
          className="flex flex-col gap-10"
          onSubmit={(e) => {
            e.preventDefault();
            if (paymentMethod === "cod") void handlePlaceOrder();
          }}
        >
          {/* CONTACT */}
          <section aria-labelledby="contact-title" className="flex flex-col gap-5">
            <h2 id="contact-title" className={sectionTitle}>
              Contact
            </h2>
            <Field label="Full Name" htmlFor="co-name" error={errors.fullName}>
              <Input
                id="co-name"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputCls}
                placeholder="Your full name"
              />
            </Field>
            <Field label="Email" htmlFor="co-email" error={errors.email}>
              <Input
                id="co-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
                placeholder="you@example.com"
              />
            </Field>
            <Field label="Phone Number" htmlFor="co-phone" error={errors.phone}>
              <Input
                id="co-phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputCls}
                placeholder="01XXXXXXXXX"
              />
            </Field>
          </section>

          {/* SHIPPING ADDRESS */}
          <section aria-labelledby="shipping-title" className="flex flex-col gap-5">
            <h2 id="shipping-title" className={sectionTitle}>
              Shipping Address
            </h2>
            <Field label="Address" htmlFor="co-line1" error={errors.line1}>
              <Input
                id="co-line1"
                autoComplete="address-line1"
                value={addr.line1}
                onChange={(e) => setAddr((a) => ({ ...a, line1: e.target.value }))}
                className={inputCls}
                placeholder="House, road, area"
              />
            </Field>
            <Field label="Apartment, house, road, area" htmlFor="co-line2" optional>
              <Input
                id="co-line2"
                autoComplete="address-line2"
                value={addr.line2}
                onChange={(e) => setAddr((a) => ({ ...a, line2: e.target.value }))}
                className={inputCls}
              />
            </Field>
            <Field label="City / District" htmlFor="co-city" error={errors.city}>
              <Input
                id="co-city"
                autoComplete="address-level2"
                value={addr.city}
                onChange={(e) => setAddr((a) => ({ ...a, city: e.target.value }))}
                className={inputCls}
                placeholder="e.g. Dhaka"
              />
            </Field>
            <Field label="ZIP / Postal Code" htmlFor="co-zip" optional>
              <Input
                id="co-zip"
                autoComplete="postal-code"
                value={addr.postalCode}
                onChange={(e) => setAddr((a) => ({ ...a, postalCode: e.target.value }))}
                className={inputCls}
              />
            </Field>
            <Field label="Country" htmlFor="co-country">
              <Input id="co-country" value="Bangladesh" readOnly className={cn(inputCls, "bg-secondary text-muted-foreground")} />
            </Field>
          </section>

          {/* PAYMENT METHOD */}
          <section aria-labelledby="payment-title" className="flex flex-col gap-4">
            <h2 id="payment-title" className={sectionTitle}>
              Payment Method
            </h2>
            <label
              className={cn(
                "flex cursor-pointer items-center gap-4 border p-4 transition-colors",
                paymentMethod === "cod" ? "border-foreground" : "border-input hover:border-foreground/40",
              )}
            >
              <input
                type="radio"
                name="payment-method"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
                className="h-4 w-4 accent-foreground"
              />
              <Banknote className="h-5 w-5 text-muted-foreground" aria-hidden />
              <span>
                <span className="block text-sm font-medium">Cash on Delivery</span>
                <span className="block text-xs text-muted-foreground">Pay with cash when your order arrives</span>
              </span>
            </label>
            {stripeOn && (
              <label
                className={cn(
                  "flex cursor-pointer items-center gap-4 border p-4 transition-colors",
                  paymentMethod === "card" ? "border-foreground" : "border-input hover:border-foreground/40",
                )}
              >
                <input
                  type="radio"
                  name="payment-method"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                  className="h-4 w-4 accent-foreground"
                />
                <CreditCard className="h-5 w-5 text-muted-foreground" aria-hidden />
                <span>
                  <span className="block text-sm font-medium">Card</span>
                  <span className="block text-xs text-muted-foreground">Secure card payment via Stripe</span>
                </span>
              </label>
            )}
            {/* The Stripe Payment Element island (superset, configured-only):
                PCI SAQ-A — card data never touches this app. */}
            {stripeOn && paymentMethod === "card" && (
              <div className="border border-input p-4">
                <StripeCheckout
                  publishableKey={publishableKey ?? null}
                  snapshot={stripeSnapshot}
                  placementError={formError}
                  submitting={submitting}
                  onConfirmed={(stripePaymentIntentId) => void handlePlaceOrder(stripePaymentIntentId)}
                  onBack={() => setPaymentMethod("cod")}
                >
                  Confirm payment
                </StripeCheckout>
              </div>
            )}
          </section>

          {/* ORDER NOTES */}
          <section aria-labelledby="notes-title" className="flex flex-col gap-3">
            <h2 id="notes-title" className={sectionTitle}>
              Order Notes
            </h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value.slice(0, 500))}
              rows={3}
              aria-label="Order notes (optional)"
              placeholder="Anything we should know about your order?"
              className="w-full border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            />
          </section>

          {/* PLACE ORDER (COD path — the Stripe path places through the island) */}
          {!(stripeOn && paymentMethod === "card") && (
            <div className="flex flex-col gap-3">
              <Button type="submit" disabled={submitting} className="h-13 w-full py-4 text-sm uppercase tracking-[0.08em]" data-testid="place-order">
                {submitting ? "Placing your order…" : placeLabel}
              </Button>
              {user && (
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={saveAddress}
                    onChange={(e) => setSaveAddress(e.target.checked)}
                    className="h-4 w-4 accent-foreground"
                  />
                  Save this address to my address book
                </label>
              )}
              {formError && (
                <p role="alert" className="text-sm text-destructive">
                  {formError}
                </p>
              )}
            </div>
          )}
        </form>

        {/* ---- RIGHT: ORDER SUMMARY ---- */}
        <aside aria-labelledby="summary-title" className="flex h-fit flex-col gap-6 border border-border p-6 lg:sticky lg:top-28">
          <h2 id="summary-title" className={sectionTitle}>
            Order Summary
          </h2>

          <ul className="flex flex-col gap-4" aria-label="Order items">
            {lines.map((line) => (
              <li key={line.id} className="flex items-center gap-4">
                <span className="relative h-20 w-16 shrink-0 overflow-hidden bg-secondary">
                  <Image src={line.image} alt="" fill sizes="64px" className="object-cover" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{line.name}</span>
                  {line.variant ? <span className="block text-xs text-muted-foreground">{line.variant}</span> : null}
                  <span className="block text-xs text-muted-foreground">Qty: {line.quantity}</span>
                </span>
                <span className="text-sm font-medium">{formatMoney(line.lineTotal)}</span>
              </li>
            ))}
          </ul>

          {/* Coupon box (superset) */}
          {coupon ? (
            <div className="flex items-center justify-between gap-3 border border-dashed border-primary/40 bg-secondary px-3 py-2.5 text-sm">
              <span className="flex items-center gap-2 font-medium text-primary">
                <Tag className="h-4 w-4" aria-hidden />
                {coupon.code}
              </span>
              <span className="text-muted-foreground">−{formatMoney(coupon.discount)}</span>
              <button
                type="button"
                onClick={removeCoupon}
                className="text-xs uppercase tracking-wide text-muted-foreground underline underline-offset-4 hover:text-destructive"
              >
                Remove
              </button>
            </div>
          ) : (
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void applyCoupon(couponInput);
              }}
            >
              <Input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="Discount code"
                aria-label="Discount code"
                className={inputCls}
              />
              <Button type="submit" variant="outline" disabled={couponPending || couponInput.trim().length === 0}>
                {couponPending ? "…" : "Apply"}
              </Button>
            </form>
          )}
          {couponError && <p className="text-xs text-destructive">{couponError}</p>}
          {coupon?.description && <p className="text-xs text-muted-foreground">{coupon.description}</p>}

          <dl className="flex flex-col gap-2.5 border-t border-border pt-4 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-medium">{formatMoney(taxable)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-1.5 text-muted-foreground">
                <Truck className="h-4 w-4" aria-hidden />
                Shipping
              </dt>
              <dd className="font-medium" data-testid="summary-shipping">
                {shippingCost === null ? "Enter city to calculate" : shippingCost === 0 ? "FREE" : formatMoney(shippingCost)}
              </dd>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3 text-base font-semibold">
              <dt>Total</dt>
              <dd>{formatMoney(total)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
