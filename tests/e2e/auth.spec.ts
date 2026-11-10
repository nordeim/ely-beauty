import { expect, test } from "@playwright/test";
import { gotoHydrated, DEMO_CUSTOMER, addToCartViaDetailPage, PILLOWCASE, openDetailFromShop } from "./helpers";
import { DEMO_ADMIN_PASSWORD, DEMO_CUSTOMER_PASSWORD } from "../../src/lib/demo-credentials";

/**
 * Auth — demo-account login (success + wrong password), register
 * validation, and the account dashboard. Credentials come from the seed
 * and live in the single source src/lib/demo-credentials.ts (imported
 * above — the S94-1 rotation-proof convention; never re-inline them).
 */

/** Heart a product from its detail page; returns the product's name. */
async function heartFromDetail(
  page: import("@playwright/test").Page,
  cardText: string,
): Promise<string> {
  await openDetailFromShop(page, cardText);
  const heart = page.getByRole("button", { name: /^Add .* to wishlist$/ });
  const name = ((await heart.getAttribute("aria-label")) ?? "").replace(
    /^Add (.*) to wishlist$/,
    "$1",
  );
  expect(name).not.toBe("");
  await heart.click();
  await expect(page.getByText("Added to wishlist").first()).toBeVisible({ timeout: 10_000 });
  return name;
}

