import { test, expect } from "@playwright/test";
import { promises as fs } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import * as XLSX from "xlsx";

async function createWorkbook(rows, prefix) {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows), "Bets");
  const filePath = join(tmpdir(), `${prefix}-${Date.now()}.xlsx`);
  await fs.writeFile(filePath, XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }));
  return filePath;
}

async function openSettings(page) {
  await page.goto("/", { waitUntil: "commit" });
  await page.waitForLoadState("domcontentloaded");
  await expect(page.getByText("Settings", { exact: true }).first()).toBeVisible();
  await page.getByText("Settings", { exact: true }).first().click();
  await expect(
    page.getByRole("heading", { name: "Strategy and safety settings" }),
  ).toBeVisible();
}

test.describe("Workbook import", () => {
  test("imports a FairBets workbook", async ({ page }) => {
    const filePath = await createWorkbook(
      [
        ["FairBets import fixture"],
        [],
        ["Bet", "Activity", "DATETIME", "BET", "ODD", "Result"],
        ["Imported selection", "x", "2026-09-13", 0.25, 2, "won"],
      ],
      "fairbets-import",
    );

    try {
      await openSettings(page);
      await page.locator('input[type="file"]').setInputFiles(filePath);

      await expect(page.locator("h1")).toHaveText(/^fairbets-import-\d+$/);
      await expect(page.getByText("Imported selection", { exact: true })).toBeVisible();
      await expect(page.getByRole("status")).toContainText("1 bets imported");
    } finally {
      await fs.rm(filePath, { force: true });
    }
  });

  test("rejects an incompatible workbook without replacing the ledger", async ({ page }) => {
    const filePath = await createWorkbook(
      [["Not a FairBets workbook"], ["No matching columns"]],
      "fairbets-invalid",
    );

    try {
      await openSettings(page);
      await page.locator('input[type="file"]').setInputFiles(filePath);

      await expect(page.getByRole("status")).toContainText(
        "This workbook does not match the expected FairBets layout.",
      );
      await expect(
        page.getByRole("heading", { name: "Strategy and safety settings" }),
      ).toBeVisible();
      await expect(page.getByText("Imported selection", { exact: true })).toHaveCount(0);
    } finally {
      await fs.rm(filePath, { force: true });
    }
  });
});
