# Bugfix: Make mobile Settings a brand-toggled left drawer

| Field | Value |
| --- | --- |
| ID | `FB-007-mobile-settings-drawer` |
| Status | Diagnosed |
| Severity | Broken flow |
| Created | 2026-10-02 |
| Related | — |

> A bugfix spec is shorter than a feature spec, but it has one extra obligation: the
> defect must be **reproduced by a failing scenario before it is fixed**. A fix without
> a reproduction is a guess.

## Observed behaviour

On mobile, opening Settings shows the settings form without a reliably visible way to
return to the sequences view. The panel currently behaves like a bottom-aligned modal
and includes a separate **Back to sequences** button. The user wants it to mirror the
summary drawer instead.

## Expected behaviour

- On mobile, Settings opens as a left-side drawer, mirroring the summary drawer's
  placement below the always-visible toolbar.
- The toolbar remains visible above the settings drawer.
- Remove the separate **Back to sequences** button.
- The FairBets brand control toggles Settings open and closed. Its accessible name
  reflects the current action.
- The settings content remains scrollable and usable inside the drawer.
- Keep the existing desktop Settings presentation unless needed to support the shared
  brand toggle.

## Reproduction

```text
Viewport: cellphone
Action:   activate the FairBets brand to open Settings
Observed: settings appear as a modal sheet; the return control is not visible in the
          initial portion of the content
Expected: a left-side drawer appears below the toolbar; the brand remains visible and
          toggles Settings closed; no Back to sequences button is shown
```

## Arithmetic check

Not applicable. This is a presentation and navigation change with no effect on
calculations or persisted data.

## Root cause

`src/App.tsx` renders Settings in a generic modal backdrop and provides a separate
**Back to sequences** button. The brand control always opens Settings and cannot close
it. The mobile CSS bottom-aligns the generic modal instead of presenting Settings as a
side drawer below the toolbar.

- **Introduced by:** The Settings overlay implementation
- **Why tests missed it:** Existing mobile tests cover only the summary drawer; Settings
  tests run at the default desktop viewport and close it using the separate button.

## Blast radius

- Settings container, brand control, and responsive styles in `src/App.tsx` and
  `src/App.css`.
- E2E scenarios that open/close Settings or use Settings from the workbook-import flow.
- No calculations, ledger data, cloud data, or migrations are affected.

## Regression scenario

The mobile regression scenario fails before the fix: the Settings panel begins at 40px,
above the 67px toolbar bottom. See the red output below.

```gherkin
Scenario: Toggle mobile Settings with the brand control
  Given the viewport is a small phone
  When I open Settings using the brand control
  Then the settings drawer should be visible below the toolbar
  And there should be no Back to sequences button
  And the brand control should be named "Close settings"
  When I toggle Settings using the brand control
  Then the settings drawer should be closed
  And the brand control should be named "Open settings"
```

Where it lands:

- [x] `e2e/features/*.feature` — automatable through the UI
- [ ] Not automatable; visual styling details receive a manual check below

## Fix

At mobile widths, render Settings as a left-side drawer that starts below and remains
behind the persistent toolbar. Remove **Back to sequences** and make the brand control
toggle Settings with an accessible name that reflects its state.

## Constitution check

- [x] III. Domain logic stays pure and deterministic — no domain logic changes
- [x] IV. No money math moved into the UI
- [x] V. Sequence model preserved
- [x] VI. Risk limits still enforced
- [x] VII. Existing saved ledgers still load and compute correctly — no data changes

## Verification

- [x] Regression scenario failed before the fix (evidence recorded below)
- [ ] Regression scenario passes after the fix
- [ ] `pnpm lint`
- [ ] `pnpm build`
- [ ] `pnpm test:e2e`
- [ ] A pre-existing saved ledger still loads with correct figures

**Evidence of the red state:**

```text
pnpm test:e2e
Scenario: Settings uses a left drawer on mobile and toggles from the brand
Expected settings panel top >= toolbar bottom (67px)
Received settings panel top: 40px
25 scenarios (1 failed, 24 passed)
186 steps (1 failed, 5 skipped, 180 passed)
```

## Manual check

Review Settings at phone and small-tablet widths. Confirm that the toolbar stays visible,
the drawer opens from the left below it, long settings content scrolls within the drawer,
and the brand control has a visible keyboard-focus state.
