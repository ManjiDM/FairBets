# Bugfix: Bet dialog layout on mobile and redundant suggestion box

| Field | Value |
| --- | --- |
| ID | `FB-036-fix-bet-dialog-layout` |
| Status | Reproducing |
| Severity | Cosmetic |
| Created | 2026-10-11 |
| Related | FB-029 (simplified bet form), FB-030 |

## Observed behaviour

1. On mobile the Label field of the new bet dialog is squeezed into a narrow second
   column beside Date and time, so its placeholder is cut off ("Optio").
2. The read-only placement time is shown as a form field, unlike the timestamp style of
   the bet cards.
3. The dialogs show a "Suggested stake / Recovery offset / This bet will be added to ..."
   box that repeats information already available (the Stake field's placeholder shows
   the suggested stake).

## Expected behaviour

1. Label occupies the whole row on mobile, as it does on desktop.
2. In the new bet dialog the placement time is plain text directly below the "Add a bet"
   heading, styled like a bet card timestamp (for example "11 Oct, 12:47:36"). The edit
   dialog keeps its editable Date and time field.
3. The suggestion box is removed from both the new bet and edit dialogs. The suggested
   stake stays visible as the Stake field's placeholder.

The expectations are stale rather than the calculations wrong: no money figure changes.

## Reproduction

```text
Viewport 390px wide, press Add bet.
Observed: Label is in a narrow column; the suggestion box is shown.
Expected: Label spans the full row; no suggestion box; timestamp text under the title.
```

## Root cause

`.form-field-pair` spans two columns, but on mobile `.form-grid` has a single column, so
the span creates an implicit second column that squeezes the Label field.

- **Introduced by:** FB-029
- **Why tests missed it:** no scenario checked the Label width on mobile.

## Blast radius

Presentation only; no stored data or money figure is affected: none.

## Regression scenarios

```gherkin
Scenario: The Label field takes the whole row on mobile
  Given the viewport is a small phone
  When I press the Add Bet button
  Then the "Label" field should be as wide as the dialog form

Scenario: The new bet timestamp is shown under the title
  When I press the Add Bet button
  Then the placement time should be shown below the "Add a bet" heading

Scenario: The suggestion box is removed
  When I press the Add Bet button
  Then the bet dialog should not show a suggestion box
```

Where it lands:

- [x] `e2e/features/bets.feature`

## Fix

Stop the pair spanning extra columns on mobile; render the new bet timestamp as text in
the heading; remove the suggestion box. Existing steps that read the suggested stake read
the Stake placeholder instead.

## Constitution check

- [x] III to VII: no domain, persistence or cloud change
