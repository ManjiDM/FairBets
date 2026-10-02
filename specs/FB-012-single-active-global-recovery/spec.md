# Spec: Prevent duplicate global recovery allocations

| Field | Value |
| --- | --- |
| ID | `FB-012-single-active-global-recovery` |
| Status | Shipped |
| Created | 2026-10-02 |
| Related | [FB-009](../FB-009-recover-settled-profit-gap/spec.md), [FB-010](../FB-010-parallel-sequences/spec.md) |

> Describe **what** changes for the user and **why**. No file names, function names,
> library choices, or code. Mark unknowns as `[NEEDS CLARIFICATION: question]` and
> resolve them all before planning.

## Problem

FB-009 lets a new sequence recover the ledger-wide shortfall between settled P&L and
the goal-rate-adjusted expected profit. Since FB-010 allows several sequences in
parallel, each new sequence can currently be suggested a recovery for the same
shortfall while an earlier recovery sequence is still active. This can allocate the
same ledger-wide recovery more than once.

## Goal

Allow at most one active sequence to carry a recovery allocation for the
ledger-wide shortfall. While such a sequence remains active, new independent
sequences start at base stake and do not add another global recovery allocation.

## Non-goals

- Changing recovery calculations within an existing sequence.
- Limiting the number of parallel sequences or open bets across different sequences.
- Changing base stake, recovery weight, rounding, max stake, or exposure rules.
- Automatically moving recovery amounts between active sequences.
- Re-pricing bets that have already been placed.

## Users and scenarios

**Primary user:** A person tracking several independent betting sequences.

If an active sequence is still recovering settled losses, another independent bet
should not also add the ledger-wide recovery amount. The additional bet starts at base
stake. An active sequence reserves recovery when its own settled results leave a
positive sequence recovery gap, or when it carries a positive FB-009 recovery
allocation that has not settled yet. Once every recovery-reserving sequence closes
with a win, a later new sequence may recover whatever global shortfall remains based
on current ledger results.

## Functional requirements

- **FR-1** An active sequence MUST reserve new-sequence global recovery while its
  sequence recovery gap is positive, or while one of its bets carries a positive
  FB-009 recovery-gap snapshot.
- **FR-2** While one or more active global-recovery sequences exist, a new independent
  sequence MUST have no ledger-wide recovery added to its suggested stake. Its
  suggestion MUST use base stake and the selected odds, subject to existing strategy
  and risk rules.
- **FR-3** Bets added to an existing sequence MUST continue to use that sequence's
  recovery calculation and MUST NOT be treated as new global-recovery allocations.
- **FR-4** An active sequence whose recovery gap and FB-009 recovery snapshots are
  both zero MUST NOT reserve global recovery solely because it has an open bet.
- **FR-5** When the last active global-recovery sequence closes with a win, the next
  new-sequence suggestion MUST recalculate any remaining ledger-wide shortfall from
  current settled P&L and expected profit.
- **FR-6** Closing one of multiple active global-recovery sequences MUST NOT release
  the global recovery allocation while another such sequence remains active.
- **FR-7** Recovery suppression MUST NOT change the recovery-gap snapshot or stake of
  any already placed bet.
- **FR-8** New-sequence recovery MUST continue to respect recovery weight, rounding,
  maximum stake, and aggregate open-exposure limits.

## Business rules

| Input | Expected result | Notes |
| --- | --- | --- |
| One active sequence has a positive sequence recovery gap | A new independent bet is suggested at base stake | Existing sequence is recovering settled losses |
| One active sequence has a positive FB-009 snapshot but no settled sequence gap yet | A new independent bet is suggested at base stake | Includes an open recovery allocation |
| All active sequences have zero recovery gap and zero recovery snapshots | New independent bet uses the current ledger-wide shortfall | An ordinary open bet alone does not reserve recovery |
| All recovery-owning sequences close, and settled P&L remains below target | A later new sequence receives the remaining shortfall recovery | Recalculate using current totals |
| Add a bet through a sequence's plus control | Use that sequence's recovery calculation | Not a separate global allocation |

