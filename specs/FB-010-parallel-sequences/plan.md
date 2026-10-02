# Plan: Add bets to parallel sequences

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Status | Approved |
| Updated | 2026-10-02 |

> How the spec will be built. Written after every `[NEEDS CLARIFICATION]` marker in the
> spec is resolved. If implementation reveals this plan is wrong, update this file
> before continuing.

## Approach

Give each bet optional persisted sequence membership. New standalone bets receive a
new stable sequence ID; bets added with the plus button reuse the selected sequence ID.
The domain calculates each sequence independently by membership, while totals and
open-exposure risk remain ledger-wide.

For old local, imported, or cloud bets without a sequence ID, retain the current
chronological grouping rule. Calculate their legacy sequence IDs from the ordered
legacy records only, so explicitly grouped new bets cannot split, merge, or reorder
those historical sequences. When a user continues a legacy sequence, its calculated
legacy ID is written to the new bet. Newly grouped bets remain stable regardless of
placement timestamp or activity in other sequences.

Replace the singular active-sequence calculation with a collection of active
sequences. The dashboard's general next-bet guide describes starting a new independent
sequence; a sequence-specific form preview uses that selected sequence's recovery gap.
The FB-009 new-sequence recovery snapshot is recorded only for standalone new bets.

Add a nullable cloud sequence-ID column, matching parser/writer support, and an
additive migration. Existing null values continue to use legacy chronological grouping.
This is safer than attempting to assign IDs during import/load, which could
retroactively mutate data or depend on migration timing.

## Affected modules

| File | Change | Notes |
| --- | --- | --- |
| `src/domain/ledger.ts` | Add optional sequence membership and calculate multiple independent sequences | Domain remains deterministic; legacy bets retain current grouping |
| `src/App.tsx` | Keep standalone Add bet enabled, launch sequence-targeted form from plus controls, and route recovery to selected sequence | Update single-bet and active-sequence cards |
| `src/lib/cloudStore.ts` | Parse/write optional sequence ID | Null cloud field remains legacy-compatible |
| `supabase/schema.sql` | Add nullable sequence ID column | Fresh installs |
| `supabase/migrations/0005_bet_sequence_id.sql` | Add nullable sequence ID column | Existing cloud installs |
| `e2e/features/bets.feature` | Replace global-open prohibition with parallel-sequence scenarios | Main button always creates independent sequence |
| `e2e/features/bet-strategy.feature` | Cover sequence-scoped add, icon visibility, win isolation, stable reload membership | Strategy and sequence regressions |
| `e2e/steps/fairbets.steps.js` | Add sequence ID/button/count assertions | User-visible behavior |
| `specs/FB-010-parallel-sequences/*` | Track implementation and verification | Plan, tasks, spec status |

## Domain changes

```ts
export interface Bet {
  sequenceId?: string;
}

export interface LedgerCalculation {
  activeSequences: BetSequence[];
}
```

Each explicit sequence ID maps to one accumulator and is processed in placement order
within that sequence. A win closes only that accumulator. When no explicit ID exists,
legacy bets are grouped chronologically with the current rule and derive a stable
legacy ID from their first bet. Global settled P&L, expected profit, open exposure, and
risk flags still aggregate all bets.

The singular `activeSequence` result is replaced with `activeSequences`. The general
next-bet guide uses the new-sequence recovery gap, while bet-form suggestions use either
the selected sequence's gap or the new-sequence gap.

## Data and migration

- **`LedgerState` shape:** Each bet gains optional `sequenceId`.
- **`localStorage` migration:** No eager migration. Missing sequence IDs retain legacy
  chronological grouping. New bets save an explicit ID.
- **Cloud schema:** Add nullable `sequence_id text` to `schema.sql` and migration
  `supabase/migrations/0005_bet_sequence_id.sql`.
- **Backward compatibility:** Missing/null sequence IDs preserve old grouping.
  Workbook imports are not changed and use legacy grouping until explicitly continued.
- **FB-009 compatibility:** New standalone bets store both `sequenceId` and the
  existing new-sequence recovery snapshot. Continuation bets store their target
  sequence ID without a new-sequence snapshot.

## UI changes

The main Add bet action is never disabled because another sequence has an open bet; it
always creates a new sequence. Single-bet and multi-bet active sequence cards show an
accessible plus-icon button only if their latest bet is lost. That action opens the
existing bet form with a selected sequence ID and that sequence's stake suggestion.
New standalone forms use the existing new-sequence recovery suggestion. One open bet
per sequence is maintained because the plus action is only offered after a loss.

## Test strategy

- Replace the existing scenario that expects Add bet to disable during an open bet.
- Cover adding an independent open bet while another sequence is open.
- Cover plus-button visibility after loss and hiding after a new open bet or win.
- Cover independent settlement of two sequences.
- Assert continuation attaches to the selected sequence and uses its own recovery.
- Reload after multiple sequences and verify membership/status and stakes remain stable.
- Preserve existing exposure-risk, strategy, workbook-import, and FB-009 tests.
- Run `pnpm lint`, `pnpm build`, and `pnpm test:e2e`.
- Review cloud migration/parser/writer; live sync requires configured credentials.

## Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Legacy bets are regrouped when explicit bets are introduced | Historical sequence and stake changes | Derive legacy sequences only from the ordered legacy subset |
| A targeted bet uses another sequence's recovery | Incorrect stake recommendation | Resolve the recovery gap by selected sequence ID in the domain calculation |
| Two open bets enter one sequence | Violates the one-open rule | Show the plus action only when latest outcome is lost; validate target sequence before save |
| New sequence becomes coupled to placement timestamps | Independent bets merge/reorder | Persist a distinct sequence ID at new-bet creation |
| Aggregate exposure checks only one sequence | Risk ceiling bypass | Keep open exposure aggregation across all calculated bets |

## Constitution check

- I: Records bets only; no automation or prediction.
- II: Local-first behavior; cloud remains optional.
- III: All grouping, sequence status, and stake math remain deterministic domain logic.
- IV: The UI selects a sequence and displays domain-calculated results.
- V: Each sequence starts at base stake, losses continue it, and a win closes it;
  multiple independent sequences are an explicitly specified extension.
- VI: Stake caps and aggregate open-exposure ceilings still apply.
- VII: Existing local/cloud/workbook records without IDs remain supported; schema
  change has both fresh schema and additive migration.
- VIII: No secrets are added.
- IX: Acceptance scenarios are expressed in Gherkin and E2E.
- X: All required gates must pass.

## Rollback

Revert the UI, domain, cloud parser/writer, schema, and migration changes together.
Sequence IDs are additive and nullable; removing the feature does not require deleting
ledger data. Existing records without IDs remain readable by the previous grouping
logic.
