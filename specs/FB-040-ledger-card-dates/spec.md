# Spec: Ledger card dates from the first bet and the close

| Field | Value |
| --- | --- |
| ID | `FB-040-ledger-card-dates` |
| Status | Shipped |
| Created | 2026-10-11 |
| Related | Ledger cards FB-032 and FB-039 |

## Problem

A ledger card shows when the ledger was opened. The dates that matter to the user are when
the ledger's first bet was created and when the ledger was closed; the opening time stays
stored and in the history but is not what the card should lead with.

## Goal

The card's date line runs from the creation of the ledger's first bet to the closing of the
ledger.

## Non-goals

- The stored opening time, the history entries and the card order are unchanged.
- No new persisted field.

## Functional requirements

- **FR-1** A closed ledger's card MUST show "<first bet created> to <closed>". The first
  bet is the ledger's earliest bet by creation time (placement time when a legacy bet has
  no creation time).
- **FR-2** The active ledger's card MUST show "Started <first bet created>".
- **FR-3** With no bets, the active ledger's card MUST read "No bets yet" and a closed
  ledger's card MUST read "No bets recorded".
- **FR-4** Dates use the existing short format ("13 Oct 2026, 09:30").

## Business rules

No money rule changes.

## Acceptance scenarios

```gherkin
Scenario: A closed ledger runs from its first bet to its closing
  Given a ledger whose first bet is created on 13 Oct 2026 at 09:30
  When it is closed on 14 Oct 2026 at 18:45
  Then its card reads "13 Oct 2026, 09:30 to 14 Oct 2026, 18:45"

Scenario: The active ledger shows when its first bet was created
  Then its card reads "Started 13 Oct 2026, 09:30"

Scenario: A ledger without bets has no first-bet date
  Then the active card reads "No bets yet"
  And after closing, the closed card reads "No bets recorded"
```

## Edge cases

- Editing a bet's placement time does not change its creation time, so the card date stays.
- Deleting the first bet moves the start to the next earliest bet.

## Data impact

None; derived from the bets already stored.

## Constitution check

- [x] The date derivation is a pure domain function
- [x] Persisted data unchanged

## Open questions

None.

## Out of scope for now

Showing the opening time on the expanded card.
