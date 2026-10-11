# Plan: Ledger card dates

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Status | Approved |
| Updated | 2026-10-11 |

## Approach

- `src/domain/portfolio.ts`: add `firstBetAt: string | null` to `LedgerCard`, filled by a
  pure helper that returns the earliest `createdAt ?? placedAt` of the ledger's bets.
- `src/App.tsx`: the card date line (`.ledger-card-dates`) is built from `firstBetAt` and
  `closedAt` per FR-1 to FR-3.
- `e2e`: a step that fixes the browser clock, and scenarios for the three cases.

## Affected modules

`src/domain/portfolio.ts`, `src/App.tsx`, `e2e/features/ledgers.feature`,
`e2e/steps/fairbets.steps.js`, `README.md`.

## Data and migration impact

None.

## Risks

Legacy bets without `createdAt` fall back to placement time.

## Rejected alternative

Storing a first-bet date on the closed ledger: duplicates derivable data.

## Rollback

Revert the feat commit.

## Constitution check

- [x] Pure domain logic; no stored-shape change
