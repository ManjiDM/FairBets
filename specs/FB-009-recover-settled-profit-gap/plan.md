# Plan: Recover the gap between settled and expected profit

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Status | Approved |
| Updated | 2026-10-02 |

> How the spec will be built. Written after every `[NEEDS CLARIFICATION]` marker in the
> spec is resolved. If implementation reveals this plan is wrong, update this file
> before continuing.

## Approach

Keep the calculation deterministic and preserve historical behavior by recording the
ledger-wide recovery gap as optional metadata on the first bet of a newly started
sequence. A new sequence preview uses the current ledger shortfall and selected odds;
when the bet is saved, that gap is stored with it. During ledger calculation, a saved
gap is used only for that sequence's first bet. Older bets without the optional field
continue to use a zero sequence-start gap, so the new algorithm does not re-price them.
Additional bets in an active sequence continue to use the existing sequence recovery
calculation.

Expose the current ledger-wide new-sequence gap from the domain calculation for the
UI preview and next-bet guide. Persist the first-bet snapshot locally through the
existing ledger object, and add a nullable cloud column with parser/writer support and
a forward migration.

An alternative was to recalculate every old sequence from the new global rule. This
was rejected because it changes recorded automatic stakes, contrary to the clarified
future-only behavior.

## Affected modules

| File | Change | Notes |
| --- | --- | --- |
| `src/domain/ledger.ts` | Add optional recovery-gap metadata and new-sequence recovery gap output; use stored metadata when calculating a sequence's first bet | Pure deterministic calculation |
| `src/App.tsx` | Use active-sequence gap or new-sequence gap for the draft preview; snapshot the gap on newly placed first bets; preserve metadata while editing | UI reads calculations from the domain |
| `src/lib/cloudStore.ts` | Read/write optional cloud recovery-gap field and validate its numeric range | Legacy null fields remain absent |
| `supabase/schema.sql` | Include the nullable recovery-gap column and constraint | Fresh installs |
| `supabase/migrations/0004_sequence_start_recovery_gap.sql` | Add nullable nonnegative recovery-gap column | Existing cloud databases |
| `e2e/features/bet-strategy.feature` | Add shortfall, target-met, active-sequence, and historical-stake preservation scenarios | UI behavior |
| `e2e/steps/fairbets.steps.js` | Reuse or add exact form and bet assertions | No production logic |

## Domain changes

```ts
export interface Bet {
  sequenceStartRecoveryGap?: number;
}

export interface LedgerCalculation {
  newSequenceRecoveryGap: number;
}
```

The new gap is `max(0, goal - settledProfit)`, where `goal` is the ledger-wide
expected profit multiplied by `goalRate`. A bet with no stored start-gap metadata
retains a zero recovery basis when it begins a sequence. When metadata is present, it
is used for that first bet only. Subsequent bets in the active sequence use the
existing sequence gap. All stake computation continues through
`suggestStakeForOdds`, preserving configured weight, rounding, and caps.

## Data and migration

- **`LedgerState` shape:** Bet gains optional `sequenceStartRecoveryGap`.
- **`localStorage` migration:** Not required; old bets omit the optional property and
  are interpreted with the existing zero start gap.
- **Cloud schema:** Add nullable `sequence_start_recovery_gap numeric(12, 4)` with a
  nonnegative check in both `schema.sql` and migration `0004_sequence_start_recovery_gap.sql`.
- **Backward compatibility:** Cloud `NULL` and absent local fields mean no startup
  recovery snapshot. Importer data remains unstamped and compatible.

## UI changes

The bet form's suggested stake preview and dashboard next-bet guide use the active
sequence's recovery gap when a sequence is active. When no sequence is active, they use
the domain-provided ledger-wide new-sequence gap. Saving a new bet snapshots that gap
only when it begins a sequence; editing an existing bet preserves its existing
snapshot.

## Test strategy

- Extend `e2e/features/bet-strategy.feature` to assert a €3 suggested/recorded stake
  when the ledger shortfall is €1 at odds 1.50, while earlier automatic stakes remain
  unchanged after reload.
- Assert a base-stake suggestion when settled profit meets the goal-adjusted target.
- Retain the existing active-sequence recovery scenario as the check that its behavior
  is unchanged.
- Run `pnpm lint`, `pnpm build`, and `pnpm test:e2e`.
- Cloud live sync is environment-dependent; verify its parser and payload through type
  checks and schema/migration review.

## Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Old bets are recalculated under the new rule | Historical displayed stakes change | Only use a persisted optional gap snapshot; absent metadata means legacy behavior |
| Local and cloud values diverge | Different suggested stake after restore | Save/load the same optional numeric field locally and in cloud storage |
| Recovery applies inside an active sequence | Sequence behavior changes unexpectedly | Prefer sequence-local gap while active; use ledger-wide gap only at sequence start |
| Cloud schema is not migrated | Cloud save/load fails | Include both fresh schema and additive migration in the same change |

## Constitution check

- I: Suggestions describe stake arithmetic; no predictions or automated placements.
- II: The feature works locally; cloud is optional.
- III: All calculations remain pure and deterministic in the domain.
- IV: The UI only selects and displays domain-provided gaps and suggestions.
- V: Losses/open outcomes continue an active sequence and a win closes it; global
  shortfall affects only the next sequence.
- VI: Existing recovery weights, rounding, and stake caps remain enforced.
- VII: Existing local data remains valid; cloud change is additive and includes the
  migration and parser/writer updates.
- VIII: No secrets are introduced.
- IX: Gherkin scenarios cover user-visible behavior.
- X: Lint, build, and E2E gates must pass.

## Rollback

Revert the app/domain/parser changes and the schema/migration additions together. The
new nullable field is additive; reverting the feature does not require deleting stored
values or rewriting ledger data.
