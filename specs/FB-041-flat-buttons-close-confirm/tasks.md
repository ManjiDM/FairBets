# Tasks: Flat buttons and Confirm close

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Plan | [`plan.md`](./plan.md) |
| Updated | 2026-10-11 |

## 1. Scenarios

- [ ] **T-001** — Flat button and Confirm close scenarios
  - Files: `e2e/features/ledgers.feature`, `e2e/steps/fairbets.steps.js`
  - Done when: they fail before the change

## 2. UI

- [ ] **T-020** — Flat button CSS
  - Files: `src/App.css`
- [ ] **T-021** — Confirm close replaces Close ledger
  - Files: `src/App.tsx`

## 3. Gates

- [ ] **T-050** — `pnpm lint` passes
- [ ] **T-051** — `pnpm build` passes
- [ ] **T-052** — `pnpm test:e2e` passes
- [ ] **T-053** — Each acceptance scenario confirmed
