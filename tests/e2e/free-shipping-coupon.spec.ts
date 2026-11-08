import { expect, test } from "@playwright/test";
import { gotoHydrated, addToCartViaDetailPage, PILLOWCASE } from "./helpers";

/**
 * Session-20 S20-6 — the `free_shipping` coupon type end-to-end (run-72
 * BDT re-pins). The seeded FREESHIP coupon has a ৳3,000 minimum — the same
 * figure as the free-shipping threshold — so the pin cart starts BELOW both
 * (৳288: the nag renders AND the coupon's own minimum gate rejects), then
 * crosses them (৳3,210 / ৳3,168) where FREESHIP applies and drives the
 * checkout + receipt shipping rows to FREE. Pins the full money path: the
 * cart's applied label, the checkout mirror (data-testid summary-shipping),
 * and the SERVER-derived receipt (the strongest pin — computeOrderMoney's
 * couponFreeShipping override, re-derived in-tx).
 *
 * Stock discipline (the S14-4 drain class): the ৳3,000-min carts use
 * quantity 3 of the ৳1,070 body brush (test 1 — the only order that touches
 * its stock) and an 11×৳288 cart line that is never ordered (test 2 — cart
 * mutations don't reserve stock), so one fresh-server run can never deplete
 * the seed stock the other specs pin against.
 */
const BODY_BRUSH = "Anti-cellulite Dry Body Brush";

test.describe("free_shipping coupon (S20-6)", () => {
  test("FREESHIP zeroes shipping at/above its ৳3,000 minimum, through the receipt", async ({ page }) => {
    // Guest cart at ৳3,210 (qty 3 × ৳1,070) — above the coupon's ৳3,000 min.
    // The brush is #18 in the newest-first catalog, beyond page 1 of the
    // 12-per-page global grid — reach its card through the brush-combs
    // category listing (6 products, always a single page).
    await addToCartViaDetailPage(page, BODY_BRUSH, {
      quantity: 3,
      path: "/shop?category=brush-combs",
    });
    await expect(page.getByTestId("cart-count")).toHaveText("3");

    // Apply FREESHIP at the cart — the applied block carries the seeded
    // description plus the free_shipping label.
    await gotoHydrated(page, "/cart");
    await page.getByLabel("Coupon code").fill("FREESHIP");
    await page.getByRole("button", { name: "Apply", exact: true }).click();
    await expect(
      page.getByText("FREESHIP: Free shipping on orders over ৳3,000 — applied at checkout"),
    ).toBeVisible();
    // The label renders in the applied block AND the success toast — the
    // .first() takes the block (the toast is transient).
    await expect(page.getByText("Free shipping", { exact: true }).first()).toBeVisible();

    // Checkout (the cart hands the coupon over via sessionStorage).
    await page.getByRole("link", { name: "Checkout" }).first().click();
    await expect(page).toHaveURL(/\/checkout/);

    await page.getByRole("textbox", { name: "Full Name *" }).fill("Free Ship");
    await page.getByRole("textbox", { name: "Email *" }).fill("freeship@example.com");
    await page.getByRole("textbox", { name: "Phone Number *" }).fill("01712345640");
    await page.getByRole("textbox", { name: "Address *" }).fill("9 Shipping Way, Uttara");
    await page.getByRole("textbox", { name: "City / District *" }).fill("Dhaka");

    // The summary's shipping row (pinned on the actual row, not a bare
    // getByText("FREE") — a case-insensitive substring that would also hit
    // the coupon label's "Free shipping") shows the coupon's zero.
    await expect(page.getByTestId("summary-shipping")).toHaveText("FREE");

    // Place the order — the button total carries no shipping.
    const placeOrder = page.getByTestId("place-order");
    await expect(placeOrder).toHaveText("PLACE ORDER — ৳3,210");
    await placeOrder.click();

    // The SERVER-derived receipt pins the real math (not just the mirror).
    await expect(page).toHaveURL(/\/checkout\/success\?order=ELY-[A-Z0-9]{8}&token=/, { timeout: 15_000 });
    const params = new URL(page.url()).searchParams;
    await expect(page.getByRole("heading", { name: /Thank You/i })).toBeVisible();
    const shippingRow = page.locator("dl div", { has: page.getByText("Shipping", { exact: true }) });
    await expect(shippingRow).toContainText("FREE");
    expect(params.get("order")).toMatch(/^ELY-[A-Z0-9]{8}$/);
  });

  // Session-23 S23-2 (run-72 re-pins) — the cart's free-shipping hint is
  // coupon-aware. A ৳288 cart sits below the ৳3,000 threshold (the progress
  // nag renders) AND below FREESHIP's own minimum (the apply rejects with the
  // server's minimum-subtotal error). Crossing the threshold via the cart
  // page's qty stepper swaps the nag for the unlocked block; an applied
  // FREESHIP then swaps it for the coupon-attributed block (shipping is
  // ALREADY free — the threshold text would contradict the applied block
  // right below it); removing the coupon restores the threshold-based hint.
  test("the cart hint goes coupon-aware: nag → minimum rejection → unlocked → applied → restore", async ({
    page,
  }) => {
    await addToCartViaDetailPage(page, PILLOWCASE.cardText);
    await gotoHydrated(page, "/cart");

    // Below the threshold: the "৳X more" nag + the progressbar.
    const nag = page.getByText("Add ৳2,712 more for free shipping");
    await expect(nag).toBeVisible();
    await expect(page.getByRole("progressbar", { name: "Progress toward free shipping" })).toBeVisible();

    // FREESHIP's OWN gate rejects below ৳3,000 — the coupon is not a way
    // around the minimum.
    await page.getByLabel("Coupon code").fill("FREESHIP");
    await page.getByRole("button", { name: "Apply", exact: true }).click();
    await expect(page.locator("#cart-coupon-error")).toContainText(/minimum subtotal/i);
    await expect(nag).toBeVisible();

    // Cross the threshold through the cart page's qty stepper (11 × ৳288).
    const increase = page.getByRole("button", { name: /Increase quantity of / });
    for (let i = 0; i < 10; i += 1) {
      await increase.click();
    }
    await expect(page.getByText("You've unlocked free shipping!")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("progressbar", { name: "Progress toward free shipping" })).toHaveCount(0);

    // Apply FREESHIP — the threshold block gives way to the coupon-attributed
    // block.
    await page.getByLabel("Coupon code").fill("FREESHIP");
    await page.getByRole("button", { name: "Apply", exact: true }).click();
    await expect(page.getByText("Free shipping active — FREESHIP applied at checkout")).toBeVisible();
    await expect(page.getByText("You've unlocked free shipping!")).toHaveCount(0);
    await expect(page.getByRole("progressbar", { name: "Progress toward free shipping" })).toHaveCount(0);

    // Remove — the threshold-based hint returns.
    await page.getByRole("button", { name: "Remove coupon FREESHIP" }).click();
    await expect(page.getByText("You've unlocked free shipping!")).toBeVisible();
    await expect(page.getByText("Free shipping active — FREESHIP applied at checkout")).toHaveCount(0);
  });
});
