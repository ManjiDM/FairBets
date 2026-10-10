# Tasks: Simplify the new bet form

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Plan | [`plan.md`](./plan.md) |
| Updated | 2026-10-10 |

## 1. Scenarios

- [x] **T-001** — Add scenarios, rename step labels, emulate new-bet dates with the clock
  - Files: `e2e/features/bets.feature`, `e2e/steps/fairbets.steps.js`
  - Done when: new scenarios and label-dependent scenarios fail before the change
  - Verify: `pnpm test:e2e`

## 2. UI

- [x] **T-020** — Reorder, read-only date, no Result or Close in new mode, new names, row
  - Files: `src/App.tsx`, `src/App.css`
  - Done when: FR-1 to FR-10 hold
  - Verify: `pnpm lint`, `pnpm build`

## 3. Gates

- [x] **T-050** — `pnpm lint` passes
- [x] **T-051** — `pnpm build` passes
- [x] **T-052** — `pnpm test:e2e` passes
- [x] **T-053** — Each acceptance scenario confirmed

## Deferred

None.
