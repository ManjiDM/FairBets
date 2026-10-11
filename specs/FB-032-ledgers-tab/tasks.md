# Tasks: Ledgers tab with expandable ledger cards

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Plan | [`plan.md`](./plan.md) |
| Updated | 2026-10-11 |

## 1. Scenarios

- [x] **T-001** — Move ledger steps to the tab and add tab and card scenarios
  - Files: `e2e/features/ledgers.feature`, `e2e/steps/fairbets.steps.js`
  - Done when: new and renamed scenarios fail before the change
  - Verify: `pnpm test:e2e`

## 2. Domain

- [x] **T-010** — `ledgerCards` and `profitPercent`
  - Files: `src/domain/portfolio.ts`
  - Done when: FR-4, FR-5 and FR-7 hold
  - Verify: `pnpm build`

## 3. UI

- [x] **T-020** — Tabs, Ledgers page and cards; remove the dialog and toolbar button
  - Files: `src/App.tsx`, `src/App.css`
  - Done when: FR-1 to FR-3, FR-6, FR-8 to FR-10 hold
  - Verify: `pnpm lint`, `pnpm build`

## 4. Docs

- [x] **T-040** — README
  - Files: `README.md`

## 5. Gates

- [x] **T-050** — `pnpm lint` passes
- [x] **T-051** — `pnpm build` passes
- [x] **T-052** — `pnpm test:e2e` passes
- [x] **T-053** — Each acceptance scenario confirmed

## Deferred

None.
