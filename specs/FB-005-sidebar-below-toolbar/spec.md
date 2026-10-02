# Bugfix: Keep the toolbar above the summary drawer

| Field | Value |
| --- | --- |
| ID | `FB-005-sidebar-below-toolbar` |
| Status | Verified |
| Severity | Broken flow |
| Created | 2026-10-02 |
| Related | — |

> A bugfix spec is shorter than a feature spec, but it has one extra obligation: the
> defect must be **reproduced by a failing scenario before it is fixed**. A fix without
> a reproduction is a guess.

## Observed behaviour

On mobile, opening the summary sidebar lets it cover the top toolbar. The toolbar should
remain visible and above the drawer at all times.

Source inspection confirms the mobile sidebar is `position: fixed` with `top: 0` and a
z-index higher than the sticky toolbar, so it is positioned over the toolbar.

## Expected behaviour

When the mobile summary drawer is open:

- The toolbar remains visible and unobscured at the top of the viewport.
- The drawer starts below the toolbar and occupies the remaining viewport height.
- The drawer remains scrollable and its existing close control continues to work.

## Reproduction

```text
Settings: not relevant
Bets:     not relevant
Action:   at a mobile viewport, open the summary drawer
Observed: the fixed drawer overlays the top toolbar
Expected: the toolbar stays visible above the drawer; the drawer starts below it
```

## Arithmetic check

Not applicable. This is a layout defect; no calculations or persisted data are affected.

## Root cause

Inside the mobile media query, `.summary-sidebar` is fixed from `top: 0` and uses
`z-index: 40`, while `.topbar` is sticky with `z-index: 10`.

- **Introduced by:** The mobile summary drawer layout
- **Why tests missed it:** Existing coverage opens and closes the drawer but does not
  assert its position relative to the toolbar.

## Blast radius

- The mobile `.summary-sidebar` positioning and stacking styles in `src/App.css`.
- E2E coverage for the mobile summary drawer.
- No calculations, ledger data, cloud data, or migrations are affected.

## Regression scenario

The scenario was run and failed before the fix; see the red output below.

```gherkin
Scenario: The summary drawer stays below the visible toolbar
  Given the viewport is a small phone
  When I open the summary drawer
  Then the toolbar should remain visible above the summary drawer
  And the summary drawer should start below the toolbar
```

Where it lands:

- [x] `e2e/features/*.feature` — automatable through the UI
- [ ] Not automatable; the manual check is described below and the reason given

## Fix

Position the mobile summary drawer below the responsive toolbar height and keep its
stacking order below the toolbar. Preserve the existing drawer open, scroll, and close
behavior.

## Constitution check

- [x] III. Domain logic stays pure and deterministic — no domain logic changes
- [x] IV. No money math moved into the UI
- [x] V. Sequence model preserved
- [x] VI. Risk limits still enforced
- [x] VII. Existing saved ledgers still load and compute correctly — no data changes

## Verification

- [x] Regression scenario failed before the fix (evidence recorded below)
- [x] Regression scenario passes after the fix
- [x] `pnpm lint` — pass
- [x] `pnpm build` — pass
- [x] `pnpm test:e2e` — pass, 23 scenarios and 170 steps
- [x] A pre-existing saved ledger still loads with correct figures — existing E2E
      scenarios pass; no data changes were made
- [ ] Manual visual check at small-tablet widths and while scrolled — not completed;
      automated geometry assertion covers the 390px phone viewport

**Evidence of the red state:**

```text
pnpm test:e2e
The summary is reachable as a drawer on a small screen:
  Expected drawer top >= toolbar bottom (67px)
  Received drawer top: 0px
23 scenarios (1 failed, 22 passed)
170 steps (1 failed, 2 skipped, 167 passed)
```

## Manual check

Review the open drawer at phone and small-tablet widths, including while the page is
scrolled, to confirm the sticky toolbar remains visible and the drawer content can scroll
without covering it. The automated regression confirms the drawer begins at or below
the toolbar's bottom edge on a 390px viewport.
