# Spec: Ledger card redesign with id, status and delete

| Field | Value |
| --- | --- |
| ID | `FB-039-ledger-card-redesign` |
| Status | Clarified |
| Created | 2026-10-11 |
| Related | Ledger cards from FB-032 and FB-035; Start fresh modal FB-038 |

## Problem

Ledger cards stack the title, net result and profit as plain lines with a chevron. They
look different from the sequence cards, the ledger number is buried in the title, there
is no open or closed indication, and a ledger cannot be deleted.

## Goal

Ledger cards look like sequence cards: an id label with a status below it, the name and
dates, the net result and profit as figures, and a delete button. The expanded stats use
the two-column label and value layout of the settings "recorded" values.

## Non-goals

- No change to how ledgers are opened, closed or numbered by opening order.
- No deleting of the active ledger, and no change to the cloud payload.

## Functional requirements

- **FR-1** Each card MUST show an id label in the style of the bet and sequence id (small
  uppercase green text), for example "LEDGER 2", with the status below it: "Open" for the
  active ledger and "Closed" for a closed ledger, as a status badge.
- **FR-2** Next to the id the card MUST show the ledger name in bold and, below it, the
  opening and closing time ("10 Oct, 17:48 to 11 Oct, 09:10") or "Opened 10 Oct, 17:48"
  for the active ledger.
- **FR-3** On the right the card MUST show two figures in the Stake / P&L style: a small
  uppercase label above a bold value, **Net result** and **Profit**. Positive values are
  green and negative values red.
- **FR-4** The chevron MUST be removed. Clicking the card (not the delete button) still
  expands and collapses it.
- **FR-5** Closed ledger cards MUST have a Delete icon button on the far right. It uses the
  same two-step inline confirmation as sequences (Delete, then Confirm deletion; a click
  elsewhere dismisses it). The active ledger's card has no delete button.
- **FR-6** Confirming deletion removes the closed ledger from the list. Its net result
  leaves the realised result and available funds; investments are not changed. The
  remaining ledgers keep their opening order, so the numbers after it move up by one.
  Its opened and closed history entries disappear with it.
- **FR-7** A deletion MUST be refused, with a message, when it would make the available
  funds negative (its profit is committed to the active ledger's starting balance).
  Nothing changes in that case.
- **FR-8** The expanded statistics MUST be shown in two columns, in every viewport, each
  with an uppercase green label above a bold value, no boxes around them.

## Business rules

Realised result is the sum of the closed ledgers' net results. Available funds =
invested + realised - the active ledger's starting balance.

Example: invested 57.92, closed ledger 1 net +0.10, active starting balance 37.92:
available 20.10. Deleting ledger 1: realised 0.00, available 20.00, allowed. If the active
starting balance were 58.02 (using the 0.10 profit), available would be 0.00 and deleting
would give -0.10, so it is refused.

## Acceptance scenarios

```gherkin
Scenario: A card shows its id and status
  Given a closed ledger and an active ledger
  Then the card "Ledger 1" shows the status "Closed"
  And the card "Ledger 2" shows the status "Open"

Scenario: The chevron is gone
  Then no ledger card has an expand chevron

Scenario: Clicking the card still expands it
  When I click the card "Ledger 1"
  Then the card "Ledger 1" is expanded

Scenario: Expanded statistics use two columns with uppercase labels
  When I expand the card "Ledger 1"
  Then its statistics are laid out in 2 columns with uppercase labels

Scenario: Only closed ledgers can be deleted
  Then the card "Ledger 1" has a Delete button
  And the card "Ledger 2" has no Delete button

Scenario: Deleting a closed ledger removes its result
  When I delete the card "Ledger 1"
  Then no ledger card "Ledger 1" is listed
  And the "Realised result" figure is "€0.00"

Scenario: Deleting is refused when the funds are committed
  When the active ledger uses the closed ledger's profit and I delete the card "Ledger 1"
  Then the ledgers message says the ledger cannot be deleted
  And the card "Ledger 1" is still listed
```

## Edge cases

- Pending deletion is dismissed by clicking anywhere else.
- Deleting the only closed ledger leaves just the active card.
- With no active ledger, the only checks are the funds rule and existence.

## Data impact

Deleting edits `closedLedgers` in `fairbets-portfolio-v1`. No shape change.

## Constitution check

- [x] The delete rule is a pure domain function; the UI does no money math
- [x] Open bets are untouched; only closed ledgers can be removed

## Open questions

None. Decisions taken: only closed ledgers are deletable; the refusal rule is
available funds never negative; numbers are derived, so they close up after a delete;
the status word for the active ledger is "Open".

## Out of scope for now

Undo; stable ledger numbers after deletion; deleting the active ledger.
