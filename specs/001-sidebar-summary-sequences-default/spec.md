# Spec: Persistent summary sidebar with Sequences as the default view

| Field | Value |
| --- | --- |
| ID | `001-sidebar-summary-sequences-default` |
| Status | Done |
| Created | 2026-09-23 |
| Clarified | 2026-09-23 |
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
- **FR-5** When a risk limit is breached, a warning MUST appear on the Sequences view
  without the user opening anything. It MUST be dismissible. It MUST NOT be hidden behind
  the mobile drawer.
- **FR-5a** A dismissed warning MUST reappear when the set of active risk flags changes,
  and on the next app start. Dismissal is a transient acknowledgement, not a permanent
  mute.
- **FR-6** Below the mobile breakpoint the sidebar MUST become a drawer, opened from a
  control in the header and dismissible.
- **FR-7** Workbook import, cloud restore, and ledger reset MUST return the user to the
  Sequences view on completion.
- **FR-8** Settings MUST open as an overlay above the Sequences view, dismissible by an
  explicit close control, at every viewport width.
- **FR-9** With an empty ledger, the user MUST still get a clear prompt to record a first
  bet, on the Sequences view.
- **FR-10** No tabbed navigation MUST remain — neither the desktop tab row nor the mobile
  bottom bar.

## Information to rehome

Everything currently on Home, with its agreed destination:

| # | Element | Current content | Destination |
| --- | --- | --- | --- |
| 1 | Ledger name | `Current ledger` eyebrow + ledger name as page heading | Sequences header |
| 2 | Hero description | Explanatory copy: suggestions are based on settings, not predictions | Sequences header |
| 3 | Hero meta | Sequence count, settled win rate, active-sequence status | Sequences header |
| 4 | Next bet guide | Suggested amount, odds guide, base + recovery breakdown, cap note | Sequences header, reduced to an inline figure |
| 5 | Available balance | Value + open-exposure hint | **Sidebar — 1st** |
| 6 | Settled P&L | Value + win/loss counts | **Sidebar — 2nd** |
| 7 | Active sequence | Number + bet count and recovery gap | Folded into the Sequences header meta (item 3) |
| 8 | Largest stake | Value + safety-limit hint | **Sidebar — 4th** |
| 9 | Goal tracking | Settled result, goal value, progress bar, percentage | **Sidebar — 3rd** |
| 10 | Guardrails | Risk flags or an "within limits" message + link to Settings | Dismissible banner at the top of Sequences, **only when a limit is breached** |
| 11 | Recent bets | Last five bets — duplicates Sequences | **Dropped** |
| 12 | Empty state | "No bets recorded yet" + "Add the first bet" action | Sequences empty state |

The sidebar holds exactly four items, in the order 5 → 6 → 9 → 8: Available balance,
Settled P&L, Goal tracking, Largest stake.

The "within limits" reassurance message (part of item 10) is **not** carried over. The
banner is an exception-only surface: silence means no breach.

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
Scenario: Guardrail warnings appear only when a limit is breached
  Given open exposure is above the configured limit
  When the user is viewing their sequences
  Then a guardrail warning should be visible without opening a panel
  And the user should be able to dismiss it
```

```gherkin
Scenario: No guardrail warning when within limits
  Given open exposure and stakes are within the configured limits
  When the user is viewing their sequences
  Then no guardrail warning should be shown
```

```gherkin
Scenario: Settings opens over the sequences view
  Given the user is viewing their sequences
  When the user opens settings
  Then the settings overlay should be shown
  When the user closes the settings overlay
  Then the sequences view should be shown again
```

```gherkin
Scenario: The summary is reachable on a small screen
  Given the viewport is below the mobile breakpoint
  When the user is viewing their sequences
  Then the summary sidebar should be presented as a drawer
  And the user should be able to open and dismiss it
```

```gherkin
Scenario: An empty ledger still prompts a first bet
  Given a ledger with no recorded bets
  When the app starts
  Then the user should see a clear prompt to record the first bet
```

## Edge cases

- **Empty ledger:** the "Add the first bet" prompt moves to the Sequences empty state.
- **Mobile widths:** the sidebar becomes a drawer. The guardrail banner stays **outside**
  the drawer so a breach is never hidden behind a control the user must open.
- **No active sequence:** the summary must still render sensibly ("Ready for a new
  sequence").
- **Post-import / post-restore / post-reset:** these currently send the user to Home;
  they now close the Settings overlay and return to Sequences.
- **Long ledger names:** the ledger name stays in the Sequences header, so the existing
  full-width treatment still applies — it is not squeezed into the narrow sidebar.
- **Guardrail dismissal then a new breach:** a newly raised flag must resurface the
  banner even if a previous one was dismissed.
- **Settings overlay open when a breach occurs:** the banner is on the Sequences view
  beneath; it must be present once the overlay is closed.

## Data impact

- **`LedgerState` shape:** unchanged.
- **`localStorage` migration:** not needed. **No new persisted UI state is introduced.**
  The sidebar is always visible on desktop, the mobile drawer opens closed each time, and
  guardrail dismissal is held in component state only — it resets on reload (FR-5a).
- **Cloud schema:** unchanged.
- **Workbook import:** unchanged.

## Test impact

The existing E2E suite asserts Home-specific behaviour and will need updating:

- `e2e/features/fairbets.feature` asserts the ledger name heading and a "Current ledger"
  section on load.
- `e2e/features/bets.feature` reads the available balance on load, and again after
  navigating to "Overview" following a settlement. The second navigation step disappears
  entirely: the balance now updates in place.
- `e2e/steps/fairbets.steps.js` has a step that clicks "Overview", which no longer exists.
- Any step reaching Settings via a tab must instead open the Settings overlay.

New coverage is required for: the guardrail banner appearing only on breach and being
dismissible, the Settings overlay opening and closing, and the mobile drawer.

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
- [x] VI. Risk limits enforced — guardrail visibility protected by FR-5 and FR-5a;
      dismissal is transient and cannot permanently mute a warning
- [x] VII. Data compatibility — no ledger shape change
- [x] VIII. No secrets
- [ ] IX. Behaviour specified in Gherkin — scenarios above; E2E updates required
- [ ] X. Gates pass — to confirm at verification

## Resolved decisions

All clarifications are closed. No `[NEEDS CLARIFICATION]` markers remain.

| # | Question | Decision |
| --- | --- | --- |
| 1 | Which Home elements go where? | See "Information to rehome". Sidebar holds four items: Available balance, Settled P&L, Goal tracking, Largest stake. Recent bets dropped. |
| 2 | How is the summary presented on mobile? | As a drawer, opened from a header control. |
| 3 | What happens to navigation? | No tabs at all. Settings becomes an overlay above Sequences, opened from the header and closed with an explicit control. |
| 4 | Is the sidebar collapsible? | Always visible on desktop. No persisted state. |
| 5 | Where do import, restore, and reset send the user? | Back to Sequences. |
| 6 | Where do guardrail warnings live? | A dismissible banner at the top of Sequences, shown only when a limit is breached. |
| 7 | What happens to the next bet guide? | Reduced to an inline figure in the Sequences header. The Add-bet form keeps its own live suggestion. |

### Note on FR-5 and dismissal

Making the banner dismissible is a deliberate relaxation of "always visible". It is
acceptable because the warning is **shown by default**, requires an explicit user action
to dismiss, and returns whenever the risk picture changes or the app restarts. Constitution
principle VI is satisfied: the user is always warned, and is never able to permanently
silence the warning.

## Out of scope for now

- Reordering or restyling the sequence list itself.
- Making the sidebar configurable by the user.
- Any change to what the Settings page contains.
