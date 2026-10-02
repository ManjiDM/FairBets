# Spec: Recover the gap between settled and expected profit

| Field | Value |
| --- | --- |
| ID | `FB-009-recover-settled-profit-gap` |
| Status | Draft |
| Created | 2026-10-02 |
| Related | — |

> Describe **what** changes for the user and **why**. No file names, function names,
> library choices, or code. Mark unknowns as `[NEEDS CLARIFICATION: question]` and
> resolve them all before planning.

## Problem

When deciding the stake for a new bet, the user wants the suggested amount to account
for whether settled profit is ahead of or behind expected profit. The intended
comparison and how it interacts with the existing sequence recovery rules need to be
made explicit before changing stake calculations.

## Goal

Use the difference between expected profit and settled profit to determine whether a
new bet starts at the base stake or includes a recovery amount.

## Non-goals

- Automatically placing bets or predicting outcomes.
- Changing bet settlement or recorded results.
- Changing the configured goal rate or risk limits.

## Users and scenarios

**Primary user:** A person tracking their own betting sequences.

When placing a new bet, the user expects the suggested stake to reflect whether the
settled result has reached the expected profit target. If the settled result is behind
the target, the difference may be recovered with the new stake; otherwise the next bet
starts at the base stake.

## Functional requirements

- **FR-1** Before suggesting a new bet's stake, the app MUST compare the settled result
  with the expected profit.
- **FR-2** If settled profit is below expected profit, the new suggested stake MUST
  include recovery for the difference.
- **FR-3** If settled profit is at or above expected profit, the new suggested stake
  MUST start at the configured base stake.
- **FR-4** The suggestion MUST continue to respect the configured recovery weight,
  rounding, maximum stake, and open-exposure limits.
- **FR-5** A win MUST continue to close the active sequence.

## Business rules

The comparison basis is unresolved.

| Input | Expected result | Notes |
| --- | --- | --- |
| Settled profit below expected profit | [NEEDS CLARIFICATION: Which settled and expected totals are compared, and how does goal rate apply?] | |
| Settled profit equal to or above expected profit | Base-stake suggestion | Confirm equality behavior |

## Acceptance scenarios

```gherkin
Scenario: Recover the difference when settled profit is below expected profit
  Given [NEEDS CLARIFICATION: the exact bets, odds, base stake, goal rate, and totals]
  When I prepare a new bet
  Then the suggested stake should include recovery for the difference
```

```gherkin
Scenario: Start at the base stake when settled profit has met expected profit
  Given [NEEDS CLARIFICATION: the exact bets, odds, base stake, goal rate, and totals]
  When I prepare a new bet
  Then the suggested stake should be the base stake
```

## Edge cases

- Settled profit exactly equals expected profit.
- Open bets exist when a new suggestion is calculated.
- The recovery amount exceeds the maximum stake.
- The goal rate is below 100%.

## Data impact

None expected. No saved ledger, local storage, cloud schema, or workbook format changes
are anticipated.

## Constitution check

Confirm against [`../constitution.md`](../constitution.md), noting anything that needs
discussion.

- [ ] I. Private tracker, never an operator
- [ ] II. Local-first
- [ ] III. Deterministic domain logic
- [ ] IV. UI and domain stay separated
- [ ] V. The sequence model is preserved
- [ ] VI. Risk limits stay enforced
- [ ] VII. Data compatibility preserved
- [ ] VIII. No secrets introduced
- [ ] IX. Behaviour specified in Gherkin
- [ ] X. Gates pass

## Open questions

- [NEEDS CLARIFICATION: Does "settled result" mean the current sequence's net profit or the ledger-wide settled P&L?]
- [NEEDS CLARIFICATION: Is "expected profit" the ledger's expected profit from base stakes, or that amount adjusted by the configured goal rate?]
- [NEEDS CLARIFICATION: Should a win always close the sequence, with this comparison only affecting the next sequence, or should recovery continue across wins until the target is met?]
- [NEEDS CLARIFICATION: What exact numeric example should define the recovery stake, including outcome history, starting balance, odds, base stake, and goal rate?]

## Out of scope for now

Changes to how recorded bets are settled or to the meaning of the displayed settled
balance.
