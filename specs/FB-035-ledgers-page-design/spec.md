# Spec: Ledgers page follows the Sequences page design

| Field | Value |
| --- | --- |
| ID | `FB-035-ledgers-page-design` |
| Status | Shipped |
| Created | 2026-10-11 |
| Related | Reworks FB-032 and FB-034; no business rule changes |

## Problem

The Ledgers page puts its sections in white panels and the ledger cards inside one more
white panel, so it looks unlike the Sequences page and the cards end up narrow.

## Goal

The Ledgers page uses the same look as the Sequences page: a dark background with light
text, summary pills for the figures, and green ledger cards placed directly on the dark
background at full width.

## Non-goals

- Any change to funds, investment, close, start or history rules.
- Any change to stored data or the cloud payload.

## Functional requirements

- **FR-1** The top of the Ledgers page MUST be a header like the Sequences header: light
  eyebrow and title on the dark background, and the funds (Total invested, Realised
  result, Available funds) shown as rounded outline pills with the value in bold, like the
  win-rate and next-bet pills.
- **FR-2** The investment form, active ledger controls, start form and history MUST sit
  directly on the dark background with light headings, labels and text. Input fields stay
  light so typed values stay readable. There MUST be no white panel around any section.
- **FR-3** The ledger cards MUST sit directly on the dark background at the full width of
  the page, with no enclosing panel, and keep the green surface and dark text.
- **FR-4** The **Add the first bet** button MUST be disabled while no ledger is active,
  like the Add bet button already is.
- **FR-5** All text MUST keep at least 4.5:1 contrast with what is behind it.

## Business rules

None. Presentation, plus the disabled state of one button.

## Acceptance scenarios

```gherkin
Scenario: Funds are shown as pills on the dark background
  When I open the Ledgers tab
  Then the funds should be shown as pills
  And the Ledgers page sections should have no white panel

Scenario: Ledger cards use the full page width
  Given a ledger has been closed
  When I open the Ledgers tab
  Then the ledger cards should be as wide as the page content

Scenario: The first bet button is disabled with no active ledger
  Given the active ledger has been closed
  Then the "Add the first bet" button should be disabled
```

## Edge cases

- No ledger is active: the empty Sequences state shows the disabled button.

## Data impact

None.

## Constitution check

- [x] No domain, persistence or cloud change

## Open questions

None.

## Out of scope for now

Further restyling of the settings drawer.
