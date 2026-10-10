# Plan: Simplify the new bet form

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Status | Approved |
| Updated | 2026-10-10 |

## Approach

Edit the bet modal in place. In new mode the date input is `readOnly`, the Result select
is not rendered, the draft outcome stays `open`, and the saved placement time is taken
from the clock when the form is submitted. Edit mode keeps today's controls. Field order
becomes Date, Label, then an Odd/Stake row built from a dedicated two-column container that
does not collapse on mobile. The Close button is deleted. Rejected: disabling the date
input, since a disabled input is dropped from assistive technology and looks greyed out;
read-only is announced and keeps normal contrast.

## Affected modules

| File | Change | Notes |
| --- | --- | --- |
| `src/App.tsx` | Reorder fields, read-only date for new bets, hide Result for new bets, placement time at submit, rename labels, remove Close | Presentation and form state only |
| `src/App.css` | Two-column odd/stake row that stays two columns on mobile | |
| `e2e/features/bets.feature` | New scenarios | |
| `e2e/steps/fairbets.steps.js` | New labels; new-bet dates emulated with the browser clock; new assertions | |

## Domain changes

None.

## Data and migration

- **`LedgerState` shape:** unchanged
- **`localStorage` migration:** not needed
- **Cloud schema:** unchanged
- **Backward compatibility:** recorded dates and results are never touched

## UI changes

As in the spec. The suggested-stake placeholder and the recorded-strategy details stay.

## Test strategy

- New scenarios for the simplified dialog, the mobile row and the open result.
- Editing scenario guarding date and Result.
- Steps now use the labels "Odd" and "Stake". The step that types a date for a new bet
  sets the browser clock instead, because the field is read-only; existing backdating
  scenarios keep their intent this way.

## Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Displayed time differs from the saved time by a few seconds | Minor confusion | The saved time is the moment of adding, as specified (FR-3) |
| Fixed browser clock in tests affects other timing | Flaky tests | Only date-only usage; run the full suite |

## Constitution check

No money math touched (III, IV); sequence model and persisted data unchanged (V, VII).

## Rollback

Revert the implementation commit.
