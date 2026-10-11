# Spec: New ledger form defaults

| Field | Value |
| --- | --- |
| ID | `FB-042-new-ledger-defaults` |
| Status | Shipped |
| Created | 2026-10-11 |
| Related | Ledger lifecycle FB-031 |

## Problem

The "Start a new ledger" form is pre-filled with the previous ledger's name and every
setting. The name should be chosen on purpose, the starting balance should default to the
money that is actually available, and the goal rate and recovery weight should default to
the values the user always uses.

## Goal

Change four defaults of the new ledger form; everything else stays as it is.

## Non-goals

- Base stake, threshold, stake rounding, max stake and max open exposure keep being
  pre-filled from the previous ledger.
- The Start fresh blank ledger, the demo data and the workbook import keep their own
  defaults.
- The rule that the starting balance cannot exceed the available funds is unchanged.

## Functional requirements

- **FR-1** The **Ledger name** field MUST start empty. Starting a ledger with an empty or
  blank name MUST be refused with "Give the new ledger a name." and nothing changes.
- **FR-2** **Starting balance** MUST default to the available funds (never below zero) and
  follow them while the user has not edited the field, for example after adding an
  investment.
- **FR-3** **Goal rate (%)** MUST default to 100.
- **FR-4** **Recovery weight (%)** MUST default to 100.
- **FR-5** The defaults apply each time the form appears after closing a ledger, and when the
  app loads with no active ledger.

## Business rules

Available funds = invested + realised result - active starting balance.

Example: invested 37.92, closed ledger net +0.10, no active ledger: available 38.02, so the
form's starting balance is 38.02. After an investment of 20 it becomes 58.02.

## Acceptance scenarios

```gherkin
Scenario: The name starts empty and is mandatory
  Given a closed ledger
  Then the new ledger form has "Ledger name" empty
  When I start a ledger with no name
  Then the ledgers message reads "Give the new ledger a name."

Scenario: The starting balance defaults to the available funds
  Given a closed ledger with a result of +0.10
  Then the new ledger form has "Starting balance" set to "38.02"
  When I add an investment of 20
  Then it is "58.02"

Scenario: Goal rate and recovery weight default to 100
  Then "Goal rate (%)" and "Recovery weight (%)" are "100"

Scenario: Other settings stay pre-filled from the previous ledger
  Then "Base stake" is "0.1" and "Max stake" is "15"
```

## Edge cases

- Available funds of zero or below gives a starting balance of 0.
- Typing a starting balance stops it following the available funds.

## Data impact

None.

## Constitution check

- [x] The defaults come from a pure domain function; the funds rule is unchanged

## Open questions

None.

## Out of scope for now

Changing the defaults of Start fresh, the demo ledger, or settings of the active ledger.
