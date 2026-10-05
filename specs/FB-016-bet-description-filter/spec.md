# Spec: Filter bets by description

| Field | Value |
| --- | --- |
| ID | `FB-016-bet-description-filter` |
| Status | Draft |
| Created | 2026-10-05 |
| Related | None |

> Describe **what** changes for the user and **why**. No file names, function names,
> library choices, or code. Mark unknowns as `[NEEDS CLARIFICATION: question]` and
> resolve them all before planning.

## Problem

When a ledger contains many bets, finding a particular bet by its description takes
too long. Bet cards also show odds separately as "1.20 odds", rather than alongside
the description in a compact, recognizable form.

## Goal

Let users narrow the visible bet history by typing part of a bet description. Show
each bet's decimal odds appended to its description in the form `Description @ 1.20`.

## Non-goals

- Changing bet labels, odds, outcomes, sequence membership, or financial calculations.
- Searching by date, stake, outcome, or other bet fields.
- Changing the active/closed sequence filter.

## Users and scenarios

**Primary user:** A person looking for a particular bet in a ledger with many recorded
bets.

The user types any portion of a bet description and sees matching bets without needing
to enter the full description. A sequence remains visible when one or more of its bets
match, and only matching bets in that sequence are shown while the search is active.
Standalone cancelled bets are filtered by the same input. Clearing the input restores
the full list, subject to the selected sequence-status filter.

## Functional requirements

- **FR-1** The sequences view MUST provide a text input for filtering by bet description.
- **FR-2** The filter MUST match a substring of a bet's displayed description; the
  complete description MUST NOT be required.
- **FR-3** Description matching MUST ignore letter case.
- **FR-4** A displayed bet description MUST append the decimal odds in the form
  `@ <odds>`, for example `Home team @ 1.20`. A bet without a custom description MUST
  still display its odds in this form.
- **FR-5** When a sequence contains one or more matching bets, the sequence MUST remain
  visible and show only its matching bets while the filter is non-empty.
- **FR-6** Sequences with no matching bets MUST be hidden. The existing active/closed
  filter MUST continue to apply.
- **FR-7** Standalone cancelled bet records MUST use the same partial-description
  filtering behavior.
- **FR-8** Clearing the text input MUST restore all bets permitted by the selected
  active/closed filter.
- **FR-9** Filtering MUST NOT change saved bet data, sequence calculations, or ledger
  totals.

## Business rules

| Input | Expected result | Notes |
| --- | --- | --- |
| Description is `123456`; search is `1234` | Bet remains visible | Partial match |
| Description is `Home team`; search is `hOmE` | Bet remains visible | Case-insensitive |
| Description is `Home team @ 1.20` | Display as `Home team @ 1.20` | Odds appended |
| Search matches one bet in a multi-bet sequence | Show the sequence and only the matching bet | Preserve sequence grouping |
| Search matches no bet in a sequence | Hide that sequence | Do not alter its data |

## Acceptance scenarios

```gherkin
Scenario: Filter descriptions by a partial, case-insensitive match
  Given bets described as "Home 123456" and "Away 654321"
  When I search for "1234"
  Then "Home 123456 @ 1.20" is visible
  And "Away 654321 @ 1.35" is not visible
  When I search for "hOmE 1234"
  Then "Home 123456 @ 1.20" is visible
  And "Away 654321 @ 1.35" is not visible
```

```gherkin
Scenario: Show only matching bets within a matching sequence
  Given a sequence has bets described as "Sequence 123456" and "Another sequence bet"
  When I search for "1234"
  Then the sequence remains visible
  And "Sequence 123456 @ 1.50" is visible
  And "Another sequence bet @ 1.50" is not visible
```

```gherkin
Scenario: Clear the description search
  Given the bet list is filtered by a partial description
  When I clear the search
  Then all bets allowed by the selected sequence-status filter are visible
```

## Edge cases

- An empty or whitespace-only query shows all bets allowed by the status filter.
- A query that matches no bet shows a clear no-results message.
- Automatically generated descriptions still show odds as `@ <odds>`.
- A query may match the displayed odds portion of the description.
- Cancelled-only records remain searchable in their separate history list.
- Filtering a multi-bet sequence does not change the sequence's status or calculations.

## Data impact

- `LedgerState` shape: none.
- `localStorage` migration: none.
- Cloud schema: none.
- Workbook import layout: none.
- Filtering is a view-only operation and does not persist.

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

None.

## Out of scope for now

Adding search across dates, outcomes, stakes, sequence numbers, or ledger totals.
