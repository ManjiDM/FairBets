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
  await expect(this.page.locator(".sequence-page")).toBeVisible();
});

When("I navigate to the sequences view", async function () {
  await expect(this.page.locator(".sequence-page")).toBeVisible();
});

Then("the sequences view should be shown", async function () {
  await expect(this.page.locator(".sequence-page")).toBeVisible();
});

Then("the summary sidebar should show the {string} metric", async function (label) {
  const metric = this.page.locator(".summary-sidebar .metric-card").filter({
    has: this.page.getByText(label, { exact: true }),
  });
  await expect(metric).toBeVisible();
});

Then("the summary sidebar should show goal tracking", async function () {
  await expect(
    this.page.locator(".summary-sidebar .goal-panel"),
  ).toBeVisible();
});

Given("the viewport is a small phone", async function () {
  await this.page.setViewportSize({ width: 390, height: 844 });
});

When("I open the summary drawer", async function () {
  await this.page.getByRole("button", { name: "Summary", exact: true }).click();
});

Then("the summary drawer should be open", async function () {
  await expect(this.page.locator(".summary-sidebar.drawer-open")).toBeVisible();
});

When("I close the summary drawer", async function () {
  await this.page.locator(".summary-sidebar .drawer-close").click();
});

Then("the summary drawer should be closed", async function () {
  await expect(this.page.locator(".summary-sidebar.drawer-open")).toHaveCount(0);
});

When("I open the settings overlay", async function () {
  await this.page.getByRole("button", { name: "Settings", exact: true }).click();
});

Then("the settings overlay should be shown", async function () {
  await expect(
    this.page.getByRole("dialog", { name: "Strategy and safety settings" }),
  ).toBeVisible();
});

When("I close the settings overlay", async function () {
  await this.page.getByRole("button", { name: "Back to sequences" }).click();
});

Then("the settings overlay should not be shown", async function () {
  await expect(
    this.page.getByRole("dialog", { name: "Strategy and safety settings" }),
  ).toHaveCount(0);
});

Then("no guardrail warning should be shown", async function () {
  await expect(this.page.locator(".risk-banner")).toHaveCount(0);
});

When(
  "I add a bet labeled {string} with odds {string} and a manual stake of {string}",
  async function (label, odds, stake) {
    await this.page.getByRole("button", { name: "Add bet" }).click();
    await this.page.getByLabel("Label").fill(label);
    await this.page.getByLabel("Decimal odds").fill(odds);
    await this.page.getByLabel("Manual stake (optional)").fill(stake);
    await this.page.getByRole("button", { name: "Add bet" }).last().click();
    await expect(this.page.getByRole("dialog")).toHaveCount(0);
  },
);

When("I set the maximum stake to {string}", async function (value) {
  await this.page.getByRole("button", { name: "Settings", exact: true }).click();
  const field = this.page.locator("label").filter({
    has: this.page.getByText("Maximum stake", { exact: true }),
  });
  await field.locator("input").fill(value);
  await this.page.getByRole("button", { name: "Save settings" }).click();
  await this.page.getByRole("button", { name: "Back to sequences" }).click();
});

Then("a guardrail warning should be shown", async function () {
  await expect(this.page.locator(".risk-banner")).toBeVisible();
});

When("I dismiss the guardrail warning", async function () {
  await this.page.locator(".risk-banner").getByRole("button", { name: "Dismiss" }).click();
});

Then("no Overview destination should be offered", async function () {
  await expect(this.page.getByRole("button", { name: "Overview" })).toHaveCount(0);
  await expect(this.page.getByRole("button", { name: "Home" })).toHaveCount(0);
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
  await revealBet(this.page, label);
  const betCard = this.page.locator(".single-bet-card").filter({
    has: this.page.getByText(label, { exact: true }),
  }).first();
  await betCard.getByRole("button", { name: outcome, exact: true }).click();
});

