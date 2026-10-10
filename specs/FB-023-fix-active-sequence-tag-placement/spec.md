# Bugfix: Remove the redundant "In progress" text from active sequence cards

| Field | Value |
| --- | --- |
| ID | `FB-023-fix-active-sequence-tag-placement` |
| Status | Reproduced |
| Severity | Cosmetic |
| Created | 2026-10-10 |
| Related | [FB-022](../FB-022-fix-bet-sequence-action-icons/spec.md) |

## Observed behaviour

An active multi-bet sequence card shows the heading "In progress" and, in the action
cluster on the right, an "Active" tag. The two say the same thing. The tag also sits among
the action buttons, unlike the single-bet card, where the status tag sits directly below
the "Bet N" label.

## Expected behaviour

The "In progress" text is removed. The "Active" tag appears directly below the
"Sequence N" label, left-aligned with it, the same way the single-bet card places its tag
below "Bet N". The action cluster no longer contains the tag.

## Reproduction

1. Start a fresh ledger and add a bet, then mark it Lost.
2. Add a second bet to the same sequence and mark it Lost.
3. Inspect the active sequence card.

Observed: "In progress" heading plus an "Active" tag beside the action buttons.

Expected: no "In progress" text; the "Active" tag sits below "Sequence N".

## Arithmetic check

Not applicable; presentation only. No business behaviour changes.

## Root cause

The active sequence card was built with a descriptive heading and a status badge in its
actions area, before the status tag convention of the single-bet card existed.

- **Introduced by:** original active sequence card layout.
- **Why tests missed it:** no scenario asserts the card's status tag placement.

## Blast radius

- Calculations: none.
- Persisted ledgers and cloud copies: none; no data changes.
- Behaviour: status, sequence rules and actions are unchanged.

## Regression scenario

```gherkin
Scenario: An active sequence shows its Active tag below its number
  Given an active sequence with two bets
  Then the sequence card does not show "In progress"
  And its Active tag is directly below the sequence number
```

Where it lands:

- [x] `e2e/features/bets.feature` — automatable through the UI
- [ ] Not automatable

## Fix

Remove the heading and render the existing status badge below the sequence number.

## Constitution check

- [x] III. Domain logic stays pure and deterministic
- [x] IV. No money math moved into the UI to make the fix easier
- [x] V. Sequence model preserved
- [x] VI. Risk limits still enforced
- [x] VII. Existing saved ledgers still load and compute correctly

## Verification

- [ ] Regression scenario failed before the fix (evidence recorded below)
- [ ] Regression scenario passes after the fix
- [ ] `pnpm lint`
- [ ] `pnpm build`
- [ ] `pnpm test:e2e`
- [ ] A pre-existing saved ledger still loads with correct figures

**Evidence of the red state:**

_To be recorded._
