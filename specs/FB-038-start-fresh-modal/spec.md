# Spec: Start fresh confirmation modal with clear options

| Field | Value |
| --- | --- |
| ID | `FB-038-start-fresh-modal` |
| Status | Clarified |
| Created | 2026-10-11 |
| Related | Reworks "Start fresh" in Settings; ledger history from FB-031 |

## Problem

"Start fresh" asks for confirmation with a system (browser) dialog and then only clears
the sequences. The system dialog cannot be styled, and there is no way to also clear the
ledger history (closed ledgers, investments and history from FB-031).

## Goal

"Start fresh" opens an in-app confirmation modal with two switches, one to clear the
sequences and one to clear the ledgers, a confirmation button and a cancel button.

## Non-goals

- The other system confirmations (Load demo data, cloud restore) stay as they are.
- Any change to ledger, funds or sequence calculations.
- Changing the cloud payload; the cloud copy is not touched.

## Users and scenarios

**Primary user:** someone who wants to wipe the app, either only the current sequences,
only the ledger history, or both.

## Functional requirements

- **FR-1** Pressing **Start fresh** MUST open an in-app modal dialog titled "Start
  fresh". No system confirmation may be shown.
- **FR-2** The modal MUST contain two switches, styled like the "Show whole sequences"
  switch: **Clear sequences** (on by default) and **Clear ledgers** (off by default),
  each with a short explanation of what it removes.
- **FR-3** The modal MUST contain a **Confirm** button and a **Cancel** button. Confirm
  MUST be disabled while both switches are off.
- **FR-4** Cancel MUST close the modal and change nothing. Reopening the modal restores
  the defaults.
- **FR-5** With **Clear sequences** on, confirming MUST remove every bet and replace the
  active ledger with a new empty ledger, exactly as Start fresh did before.
- **FR-6** With **Clear ledgers** on, confirming MUST delete all closed ledgers, all
  investments and the history. The ledger history then restarts as on first run: the
  active ledger, if there is one, is the only ledger and its starting balance becomes the
  single initial investment, timestamped at the time that ledger was opened.
- **FR-7** With both on, the new empty ledger is opened now and becomes the only ledger,
  its starting balance being the single initial investment. This also applies when no
  ledger was active.
- **FR-8** With **Clear ledgers** on and **Clear sequences** off, the active ledger and its
  bets MUST be kept unchanged. If no ledger was active, nothing remains: no ledger, no
  investments, no closed ledgers.
- **FR-9** After confirming, the settings sidebar closes and a message states what was
  cleared.

## Business rules

Clearing ledgers resets money history; it never alters the active ledger's own figures.

| Before | Clear sequences | Clear ledgers | After |
| --- | --- | --- | --- |
| Active ledger, 3 bets, 1 closed ledger, 2 investments | on | off | New empty ledger; closed ledger and investments kept |
| Same | off | on | Same ledger and bets; invested = its starting balance (37.92); realised 0.00; available 0.00; no closed ledgers |
| Same | on | on | New empty ledger, starting balance 37.92; invested 37.92; realised 0.00; available 0.00 |

## Acceptance scenarios

```gherkin
Scenario: Start fresh opens a confirmation modal
  When I press Start fresh in the settings
  Then a "Start fresh" dialog is shown with "Clear sequences" on and "Clear ledgers" off
  And it has Confirm and Cancel buttons

Scenario: Cancel changes nothing
  Given the demo ledger
  When I press Start fresh and then Cancel
  Then the ledger name is unchanged

Scenario: Confirm is disabled when nothing is selected
  When I switch both options off
  Then Confirm is disabled

Scenario: Clearing sequences starts an empty ledger
  When I confirm with Clear sequences on
  Then the ledger is "New FairBets ledger" and has no bets

Scenario: Clearing ledgers keeps the sequences
  Given a closed ledger exists
  When I confirm with only Clear ledgers on
  Then the bets are unchanged and no closed ledger is listed
  And the funds show invested equal to the starting balance and available 0.00

Scenario: Clearing both starts over
  When I confirm with both options on
  Then the ledger is empty, with a single ledger card and the funds reset
```

## Edge cases

- No active ledger: Clear ledgers alone leaves no ledger and no investments.
- Escape or clicking outside does not confirm anything.

## Data impact

Persisted portfolio (`fairbets-portfolio-v1`) is reset when Clear ledgers is on; no shape
change, no cloud change.

## Constitution check

- [x] Money rules unchanged; the reset is a pure domain function
- [x] Open bets are not silently settled: clearing sequences removes them explicitly,
      with consent from the modal

## Open questions

None. Defaults decided: sequences on, ledgers off; the switch look matches the existing
filter switch.

## Out of scope for now

Replacing the Load demo data and cloud restore confirmations; undo.
