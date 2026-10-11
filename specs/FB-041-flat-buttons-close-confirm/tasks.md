# Tasks: Flat buttons and Confirm close

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Plan | [`plan.md`](./plan.md) |
| Updated | 2026-10-11 |

## 1. Scenarios

- [x] **T-001** — Flat button and Confirm close scenarios
  - Files: `e2e/features/ledgers.feature`, `e2e/steps/fairbets.steps.js`
  - Done when: they fail before the change

## 2. UI

- [x] **T-020** — Flat button CSS
  - Files: `src/App.css`
- [x] **T-021** — Confirm close replaces Close ledger
  - Files: `src/App.tsx`

## 3. Gates

- [x] **T-050** — `pnpm lint` passes
- [x] **T-051** — `pnpm build` passes
- [x] **T-052** — `pnpm test:e2e` passes
- [x] **T-053** — Each acceptance scenario confirmed
