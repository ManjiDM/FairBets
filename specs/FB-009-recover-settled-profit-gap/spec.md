# Spec: Recover the gap between settled and expected profit

| Field | Value |
| --- | --- |
| ID | `FB-009-recover-settled-profit-gap` |
| Status | Shipped |
| Created | 2026-10-02 |
| Related | — |

> Describe **what** changes for the user and **why**. No file names, function names,
> library choices, or code. Mark unknowns as `[NEEDS CLARIFICATION: question]` and
> resolve them all before planning.

## Problem

When all sequences are closed and the user starts a new bet, the suggested stake does
not account for the difference between the ledger-wide settled P&L and its
goal-rate-adjusted expected profit.

## Goal

When starting a new sequence, compare ledger-wide settled P&L with the
goal-rate-adjusted expected-profit target. If settled P&L is below the target, suggest
the configured base stake plus enough recovery stake, at the selected odds, to cover
the gap.

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

- **FR-1** When a new bet starts a sequence and there is no active sequence, the app
  MUST compare ledger-wide settled P&L with the goal-rate-adjusted expected-profit
  target.
- **FR-2** Expected-profit target MUST be the ledger-wide expected profit multiplied
  by the configured goal rate.
- **FR-3** If settled P&L is below the target, the suggested stake MUST be the base
  stake plus recovery for the difference, calculated using the new bet's selected
  odds.
- **FR-4** If settled P&L is equal to or above the target, the suggested stake MUST be
  the configured base stake.
- **FR-5** This ledger-wide comparison MUST NOT change stake recovery within an active
  sequence.
- **FR-6** Recovery MUST continue to respect configured recovery weight, rounding, and
  maximum-stake rules.
- **FR-7** A win MUST continue to close the active sequence. This feature applies only
  when starting a new sequence.
- **FR-8** Once placed, a bet's new-sequence recovery basis MUST be retained so that
  this feature does not re-price bets recorded before it was introduced.

## Business rules

| Input | Expected result | Notes |
| --- | --- | --- |
| Settled P&L is below expected profit × goal rate | Base stake plus recovery of the shortfall at the selected odds | Applies only when no sequence is active |
| Settled P&L equals or exceeds expected profit × goal rate | Base-stake suggestion | |
| Base stake €1; goal rate 100%; settled P&L €0; expected profit €1; new odds 1.50; recovery weight 100% | Suggested stake €3 | The €2 recovery portion earns €1 at 1.50 odds, covering the €1 shortfall; the base portion remains the new bet's normal stake |

## Acceptance scenarios

```gherkin
Scenario: Recover the ledger-wide shortfall when starting a new sequence
  Given all sequences are closed
  And settled P&L is €0
  And expected profit is €1 with a 100% goal rate
  And the base stake is €1 with 100% recovery weight
  When I prepare a new bet at odds 1.50
  Then the suggested stake should be €3
```

```gherkin
Scenario: Start at the base stake when settled profit has met expected profit
  Given all sequences are closed
  And settled P&L is equal to or above expected profit multiplied by the goal rate
  When I prepare a new bet
  Then the suggested stake should be the base stake
```

```gherkin
Scenario: Do not apply ledger-wide recovery within an active sequence
  Given a sequence is active
  When I prepare another bet in that sequence
  Then the suggested stake should use the existing sequence recovery calculation
```

## Regression status

The new-sequence shortfall scenario fails before implementation: with a €1 ledger
shortfall and a 1.50 selected odd, the preview suggests only the €1 base stake instead
of €3.

```text
pnpm test:e2e
28 scenarios (1 failed, 27 passed)
237 steps (1 failed, 6 skipped, 230 passed)
Expected: €3.00
Received: €1.00
```

## Edge cases

- Settled profit exactly equals expected profit.
- Open bets exist when a new suggestion is calculated.
- The recovery amount exceeds the maximum stake.
- Settled P&L equals the goal-rate-adjusted expected-profit target.
- The goal rate is below 100%.

## Data impact

Newly placed bets may store an optional recovery-gap snapshot to preserve the
new-sequence stake calculation. Existing local and cloud bets without this value must
continue to load and retain their previously calculated stake behavior. Cloud storage
requires a nullable column migration and matching parser/writer support. Workbook
imports remain unchanged and do not set the optional value.

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

## Verification

- [x] New-sequence shortfall regression failed before implementation and passes after it.
- [x] A new sequence at the expected-profit target starts at the base stake.
- [x] Active-sequence recovery retains the existing stake calculation.
- [x] The placed recovery gap and historical stakes persist unchanged after local reload.
- [x] `pnpm lint`
- [x] `pnpm build`
- [x] `pnpm test:e2e`
- [x] Cloud schema, migration, and parser/writer changes reviewed; live cloud round-trip
  remains environment-dependent.

## Open questions

None. The comparison is ledger-wide settled P&L against ledger expected profit
multiplied by goal rate. It only affects a new sequence when no sequence is active;
bets inside an active sequence retain the existing recovery calculation. Previously
placed bets keep their existing recovery basis and are not re-priced.

## Out of scope for now

Changes to how recorded bets are settled or to the meaning of the displayed settled
balance.
