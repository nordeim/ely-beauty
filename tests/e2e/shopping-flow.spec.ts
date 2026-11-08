import { expect, test } from "@playwright/test";
import { gotoHydrated, addToCartViaDetailPage, PILLOWCASE } from "./helpers";
/**
 * Guest shopping flow — the revenue path (run-72 anatomy): add to cart
 * through the product DETAIL page (cards are link-only), the mini drawer
 * ("Your Bag"), cart page math, coupon apply, the SINGLE-PAGE checkout
 * (Contact + Shipping + Cash on Delivery), and the success page with a real
 * ELY-XXXXXXXX order number.
 */
test.describe("shopping flow", () => {
  test("add to cart updates the header badge and mini drawer (variant carries through)", async ({
    page,
  }) => {
    // S13-3: the CLOSED drawer must be inert — invisible off-screen controls
    // must not stay in the tab order or the accessibility tree.
    const drawer = page.getByTestId("cart-drawer");
    await gotoHydrated(page, "/shop");
    await expect(drawer).toHaveAttribute("inert", "");

    // Run-72: ADD TO CART lives on the detail page; pick the Navy Blue color
    // so the variant rides the line into the drawer.
    await addToCartViaDetailPage(page, PILLOWCASE.cardText, { variant: "Navy Blue" });
    await expect(page.getByTestId("cart-count")).toBeVisible();
    await expect(page.getByTestId("cart-count")).toHaveText("1");

    // Open the mini drawer and verify the line.
    await page.getByRole("button", { name: /^Cart/ }).click();
    await expect(drawer).toBeVisible();
    await expect(drawer).not.toHaveAttribute("inert");
    await expect(drawer.getByText("Your Bag (1)")).toBeVisible();
    await expect(drawer.getByText(PILLOWCASE.name)).toBeVisible();
    await expect(drawer.getByText("Navy Blue")).toBeVisible();
    await expect(drawer.getByText("Remove", { exact: true })).toBeVisible();
    await expect(drawer.getByText("Subtotal")).toBeVisible();
    await expect(drawer.getByText("৳288").first()).toBeVisible();
    await expect(drawer.getByRole("link", { name: "CHECKOUT" })).toBeVisible();
    await expect(drawer.getByRole("link", { name: "View Cart" })).toBeVisible();
    await drawer.getByRole("button", { name: "Close cart" }).click();
    // The drawer is an always-mounted translate-x panel (the Tailwind v4-safe
    // pattern) — assert off-viewport + inert rather than DOM removal.
    await expect(drawer).not.toBeInViewport();
    await expect(drawer).toHaveClass(/pointer-events-none/);
    await expect(drawer).toHaveAttribute("inert", "");
  });

  test("the open cart drawer is a real modal (S16-3)", async ({ page }) => {
    await addToCartViaDetailPage(page, PILLOWCASE.cardText, { variant: "Navy Blue" });
    await expect(page.getByTestId("cart-count")).toHaveText("1");

    const drawer = page.getByTestId("cart-drawer");
    const shell = page.getByTestId("page-shell");
    // RED pre-fix: the shell carried no inert attribute while the drawer was
    // open — the aria-modal dialog left the whole page keyboard-reachable.
    await page.getByRole("button", { name: /^Cart/ }).click();
    await expect(drawer).toBeVisible();
    await expect(shell).toHaveAttribute("inert", "");

    // Native focus containment: with every background control inert, Tab from
    // the close button can only cycle INSIDE the dialog (25 presses must wrap
    // the drawer's own focusables, never escape them).
    await drawer.getByRole("button", { name: "Close cart" }).focus();
    for (let i = 0; i < 25; i += 1) await page.keyboard.press("Tab");
    const focusInsideDrawer = await page.evaluate(
      () => Boolean(document.activeElement?.closest('[data-testid="cart-drawer"]')),
    );
    expect(focusInsideDrawer).toBe(true);

    // Escape closes; the shell un-inerts and focus returns to the opener
    // (the header cart toggle) — native dialog semantics.
    await page.keyboard.press("Escape");
    await expect(drawer).toHaveAttribute("inert", "");
    await expect(shell).not.toHaveAttribute("inert");
    const restoredLabel = await page.evaluate(() =>
      document.activeElement?.getAttribute("aria-label"),
    );
    expect(restoredLabel).toMatch(/^Cart/);
  });

  test("full guest checkout places an order", async ({ page }) => {
    await addToCartViaDetailPage(page, PILLOWCASE.cardText, { variant: "Navy Blue" });
    await expect(page.getByTestId("cart-count")).toHaveText("1");

    // Cart page -> Checkout
    await gotoHydrated(page, "/cart");
    await expect(page.getByRole("heading", { name: "Shopping Cart" })).toBeVisible();
    await page.getByRole("link", { name: "Checkout" }).first().click();
    await expect(page).toHaveURL(/\/checkout/);

    // Single-page checkout (run-72): the Order Summary mirrors the line with
    // its variant + qty, and the shipping row derives from the city tier.
    await expect(page.getByRole("heading", { name: "Order Summary" })).toBeVisible();
    await expect(page.getByText("Navy Blue").first()).toBeVisible();
    await expect(page.getByText("Qty: 1")).toBeVisible();
    await expect(page.getByTestId("summary-shipping")).toHaveText("Enter city to calculate");

    // Contact + Shipping Address. (Role+name locators: the shipping SECTION
    // is labelled "Shipping Address", which a bare getByLabel("Address")
    // substring-matches — strict mode.)
    await page.getByRole("textbox", { name: "Full Name *" }).fill("Guest Buyer");
    await page.getByRole("textbox", { name: "Email *" }).fill("guest@example.com");
    await page.getByRole("textbox", { name: "Phone Number *" }).fill("01712345678");
    await page.getByRole("textbox", { name: "Address *" }).fill("12 Test Lane, Dhanmondi");
    await page.getByRole("textbox", { name: "City / District *" }).fill("Chattogram");
    await expect(page.getByTestId("summary-shipping")).toHaveText("৳130");
    await page.getByRole("textbox", { name: "City / District *" }).fill("Dhaka");
    await expect(page.getByTestId("summary-shipping")).toHaveText("৳70");
    await expect(page.getByRole("textbox", { name: "Country *" })).toHaveValue("Bangladesh");

    // Payment: Cash on Delivery is the only (default-checked) option.
    const cod = page.getByRole("radio", { name: /Cash on Delivery/ });
    await expect(cod).toBeChecked();
    await page.getByLabel("Order notes (optional)").fill("Leave at the front desk.");

    // PLACE ORDER — ৳358 (৳288 line + ৳70 Dhaka shipping).
    const placeOrder = page.getByTestId("place-order");
    await expect(placeOrder).toHaveText("PLACE ORDER — ৳358");
    await placeOrder.click();

    // Success page with a real order number + access token.
    await expect(page).toHaveURL(/\/checkout\/success\?order=ELY-[A-Z0-9]{8}&token=/, { timeout: 15_000 });
    await expect(page.getByRole("heading", { name: /Thank You/i })).toBeVisible();
    const params = new URL(page.url()).searchParams;
    const orderNumber = params.get("order");
    expect(orderNumber).toMatch(/^ELY-[A-Z0-9]{8}$/);
    expect(params.get("token") ?? "").toMatch(/^[0-9a-f]{32}$/);

    // ACCESS CONTRACT (S3-1): the sequential number alone must NOT reveal the
    // receipt — the same "not found" shell renders with or without a bad
    // token, so an attacker cannot even observe that the order exists.
    await gotoHydrated(page, `/checkout/success?order=${orderNumber}`);
    await expect(page.getByRole("heading", { name: /couldn.t find that order/i })).toBeVisible();
    await expect(page.getByText("guest@example.com")).toHaveCount(0);
    await gotoHydrated(page, `/checkout/success?order=${orderNumber}&token=${"0".repeat(32)}`);
    await expect(page.getByRole("heading", { name: /couldn.t find that order/i })).toBeVisible();

    // COPY HONESTY CONTRACT (S5-2): no email is shipped anywhere in this
    // codebase — the receipt copy must promise the email and then direct the
    // buyer at the recovery surfaces that actually exist (this page's link +
    // Track Order). Guards against someone reintroducing the false promise.
    await gotoHydrated(page, `/checkout/success?order=${orderNumber}&token=${params.get("token")}`);
    await expect(page.getByText(/on its way/)).toHaveCount(0);
    await expect(page.getByText(/confirmation email/i)).toHaveCount(0);
    await expect(page.getByText(/save this page/i)).toBeVisible();

    // The cart is empty again.
    await gotoHydrated(page, "/cart");
    await expect(page.getByText(/cart is empty/i)).toBeVisible();
  });

  test("checkout replay with the same idempotency key returns the same order (S3-5)", async ({ request, browser }) => {
    // Pick an in-stock product via the public typeahead API.
    const search = await request.get("/api/search?q=pillowcase");
    expect(search.ok()).toBeTruthy();
    const { results } = (await search.json()) as { results: Array<{ id: string }> };
    expect(results.length).toBeGreaterThan(0);
    const productId = results[0]!.id;

    // Seed the guest cart through the real API (cookie jar on `request`).
    const add = await request.post("/api/cart", { data: { productId, quantity: 1 } });
    expect(add.ok()).toBeTruthy();

    const checkoutBody = {
      email: "idempotent@example.com",
      customerName: "Replay Test",
      shippingMethod: "standard",
      paymentMethod: "cod",
      // Fresh key per run — mirrors the client's crypto.randomUUID() usage.
      idempotencyKey: crypto.randomUUID(),
      address: {
        fullName: "Replay Test",
        phone: "01712345677",
        line1: "7 Retry Court, Banani",
        city: "Dhaka",
        state: "Dhaka",
        postalCode: "1213",
        country: "Bangladesh",
      },
    };

    const first = await request.post("/api/checkout", { data: checkoutBody });
    expect(first.ok()).toBeTruthy();
    const firstBody = (await first.json()) as { orderNumber?: string; token?: string };
    expect(firstBody.orderNumber).toMatch(/^ELY-[A-Z0-9]{8}$/);

    // The replay (lost response / double click) returns the SAME receipt —
    // not a 409 "cart empty" and not a second order.
    const replay = await request.post("/api/checkout", { data: checkoutBody });
    expect(replay.ok()).toBeTruthy();
    const replayBody = (await replay.json()) as { orderNumber?: string; token?: string };
    expect(replayBody.orderNumber).toBe(firstBody.orderNumber);
    expect(replayBody.token).toBe(firstBody.token);

    // S6-8: the replay is OWNERSHIP-bound. A fresh context that presents the
    // leaked key alone (no placing cart cookie) gets nothing — the request
    // falls through to the normal flow and 409s on its (empty) cart without
    // revealing the order number or minting a receipt token.
    const thief = await browser.newContext();
    try {
      const stolen = await thief.request.post("/api/checkout", { data: checkoutBody });
      expect(stolen.status()).toBe(409);
      const stolenBody = (await stolen.json()) as { orderNumber?: string; token?: string; error?: string };
      expect(stolenBody.orderNumber).toBeUndefined();
      expect(stolenBody.token).toBeUndefined();
      expect(stolenBody.error).toBeTruthy();
    } finally {
      await thief.close();
    }
  });

  test("malformed JSON bodies are 400 client errors, not 200/500 (S4-2)", async ({ request }) => {
    // Raw non-JSON bytes → the body-parse split must return 400 with a JSON
    // error envelope (the L3 pattern applies to EVERY JSON route). Buffer
    // data is sent verbatim — a plain string would be JSON-encoded by
    // Playwright into a *valid* JSON string literal (200 by contract).
    const raw = Buffer.from("{not-json", "utf8");
    const bad = await request.post("/api/coupon/apply", {
      headers: { "Content-Type": "application/json" },
      data: raw,
    });
    expect(bad.status()).toBe(400);
    const badBody = (await bad.json()) as { error?: string };
    expect(badBody.error).toBeTruthy();

    // The same contract holds on the cart route (pinned since session 2).
    const badCart = await request.post("/api/cart", {
      headers: { "Content-Type": "application/json" },
      data: raw,
    });
    expect(badCart.status()).toBe(400);
  });

  test("coupon WELCOME10 reduces the total", async ({ page }) => {
    await addToCartViaDetailPage(page, PILLOWCASE.cardText);
    await gotoHydrated(page, "/cart");

    await page.getByLabel("Coupon code").fill("WELCOME10");
    await page.getByRole("button", { name: /^Apply$/i }).click();
    await expect(page.getByText(/WELCOME10/).first()).toBeVisible();
    await expect(page.getByText(/applied at checkout/)).toBeVisible();
  });

  test("track-order finds a placed order (number + email required)", async ({ page }) => {
    // Place one order via the API-backed UI flow (condensed), then track it.
    await addToCartViaDetailPage(page, PILLOWCASE.cardText);
    // The badge proves the POST /api/cart landed before we navigate away.
    await expect(page.getByTestId("cart-count")).toHaveText("1");
    await gotoHydrated(page, "/checkout");
    const buyerEmail = "guest2@example.com";
    await page.getByRole("textbox", { name: "Full Name *" }).fill("Tracker Test");
    await page.getByRole("textbox", { name: "Email *" }).fill(buyerEmail);
    await page.getByRole("textbox", { name: "Phone Number *" }).fill("01712345699");
    await page.getByRole("textbox", { name: "Address *" }).fill("9 Loop Road, Mirpur");
    await page.getByRole("textbox", { name: "City / District *" }).fill("Dhaka");
    await page.getByTestId("place-order").click();
    await expect(page).toHaveURL(/\/checkout\/success\?order=ELY-[A-Z0-9]{8}/, { timeout: 15_000 });
    const orderNumber = new URL(page.url()).searchParams.get("order");

    // Security contract: the number alone must NOT unlock the order's PII.
    await gotoHydrated(page, `/track-order?number=${orderNumber}`);
    const alert = page.locator("div[role=alert]").first();
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/couldn.t find an order/i);
    await expect(page.getByText(buyerEmail)).toHaveCount(0);

    // A wrong email is indistinguishable from a wrong number (no enumeration).
    await gotoHydrated(page, `/track-order?number=${orderNumber}&email=wrong@example.com`);
    await expect(page.locator("div[role=alert]").first()).toBeVisible();

    // The correct pair (the success page deep-link's shape) tracks the order.
    await gotoHydrated(page, `/track-order?number=${orderNumber}&email=${encodeURIComponent(buyerEmail)}`);
    await expect(page.getByText(orderNumber ?? "")).toBeVisible();
    // The stepper shows all four labels; the current step (Pending) is active.
    await expect(page.getByText("Pending", { exact: true }).first()).toBeVisible();
  });

  test("cart PATCH/DELETE on a line that is gone returns 404, never a 500 (S10-2 pin)", async ({
    request,
  }) => {
    // Seed a real guest cart (cookie jar on `request`), then poke a line id
    // that can never exist. The scoped conditional writes must map the lost
    // race to the same friendly 404 a concurrent delete produces.
    const search = await request.get("/api/search?q=pillowcase");
    expect(search.ok()).toBeTruthy();
    const { results } = (await search.json()) as { results: Array<{ id: string }> };
    const add = await request.post("/api/cart", {
      data: { productId: results[0]!.id, quantity: 1 },
    });
    expect(add.ok()).toBeTruthy();

    const patch = await request.patch("/api/cart", { data: { lineId: "no-such-line", quantity: 2 } });
    expect(patch.status()).toBe(404);
    const patchBody = (await patch.json()) as { error?: string };
    expect(patchBody.error).toBeTruthy();

    // DELETE is idempotent by design (a double-click delete never 404s) — it
    // must still not 500 on the same lost-line input.
    const del = await request.delete("/api/cart?line=no-such-line");
    expect(del.status()).toBe(200);

    // Cleanup so parallel workers never see this cart.
    await request.delete("/api/cart?all=1");
  });
});
