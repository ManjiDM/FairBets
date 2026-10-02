# Bugfix: Simplify header and mobile sidebar controls

| Field | Value |
| --- | --- |
| ID | `FB-004-header-controls` |
| Status | Reproducing |
| Severity | Cosmetic |
| Created | 2026-10-02 |
| Related | — |

> A bugfix spec is shorter than a feature spec, but it has one extra obligation: the
> defect must be **reproduced by a failing scenario before it is fixed**. A fix without
> a reproduction is a guess.

## Observed behaviour

The header shows both the FairBets brand and a separate **Settings** button, although
both open the same settings overlay. On mobile, the summary sidebar control is a
textual **Summary** button, which the user finds visually unattractive.

Source inspection confirms both settings controls open the same overlay and the mobile
summary control displays its text label.

## Expected behaviour

- Keep one Settings entry point: the existing FairBets brand control, which opens the
  Settings overlay. Remove the redundant Settings button.
- On mobile, show the summary drawer control as a generic sidebar icon instead of a
  visible text label. Keep an accessible name so assistive technology can identify the
  control.
- Preserve the existing summary drawer and settings overlay behavior.

## Reproduction

```text
Settings: not relevant
Bets:     not relevant
Action:   view the header, then open it at a mobile viewport
Observed: desktop header has duplicate Settings entry points; mobile drawer control is a
          textual "Summary" button
Expected: one Settings entry point (the brand); mobile summary control uses an icon
```

## Arithmetic check

Not applicable. This is a presentation-only change with no effect on calculations,
settings values, or persisted data.

## Root cause

`src/App.tsx` renders both a branded button with `aria-label="Open settings"` and a
separate visible **Settings** button that share the same action. The mobile drawer
toggle also renders the visible text `Summary` instead of an icon.

- **Introduced by:** The sequences-first header redesign
- **Why tests missed it:** E2E coverage checks that Settings opens, but does not assert
  that it has only one entry point or that the mobile control is icon-only.

## Blast radius

- Header controls in `src/App.tsx` and their styling in `src/App.css`.
- E2E assertions and steps that target the explicit Settings button or the visible
  Summary text.
- No calculations, existing ledger data, cloud data, or migrations are affected.

## Regression scenario

These scenarios must be run and confirmed failing before the fix; record the red output
below.

```gherkin
Scenario: The brand is the only Settings entry point
  Given the app is loaded
  Then the branded control should open Settings
  And there should be no separate Settings button
```

```gherkin
Scenario: The mobile summary control uses a sidebar icon
  Given the app is shown at a mobile viewport
  Then the summary drawer control should have an accessible name
  And it should show a sidebar icon instead of visible Summary text
  When the user activates the summary drawer control
  Then the summary drawer should open
```

Where it lands:

- [x] `e2e/features/*.feature` — automatable through the UI
- [ ] Not automatable; the manual check is described below and the reason given

## Fix

Remove the separate **Settings** button while retaining the branded Settings control.
Replace the mobile **Summary** label with a generic sidebar icon, preserving an
accessible name and the existing drawer action.

## Constitution check

- [x] III. Domain logic stays pure and deterministic — no domain logic changes
- [x] IV. No money math moved into the UI
- [x] V. Sequence model preserved
- [x] VI. Risk limits still enforced
- [x] VII. Existing saved ledgers still load and compute correctly — no data changes

## Verification

- [ ] Regression scenarios failed before the fix (evidence recorded below)
- [ ] Regression scenarios pass after the fix
- [ ] `pnpm lint`
- [ ] `pnpm build`
- [ ] `pnpm test:e2e`
- [ ] A pre-existing saved ledger still loads with correct figures

**Evidence of the red state:**

```text
Run the header-controls regression scenarios before changing the implementation.
```

## Manual check

Review the header at desktop and mobile widths to confirm the brand remains an
understandable Settings affordance and the mobile icon is visually legible, aligned, and
has a visible focus treatment.
