# Plan: New ledger form defaults

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Status | Approved |
| Updated | 2026-10-11 |

## Approach

- `src/domain/portfolio.ts`: add `newLedgerDefaults(previous, availableFunds)` returning the
  previous settings with `goalRate` 1, `recoveryWeight` 1 and `startingBalance`
  `max(availableFunds, 0)` rounded to cents.
- `src/App.tsx`: the name state starts as an empty string and is reset to empty after a
  close. The form settings use `newLedgerDefaults` on load and after a close. A
  `newLedgerBalanceEdited` flag lets an effect keep the starting balance equal to the
  available funds until the user types in the field.

## Affected modules

`src/domain/portfolio.ts`, `src/App.tsx`, `e2e/features/ledgers.feature`,
`e2e/steps/fairbets.steps.js`, `README.md`.

## Data and migration impact

None.

## Risks

The existing scenario that starts a ledger after a close relies on typing the balance;
the step already fills it, so it keeps working.

## Rollback

Revert the feat commit.

## Constitution check

- [x] Pure domain function; funds rule unchanged
