# Spec: Persistent summary sidebar with Sequences as the default view

| Field | Value |
| --- | --- |
| ID | `001-sidebar-summary-sequences-default` |
| Status | Draft |
| Created | 2026-09-23 |
| Related | — |

## Problem

FairBets currently opens on a Home (Overview) page that is a **separate destination from
the place work actually happens**. Recording and settling bets happens on Sequences, but
the figures a user needs while doing it — available balance, the next bet guide,
guardrail warnings — live on Home.

That forces a navigation round trip for a single mental model: check the balance and
suggested stake on Home, switch to Sequences to act, switch back to confirm the effect.
The information and the action are one workflow but two screens.

Home also partly duplicates Sequences: its "Recent bets" panel shows the last five bets,
which Sequences already presents in fuller form.

## Goal

Remove Home as a navigable destination. Surface its summary information **persistently
alongside** the working view in a sidebar, and make **Sequences the default and primary
screen** on app start.

## Non-goals

- No change to any stake, sequence, or balance **calculation**. Every figure keeps its
  current value and meaning; only where it is displayed changes.
- No change to the Settings page or its contents.
- No change to workbook import, cloud backup, restore, or sync behaviour.
- No change to how bets are added, edited, or settled.
- No visual redesign beyond what rehoming the information requires.

## Users and scenarios

**Primary user:** a person tracking their own betting sequences, most often on a phone.

They open the app to record or settle a bet. They expect to land directly on their
sequences, with the current balance, the next suggested stake, and any guardrail warning
visible without navigating away from the list they are working in.

## Functional requirements

- **FR-1** The app MUST open on the Sequences view.
- **FR-2** Home/Overview MUST NOT be reachable as a navigation destination.
- **FR-3** The summary information listed in "Information to rehome" MUST remain
  available to the user, displayed alongside the Sequences view rather than on a
  separate screen.
- **FR-4** Every displayed figure MUST keep its current value, label, and meaning. This
  change is presentational only.
- **FR-5** Guardrail warnings MUST remain visible whenever they are active; they MUST NOT
  become something the user has to open a panel to discover.
- **FR-6** The app MUST remain usable at mobile widths, where a persistent side panel is
  not viable.
- **FR-7** Flows that currently return the user to Home after completing (workbook
  import, cloud restore, ledger reset) MUST return to a sensible destination instead.
- **FR-8** The user MUST still be able to reach Settings.
- **FR-9** With an empty ledger, the user MUST still get a clear prompt to record a first
  bet.

## Information to rehome

Everything currently on Home, for explicit disposition:

| # | Element | Current content |
| --- | --- | --- |
| 1 | Ledger name | `Current ledger` eyebrow + ledger name as page heading |
| 2 | Hero description | Explanatory copy: suggestions are based on settings, not predictions |
| 3 | Hero meta | Sequence count, settled win rate, active-sequence status |
| 4 | Next bet guide | Suggested amount, odds guide, base + recovery breakdown, cap note |
| 5 | Available balance | Value + open-exposure hint |
| 6 | Settled P&L | Value + win/loss counts |
| 7 | Active sequence | Number + bet count and recovery gap |
| 8 | Largest stake | Value + safety-limit hint |
| 9 | Goal tracking | Settled result, goal value, progress bar, percentage |
| 10 | Guardrails | Risk flags or an "within limits" message + link to Settings |
| 11 | Recent bets | Last five bets — **duplicates Sequences** |
| 12 | Empty state | "No bets recorded yet" + "Add the first bet" action |

[NEEDS CLARIFICATION: Which of items 1–12 belong in the sidebar, which move elsewhere,
and which are dropped? A sidebar cannot comfortably hold all twelve, and item 11
duplicates the Sequences list.]

## Business rules

No business rule changes. Every figure continues to come from the existing domain
calculation, unchanged:

| Figure | Rule | Changing? |
| --- | --- | --- |
| Available balance | `startingBalance + settledProfit − openExposure` | No |
| Next suggested stake | Existing suggestion logic, capped at `maxStake` | No |
| Guardrail flags | Raised when open exposure or stake exceeds configured limits | No |
| Goal progress | Settled profit against the calculated goal | No |

