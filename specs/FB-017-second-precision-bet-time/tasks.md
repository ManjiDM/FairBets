# Tasks: Show bet recording time with second precision

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Plan | [`plan.md`](./plan.md) |
| Updated | 2026-10-05 |

> Ordered, small, individually verifiable steps. Placement time drives calculations;
> recording time drives visible order.

## 1. Regression scenarios

- [x] **T-001** — Cover second-level placement input and recording-time display/order
  for independent bets and bet rows inside one sequence.
  - Files: `e2e/features/bets.feature`, `e2e/steps/fairbets.steps.js`
  - Done when: assertions fail before implementation and distinguish placement order
    from recording order.
  - Verify: `pnpm test:e2e`

- [x] **T-002** — Cover same-second recording precision, edit/reload stability, and
  legacy duplicate/missing recording timestamps.
  - Files: `e2e/features/bets.feature`, `e2e/steps/fairbets.steps.js`
  - Done when: timestamps are unique internally, displayed only to seconds, and
    existing records receive stable order.
  - Verify: `pnpm test:e2e`

## 2. Domain and compatibility

- [x] **T-010** — Normalize missing or duplicate recording timestamps without changing
  placement-time calculation order.
  - Files: `src/domain/ledger.ts`, `src/App.tsx`, `src/lib/cloudStore.ts`
  - Done when: recording timestamps are valid and unique before visible sorting; cloud
    ties have a deterministic source order; no schema migration is required.
  - Verify: `pnpm build`, legacy data E2E, cloud query review

## 3. UI

- [x] **T-020** — Add seconds to the editable placement-time control and show the
  recording timestamp on bet cards through seconds.
  - Files: `src/App.tsx`
  - Done when: entered placement seconds survive edit/reload and displayed bet cards
    show recording time, not placement time or milliseconds.
  - Verify: precision and display E2E cases

- [x] **T-030** — Render sequences, bet rows, and standalone cancelled cards in
  recording-time order.
  - Files: `src/App.tsx`
  - Done when: list ordering uses `createdAt` only while calculations continue to use
    `placedAt`.
  - Verify: backdated, same-second, and multi-bet E2E cases

## 4. Documentation and gates

- [x] **T-040** — Align spec, plan, and tasks with shipped behavior.
  - Files: `specs/FB-017-second-precision-bet-time/*`
  - Done when: implementation and verification match the clarified contract.
  - Verify: review

- [x] **T-050** — `pnpm lint` passes
- [x] **T-051** — `pnpm build` passes
- [x] **T-052** — `pnpm test:e2e` passes
- [x] **T-053** — Every acceptance scenario in `spec.md` is satisfied

## Deferred

| Task | Reason | Follow-up |
| --- | --- | --- |
| Workbook format changes | Not requested; keep import compatibility | Separate spec if needed |
