# Spec: Filter scope toggle

| Field | Value |
| --- | --- |
| ID | `FB-028-filter-scope-toggle` |
| Status | Draft |
| Created | 2026-10-10 |
| Related | [FB-027](../FB-027-sequence-aware-description-filter/spec.md) |

## Problem

Since FB-027 a text match always shows the entire sequence. Sometimes the person wants to
see only the individual bets that match, as before, and has no way to choose.

## Goal

A switch inside the filter input lets the person choose whether the text filter shows
whole sequences or only the individual matching bets.

## Non-goals

- No change to stake, sequence, balance or any other money behaviour.
- No change to the Active / Closed / All status filter or to standalone cancelled bets.
- The choice is not saved; it is not part of the ledger.

## Users and scenarios

**Primary user:** a person tracking their own betting sequences.

They type part of a description. By default they see each matching sequence in full. They
flip the switch inside the input to see only the bets that match, and flip it back to see
whole sequences again.

## Functional requirements

- **FR-1** The filter input MUST contain a switch, placed inside the input at its right
  edge, with an accessible name "Show whole sequences".
- **FR-2** The switch MUST be on by default, giving the FB-027 behaviour: a sequence
  with any matching bet or matching card label is shown with all its bets.
- **FR-3** When the switch is off, a sequence MUST be shown only if one of its bets
  matches or its card label matches. For a bet match, only the matching bets of a
  multi-bet sequence are shown; a card-label match always shows all of the sequence's
  bets, since the label identifies the sequence itself.
- **FR-4** Changing the switch MUST update the list immediately and keep the filter text
  and the selected Active / Closed / All filter.
- **FR-5** With an empty filter the switch MUST NOT change what is shown.
- **FR-6** The typed text MUST NOT run underneath the switch.
- **FR-7** The switch MUST NOT persist or alter any saved data.

## Business rules

No money rules change. Sequence 1 has "Home 123456" and "Another bet"; sequence 2 is a
single bet "Away 654321".

| Filter | Switch | Bets shown | Notes |
| --- | --- | --- | --- |
| `1234` | on | both bets of sequence 1 | whole sequence |
| `1234` | off | only "Home 123456" | individual bets |
| `sequence 1` | off | both bets of sequence 1 | label match shows all |
| `1234` | either | sequence 2 hidden | no match |

## Acceptance scenarios

```gherkin
Scenario: The filter scope switch is on by default and inside the input
  Then the "Show whole sequences" switch is on
  And it is inside the filter input
```

```gherkin
Scenario: Turning the scope switch off shows only matching bets
  Given a sequence with two bets and only one description containing "1234"
  When I filter the bet list by description "1234"
  Then both bets of the sequence are visible
  When I turn the "Show whole sequences" switch off
  Then only the matching bet is visible
  When I turn the "Show whole sequences" switch on
  Then both bets of the sequence are visible
```

```gherkin
Scenario: A sequence label match shows the whole sequence with the switch off
  Given the switch is off
  When I filter the bet list by description "sequence 1"
  Then all bets of that sequence are visible
```

## Edge cases

- Mobile width: the switch stays inside the input without overflow.
- Existing saved ledgers: unaffected; nothing is persisted.

## Data impact

None.

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

None. Assumptions made: the default is on (matches today's behaviour), and a card-label
match shows the whole sequence in both modes.

## Out of scope for now

Persisting the switch; applying it to standalone cancelled bets.
