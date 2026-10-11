# Plan: Start fresh confirmation modal

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Status | Approved |
| Updated | 2026-10-11 |

## Approach

Add one pure domain function and an in-app modal.

- `src/domain/portfolio.ts`: `clearLedgerHistory(portfolio, activeLedger)` returns a
  portfolio with no closed ledgers and a single investment equal to the active ledger's
  starting balance, recorded at `activeOpenedAt` (empty portfolio when no ledger is
  active). The "both" case reuses `migrateToPortfolio(blankLedger, now, id)`.
- `src/App.tsx`: replace the `window.confirm` in `startFresh` with state
  (`freshOpen`, `freshClearSequences`, `freshClearLedgers`). `startFresh` only opens the
  modal; `confirmStartFresh` applies the choices through `replaceTracker` and
  `commitPortfolio`. The modal reuses the `bet-modal` look and the `scope-switch`
  switch style.
- `src/App.css`: option row layout for the switches.
- `e2e/steps`: the "I start a fresh ledger" step clicks Confirm in the modal instead of
  accepting a system dialog.

## Affected modules

`src/domain/portfolio.ts`, `src/App.tsx`, `src/App.css`, `e2e/features/start-fresh.feature`,
`e2e/steps/fairbets.steps.js`, `README.md`.

## Data and migration impact

Resets `fairbets-portfolio-v1` when Clear ledgers is on. No shape change.

## Risks

- Destructive action: both options are explained in the modal and Confirm is disabled when
  nothing is selected; the default leaves ledger history untouched.
- Many scenarios use the existing step; keeping the step name avoids rewriting them.

## Rejected alternative

Checkboxes: the user pointed at the switch style used elsewhere in the app.

## Rollback

Revert the feat commit.

## Constitution check

- [x] Pure domain function; no money math in the UI
- [x] Persisted data keeps its shape