## Acceptance scenarios

```gherkin
Scenario: Do not allocate the global shortfall to parallel new sequences twice
  Given the ledger has a positive global recovery shortfall
  When I record a new sequence with a positive recovery allocation and leave it active
  And I prepare a separate new bet
  Then the separate bet should be suggested at base stake
  And the active recovery allocation should remain unchanged
```

```gherkin
Scenario: Recalculate remaining shortfall after the recovery sequence closes
  Given a sequence owns an active positive global-recovery allocation
  And another independent sequence has no recovery allocation
  When the recovery sequence closes with a win
  And settled P&L remains below the current expected-profit target
  Then a later new sequence should be suggested to recover only the remaining shortfall
```

```gherkin
Scenario: An open sequence without recovery allocation does not suppress recovery
  Given there is no active sequence with a positive global-recovery allocation
  And another sequence has an open bet
  And the ledger has a positive global recovery shortfall
  When I prepare a new independent bet
  Then its suggestion should include the current global recovery shortfall
```

```gherkin
Scenario: Active loss-recovery sequences suppress a duplicate global recovery
  Given multiple active sequences have settled losses and positive sequence recovery gaps
  And the ledger has a positive global recovery shortfall
  When I prepare a new independent bet
  Then its suggestion should be the base stake
  And the existing sequence recovery should remain available
```

## Edge cases

- The recovery-owning sequence's latest bet is lost; its recovery reservation remains
  active until a later win closes that sequence.
- The recovery-owning sequence has an open bet; it continues to reserve the
  allocation.
- More than one recovery-owning sequence already exists in saved data; new allocations
  remain suppressed until all such sequences close.
- A suppressed new sequence remains open after the recovery-owning sequence closes;
  it does not acquire the former sequence's recovery snapshot retroactively.
- The recovery-owning sequence closes, but the settled result meets or exceeds the
  target; a new sequence starts at base stake.
- Maximum stake or combined open exposure constrains a suggestion.

## Data impact

None. Use the existing per-bet new-sequence recovery snapshot to recognize active
recovery-owning sequences. No local-storage migration, cloud schema change, or workbook
layout change is required.

## Constitution check

Confirm against [`../constitution.md`](../constitution.md), noting anything that needs
discussion.

- [x] I. Private tracker, never an operator
- [x] II. Local-first
- [x] III. Deterministic domain logic
- [x] IV. UI and domain stay separated
- [x] V. The sequence model is preserved
- [x] VI. Risk limits stay enforced
- [x] VII. Data compatibility preserved
- [x] VIII. No secrets introduced
- [x] IX. Behaviour specified in Gherkin
- [x] X. Gates pass

## Open questions

The user clarified that any sequence already recovering losses must prevent a parallel
new sequence from allocating the same ledger shortfall. A positive FB-009 snapshot
also reserves recovery before an open recovery bet has settled.

## Verification

- [x] The duplicate-allocation E2E regression failed before implementation
  (`€3.00` suggested instead of the expected `€1.00` for a parallel independent bet).
- [x] While the recovery owner is active, another independent bet uses base stake.
- [x] Multiple active loss-recovery sequences without positive FB-009 snapshots also
  suppress new-sequence recovery.
- [x] After the owner wins and closes, the next independent bet recovers only the
  remaining ledger shortfall (`€2.00` in the scenario).
- [x] Existing FB-009 recovery behavior remains available when active sequences do
  not carry a positive recovery snapshot.
- [x] `pnpm lint`
- [x] `pnpm build`
- [x] `pnpm test:e2e` (33 scenarios, 366 steps)

## Out of scope for now

Redesigning recovery ownership or allowing a single shortfall to be intentionally
distributed among multiple active sequences.
