# Bugfix: Size and nest card action buttons consistently

| Field | Value |
| --- | --- |
| ID | `FB-024-fix-grouped-card-action-buttons` |
| Status | Verified |
| Severity | Cosmetic |
| Created | 2026-10-10 |
| Related | [FB-022](../FB-022-fix-bet-sequence-action-icons/spec.md) |

## Observed behaviour

On a bet card the Won, Lost and Cancelled buttons are small and separated, while Edit and
Delete are larger and nested into one joined control. On an active sequence card the
Close, Add and Delete buttons are likewise small and separate.

## Expected behaviour

- Won, Lost and Cancelled have the same size as the Edit and Delete buttons and are
  nested into one joined control with shared border and no gap. The middle button is
  square-cornered; only the ends of the group are rounded.
- The sequence-level buttons (Close sequence, Add bet to sequence, Delete) are sized and
  nested the same way.
- Each button keeps its tint, icon, name and behaviour.

## Reproduction

1. Start a fresh ledger and add an open bet. Inspect Won/Lost/Cancelled and Edit/Delete.
2. Mark it Lost, add a second bet and mark it Lost. Inspect the active sequence card.

Observed: different sizes, gaps between buttons.

Expected: equal sizes, no gaps inside each group.

## Arithmetic check

Not applicable; presentation only. No business behaviour changes.

## Root cause

Outcome and sequence buttons use standalone 30px styling; only Edit/Delete were wrapped
in the joined control (`compact-sequence-actions`) introduced earlier.

- **Introduced by:** incremental button styling in FB-019 and FB-022.
- **Why tests missed it:** no scenario asserts button size or nesting.

## Blast radius

- Calculations, persisted ledgers and cloud copies: none.
- Behaviour: handlers, confirmation flow and accessible names are unchanged.

## Regression scenario

```gherkin
Scenario: Card action buttons share one size and are nested in groups
  Given an open bet
  Then Won, Lost, Cancelled, Edit and Delete have the same size
  And Won, Lost and Cancelled are nested without gaps
  Given an active sequence with two bets
  Then Close sequence, Add bet and Delete have the same size and are nested without gaps
```

Where it lands:

- [x] `e2e/features/bets.feature` — automatable through the UI
- [x] Not automatable

## Fix

Render the outcome buttons and the sequence-level buttons inside the joined control and
size every grouped button identically.

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

Before the fix the outcome buttons were smaller than Edit/Delete:

```text
Expected: <= 1
Received: 8   (width difference between Won and Edit)

67 scenarios (5 failed, 62 passed)
```

The sequence scenario's step selector was then tightened to the card's own actions
(the card also contains nested bet Delete buttons) before verifying it.

After the fix Won/Lost/Cancelled and the sequence-level Close/Add/Delete buttons share
the Edit/Delete size and sit in joined groups; both scenarios pass.

```text
pnpm lint: passed
pnpm build: passed
```
