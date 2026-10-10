# Bugfix: Keep the bet modal below the toolbar and size the filter input

| Field | Value |
| --- | --- |
| ID | `FB-030-fix-modal-offset-filter-width` |
| Status | Reproducing |
| Severity | Cosmetic |
| Created | 2026-10-10 |
| Related | None |

## Observed behaviour

1. The Add a bet modal is centred over the whole viewport, so its backdrop and card cover
   the top toolbar. On short viewports the card can reach the very top of the screen.
2. The description filter input is a fixed 360px on desktop, which is neither half of the
   filter row nor full width on mobile.

## Expected behaviour

1. The bet modal always starts below the top toolbar, on desktop and mobile. The toolbar
   stays visible and unobscured while the modal is open, and the modal's maximum height
   is limited to the space beneath the toolbar.
2. On desktop the description filter input is half the width of the filter row. On mobile
   it is the full width of the row, with the status filter and the + button on the
   following row.

This is a presentation-only correction; ledger behaviour is unchanged. Nothing in
`src/domain/` is involved, so the source of truth is the visual layout described in
FB-020, FB-021 and FB-029.

## Reproduction

```text
Viewport: desktop (1280x720) and small phone (390x844)
Action:   open Sequences, press +
Observed: the dialog backdrop starts at y=0 and covers the toolbar
Expected: the dialog starts at or below the toolbar's bottom edge

Action:   open Sequences, look at the filter row
Observed: input width is 360px
Expected: desktop ~50% of the row; mobile 100% of the row
```

## Arithmetic check

Not applicable; no money figures are involved.

## Root cause

- `.modal-backdrop` is `position: fixed; inset: 0` with centred content and no offset for
  the sticky `.topbar`.
- `.description-filter` uses `width: min(360px, 100%)` rather than a proportion of the
  filter row.
- **Introduced by:** the original modal and FB-027/FB-028 filter styling.
- **Why tests missed it:** no scenario asserted geometry of the modal or the filter input.

## Blast radius

- The same `.modal-backdrop` hosts the settings and other dialogs; they also start below
  the toolbar, which is intended.
- No persisted data, cloud data, or calculations are affected.

## Regression scenario

```gherkin
Scenario: The new bet dialog starts below the toolbar
  When I press the Add Bet button
  Then the dialog should start below the toolbar

Scenario: The new bet dialog starts below the toolbar on mobile
  Given the viewport is a small phone
  When I press the Add Bet button
  Then the dialog should start below the toolbar

Scenario: The filter input is half the row on desktop
  Then the description filter should be about half the width of the filter row

Scenario: The filter input is full width on mobile
  Given the viewport is a small phone
  Then the description filter should be the full width of the filter row
```

Where it lands:

- [x] `e2e/features/bets.feature` — automatable through the UI

## Fix

Add a `--topbar-height` variable matching the toolbar's height per breakpoint, offset
`.modal-backdrop` and cap `.bet-modal` height by it, and size `.description-filter` at 50%
of the row (100% under the mobile breakpoint).

## Constitution check

- [x] III. Domain logic stays pure and deterministic
- [x] IV. No money math moved into the UI to make the fix easier
- [x] V. Sequence model preserved
- [x] VI. Risk limits still enforced
- [x] VII. Existing saved ledgers still load and compute correctly

## Verification

- [ ] Regression scenarios failed before the fix (evidence recorded below)
- [ ] Regression scenarios pass after the fix
- [ ] `pnpm lint`
- [ ] `pnpm build`
- [ ] `pnpm test:e2e`
- [ ] A pre-existing saved ledger still loads with correct figures

**Evidence of the red state:**

```text
Pending.
```
