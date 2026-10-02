# Spec: Order bets by recording time and show odds as the default title

| Field | Value |
| --- | --- |
| ID | `FB-013-recording-order-and-odds-title` |
| Status | Draft |
| Created | 2026-10-02 |
| Related | [FB-010](../FB-010-parallel-sequences/spec.md) |

> Describe **what** changes for the user and **why**. No file names, function names,
> library choices, or code. Mark unknowns as `[NEEDS CLARIFICATION: question]` and
> resolve them all before planning.

## Problem

When several bets have the same entered placement time, their sequence cards can
appear in an unexpected order because ties are resolved by generated IDs. A newly
recorded bet can appear below an older one. Automatically generated “Selection NN”
titles do not help identify a bet.

## Goal

Order sequence cards by when each sequence was recorded, newest first, independently
of the bet's entered placement time. Use the odds as the prominent title when a bet
has no user-provided label, while keeping custom labels.

## Non-goals

- Showing the internal recording timestamp in the interface.
- Changing the entered placement date/time or sequence recovery/settlement order.
- Removing support for user-provided bet labels.
- Changing workbook columns or betting calculations.

## Users and scenarios

**Primary user:** A person entering and reviewing bets, including several entered in
the same minute or with backdated placement times.

After recording a bet, the user expects its sequence card to appear above sequences
recorded earlier. The bet's entered placement time remains visible as before, but the
separate recording timestamp is internal ordering metadata only. If the user leaves
the label blank, the odds appear in the title position instead of a generated
“Selection NN” label. A label the user typed remains visible.

## Functional requirements

- **FR-1** Each newly recorded bet MUST receive a stable recording timestamp distinct
  from its user-entered placement date/time.
- **FR-2** Sequence cards MUST be ordered by the recording timestamp of the sequence's
  first bet, newest first.
- **FR-3** The recording timestamp MUST NOT be displayed in the UI.
- **FR-4** Existing bet calculations and progression MUST continue to use the entered
  placement date/time and sequence membership, not the recording timestamp.
- **FR-5** A blank label MUST display the bet's odds in the prominent title position
  instead of a generated “Selection NN” label.
- **FR-6** A user-provided label MUST remain available and display as the prominent
  title.
- **FR-7** Recording timestamps and ordering MUST persist after reload and cloud
  restore.
- **FR-8** Existing local, cloud, and workbook records without recording timestamps
  MUST remain readable and receive a stable backward-compatible ordering.
- **FR-9** Recording or changing odds MUST NOT silently replace a user-provided label.

## Business rules

| Input | Expected result | Notes |
| --- | --- | --- |
| Two bets have the same placement time but are recorded at different times | The later-recorded sequence appears first | Newest first |
| A new bet is recorded with a placement time earlier than existing bets | Its sequence appears first if it was recorded most recently | Placement time still controls domain progression |
| Blank label on a bet with odds 1.30 | Prominent title displays 1.30 odds | No “Selection NN” fallback |
| Custom label “Home team” with odds 1.30 | Prominent title remains “Home team” | Odds details remain available |
| Legacy records have no recording timestamp | Use a stable migration/fallback order and retain existing records | No timestamp shown |

## Acceptance scenarios

```gherkin
Scenario: Newest recorded sequence appears first when placement times tie
  Given two bets have the same entered placement time
  When I record the second bet after the first
  Then the second bet's sequence should appear first
  And the recording timestamp should not be displayed
```

```gherkin
Scenario: Latest recorded bet appears first even when it is backdated
  Given an existing sequence has a later entered placement time
  When I record a new independent bet with an earlier placement time
  Then the new sequence should appear first
  And sequence calculations should continue to use placement times
```

```gherkin
Scenario: Odds replace an automatically generated title
  Given I leave the bet label blank
  When I record the bet at odds 1.30
  Then the prominent title should show 1.30 odds
  And no generated “Selection NN” title should be shown
```

```gherkin
Scenario: Custom bet labels are retained
  Given I enter the label “Home team”
  When I record the bet at odds 1.30
  Then the prominent title should remain “Home team”
  And the bet's odds should still be visible in its details
```

## Edge cases

- Multiple bets are recorded within the same clock precision interval.
- A new standalone bet has an earlier placement time than an existing sequence.
- A continuation bet is recorded later but entered with an earlier placement time.
- A bet is edited; its original recording timestamp remains unchanged.
- Legacy local/cloud bets and workbook imports lack recording timestamps.
- An automatically generated old “Selection NN” label is shown as odds; a custom
  label must not be mistaken for an automatic one.
- Odds are edited on a bet with an automatic title; its displayed odds title stays
  current.

## Data impact

Each bet gains a recording timestamp used for display ordering only. Existing local
records and workbook imports without one require a deterministic compatibility
fallback. Cloud storage needs an additive nullable/backfilled column and parser/writer
support. No workbook format change is intended.

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

None. The new timestamp means the time the bet is recorded, not the user-entered
placement time. It is private ordering metadata. Blank or legacy-generated titles
show the bet's odds; user-entered labels remain unchanged.

## Out of scope for now

Changing the order in which bets inside a sequence are financially calculated.
