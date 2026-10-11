# Spec: Bet dialog Close button and inline Add bet button

| Field | Value |
| --- | --- |
| ID | `FB-037-bet-dialog-close-and-add` |
| Status | Shipped |
| Created | 2026-10-11 |
| Related | Reverses the Close/Cancel decision of FB-029; builds on FB-036 |

## Problem

FB-029 removed the Close button and kept Cancel. The preferred design is the opposite: a
Close button at the top of the dialog and no Cancel. The Add bet button also sits in a
separate row from the Odd and Stake fields.

## Goal

The bet dialogs have a Close button in the heading and no Cancel button, and the new bet
dialog's Add bet button sits in the same row as Odd and Stake.

## Non-goals

- Any change to how a bet is saved, priced or validated.
- Any change to the Save changes button of the edit dialog.

## Functional requirements

- **FR-1** The new bet and edit dialogs MUST show a **Close** button, an icon-only
  button with the accessible name "Close", at the right of the dialog heading.
- **FR-2** Close MUST dismiss the dialog without saving, exactly as Cancel did.
- **FR-3** The dialogs MUST NOT show a Cancel button.
- **FR-4** In the new bet dialog the **Add bet** button MUST be in the same row as the Odd
  and Stake fields, to their right, on desktop and mobile. The row MUST NOT overflow.
- **FR-5** The edit dialog keeps **Save changes** in the dialog's action row.

## Business rules

None. Presentation only.

## Acceptance scenarios

```gherkin
Scenario: The bet dialog has a Close button and no Cancel
  When I press the Add Bet button
  Then the bet dialog should have a "Close" button
  And the bet dialog should not have a "Cancel" button

Scenario: Close dismisses the dialog
  When I press the Add Bet button
  And I close the bet dialog
  Then the new bet dialog is closed

Scenario: Add bet shares the row with Odd and Stake
  When I press the Add Bet button
  Then the "Odd", "Stake" fields and the "Add bet" button should share a row in the bet dialog
```

## Edge cases

- Mobile: Odd, Stake and the Add bet icon button fit in one row at 390px.

## Data impact

None.

## Constitution check

- [x] No domain, persistence or cloud change

## Open questions

None. Close is an X icon button, matching the app's icon-only buttons.

## Out of scope for now

Confirmation when closing a half-filled form.
