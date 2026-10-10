# Plan: Filter scope toggle

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Status | Approved |
| Updated | 2026-10-10 |

## Approach

Add a boolean UI state, on by default, rendered as a `role="switch"` button inside the
filter input's wrapper. The visible-bet helper takes it: when on, or when the card label
matches, all bets show; otherwise only matching bets. Sequence-level inclusion is
unchanged. Rejected: a checkbox outside the input, because the request places it inside.

## Affected modules

| File | Change | Notes |
| --- | --- | --- |
| `src/App.tsx` | Switch state, switch markup, visible-bet helper takes scope | Presentation only |
| `src/App.css` | Input wrapper, switch styling, right padding on the input | |
| `e2e/features/bets.feature` | New scenarios | |
| `e2e/steps/fairbets.steps.js` | Switch steps | |

## Domain changes

None.

## Data and migration

Unchanged; the switch is not persisted.

## UI changes

Switch at the right edge of the filter input, labelled for assistive technology as
"Show whole sequences", with a tooltip.

## Test strategy

Scenarios for default state and placement, off/on behaviour, and label match with the
switch off.

## Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Text hidden under the switch | Unreadable input | Right padding on the input |

## Constitution check

No money math touched (III, IV); sequence model and persisted data unchanged (V, VII).

## Rollback

Revert the implementation commit.
