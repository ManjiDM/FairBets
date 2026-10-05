# Tasks: Add seconds to bet placement time

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Plan | [`plan.md`](./plan.md) |
| Updated | 2026-10-05 |

> Ordered, small, individually verifiable steps. Keep placement timestamps as the sole
> chronological sort key and recording timestamps as sequence-card display ordering.

## 1. Regression scenarios

- [ ] **T-001** — Cover second-level ordering, exact-second collision allocation, and
  displayed seconds.
  - Files: `e2e/features/bets.feature`, `e2e/steps/fairbets.steps.js`
  - Done when: the scenarios fail before implementation and assert timestamp-only
    order with distinct millisecond values for same-second entries.
  - Verify: `pnpm test:e2e`

- [ ] **T-002** — Cover edit/reload precision, legacy collision normalization, and
  unchanged FB-013 recording order.
  - Files: `e2e/features/bets.feature`, `e2e/steps/fairbets.steps.js`
  - Done when: existing same-second data is stable and editing does not erase its
    assigned milliseconds.
  - Verify: `pnpm test:e2e`

## 2. Domain ordering

- [ ] **T-010** — Normalize duplicate placement timestamps deterministically and add
  unique millisecond allocation for a new/changed visible second.
  - Files: `src/domain/ledger.ts`
  - Done when: normalized timestamps are unique, deterministic, and stay in the entered
    second; bet comparison uses only timestamp.
  - Verify: `pnpm build`, targeted E2E

## 3. UI and compatibility

- [ ] **T-020** — Add seconds to placement-time input and display while preserving
  milliseconds on unchanged edits.
  - Files: `src/App.tsx`
  - Done when: new, edited, and loaded records preserve seconds and hidden milliseconds.
  - Verify: E2E input/edit/reload scenarios

- [ ] **T-030** — Normalize local/cloud/imported legacy timestamps before calculating.
  - Files: `src/App.tsx`, `src/lib/cloudStore.ts`, `src/domain/ledger.ts`
  - Done when: legacy duplicates are stable and cloud results have deterministic source
  order before normalization; no schema migration is needed.
  - Verify: E2E legacy fixture and cloud-query review

## 4. Documentation and gates

- [ ] **T-040** — Align spec, plan, and tasks with implemented behavior.
  - Files: `specs/FB-017-second-precision-bet-time/*`
  - Done when: shipped timestamp semantics and verification are recorded.
  - Verify: review

- [ ] **T-050** — `pnpm lint` passes
- [ ] **T-051** — `pnpm build` passes
- [ ] **T-052** — `pnpm test:e2e` passes
- [ ] **T-053** — Every acceptance scenario in `spec.md` is satisfied

## Deferred

| Task | Reason | Follow-up |
| --- | --- | --- |
| Workbook layout changes | User asked to keep workbook compatibility | Preserve source precision through existing import |
