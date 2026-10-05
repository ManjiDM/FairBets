# Spec: Record cancelled bets

| Field | Value |
| --- | --- |
| ID | `FB-015-cancelled-bets` |
| Status | Done |
| Created | 2026-10-05 |
| Related | [FB-009](../FB-009-recover-settled-profit-gap/spec.md), [FB-010](../FB-010-parallel-sequences/spec.md), [FB-014](../FB-014-manually-close-sequence/spec.md) |

> Describe **what** changes for the user and **why**. No file names, function names,
> library choices, or code. Mark unknowns as `[NEEDS CLARIFICATION: question]` and
> resolve them all before planning.

## Problem

A match can be cancelled after a bet has been recorded. The app currently only records
open, won, or lost results, so a cancelled match can be incorrectly left open or
recorded as a loss or win even though the stake was returned.

## Goal

Let the user mark a bet as cancelled. A cancelled bet returns its stake without
counting as a profit, loss, open exposure, expected profit, or recovery progress. A
cancelled bet by itself does not create a sequence. When a cancellation occurs within
an existing sequence, that sequence remains available for recovery and can continue
with another bet.

## Non-goals

- Automatically detecting cancelled matches or connecting to bookmaker services.
- Changing the stake or odds originally recorded for a bet.
- Treating a cancellation as a win or loss.
- Changing the existing goal-rate, recovery-weight, rounding, or risk-limit rules.
- Requiring a workbook format change.

## Users and scenarios

**Primary user:** A person recording a bet whose match was cancelled and whose stake
was returned.

The user can mark a bet cancelled instead of won or lost. If the cancelled bet was a
standalone bet, it remains visible as a cancelled bet but does not start or count as a
sequence. If it belongs to an existing sequence, it remains in that history as a
neutral result: the sequence does not close because of it, and the user can continue
the sequence using its prior recovery state.

The user may also correct a previously won or lost result to cancelled. The ledger is
recalculated as if that result had always been cancelled, preserving the outcomes the
user entered for all other bets while updating derived sequence stakes, statuses,
expected profit, and P&L.

## Functional requirements

- **FR-1** A bet result MUST support Open, Won, Lost, and Cancelled.
- **FR-2** The user MUST be able to change a bet's result to Cancelled, including when
  it was previously recorded as Won or Lost.
- **FR-3** A cancelled bet MUST have zero profit and zero expected profit. It MUST NOT
  count as a win or loss.
- **FR-4** A cancelled bet MUST NOT count as open exposure. Its recorded stake is
  returned: cancelling an open bet releases its reserved exposure without reducing
  settled balance; correcting a loss to cancelled restores that lost stake to settled
  balance; correcting a win to cancelled removes that bet's recorded profit.
- **FR-5** Cancelled bets MUST NOT increase the ledger's expected-profit target or
  sequence recovery progress.
- **FR-6** A standalone cancelled bet MUST remain visible and auditable, but MUST NOT
  create a sequence or count as a sequence.
- **FR-7** A cancelled bet within a sequence MUST remain in that sequence's history,
  MUST NOT close that sequence, and MUST leave its recovery calculation to continue
  from the other non-cancelled results.
- **FR-8** If a cancelled bet is the latest bet in an existing sequence, the user MUST
  be able to continue that sequence with its plus control, subject to the existing
  one-open-bet-per-sequence rule.
- **FR-9** Cancelling a result MUST recalculate the affected sequence and ledger as if
  the bet had been cancelled from the start. Other bet outcomes remain unchanged;
  derived stakes and sequence statuses follow the existing sequence rules.
- **FR-10** If correcting a prior result removes the win that closed a sequence, that
  sequence MUST become active unless another remaining win or explicit manual closure
  still closes it. It MUST NOT gain an extra bet automatically.
- **FR-11** A sequence whose bets are all cancelled MUST NOT count as a sequence; its
  cancelled bets remain visible as standalone cancelled records.
- **FR-12** New independent bets MUST continue to use FB-009 recovery against current
  settled P&L and expected profit multiplied by the goal rate. Active recovery
  sequences MUST continue to reserve recovery as specified in FB-012.
- **FR-13** Cancellation state MUST persist after local reload and cloud restore.
  Existing saved bets without a cancelled result MUST remain readable.

## Business rules

