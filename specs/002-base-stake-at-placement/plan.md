# Plan: Strategy values are fixed when a bet is placed

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Status | Draft |
| Updated | 2026-09-24 |

## Approach

Give every bet its own copy of the five strategy values that determine the stake it was
placed at, and make the stake calculation read those values from the bet instead of from
the live settings.

`suggestStakeForOdds` today takes the whole `StrategySettings` object but only ever reads
`baseStake`, `threshold`, `recoveryWeight`, `stakeRounding`, and `maxStake`. That subset
becomes a named type, `BetStrategy`, and the function takes that instead. Because
`StrategySettings` structurally contains every field of `BetStrategy`, the call that
prices the *next* bet can keep passing the live settings unchanged — which is exactly
what FR-6 asks for. The calls that price *recorded* bets pass `bet.strategy`.

`strategy` is a **required** field on `Bet`. Making it optional with a fallback to live
settings would leave the defect one missing stamp away from returning, and silently. A
required field makes the compiler point at every place a bet is constructed — the bet
form, the demo ledger, the workbook importer, the cloud parser, and the E2E fixtures —
and forces each one to decide what to stamp. The three ingress paths that receive bets
from outside the app (saved local data, cloud rows, workbook rows) all stamp through a
single exported helper, `stampBets`.

Rejected alternative: a separate settings-history timeline, where each bet resolves its
values by looking up the settings that were in force at its `placedAt`. It models the
intent more purely, but it makes every calculation depend on a second collection, it
breaks down when bets are back-dated or re-ordered, and it cannot express a
per-bet correction (FR-15) without special cases. Denormalising the values onto the bet
is the same trade an invoice makes when it stores the price rather than pointing at the
price list.

## Affected modules

| File | Change | Notes |
| --- | --- | --- |
| `src/domain/ledger.ts` | New `BetStrategy` type, `strategy` on `Bet`, `pickStrategy`, `stampBets`, `suggestStakeForOdds` and `calculateLedger` re-pointed | The whole of the fix lives here |
| `src/domain/workbookImport.ts` | Stamp imported bets with the settings the import derives | FR-12 |
| `src/App.tsx` | Stamp on load and on create, preserve on edit, expose and allow correction in the bet form | FR-10, FR-13, FR-14, FR-15, FR-16 |
| `src/lib/cloudStore.ts` | Read and write five new columns, stamp legacy rows from the ledger's stored settings | FR-11 |
| `supabase/schema.sql` | Five new nullable numeric columns on `public.bets` | Landed with the migration |
| `supabase/migrations/0003_bet_strategy.sql` | New migration adding the same columns | Must be additive and idempotent |
| `e2e/features/bets.feature` | Scenarios for pinning, correction, and the live guardrail | |
| `e2e/steps/fairbets.steps.js` | Steps for reading and correcting recorded values | |
| `README.md` | Explain that a bet keeps the strategy it was placed under | |
| `.github/copilot-instructions.md` | Same, in the domain conventions section | |

## Domain changes

```ts
export interface BetStrategy {
  baseStake: number;
  threshold: number;
  recoveryWeight: number;
  stakeRounding: number;
  maxStake: number;
}

export interface Bet {
  id: string;
  placedAt: string;
  label: string;
  odds: number;
  outcome: Outcome;
  stakeOverride?: number;
  strategy: BetStrategy;
}

// Narrows live settings to the values that price a bet.
export function pickStrategy(settings: StrategySettings): BetStrategy

// Fills in a strategy for any bet that arrives without one. Used only at the
// boundaries: saved local data, cloud rows, and workbook rows.
export function stampBets(bets: LooseBet[], settings: StrategySettings): Bet[]

// Was (gap, odds, settings). The settings object still satisfies BetStrategy
// structurally, so the next-bet suggestion call site is unchanged.
export function suggestStakeForOdds(
  recoveryGap: number,
  odds: number,
  strategy: BetStrategy,
): StakeSuggestion
```

**Invariants inside `calculateLedger`:**

