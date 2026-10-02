# Tasks: Add bets to parallel sequences

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Plan | [`plan.md`](./plan.md) |
| Updated | 2026-10-02 |

> Ordered, small, individually verifiable steps. Domain logic first, then UI, then
> scenarios, then docs. Tick each box as it lands. If the order turns out to be wrong,
> update this file rather than improvising silently.

## 1. Domain

- [ ] **T-001** — Calculate independent sequences using stable membership IDs, with
  legacy chronological grouping for records without IDs.
  - Files: `src/domain/ledger.ts`
  - Done when: parallel active sequences each have independent status/recovery and a
    win closes only its own sequence; aggregates still include all bets.
  - Verify: `pnpm build`, targeted E2E

## 2. Persistence and migration

- [ ] **T-010** — Validate, load, and save optional sequence membership locally and in
  cloud records.
  - Files: `src/App.tsx`, `src/lib/cloudStore.ts`
  - Done when: old null/missing IDs load with legacy grouping; new IDs round-trip.
  - Verify: `pnpm build`, E2E reload assertions

- [ ] **T-011** — Add nullable cloud sequence ID and migration.
  - Files: `supabase/schema.sql`, `supabase/migrations/0005_bet_sequence_id.sql`
  - Done when: fresh and existing databases accept optional sequence membership.
  - Verify: schema/migration review

## 3. UI

- [ ] **T-020** — Keep standalone Add bet enabled and make it start a new sequence.
  - Files: `src/App.tsx`
  - Done when: another open sequence does not disable standalone entry.
  - Verify: E2E parallel sequence scenario

- [ ] **T-021** — Add accessible plus-icon controls to eligible lost sequences.
  - Files: `src/App.tsx`, `src/App.css`
  - Done when: control appears only for a latest loss and opens the form for that
    specific sequence; open/won latest outcomes show no control.
  - Verify: E2E visibility and targeting scenarios

- [ ] **T-022** — Route recovery suggestions and new-sequence recovery snapshots by
  form target.
  - Files: `src/App.tsx`
  - Done when: continuation uses selected sequence recovery and independent bet uses
    FB-009 new-sequence recovery.
  - Verify: E2E suggested and placed-stake assertions

## 4. Scenarios

- [ ] **T-030** — Replace the global-open prohibition and cover independent parallel
  bets, losses, wins, and membership after reload.
  - Files: `e2e/features/bets.feature`, `e2e/features/bet-strategy.feature`,
    `e2e/steps/fairbets.steps.js`
  - Done when: all FB-010 acceptance scenarios are represented and green.
  - Verify: `pnpm test:e2e`

## 5. Documentation

- [ ] **T-040** — Mark the spec verified and keep plan/tasks aligned to shipped behavior.
  - Files: `specs/FB-010-parallel-sequences/spec.md`,
    `specs/FB-010-parallel-sequences/plan.md`,
    `specs/FB-010-parallel-sequences/tasks.md`
  - Done when: recorded decisions and verification match implementation.
  - Verify: review

## 6. Gates

- [ ] **T-050** — `pnpm lint` passes
- [ ] **T-051** — `pnpm build` passes
- [ ] **T-052** — `pnpm test:e2e` passes
- [ ] **T-053** — Every acceptance scenario in `spec.md` is satisfied

## Deferred

| Task | Reason | Follow-up |
| --- | --- | --- |
| Live Supabase round-trip | Requires configured authenticated cloud environment | Verify when available |