Verification therefore includes confirming the figures are **numerically identical**
before and after.

## Acceptance scenarios

```gherkin
Scenario: The app opens on Sequences
  Given a saved ledger exists
  When the app starts
  Then the sequences view should be shown
  And no Home or Overview destination should be offered
```

```gherkin
Scenario: Summary information stays visible while working
  Given the user is viewing their sequences
  Then the available balance should be visible
  And the next bet guide should be visible
  Without navigating away from the sequences view
```

```gherkin
Scenario: Settling a bet updates the summary in place
  Given an open bet exists in the active sequence
  When the user marks it as won
  Then the sequence should close
  And the available balance shown alongside the list should update immediately
  And the user should not have to navigate to see the new value
```

```gherkin
Scenario: Guardrail warnings remain visible
  Given open exposure is above the configured limit
  When the user is viewing their sequences
  Then the guardrail warning should be visible without opening a panel
```

```gherkin
Scenario: An empty ledger still prompts a first bet
  Given a ledger with no recorded bets
  When the app starts
  Then the user should see a clear prompt to record the first bet
```

## Edge cases

- **Empty ledger:** the "Add the first bet" prompt currently lives on Home. Where does it
  live once Home is gone? (See item 12.)
- **Mobile widths:** a persistent sidebar is not viable on a phone, and the app is
  mobile-first. [NEEDS CLARIFICATION: how should the summary be presented below the
  mobile breakpoint?]
- **No active sequence:** the summary must still render sensibly ("Ready for a new
  sequence").
- **Post-import / post-restore / post-reset:** these currently send the user to Home.
- **Long ledger names:** the ledger name is currently a full-width page heading; a
  sidebar is much narrower.

## Data impact

- **`LedgerState` shape:** unchanged.
- **`localStorage` migration:** not needed for the ledger itself. [NEEDS CLARIFICATION:
  should sidebar state — for example collapsed or expanded — be remembered between
  sessions? If yes, that is new persisted UI state.]
- **Cloud schema:** unchanged.
- **Workbook import:** unchanged.

## Test impact

The existing E2E suite asserts Home-specific behaviour and will need updating:

- `e2e/features/fairbets.feature` asserts the ledger name heading and a "Current ledger"
  section on load.
- `e2e/features/bets.feature` reads the available balance on load, and again after
  navigating to "Overview" following a settlement.
- `e2e/steps/fairbets.steps.js` has a step that clicks "Overview".

These are **expectation changes driven by an intended behaviour change**, not stale
tests — they must be updated deliberately as part of this work, and the balance figures
they assert (`€38.07`, `€39.07`) must remain correct.

## Constitution check

- [x] I. Private tracker — presentation only; no new claims or promissory copy
- [x] II. Local-first — no network dependency introduced
- [x] III. Deterministic domain logic — no domain change at all
- [x] IV. UI and domain separated — the sidebar reads existing calculated values; no math
      moves into the UI
- [x] V. Sequence model preserved — untouched
- [x] VI. Risk limits enforced — guardrail visibility is explicitly protected by FR-5
- [x] VII. Data compatibility — no ledger shape change
- [x] VIII. No secrets
- [ ] IX. Behaviour specified in Gherkin — scenarios above; E2E updates required
- [ ] X. Gates pass — to confirm at verification

## Open questions

1. [NEEDS CLARIFICATION: Which of the twelve Home elements go in the sidebar, which move
   elsewhere, and which are dropped?]
2. [NEEDS CLARIFICATION: How is the summary presented on mobile, where a sidebar is not
   viable?]
3. [NEEDS CLARIFICATION: Does the top navigation become two items (Sequences, Settings)?
   What should the FairBets brand button in the header do, given it currently goes to
   Home?]
4. [NEEDS CLARIFICATION: Is the sidebar always visible on desktop, or collapsible? If
   collapsible, what is its default state?]
5. [NEEDS CLARIFICATION: Where do import, restore, and reset send the user now that Home
   is gone?]

## Out of scope for now

- Reordering or restyling the sequence list itself.
- Making the sidebar configurable by the user.
- Any change to what the Settings page contains.
