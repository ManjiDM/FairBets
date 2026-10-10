# Plan: Place Add Bet beside sequence filters

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Status | Done |
| Updated | 2026-10-10 |

> How the spec will be built. Written after every `[NEEDS CLARIFICATION]` marker in
> the spec is resolved. If implementation reveals this plan is wrong, update this
> file before continuing.

## Approach

Move the existing global Add Bet button from the page heading into a control group beside
the sequence status filter buttons. Shorten the all-status label from "All sequences" to
"All". Keep the description search as a separate control; at narrow widths, it occupies
its own row while the filter/action group remains together on the next row. Preserve the
same Add Bet button element semantics, accessible name, existing availability behavior,
and handler.

Reject placing Add Bet beside the sequence heading: that would keep it visually detached
from the filter actions and would not match the requested desktop/mobile placement.

## Affected modules

| File | Change | Notes |
| --- | --- | --- |
| `src/App.tsx` | Move global Add Bet into the sequence filter/action group; label the all-status filter "All" | No handler or state changes |
| `src/App.css` | Align filter and Add Bet together at desktop and mobile widths | Preserve horizontal fit |
| `e2e/features/bets.feature` | Cover filter label, colocated Add Bet, activation, and mobile fit | Existing feature file |
| `e2e/steps/fairbets.steps.js` | Add or reuse assertions for row placement, label, and overflow | Use public UI and geometry |
| `specs/FB-020-sequences-toolbar-add-bet/*` | Keep spec, plan, tasks, and status current | |

## Domain changes

None. No financial calculation or domain model changes.

## Data and migration

- **`LedgerState` shape:** unchanged
- **`localStorage` migration:** not needed
- **Cloud schema:** unchanged
- **Backward compatibility:** saved ledgers and existing behavior remain unchanged

## UI changes

The Sequences page's description search remains on its own line when needed. The status
filter group and the global icon-only Add Bet control share a row. On mobile that row
wraps only as a unit; it must fit without horizontal overflow. The "All" button remains
the selected all-status filter when applicable.

## Test strategy

- Add acceptance coverage for the "All" accessible button label and its all-status
  selection.
- Assert that the global Add Bet button and status filters share a row.
- Assert Add Bet still opens the form.
- At a small phone viewport, assert the controls remain visible and the page has no
  horizontal overflow.
- Run `pnpm test:e2e`, `pnpm lint`, and `pnpm build`.

## Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| The status/action group is too wide on narrow phones | Controls wrap awkwardly or overflow | Assert layout geometry at 390px and adjust group sizing if required |
| Moving the button changes its availability or action behavior | User may lose access or trigger a different action | Move the existing button intact and verify its accessible name and form-opening behavior |
| Short label changes test locators | Existing tests may expect "All sequences" | Search and update only related assertions; keep underlying filter value unchanged |

## Constitution check

- I-II: UI remains local-first and the ledger stays a private tracker.
- III-VII: No calculations, sequence rules, risk limits, or persisted data are changed.
- VIII: No secrets or credentials are introduced.
- IX-X: Add Playwright-backed Cucumber scenarios and run the required gates.

## Rollback

Restore the Add Bet button to the page heading, restore the longer filter label and
previous layout. No migration or persisted data rollback is needed.
