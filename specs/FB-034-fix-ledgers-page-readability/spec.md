# Bugfix: Ledgers page text is unreadable on the dark background

| Field | Value |
| --- | --- |
| ID | `FB-034-fix-ledgers-page-readability` |
| Status | Verified |
| Severity | Cosmetic |
| Created | 2026-10-11 |
| Related | FB-032 (Ledgers tab) |

## Observed behaviour

On the Ledgers tab the page title ("Ledgers and funds"), the section headings ("Add
investment", "Active ledger", "Ledgers", "History"), field labels and hints are drawn in
the dark ink colour directly on the dark app background, so they are almost invisible.
Only the white funds tiles and ledger cards are readable. Ledger card headers also pack
the title, net result, profit percentage and chevron into one row, wrapping badly on a
phone.

## Expected behaviour

The Ledgers page follows the Sequences page design: a light title on the dark background
and each section in a light panel with dark text, like the sequence cards. Every piece of
text is readable (WCAG AA contrast, 4.5:1). A ledger card header shows the ledger number
and name on the first line and net result and profit percentage as clearly separated
values beneath or beside it, with the chevron aligned right.

## Reproduction

```text
Open the app, switch to the Ledgers tab.
Observed: headings and labels have near-zero contrast against the background.
Expected: all headings and labels have at least 4.5:1 contrast with what is behind them.
```

## Root cause

FB-032 moved the former modal content, which relied on a white modal surface, into an
inline page without giving its sections a surface; `h2`, `h3`, labels and hints inherit
dark ink colours that only suit light surfaces.

- **Introduced by:** FB-032
- **Why tests missed it:** scenarios assert text content, never its contrast.

## Blast radius

Presentation only. No stored data, cloud payload, or money figure is affected: none.

## Regression scenario

```gherkin
Scenario: Ledgers page text is readable
  When I open the Ledgers tab
  Then the Ledgers page headings and labels should have readable contrast
```

Where it lands:

- [x] `e2e/features/ledgers.feature`

## Fix

Give each Ledgers section a light panel, a light page title, and a two-row ledger card
header. CSS and markup only.

## Constitution check

- [x] III to VII: no domain, persistence or cloud change
