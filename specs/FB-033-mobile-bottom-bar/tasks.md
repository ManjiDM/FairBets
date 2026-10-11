# Tasks: Docked bottom navigation bar on mobile

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Plan | [`plan.md`](./plan.md) |
| Updated | 2026-10-11 |

## 1. Scenarios

- [x] **T-001** — Add mobile and desktop bottom bar scenarios
  - Files: `e2e/features/mobile-bottom-bar.feature`, `e2e/steps/fairbets.steps.js`
  - Done when: the mobile scenarios fail before the change
  - Verify: `pnpm test:e2e`

## 2. UI

- [x] **T-020** — Tab icons and docked bottom bar styles
  - Files: `src/App.tsx`, `src/App.css`
  - Done when: FR-1 to FR-6 hold
  - Verify: `pnpm test:e2e`

## 3. Docs

- [x] **T-040** — README
  - Files: `README.md`
  - Done when: the mobile bar is described

## 4. Gates

- [x] **T-050** — `pnpm lint` passes
- [x] **T-051** — `pnpm build` passes
- [x] **T-052** — `pnpm test:e2e` passes
- [x] **T-053** — Each acceptance scenario confirmed
