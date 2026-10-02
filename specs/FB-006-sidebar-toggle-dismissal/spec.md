# Bugfix: Use the toolbar toggle to dismiss the summary drawer

| Field | Value |
| --- | --- |
| ID | `FB-006-sidebar-toggle-dismissal` |
| Status | Verified |
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

Both drawer behavior scenarios were run and failed before the fix; see the red output
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

- [x] Regression scenario failed before the fix (evidence recorded below)
- [x] Regression scenarios pass after the fix; the toolbar toggle opens and closes the
      drawer and its accessible name reflects the current state
- [x] `pnpm lint` — pass
- [x] `pnpm build` — pass
- [x] `pnpm test:e2e` — pass, 24 scenarios and 177 steps
- [x] A pre-existing saved ledger still loads with correct figures — existing E2E
      scenarios pass; no data changes were made
- [ ] Manual keyboard/visual review at mobile and small-tablet widths remains outstanding

**Evidence of the red state:**

```text
pnpm test:e2e
The summary is reachable as a drawer on a small screen:
  Expected drawer open class count after second toolbar activation: 0
  Received: 1

The summary drawer has no separate Close button:
  Expected drawer Close button count: 0
  Received: 1

24 scenarios (2 failed, 22 passed)
175 steps (2 failed, 173 passed)
```

## Manual check

Check the open drawer at mobile and small-tablet widths to confirm the toolbar toggle
remains visible, the drawer has no redundant Close control, and the toggle remains
keyboard accessible. The E2E suite confirms the toggle's accessible name changes between
"Open summary" and "Close summary".
