# Spec: Show bet recording time with second precision

| Field | Value |
| --- | --- |
| ID | `FB-017-second-precision-bet-time` |
| Status | Done |
| Created | 2026-10-05 |
| Related | [FB-013](../FB-013-recording-order-and-odds-title/spec.md) |

> Describe **what** changes for the user and **why**. No file names, function names,
> library choices, or code. Mark unknowns as `[NEEDS CLARIFICATION: question]` and
> resolve them all before planning.

## Problem

The time shown with a bet currently represents when the bet was placed, while the
sequence list is ordered by when bets were recorded in FairBets. These are different
times and can cause confusion when a bet is entered later with a backdated placement
time. Bet entry also only accepts minute precision, making closely placed bets
indistinguishable for chronological calculations.

## Goal

Keep the entered placement time for sequence calculations, add seconds to that input,
and consistently order and label the visible bet history by the time each bet was
added to FairBets. The added time is the sole timestamp used for list ordering and is
displayed through seconds, with milliseconds retained internally for uniqueness.

## Non-goals

- Removing or changing the entered placement time used for sequence calculations.
- Changing financial calculations other than the intended effect of additional
  placement-time precision.
- Changing workbook date/time columns.
- Showing millisecond precision to users.

## Users and scenarios

**Primary user:** A person recording bets, including bets entered in a different order
from when they were placed.

The user continues to enter or edit when a bet was placed, now down to seconds. The app
continues to use this value for sequence progression. The bet history shows when each
bet was added to FairBets and uses that timestamp, rather than the placement time or
bet ID, to order visible bets. Bet cards show the added time, not the entered placement
time. Sequence cards and bet rows follow recording order.
Two bets added during the same displayed second remain distinguishable internally by
their milliseconds, while the UI shows only seconds.

## Functional requirements

- **FR-1** The editable placement date/time input MUST support seconds and preserve
  them when a bet is saved and edited.
- **FR-2** Placement time MUST continue to determine chronological sequence
  calculations. Adding seconds may change progression where bets previously shared a
  minute timestamp.
- **FR-3** The time a bet was added to FairBets MUST be the sole timestamp used to
  order visible sequence cards, bet rows, and standalone cancelled bet cards.
  Placement time and bet ID MUST NOT be used to order this visible history.
- **FR-4** The recording timestamp MUST be shown with each bet through seconds.
  Milliseconds MUST remain hidden.
- **FR-5** Recording timestamps MUST retain millisecond precision internally. Bets
  recorded in the same second MUST receive distinct recording timestamps so their
  order is determined by timestamp alone.
- **FR-6** When multiple existing bets have identical recording timestamps, the app
  MUST assign distinct milliseconds in their existing stable order.
- **FR-7** Sequence cards MUST be ordered by the recording timestamp of their first
  recorded bet, newest first. Bet rows within a sequence MUST be ordered by their
  individual recording timestamps, oldest first. Standalone cancelled bet cards MUST
  be ordered by recording timestamp, newest first.
- **FR-8** Editing placement time MUST NOT change the recording timestamp or move the
  bet in the visible recording order.
- **FR-9** Existing minute-precision placement times and records without a valid
  recording timestamp MUST remain readable and receive a stable compatible value.
- **FR-10** This change MUST NOT alter stake, result, or recovery calculations except
  where second precision changes the chronological placement-time order.

## Business rules

| Input | Expected result | Notes |
| --- | --- | --- |
| Bet A placed 12:00:15, bet B placed 12:00:45 | Sequence calculation uses A before B | Placement time, including seconds |
| Bet A is added at 12:01:10, bet B at 12:01:42 | B appears later in recording order | Bet card shows `12:01:42` |
| A backdated bet is added after a newer-placed bet | The newly added bet appears first in the visible list | List order follows recording time |
| Two bets are added in the same displayed second | They have distinct millisecond recording timestamps and stable order | UI displays the same second |
| A bet's placement time is edited | Sequence calculations may update; recording order stays fixed | Recording timestamp is unchanged |

## Acceptance scenarios

```gherkin
Scenario: Placement input keeps second precision for sequence calculations
  Given a bet has placement time 12:00:15
  When I record another bet placed at 12:00:45
  Then the placement times retain their seconds
  And sequence calculations order them by placement time
```

```gherkin
Scenario: Show and order bets by when they were added in FairBets
  Given I add a bet with an earlier placement time
  When I later add a bet with a later placement time
  Then the later-added bet appears first in the visible history
  And each bet shows its recording time through seconds
  And the entered placement time is not shown on the bet card
```

```gherkin
Scenario: Same-second recording timestamps remain uniquely ordered
  Given two bets are added during the same displayed second
  When the visible history is ordered
  Then their recording timestamps have distinct milliseconds
  And their order is determined only by those timestamps
  And the UI displays no milliseconds
```

```gherkin
Scenario: Editing placement time does not move a recorded bet
  Given two bets have a known recording order
  When I edit one bet's placement time and reload the ledger
  Then its placement time is preserved through seconds
  And both bets retain their original recording order
```

## Edge cases

- Existing placement times do not contain seconds.
- A bet is edited without changing placement time; its recording timestamp stays
  unchanged.
- Multiple bets are recorded in the same second.
- Existing local/cloud records have duplicate or missing recording timestamps.
- A continuation bet is recorded later but has an earlier placement time.
- Sequence calculations use placement order while bet-row display uses recording
  order.
- Workbook import columns and their existing precision remain compatible.

## Data impact

- `LedgerState` shape: unchanged; existing `placedAt` and `createdAt` fields are used.
- `localStorage` migration: no shape change. Invalid or duplicate recording timestamps
  are normalized to stable, unique millisecond values.
- Cloud schema: unchanged; existing timestamps support fractional-second precision.
- Workbook import layout: unchanged.

## Constitution check

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

## Open questions

None. The user-entered placement time remains editable for calculations and gains
seconds. Recording time—the time the bet was added to FairBets—is the sole visible-list
ordering timestamp and is displayed to seconds only; cards do not show the entered
placement time. Milliseconds distinguish records created in the same second.

## Out of scope for now

Using recording time for stake progression or sequence calculations, removing the
placement-time input, or changing workbook columns.
