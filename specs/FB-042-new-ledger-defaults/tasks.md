# Tasks: New ledger form defaults

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Plan | [`plan.md`](./plan.md) |
| Updated | 2026-10-11 |

## 1. Scenarios

- [ ] **T-001** — Default scenarios and steps
  - Files: `e2e/features/ledgers.feature`, `e2e/steps/fairbets.steps.js`
  - Done when: they fail before the change

## 2. Domain

- [ ] **T-010** — `newLedgerDefaults`
  - Files: `src/domain/portfolio.ts`

## 3. UI

- [ ] **T-020** — Empty name, funds-following balance, 100 and 100
  - Files: `src/App.tsx`

## 4. Docs

- [ ] **T-040** — README
  - Files: `README.md`

## 5. Gates

- [ ] **T-050** — `pnpm lint` passes
- [ ] **T-051** — `pnpm build` passes
- [ ] **T-052** — `pnpm test:e2e` passes
- [ ] **T-053** — Each acceptance scenario confirmed
