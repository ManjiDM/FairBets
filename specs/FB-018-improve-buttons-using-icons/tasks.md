# Tasks: Improve buttons using icons

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Plan | [`plan.md`](./plan.md) |
| Updated | 2026-10-05 |

> Ordered, small, individually verifiable steps. Keep actions accessible and preserve
> their existing behavior.

## 1. Acceptance tests

- [x] **T-001** — Cover icon-only bet and toolbar Add Bet controls with accessible names.
  - Files: `e2e/features/bets.feature`, `e2e/steps/fairbets.steps.js`
  - Done when: tests assert the icon-only presentation and accessible names.
  - Verify: `pnpm test:e2e`

- [x] **T-002** — Cover icon-only close/continue sequence controls and remove View.
  - Files: `e2e/features/bets.feature`, `e2e/steps/fairbets.steps.js`
  - Done when: tests verify summary toggle behavior and no redundant View control.
  - Verify: `pnpm test:e2e`

## 2. UI

- [x] **T-010** — Render icon-only action buttons with names and tooltips.
  - Files: `src/App.tsx`, `src/App.css`
  - Done when: named actions have decorative SVGs, no visible action text, preserved
    accessible names, and visible keyboard focus.
  - Verify: E2E icon assertions

- [x] **T-020** — Remove the redundant View control.
  - Files: `src/App.tsx`, `src/App.css`
  - Done when: clicking the sequence summary expands/collapses details and nested
    controls remain functional.
  - Verify: sequence disclosure E2E

## 3. Documentation and gates

- [x] **T-030** — Align spec, plan, and tasks with shipped behavior.
  - Files: `specs/FB-018-improve-buttons-using-icons/*`
  - Done when: requirements, approach, and tests match implementation.
  - Verify: review

- [x] **T-040** — `pnpm lint` passes
- [x] **T-041** — `pnpm build` passes
- [x] **T-042** — `pnpm test:e2e` passes
- [x] **T-043** — Every acceptance scenario in `spec.md` is satisfied

## Deferred

| Task | Reason | Follow-up |
| --- | --- | --- |
| Replacing other text buttons | Outside this request | Separate spec if needed |
