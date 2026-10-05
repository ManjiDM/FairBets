# Spec: Add seconds to bet placement time

| Field | Value |
| --- | --- |
| ID | `FB-017-second-precision-bet-time` |
| Status | Draft |
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
- **FR-2** The user-entered placement timestamp MUST preserve seconds when saved and
  when the bet is edited.
- **FR-3** Bet chronological ordering MUST compare the placement timestamp, including
  seconds, and MUST NOT use a bet ID or another unrelated value to order bets with
  different timestamps.
- **FR-4** Displayed placement date/time MUST include the seconds precision entered by
  the user.
- **FR-5** Existing bets saved with minute precision MUST remain readable and retain
  their existing timestamp value.
- **FR-6** Internal recording timestamps used by FB-013 for ordering sequence cards
  MUST remain unchanged.
- **FR-7** This change MUST NOT alter monetary calculations for bets whose chronological
  order does not change.
- **FR-8** When multiple bets have exactly the same placement timestamp, the required
  ordering behavior is `[NEEDS CLARIFICATION: What should happen when two bets have
  identical placement timestamps down to the second?]`.

## Business rules

| Input | Expected result | Notes |
| --- | --- | --- |
| Bet A is entered at 12:00:15 and bet B at 12:00:45 | B is later than A for chronological ordering | Same minute, distinct seconds |
| A legacy bet has placement time 12:00 | It remains readable as 12:00:00 precision | No persisted-data migration required unless implementation shows otherwise |
| Two bets share the same placement timestamp | `[NEEDS CLARIFICATION: Define tie behavior, such as preserve existing order, automatically make timestamps unique, or reject duplicates.]` | Must not rely on a bet ID if ordering is exclusively by timestamp |

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
Scenario: Resolve identical second-precision timestamps
  Given two bets have identical placement timestamps down to the second
  When the ledger orders the bets
  Then [NEEDS CLARIFICATION: specify the required behavior]
```

## Edge cases

- Existing bet timestamps do not contain seconds.
- An edited bet must not lose its seconds.
- Two independent bets can be entered with identical second-precision timestamps.
- Two bets in one sequence can be entered with identical timestamps.
- A timestamp edit can change chronological ordering and therefore sequence progression.
- Internal sequence-card recording order remains independent of placement-time edits.
- Workbook imports retain their existing source precision and remain compatible.

## Data impact

- `LedgerState` shape: unchanged; `placedAt` already stores a date/time string.
- `localStorage` migration: not expected for existing minute-precision values.
- Cloud schema: unchanged; the existing placement timestamp column stores seconds.
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

- [NEEDS CLARIFICATION: What should happen when two bets have exactly the same
  placement timestamp down to the second? Should their existing order be preserved,
  should the app make timestamps unique, or should duplicate timestamps be rejected?]
- [NEEDS CLARIFICATION: Should seconds be visible in the displayed bet date/time, or
  should seconds only be available in the entry/edit control and ordering?]

## Out of scope for now

Changing sequence card ordering away from the internal recording timestamp, introducing
fractional-second precision, or changing imported workbook layouts.
