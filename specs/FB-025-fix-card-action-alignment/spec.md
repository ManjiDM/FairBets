# Bugfix: Align card action groups to the card edges

| Field | Value |
| --- | --- |
| ID | `FB-025-fix-card-action-alignment` |
| Status | Verified |
| Severity | Cosmetic |
| Created | 2026-10-10 |
| Related | [FB-024](../FB-024-fix-grouped-card-action-buttons/spec.md) |

## Observed behaviour

On narrow (mobile) screens the bet card's actions are packed to the left, so Edit/Delete
sit next to Won/Lost/Cancelled instead of at the right edge.

## Expected behaviour

On every viewport, the Won/Lost/Cancelled group is aligned to the left of the card's
actions row, and the Edit/Delete group is always aligned to the right. Sequence-level
buttons (Close sequence, Add bet, Delete) are aligned to the right of the sequence card.
Cards without outcome buttons (settled bets) still place Edit/Delete at the right.

## Reproduction

1. Use a small phone viewport. Start a fresh ledger and add an open bet.
2. Inspect the bet card's action row.

Observed: all buttons packed left.

Expected: outcome group at the left edge, Edit/Delete at the right edge.

## Arithmetic check

Not applicable; presentation only. No business behaviour changes.

## Root cause

The mobile layout sets `justify-content: flex-start` on the action row and nothing pushes
the Edit/Delete group to the end.

- **Introduced by:** mobile layout of `single-bet-actions`.
- **Why tests missed it:** no scenario asserts action alignment on bet cards.

## Blast radius

- Calculations, persisted ledgers and cloud copies: none.
- Behaviour: unchanged; layout only.

## Regression scenario

```gherkin
Scenario: Bet card action groups are aligned to opposite edges on mobile
  Given the viewport is a small phone
  And an open bet
  Then the outcome buttons are at the left of the bet card
  And the Edit and Delete buttons are at the right of the bet card
```

Where it lands:

- [x] `e2e/features/bets.feature` — automatable through the UI
- [x] Not automatable

## Fix

Space the action row's groups apart, keeping the outcome group left and the Edit/Delete
(and sequence) group right.

## Constitution check

- [x] III. Domain logic stays pure and deterministic
- [x] IV. No money math moved into the UI to make the fix easier
- [x] V. Sequence model preserved
- [x] VI. Risk limits still enforced
- [x] VII. Existing saved ledgers still load and compute correctly

## Verification

- [x] Regression scenario failed before the fix (evidence recorded below)
- [x] Regression scenario passes after the fix
- [x] `pnpm lint`
- [x] `pnpm build`
- [x] `pnpm test:e2e`
- [x] A pre-existing saved ledger still loads with correct figures

**Evidence of the red state:**

Before the fix on a 390px viewport the Delete button was far from the card's right edge:

```text
Expected: <= 20
Received: 158   (distance from Delete to the card's right edge)

67 scenarios (5 failed, 62 passed)
```

After the fix the Edit/Delete (and sequence) group is pushed to the right edge while
Won/Lost/Cancelled stay at the left; the scenario passes.

```text
pnpm lint: passed
pnpm build: passed
```
