# Tasks: Ledger lifecycle with investments and closing statistics

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Plan | [`plan.md`](./plan.md) |
| Updated | 2026-10-10 |

## 1. Scenarios

- [x] **T-001** — Add `ledgers.feature` and its steps
  - Files: `e2e/features/ledgers.feature`, `e2e/steps/fairbets.steps.js`
  - Done when: the new scenarios fail before the change
  - Verify: `pnpm test:e2e`

## 2. Domain

- [x] **T-010** — Portfolio module with funds, close, start, invest, history, migration
  - Files: `src/domain/portfolio.ts`
  - Done when: FR-2, FR-4 to FR-10 hold as pure functions
  - Verify: `pnpm build`

## 3. UI

- [x] **T-020** — Portfolio state, persistence and migration
  - Files: `src/App.tsx`
  - Done when: FR-10 holds
- [x] **T-021** — Ledgers dialog and no-active-ledger state
  - Files: `src/App.tsx`, `src/App.css`
  - Done when: FR-1, FR-3, FR-5 to FR-9, FR-12 and FR-13 hold
  - Verify: `pnpm lint`, `pnpm build`

## 4. Docs

- [x] **T-040** — Document ledgers and funds in the README
  - Files: `README.md`

## 5. Gates

- [x] **T-050** — `pnpm lint` passes
- [x] **T-051** — `pnpm build` passes
- [x] **T-052** — `pnpm test:e2e` passes
- [x] **T-053** — Each acceptance scenario confirmed

## Deferred

- Cloud backup of the ledger history.
