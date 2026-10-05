# Spec: Add seconds to bet placement time

| Field | Value |
| --- | --- |
| ID | `FB-017-second-precision-bet-time` |
| Status | Clarified |
| Created | 2026-10-05 |
| Related | [FB-013](../FB-013-recording-order-and-odds-title/spec.md) |

> Describe **what** changes for the user and **why**. No file names, function names,
> library choices, or code. Mark unknowns as `[NEEDS CLARIFICATION: question]` and
> resolve them all before planning.

## Problem

Bet placement date and time currently have minute precision. Bets entered in the same
minute can therefore have identical placement timestamps, leaving their chronological
order dependent on an unrelated fallback rather than the time the user recorded.

## Goal

Let users enter bet placement times with second-level precision, retain that precision,
and use the placement timestamp itself for chronological bet ordering.

## Non-goals

- Changing the separate internal recording timestamp or the order in which sequence
  cards are displayed under FB-013.
- Changing bet outcomes, stake calculations, sequence membership rules, or recovery
  calculations.
- Adding fractional-second input.
- Changing workbook date/time columns.

## Users and scenarios

**Primary user:** A person recording several bets placed close together in time.

The user can enter the placement time down to seconds. When bets have different
placement timestamps within the same minute, they are processed and presented in the
chronological order of those timestamps. The entered seconds are preserved when the
bet is edited, saved, and reloaded.

## Functional requirements

- **FR-1** The placement date/time input MUST allow second-level precision.
- **FR-2** The user-entered placement time MUST preserve seconds when saved and when
  the bet is edited. Displayed placement date/time MUST include seconds.
- **FR-3** Bet chronological ordering MUST compare the placement timestamp, including
  seconds and milliseconds. The timestamp MUST be the sole chronological sort key;
  bet IDs or other unrelated values MUST NOT be used as ordering tie-breakers.
- **FR-4** When a user enters a time that collides with another bet at second precision,
  the app MUST assign a unique millisecond value within that same second. The visible
  input and displayed placement date/time MUST show only through seconds.
- **FR-5** Existing bets saved with minute precision MUST remain readable. If multiple
  existing bets have identical timestamps, the app MUST assign distinct milliseconds
  in their existing stable order without changing their displayed second.
- **FR-6** Internal recording timestamps used by FB-013 for ordering sequence cards
  MUST remain unchanged.
- **FR-7** Sequence progression MUST follow the resulting placement timestamps. Bets
  whose timestamps do not collide MUST retain their existing chronological order.
- **FR-8** Changing placement time MUST NOT alter any other entered bet value.

## Business rules

| Input | Expected result | Notes |
| --- | --- | --- |
| Bet A is entered at 12:00:15 and bet B at 12:00:45 | B is later than A for chronological ordering | Same minute, distinct seconds |
| Two bets are entered at 12:00:15 | Their stored timestamps receive distinct milliseconds within second 15 | Same visible time; timestamp remains the sole sort key |
| Two legacy bets have the same minute-precision timestamp | Assign distinct milliseconds in existing stable order | Displayed second remains :00 |

## Acceptance scenarios

```gherkin
Scenario: Order bets chronologically within the same minute
  Given a bet is placed at 12:00:15
  When I record another bet placed at 12:00:45
  Then the bets are ordered by those placement timestamps
  And the displayed placement times include their seconds
```

```gherkin
Scenario: Preserve seconds when editing and reloading a bet
  Given a bet has placement time 12:00:37
  When I edit the bet and save it
  And I reload the ledger
  Then the bet's placement time is still 12:00:37
```

```gherkin
Scenario: Keep sequence-card recording order independent
  Given two sequences were recorded at different times
  When their placement timestamps are edited
  Then sequence-card display order continues to follow the FB-013 recording order
```

```gherkin
Scenario: Distinguish bets entered at the same second
  Given a bet has placement time 12:00:15
  When I record another bet with placement time 12:00:15
  Then each bet has a unique millisecond timestamp within second 15
  And the bet order is determined only by those timestamps
  And both displayed times remain 12:00:15
```

## Edge cases

- Existing bet timestamps do not contain seconds.
- An edited bet must not lose its seconds.
- Two independent bets can be entered with identical second-precision timestamps;
  the stored millisecond values distinguish their order.
- Two bets in one sequence can be entered with identical second-precision timestamps;
  the stored millisecond values distinguish chronological progression.
- A timestamp edit can change chronological ordering and therefore sequence progression.
- Internal sequence-card recording order remains independent of placement-time edits.
- Workbook imports retain their existing source precision and remain compatible.

## Data impact

- `LedgerState` shape: unchanged; `placedAt` already stores a date/time string.
- `localStorage` migration: not expected for existing minute-precision values.
- Cloud schema: unchanged; the existing placement timestamp column stores
  millisecond precision.
- Workbook import layout: unchanged; imported values keep their current precision.

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
- [ ] X. Gates pass

## Open questions

None. Seconds are visible in the entry/edit control and displayed date/time. Bets
entered at the same second receive unique millisecond values within that second; the
timestamp is the sole chronological sort key.

## Out of scope for now

Changing sequence card ordering away from the internal recording timestamp, introducing
fractional-second precision, or changing imported workbook layouts.
