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

When("I reload the app", async function () {
  await this.page.reload({ waitUntil: "domcontentloaded" });
});

When("I freeze the browser clock at {string}", async function (dateTime) {
  try {
    await this.page.clock.install({ time: new Date(dateTime) });
  } catch {
    await this.page.clock.setFixedTime(new Date(dateTime));
  }
});

When("I remove recording timestamps from saved bets and reload", async function () {
  await this.page.evaluate(() => {
    const stored = window.localStorage.getItem("fairbets-ledger-state-v2");
    if (!stored) {
      throw new Error("Saved FairBets ledger was not found.");
    }

    const ledger = JSON.parse(stored);
    for (const bet of ledger.bets) {
      delete bet.createdAt;
    }
    window.localStorage.setItem("fairbets-ledger-state-v2", JSON.stringify(ledger));
  });
  await this.page.reload({ waitUntil: "domcontentloaded" });
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

When("I toggle the summary drawer", async function () {
  await this.page.locator(".drawer-toggle").click();
});

Then("the mobile summary control should show an accessible sidebar icon", async function () {
  const button = this.page.getByRole("button", { name: "Open summary", exact: true });
  await expect(button).toBeVisible();
  await expect(button.locator("svg[aria-hidden='true']")).toBeVisible();
  await expect(button).not.toContainText("Summary");
});

Then("the summary drawer should be open", async function () {
  await expect(this.page.locator(".summary-sidebar.drawer-open")).toBeVisible();
});

Then("the toolbar summary toggle should be named {string}", async function (name) {
  await expect(this.page.locator(".drawer-toggle")).toHaveAccessibleName(name);
});

Then("there should be no separate drawer Close button", async function () {
  await expect(this.page.locator(".summary-sidebar .drawer-close")).toHaveCount(0);
});

Then("the toolbar should remain above the summary drawer", async function () {
  const toolbar = await this.page.locator(".topbar").boundingBox();
  const drawer = await this.page.locator(".summary-sidebar.drawer-open").boundingBox();
  expect(toolbar).not.toBeNull();
  expect(drawer).not.toBeNull();
  expect(drawer.y).toBeGreaterThanOrEqual(toolbar.y + toolbar.height);
  await expect(this.page.locator(".topbar")).toBeVisible();
});

Then("the summary drawer should be closed", async function () {
  await expect(this.page.locator(".summary-sidebar.drawer-open")).toHaveCount(0);
});

When("I open Settings using the brand control", async function () {
  await this.page.getByRole("button", { name: "Open settings", exact: true }).click();
});

When("I toggle Settings using the brand control", async function () {
  await this.page.locator(".brand").click();
});

Then("the settings drawer should be visible below the toolbar", async function () {
  const toolbar = await this.page.locator(".topbar").boundingBox();
  const settingsSidebar = this.page.locator(".settings-sidebar");
  await expect(settingsSidebar).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)");
  const settings = await settingsSidebar.boundingBox();
  expect(toolbar).not.toBeNull();
  expect(settings).not.toBeNull();
  expect(settings.x).toBe(0);
  expect(settings.y).toBeGreaterThanOrEqual(toolbar.y + toolbar.height);
  await expect(this.page.locator(".topbar")).toBeVisible();
});

Then("the settings drawer should be closed", async function () {
  await expect(this.page.locator(".settings-sidebar")).toBeHidden();
});

Then("there should be no Back to sequences button", async function () {
  await expect(this.page.getByRole("button", { name: "Back to sequences" })).toHaveCount(0);
});

Then("the settings panel should be visible alongside sequences", async function () {
  await expect(this.page.locator(".settings-sidebar")).toBeVisible();
  await expect(this.page.locator(".sequence-page")).toBeVisible();
  const settings = await this.page.locator(".settings-sidebar").boundingBox();
  const workspace = await this.page.locator(".workspace").boundingBox();
  expect(settings).not.toBeNull();
  expect(workspace).not.toBeNull();
  expect(settings.x + settings.width).toBeLessThanOrEqual(workspace.x);
  expect(settings.width).toBeCloseTo(320, 0);
});

Then("there should be no modal backdrop", async function () {
  const isInsideBackdrop = await this.page
    .locator(".settings-sidebar")
    .evaluate((panel) => Boolean(panel.closest(".modal-backdrop")));
  expect(isInsideBackdrop).toBe(false);
});

Then("Settings should not be a modal dialog", async function () {
  await expect(
    this.page.getByRole("dialog", { name: "Strategy and safety settings" }),
  ).toHaveCount(0);
});

Then("the summary sidebar should remain visible", async function () {
  await expect(this.page.locator(".summary-sidebar")).toBeVisible();
});

Then("the brand control should be named {string}", async function (name) {
  await expect(this.page.locator(".brand")).toHaveAccessibleName(name);
});

Then("there should be no separate Settings button", async function () {
  await expect(this.page.getByRole("button", { name: "Settings", exact: true })).toHaveCount(0);
});

Then("no guardrail warning should be shown", async function () {
  await expect(this.page.locator(".risk-banner")).toHaveCount(0);
});

When(
  "I add a bet labeled {string} with odds {string} and a manual stake of {string}",
  async function (label, odds, stake) {
    await this.page.getByRole("button", { name: "Add bet", exact: true }).click();
    await this.page.getByLabel("Label").fill(label);
    await this.page.getByLabel("Odd", { exact: true }).fill(odds);
    await this.page.getByLabel("Stake", { exact: true }).fill(stake);
    await this.page.getByRole("button", { name: "Add bet", exact: true }).last().click();
    await expect(this.page.getByRole("dialog")).toHaveCount(0);
  },
);

When(
  "I add a bet labeled {string} with odds {string} and a manual stake of {string} placed at {string}",
  async function (label, odds, stake, placedAt) {
    await this.page.getByRole("button", { name: "Add bet", exact: true }).click();
    await this.page.getByLabel("Label").fill(label);
    await enterPlacementTime(this.page, placedAt);
    await this.page.getByLabel("Odd", { exact: true }).fill(odds);
    await this.page.getByLabel("Stake", { exact: true }).fill(stake);
    await this.page.getByRole("button", { name: "Add bet", exact: true }).last().click();
    await expect(this.page.getByRole("dialog")).toHaveCount(0);
  },
);

When("I set the maximum stake to {string}", async function (value) {
  await this.page.getByRole("button", { name: "Open settings", exact: true }).click();
  const field = this.page.locator("label").filter({
    has: this.page.getByText("Maximum stake", { exact: true }),
  });
  await field.locator("input").fill(value);
  await this.page.getByRole("button", { name: "Save settings" }).click();
  await this.page.locator(".brand").click();
});

Then("a guardrail warning should be shown", async function () {
  await expect(this.page.locator(".risk-banner")).toBeVisible();
});

Then("the guardrail warning icon should be decorative", async function () {
  const icon = this.page.locator(".risk-banner .risk-list-icon").first();
  await expect(icon).toBeVisible();
  await expect(icon).toHaveAttribute("aria-hidden", "true");
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

Then(
  "the bets {string} and {string} should be in the same sequence",
  async function (firstLabel, secondLabel) {
    const sharedSequence = this.page
      .locator(".sequence-list > *")
      .filter({
        has: this.page.getByText(firstLabel, { exact: true }),
      })
      .filter({
        has: this.page.getByText(secondLabel, { exact: true }),
      });
    await expect(sharedSequence).toHaveCount(1);
  },
);

Then(
  "the bets {string} and {string} should be in different sequences",
  async function (firstLabel, secondLabel) {
    const sharedSequence = this.page
      .locator(".sequence-list > *")
      .filter({
        has: this.page.getByText(firstLabel, { exact: true }),
      })
      .filter({
        has: this.page.getByText(secondLabel, { exact: true }),
      });
    await expect(sharedSequence).toHaveCount(0);
  },
);

Then(
  "the plus button for the sequence containing the bet {string} should be {word}",
  async function (label, visibility) {
    const sequence = this.page.locator(".sequence-list > *").filter({
      has: this.page.getByText(label, { exact: true }),
    });
    const button = sequence.getByRole("button", {
      name: /^Add bet to sequence \d+$/,
    });
    if (visibility === "visible") {
      await expect(button).toBeVisible();
    } else {
      await expect(button).toHaveCount(0);
    }
  },
);

Then(
  "the close button for the sequence containing the bet {string} should be {word}",
  async function (label, visibility) {
    const sequence = this.page.locator(".sequence-list > *").filter({
      has: this.page.getByText(label, { exact: true }),
    });
    const button = sequence.getByRole("button", {
      name: "Close sequence",
      exact: true,
    });
    if (visibility === "visible") {
      await expect(button).toBeVisible();
    } else {
      await expect(button).toHaveCount(0);
    }
  },
);

When(
  "I close the sequence containing the bet {string}",
  async function (label) {
    const sequence = this.page.locator(".sequence-list > *").filter({
      has: this.page.getByText(label, { exact: true }),
    });
    await sequence.getByRole("button", {
      name: "Close sequence",
      exact: true,
    }).click();
  },
);

Then(
  "the sequence containing the bet {string} should not offer a continue action",
  async function (label) {
    const sequence = this.page.locator(".sequence-list > *").filter({
      has: this.page.getByText(label, { exact: true }),
    });
    await expect(sequence.getByRole("button", { name: "Close sequence" })).toHaveCount(0);
    await expect(sequence.getByRole("button", { name: /^Add bet to sequence \d+$/ })).toHaveCount(0);
  },
);

When(
  "I press the plus button for the sequence containing the bet {string}",
  async function (label) {
    const sequence = this.page.locator(".sequence-list > *").filter({
      has: this.page.getByText(label, { exact: true }),
    });
    await sequence.getByRole("button", {
      name: /^Add bet to sequence \d+$/,
    }).click();
  },
);

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

Then("the button named {string} should be icon-only", async function (name) {
  const button = this.page.getByRole("button", { name, exact: true }).last();
  await expect(button).toBeVisible();
  await expect(button.locator("svg[aria-hidden='true']")).toHaveCount(1);
  await expect(button).toHaveAttribute("title", name);
  expect((await button.innerText()).trim()).toBe("");
});

Then("the collapsed sequence should have no View button", async function () {
  const sequence = this.page.locator("details.compact-sequence-card").first();
  await expect(sequence).toBeVisible();
  await expect(sequence.getByRole("button", { name: "View", exact: true })).toHaveCount(0);
});

When(
  "I request deletion of the collapsed sequence containing bet {string}",
  async function (label) {
    const sequence = this.page.locator("details.compact-sequence-card").filter({
      has: this.page.getByText(label, { exact: true }),
    });
    await sequence.getByRole("button", { name: "Delete", exact: true }).click();
  },
);

When("I request deletion of bet {string}", async function (label) {
  await revealBet(this.page, label);
  await betCard(this.page, label)
    .getByRole("button", { name: "Delete", exact: true })
    .click();
});

When("I cancel deletion by clicking outside its button", async function () {
  await this.page.locator(".sequence-page > .section-title h2").click();
});

Then(
  "the Edit and Delete actions for bet {string} should be icon-only",
  async function (label) {
    await revealBet(this.page, label);
    const card = betCard(this.page, label);
    await expectIconOnlyAction(
      card.getByRole("button", { name: "Edit", exact: true }),
      "Edit",
    );
    await expectIconOnlyAction(
      card.getByRole("button", { name: "Delete", exact: true }),
      "Delete",
    );
  },
);

Then(
  "the Delete action for bet {string} should be icon-only",
  async function (label) {
    await revealBet(this.page, label);
    await expectIconOnlyAction(
      betCard(this.page, label).getByRole("button", { name: "Delete", exact: true }),
      "Delete",
    );
  },
);

Then(
  "the Delete action for the sequence containing bet {string} should be icon-only",
  async function (label) {
    const sequence = this.page
      .locator(".sequence-card, details.compact-sequence-card, .single-bet-card:not(.nested-sequence-bet)")
      .filter({ has: this.page.getByText(label, { exact: true }) })
      .first();
    const actionGroup = sequence
      .locator(".sequence-card-actions, .compact-sequence-actions")
      .first();
    await expectIconOnlyAction(
      actionGroup.getByRole("button", { name: "Delete", exact: true }),
      "Delete",
    );
  },
);

Then(
  "the Confirm deletion action for bet {string} should be icon-only",
  async function (label) {
    await revealBet(this.page, label);
    await expectIconOnlyAction(
      betCard(this.page, label).getByRole("button", {
        name: "Confirm deletion",
        exact: true,
      }),
      "Confirm deletion",
    );
  },
);

When("I toggle the sequence summary for bet {string}", async function (label) {
  const sequence = this.page.locator("details.compact-sequence-card").filter({
    has: this.page.getByText(label, { exact: true }),
  });
  await sequence.locator("summary").click();
});

When(
  "I press {word} on the sequence summary for bet {string}",
  async function (key, label) {
    const sequence = this.page.locator("details.compact-sequence-card").filter({
      has: this.page.getByText(label, { exact: true }),
    });
    await sequence.locator("summary").focus();
    await this.page.keyboard.press(key);
  },
);

Then(
  "the sequence details for bet {string} should be {word}",
  async function (label, state) {
    const sequence = this.page.locator("details.compact-sequence-card").filter({
      has: this.page.getByText(label, { exact: true }),
    });
    await expect(sequence).toHaveJSProperty("open", state === "expanded");
  },
);

Then("I see the new bet dialog", async function () {
  await expect(this.page.getByRole("dialog")).toBeVisible();
  await expect(this.page.getByRole("heading", { name: "Add a bet" })).toBeVisible();
});

When("I input the label {string}", async function (label) {
  await this.page.getByLabel("Label").fill(label);
});

When("I input the date and time {string}", async function (dateTime) {
  await enterPlacementTime(this.page, dateTime);
});

When("I input {string} in the odds field", async function (odds) {
  await this.page.getByLabel("Odd", { exact: true }).fill(odds);
});

When("I input {string} in the Odds field", async function (odds) {
  await this.page.getByLabel("Odd", { exact: true }).fill(odds);
});

When("I input {string} in the Manual Stake field", async function (stake) {
  await this.page.getByLabel("Stake", { exact: true }).fill(stake);
});

When("I press the Add button", async function () {
  await this.page.getByRole("button", { name: "Add bet", exact: true }).last().click();
});

When("I add a bet labeled {string} with odds {string}", async function (label, odds) {
  await this.page.getByRole("button", { name: "Add bet", exact: true }).click();
  await this.page.getByLabel("Label").fill(label);
  await this.page.getByLabel("Odd", { exact: true }).fill(odds);
  await this.page.getByRole("button", { name: "Add bet", exact: true }).last().click();
});

When("I prepare a bet labeled {string} with odds {string}", async function (label, odds) {
  await this.page.getByRole("button", { name: "Add bet", exact: true }).click();
  await this.page.getByLabel("Label").fill(label);
  await this.page.getByLabel("Odd", { exact: true }).fill(odds);
});

When(
  "I prepare a bet labeled {string} with odds {string} placed at {string}",
  async function (label, odds, placedAt) {
    await this.page.getByRole("button", { name: "Add bet", exact: true }).click();
    await this.page.getByLabel("Label").fill(label);
    await enterPlacementTime(this.page, placedAt);
    await this.page.getByLabel("Odd", { exact: true }).fill(odds);
  },
);

When("I submit the prepared bet", async function () {
  await this.page.getByRole("button", { name: "Add bet", exact: true }).last().click();
});

Then("the ledger should show the bet {string}", async function (label) {
  await expect(this.page.getByText(label, { exact: true })).toBeVisible();
});

Then(
  "the bet {string} should display odds {string}",
  async function (label, odds) {
    const betCard = this.page.locator(".sequence-list article").filter({
      has: this.page.getByText(label, { exact: true }),
    });
    await expect(betCard).toContainText(`@ ${odds}`);
  },
);

Then(
  "the sequence card titles should be ordered as {string} then {string}",
  async function (firstTitle, secondTitle) {
    await expect(
      this.page.locator(".sequence-list > article .bet-description > strong"),
    ).toHaveText([firstTitle, secondTitle]);
  },
);

Then(
  "the recording time should display seconds without milliseconds for {string}",
  async function (label) {
    await revealBet(this.page, label);
    const displayedTime = await betCard(this.page, label)
      .locator(".single-bet-info > span")
      .first()
      .innerText();
    expect(displayedTime).toMatch(/\d{2}:\d{2}:\d{2}/);
    expect(displayedTime).not.toMatch(/\.\d{3}/);
  },
);

Then(
  "the saved placement time for bet {string} should be {string}",
  async function (label, placedAt) {
    const savedPlacementTime = await this.page.evaluate((betLabel) => {
      const stored = window.localStorage.getItem("fairbets-ledger-state-v2");
      if (!stored) {
        throw new Error("Saved FairBets ledger was not found.");
      }
      return JSON.parse(stored).bets.find((bet) => bet.label === betLabel)?.placedAt;
    }, label);
    expect(savedPlacementTime).toBe(placedAt);
  },
);

When("I open the edit form for bet {string}", async function (label) {
  await revealBet(this.page, label);
  await betCard(this.page, label).getByRole("button", { name: "Edit", exact: true }).click();
});

Then("the date and time field should contain {string}", async function (dateTime) {
  await expect(this.page.getByLabel("Date and time")).toHaveValue(dateTime);
});

When("I edit the placement time to {string}", async function (dateTime) {
  await enterPlacementTime(this.page, dateTime);
  await this.page.getByRole("button", { name: "Save changes" }).click();
  await expect(this.page.getByRole("dialog")).toHaveCount(0);
});

Then(
  "the bet rows should be ordered by recording time as {string} then {string}",
  async function (firstLabel, secondLabel) {
    await expect(
      this.page.locator(".active-sequence-bet-list .bet-description > strong"),
    ).toHaveText([firstLabel, secondLabel]);
  },
);

Then(
  "the standalone cancelled cards should be ordered as {string} then {string}",
  async function (firstLabel, secondLabel) {
    await expect(
      this.page.locator(".standalone-cancelled-list .bet-description > strong"),
    ).toHaveText([firstLabel, secondLabel]);
  },
);

Then(
  "the bet {string} should show calculated position {string}",
  async function (label, position) {
    await revealBet(this.page, label);
    const card = betCard(this.page, label);
    await expect(card.locator(".single-bet-state > span").first()).toHaveText(position);
  },
);

When(
  "I set the recording timestamps for {string} and {string} to the same value",
  async function (firstLabel, secondLabel) {
    await this.page.evaluate(([first, second]) => {
      const stored = window.localStorage.getItem("fairbets-ledger-state-v2");
      if (!stored) {
        throw new Error("Saved FairBets ledger was not found.");
      }
      const ledger = JSON.parse(stored);
      const firstBet = ledger.bets.find((bet) => bet.label === first);
      const secondBet = ledger.bets.find((bet) => bet.label === second);
      if (!firstBet?.createdAt || !secondBet) {
        throw new Error("Both recorded bets must exist before creating a timestamp collision.");
      }
      secondBet.createdAt = firstBet.createdAt;
      window.localStorage.setItem("fairbets-ledger-state-v2", JSON.stringify(ledger));
    }, [firstLabel, secondLabel]);
  },
);

Then(
  "the recording timestamps for {string} and {string} should be unique within the same second",
  async function (firstLabel, secondLabel) {
    const timestamps = await this.page.evaluate(([first, second]) => {
      const stored = window.localStorage.getItem("fairbets-ledger-state-v2");
      if (!stored) {
        throw new Error("Saved FairBets ledger was not found.");
      }
      const bets = JSON.parse(stored).bets;
      return [first, second].map((label) => bets.find((bet) => bet.label === label)?.createdAt);
    }, [firstLabel, secondLabel]);
    expect(timestamps[0]).toBeTruthy();
    expect(timestamps[1]).toBeTruthy();
    expect(timestamps[0]).not.toBe(timestamps[1]);
    expect(Math.floor(Date.parse(timestamps[0]) / 1000)).toBe(
      Math.floor(Date.parse(timestamps[1]) / 1000),
    );
  },
);

Then(
  "the saved recording timestamps should be ordered as {string} then {string}",
  async function (firstLabel, secondLabel) {
    const timestamps = await this.page.evaluate(([first, second]) => {
      const stored = window.localStorage.getItem("fairbets-ledger-state-v2");
      if (!stored) {
        throw new Error("Saved FairBets ledger was not found.");
      }
      const bets = JSON.parse(stored).bets;
      return [first, second].map((label) => bets.find((bet) => bet.label === label)?.createdAt);
    }, [firstLabel, secondLabel]);
    expect(timestamps[0]).toBeTruthy();
    expect(timestamps[1]).toBeTruthy();
    expect(Date.parse(timestamps[0])).toBeLessThan(Date.parse(timestamps[1]));
  },
);

Then("the prominent title should show {string}", async function (title) {
  await expect(
    this.page.locator(".sequence-list > article .bet-description > strong"),
  ).toHaveText([title]);
});

When("I update the odds for the generated-title bet to {string}", async function (odds) {
  const card = this.page.locator(".sequence-list > article").first();
  await card.getByRole("button", { name: "Edit", exact: true }).click();
  await this.page.getByLabel("Odd", { exact: true }).fill(odds);
  await this.page.getByRole("button", { name: "Save changes" }).click();
  await expect(this.page.getByRole("dialog")).toHaveCount(0);
});

Then("no generated Selection title should be shown", async function () {
  await expect(this.page.getByText(/^Selection \d+$/)).toHaveCount(0);
});

Then("the prominent title {string} should be visible", async function (title) {
  await expect(
    this.page.locator(".sequence-list .bet-description > strong").filter({ hasText: title }),
  ).toBeVisible();
});

When("I filter the bet list by description {string}", async function (description) {
  await this.page.getByLabel("Filter by bet description").fill(description);
});

When("I select the sequence status filter {string}", async function (status) {
  await this.page
    .locator(".filter-bar")
    .getByRole("button", { name: status, exact: true })
    .click();
});

Then("the all-status filter should be named {string}", async function (name) {
  const allFilter = this.page
    .locator(".filter-bar")
    .getByRole("button", { name, exact: true });
  await expect(allFilter).toBeVisible();
  await expect(allFilter).toHaveClass(/active/);
});

Then("the Add Bet button should be in the sequence filter row", async function () {
  const addBetButton = this.page.getByRole("button", {
    name: "Add bet",
    exact: true,
  });
  const sequenceFilter = this.page.locator(".filter-bar");
  const addBetBounds = await addBetButton.boundingBox();
  const filterBounds = await sequenceFilter.boundingBox();
  expect(addBetBounds).not.toBeNull();
  expect(filterBounds).not.toBeNull();
  expect(Math.abs(addBetBounds.y - filterBounds.y)).toBeLessThanOrEqual(2);
  expect(addBetBounds.x).toBeGreaterThanOrEqual(filterBounds.x + filterBounds.width);
});

Then(
  "the Add Bet button should be right-aligned with the sequence filter controls",
  async function () {
    const addBetButton = this.page.getByRole("button", {
      name: "Add bet",
      exact: true,
    });
    const controls = this.page.locator(".sequence-filter-controls");
    const addBetBounds = await addBetButton.boundingBox();
    const controlsBounds = await controls.boundingBox();
    expect(addBetBounds).not.toBeNull();
    expect(controlsBounds).not.toBeNull();
    expect(Math.abs(
      addBetBounds.x + addBetBounds.width - (controlsBounds.x + controlsBounds.width),
    )).toBeLessThanOrEqual(2);
  },
);

Then("the page should not overflow horizontally", async function () {
  const { scrollWidth, innerWidth } = await this.page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
});

Then("the description {string} should be visible", async function (description) {
  await expect(
    this.page.locator(".sequence-list .bet-description").filter({ hasText: description }),
  ).toHaveCount(1);
});

Then("the description {string} should not be visible", async function (description) {
  await expect(
    this.page.locator(".sequence-list .bet-description").filter({ hasText: description }),
  ).toHaveCount(0);
});

Then("the cancelled description {string} should be visible", async function (description) {
  await expect(
    this.page
      .locator(".standalone-cancelled-list .bet-description")
      .filter({ hasText: description }),
  ).toHaveCount(1);
});

Then("the cancelled description {string} should not be visible", async function (description) {
  await expect(
    this.page
      .locator(".standalone-cancelled-list .bet-description")
      .filter({ hasText: description }),
  ).toHaveCount(0);
});

Then("the bet list should say no descriptions match", async function () {
  await expect(this.page.getByText("No bets match that description.", { exact: true })).toBeVisible();
});

Then("the bet {string} should be {string}", async function (label, outcome) {
  const normalizedOutcome = outcome.toLowerCase();
  if (normalizedOutcome === "cancelled") {
    const cancelledBet = betCard(this.page, label);
    await expect(cancelledBet.locator(".status-cancelled")).toBeVisible();
    return;
  }

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
  if (outcome.toLowerCase() === "cancelled") {
    await openBetEditor(this.page, label);
    await this.page.locator(".bet-modal select").first().selectOption("cancelled");
    await this.page.getByRole("button", { name: "Save changes" }).click();
    await expect(this.page.getByRole("dialog")).toHaveCount(0);
    return;
  }

  await revealBet(this.page, label);
  const betCard = this.page.locator(".single-bet-card").filter({
    has: this.page.getByText(label, { exact: true }),
  }).first();
  const directAction = betCard.getByRole("button", { name: outcome, exact: true });
  if ((await directAction.count()) > 0) {
    await directAction.click();
    return;
  }

  await openBetEditor(this.page, label);
  await this.page.locator(".bet-modal select").first().selectOption(outcome.toLowerCase());
  await this.page.getByRole("button", { name: "Save changes" }).click();
  await expect(this.page.getByRole("dialog")).toHaveCount(0);
});

When("I cancel the open bet {string}", async function (label) {
  await revealBet(this.page, label);
  await betCard(this.page, label)
    .getByRole("button", { name: "Cancelled", exact: true })
    .click();
});

Then("I should see the bet settlement message", async function () {
  await expect(this.page.getByRole("status")).toContainText("Bet marked as won.");
});

Given("the user is on the Settings screen", async function () {
  await this.page.getByRole("button", { name: "Open settings", exact: true }).click();
  await expect(this.page.getByRole("heading", { name: "Strategy and safety settings" })).toBeVisible();
});

Given("the user selects a valid FairBets workbook", async function () {
  const workbook = XLSX.utils.book_new();
  const rows = [
    ["FairBets import fixture"],
    [],
    ["Bet", "Activity", "DATETIME", "BET", "ODD", "Result"],
    ["Imported selection", "x", "2026-09-13", 0.25, 1.234, "won"],
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

async function expectIconOnlyAction(button, name) {
  await expect(button).toBeVisible();
  await expect(button.locator("svg[aria-hidden='true']")).toHaveCount(1);
  await expect(button).toHaveAttribute("aria-label", name);
  await expect(button).toHaveAttribute("title", name);
  expect((await button.innerText()).trim()).toBe("");
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
  await this.page.getByRole("button", { name: "Open settings", exact: true }).click();
  const field = this.page.locator("label").filter({
    has: this.page.getByText("Base stake", { exact: true }),
  });
  await field.locator("input").fill(value);
  await this.page.getByRole("button", { name: "Save settings" }).click();
  await this.page.locator(".brand").click();
});

When("I set the starting balance to {string}", async function (value) {
  await this.page.getByRole("button", { name: "Open settings", exact: true }).click();
  const field = this.page.locator("label").filter({
    has: this.page.getByText("Starting balance", { exact: true }),
  });
  await field.locator("input").fill(value);
  await this.page.getByRole("button", { name: "Save settings" }).click();
  await this.page.locator(".brand").click();
});

When("I start a fresh ledger", async function () {
  await this.page.getByRole("button", { name: "Open settings", exact: true }).click();
  await this.page.getByRole("button", { name: "Start fresh", exact: true }).click();
  await freshDialog(this.page).getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(this.page.locator("h1")).toHaveText("New FairBets ledger");
});

When("I set the goal rate to {string} with full recovery weighting", async function (value) {
  await this.page.getByRole("button", { name: "Open settings", exact: true }).click();
  for (const [label, setting] of [
    ["Goal rate (%)", value],
    ["Recovery weight (%)", "100"],
  ]) {
    const field = this.page.locator("label").filter({
      has: this.page.getByText(label, { exact: true }),
    });
    await field.locator("input").fill(setting);
  }
  await this.page.getByRole("button", { name: "Save settings" }).click();
  await this.page.locator(".brand").click();
  await this.page.locator(".brand").click();
  for (const label of ["Goal rate (%)", "Recovery weight (%)"]) {
    const field = this.page.locator("label").filter({
      has: this.page.getByText(label, { exact: true }),
    });
    await expect(field.locator("input")).toHaveValue(value);
  }
  await this.page.locator(".brand").click();
});

Then("the bet {string} should have a stake of {string}", async function (label, stake) {
  await revealBet(this.page, label);
  const metrics = betCard(this.page, label).locator(".single-bet-metrics span").first();
  await expect(metrics.locator("strong")).toHaveText(stake);
});

Then("the suggested stake should be {string}", async function (stake) {
  await expect(this.page.getByLabel("Stake", { exact: true })).toHaveAttribute("placeholder", stake);
});

Then("the settled P&L should be {string}", async function (profit) {
  const metric = this.page.locator(".metric-card").filter({
    has: this.page.getByText("Settled P&L", { exact: true }),
  });
  await expect(metric.locator("strong")).toHaveText(profit);
});

Then("cancellation should leave no open exposure, wins, or losses", async function () {
  const balance = this.page.locator(".metric-card").filter({
    has: this.page.getByText("Available balance", { exact: true }),
  });
  await expect(balance.locator("span")).toHaveText("€0.00 committed to open bets");

  const settled = this.page.locator(".metric-card").filter({
    has: this.page.getByText("Settled P&L", { exact: true }),
  });
  await expect(settled.locator("span")).toHaveText("0 won and 0 lost");
});

Then("the goal target should be {string}", async function (target) {
  const goal = this.page.locator(".goal-panel .goal-values strong").nth(1);
  await expect(goal).toHaveText(target);
});

Then(
  "the cancelled bet {string} should be visible outside sequences",
  async function (label) {
    const cancelledRecord = this.page.locator(".standalone-cancelled-list").filter({
      has: this.page.getByText(label, { exact: true }),
    });
    await expect(cancelledRecord).toBeVisible();
  },
);

Then(
  "the saved outcome for the bet {string} should be {string}",
  async function (label, outcome) {
    const savedOutcome = await this.page.evaluate((betLabel) => {
      const stored = window.localStorage.getItem("fairbets-ledger-state-v2");
      if (!stored) {
        throw new Error("Saved FairBets ledger was not found.");
      }
      const ledger = JSON.parse(stored);
      return ledger.bets.find((bet) => bet.label === betLabel)?.outcome;
    }, label);
    expect(savedOutcome).toBe(outcome);
  },
);

When(
  "I add a bet labeled {string} with odds {string} placed at {string}",
  async function (label, odds, placedAt) {
    const addButton = this.page.getByRole("button", { name: "Add bet", exact: true });
    await expect(addButton).toBeEnabled();
    await addButton.click();
    await this.page.getByLabel("Label").fill(label);
    await enterPlacementTime(this.page, placedAt);
    await this.page.getByLabel("Odd", { exact: true }).fill(odds);
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

When("I update the odds for {string} to {string}", async function (label, odds) {
  await openBetEditor(this.page, label);
  await this.page.getByLabel("Odd", { exact: true }).fill(odds);
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
    await newBetDialog(this.page).getByRole("button", { name: "Close", exact: true }).click();
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
  await newBetDialog(this.page).getByRole("button", { name: "Close", exact: true }).click();
  await expect(this.page.getByRole("dialog")).toHaveCount(0);
});


Then(
  "the sequence card containing the bet {string} should not show {string}",
  async function (label, text) {
    const sequence = this.page.locator(".sequence-card").filter({
      has: this.page.getByText(label, { exact: true }),
    });
    await expect(sequence).toBeVisible();
    await expect(sequence.getByText(text, { exact: true })).toHaveCount(0);
  },
);

Then(
  "the Active tag of the sequence containing the bet {string} should be directly below its number",
  async function (label) {
    const sequence = this.page.locator(".sequence-card").filter({
      has: this.page.getByText(label, { exact: true }),
    });
    const number = await sequence.locator(".sequence-number").boundingBox();
    const tag = sequence.locator(".sequence-card-heading .status-badge");
    await expect(tag).toHaveText("Active");
    await expect(tag.locator("xpath=ancestor::*[contains(@class,'sequence-card-actions')]")).toHaveCount(0);
    const bounds = await tag.boundingBox();
    expect(Math.abs(bounds.x - number.x)).toBeLessThanOrEqual(2);
    expect(bounds.y).toBeGreaterThanOrEqual(number.y + number.height - 1);
    expect(bounds.y - (number.y + number.height)).toBeLessThanOrEqual(12);
  },
);

async function cardButtonBounds(page, label, names) {
  const card = page
    .locator(".sequence-card, .single-bet-card")
    .filter({ has: page.getByText(label, { exact: true }) })
    .first();
  const bounds = [];
  for (const name of names.split(",").map((value) => value.trim())) {
    const box = await card.getByRole("button", { name, exact: true }).first().boundingBox();
    expect(box, `${name} button should be visible`).not.toBeNull();
    bounds.push(box);
  }
  return bounds;
}

Then(
  "the buttons {string} in the card containing the bet {string} should have the same size",
  async function (names, label) {
    const bounds = await cardButtonBounds(this.page, label, names);
    for (const box of bounds) {
      expect(Math.abs(box.width - bounds[0].width)).toBeLessThanOrEqual(1);
      expect(Math.abs(box.height - bounds[0].height)).toBeLessThanOrEqual(1);
    }
  },
);

Then(
  "the buttons {string} in the card containing the bet {string} should be nested without gaps",
  async function (names, label) {
    const bounds = (await cardButtonBounds(this.page, label, names)).sort(
      (left, right) => left.x - right.x,
    );
    for (let index = 1; index < bounds.length; index += 1) {
      const previous = bounds[index - 1];
      expect(Math.abs(bounds[index].x - (previous.x + previous.width))).toBeLessThanOrEqual(1.5);
      expect(Math.abs(bounds[index].y - previous.y)).toBeLessThanOrEqual(1);
    }
  },
);

async function cardEdges(page, label, name) {
  const card = page
    .locator(".sequence-card, .single-bet-card")
    .filter({ has: page.getByText(label, { exact: true }) })
    .first();
  const cardBox = await card.boundingBox();
  const buttonBox = await card.getByRole("button", { name, exact: true }).boundingBox();
  return { cardBox, buttonBox };
}

Then(
  "the {string} button in the card containing the bet {string} should be at the left edge of the card",
  async function (name, label) {
    const { cardBox, buttonBox } = await cardEdges(this.page, label, name);
    expect(buttonBox.x - cardBox.x).toBeLessThanOrEqual(20);
  },
);

Then(
  "the {string} button in the card containing the bet {string} should be at the right edge of the card",
  async function (name, label) {
    const { cardBox, buttonBox } = await cardEdges(this.page, label, name);
    expect(cardBox.x + cardBox.width - (buttonBox.x + buttonBox.width)).toBeLessThanOrEqual(20);
  },
);

When("I hover over the Add Bet button", async function () {
  await this.page.getByRole("button", { name: "Add bet", exact: true }).hover();
});

Then("the Add Bet button should have no drop shadow", async function () {
  await expect(
    this.page.getByRole("button", { name: "Add bet", exact: true }),
  ).toHaveCSS("box-shadow", "none");
});

Then("the Add Bet button should not be lifted", async function () {
  await expect(
    this.page.getByRole("button", { name: "Add bet", exact: true }),
  ).toHaveCSS("transform", "none");
});

When("I turn the {string} switch {word}", async function (name, state) {
  const toggle = this.page.getByRole("switch", { name, exact: true });
  const wanted = state === "on" ? "true" : "false";
  if ((await toggle.getAttribute("aria-checked")) !== wanted) {
    await toggle.click();
  }
});

Then("the {string} switch should be {word}", async function (name, state) {
  await expect(this.page.getByRole("switch", { name, exact: true })).toHaveAttribute(
    "aria-checked",
    state === "on" ? "true" : "false",
  );
});

Then("the {string} switch should be inside the filter input", async function (name) {
  const input = await this.page.getByLabel("Filter by bet description").boundingBox();
  const toggle = await this.page.getByRole("switch", { name, exact: true }).boundingBox();
  expect(toggle.x).toBeGreaterThanOrEqual(input.x);
  expect(toggle.x + toggle.width).toBeLessThanOrEqual(input.x + input.width);
  expect(toggle.y).toBeGreaterThanOrEqual(input.y);
  expect(toggle.y + toggle.height).toBeLessThanOrEqual(input.y + input.height);
});

// A new bet's placement time is read-only and taken from the clock when it is added,
// so entering a time on the new bet form moves the browser clock; editing types it.
async function enterPlacementTime(page, value) {
  const field = page.getByLabel("Date and time");
  if ((await field.count()) === 0) {
    await page.clock.setFixedTime(new Date(value));
    return;
  }
  await field.fill(value);
}

function newBetDialog(page) {
  return page.getByRole("dialog");
}

Then("{string} should be listed before {string} in the bet dialog", async function (first, second) {
  const firstBox = await newBetDialog(this.page).getByLabel(first, { exact: true }).boundingBox();
  const secondBox = await newBetDialog(this.page).getByLabel(second, { exact: true }).boundingBox();
  expect(firstBox.y).toBeLessThan(secondBox.y);
});

Then("the {string} field in the bet dialog should be read-only", async function (name) {
  await expect(newBetDialog(this.page).getByLabel(name, { exact: true })).toHaveJSProperty(
    "readOnly",
    true,
  );
});

Then("the {string} field in the bet dialog should be editable", async function (name) {
  const field = newBetDialog(this.page).getByLabel(name, { exact: true });
  await expect(field).toHaveJSProperty("readOnly", false);
  await expect(field).toBeEnabled();
});

// A select's accessible label includes its option text, so match the label's start.
function dialogField(page, name) {
  return newBetDialog(page).getByLabel(new RegExp(`^${name}`));
}

Then("the bet dialog should have a {string} field", async function (name) {
  await expect(dialogField(this.page, name)).toHaveCount(1);
});

Then("the bet dialog should not have a {string} field", async function (name) {
  await expect(dialogField(this.page, name)).toHaveCount(0);
});
Then("the bet dialog should not have a {string} button", async function (name) {
  await expect(newBetDialog(this.page).getByRole("button", { name, exact: true })).toHaveCount(0);
});

Then("the {string} and {string} fields should share a row in the bet dialog", async function (left, right) {
  const leftBox = await newBetDialog(this.page).getByLabel(left, { exact: true }).boundingBox();
  const rightBox = await newBetDialog(this.page).getByLabel(right, { exact: true }).boundingBox();
  expect(Math.abs(leftBox.y - rightBox.y)).toBeLessThanOrEqual(1);
  expect(rightBox.x).toBeGreaterThan(leftBox.x + leftBox.width - 1);
});

Then("the dialog should start below the toolbar", async function () {
  const dialog = await this.page.getByRole("dialog").boundingBox();
  const toolbar = await this.page.locator(".topbar").boundingBox();
  expect(dialog.y).toBeGreaterThanOrEqual(toolbar.y + toolbar.height - 1);
});

async function filterGeometry(page) {
  const input = await page.locator(".description-filter").boundingBox();
  const row = await page.locator(".sequence-filter-controls").boundingBox();
  return { input, row };
}

Then("the description filter should be about half the width of the filter row", async function () {
  const { input, row } = await filterGeometry(this.page);
  expect(Math.abs(input.width / row.width - 0.5)).toBeLessThan(0.03);
});

Then("the description filter should be the full width of the filter row", async function () {
  const { input, row } = await filterGeometry(this.page);
  expect(Math.abs(input.width - row.width)).toBeLessThanOrEqual(1);
});

function ledgersDialog(page) {
  return page.locator(".ledgers-page");
}

When("I open the Ledgers tab", async function () {
  await this.page.getByRole("tab", { name: "Ledgers", exact: true }).click();
  await expect(ledgersDialog(this.page)).toBeVisible();
});

When("I open the Sequences tab", async function () {
  await this.page.getByRole("tab", { name: "Sequences", exact: true }).click();
  await expect(ledgersDialog(this.page)).toHaveCount(0);
});

Then("the {string} tab should be selected", async function (name) {
  await expect(this.page.getByRole("tab", { name, exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  );
});

Then("I should see the sequences list", async function () {
  await expect(this.page.locator(".sequence-page")).toBeVisible();
});

Then("I should not see the sequences list", async function () {
  await expect(this.page.locator(".sequence-page")).toHaveCount(0);
});

Then("I should not see a ledgers dialog", async function () {
  await expect(this.page.getByRole("dialog")).toHaveCount(0);
  await expect(this.page.getByRole("button", { name: "Open ledgers", exact: true })).toHaveCount(0);
});

function ledgerCard(page, text) {
  return page.locator(".ledger-card").filter({ hasText: text }).first();
}

Then("the ledger cards should be listed as {string}",
  async function (first) {
    await expectLedgerCardNames(this.page, [first]);
  },
);

Then("the ledger cards should be listed as {string}, {string}", async function (first, second) {
  await expectLedgerCardNames(this.page, [first, second]);
});

Then(
  "the collapsed card {string} should show net result {string} and profit {string}",
  async function (number, net, profit) {
    const card = ledgerCard(this.page, number);
    await expect(card.locator(".ledger-card-net")).toHaveText(net);
    await expect(card.locator(".ledger-card-profit")).toHaveText(profit);
  },
);

When("I click the card {string}", async function (number) {
  await ledgerCard(this.page, number).getByRole("button").first().click();
});

Then("the card {string} should be collapsed", async function (number) {
  const card = ledgerCard(this.page, number);
  await expect(card.getByRole("button").first()).toHaveAttribute("aria-expanded", "false");
  await expect(card.locator(".closed-ledger-stats")).toHaveCount(0);
});

Then("the card {string} should be expanded", async function (number) {
  const card = ledgerCard(this.page, number);
  await expect(card.getByRole("button").first()).toHaveAttribute("aria-expanded", "true");
  await expect(card.locator(".closed-ledger-stats")).toBeVisible();
});
Then("the {string} figure should be {string}", async function (label, value) {
  await expect(
    ledgersDialog(this.page)
      .locator(".funds-summary > div")
      .filter({ hasText: label })
      .locator("strong"),
  ).toHaveText(value);
});

When("I add an investment of {string}", async function (amount) {
  const dialog = ledgersDialog(this.page);
  await dialog.getByLabel("Investment amount", { exact: true }).fill(amount);
  await dialog.getByRole("button", { name: "Add investment", exact: true }).click();
});

Then("the ledgers message should read {string}", async function (message) {
  await expect(ledgersDialog(this.page).getByRole("alert")).toHaveText(message);
});

Then("the latest history entry should read {string}", async function (text) {
  await expect(ledgersDialog(this.page).locator(".ledger-history > li").first()).toContainText(text);
});

Then("the latest history entry should show a timestamp", async function () {
  await expect(
    ledgersDialog(this.page).locator(".ledger-history > li").first().locator("time"),
  ).toHaveText(/\d{1,2}:\d{2}/);
});

Then("the history should list {string} before {string}", async function (first, second) {
  const entries = await ledgersDialog(this.page).locator(".ledger-history > li").allTextContents();
  const firstIndex = entries.findIndex((entry) => entry.includes(first));
  const secondIndex = entries.findIndex((entry) => entry.includes(second));
  expect(firstIndex).toBeGreaterThanOrEqual(0);
  expect(secondIndex).toBeGreaterThan(firstIndex);
});

When("I close the active ledger", async function () {
  const dialog = ledgersDialog(this.page);
  await dialog.getByRole("button", { name: "Close ledger", exact: true }).click();
  const confirm = dialog.getByRole("button", { name: "Confirm close", exact: true });
  if (await confirm.isVisible()) {
    await confirm.click();
  }
});

Then("the ledger should still be active", async function () {
  await expect(
    ledgersDialog(this.page).getByRole("button", { name: "Close ledger", exact: true }),
  ).toBeVisible();
});

Then("no ledger should be active", async function () {
  await expect(ledgersDialog(this.page).getByText("No active ledger", { exact: true })).toBeVisible();
});

Then("I should be told there is no active ledger", async function () {
  await expect(this.page.locator(".notice, .no-ledger-notice").filter({ hasText: "No active ledger" })).toBeVisible();
});

Then(
  "the ledger card {string} should show {string} as {string}",
  async function (name, label, value) {
    const card = ledgerCard(this.page, name);
    if (label === "Net result") {
      await expect(card.locator(".ledger-card-net")).toHaveText(value);
      return;
    }
    const toggle = card.getByRole("button").first();
    if ((await toggle.getAttribute("aria-expanded")) !== "true") {
      await toggle.click();
    }
    await expect(
      card.locator(".closed-ledger-stats > div").filter({ hasText: label }).locator("strong").first(),
    ).toHaveText(value);
  },
);
When(
  "I start a new ledger named {string} with a starting balance of {string}",
  async function (name, balance) {
    const form = ledgersDialog(this.page).locator("form.start-ledger-form");
    await form.getByLabel("Ledger name", { exact: true }).fill(name);
    await form.getByLabel("Starting balance", { exact: true }).fill(balance);
    await form.getByRole("button", { name: "Start ledger", exact: true }).click();
  },
);

Then("the new ledger form should have {string} set to {string}", async function (label, value) {
  await expect(
    ledgersDialog(this.page)
      .locator("form.start-ledger-form")
      .getByLabel(label, { exact: true }),
  ).toHaveValue(value);
});

Then("I should not be able to start a new ledger", async function () {
  await expect(ledgersDialog(this.page).locator("form.start-ledger-form")).toHaveCount(0);
  await expect(ledgersDialog(this.page)).toContainText("Close the active ledger before starting another.");
});

Then("the ledger title should be {string}", async function (name) {
  await expect(this.page.locator("h1")).toHaveText(name);
});

When("I remove the saved ledger history and reload", async function () {
  await this.page.evaluate(() => window.localStorage.removeItem("fairbets-portfolio-v1"));
  await this.page.reload({ waitUntil: "domcontentloaded" });
});
Then("the bottom toolbar should show the Sequences and Ledgers tabs", async function () {
  await expect(this.page.getByRole("tab", { name: "Sequences", exact: true })).toBeVisible();
  await expect(this.page.getByRole("tab", { name: "Ledgers", exact: true })).toBeVisible();
});

Then("the bottom toolbar should be docked to the bottom of the screen", async function () {
  const tabs = this.page.getByRole("tablist");
  await expect(tabs).toHaveCSS("position", "fixed");
  const box = await tabs.boundingBox();
  const viewport = this.page.viewportSize();
  expect(box.y + box.height).toBeCloseTo(viewport.height, 0);
  expect(box.width).toBeCloseTo(viewport.width, 0);
});

When("I scroll the page to the bottom", async function () {
  await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
});

Then("the top toolbar should still be visible", async function () {
  const box = await this.page.locator(".topbar").boundingBox();
  expect(box.y).toBeCloseTo(0, 0);
});

Then("the tabs should be shown above the content", async function () {
  const tabs = this.page.getByRole("tablist");
  await expect(tabs).not.toHaveCSS("position", "fixed");
  const tabsBox = await tabs.boundingBox();
  const workspace = await this.page.locator(".workspace").boundingBox();
  expect(tabsBox.y + tabsBox.height).toBeLessThanOrEqual(workspace.y);
});


Then("the Ledgers page headings and labels should have readable contrast", async function () {
  const failures = await this.page.evaluate(() => {
    const parse = (value) => (value.match(/[\d.]+/g) ?? []).map(Number);
    const luminance = ([r, g, b]) => {
      const [lr, lg, lb] = [r, g, b].map((channel) => {
        const c = channel / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
    };
    const backgroundOf = (element) => {
      for (let node = element; node; node = node.parentElement) {
        const [r, g, b, a = 1] = parse(getComputedStyle(node).backgroundColor);
        if (a > 0.9) return [r, g, b];
      }
      return [255, 255, 255];
    };
    const selector =
      ".ledgers-page h2, .ledgers-page h3, .ledgers-page .eyebrow, .ledgers-page label span, .ledgers-page .ledger-hint, .ledgers-page .ledger-card-title, .ledgers-page .ledger-card-net, .ledgers-page .ledger-card-profit, .ledgers-page .funds-summary span, .ledgers-page .ledger-inline-form p, .ledgers-page .ledger-history li";
    return [...document.querySelectorAll(selector)]
      .map((element) => {
        const [r, g, b] = parse(getComputedStyle(element).color);
        const l1 = luminance([r, g, b]);
        const l2 = luminance(backgroundOf(element));
        const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
        return { text: element.textContent.trim().slice(0, 30), ratio: Number(ratio.toFixed(2)) };
      })
      .filter((item) => item.ratio < 4.5);
  });
  expect(failures).toEqual([]);
});

Then("the funds should be shown as pills", async function () {
  const pills = this.page.locator(".ledgers-page .funds-summary > div");
  await expect(pills).toHaveCount(3);
  for (const pill of await pills.all()) {
    await expect(pill).toHaveCSS("border-radius", "999px");
  }
});

Then("the Ledgers page sections should have no white panel", async function () {
  const sections = this.page.locator(".ledgers-page .ledger-section");
  expect(await sections.count()).toBeGreaterThan(0);
  for (const section of await sections.all()) {
    await expect(section).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  }
});

Then("the ledger cards should be as wide as the page content", async function () {
  const page = await this.page.locator(".ledgers-page").boundingBox();
  const card = await this.page.locator(".ledger-card").first().boundingBox();
  expect(card.width).toBeGreaterThanOrEqual(page.width - 2);
});

Then("the {string} button should be disabled", async function (name) {
  await expect(this.page.getByRole("button", { name, exact: true })).toBeDisabled();
});

Then("the placement time should be shown below the {string} heading", async function (title) {
  const dialog = newBetDialog(this.page);
  const heading = await dialog.getByRole("heading", { name: title, exact: true }).boundingBox();
  const stamp = dialog.locator(".modal-timestamp");
  await expect(stamp).toBeVisible();
  await expect(stamp).toHaveText(/^\d{2} \w{3}, \d{2}:\d{2}:\d{2}$/);
  const box = await stamp.boundingBox();
  expect(box.y).toBeGreaterThanOrEqual(heading.y + heading.height - 1);
});

Then("the bet dialog should not show a suggestion box", async function () {
  await expect(newBetDialog(this.page).locator(".suggestion-preview")).toHaveCount(0);
});

Then("the {string} field should be as wide as the dialog form", async function (name) {
  const dialog = newBetDialog(this.page);
  const field = await dialog.getByLabel(name, { exact: true }).boundingBox();
  const form = await dialog.locator("form").boundingBox();
  expect(field.width).toBeGreaterThanOrEqual(form.width - 2);
});

Then("the bet dialog should have a {string} button", async function (name) {
  await expect(newBetDialog(this.page).getByRole("button", { name, exact: true })).toHaveCount(1);
});

When("I close the bet dialog", async function () {
  await newBetDialog(this.page).getByRole("button", { name: "Close", exact: true }).click();
});

Then("the new bet dialog is closed", async function () {
  await expect(this.page.getByRole("dialog")).toHaveCount(0);
});

Then(
  "the {string}, {string} fields and the {string} button should share a row in the bet dialog",
  async function (left, right, buttonName) {
    const dialog = newBetDialog(this.page);
    const a = await dialog.getByLabel(left, { exact: true }).boundingBox();
    const b = await dialog.getByLabel(right, { exact: true }).boundingBox();
    const button = await dialog.getByRole("button", { name: buttonName, exact: true }).boundingBox();
    const form = await dialog.locator("form").boundingBox();
    expect(Math.abs(a.y - b.y)).toBeLessThanOrEqual(1);
    expect(button.y + button.height).toBeGreaterThan(a.y);
    expect(button.y).toBeLessThan(a.y + a.height);
    expect(button.x).toBeGreaterThan(b.x + b.width - 1);
    expect(button.x + button.width).toBeLessThanOrEqual(form.x + form.width + 1);
  },
);
function freshDialog(page) {
  return page.getByRole("dialog", { name: "Start fresh" });
}

When("I press Start fresh in the settings", async function () {
  this.nativeDialogs = 0;
  this.page.on("dialog", (dialog) => {
    this.nativeDialogs += 1;
    dialog.dismiss();
  });
  await this.page.getByRole("button", { name: "Open settings", exact: true }).click();
  await this.page.getByRole("button", { name: "Start fresh", exact: true }).click();
});

Then("the {string} dialog should be shown", async function (name) {
  await expect(this.page.getByRole("dialog", { name })).toBeVisible();
});

Then("the {string} dialog should be closed", async function (name) {
  await expect(this.page.getByRole("dialog", { name })).toHaveCount(0);
});

Then("{string} should be switched on", async function (name) {
  await expect(freshDialog(this.page).getByRole("switch", { name })).toHaveAttribute(
    "aria-checked",
    "true",
  );
});

Then("{string} should be switched off", async function (name) {
  await expect(freshDialog(this.page).getByRole("switch", { name })).toHaveAttribute(
    "aria-checked",
    "false",
  );
});

Then("the {string} dialog should have Confirm and Cancel buttons", async function (name) {
  const dialog = this.page.getByRole("dialog", { name });
  await expect(dialog.getByRole("button", { name: "Confirm", exact: true })).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Cancel", exact: true })).toBeVisible();
});

Then("no system dialog should have been shown", async function () {
  expect(this.nativeDialogs).toBe(0);
});

When("I cancel the Start fresh dialog", async function () {
  await freshDialog(this.page).getByRole("button", { name: "Cancel", exact: true }).click();
});

When("I confirm the Start fresh dialog", async function () {
  await freshDialog(this.page).getByRole("button", { name: "Confirm", exact: true }).click();
});

When("I switch {string} off", async function (name) {
  const option = freshDialog(this.page).getByRole("switch", { name });
  if ((await option.getAttribute("aria-checked")) === "true") await option.click();
});

When("I switch {string} on", async function (name) {
  const option = freshDialog(this.page).getByRole("switch", { name });
  if ((await option.getAttribute("aria-checked")) === "false") await option.click();
});

Then("the Start fresh Confirm button should be disabled", async function () {
  await expect(
    freshDialog(this.page).getByRole("button", { name: "Confirm", exact: true }),
  ).toBeDisabled();
});

When("I add an investment of {string} on the Ledgers tab", async function (amount) {
  await this.page.getByRole("tab", { name: "Ledgers" }).click();
  const dialog = ledgersDialog(this.page);
  await dialog.getByLabel("Investment amount", { exact: true }).fill(amount);
  await dialog.getByRole("button", { name: "Add investment", exact: true }).click();
});

Then("the ledger should have no bets", async function () {
  await this.page.getByRole("tab", { name: "Sequences" }).click();
  await expect(this.page.locator(".sequence-list article")).toHaveCount(0);
});

Then("{string} should be the only ledger card", async function (title) {
  await expectLedgerCardNames(this.page, [title]);
});

async function expectLedgerCardNames(page, expected) {
  await expect
    .poll(() =>
      page.locator(".ledger-card").evaluateAll((nodes) =>
        nodes.map((node) => {
          const id = node.querySelector(".ledger-card-id")?.textContent ?? "";
          const title = node.querySelector(".ledger-card-title")?.textContent ?? "";
          return `${id} ${title}`.trim();
        }),
      ),
    )
    .toEqual(expected);
}

Then("the card {string} should show the status {string}", async function (name, status) {
  await expect(ledgerCard(this.page, name).locator(".ledger-card-status")).toHaveText(status);
});

Then("the card ids should be uppercase", async function () {
  const transforms = await this.page
    .locator(".ledger-card-id")
    .evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).textTransform));
  expect(transforms.length).toBeGreaterThan(0);
  for (const transform of transforms) expect(transform).toBe("uppercase");
});

Then("no ledger card should have an expand chevron", async function () {
  await expect(this.page.locator(".ledger-card").first()).toBeVisible();
  await expect(this.page.locator(".ledger-card-chevron")).toHaveCount(0);
});

Then(
  "the statistics of the card {string} should be in {int} columns with uppercase labels",
  async function (name, columns) {
    const stats = ledgerCard(this.page, name).locator(".closed-ledger-stats");
    await expect(stats).toBeVisible();
    const layout = await stats.evaluate((node) => ({
      columns: getComputedStyle(node).gridTemplateColumns.split(" ").length,
      label: getComputedStyle(node.querySelector("span")).textTransform,
    }));
    expect(layout.columns).toBe(columns);
    expect(layout.label).toBe("uppercase");
  },
);

Then("the card {string} should have a Delete button", async function (name) {
  await expect(
    ledgerCard(this.page, name).getByRole("button", { name: "Delete", exact: true }),
  ).toBeVisible();
});

Then("the card {string} should not have a Delete button", async function (name) {
  await expect(ledgerCard(this.page, name)).toBeVisible();
  await expect(
    ledgerCard(this.page, name).getByRole("button", { name: "Delete", exact: true }),
  ).toHaveCount(0);
});

When("I delete the card {string}", async function (name) {
  const card = ledgerCard(this.page, name);
  await card.getByRole("button", { name: "Delete", exact: true }).click();
  await card.getByRole("button", { name: "Confirm deletion", exact: true }).click();
});

When("the browser clock is set to {string}", async function (time) {
  await this.page.clock.setFixedTime(new Date(time));
});

Then("the dates of the card {string} should read {string}", async function (name, text) {
  await expect(ledgerCard(this.page, name).locator(".ledger-card-dates")).toHaveText(text);
});

When("I press Close ledger", async function () {
  await ledgersDialog(this.page).getByRole("button", { name: "Close ledger", exact: true }).click();
});

Then("the {string} button should be flat", async function (name) {
  const button = this.page.getByRole("button", { name, exact: true });
  await button.hover();
  await expect(button).toHaveCSS("box-shadow", "none");
  await expect(button).toHaveCSS("transform", "none");
});

Then("the {string} button should be shown", async function (name) {
  await expect(this.page.getByRole("button", { name, exact: true })).toBeVisible();
});

Then("the {string} button should not be shown", async function (name) {
  await expect(this.page.getByRole("button", { name, exact: true })).toHaveCount(0);
});

When("I confirm closing the ledger", async function () {
  await ledgersDialog(this.page).getByRole("button", { name: "Confirm close", exact: true }).click();
});

When("I start a ledger with no name", async function () {
  const form = ledgersDialog(this.page).locator("form.start-ledger-form");
  await form.getByRole("button", { name: "Start ledger", exact: true }).click();
});