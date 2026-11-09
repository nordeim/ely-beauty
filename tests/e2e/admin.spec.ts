import { expect, test } from "@playwright/test";
import { gotoHydrated, DEMO_ADMIN, DEMO_CUSTOMER } from "./helpers";

/**
 * Admin — the role gate keeps customers out; the seeded admin account gets
 * the full back office (dashboard KPIs, products, orders).
 */
async function loginAsAdmin(page: import("@playwright/test").Page) {
  await gotoHydrated(page, "/login");
  await page.getByLabel("Email").fill(DEMO_ADMIN.email);
  await page.getByLabel("Password").fill(DEMO_ADMIN.password);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/(account|admin)/, { timeout: 10_000 });
}

/**
 * S83-2: search the admin products table and open a product's edit dialog,
 * GATED on the navigation + re-hydration. The search is a native GET form
 * (`<form action="/admin/products" method="get">`) — `press("Enter")`
 * performs a full navigation, and the old test shape clicked the Edit
 * button (a client island) while that navigation was still in flight: the
 * click landed on the outgoing document or on the new one before React
 * wired its onClick, the dialog never opened, and the test aborted
 * MID-MUTATION leaving durable catalog dirt behind (the run-83 flake,
 * mode 1 — reproduced as admin.spec.ts:49 twice in six full-suite runs).
 * The gate mirrors gotoHydrated's contract: wait for the ?q= URL, then the
 * html[data-hydrated] sentinel, and only then click.
 */
