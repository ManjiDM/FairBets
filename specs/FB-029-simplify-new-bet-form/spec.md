# Spec: Simplify the new bet form

| Field | Value |
| --- | --- |
| ID | `FB-029-simplify-new-bet-form` |
| Status | Shipped |
| Created | 2026-10-10 |
| Related | — |

## Problem

The "Add a bet" dialog asks for more than it needs. A new bet is always placed now and
always starts open, yet the form lets the person pick any date and any result. Odds and
stake are stacked on separate rows with long labels, the label field comes before the
date, and a Close button duplicates Cancel.

## Goal

A shorter, clearer "Add a bet" dialog: the placement time is recorded automatically, every
new bet starts Open, and the fields are laid out and named compactly.

## Non-goals

- No change to stake suggestion, sequence or balance calculations.
- No change to how an existing bet is edited, other than the shared field names and the
  removed Close button (see FR-8 and FR-9).
- No change to workbook import or cloud restore, which keep their recorded dates and
  results.
- Bets can still be settled afterwards with Won, Lost and Cancelled.

## Users and scenarios

**Primary user:** a person tracking their own betting sequences.

They press the add button, optionally name the bet, enter the odd, optionally a stake,
and add it. The bet is recorded as placed at that moment and starts Open. They settle it
later from its card.

## Functional requirements

- **FR-1** In the new bet dialog, "Date and time" MUST appear before "Label".
- **FR-2** In the new bet dialog, "Date and time" MUST be shown but not editable, and MUST
  display the current date and time when the dialog opens.
- **FR-3** A new bet MUST be recorded as placed at the moment it is added.
- **FR-4** A new bet MUST always be added as Open, and the dialog MUST NOT offer a Result
  choice.
- **FR-5** "Odd" and "Stake" MUST share one row, side by side, on desktop and on mobile
  widths.
- **FR-6** The field formerly named "Decimal odds" MUST be named "Odd". The field formerly
  named "Manual stake (optional)" MUST be named "Stake". The stake field keeps its
  suggested-stake placeholder and stays optional.
- **FR-7** The Close button MUST be removed; Cancel remains the way to dismiss the dialog.
- **FR-8** The same Close removal and the new names "Odd" and "Stake" MUST apply when
  editing an existing bet.
- **FR-9** When editing an existing bet, "Date and time" MUST stay editable and a Result
  choice MUST stay available, so recorded history can still be corrected.
- **FR-10** The system MUST NOT change the stake, sequence or balance rules.

## Business rules

Existing rules apply unchanged: a sequence continues through losses and open bets and
closes on the next win; an open bet is exposure; only one bet in a sequence may be open.

| Action | Expected result | Notes |
| --- | --- | --- |
| Add a bet at 17:35:21 | Bet is Open, placed 17:35:21 | time taken when added |
| Add a bet to a sequence whose last bet was lost | Open bet joins that sequence | unchanged rule |
| Open the dialog and wait, then add | Placed when added, not when opened | FR-3 |
| Edit an existing bet | Date and Result still editable | FR-9 |

## Acceptance scenarios

```gherkin
Scenario: The new bet dialog is simplified
  When I open the new bet dialog
  Then "Date and time" is listed before "Label"
  And "Date and time" is not editable
  And there is no Result field
  And there is no Close button
  And the fields are named "Odd" and "Stake"
  And "Odd" and "Stake" share a row
```

```gherkin
Scenario: Odd and Stake share a row on mobile
  Given the viewport is a small phone
  When I open the new bet dialog
  Then "Odd" and "Stake" share a row
```

```gherkin
Scenario: A new bet is added as open
  When I add a bet with odd "2.00"
  Then the bet is Open
```

```gherkin
Scenario: Editing a bet keeps date and result editable
  Given a bet exists
  When I open its edit form
  Then "Date and time" is editable
  And a Result field is available
  And there is no Close button
```

## Edge cases

- Adding to an existing sequence: same simplified dialog.
- Existing saved ledgers: unaffected; recorded dates and results are never rewritten.
- Dates created earlier than now by import or edit remain valid.

## Data impact

None. `LedgerState`, `localStorage`, the cloud schema and the workbook layout are
unchanged. New bets use the same fields as before.

## Constitution check

- [x] I. Private tracker, never an operator
- [x] II. Local-first
- [x] III. Deterministic domain logic
- [x] IV. UI and domain separated; no money math added to the UI
- [x] V. The sequence model is preserved
- [x] VI. Risk limits stay enforced
- [x] VII. Data compatibility preserved
- [x] VIII. No secrets introduced
- [x] IX. Behaviour specified in Gherkin
- [ ] X. Gates pass (verified at implementation)

## Open questions

None. Assumptions made: the read-only date, the missing Result choice and the removed
Close apply to the new bet dialog, while editing keeps its date and Result so history
stays correctable; the shared names "Odd" and "Stake" and the Close removal apply to both.
Existing scenarios that backdate a new bet by typing a date are stale: a new bet can no
longer be backdated, so they emulate the time with the browser clock.

## Out of scope for now

Removing the ability to backdate by editing; a "placed at" display that ticks live.
