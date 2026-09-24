# Tasks: Strategy values are fixed when a bet is placed

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Plan | [`plan.md`](./plan.md) |
| Updated | 2026-09-24 |

> Domain first, then the ingress paths that must stamp, then the UI, then scenarios.
> The suite must stay green at every step; the existing `€38.07` and `€39.07`
> expectations are the regression test for the migration and must never be edited.

## 1. Domain

- [x] **T-001** — Add the `BetStrategy` type and `pickStrategy`
  - Files: `src/domain/ledger.ts`
  - Done when: `BetStrategy` names the five pricing values (`baseStake`, `threshold`,
    `recoveryWeight`, `stakeRounding`, `maxStake`) and `pickStrategy(settings)` narrows
    `StrategySettings` to it
  - Verify: `pnpm build`

- [x] **T-002** — Point `suggestStakeForOdds` at `BetStrategy`
  - Files: `src/domain/ledger.ts`
  - Done when: the third parameter is `BetStrategy`; existing call sites that pass live
    settings still compile unchanged through structural typing
  - Verify: `pnpm build`, `pnpm test:e2e` still green

- [x] **T-003** — Add the required `strategy` field to `Bet` and add `stampBets`
  - Files: `src/domain/ledger.ts`
  - Done when: `Bet.strategy` is required, `stampBets(bets, settings)` fills a strategy
    for any bet lacking one, and the demo ledger stamps its bets from `defaultSettings`
  - Verify: `pnpm build` — the compiler should now flag every unstamped construction site

- [x] **T-004** — Price each recorded bet from its own strategy
  - Files: `src/domain/ledger.ts`
  - Done when: inside `calculateLedger`, `baseStakeUnits` and `maxStakeUnits` are derived
    per bet from `bet.strategy`, `expectedProfitUnits` uses the bet's base stake, and
    `capped` reflects the bet's pinned maximum
  - Verify: `pnpm build`, `pnpm test:e2e` — demo figures unchanged

- [x] **T-005** — Keep guardrails on live settings
  - Files: `src/domain/ledger.ts`
  - Done when: `overStakeLimit` compares the recorded stake with `settings.maxStake`, the
    open-exposure check still uses `settings.maxOpenExposure`, and the next-bet
    suggestion still reads live settings
  - Verify: `pnpm build`

## 2. Persistence and migration

- [x] **T-010** — Stamp bets loaded from local storage
  - Files: `src/App.tsx`
  - Done when: `isBet` accepts a bet with no `strategy`, and `loadLedger` passes parsed
    bets through `stampBets(bets, settings)` before they enter state, for both the
    current and the legacy storage key
  - Done when: a ledger saved by the previous version renders identical figures
  - Verify: `pnpm build`, `pnpm test:e2e`

- [x] **T-011** — Stamp imported workbook bets
  - Files: `src/domain/workbookImport.ts`
  - Done when: imported bets carry the strategy derived from the workbook's own settings
  - Verify: `pnpm test:e2e` — the workbook import scenarios stay green

- [x] **T-012** — Add the cloud columns
  - Files: `supabase/schema.sql`, `supabase/migrations/0003_bet_strategy.sql`
  - Done when: `public.bets` gains five nullable `numeric(12, 4)` columns, and the
    migration is additive and idempotent
  - Verify: SQL review; no automated gate covers this

- [x] **T-013** — Read and write the cloud columns
  - Files: `src/lib/cloudStore.ts`
  - Done when: the upsert writes all five values, and the parser stamps any row with
    nulls from the settings on the parent ledger row
  - Done when: a backup written by the previous version restores with unchanged figures
  - Verify: `pnpm build`, `pnpm lint`

## 3. UI

- [x] **T-020** — Stamp on create, preserve on edit
  - Files: `src/App.tsx`
  - Done when: `saveBet` stamps a new bet from `pickStrategy(tracker.settings)` and an
    edit keeps the existing bet's strategy untouched
  - Verify: `pnpm build`

- [x] **T-021** — Show the recorded strategy in the bet form
  - Files: `src/App.tsx`, `src/App.css`
  - Done when: a collapsed "Recorded strategy" section shows the five values — read-only
    while creating, editable while editing, with copy naming it as a correction
  - Verify: `pnpm lint`, manual check in `pnpm dev`

- [x] **T-022** — Validate corrections
  - Files: `src/App.tsx`
  - Done when: a correction is validated by the same rules as the equivalent setting, an
    invalid one is rejected with a message and saves nothing, and a valid one re-prices
    only that bet
  - Verify: `pnpm build`, `pnpm test:e2e`

## 4. Scenarios

- [x] **T-030** — Steps for recorded values and unchanged figures
  - Files: `e2e/steps/fairbets.steps.js`
  - Done when: steps exist to read a recorded value, correct one, and assert a figure is
    unchanged across an action by capturing it before and comparing after
  - Verify: `pnpm test:e2e`

- [x] **T-031** — Pinning scenarios
  - Files: `e2e/features/bet-strategy.feature`
  - Done when: scenarios 1 to 4 of the plan's test strategy are present and green
  - Verify: `pnpm test:e2e`

- [x] **T-032** — Maximum stake scenarios
  - Files: `e2e/features/bet-strategy.feature`
  - Done when: scenarios 5 and 6 are present and green, using the manual-stake-then-lower
    recipe for the guardrail
  - Verify: `pnpm test:e2e`

- [x] **T-033** — Edit and correction scenarios
  - Files: `e2e/features/bet-strategy.feature`
  - Done when: scenarios 7, 8, and 9 are present and green
  - Verify: `pnpm test:e2e`

## 5. Documentation

- [x] **T-040** [P] — Document the rule
  - Files: `README.md`, `.github/copilot-instructions.md`
  - Done when: both state that a bet keeps the strategy it was placed under, and that
    risk warnings stay live
  - Verify: review

- [x] **T-041** [P] — Close out the spec
  - Files: `specs/002-base-stake-at-placement/spec.md`, `plan.md`
  - Done when: both are marked Done and the spec carries a Verification section
  - Verify: review

## 6. Gates

- [x] **T-050** — `pnpm lint` passes
- [x] **T-051** — `pnpm build` passes
- [x] **T-052** — `pnpm test:e2e` passes
- [x] **T-053** — Each acceptance scenario in `spec.md` confirmed satisfied
- [x] **T-054** — Demo ledger figures verified unchanged against the pre-change app

## Deferred

| Task | Reason | Follow-up |
| --- | --- | --- |
| Restoring a pre-change cloud backup | Needs a live Supabase project; the E2E suite never reaches the network | Manual check by the maintainer before relying on cloud sync |
| Loading a real pre-change ledger from browser storage | Only the maintainer holds real data | Manual reconciliation after upgrade |