test.describe("auth", () => {
  test("login page renders the reference card", async ({ page }) => {
    await gotoHydrated(page, "/login");
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
    await expect(page.getByText("Log in to your account")).toBeVisible();
    // The reference's Google affordance renders honestly disabled (no OAuth
    // client is configured on this clone).
    await expect(page.getByRole("button", { name: /Continue with Google/ })).toBeDisabled();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Log in" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Create an account/i })).toBeVisible();
  });

  test("demo customer can sign in and sees the account dashboard", async ({ page }) => {
    await gotoHydrated(page, "/login");
    await page.getByLabel("Email").fill(DEMO_CUSTOMER.email);
    await page.getByLabel("Password").fill(DEMO_CUSTOMER.password);
    await page.getByRole("button", { name: "Log in" }).click();

    await expect(page).toHaveURL(/\/account/, { timeout: 10_000 });
    await expect(page.getByRole("heading", { name: "My Account" })).toBeVisible();
  });

  test("wrong password shows an inline error, never a redirect", async ({ page }) => {
    await gotoHydrated(page, "/login");
    await page.getByLabel("Email").fill(DEMO_CUSTOMER.email);
    await page.getByLabel("Password").fill("WrongPassword1!");
    await page.getByRole("button", { name: "Log in" }).click();

    const alert = page.locator("div[role=alert]").first();
    await expect(alert).toBeVisible();
    // Uniform message — the UI must not reveal whether the account exists.
    await expect(alert).toContainText(/invalid email or password/i);
    await expect(page).toHaveURL(/\/login/);
  });

  test("unknown email gets the same uniform error (no enumeration)", async ({ page }) => {
    await gotoHydrated(page, "/login");
    await page.getByLabel("Email").fill("nobody@nowhere.test");
    await page.getByLabel("Password").fill("Whatever123!");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page.locator("div[role=alert]").first()).toContainText(/invalid email or password/i);
  });

  test("register rejects a short password via the server action", async ({ page }) => {
    await gotoHydrated(page, "/register");
    await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
    await page.getByLabel("Full name").fill("New User");
    await page.getByLabel("Email").fill("newuser@example.com");
    await page.getByLabel("Password").fill("short");
    await page.getByRole("button", { name: /Create account/i }).click();

    // The server action's Zod validation renders the inline alert; the URL stays.
    const alert = page.locator("div[role=alert]").first();
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/at least 8 characters/i);
    await expect(page).toHaveURL(/\/register/);
  });

  test("account requires a session (redirects to login)", async ({ page }) => {
    await gotoHydrated(page, "/account");
    await expect(page).toHaveURL(/\/login/);
  });

  test("guest cart merges into the account cart on login (S3-4)", async ({ page }) => {
    // As a guest: add a product to the cart through its detail page.
    await addToCartViaDetailPage(page, PILLOWCASE.cardText);

    // Sign in — the server action must claim the guest cart right here.
    await gotoHydrated(page, "/login");
    await page.getByLabel("Email").fill(DEMO_CUSTOMER.email);
    await page.getByLabel("Password").fill(DEMO_CUSTOMER.password);
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).toHaveURL(/\/account/, { timeout: 10_000 });

    // The account cart already contains the guest's item — no re-add needed.
    await gotoHydrated(page, "/cart");
    await expect(page.getByRole("heading", { name: "Shopping Cart" })).toBeVisible();
    await expect(page.getByRole("link", { name: PILLOWCASE.name }).first()).toBeVisible();
  });

  test("first login CLAIMS the guest cart — a second device sees the same items (S7-1)", async ({
    browser,
  }) => {
    // A DEDICATED fresh account keeps this deterministic under parallel
    // workers: no pre-existing cart can shadow the first-login claim path.
    // Device A shops as a guest (guest cart token cookie minted), then
    // registers. The user has NO pre-existing cart, so this exercises the
    // safeCreateCart P2002 path: the guest row wins the token collision and
    // MUST be claimed (userId set), not merely returned.
    const email = `s7-claim-${Date.now()}-${Math.floor(Math.random() * 1000)}@example.com`;
    const deviceA = await browser.newContext();
    const pageA = await deviceA.newPage();
    await addToCartViaDetailPage(pageA, PILLOWCASE.cardText);

    await gotoHydrated(pageA, "/register");
    await pageA.getByLabel("Full name").fill("S7 Claim Check");
    await pageA.getByLabel("Email").fill(email);
    await pageA.getByLabel("Password").fill("ClaimCheck1!");
    await pageA.getByRole("button", { name: /Create account/i }).click();
    await expect(pageA).toHaveURL(/\/account/, { timeout: 10_000 });

    // Device B: a FRESH context (no cookies) signing in as the same user must
    // land on the claimed cart. If the claim regressed, getOrCreateCart would
    // find no cart for the userId and mint a fresh empty one instead.
    const deviceB = await browser.newContext();
    const pageB = await deviceB.newPage();
    await gotoHydrated(pageB, "/login");
    await pageB.getByLabel("Email").fill(email);
    await pageB.getByLabel("Password").fill("ClaimCheck1!");
    await pageB.getByRole("button", { name: "Log in" }).click();
    await expect(pageB).toHaveURL(/\/account/, { timeout: 10_000 });

    await gotoHydrated(pageB, "/cart");
    await expect(pageB.getByRole("heading", { name: "Shopping Cart" })).toBeVisible();
    await expect(pageB.getByRole("link", { name: PILLOWCASE.name }).first()).toBeVisible();

    await deviceA.close();
    await deviceB.close();
  });

  test("guest wishlist merges into the account at registration (S10-4 wiring)", async ({ page }) => {
    // Guest hearts two products from their DETAIL pages (run-72: the heart
    // lives there, not on the grid cards), then registers a fresh account.
    // The merge tx plans through planWishlistMerge (dedupe + cap truncation)
    // and upserts only plan.toAdd — this pins the WIRING end-to-end (the
    // pure plan is unit-pinned in session10-hardening.test.ts).
    const firstProduct = await heartFromDetail(page, "Pure Satin Silk Pillowcase");
    const secondProduct = await heartFromDetail(page, "Natural Bamboo Hair Brush - Square");

    const email = `s12-wishlist-${Date.now()}-${Math.floor(Math.random() * 1000)}@example.com`;
    await gotoHydrated(page, "/register");
    await page.getByLabel("Full name").fill("S12 Wishlist Merge");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("MergeCheck1!");
    await page.getByRole("button", { name: /Create account/i }).click();
    await expect(page).toHaveURL(/\/account/, { timeout: 10_000 });

    // Both guest hearts survive into the account wishlist.
    await gotoHydrated(page, "/wishlist");
    await expect(page.getByText(/2 saved items?/)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("link", { name: firstProduct }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: secondProduct }).first()).toBeVisible();
  });

  test("the production login page ships no demo credentials in its scripts (S13-1)", async ({
    page,
  }) => {
    // S13-1's regression guard: the quick-fill box is hidden in production
    // builds, and since session 13 the credential STRINGS must not even
    // reach the client — neither in the page HTML (the RSC payload included)
    // nor in any referenced script chunk.
    const response = await page.goto("/login");
    const html = (await response?.text()) ?? "";
    await page.waitForSelector('html[data-hydrated="true"]', { timeout: 20_000 });

    const scriptUrls = await page.evaluate(() =>
      Array.from(document.querySelectorAll("script[src]"))
        .map((s) => (s as HTMLScriptElement).src)
        .filter((src) => src.startsWith(window.location.origin)),
    );
    expect(scriptUrls.length).toBeGreaterThan(0);

    const bodies = await Promise.all(
      scriptUrls.map((src) => page.request.get(src).then((r) => r.text())),
    );
    // S94-1 (audit 94-a L-6): the guard asserts the LIVE pair from the
    // single source (src/lib/demo-credentials.ts — the S92-2a convention,
    // the helpers.ts import pattern). Hardcoded literals here would rot
    // vacuously green on the next credential rotation while a leak of the
    // NEW password into a client chunk went undetected.
    for (const secret of [DEMO_ADMIN_PASSWORD, DEMO_CUSTOMER_PASSWORD]) {
      expect(html).not.toContain(secret);
      for (const body of bodies) {
        expect(body).not.toContain(secret);
      }
    }
  });

  test("auth pages render their card inside a main landmark (S47-1)", async ({ page }) => {
    // Session-47 S47-1: the (auth) layout wraps its split-screen card in
    // plain divs — the clone's login/register carried ZERO <main> landmarks
    // while the reference's login page HAS one (verified live), and
    // Lighthouse flags landmark-one-main. The fix mirrors the storefront
    // layout's pattern: exactly ONE main landmark wrapping the page's
    // content, with the auth card inside it.
    await gotoHydrated(page, "/login");
    await expect(page.locator("main")).toHaveCount(1);
    const signInInMain = await page
      .getByRole("button", { name: "Log in" })
      .evaluate((el) => el.closest("main") !== null);
    expect(signInInMain).toBe(true);

    await gotoHydrated(page, "/register");
    await expect(page.locator("main")).toHaveCount(1);
    const registerInMain = await page
      .getByRole("button", { name: /Create account/i })
      .evaluate((el) => el.closest("main") !== null);
    expect(registerInMain).toBe(true);
  });

  test("profile edits persist through updateProfileAction and Sign Out ends the session (S14-3)", async ({
    page,
  }) => {
    // C4's wiring pin: the account profile form → updateProfileAction →
    // persisted name, then logoutAction → signed-out header. The seed name is
    // restored at the end so the demo account stays pristine (the seed's
    // `update: {}` policy never re-resets the name).
    //
    // Session-21 S21-2 (the run-22 suite failure): the "Profile updated"
    // toast assertions race the strict-mode locator the same way the
    // session-9/11/20 toast titles did — the title also lives inside the
    // toaster's aria-live wrapper, so getByText resolves to 2 elements the
    // moment the announcement is up. `.first()` per the suite convention.
    // And because a run aborted between the edit and the restore leaves the
    // demo name dirty (the seed never re-resets it), the setup self-heals a
    // non-seed name back through the same form flow (the S20-1 discipline).
    //
    // Run-72: the account's DEFAULT tab is Order History — the profile form
    // lives at ?tab=profile.
    const seedName = "Ayesha Rahman";
    await gotoHydrated(page, "/login");
    await page.getByLabel("Email").fill(DEMO_CUSTOMER.email);
    await page.getByLabel("Password").fill(DEMO_CUSTOMER.password);
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).toHaveURL(/\/account/, { timeout: 10_000 });

    // Orders is the default tab (the "Order History" eyebrow label renders).
    await expect(page.getByText("Order History").first()).toBeVisible();

    // Edit the display name on the Profile tab and save.
    await gotoHydrated(page, "/account?tab=profile");
    const nameInput = page.getByLabel("Full name");
    const current = await nameInput.inputValue();
    if (current !== seedName) {
      await nameInput.fill(seedName);
      await page.getByRole("button", { name: "Save Changes" }).click();
      await expect(page.getByText("Profile updated").first()).toBeVisible({ timeout: 10_000 });
    }
    await expect(nameInput).toHaveValue(seedName);
    await nameInput.fill("Ayesha Rahman Edited");
    await page.getByRole("button", { name: "Save Changes" }).click();

    // The success toast confirms the action ran (Radix toast + auto-dismiss).
    await expect(page.getByText("Profile updated").first()).toBeVisible({ timeout: 10_000 });

    // The persisted name survives a full reload (server truth, not local state).
    await gotoHydrated(page, "/account?tab=profile");
    await expect(page.getByLabel("Full name")).toHaveValue("Ayesha Rahman Edited");

    // Restore the seed name so the demo account stays pristine.
    await page.getByLabel("Full name").fill(seedName);
    await page.getByRole("button", { name: "Save Changes" }).click();
    await expect(page.getByText("Profile updated").first()).toBeVisible({ timeout: 10_000 });

    // Sign Out → the session ends and the header offers the anonymous
    // Account icon again (run-72: the signed-out header link is the
    // "Account" affordance routing to /login).
    await page.getByRole("button", { name: "Sign Out" }).click();
    await expect(page).toHaveURL(/\/$/, { timeout: 10_000 });
    await gotoHydrated(page, "/");
    const accountLink = page.getByRole("link", { name: "Account", exact: true });
    await expect(accountLink).toBeVisible();
    await expect(accountLink).toHaveAttribute("href", "/login");
  });
});
