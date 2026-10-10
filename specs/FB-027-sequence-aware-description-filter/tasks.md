# Tasks: Sequence-aware description filter

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Plan | [`plan.md`](./plan.md) |
| Updated | 2026-10-10 |

## 1. Scenarios

- [ ] **T-001** — Add acceptance scenarios and update the stale hidden-bet expectation
  - Files: `e2e/features/bets.feature`, `e2e/steps/fairbets.steps.js`
  - Done when: new scenarios fail and the updated one fails before the change
  - Verify: `pnpm test:e2e`

## 2. UI

- [ ] **T-020** — Sequence label helper and sequence-level matching showing all bets
  - Files: `src/App.tsx`
  - Done when: FR-1 to FR-4 hold
  - Verify: `pnpm lint`, `pnpm build`

## 3. Gates

- [ ] **T-050** — `pnpm lint` passes
- [ ] **T-051** — `pnpm build` passes
- [ ] **T-052** — `pnpm test:e2e` passes
- [ ] **T-053** — Each acceptance scenario confirmed

## Deferred

None.