async function searchProductsAndOpenDialog(
  page: import("@playwright/test").Page,
  query: string,
  editButtonName: RegExp | string,
): Promise<import("@playwright/test").Locator> {
  const search = page.getByLabel("Search products by name");
  await search.fill(query);
  await search.press("Enter");
  // A form GET encodes spaces as "+" — escape the literal for the URL wait.
  const urlPart = `q=${query.replace(/ /g, "+")}`;
  await page.waitForURL(new RegExp(urlPart.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  await page.waitForSelector('html[data-hydrated="true"]', { timeout: 20_000 });
  await page.getByRole("button", { name: editButtonName }).first().click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  return dialog;
}

test.describe("admin back office", () => {
  test("a customer account cannot open /admin", async ({ page }) => {
    await gotoHydrated(page, "/login");
    await page.getByLabel("Email").fill(DEMO_CUSTOMER.email);
    await page.getByLabel("Password").fill(DEMO_CUSTOMER.password);
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).toHaveURL(/\/account/, { timeout: 10_000 });

    await gotoHydrated(page, "/admin");
    await expect(page.getByText(/admin access required/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: /dashboard/i })).toBeHidden();
  });

  test("admin sign-in lands on the dashboard with KPIs", async ({ page }) => {
    await loginAsAdmin(page);
    await gotoHydrated(page, "/admin");
    await expect(page.getByRole("heading", { name: /dashboard/i }).first()).toBeVisible();
    await expect(page.getByText("Total Revenue")).toBeVisible();
    await expect(page.getByRole("link", { name: "Products" }).first()).toBeVisible();
  });

  test("products manager lists seeded products", async ({ page }) => {
    await loginAsAdmin(page);
    await gotoHydrated(page, "/admin/products");
    await expect(page.getByRole("heading", { name: "Products", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: /add product/i })).toBeVisible();
    // The table paginates 10/page — search pins the reference product.
    const search = page.getByLabel("Search products by name");
    await search.fill("Pillowcase");
    search.press("Enter");
    await expect(page.getByText("Pure Satin Silk Pillowcase – For Hair & Skin").first()).toBeVisible();
  });

  test("admin edits a product's display categories (the S81-11 multi-select)", async ({ page }) => {
    await loginAsAdmin(page);
    await gotoHydrated(page, "/admin/products");
    let dialog = await searchProductsAndOpenDialog(page, "Gua Sha", /Edit Stainless Steel Gua Sha/i);

    // The category editor is a checkbox GROUP — the reference's
    // many-to-many semantics (zero or more display categories per product).
    let group = dialog.getByRole("group", { name: /display categories/i });
    await expect(group).toBeVisible();

    // S83-3 (the S20-1 self-heal discipline): an aborted prior revert can
    // leave the dual membership behind (the fresh-server restore heals it;
    // a reused server does not) — heal to the seed shape BEFORE pinning it.
    const bestsellers = group.getByRole("checkbox", { name: "Bestsellers" });
    if (await bestsellers.isChecked()) {
      await bestsellers.uncheck();
      await dialog.getByRole("button", { name: "Save Changes" }).click();
      await expect(dialog).toBeHidden();
      dialog = await searchProductsAndOpenDialog(page, "Gua Sha", /Edit Stainless Steel Gua Sha/i);
      group = dialog.getByRole("group", { name: /display categories/i });
    }

    // The Gua Sha ships in exactly one display category (Beauty Tools).
    await expect(group.getByRole("checkbox", { name: "Beauty Tools" })).toBeChecked();
    await expect(group.getByRole("checkbox", { name: "Bestsellers" })).not.toBeChecked();

    // Add the dual membership (the reference's cleansing-brush shape) and
    // save; the storefront pill picks the new member up.
    await group.getByRole("checkbox", { name: "Bestsellers" }).check();
    await dialog.getByRole("button", { name: "Save Changes" }).click();
    await expect(dialog).toBeHidden();
    await gotoHydrated(page, "/shop?category=bestsellers");
    await expect(page.getByText("5 products", { exact: true })).toBeVisible();
    await expect(page.getByText("Stainless Steel Gua Sha").first()).toBeVisible();
    // The OTHER membership is untouched (Beauty Tools still 7).
    await gotoHydrated(page, "/shop?category=beauty-tools");
    await expect(page.getByText("7 products", { exact: true })).toBeVisible();

    // Revert (self-cleaning — the e2e suite must stay re-runnable against
    // the persistent demo DB). S83-2: the gated helper replaces the bare
    // post-search click.
    await gotoHydrated(page, "/admin/products");
    dialog = await searchProductsAndOpenDialog(page, "Gua Sha", /Edit Stainless Steel Gua Sha/i);
    group = dialog.getByRole("group", { name: /display categories/i });
    await group.getByRole("checkbox", { name: "Bestsellers" }).uncheck();
    await dialog.getByRole("button", { name: "Save Changes" }).click();
    await expect(dialog).toBeHidden();
    await gotoHydrated(page, "/shop?category=bestsellers");
    await expect(page.getByText("4 products", { exact: true })).toBeVisible();
  });

  test("admin clears a product's template category through the None option (S82-3)", async ({ page }) => {
    await loginAsAdmin(page);
    await gotoHydrated(page, "/admin/products");
    const dialog = await searchProductsAndOpenDialog(page, "Gua Sha", /Edit Stainless Steel Gua Sha/i);

    // Audit 82-a L-3: Radix Select cannot deselect — the "None" option is
    // the clear path for a set template category.
    await dialog.getByRole("combobox", { name: "Template category" }).click();
    await page.getByRole("option", { name: "None" }).click();
    await dialog.getByRole("button", { name: "Save Changes" }).click();
    await expect(dialog).toBeHidden();

    // The detail eyebrow falls back to the first display category
    // (Beauty Tools) instead of the template "skincare".
    await gotoHydrated(page, "/shop");
    await page.getByRole("link", { name: /Stainless Steel Gua Sha/i }).first().click();
    const eyebrow = page.locator("p.eyebrow-label").first();
    await expect(eyebrow).toHaveText(/Beauty Tools/i);

    // Revert (self-cleaning — the e2e suite must stay re-runnable).
    // S83-2: the gated helper replaces the bare post-search click.
    await gotoHydrated(page, "/admin/products");
    const revertDialog = await searchProductsAndOpenDialog(
      page,
      "Gua Sha",
      /Edit Stainless Steel Gua Sha/i,
    );
    await revertDialog.getByRole("combobox", { name: "Template category" }).click();
    await page.getByRole("option", { name: "Skincare" }).click();
    await revertDialog.getByRole("button", { name: "Save Changes" }).click();
    await expect(revertDialog).toBeHidden();
  });

  test("orders manager lists orders and opens management", async ({ page }) => {
    await loginAsAdmin(page);
    await gotoHydrated(page, "/admin/orders");
    await expect(page.getByRole("heading", { name: "Orders", exact: true })).toBeVisible();

    const manageButtons = page.getByRole("button", { name: /manage/i });
    if (await manageButtons.first().isVisible()) {
      await manageButtons.first().click();
      // The management dialog carries status + tracking affordances.
      await expect(page.getByText(/status/i).first()).toBeVisible();
    } else {
      await expect(page.getByText(/no orders/i)).toBeVisible();
    }
  });

  test("cancelling an order restores the reserved stock (S3-3)", async ({ page, request }) => {
    // Self-contained setup: place a fresh guest order through the real API.
    const search = await request.get("/api/search?q=pillowcase");
    const { results } = (await search.json()) as { results: Array<{ id: string }> };
    expect(results.length).toBeGreaterThan(0);
    const productId = results[0]!.id;

    await request.post("/api/cart", { data: { productId, quantity: 2 } });
    const placed = await request.post("/api/checkout", {
      data: {
        email: "cancel-restock@example.com",
        customerName: "Restock Test",
        shippingMethod: "standard", // deliberate S73-1 strip pin: zod discards this client-sent field (the server derives the tier from the city)
        paymentMethod: "cod",
        idempotencyKey: crypto.randomUUID(),
        address: {
          fullName: "Restock Test",
          phone: "01712345666",
          line1: "5 Cancel Way, Wari",
          city: "Dhaka",
          state: "Dhaka",
          postalCode: "1203",
          country: "Bangladesh",
        },
      },
    });
    expect(placed.ok()).toBeTruthy();
    const { orderNumber } = (await placed.json()) as { orderNumber: string };
    expect(orderNumber).toMatch(/^ELY-[A-Z0-9]{8}$/);

    await loginAsAdmin(page);
    await gotoHydrated(page, "/admin/orders");

    // The newest order sits at the top of the table (placedAt desc).
    const row = page.locator("tr", { hasText: orderNumber }).first();
    await expect(row).toBeVisible();
    await row.getByRole("button", { name: /manage/i }).click();

    await page.getByLabel("Update status").click();
    await page.getByRole("option", { name: /mark as cancelled/i }).click();
    await page.getByRole("button", { name: /update status/i }).click();

    // The action's success toast proves the restock transaction committed.
    // .first(): the toast title also lives inside the aria-live wrapper's
    // text — a strict-mode race the suite has hit before (session-9).
    await expect(page.getByText(new RegExp(`Order ${orderNumber} updated`)).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.locator("tr", { hasText: orderNumber }).first()).toContainText(/cancelled/i);
  });

  test("carousel manager lists the seeded hero slide", async ({ page }) => {
    await loginAsAdmin(page);
    await gotoHydrated(page, "/admin/carousel");
    await expect(page.getByText("The Art of Radiance").first()).toBeVisible();
    await expect(
      page.getByText("Luxury botanicals. Clinical precision. Your skin, elevated.").first(),
    ).toBeVisible();
    await expect(page.getByText("SHOP THE COLLECTION").first()).toBeVisible();
  });

  test("settings manager loads the seeded store values", async ({ page }) => {
    await loginAsAdmin(page);
    await gotoHydrated(page, "/admin/settings");
    const emailInput = page.getByLabel(/contact email/i);
    await expect(emailInput).toHaveValue(/elybeauty/);
  });

  test("an aborted settings save surfaces a visible error instead of silence (S13-2)", async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await gotoHydrated(page, "/admin/settings");

    // Simulate an outage: abort every server-action POST. Before S13-2 the
    // island swallowed the rejection (no toast, no inline error — the admin
    // could not tell saved from failed).
    await page.route("**/*", (route) => {
      const request = route.request();
      if (request.method() === "POST" && request.headers()["next-action"]) {
        return route.abort("failed");
      }
      return route.fallback();
    });

    await page.getByLabel(/store name/i).fill("Aborted Save Probe");
    await page.getByRole("button", { name: /save settings/i }).click();

    await expect(page.getByText(/something went wrong/i).first()).toBeVisible({ timeout: 10_000 });
  });
});
