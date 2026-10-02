# Plan: Prevent duplicate global recovery allocations

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Status | Approved |
| Updated | 2026-10-02 |

> How the spec will be built. Written after every `[NEEDS CLARIFICATION]` marker in the
> spec is resolved. If implementation reveals this plan is wrong, update this file
> before continuing.

## Approach

Use the FB-009 recovery snapshot already stored on each new-sequence first bet to
identify recovery ownership. After calculating sequences and the current ledger-wide
shortfall, inspect active sequences for a positive snapshot on their first bet. When
any active sequence owns a positive allocation, report a zero available
new-sequence-recovery gap and calculate the new-sequence guide at base stake.

Keep each placed bet's snapshot untouched. Sequence continuation still uses its own
per-sequence gap. Since the reservation is derived from active sequence membership,
the last owner closing with a win automatically releases the reservation; the current
settled P&L and expected-profit target determine any remaining gap for a later new
sequence.

This avoids adding another persisted ownership field, modifying existing snapshots, or
splitting one global recovery allocation across sequences. The existing FB-009 tests
already verify that active sequences without a positive snapshot do not block global
recovery. Add an E2E scenario for duplicate suppression and shortfall re-evaluation
after the owner closes.

## Affected modules

| File | Change | Notes |
| --- | --- | --- |
| `src/domain/ledger.ts` | Suppress global new-sequence gap when any active sequence owns a positive recovery snapshot | No schema/data change |
| `e2e/features/bet-strategy.feature` | Verify duplicate allocation prevention and remaining-gap recalculation after closure | Uses FB-009 fixture and an open parallel base-stake sequence |
| `specs/FB-012-single-active-global-recovery/*` | Track implementation and verification | |

## Domain changes

```ts
export function calculateLedger(
  bets: Bet[],
  settings: StrategySettings,
): LedgerCalculation;
```

`newSequenceRecoveryGap` and `nextSuggestion` remain outputs of `calculateLedger`.
When an active sequence's first bet has `sequenceStartRecoveryGap > 0`, the returned
new-sequence gap is zero and the guide suggestion is base stake. The stored snapshots
and each sequence's `recoveryGap` are not changed.

## Data and migration

- **`LedgerState` shape:** Unchanged.
- **`localStorage` migration:** Not required.
- **Cloud schema:** Unchanged; use existing `sequence_start_recovery_gap`.
- **Backward compatibility:** Bets with no or zero recovery snapshot do not reserve
  global recovery. Existing positive snapshots identify their sequence's allocation.
- **Workbook import:** Unchanged; imported bets do not have FB-009 positive snapshots.

## Test strategy

- Add an E2E scenario with a positive global shortfall and one active recovery owner.
- Assert the first recovery allocation still uses the FB-009 suggestion.
- Assert a parallel independent bet is suggested and recorded at base stake.
- Close the owning sequence with a win using a stake that leaves a measurable
  shortfall.
- Assert a later new sequence recovers only the remaining shortfall.
- Preserve the existing FB-009 test that verifies an ordinary open sequence does not
  prevent a new sequence from recovering the global gap.
- Run `pnpm lint`, `pnpm build`, and `pnpm test:e2e`.

## Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Any open sequence is treated as recovery owner | Recovery would be blocked unnecessarily | Require a positive snapshot on that sequence's first bet |
| A lost recovery bet releases the reservation | Multiple sequences could claim one gap | Keep reservation while its sequence remains active; loss does not close it |
| Recovery remains blocked after its owner closes | User cannot recover a remaining gap | Derive reservation from active sequences on every calculation |
| A suppressed sequence's future open bet inherits recovery | Re-prices or changes its existing allocation | Never modify or backfill placed snapshots |
| Existing multiple recovery owners coexist | They continue to reserve until all close | Suppress new allocations while any positive-snapshot owner remains active |

## Constitution check

- I-II: No placement automation and no cloud dependency.
- III-IV: Reservation detection and stake suggestion remain deterministic domain logic;
  UI continues to display domain results.
- V: Existing per-sequence lifecycle is unchanged.
- VI: Existing stake and aggregate exposure controls still apply.
- VII: No persisted shape or cloud schema change.
- VIII: No secrets.
- IX: Regression is specified in Gherkin and E2E.
- X: All repository gates must pass.

## Rollback

Revert the domain suppression and its E2E scenario. No data migration or snapshot
cleanup is needed because existing recovery snapshots remain unchanged.
