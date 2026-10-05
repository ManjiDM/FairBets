# Spec: Manually close a sequence after a loss

| Field | Value |
| --- | --- |
| ID | `FB-014-manually-close-sequence` |
| Status | Shipped |
| Created | 2026-10-05 |
| Related | [FB-009](../FB-009-recover-settled-profit-gap/spec.md), [FB-010](../FB-010-parallel-sequences/spec.md), [FB-012](../FB-012-single-active-global-recovery/spec.md) |

> Describe **what** changes for the user and **why**. No file names, function names,
> library choices, or code. Mark unknowns as `[NEEDS CLARIFICATION: question]` and
> resolve them all before planning.

## Problem

A sequence currently remains active after a loss until a later bet wins. A user may
choose to stop continuing that sequence and accept its settled loss, but has no way to
close it manually. While it remains active, it can reserve recovery and prevent a new
independent bet from recovering the ledger-wide shortfall.

## Goal

Let the user explicitly close an active sequence after its latest bet has settled as a
loss. Keep its recorded results and settled P&L unchanged. Once all active recovery
allocations have been closed, a later independent bet can use the existing
goal-rate-adjusted ledger recovery calculation for any remaining shortfall.

## Non-goals

- Treating an open bet as a loss, cancelling it, or otherwise changing its outcome.
- Changing the outcome or financial result of any recorded bet.
- Changing the goal rate, recovery formula, recovery weight, rounding, or risk limits.
- Reopening a manually closed sequence.
- Changing the rule that a win closes its sequence automatically.
- Automatically placing bets or predicting outcomes.

## Users and scenarios

**Primary user:** A person who has recorded a loss and chooses not to continue that
sequence.

After a bet is marked lost, the user may close that sequence instead of adding another
bet to it. Its loss remains in settled P&L. A new independent sequence follows the
existing ledger-wide recovery rule when settled P&L is below expected profit multiplied
by the configured goal rate, provided no other active sequence is reserving that
recovery.

## Functional requirements

- **FR-1** The user MUST be able to manually close an active sequence when its latest
  bet is settled as lost.
- **FR-2** A sequence with an open bet MUST NOT be manually closable. Open bets remain
  exposure and MUST NOT be silently recorded as losses or cancelled.
- **FR-3** A win MUST continue to close its sequence automatically as before.
- **FR-4** Manually closing a sequence MUST NOT change any bet outcome, stake, settled
  profit, expected profit, or balance.
- **FR-5** A manually closed sequence MUST remain closed after reload and cloud
  restore. Its existing bets and membership MUST remain intact.
- **FR-6** A manually closed sequence MUST no longer reserve global recovery solely
  because it previously had a recovery gap or recovery snapshot.
- **FR-7** Closing one recovery-reserving sequence MUST NOT release global recovery
  while another active sequence still reserves it, as specified in FB-012.
- **FR-8** When no active sequence reserves recovery, a new independent bet MUST use
  the existing FB-009 comparison of settled P&L against expected profit multiplied by
  the configured goal rate. If settled P&L is below that target, the new bet's
  suggestion MUST include recovery of the remaining shortfall at the selected odds.
- **FR-9** A manually closed sequence MUST NOT offer a control to continue that
  sequence. A later bet entered with the main Add Bet action starts a separate
  sequence.
- **FR-10** The close action MUST only be offered for a sequence that can be manually
  closed under FR-1 and FR-2.

## Business rules

| Input | Expected result | Notes |
| --- | --- | --- |
| Active sequence's latest bet is lost | User can close the sequence | Accepts its existing settled result |
| Active sequence has an open bet | User cannot close it | Open exposure is not a settled loss |
| User closes a sequence after a loss | Sequence closes; all recorded results and ledger totals remain unchanged | No synthetic bet or outcome |
| Closed sequence was the only active recovery reserver | Its allocation is released; the next independent bet recalculates the current shortfall | Uses FB-009 target |
| Another active sequence still reserves recovery | New independent bet remains at base stake under FB-012 | Closing one sequence does not release another's reservation |
| Manually closed sequence is viewed or reloaded | It remains closed and cannot be continued | Membership and history persist |

## Acceptance scenarios

