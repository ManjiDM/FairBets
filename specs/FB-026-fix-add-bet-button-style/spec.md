# Bugfix: Make the green Add Bet button flat like other buttons

| Field | Value |
| --- | --- |
| ID | `FB-026-fix-add-bet-button-style` |
| Status | Reproduced |
| Severity | Cosmetic |
| Created | 2026-10-10 |
| Related | [FB-020](../FB-020-sequences-toolbar-add-bet/spec.md) |

## Observed behaviour

The green Add Bet icon button has a darker lower edge (a solid drop shadow) and lifts with
a growing shadow on hover, a pseudo-3D effect no other button has.

## Expected behaviour

The button is flat like the other buttons: no drop shadow and no lift animation, in both
rest and hover states. It keeps its green colour; hover may only slightly change the
background tone.

## Reproduction

1. Open the Sequences view. Inspect the green + button, then hover over it.

Observed: a solid darker shadow under the button that deepens on hover and a lift.

Expected: no shadow and no movement.

## Arithmetic check

Not applicable; presentation only. No business behaviour changes.

## Root cause

`.button-primary` defines `box-shadow: 0 4px 0 #abc96f`, deepened on hover, and `.button`
translates every button up on hover.

- **Introduced by:** original primary button styling.
- **Why tests missed it:** no scenario asserts button visual style.

## Blast radius

- Calculations, persisted ledgers and cloud copies: none.
- Scope: only the icon-only primary button (Add Bet and the matching form submit);
  other buttons are untouched.

## Regression scenario

```gherkin
Scenario: The Add Bet button is flat
  Then the Add Bet button has no drop shadow
  When I hover over the Add Bet button
  Then the Add Bet button still has no drop shadow and does not move
```

Where it lands:

- [x] `e2e/features/bets.feature` — automatable through the UI
- [ ] Not automatable

## Fix

Remove the shadow and hover lift for icon-only primary buttons, using a subtle green
background change on hover.

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