- Per-bet `baseStakeUnits` and `maxStakeUnits` are derived from `bet.strategy`, not from
  `settings`. They move inside the loop; today they are computed once above it.
- `expectedProfitUnits` uses the bet's own base stake. This is the line that makes the
  recovery gap — and therefore every downstream stake — drift today.
- `capped` reflects the bet's **pinned** maximum stake (FR-9).
- `overStakeLimit` compares the recorded stake with the **live** `settings.maxStake`
  (FR-8), so lowering the limit still raises the warning.
- The next-bet suggestion and the open-exposure check keep reading live `settings`
  (FR-6, FR-8).
- Sequence boundaries are untouched: they are decided by outcomes alone, so FR-7 holds
  without any extra work.

## Data and migration

- **`LedgerState` shape:** changed. Every bet gains a `strategy` object of five numbers.
- **`localStorage` migration:** needed, but silent. The storage key stays
  `fairbets-ledger-state-v2`; a bumped key would orphan real ledgers for no gain. `isBet`
  accepts a bet with no `strategy`, and `loadLedger` runs the parsed bets through
  `stampBets(bets, state.settings)` before they enter React state. Stamping from the
  settings saved in the same payload reproduces the previous version's figures exactly,
  because those are the values it was calculating from. The stamped shape is written back
  on the next save.
- **Cloud schema:** new migration `supabase/migrations/0003_bet_strategy.sql` adding
  `base_stake`, `threshold`, `recovery_weight`, `stake_rounding`, and `max_stake` to
  `public.bets`, all `numeric(12, 4)` and **nullable** so that existing rows remain valid.
  `supabase/schema.sql` gains the same columns. `cloudStore.ts` writes all five on upsert
  and, when reading, stamps any row with nulls from the settings on the parent ledger row
  — the same trick as the local migration, applied to a backup (FR-11).
- **Workbook import:** the layout is unchanged. The importer already derives a settings
  object from the workbook and returns it alongside the bets; those bets are stamped from
  that object, which becomes the ledger's settings on import (FR-12).
- **Backward compatibility:** every ingress path stamps, so no saved ledger can produce a
  different figure than it did before. The E2E expectations of `€38.07` and `€39.07` are
  the regression test for this: the demo bets get stamped with `defaultSettings`, which is
  precisely what they are priced from today, so those numbers must not move.

## UI changes

**Bet form (`src/App.tsx`).** The form gains a collapsed "Recorded strategy" section
showing the five values held against the bet.

- Creating a bet: the section is read-only and previews the current settings, making it
  clear what is about to be recorded.
- Editing a bet: the section expands into five inputs, each pre-filled with the recorded
  value, under a short line of copy — *"These were recorded when the bet was placed.
  Change them only to correct a mistake."*
- Saving without touching the section preserves the recorded values byte for byte
  (FR-13). Only a changed field re-prices the bet, and only that bet (FR-15).

**Validation (FR-16)** mirrors `saveSettings` exactly, reusing the same rules rather than
restating them: base stake greater than zero, threshold greater than zero, recovery
weight between 0 and 1, stake rounding a whole number between 0 and 4, and maximum stake
not below the bet's own base stake. A rejected correction leaves the form open with a
message and saves nothing.

The manual-stake input keeps `max={tracker.settings.maxStake}`; that is about what the
user may type now, not about what a past bet was capped at.

No screen calculates anything. Every figure still comes from `calculateLedger`.

## Test strategy

**Scenarios added to `e2e/features/bets.feature`,** mapped to the spec's acceptance
scenarios:

1. Raising the base stake leaves the available balance and settled profit unchanged.
2. Raising the base stake leaves an open bet's stake and the open exposure unchanged.
3. The new base stake applies to the next bet recorded.
4. A sequence spanning a strategy change stays one sequence, with mixed pricing.
5. Raising the maximum stake does not re-price a bet that was capped.
6. Lowering the maximum stake still raises a guardrail warning about a historical stake.
7. Editing a bet's label does not re-stamp it.
8. Correcting a recorded base stake re-prices only that bet.
9. An invalid correction is rejected with a message and nothing is saved.