Then("I should see the bet settlement message", async function () {
  await expect(this.page.getByRole("status")).toContainText("Bet marked as won.");
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

function betCard(page, label) {
  return page
    .locator(".single-bet-card")
    .filter({ has: page.getByText(label, { exact: true }) })
    .first();
}

async function revealBet(page, label) {
  const collapsed = page.locator("details.compact-sequence-card").filter({
    has: page.getByText(label, { exact: true }),
  });
  if ((await collapsed.count()) > 0) {
    await collapsed.first().evaluate((element) => {
      element.open = true;
    });
  }
}

async function openBetEditor(page, label) {
  await revealBet(page, label);
  await betCard(page, label).getByRole("button", { name: "Edit", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.locator(".recorded-strategy summary").click();
}

Given("I note the available balance", async function () {
  const metric = this.page.locator(".metric-card").filter({
    has: this.page.getByText("Available balance", { exact: true }),
  });
  this.notedBalance = await metric.locator("strong").innerText();
});

Then("the available balance should be unchanged", async function () {
  const metric = this.page.locator(".metric-card").filter({
    has: this.page.getByText("Available balance", { exact: true }),
  });
  await expect(metric.locator("strong")).toHaveText(this.notedBalance);
});

When("I set the base stake to {string}", async function (value) {
  await this.page.getByRole("button", { name: "Settings", exact: true }).click();
  const field = this.page.locator("label").filter({
    has: this.page.getByText("Base stake", { exact: true }),
  });
  await field.locator("input").fill(value);
  await this.page.getByRole("button", { name: "Save settings" }).click();
  await this.page.getByRole("button", { name: "Back to sequences" }).click();
});

Then("the bet {string} should have a stake of {string}", async function (label, stake) {
  await revealBet(this.page, label);
  const metrics = betCard(this.page, label).locator(".single-bet-metrics span").first();
  await expect(metrics.locator("strong")).toHaveText(stake);
});

When(
  "I add a bet labeled {string} with odds {string} placed at {string}",
  async function (label, odds, placedAt) {
    await this.page.getByRole("button", { name: "Add bet", exact: true }).click();
    await this.page.getByLabel("Label").fill(label);
    await this.page.getByLabel("Date and time").fill(placedAt);
    await this.page.getByLabel("Decimal odds").fill(odds);
    await this.page.getByRole("button", { name: "Add bet", exact: true }).last().click();
    await expect(this.page.getByRole("dialog")).toHaveCount(0);
  },
);

When("I rename the bet {string} to {string}", async function (label, newLabel) {
  await revealBet(this.page, label);
  await betCard(this.page, label).getByRole("button", { name: "Edit", exact: true }).click();
  await expect(this.page.getByRole("dialog")).toBeVisible();
  await this.page.getByLabel("Label").fill(newLabel);
  await this.page.getByRole("button", { name: "Save changes" }).click();
  await expect(this.page.getByRole("dialog")).toHaveCount(0);
});

Then(
  "the bet {string} should show a recorded base stake of {string}",
  async function (label, value) {
    await openBetEditor(this.page, label);
    const field = this.page.locator(".recorded-strategy label").filter({
      has: this.page.getByText("Recorded base stake", { exact: true }),
    });
    await expect(field.locator("input")).toHaveValue(value);
    await this.page.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(this.page.getByRole("dialog")).toHaveCount(0);
  },
);

When(
  "I correct the recorded base stake of the bet {string} to {string}",
  async function (label, value) {
    await openBetEditor(this.page, label);
    const field = this.page.locator(".recorded-strategy label").filter({
      has: this.page.getByText("Recorded base stake", { exact: true }),
    });
    await field.locator("input").fill(value);
    await this.page.getByRole("button", { name: "Save changes" }).click();
  },
);

Then("the bet form should show a validation message", async function () {
  await expect(this.page.getByRole("dialog").locator(".form-error")).toBeVisible();
});

When("I cancel the bet form", async function () {
  await this.page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(this.page.getByRole("dialog")).toHaveCount(0);
});
