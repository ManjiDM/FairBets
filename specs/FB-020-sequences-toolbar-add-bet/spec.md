# Spec: Place Add Bet beside sequence filters

| Field | Value |
| --- | --- |
| ID | `FB-020-sequences-toolbar-add-bet` |
| Status | Shipped |
| Created | 2026-10-10 |
| Related | None |

> Describe **what** changes for the user and **why**. No file names, function names,
> library choices, or code. Mark unknowns as `[NEEDS CLARIFICATION: question]` and
> resolve them all before planning.

## Problem

The global Add Bet icon is separated from the sequence controls, so it feels detached
from the place where a user reviews and filters sequences. On mobile, it is especially
far from the filter controls.

## Goal

Make the global Add Bet action feel connected to sequence browsing by placing it beside
the sequence status filters on desktop and mobile. Shorten the all-status filter label
to "All".

## Non-goals

- Changing how a bet is added, which bets are shown by each filter, or when Add Bet is
  enabled.
- Changing the description search field or other sequence actions.
- Adding a second Add Bet action or changing the icon.

## Users and scenarios

**Primary user:** A person recording and reviewing their own betting sequences.

While browsing the Sequences view, the user can change the status filter and start
recording a new bet from the same compact control row. The row remains usable at mobile
widths, and the all-sequences filter is labeled simply "All".

## Functional requirements

- **FR-1** The all-status sequence filter MUST display the label "All".
- **FR-2** The global icon-only Add Bet button MUST appear in the same control row as the
  sequence status filters.
- **FR-3** The sequence filters and Add Bet control MUST remain visible and usable at
  desktop and mobile viewport widths without horizontal overflow.
- **FR-4** Activating Add Bet MUST continue to open the existing new-bet form.
- **FR-5** The existing filter selection behavior and accessible name of Add Bet MUST be
  preserved.

## Business rules

No money, stake, sequence, or persistence rules change.

| Input | Expected result | Notes |
| --- | --- | --- |
| Select "All" | All sequences are shown, subject to the description search | Existing all-status behavior |
| Activate Add Bet beside the filters | The existing new-bet form opens | Existing action |

## Acceptance scenarios

```gherkin
Scenario: The sequence toolbar groups Add Bet with filters
  Given I am viewing the Sequences page on a desktop
  Then the all-status filter should be named "All"
  And the Add Bet button should be in the sequence filter row
  When I press the Add Bet button
  Then I see the new bet dialog
```

```gherkin
Scenario: The sequence toolbar remains usable on mobile
  Given I am viewing the Sequences page on a small phone
  Then the all-status filter should be named "All"
  And the Add Bet button should be in the sequence filter row
  And the sequence controls should not overflow horizontally
```

## Edge cases

- The Add Bet control preserves its existing availability behavior.
- The mobile layout keeps the description search and status/action row usable.
- The active all-status filter remains visually selected.

## Data impact

- `LedgerState`: none.
- `localStorage`: none.
- Cloud schema: none.
- Workbook layout: none.

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

None.

## Out of scope for now

Redesigning the search field, sequence status filters, or Add Bet icon.