Scenario 6 reuses the known-good recipe from spec 001: record a bet with a manual stake
of `10` while the maximum stake is `15`, then lower the maximum stake to `5`. Setting a
tiny maximum up front is rejected by `saveSettings`, and a large manual stake is blocked
by the input's `max` attribute.

**New steps in `e2e/steps/fairbets.steps.js`** for reading a recorded strategy value from
the bet form, correcting one, and asserting a figure is unchanged across an action —
implemented by capturing the figure before the action and comparing after, so the
assertion is about *stability* rather than a hard-coded number.

**Existing scenarios are the safety net.** All 12 must pass untouched. Any drift in
`€38.07` or `€39.07` means the migration is stamping the wrong values, and the fix is the
migration, never the expectation.

**Manual checks:**

- Restore a cloud backup written before this change and confirm no figure moves. Cannot
  be automated without a live Supabase project; the E2E suite never reaches the network.
- Load a real pre-change ledger from browser storage and reconcile the balance.

## Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| The local migration stamps the wrong values and every historical figure shifts | Severe and silent — the user's balance is wrong and nothing announces it | Stamp from the settings saved in the same payload, which is by definition what the old version calculated from; the demo-ledger E2E figures are the regression test |
| A bet reaches state without a strategy | The defect returns for that bet, invisibly | `strategy` is required on `Bet`, so the compiler finds every construction site; all three ingress paths go through `stampBets` |
| Cloud schema and parser land out of step | Sync fails, or values are silently dropped on backup | Ship `schema.sql`, the migration, and `cloudStore.ts` in one commit; columns are nullable so an un-migrated project degrades to stamping rather than erroring |
| Pinning the maximum stake mutes a real breach | A user exceeds their own risk limit without a warning | FR-8 is explicit: `overStakeLimit` and open exposure are evaluated against live settings; scenario 6 covers it |
| The correction UI is mistaken for a normal edit | Users rewrite history casually, defeating the purpose | Collapsed by default, with copy that names it as a correction |
| Per-bet derivation inside the loop slows the calculation | Negligible at realistic ledger sizes | Arithmetic only, no allocation beyond a small object per bet |

## Constitution check

- **III (deterministic domain).** Strengthened. Today `calculateLedger` returns a
  different answer for the same historical bet depending on a setting changed months
  later. Afterwards its output is a function of its inputs in the way the principle
  intends.
- **IV (UI/domain separation).** Held. `pickStrategy` and `stampBets` are domain exports;
  the UI stamps by calling them and never composes a strategy by hand.
- **V (sequence model).** Held. Sequence boundaries depend only on outcomes. FR-7 and
  scenario 4 prove a change mid-sequence does not split it.
- **VI (risk limits).** Held deliberately and explicitly. Pinning applies to pricing, not
  to warnings.
- **VII (data compatibility).** **Under tension — this is the principle to watch.** The
  persisted shape and the cloud schema both change. The mitigation is that both migrations
  are additive and stamp from data already present, so no ledger can render differently
  after the upgrade. This is the one part of the change that a green suite does not fully
  prove; the manual checks above exist for it.
- **I, II, VIII.** Untouched. No claim about outcomes, no new network dependency, no
  secrets.

## Rollback

The domain and UI changes revert cleanly with `git revert`; a reverted app reads a
stamped ledger without complaint, because the extra `strategy` field is simply ignored by
the old `isBet` validator. The pre-change behaviour returns with it, including the defect.

The cloud columns are additive and nullable, so the migration does not need reversing —
an old client writing to a migrated table leaves them null, and a re-applied fix stamps
them again on read. Leave the columns in place rather than dropping them; dropping loses
the recorded values for anyone who has already synced.

The one thing rollback cannot undo is a **wrong** stamp already written to storage or
synced to the cloud, since it overwrites the only record of what the values were. That is
the reason the local migration derives its values from the ledger's own saved settings
rather than from anything new, and the reason the manual reconciliation check is not
optional.
