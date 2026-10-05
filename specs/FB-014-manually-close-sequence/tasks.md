# Tasks: Manually close a sequence after a loss

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Plan | [`plan.md`](./plan.md) |
| Updated | 2026-10-05 |

> Ordered, small, individually verifiable steps. Preserve the distinction between a
> sequence's status and its recorded bet outcomes.

## 1. Regression scenarios

- [ ] **T-001** — Verify manual closure is available only after a loss and does not
  alter the loss or settled P&L.
  - Files: `e2e/features/bets.feature`, `e2e/steps/fairbets.steps.js`
  - Done when: regressions cover eligible/ineligible actions and failed before code.
  - Verify: `pnpm test:e2e`

- [ ] **T-002** — Verify closing a recovery-reserving sequence releases only its own
  reservation and persists after reload.
  - Files: `e2e/features/bet-strategy.feature`, `e2e/features/bets.feature`
  - Done when: remaining gap is recalculated after final reservation closes, but
    remains suppressed while another recovery sequence is active.
  - Verify: `pnpm test:e2e`

## 2. Domain and persistence

- [ ] **T-010** — Add a pure, validated transition that marks the final lost bet as
  manually closing its sequence and calculates that sequence as closed.
  - Files: `src/domain/ledger.ts`
  - Done when: the sequence status changes without changing bet or ledger totals.
  - Verify: `pnpm build`, focused E2E cases

- [ ] **T-020** — Persist manual closure in local and cloud bet records.
  - Files: `src/App.tsx`, `src/lib/cloudStore.ts`, `supabase/schema.sql`,
    `supabase/migrations/0007_manual_sequence_closure.sql`
  - Done when: existing records default to not manually closed; new closure state
    survives reload and cloud round-trip.
  - Verify: `pnpm build`, reload E2E, migration review

## 3. UI

- [ ] **T-030** — Add a close action to eligible single- and multi-bet sequence cards.
  - Files: `src/App.tsx`
  - Done when: only active sequences ending in a loss show the action; closed
    sequences show no close or continue control.
  - Verify: E2E eligible/ineligible visibility assertions

## 4. Documentation and gates

- [ ] **T-040** — Align spec, plan, and tasks with shipped behavior.
  - Files: `specs/FB-014-manually-close-sequence/*`
  - Done when: data, recovery, and sequence-status rules match implementation.
  - Verify: review

- [ ] **T-050** — `pnpm lint` passes
- [ ] **T-051** — `pnpm build` passes
- [ ] **T-052** — `pnpm test:e2e` passes
- [ ] **T-053** — Every acceptance scenario in `spec.md` is covered and satisfied

## Deferred

| Task | Reason | Follow-up |
| --- | --- | --- |
| Live cloud restore | Requires authenticated Supabase configuration | Verify when available |
