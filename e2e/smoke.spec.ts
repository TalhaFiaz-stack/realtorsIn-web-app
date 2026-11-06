import { test, expect } from "@playwright/test";

/**
 * Unauthenticated smoke always runs.
 * Authenticated journeys require E2E_TEST_EMAIL + E2E_TEST_PASSWORD (or phone OTP flow vars).
 * Never log credential values.
 */
const hasPasswordCreds = Boolean(
  process.env.E2E_TEST_EMAIL?.trim() && process.env.E2E_TEST_PASSWORD?.trim()
);

test.describe("public smoke", () => {
  test("welcome and health respond", async ({ page, request }) => {
    const health = await request.get("/api/health");
    expect(health.ok()).toBeTruthy();
    await page.goto("/welcome");
    await expect(page).toHaveURL(/welcome/);
  });

  test("protected feed redirects to login", async ({ page }) => {
    await page.goto("/feed");
    await expect(page).toHaveURL(/login/);
  });
});

test.describe("authenticated journeys", () => {
  test.skip(
    !hasPasswordCreds,
    "BLOCKED: set E2E_TEST_EMAIL and E2E_TEST_PASSWORD for staging auth"
  );

  test("login → feed → session survives refresh → logout", async ({
    page,
  }) => {
    const email = process.env.E2E_TEST_EMAIL!;
    const password = process.env.E2E_TEST_PASSWORD!;

    await page.goto("/login");
    // Prefer password channel if UI exposes email/password fields.
    await page.getByLabel(/email|phone|username/i).first().fill(email);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole("button", { name: /sign in|log in|continue/i }).click();
    await expect(page).toHaveURL(/feed|onboarding|welcome/i, { timeout: 30_000 });

    if (page.url().includes("/feed")) {
      await page.reload();
      await expect(page).toHaveURL(/feed/);
      await page.getByRole("button", { name: /log out|sign out/i }).click();
      await page.goto("/feed");
      await expect(page).toHaveURL(/login/);
    }
  });
});
