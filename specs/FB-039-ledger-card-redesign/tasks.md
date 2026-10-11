# Tasks: Ledger card redesign

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Plan | [`plan.md`](./plan.md) |
| Updated | 2026-10-11 |

## 1. Scenarios

- [x] **T-001** — Card scenarios and steps
  - Files: `e2e/features/ledgers.feature`, `e2e/steps/fairbets.steps.js`
  - Done when: the new scenarios fail before the change
  - Verify: `pnpm test:e2e`

## 2. Domain

- [x] **T-010** — `deleteClosedLedger`
  - Files: `src/domain/portfolio.ts`
  - Done when: FR-6 and FR-7 hold

## 3. UI

- [x] **T-020** — Card layout, status, figures, delete, no chevron
  - Files: `src/App.tsx`, `src/App.css`
  - Done when: FR-1 to FR-5 and FR-8 hold

## 4. Docs

- [x] **T-040** — README ledger cards
  - Files: `README.md`

## 5. Gates

- [x] **T-050** — `pnpm lint` passes
- [x] **T-051** — `pnpm build` passes
- [x] **T-052** — `pnpm test:e2e` passes
- [x] **T-053** — Each acceptance scenario confirmed
