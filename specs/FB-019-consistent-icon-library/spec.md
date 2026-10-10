# Spec: Use a consistent icon set

| Field | Value |
| --- | --- |
| ID | `FB-019-consistent-icon-library` |
| Status | Draft |
| Created | 2026-10-10 |
| Related | [FB-018](../FB-018-improve-buttons-using-icons/spec.md) |

> Describe **what** changes for the user and **why**. No file names, function names,
> library choices, or code. Mark unknowns as `[NEEDS CLARIFICATION: question]` and
> resolve them all before planning.

## Problem

Some application icons are drawn individually while other small symbols are generated
as text. Their visual details can differ, making the controls feel inconsistent.

## Goal

Use one coherent set of icons throughout the application so action and navigation
symbols share a consistent visual style, while remaining understandable and accessible.

## Non-goals

- Changing what any action does, when it is available, or how ledger data is stored.
- Replacing text labels on buttons or status content that is not currently an icon.
- Changing the application's color palette, layout, or typography.

## Users and scenarios

**Primary user:** A person recording and reviewing bets on desktop or mobile.

The user sees action and navigation icons with a consistent visual style across the
application. Icon-only controls continue to expose descriptive names to assistive
technology and pointer tooltips, and all existing actions remain usable.

## Functional requirements

- **FR-1** All application action and navigation icons MUST use a single coherent visual
  icon set.
- **FR-2** Repeated actions MUST use the same icon consistently wherever they appear.
- **FR-3** Replacing icons MUST preserve each control's accessible name, tooltip where
  present, keyboard focus behavior, and action behavior.
- **FR-4** Icons MUST remain legible at their existing compact and responsive sizes.
- **FR-5** Icon rendering MUST NOT require network access at runtime.

## Business rules

No money, stake, or sequence rules change.

| Input | Expected result | Notes |
| --- | --- | --- |
| Use any existing icon-only action | The same action and accessible name remain available | Presentation only |
| View the same action in different parts of the app | Its icon has the same visual treatment | Consistent icon set |

## Acceptance scenarios

```gherkin
Scenario: Icon-only bet actions remain accessible and usable
  Given an open bet is displayed
  Then Won, Lost, and Cancelled remain identifiable by their accessible names
  And the Add Bet control remains identifiable by its accessible name
  When I settle the bet using one of its outcome actions
  Then the bet displays the selected outcome
```

```gherkin
Scenario: Sequence controls retain their accessible actions
  Given an active sequence is displayed
  Then the add-bet and close-sequence controls remain identifiable by their accessible names
  When I expand or collapse a sequence
  Then its details open or close as requested
```

## Edge cases

- Icon-only actions remain discoverable without relying on color or shape alone.
- Repeated Add Bet actions retain the appropriate contextual accessible names.
- Icons render consistently at narrow viewport widths.
- The application remains usable offline.

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

None.

## Out of scope for now

Replacing text buttons or redesigning the wider visual system.
