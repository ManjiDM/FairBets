# Spec: Improve buttons using icons

| Field | Value |
| --- | --- |
| ID | `FB-018-improve-buttons-using-icons` |
| Status | Clarified |
| Created | 2026-10-05 |
| Related | [FB-013](../FB-013-recording-order-and-odds-title/spec.md) |

> Describe **what** changes for the user and **why**. No file names, function names,
> library choices, or code. Mark unknowns as `[NEEDS CLARIFICATION: question]` and
> resolve them all before planning.

## Problem

The bet history uses text labels for frequent actions, including long outcome labels.
These labels take space in compact bet rows and make the actions visually heavier than
needed. Collapsed sequence cards also include a separate View button even though the
sequence summary itself already opens and closes the sequence.

## Goal

Make the named bet and sequence actions compact, icon-only controls while preserving
their meaning for assistive technology and pointer users. Remove the redundant View
control and let the existing sequence summary be the sole expand/collapse control.

## Non-goals

- Changing what any action does or when it is available.
- Replacing text labels in bet status badges, sequence headings, or other non-button
  content.
- Replacing unrelated text buttons such as Edit, Delete, Cancel, or Save changes.
- Changing sequence layout or expanding sequences by default.

## Users and scenarios

**Primary user:** A person recording and reviewing bets on desktop or mobile.

The user can add a bet, settle it as won, lost, or cancelled, close a sequence, or add
a bet to an existing sequence using compact icons. Each icon remains understandable
without relying on its shape or color alone: it has an accessible name and a pointer
tooltip that describe its action. When viewing a collapsed sequence, the user clicks
the sequence summary to expand it; clicking it again collapses it.

## Functional requirements

- **FR-1** The main Add Bet action and the Add Bet form submission action MUST use a
  plus icon without a visible text label.
- **FR-2** Won, Lost, and Cancelled actions MUST use distinct, recognizable icons
  without visible text labels. Their existing outcome status text remains elsewhere
  unchanged.
- **FR-3** Close Sequence MUST use an icon without a visible text label.
- **FR-4** The add-bet-to-sequence action MUST render its plus icon as an icon, not a
  text glyph.
- **FR-5** Each icon-only action MUST retain a descriptive accessible name and a
  pointer tooltip. Its action MUST remain usable by keyboard and pointer.
- **FR-6** Icon actions MUST retain the existing action behavior and availability.
- **FR-7** The redundant View button MUST be removed from collapsed sequence cards.
  The sequence summary MUST continue to expand and collapse the card. Other controls
  in the summary, such as Delete, MUST continue to perform their own action without
  accidentally toggling the sequence.
- **FR-8** Icon appearance MUST be consistent with the current FairBets visual style
  and remain legible at the existing compact button size.

## Business rules

| Action | Visual representation | Accessible name |
| --- | --- | --- |
| Add a new bet | Plus icon | Add bet |
| Mark bet won | Check icon | Won |
| Mark bet lost | Cross icon | Lost |
| Cancel a bet | Cancel/ban icon | Cancelled |
| Close a sequence | Close/archive icon | Close sequence |
| Add a bet to a sequence | Plus icon | Add bet to sequence `<number>` |
| Expand/collapse a sequence | The sequence summary itself | Sequence summary content |

## Acceptance scenarios

```gherkin
Scenario: Bet actions use labeled icons
  Given an open bet is displayed
  Then Won, Lost, and Cancelled are icon-only buttons with descriptive accessible names
  And the Add Bet control is an icon-only button with a descriptive accessible name
```

```gherkin
Scenario: Sequence actions use icons and the summary toggles details
  Given a collapsed sequence is displayed
  Then it has no View button
  When I click the sequence summary
  Then its bet details are expanded
  When I click the sequence summary again
  Then its bet details are collapsed
```

```gherkin
Scenario: Sequence continuation controls use labeled icons
  Given an active sequence can be continued or closed
  Then its add-bet and close-sequence controls are icon-only buttons with descriptive accessible names
```

## Edge cases

- Every icon-only button remains discoverable by its accessible name.
- Pointer tooltips use the same meaning as the accessible name.
- Icon-only form submission remains identifiable as Add Bet.
- Removing View does not disable keyboard activation of a sequence summary.
- Using Delete inside a sequence summary does not inadvertently toggle the sequence.

## Data impact

- No `LedgerState`, local storage, cloud schema, workbook, or migration changes.

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

None. Icon-only controls keep descriptive accessible names and pointer tooltips;
sequence summaries remain the expand/collapse interaction after removing View.

## Out of scope for now

Redesigning other text actions, statuses, or sequence navigation.
