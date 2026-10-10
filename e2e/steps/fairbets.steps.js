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
  await this.page.clock.install({ time: new Date(dateTime) });
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
    await this.page.getByLabel("Decimal odds").fill(odds);
    await this.page.getByLabel("Manual stake (optional)").fill(stake);
    await this.page.getByRole("button", { name: "Add bet", exact: true }).last().click();
    await expect(this.page.getByRole("dialog")).toHaveCount(0);
  },
);

When(
  "I add a bet labeled {string} with odds {string} and a manual stake of {string} placed at {string}",
  async function (label, odds, stake, placedAt) {
    await this.page.getByRole("button", { name: "Add bet", exact: true }).click();
    await this.page.getByLabel("Label").fill(label);
    await this.page.getByLabel("Date and time").fill(placedAt);
    await this.page.getByLabel("Decimal odds").fill(odds);
    await this.page.getByLabel("Manual stake (optional)").fill(stake);
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
  await this.page.getByRole("button", { name: "Add bet", exact: true }).click();
  await this.page.getByLabel("Label").fill(label);
  await this.page.getByLabel("Decimal odds").fill(odds);
  await this.page.getByRole("button", { name: "Add bet", exact: true }).last().click();
});

When("I prepare a bet labeled {string} with odds {string}", async function (label, odds) {
  await this.page.getByRole("button", { name: "Add bet", exact: true }).click();
  await this.page.getByLabel("Label").fill(label);
  await this.page.getByLabel("Decimal odds").fill(odds);
});

When(
  "I prepare a bet labeled {string} with odds {string} placed at {string}",
  async function (label, odds, placedAt) {
    await this.page.getByRole("button", { name: "Add bet", exact: true }).click();
    await this.page.getByLabel("Label").fill(label);
    await this.page.getByLabel("Date and time").fill(placedAt);
    await this.page.getByLabel("Decimal odds").fill(odds);
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
  await this.page.getByLabel("Date and time").fill(dateTime);
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
  await this.page.getByLabel("Decimal odds").fill(odds);
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
  const confirmation = this.page.waitForEvent("dialog").then((dialog) => dialog.accept());
  await this.page.getByRole("button", { name: "Start fresh" }).click();
  await confirmation;
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
  await expect(this.page.locator(".suggestion-preview strong").first()).toHaveText(stake);
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

When("I update the odds for {string} to {string}", async function (label, odds) {
  await openBetEditor(this.page, label);
  await this.page.getByLabel("Decimal odds").fill(odds);
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
