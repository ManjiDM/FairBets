# Bugfix: Use icons for bet and sequence card actions

| Field | Value |
| --- | --- |
| ID | `FB-022-fix-bet-sequence-action-icons` |
| Status | Verified |
| Severity | Cosmetic |
| Created | 2026-10-10 |
| Related | [FB-019](../FB-019-consistent-icon-library/spec.md) |

## Observed behaviour

The bet and sequence cards still render their Edit and Delete actions as text buttons.
After requesting deletion, the inline confirmation is also a text button labelled
"Confirm deletion". This leaves prominent card actions inconsistent with the Lucide
icon design used by other bet and sequence actions.

## Expected behaviour

Edit, Delete, and Confirm deletion controls on bet and sequence cards use recognizable
icons from the existing icon set, with descriptive accessible names and pointer tooltips.
Their current click behavior, confirmation flow, and destructive-action styling remain
unchanged.

FB-019 established the consistent-icon direction but explicitly deferred Edit and Delete
text actions. This follow-up corrects that omission for the card actions highlighted by
the user. Bet-form controls such as Cancel and Save changes are not part of this fix.

## Reproduction

1. Open the Sequences view with a ledger containing a bet.
2. Inspect its bet and sequence card actions.
3. Request deletion.

Observed: Edit, Delete, and Confirm deletion render visible text without a decorative
icon. The same text actions appear on active and collapsed sequence cards, nested bet
rows, and standalone cancelled-bet cards.

Expected: each card-level Edit/Delete action is represented by an icon; pending deletion
uses a confirmation icon. Assistive technology and pointer users still receive the
descriptive action name.

## Arithmetic check

Not applicable; this presentation-only defect does not affect financial calculations.

## Root cause

`FB-019`'s implementation replaced selected custom SVGs with a shared icon library but
left Edit and Delete controls as explicit non-goals. The follow-up user request makes
those card-level actions part of the desired icon consistency.

- **Introduced by:** Scope decision in `FB-019-consistent-icon-library`.
- **Why tests missed it:** Existing icon tests cover Add, Won, Lost, Cancelled, and Close
  Sequence, but do not assert that Edit/Delete/Confirm deletion controls are icon-only.

## Blast radius

- Other calculations sharing this code path: none; presentation only.
- Already-persisted ledgers: none; no data or calculations are affected.
- Stored-data correction or migration: none.
- Cloud copies: none; no persisted values change.
- Action behavior: deletion still requires its existing inline confirmation and clicking
  outside the confirmation still dismisses it.

## Regression scenario

These scenarios must fail before the fix because the affected controls contain visible
text and no decorative SVG:

```gherkin
Scenario: Bet and sequence card actions use accessible icons
  Given a bet and its sequence are displayed
  Then Edit and Delete on the cards are icon-only buttons with descriptive names
  When I request deletion of a bet
  Then Confirm deletion is an icon-only button with a descriptive name
```

```gherkin
Scenario: Card deletion confirmation remains cancellable outside its button
  Given deletion confirmation is displayed for a bet
  When I click outside the confirmation button
  Then the normal Delete icon is shown again
  And the bet remains in the ledger
```

Where it lands:

- [x] `e2e/features/bets.feature` — automatable through the UI
- [ ] Not automatable

## Fix

Use shared Lucide icons for card-level Edit, Delete, and Confirm deletion buttons.
Retain accessible labels, tooltips, current action handlers, and joined-control styling.

## Constitution check

- [x] III. Domain logic stays pure and deterministic
- [x] IV. No money math moved into the UI to make the fix easier
- [x] V. Sequence model preserved
- [x] VI. Risk limits still enforced
- [x] VII. Existing saved ledgers still load and compute correctly

## Verification

- [x] Regression scenarios failed before the fix (evidence recorded below)
- [x] Regression scenarios pass after the fix
- [x] `pnpm lint`
- [x] `pnpm build`
- [x] `pnpm test:e2e`
- [x] A pre-existing saved ledger still loads with correct figures

**Evidence of the red state:**

````text
Before the fix, the icon assertion failed on the card's Edit button:

```text
Expected: 1 decorative SVG inside Edit
Received: 0

61 of 62 scenarios passed; the new card-action icon scenario failed.
```

After the fix, card Edit, Delete, Confirm deletion, and sequence Delete controls use
decorative Lucide icons while retaining their accessible names and titles. Clicking
Delete in a collapsed sequence leaves it collapsed, and clicking outside pending
confirmation cancels without deleting the bet.

```text
62 scenarios (62 passed)
793 steps (793 passed)
pnpm lint: passed
pnpm build: passed
```

The full suite also passed the existing persistence scenarios, confirming saved ledger
data still loads and remains unchanged.
````
