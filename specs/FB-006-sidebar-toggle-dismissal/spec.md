# Bugfix: Use the toolbar toggle to dismiss the summary drawer

| Field | Value |
| --- | --- |
| ID | `FB-006-sidebar-toggle-dismissal` |
| Status | Reproducing |
| Severity | Cosmetic |
| Created | 2026-10-02 |
| Related | — |

> A bugfix spec is shorter than a feature spec, but it has one extra obligation: the
> defect must be **reproduced by a failing scenario before it is fixed**. A fix without
> a reproduction is a guess.

## Observed behaviour

When the mobile summary drawer is open, it shows a separate **Close** button in its
heading. The toolbar sidebar icon remains visible above the drawer, but it only opens
the drawer and cannot close it.

## Expected behaviour

- Remove the drawer's separate **Close** button.
- The toolbar sidebar icon remains visible while the drawer is open and toggles the
  drawer open or closed.
- Update the control's accessible name and expanded state to describe its current
  action/state accurately.
- Preserve the toolbar-above-drawer layout and keep the drawer content usable.

## Reproduction

```text
Viewport: mobile
Action:   open the summary drawer
Observed: drawer shows a Close button; toolbar icon only opens the drawer
Expected: no drawer Close button; activating the always-visible toolbar icon closes it
```

## Arithmetic check

Not applicable. This is a presentation and interaction change with no effect on
calculations or persisted data.

## Root cause

`src/App.tsx` renders a `.drawer-close` button inside the drawer heading, while the
toolbar `.drawer-toggle` unconditionally calls `setDrawerOpen(true)`.

- **Introduced by:** The mobile summary drawer implementation
- **Why tests missed it:** The existing drawer scenario uses the separate Close button
  and does not verify that the toolbar control toggles an already-open drawer.

## Blast radius

- Drawer heading and toolbar control in `src/App.tsx`.
- E2E coverage for opening and closing the mobile drawer.
- No calculations, ledger data, cloud data, or migrations are affected.

## Regression scenario

This scenario must be run and confirmed failing before the fix; record the red output
below.

```gherkin
Scenario: Close the summary drawer with its toolbar toggle
  Given the viewport is a small phone
  When I open the summary drawer using the toolbar toggle
  Then the summary drawer should be open
  And there should be no separate drawer Close button
  When I activate the toolbar summary toggle again
  Then the summary drawer should be closed
```

Where it lands:

- [x] `e2e/features/*.feature` — automatable through the UI
- [ ] Not automatable; the manual check is described below and the reason given

## Fix

Remove the drawer Close button and make the toolbar sidebar button toggle `drawerOpen`.
Keep the toolbar button visible above the open drawer, and expose state through its
accessible name and `aria-expanded`.

## Constitution check

- [x] III. Domain logic stays pure and deterministic — no domain logic changes
- [x] IV. No money math moved into the UI
- [x] V. Sequence model preserved
- [x] VI. Risk limits still enforced
- [x] VII. Existing saved ledgers still load and compute correctly — no data changes

## Verification

- [ ] Regression scenario failed before the fix (evidence recorded below)
- [ ] Regression scenario passes after the fix
- [ ] `pnpm lint`
- [ ] `pnpm build`
- [ ] `pnpm test:e2e`
- [ ] A pre-existing saved ledger still loads with correct figures

**Evidence of the red state:**

```text
Run the updated mobile drawer interaction scenario before changing the implementation.
```

## Manual check

Check the open drawer at mobile and small-tablet widths to confirm the toolbar toggle
remains visible, the drawer has no redundant Close control, and the toggle remains
keyboard accessible.
