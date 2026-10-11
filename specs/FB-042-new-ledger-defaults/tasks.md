# Tasks: New ledger form defaults

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Plan | [`plan.md`](./plan.md) |
| Updated | 2026-10-11 |

## 1. Scenarios

- [x] **T-001** — Default scenarios and steps
  - Files: `e2e/features/ledgers.feature`, `e2e/steps/fairbets.steps.js`
  - Done when: they fail before the change

## 2. Domain

- [x] **T-010** — `newLedgerDefaults`
  - Files: `src/domain/portfolio.ts`

## 3. UI

- [x] **T-020** — Empty name, funds-following balance, 100 and 100
  - Files: `src/App.tsx`

## 4. Docs

- [x] **T-040** — README
  - Files: `README.md`

## 5. Gates

- [x] **T-050** — `pnpm lint` passes
- [x] **T-051** — `pnpm build` passes
- [x] **T-052** — `pnpm test:e2e` passes
- [x] **T-053** — Each acceptance scenario confirmed
