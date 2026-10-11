# Plan: Ledger card redesign

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Status | Approved |
| Updated | 2026-10-11 |

## Approach

- `src/domain/portfolio.ts`: add `deleteClosedLedger(portfolio, ledgerId,
  activeStartingBalance): PortfolioResult`. It fails when the ledger is not a closed ledger,
  or when `fundsOverview` of the result would have negative available funds.
- `src/App.tsx`: restructure the ledger card into a header button (id and status, name and
  dates, Net result and Profit figures) with a sibling `InlineDeleteAction` for closed
  ledgers; remove the chevron. `confirmDeleteLedger` calls the domain function and
  `commitPortfolio`, or shows the error in the ledgers message. Pending deletion reuses
  `pendingDeleteKey` with a `ledger:<id>` key.
- `src/App.css`: reuse the sequence card look (green id label, status badge, uppercase
  small metric labels, positive and negative colours); two-column stats grid with
  uppercase green labels and no boxes.
- `e2e`: the card title steps read the id and name, new steps for status, chevron,
  delete, and layout.

## Affected modules

`src/domain/portfolio.ts`, `src/App.tsx`, `src/App.css`, `e2e/features/ledgers.feature`,
`e2e/steps/fairbets.steps.js`, `README.md`.

## Data and migration impact

Removes entries from `closedLedgers`; no shape change.

## Risks

- Ledger numbers are derived from order, so they shift after a delete (accepted, in spec).
- A delete button inside the header button would be invalid markup; it is a sibling.

## Rejected alternative

Storing a stable ledger number: needs a persisted shape change for little value.

## Rollback

Revert the feat commit.

## Constitution check

- [x] Pure domain function; no money math in the UI
- [x] Persisted data keeps its shape
