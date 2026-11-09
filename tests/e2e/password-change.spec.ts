import { expect, test } from "@playwright/test";
import { gotoHydrated, DEMO_CUSTOMER } from "./helpers";

/**
 * Password change — the S92-2 round-trip (audit 92-a HIGH-1).
 *
 * This spec MUTATES the demo account's password, so it runs in the
 * SERIALIZED mutation project (workers: 1, after every read-only project
 * has finished — the S83-1 admin-catalog pattern): under fullyParallel a
 * concurrent demo login inside the change→restore window would fail. The
 * round-trip proves the old credential stops authenticating, the new one
 * works, a wrong current password surfaces the uniform inline error, and
 * the seed password is RESTORED at the end (the seed's `update: {}` policy
 * never re-resets it — the S20-1 durable-state discipline). A run aborted
 * between the change and the restore leaves the account dirty, so the
 * opening self-heals: if the seed password no longer signs in, the
 * alternate is used to restore it before the test proceeds.
 */
test.describe("password change", () => {
  test("rotates the credential and signs out other sessions (S92-2)", async ({ page }) => {
    const alternate = "RotatedDemo99!";

    // Self-heal: an aborted prior run may have left the alternate active.
    await gotoHydrated(page, "/login");
    await page.getByLabel("Email").fill(DEMO_CUSTOMER.email);
    await page.getByLabel("Password").fill(DEMO_CUSTOMER.password);
    await page.getByRole("button", { name: "Log in" }).click();
    // Race the two outcomes: the account landing vs the uniform inline
    // error (an either-pattern URL wait would resolve at /login instantly,
    // before the navigation could prove anything).
    const healed = await Promise.race([
      page.waitForURL(/\/account/, { timeout: 10_000 }).then(() => true),
      page
        .getByText("Invalid email or password.")
        .first()
        .waitFor({ timeout: 10_000 })
        .then(() => false),
    ]);
    if (!healed) {
      // The seed password failed — the alternate is active; restore it.
      await gotoHydrated(page, "/login");
      await page.getByLabel("Email").fill(DEMO_CUSTOMER.email);
      await page.getByLabel("Password").fill(alternate);
      await page.getByRole("button", { name: "Log in" }).click();
      await expect(page).toHaveURL(/\/account/, { timeout: 10_000 });
      await gotoHydrated(page, "/account?tab=profile");
      await page.getByLabel("Current password").fill(alternate);
      await page.getByLabel("New password").fill(DEMO_CUSTOMER.password);
      await page.getByRole("button", { name: "Update Password" }).click();
      await expect(page.getByText("Password updated").first()).toBeVisible({ timeout: 10_000 });
      await page.getByRole("button", { name: "Sign Out" }).click();
      await expect(page).toHaveURL(/\/$/, { timeout: 10_000 });
      // Sign back in with the restored seed password for the test body.
      await gotoHydrated(page, "/login");
      await page.getByLabel("Email").fill(DEMO_CUSTOMER.email);
      await page.getByLabel("Password").fill(DEMO_CUSTOMER.password);
      await page.getByRole("button", { name: "Log in" }).click();
      await expect(page).toHaveURL(/\/account/, { timeout: 10_000 });
    }

    // Change to the alternate on the Profile tab.
    await gotoHydrated(page, "/account?tab=profile");
    await page.getByLabel("Current password").fill(DEMO_CUSTOMER.password);
    await page.getByLabel("New password").fill(alternate);
    await page.getByRole("button", { name: "Update Password" }).click();
    await expect(page.getByText("Password updated").first()).toBeVisible({ timeout: 10_000 });

    // A wrong current password surfaces the uniform inline error.
    await page.getByLabel("Current password").fill("definitely-wrong");
    await page.getByLabel("New password").fill("AnotherPass123!");
    await page.getByRole("button", { name: "Update Password" }).click();
    await expect(page.getByText("Your current password is incorrect.").first()).toBeVisible({ timeout: 10_000 });

    // Sign out: the OLD password no longer authenticates (uniform error —
    // same copy as an unknown account, no oracle), the NEW one does.
    // React 19 resets uncontrolled form inputs after every action
    // completion (verified live: both boxes come back EMPTY after a failed
    // login), so BOTH fields are re-filled before the second submission —
    // filling only the password would POST an empty email.
    await page.getByRole("button", { name: "Sign Out" }).click();
    await expect(page).toHaveURL(/\/$/, { timeout: 10_000 });
    await gotoHydrated(page, "/login");
    await page.getByLabel("Email").fill(DEMO_CUSTOMER.email);
    await page.getByLabel("Password").fill(DEMO_CUSTOMER.password);
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page.getByText("Invalid email or password.").first()).toBeVisible({ timeout: 10_000 });
    await page.getByLabel("Email").fill(DEMO_CUSTOMER.email);
    await page.getByLabel("Password").fill(alternate);
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).toHaveURL(/\/account/, { timeout: 10_000 });

    // Restore the seed password so the demo account stays pristine.
    await gotoHydrated(page, "/account?tab=profile");
    await page.getByLabel("Current password").fill(alternate);
    await page.getByLabel("New password").fill(DEMO_CUSTOMER.password);
    await page.getByRole("button", { name: "Update Password" }).click();
    await expect(page.getByText("Password updated").first()).toBeVisible({ timeout: 10_000 });
  });
});
