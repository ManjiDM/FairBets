import { test, expect } from "@playwright/test";

test.describe("FairBets app overview", () => {
  test("loads and shows the default ledger", async ({ page }) => {
    await page.goto("/", { waitUntil: "commit" });
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("h1")).toHaveText("FairBets demo");
    await expect(page.getByText("Current ledger", { exact: true })).toBeVisible();
  });

  test("allows a user to add a new bet", async ({ page }) => {
    await page.goto("/", { waitUntil: "commit" });
    await page.waitForLoadState("domcontentloaded");
    await page.getByRole("button", { name: "Sequences" }).first().click();
    await page.getByRole("button", { name: "Add bet" }).click();

    await page.getByLabel("Label").fill("Test selection");
    await page.getByLabel("Date and time").fill("2026-09-13T12:00");
    await page.getByLabel("Decimal odds").fill("2.00");
    await page.getByRole("button", { name: "Add bet" }).last().click();

    await expect(page.getByText("Test selection", { exact: true })).toBeVisible();
    await expect(page.getByText("Bet recorded and sequences recalculated.")).toBeVisible();
  });
});
