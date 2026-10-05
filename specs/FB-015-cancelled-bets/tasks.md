# Tasks: Record cancelled bets

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Plan | [`plan.md`](./plan.md) |
| Updated | 2026-10-05 |

> Ordered steps preserve auditability: first make regressions fail, then update
> calculation and persistence, then UI and validation.

## 1. Regression scenarios

- [ ] **T-001** — Cover open, standalone, and sequence cancellation with unchanged
  money values and continuation.
  - Files: `e2e/features/bets.feature`, `e2e/steps/fairbets.steps.js`
  - Done when: new behavior assertions fail before implementation.
  - Verify: `pnpm test:e2e`

- [ ] **T-002** — Cover correcting prior losses/wins to Cancelled, recalculated
  sequence status, and persistence after reload.
  - Files: `e2e/features/bets.feature`, `e2e/features/bet-strategy.feature`
  - Done when: corrected outcomes produce the specified settled and expected totals.
  - Verify: `pnpm test:e2e`

## 2. Domain and cloud data

- [ ] **T-010** — Add neutral cancellation math, standalone cancellation reporting,
  and status recalculation.
  - Files: `src/domain/ledger.ts`
  - Done when: cancelled outcomes do not count toward P&L, expected profit, exposure,
    recovery progress, or sequence counts when standalone.
  - Verify: `pnpm build`, E2E regressions

- [ ] **T-020** — Persist the new cloud outcome.
  - Files: `src/lib/cloudStore.ts`, `supabase/schema.sql`,
    `supabase/migrations/0008_cancelled_bet_outcome.sql`
  - Done when: parser accepts Cancelled and database constraint permits it.
  - Verify: `pnpm build`, migration review

## 3. UI and compatibility

- [ ] **T-030** — Add Cancelled actions/status and allow correcting any prior outcome.
  - Files: `src/App.tsx`
  - Done when: open and previously settled bets can be marked Cancelled, and a
    cancelled result can be changed back to Won/Lost.
  - Verify: E2E result-correction cases

- [ ] **T-040** — Render standalone cancelled records outside sequence counts and let
  cancelled sequence tails continue via +.
  - Files: `src/App.tsx`
  - Done when: all-cancelled groups are visible but not counted as sequences; mixed
    sequences retain their cancellation history.
  - Verify: E2E history and continuation cases

## 4. Documentation and gates

- [ ] **T-050** — Align spec, plan, and tasks with implementation.
  - Files: `specs/FB-015-cancelled-bets/*`
  - Done when: behavior and persistence match the shipped code.
  - Verify: review

- [ ] **T-060** — `pnpm lint` passes
- [ ] **T-061** — `pnpm build` passes
- [ ] **T-062** — `pnpm test:e2e` passes
- [ ] **T-063** — Every acceptance scenario in `spec.md` is satisfied

## Deferred

| Task | Reason | Follow-up |
| --- | --- | --- |
| Live cloud round-trip | Requires authenticated Supabase configuration | Verify when available |
