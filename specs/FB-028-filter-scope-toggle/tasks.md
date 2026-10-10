# Tasks: Filter scope toggle

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Plan | [`plan.md`](./plan.md) |
| Updated | 2026-10-10 |

## 1. Scenarios

- [x] **T-001** — Add acceptance scenarios and steps
  - Files: `e2e/features/bets.feature`, `e2e/steps/fairbets.steps.js`
  - Done when: scenarios fail before the change
  - Verify: `pnpm test:e2e`

## 2. UI

- [x] **T-020** — Switch state, markup, styling and scope-aware bet visibility
  - Files: `src/App.tsx`, `src/App.css`
  - Done when: FR-1 to FR-7 hold
  - Verify: `pnpm lint`, `pnpm build`

## 3. Gates

- [x] **T-050** — `pnpm lint` passes
- [x] **T-051** — `pnpm build` passes
- [x] **T-052** — `pnpm test:e2e` passes
- [x] **T-053** — Each acceptance scenario confirmed

## Deferred

None.
