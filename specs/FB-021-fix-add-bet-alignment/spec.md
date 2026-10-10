# Bugfix: Right-align the sequence Add Bet button

| Field | Value |
| --- | --- |
| ID | `FB-021-fix-add-bet-alignment` |
| Status | Reproduced |
| Severity | Cosmetic |
| Created | 2026-10-10 |
| Related | None |

## Observed behaviour

In the Sequences view, the global + Add Bet button sits just to the right of the
sequence status filter instead of at the right edge of the sequence filter controls.
This is visible on desktop and mobile.

## Expected behaviour

The + Add Bet button is aligned with the right edge of the sequence filter controls at
both desktop and mobile widths. The search field and status filter remain in their
current positions. This is a presentation-only correction; ledger behavior is unchanged.

## Reproduction

Open the Sequences view at the desktop viewport and at the small-phone viewport used by
the E2E suite. Compare the right edge of the + button with the right edge of the search
and filter controls container.

Observed before the fix: the button's right edge was 211.08 CSS pixels left of the
controls container edge on desktop and 133.08 CSS pixels left on mobile.

## Arithmetic check

Not applicable; this cosmetic defect changes no financial calculation.

## Root cause

The sequence filter/action row sizes to its contents. It does not expand into the
remaining width of the controls row or distribute its filter and Add Bet children, so
the button follows immediately after the filter instead of aligning to the right edge.

- **Introduced by:** `FB-020-sequences-toolbar-add-bet`, which moved Add Bet into the
  filter row but did not right-align the group.
- **Why tests missed it:** The prior tests checked that the controls shared a row and
  did not overflow, but not that the Add Bet button aligned to the row's right edge.

## Blast radius

- Other calculations sharing this code path: none; this is CSS layout only.
- Already-persisted ledgers: none; no data or calculations are affected.
- Stored-data correction or migration: none.
- Cloud copies: none; no persisted values changed.
- Other controls: the fix must not move or resize the description search or filter bar.

## Regression scenario

The following E2E scenarios failed before the fix. The assertion measured the difference
between the right edge of the Add Bet button and the sequence controls container.

```gherkin
Scenario: The Add Bet button is right-aligned on desktop
  When I navigate to the Sequences view
  Then the Add Bet button should be right-aligned with the sequence filter controls
```

```gherkin
Scenario: The Add Bet button is right-aligned on mobile
  Given the viewport is a small phone
  Then the Add Bet button should be right-aligned with the sequence filter controls
```

Where it lands:

- [x] `e2e/features/bets.feature` — automatable through the UI
- [ ] Not automatable

## Fix

Allow only the filter/action group to use the available horizontal space and place its
Add Bet control at the far edge. Keep the description search and filter bar's existing
positions and sizes.

## Constitution check

- [x] III. Domain logic stays pure and deterministic
- [x] IV. No money math moved into the UI to make the fix easier
- [x] V. Sequence model preserved
- [x] VI. Risk limits still enforced
- [x] VII. Existing saved ledgers still load and compute correctly

## Verification

- [x] Regression scenario failed before the fix (evidence recorded below)
- [ ] Regression scenario passes after the fix
- [ ] `pnpm lint`
- [ ] `pnpm build`
- [ ] `pnpm test:e2e`
- [x] A pre-existing saved ledger still loads with correct figures

**Evidence of the red state:**

```text
Scenario: The Add Bet button is right-aligned on desktop
Expected difference <= 2 CSS pixels; received 211.078125

Scenario: The Add Bet button is right-aligned on mobile
Expected difference <= 2 CSS pixels; received 133.078125

59 of 61 scenarios passed; both new right-alignment regressions failed.
```