```gherkin
Scenario: Close a sequence after accepting its settled loss
  Given an active sequence whose latest bet is lost
  And the ledger has settled P&L of €-1
  When I close that sequence
  Then the sequence should be closed
  And the bet should remain lost
  And settled P&L should remain €-1
  And the sequence should no longer offer a continue action
```

```gherkin
Scenario: An open bet cannot be closed as a settled loss
  Given an active sequence has an open bet
  Then the sequence should not offer a close action
  And the open bet should remain open
```

```gherkin
Scenario: Recover the remaining ledger shortfall after closing the recovery sequence
  Given a sequence is the only active recovery reserver
  And settled P&L is below expected profit multiplied by the goal rate
  When I close that sequence after its latest bet is lost
  And I prepare a new independent bet
  Then the suggested stake should include recovery for the current shortfall
```

```gherkin
Scenario: Another active recovery sequence keeps the global allocation reserved
  Given two active sequences reserve global recovery
  When I close one sequence after its latest bet is lost
  And I prepare a new independent bet
  Then the suggested stake should not add another global recovery allocation
```

```gherkin
Scenario: Manual closure persists after reload
  Given I manually close a sequence after a settled loss
  When I reload the ledger
  Then the sequence should remain closed
  And its settled loss and bet history should be unchanged
  And it should not offer a continue action
```

## Edge cases

- The latest bet is open; closing is unavailable and the bet remains exposure.
- The latest bet is won; its sequence is already closed automatically.
- A sequence contains multiple settled losses before manual closure.
- More than one active sequence reserves recovery; closing only one must not release
  the remaining reservation.
- The sequence's recovery gap is zero but it has a positive FB-009 recovery snapshot.
- Settled P&L is equal to or above the goal-rate-adjusted expected-profit target after
  closure; a new independent sequence starts at base stake.
- The suggested recovery is constrained by the configured maximum stake.
- The user reloads the ledger or restores it from cloud storage after closure.

## Data impact

The ledger must retain whether a sequence was explicitly closed by the user, separate
from the individual bet outcomes. Existing local and cloud ledgers without manual-close
state must continue to load with their current sequence status. Cloud schema changes,
if needed, are detailed in the implementation plan and must preserve existing data.
Workbook import columns and grouping remain unchanged.

## Constitution check

This feature adds a deliberate early-termination path to Constitution V's rule that a
sequence closes on a win. Manual closure is allowed only after a settled loss; it
does not change any outcome, does not hide or settle open exposure, and does not alter
the existing win-based closure rule. Recovery follows the existing FB-009 and FB-012
rules.

- [x] I. Private tracker, never an operator
- [x] II. Local-first
- [x] III. Deterministic domain logic
- [x] IV. UI and domain stay separated
- [x] V. Sequence model preserved with the explicitly specified manual-close exception
- [x] VI. Risk limits stay enforced
- [x] VII. Data compatibility preserved
- [x] VIII. No secrets introduced
- [x] IX. Behaviour specified in Gherkin
- [x] X. Gates pass

## Open questions

None. Manual closure is available only after the latest bet is settled as lost.
Closing never changes bet outcomes. Any remaining recovery uses the existing
goal-rate-adjusted expected-profit target, and FB-012 continues to prevent duplicate
global recovery allocations while another active sequence reserves one.

## Verification

- [x] A lost single-bet sequence can be closed without changing its outcome or settled
  P&L.
- [x] An open bet cannot be manually closed.
- [x] A multi-bet sequence can be closed after its latest bet is lost.
- [x] Closing the only recovery-reserving sequence releases recovery for a new
  independent bet using the current FB-009 shortfall.
- [x] Closing one sequence does not release another active sequence's FB-012 recovery
  reservation.
- [x] Manual closure remains after reload and after editing the closed bet's label.
- [x] `pnpm lint`
- [x] `pnpm build`
- [x] `pnpm test:e2e` (42 scenarios, 474 steps)
- [x] Cloud schema, migration, and parser/writer updates reviewed; a live cloud
  round-trip remains environment-dependent.

## Out of scope for now

Closing a sequence that has an open bet, removing or reversing recorded bets, and
reopening a manually closed sequence.
