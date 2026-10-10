# Spec: Sequence-aware description filter

| Field | Value |
| --- | --- |
| ID | `FB-027-sequence-aware-description-filter` |
| Status | Shipped |
| Created | 2026-10-10 |
| Related | — |

## Problem

The free-text filter on the Sequences view hides every bet in a sequence except the ones
whose description matches, so a hit shows a sequence stripped of its context. It also
cannot find a sequence by the label printed on its card ("Sequence 28" or "Bet 29").

## Goal

A match on a bet shows its whole sequence, and the filter also matches the number label
shown on each sequence card.

## Non-goals

- No change to stake, sequence, balance or any other money behaviour.
- No change to the Active / Closed / All status filter semantics.
- No change to how standalone cancelled bets are filtered.
- No fuzzy or multi-term matching; matching stays case-insensitive substring.

## Users and scenarios

**Primary user:** a person tracking their own betting sequences.

They type part of a bet description and want to see the full sequence that bet belongs
to, with all of its bets. They also type "Sequence 28" or "Bet 29", as printed on a card,
and expect that card.

## Functional requirements

- **FR-1** When the filter text matches the description of any bet in a sequence, the
  system MUST show that sequence with all of its bets, including those that do not match.
- **FR-2** The system MUST match the filter text, case-insensitively and as a substring,
  against the number label shown on the sequence card: "Sequence N" for sequences with
  more than one bet and "Bet N" for single-bet sequences.
- **FR-3** When the label matches, the system MUST show that sequence with all of its
  bets.
- **FR-4** The system MUST keep applying the selected Active / Closed / All status filter
  together with the text filter.
- **FR-5** The system MUST NOT hide or alter standalone cancelled bets differently from
  today, and MUST NOT change any calculated amount.
- **FR-6** An empty filter MUST show everything as today.

## Business rules

No money rules change. Matching examples (sequence 1 has two bets "Home 123456" and
"Another bet"; sequence 2 is a single bet "Away 654321"):

| Filter | Sequences shown | Bets shown | Notes |
| --- | --- | --- | --- |
| `1234` | 1 | both bets of sequence 1 | bet match shows whole sequence |
| `sequence 1` | 1 | both bets | label match |
| `Bet 2` | 2 | its single bet | single-bet label |
| `zzz` | none | none | no match |

## Acceptance scenarios

```gherkin
Scenario: A matching bet shows its whole sequence
  Given a sequence with two bets and only one description containing "1234"
  When I filter the bet list by description "1234"
  Then both bets of the sequence are visible
```

```gherkin
Scenario: The sequence number label is searchable
  Given a multi-bet sequence and a single-bet sequence
  When I filter the bet list by description "Sequence 1"
  Then the multi-bet sequence is visible with all its bets
  And the single-bet sequence is not visible
  When I filter the bet list by description "Bet 2"
  Then the single-bet sequence is visible
  And the multi-bet sequence is not visible
```

## Edge cases

- Filter matching no bet and no label shows the existing "no match" empty state.
- A bare number such as "2" matches any description or label containing it.
- Nested "Bet N" position labels inside a multi-bet sequence are not matched; only the
  card-level label is.
- Existing saved ledgers: unaffected; nothing is persisted.

## Data impact

None. `LedgerState`, `localStorage`, the cloud schema and the workbook layout are
unchanged.

## Constitution check

- [x] I. Private tracker, never an operator
- [x] II. Local-first
- [x] III. Deterministic domain logic
- [x] IV. UI and domain separated; no money math added to the UI
- [x] V. The sequence model is preserved
- [x] VI. Risk limits stay enforced
- [x] VII. Data compatibility preserved
- [x] VIII. No secrets introduced
- [x] IX. Behaviour specified in Gherkin
- [ ] X. Gates pass (verified at implementation)

## Open questions

None. The existing scenario "Filter individual bets within a sequence" asserts that a
non-matching bet is hidden; FR-1 deliberately reverses that, so its expectation is
stale and is updated together with the tests.

## Out of scope for now

Filtering standalone cancelled bets by number; multi-term search.
