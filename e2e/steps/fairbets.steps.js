import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { promises as fs } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import * as XLSX from "xlsx";

Given("the FairBets app is available", async function () {
  await this.page.goto(this.baseUrl, { waitUntil: "domcontentloaded" });
  await expect(this.page.locator("#root")).toContainText("FairBets demo");
});

When("I open the FairBets app", async function () {
  await expect(this.page.locator("#root")).toContainText("FairBets demo");
});

Then("I should see the {string} ledger", async function (ledgerName) {
  await expect(this.page.locator("h1")).toHaveText(ledgerName);
});

Then("I should see the {string} section", async function (sectionName) {
  await expect(this.page.getByText(sectionName, { exact: true })).toBeVisible();
});

Then("I see the available balance as {string}", async function (balance) {
  const metric = this.page.locator(".metric-card").filter({
    has: this.page.getByText("Available balance", { exact: true }),
  });
  await expect(metric.locator("strong")).toHaveText(balance);
});


When("I navigate to the Sequences view", async function () {
  await expect(this.page.getByText("Sequences", { exact: true }).first()).toBeVisible();
  await this.page.getByText("Sequences", { exact: true }).first().click();
});

When("I navigate to the sequences view", async function () {
  await expect(this.page.getByText("Sequences", { exact: true }).first()).toBeVisible();
  await this.page.getByText("Sequences", { exact: true }).first().click();
});

Then("I should see the existing demo sequences", async function () {
  await expect(this.page.locator(".sequence-list article").first()).toBeVisible();
});

Then("I should see {int} sequences", async function (sequenceCount) {
  await expect(
    this.page.getByRole("heading", { name: `${sequenceCount} sequences` }),
  ).toBeVisible();
});

When("I press the Add Bet button", async function () {
  await this.page.getByRole("button", { name: "Add bet", exact: true }).click();
});

Then("the Add Bet button should be enabled", async function () {
  await expect(
    this.page.getByRole("button", { name: "Add bet", exact: true }),
  ).toBeEnabled();
});

Then("the Add Bet button should be disabled", async function () {
  await expect(
    this.page.getByRole("button", { name: "Add bet", exact: true }),
  ).toBeDisabled();
});

Then("I see the new bet dialog", async function () {
  await expect(this.page.getByRole("dialog")).toBeVisible();
  await expect(this.page.getByRole("heading", { name: "Add a bet" })).toBeVisible();
});

When("I input the label {string}", async function (label) {
  await this.page.getByLabel("Label").fill(label);
});

When("I input the date and time {string}", async function (dateTime) {
  await this.page.getByLabel("Date and time").fill(dateTime);
});

When("I input {string} in the odds field", async function (odds) {
  await this.page.getByLabel("Decimal odds").fill(odds);
});

When("I input {string} in the Odds field", async function (odds) {
  await this.page.getByLabel("Decimal odds").fill(odds);
});

When("I input {string} in the Manual Stake field", async function (stake) {
  await this.page.getByLabel("Manual stake (optional)").fill(stake);
});

When("I press the Add button", async function () {
  await this.page.getByRole("button", { name: "Add bet", exact: true }).last().click();
});

When("I add a bet labeled {string} with odds {string}", async function (label, odds) {
  await this.page.getByRole("button", { name: "Add bet" }).click();
  await this.page.getByLabel("Label").fill(label);
  await this.page.getByLabel("Decimal odds").fill(odds);
  await this.page.getByRole("button", { name: "Add bet" }).last().click();
});

Then("the ledger should show the bet {string}", async function (label) {
  await expect(this.page.getByText(label, { exact: true })).toBeVisible();
});

Then("the bet {string} should be {string}", async function (label, outcome) {
  const normalizedOutcome = outcome.toLowerCase();
  const sequence = this.page.locator(".sequence-list > *").filter({
    has: this.page.getByText(label, { exact: true }),
  });

  if (normalizedOutcome === "open") {
    await expect(sequence.getByRole("button", { name: "Won", exact: true })).toBeVisible();
    return;
  }

  if (normalizedOutcome === "won") {
    await expect(sequence.locator(".status-closed").first()).toBeVisible();
    return;
  }

  await expect(sequence.locator(`.status-${normalizedOutcome}`).first()).toBeVisible();
});

Then(
  "the sequence containing the bet {string} should be {string}",
  async function (label, status) {
    const sequenceCard = this.page.locator(".sequence-list > *").filter({
      has: this.page.getByText(label, { exact: true }),
    });
    await expect(sequenceCard.locator(`.status-${status.toLowerCase()}`).first()).toBeVisible();
  },
);

When("I mark the bet {string} as {string}", async function (label, outcome) {
  const betCard = this.page.locator(".single-bet-card").filter({
    has: this.page.getByText(label, { exact: true }),
  }).first();
  await betCard.getByRole("button", { name: outcome, exact: true }).click();
});

Then("I should see the bet settlement message", async function () {
  await expect(this.page.getByRole("status")).toContainText("Bet marked as won.");
});

When("I navigate the Overview view", async function () {
  await this.page.getByText("Overview", { exact: true }).first().click();
});

Given("the user is on the Settings screen", async function () {
  await this.page.getByText("Settings", { exact: true }).first().click();
  await expect(this.page.getByRole("heading", { name: "Strategy and safety settings" })).toBeVisible();
});

Given("the user selects a valid FairBets workbook", async function () {
  const workbook = XLSX.utils.book_new();
  const rows = [
    ["FairBets import fixture"],
    [],
    ["Bet", "Activity", "DATETIME", "BET", "ODD", "Result"],
    ["Imported selection", "x", "2026-09-13", 0.25, 2, "won"],
  ];
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows), "Bets");
  const filePath = join(tmpdir(), `fairbets-import-${Date.now()}.xlsx`);
  await fs.writeFile(filePath, XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }));
  this.fixturePath = filePath;
});

Given("the user selects an incompatible workbook", async function () {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.aoa_to_sheet([["Not a FairBets workbook"], ["No matching columns"]]),
    "Sheet1",
  );
  const filePath = join(tmpdir(), `fairbets-invalid-${Date.now()}.xlsx`);
  await fs.writeFile(filePath, XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }));
  this.fixturePath = filePath;
});

When("the workbook is imported", async function () {
  const chooserPromise = this.page.waitForEvent("filechooser");
  await this.page.getByRole("button", { name: "Import .xlsx" }).click();
  const chooser = await chooserPromise;
  await chooser.setFiles(this.fixturePath);
});

Then("the imported ledger should be displayed", async function () {
  await expect(this.page.locator("h1")).toHaveText(/^fairbets-import-\d+$/);
  await expect(this.page.getByText("Imported selection", { exact: true })).toBeVisible();
});

Then("the import success message should mention {string}", async function (text) {
  await expect(this.page.getByRole("status")).toContainText(text);
});

Then("the import error should be displayed", async function () {
  await expect(this.page.getByRole("status")).toContainText(
    "This workbook does not match the expected FairBets layout.",
  );
});

Then("the current ledger should still be displayed", async function () {
  await expect(
    this.page.getByRole("heading", { name: "Strategy and safety settings" }),
  ).toBeVisible();
  await expect(this.page.getByText("Imported selection", { exact: true })).toHaveCount(0);
});
