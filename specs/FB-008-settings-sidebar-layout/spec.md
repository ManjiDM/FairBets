# Spec: Make Settings a non-modal sidebar on every screen

| Field | Value |
| --- | --- |
| ID | `FB-008-settings-sidebar-layout` |
| Status | Shipped |
| Created | 2026-10-02 |
| Related | — |

> Describe **what** changes for the user and **why**. No file names, function names,
> library choices, or code. Mark unknowns as `[NEEDS CLARIFICATION: question]` and
> resolve them all before planning.

## Problem

Settings still appears as a modal on desktop. The dimmed overlay and modal presentation
feel different from the summary sidebar, even though Settings should be a persistent
part of the app's navigation rather than a blocking dialog.

## Goal

Make Settings a non-modal left sidebar that follows the summary sidebar's visual and
responsive behavior on desktop and smaller screens. The FairBets brand control remains
the way to open and close it.

## Non-goals

- Changing settings fields, validation, or save behavior.
- Changing the summary sidebar or its toolbar control.
- Changing ledger data, calculations, or persistence.

## Users and scenarios

**Primary user:** A person tracking their own betting sequences.

The user activates the FairBets brand control to show Settings while keeping the
sequences view and toolbar available. The Settings panel should feel like the summary
sidebar: a side panel rather than a dialog, with responsive placement appropriate to
the screen size. Activating the brand again closes it.

## Functional requirements

- **FR-1** Settings MUST be presented as a left-side panel, not a modal dialog, at every
  screen size.
- **FR-2** The Settings panel MUST visually match the summary sidebar's surface,
  spacing, and responsive behavior.
- **FR-3** Showing Settings MUST NOT place a dimming backdrop over the app or prevent
  interaction with the sequences view.
- **FR-4** The FairBets brand control MUST open and close Settings on desktop and mobile,
  and its accessible name MUST describe the action it will perform.
- **FR-5** The Settings content MUST remain usable and scrollable when it exceeds the
  available panel height.
- **FR-6** The Settings panel MUST remain on the left side of the screen at narrow
  viewport widths and stay below the persistent toolbar.

## Business rules

Not applicable. This change affects presentation and navigation only.

| Input | Expected result | Notes |
| --- | --- | --- |
| Not applicable | Not applicable | No calculations or ledger data change |

## Acceptance scenarios

```gherkin
Scenario: Settings opens as a non-modal sidebar on desktop
  Given a desktop viewport
  When I open Settings using the FairBets brand control
  Then Settings should be visible as a left-side panel
  And there should be no modal backdrop
  And the sequences view should remain available
  When I close Settings using the FairBets brand control
  Then Settings should be hidden
```

```gherkin
Scenario: Settings opens as a left drawer on a small screen
  Given the viewport is a small phone
  When I open Settings using the FairBets brand control
  Then the Settings drawer should be visible below the toolbar
  And there should be no modal backdrop
  And the toolbar should remain visible above the drawer
  When I close Settings using the FairBets brand control
  Then the Settings drawer should be hidden
```

## Regression status

The new desktop and mobile sidebar checks fail against the existing modal
implementation: the expected non-modal Settings sidebar is absent.

```text
pnpm test:e2e
25 scenarios (3 failed, 22 passed)
190 steps (3 failed, 12 skipped, 175 passed)
```

## Edge cases

- The Settings panel remains usable when its contents exceed the viewport height.
- Opening and closing Settings does not discard unsaved form edits unless existing
  Settings behavior already requires it.

## Data impact

None. No saved ledger, local storage, cloud schema, or workbook format changes.

## Constitution check

Confirm against [`../constitution.md`](../constitution.md), noting anything that needs
discussion.

- [x] I. Private tracker, never an operator
- [x] II. Local-first
- [x] III. Deterministic domain logic
- [x] IV. UI and domain stay separated
- [x] V. The sequence model is preserved
- [x] VI. Risk limits stay enforced
- [x] VII. Data compatibility preserved
- [x] VIII. No secrets introduced
- [x] IX. Behaviour specified in Gherkin
- [x] X. Gates pass

## Verification

- [x] Desktop Settings sidebar displays beside the sequences without overlap or backdrop.
- [x] Mobile Settings drawer remains below the toolbar and has no modal backdrop.
- [x] `pnpm lint`
- [x] `pnpm build`
- [x] `pnpm test:e2e`

## Open questions

None.

## Out of scope for now

Any changes to the content or calculations shown in Settings or the summary panel.
