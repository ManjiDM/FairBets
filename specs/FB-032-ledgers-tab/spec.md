# Spec: Ledgers tab with expandable ledger cards

| Field | Value |
| --- | --- |
| ID | `FB-032-ledgers-tab` |
| Status | Shipped |
| Created | 2026-10-11 |
| Related | Replaces the Ledgers dialog from FB-031 |

## Problem

The ledger lifecycle from FB-031 lives in a modal opened from a toolbar button. It hides
the sequences while open, shows closed ledgers as a flat block of figures, gives ledgers
no number, and has no profit percentage, so ledgers cannot be compared at a glance.

## Goal

The app has two tabs: **Sequences** (today's view of the active ledger) and **Ledgers**.
The Ledgers tab lists every ledger as a card, newest first, showing its number, name, net
result and profit percentage, and expands on click to show its remaining statistics.

## Non-goals

- Any change to funds, investment, close or start rules from FB-031.
- Changing stored data, the cloud payload or the sequence model.
- Showing the individual bets of a closed ledger.
- Parallel ledgers.

## Users and scenarios

**Primary user:** a person running ledgers in rounds who wants to compare them.

Narrative: the user opens the Ledgers tab, sees the funds, then a list of ledgers with the
most recent first. Each card says "Ledger 3", its name, how much it made or lost and the
return on its starting balance. Clicking a card reveals the rest of its statistics.

## Functional requirements

- **FR-1** The app MUST offer two tabs, **Sequences** and **Ledgers**. Sequences is
  selected on load and shows exactly what the app shows today for the active ledger.
- **FR-2** The Ledgers dialog and the toolbar button that opened it MUST be removed.
- **FR-3** The Ledgers tab MUST show the funds summary, the investment form, the active
  ledger controls (close, or start a new ledger when none is active), the ledger cards
  and the history. The Sequences content MUST NOT show while it is selected.
- **FR-4** Each ledger, including the active one, MUST appear as a card. Cards MUST be in
  descending order of the ledger's opening time.
- **FR-5** Every ledger MUST have a sequence number: the first ledger ever opened is
  Ledger 1, the next Ledger 2, and so on. A number never changes once assigned.
- **FR-6** A collapsed card MUST show the ledger number, its name, its status (Active or
  Closed), its net result and its profit percentage.
- **FR-7** Profit percentage MUST be the net result divided by the starting balance, shown
  as a signed percentage with two decimals.
- **FR-8** Clicking a card MUST toggle it. When expanded it MUST show the starting
  balance, final balance, total staked, wins, losses, win rate, closed sequences, and the
  opening time and, for a closed ledger, the closing time. It MUST be operable by keyboard.
- **FR-9** The card of the active ledger MUST show live figures, using the same settled
  profit the Sequences view shows. Open bets are not counted as losses.
- **FR-10** All FB-031 rules for funds, investments, closing, starting and history MUST
  keep working unchanged.

## Business rules

Net result = final balance − starting balance. Profit % = net result ÷ starting balance.

| Starting balance | Net result | Profit % | Notes |
| --- | --- | --- | --- |
| 37.92 | +0.10 | +0.26% | 0.10 ÷ 37.92 = 0.2637% |
| 100.00 | −8.00 | −8.00% | Losses show a minus sign |
| 50.00 | 0.00 | 0.00% | No sign when zero |

## Acceptance scenarios

```gherkin
Scenario: The app has Sequences and Ledgers tabs
  When the app opens
  Then the Sequences tab is selected
  When I open the Ledgers tab
  Then the Ledgers tab is selected and the sequences are not shown

Scenario: Ledger cards are numbered and newest first
  Given Ledger 1 is closed and Ledger 2 is active
  Then Ledger 2 is listed before Ledger 1

Scenario: A card shows net result and profit percentage
  Given a ledger that started at 37.92 and finished at 38.02
  Then its card shows +0.10 and +0.26%

Scenario: A card expands to show the rest of its statistics
  When I click a closed ledger card
  Then it shows its starting balance, final balance, staked, wins, losses and win rate
  When I click it again
  Then those statistics are hidden
```

## Edge cases

- No ledger is active: the list shows only closed ledgers and the start form is shown.
- A ledger with zero bets shows 0.00 and 0.00%.
- Existing saved data: the migrated ledger is Ledger 1.

## Data impact

None. The number, profit percentage and ordering are derived from the stored portfolio.

## Constitution check

- [x] III and IV: the numbering, ordering and percentage are pure domain functions
- [x] V, VI: sequence model and limits untouched
- [x] VII: no stored shape change

## Open questions

None. Profit percentage is measured against each ledger's own starting balance.

## Out of scope for now

Charts across ledgers and per-ledger bet drill-down.