| Input | Expected result | Notes |
| --- | --- | --- |
| Open bet is marked Cancelled | Bet is settled with zero P&L; open exposure is released | Stake is returned |
| Lost bet is changed to Cancelled | Its loss is removed from settled P&L and recovery progress | Recalculate derived sequence state |
| Won bet is changed to Cancelled | Its profit and expected profit are removed | Recalculate later stakes and sequence status |
| A standalone bet is Cancelled | Show a cancelled bet record; do not create or count a sequence | No recovery sequence is started |
| A bet in an existing sequence is Cancelled | Keep the record in that sequence; add no P&L or expected profit | Cancellation is neutral |
| Latest bet in an active sequence is Cancelled | Keep sequence active and show its plus control | Continue prior recovery |
| All bets belonging to a sequence are Cancelled | Show the cancelled records outside sequence counts | No active or closed sequence |
| A cancelled outcome is restored to Won or Lost | Recalculate using the newly selected outcome | User may correct an earlier result |

## Acceptance scenarios

```gherkin
Scenario: Cancel an open bet and return its stake
  Given an open bet with a stake of €1
  When I mark that bet as Cancelled
  Then the bet should show as Cancelled
  And its profit should be €0
  And its open exposure should be €0
  And the settled balance should be unchanged
```

```gherkin
Scenario: A cancelled standalone bet does not create a sequence
  Given I record a new independent bet
  When I mark that bet as Cancelled
  Then the cancelled bet should remain visible
  And it should not count as an active or closed sequence
  And it should not contribute to expected profit or settled P&L
```

```gherkin
Scenario: Cancellation inside a sequence preserves its recovery path
  Given a sequence contains a settled loss
  And I add another bet to that sequence
  When I mark the new bet as Cancelled
  Then the sequence should remain active
  And its settled loss and recovery gap should remain unchanged
  And its plus button should be available to continue the sequence
```

```gherkin
Scenario: A cancelled bet does not close a sequence
  Given a sequence has a settled loss
  And its next bet is cancelled
  When I continue the sequence with another bet
  Then the new bet should belong to the same sequence
  And its suggested stake should use the sequence's existing recovery state
```

```gherkin
Scenario: Correcting a loss to cancelled recalculates the ledger
  Given a bet is recorded as lost
  When I change its result to Cancelled
  Then its loss should be removed from settled P&L
  And it should add no expected profit
  And the ledger and sequence recovery calculations should be updated
```

```gherkin
Scenario: Correcting a closing win to cancelled reopens an unfinished sequence
  Given a win is the only result that closed a sequence
  When I change that win to Cancelled
  Then the win's profit and expected profit should be removed
  And the sequence should become active
  And the cancelled bet should not close the sequence
```

```gherkin
Scenario: Cancellation persists after reload
  Given a bet is marked Cancelled
  When I reload the ledger
  Then the bet should still show as Cancelled
  And its zero-profit result and sequence membership should be unchanged
```

## Edge cases

- A cancellation is the only bet in an independent sequence.
- A sequence consists only of cancelled bets after prior results are corrected.
- The latest bet in a sequence is cancelled and the user continues it.
- A cancelled bet occurs between a loss and a later win in the same sequence.
- A win that previously closed a sequence is corrected to cancelled.
- A loss is corrected to cancelled, changing settled balance and a recovery gap.
- A cancelled bet is corrected back to won or lost.
- An active sequence has an open bet while a different bet is cancelled.
- Cancelling a recovery-owning bet changes its recovery snapshot's actual realized
  result; recovery ownership still follows FB-012 for active sequences.
- A user reloads or restores the ledger after cancellation.

## Data impact

The bet outcome gains a Cancelled value. The local ledger can store this as the bet's
outcome without adding a separate record. Cloud storage must allow and parse the new
outcome through an additive migration while retaining existing Won, Lost, and Open
records. Cancelled standalone records must remain available to the UI even though they
do not belong to a sequence. Workbook import columns remain unchanged.

## Constitution check

Cancellation is a neutral result, not an additional way to close a sequence. It
releases open exposure or reverses the financial contribution of a corrected settled
result, but does not create profit/loss or expected profit. A standalone cancellation
does not start a sequence. In an existing sequence, only a win or the explicit FB-014
manual close closes it; cancellation leaves recovery continuation available.

- [x] I. Private tracker, never an operator
- [x] II. Local-first
- [x] III. Deterministic domain logic
- [x] IV. UI and domain stay separated
- [x] V. Sequence model preserved; cancellation is neutral and does not close it
- [x] VI. Risk limits stay enforced
- [x] VII. Data compatibility preserved
- [x] VIII. No secrets introduced
- [x] IX. Behaviour specified in Gherkin
- [x] X. Gates pass

## Open questions

None. Cancellation can be selected for an open, won, or lost bet. Changing a prior
result recalculates the ledger as if it had always been cancelled, while preserving
other entered outcomes. A cancelled standalone bet is visible outside sequence
counts; a cancelled bet in an existing sequence remains neutral and continuable.

## Out of scope for now

Changing imported workbook columns, automatically cancelling related bets, and
automatically determining whether a match was cancelled.
