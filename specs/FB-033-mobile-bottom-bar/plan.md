# Plan: Docked bottom navigation bar on mobile

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Status | Approved |
| Updated | 2026-10-11 |

## Approach

Keep the single existing `.main-tabs` tablist (no duplicate tabs) and restyle it with CSS
at `max-width: 680px`: `position: fixed` to the bottom, full width, with a blurred dark
background matching the top toolbar, and a safe-area bottom padding. Each tab gets a
Lucide icon (`List` for Sequences, `Wallet` for Ledgers) that is hidden on wider screens.
The tab labels stay the accessible names. `.main-content` gets extra bottom padding on
mobile so the last card scrolls clear of the bar.

## Affected modules

- `src/App.tsx`: add icons inside the two tab buttons.
- `src/App.css`: base `.main-tab` icon rule and the mobile docked bar rules.
- `e2e/features/mobile-bottom-bar.feature`, `e2e/steps/fairbets.steps.js`: scenarios.
- `README.md`: one line about the mobile bar.

## Data and migration impact

None.

## Risks

- Modal backdrop z-index versus the bar: the bar uses z-index below the modal backdrop.
- The Add bet toolbar and the notices are unaffected as the bar is out of flow.

## Rejected alternative

A second, duplicated tablist for mobile: it would double the tabs in the accessibility
tree and need state wiring; restyling one element is simpler.

## Rollback

Revert the feat commit.

## Constitution check

- [x] Presentation only; no domain, persistence or cloud change
