# Spec: Flat buttons everywhere and Confirm close replaces Close ledger

| Field | Value |
| --- | --- |
| ID | `FB-041-flat-buttons-close-confirm` |
| Status | Clarified |
| Created | 2026-10-11 |
| Related | Add bet button look (FB-021, FB-022); ledger lifecycle FB-031 |

## Problem

The Add bet button is flat: no drop shadow, no lift on hover. Other primary buttons
("Start ledger", "Confirm close", "Add the first bet", "Save settings", the settings and
cloud actions) still have the old raised 3D look with a growing shadow and a lift
animation. Also, pressing "Close ledger" adds "Confirm close" next to it while "Close
ledger" stays visible.

## Goal

Every button shares the Add bet button's look and feel, and the close confirmation
replaces the Close ledger button.

## Non-goals

- Icon, text-link, switch and tab buttons keep their own designs.
- No change to when or how a ledger can be closed.

## Functional requirements

- **FR-1** Every primary button (the lime ones) MUST have no box shadow and MUST NOT lift
  on hover; on hover its background darkens to the Add bet hover colour.
- **FR-2** The other `button` variants (quiet, secondary, danger) MUST NOT lift on hover.
- **FR-3** After pressing **Close ledger**, **Confirm close** MUST take its place and
  **Close ledger** MUST no longer be shown.
- **FR-4** Switching tabs or a refused close (open bets) leaves **Close ledger** shown.

## Business rules

None; no money rule changes.

## Acceptance scenarios

```gherkin
Scenario: Primary buttons are flat
  Then the "Start ledger", "Confirm close" and "Add the first bet" buttons have no shadow and do not lift

Scenario: Confirm close replaces Close ledger
  When I press Close ledger
  Then "Confirm close" is shown and "Close ledger" is not

Scenario: A refused close keeps Close ledger
  When I press Close ledger with an open bet
  Then "Close ledger" is still shown and "Confirm close" is not
```

## Edge cases

- Disabled buttons keep their reduced opacity.

## Data impact

None.

## Constitution check

- [x] Presentation only; no money or data change

## Open questions

None.

## Out of scope for now

A cancel affordance for the pending close (switching tabs already resets it).
