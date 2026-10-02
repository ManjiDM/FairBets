# Tasks: Order bets by recording time and show odds as the default title

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Plan | [`plan.md`](./plan.md) |
| Updated | 2026-10-02 |

> Ordered, small, individually verifiable steps. Domain calculations remain separate
> from presentation ordering.

## 1. Regression scenarios

- [x] **T-001** — Verify newest recorded sequence appears first for tied and backdated
  placement times, with odds replacing generated labels.
  - Files: `e2e/features/bets.feature`, `e2e/steps/fairbets.steps.js`
  - Done when: the tests fail against current ordering/title behavior and cover reload.
  - Verify: `pnpm test:e2e`

## 2. Recording timestamps and ordering

- [x] **T-010** — Persist and use a per-bet recording timestamp for sequence card
  ordering while retaining placement-time calculation order.
  - Files: `src/domain/ledger.ts`, `src/App.tsx`, `src/lib/cloudStore.ts`,
    `src/domain/workbookImport.ts`, `supabase/schema.sql`,
    `supabase/migrations/0006_automatic_bet_labels.sql`
  - Done when: new, edited, legacy, imported, and cloud-restored bets have stable
    ordering without displaying the timestamp.
  - Verify: `pnpm build`, E2E reload and order assertions

## 3. Default title

- [x] **T-020** — Render odds instead of auto-generated “Selection NN” labels while
  preserving explicitly custom labels with the same text.
  - Files: `src/App.tsx`, `src/domain/ledger.ts`
  - Done when: generated titles show odds, custom labels remain unchanged, and label
    input guidance is optional.
  - Verify: E2E default/custom title scenarios

## 4. Documentation and gates

- [x] **T-030** — Mark spec verified and align plan/tasks with implementation.
  - Files: `specs/FB-013-recording-order-and-odds-title/*`
  - Done when: behavior and persistence decisions match shipped code.
  - Verify: review

- [x] **T-040** — `pnpm lint` passes
- [x] **T-041** — `pnpm build` passes
- [x] **T-042** — `pnpm test:e2e` passes
- [x] **T-043** — Every acceptance scenario in `spec.md` is satisfied

## Deferred

| Task | Reason | Follow-up |
| --- | --- | --- |
| Live cloud round-trip | Requires authenticated Supabase configuration | Verify when available |
