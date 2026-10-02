# Tasks: Recover the gap between settled and expected profit

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Plan | [`plan.md`](./plan.md) |
| Updated | 2026-10-02 |

> Ordered, small, individually verifiable steps. Domain logic first, then UI, then
> scenarios, then docs. Tick each box as it lands. If the order turns out to be wrong,
> update this file rather than improvising silently.

## 1. Domain

- [ ] **T-001** — Add optional sequence-start recovery metadata and calculate a
  ledger-wide shortfall for new sequences.
  - Files: `src/domain/ledger.ts`
  - Done when: stored recovery basis applies only to a sequence's first bet; legacy
    bets remain unchanged; active-sequence recovery is unchanged.
  - Verify: `pnpm build`, E2E recovery scenarios

## 2. Persistence and migration

- [ ] **T-010** — Validate optional local metadata and read/write its cloud equivalent.
  - Files: `src/App.tsx`, `src/lib/cloudStore.ts`
  - Done when: old local/cloud rows without metadata load; new values round-trip.
  - Verify: `pnpm build`, review local validation and cloud mapping

- [ ] **T-011** — Add nullable cloud storage column and forward migration.
  - Files: `supabase/schema.sql`, `supabase/migrations/0004_sequence_start_recovery_gap.sql`
  - Done when: fresh and existing cloud schemas accept nullable nonnegative gaps.
  - Verify: review SQL schema and migration

## 3. UI

- [ ] **T-020** — Use the domain's active-sequence or new-sequence recovery gap for
  stake previews and snapshot it on new sequence bets.
  - Files: `src/App.tsx`
  - Done when: selected odds calculate the correct preview and saved bet, while edits
    preserve historical metadata.
  - Verify: `pnpm test:e2e`

## 4. Scenarios

- [ ] **T-030** — Commit and complete the shortfall regression scenario.
  - Files: `e2e/features/bet-strategy.feature`, `e2e/steps/fairbets.steps.js`
  - Done when: new suggestion/stored stake are €3 for a €1 gap at 1.50 odds; old
    automatic stake remains unchanged after reload.
  - Verify: `pnpm test:e2e`

- [ ] **T-031** — Cover target-met and active-sequence behavior.
  - Files: `e2e/features/bet-strategy.feature`
  - Done when: a met target starts at base stake and an active sequence retains current
    recovery behavior.
  - Verify: `pnpm test:e2e`

## 5. Documentation

- [ ] **T-040** — Ensure the spec and plan describe the shipped metadata and recovery
  behavior.
  - Files: `specs/FB-009-recover-settled-profit-gap/spec.md`,
    `specs/FB-009-recover-settled-profit-gap/plan.md`
  - Done when: implementation details and data impact match shipped code.
  - Verify: review

## 6. Gates

- [ ] **T-050** — `pnpm lint` passes
- [ ] **T-051** — `pnpm build` passes
- [ ] **T-052** — `pnpm test:e2e` passes
- [ ] **T-053** — Each acceptance scenario in `spec.md` confirmed satisfied

## Deferred

| Task | Reason | Follow-up |
| --- | --- | --- |
| Live Supabase round-trip | Requires an authenticated configured cloud environment | Verify manually when available |
