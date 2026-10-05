# Tasks: Filter bets by description

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Plan | [`plan.md`](./plan.md) |
| Updated | 2026-10-05 |

> Ordered, small, individually verifiable steps. Keep filtering view-only and preserve
> the existing sequence and calculation behavior.

## 1. Acceptance tests

- [x] **T-001** — Cover partial, case-insensitive search, odds formatting, and
  multi-bet sequence child filtering.
  - Files: `e2e/features/bets.feature`, `e2e/steps/fairbets.steps.js`
  - Done when: tests express the spec and fail without the UI implementation.
  - Verify: `pnpm test:e2e`

- [x] **T-002** — Cover clearing search, no-match feedback, and standalone cancelled
  record filtering.
  - Files: `e2e/features/bets.feature`, `e2e/steps/fairbets.steps.js`
  - Done when: all visible record collections respond consistently to the query.
  - Verify: `pnpm test:e2e`

## 2. UI

- [x] **T-010** — Render the search control and format descriptions with `@ <odds>`.
  - Files: `src/App.tsx`, `src/App.css`
  - Done when: every bet card shows its custom description and odds together, or just
    odds when no custom description exists.
  - Verify: E2E description-format cases

- [x] **T-020** — Filter matching sequences, child bets, and standalone cancellations.
  - Files: `src/App.tsx`
  - Done when: matching is case-insensitive and partial, empty search restores prior
    visibility, and ledger calculations remain unchanged.
  - Verify: `pnpm build`, focused E2E scenarios

## 3. Documentation and gates

- [x] **T-030** — Align spec, plan, and tasks with shipped behavior.
  - Files: `specs/FB-016-bet-description-filter/*`
  - Done when: requirements, approach, and tests match implementation.
  - Verify: review

- [x] **T-040** — `pnpm lint` passes
- [x] **T-041** — `pnpm build` passes
- [x] **T-042** — `pnpm test:e2e` passes
- [x] **T-043** — Every acceptance scenario in `spec.md` is satisfied

## Deferred

| Task | Reason | Follow-up |
| --- | --- | --- |
| Search by date, outcome, stake, or sequence | Outside this feature's scope | Separate spec if requested |
