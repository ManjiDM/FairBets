# Spec: Docked bottom navigation bar on mobile

| Field | Value |
| --- | --- |
| ID | `FB-033-mobile-bottom-bar` |
| Status | Clarified |
| Created | 2026-10-11 |
| Related | Builds on the tabs from FB-032 |

## Problem

On mobile the Sequences and Ledgers tabs sit at the top of the scrolling content, so they
scroll away and the user must scroll back up to switch views.

## Goal

On mobile, Sequences and Ledgers are switched from a docked toolbar fixed to the bottom of
the screen (Material Design bottom app bar style). Like the top toolbar it is always
visible, and the content scrolls beneath it without hiding either toolbar.

## Non-goals

- Any change to tab behaviour, ledger rules, data or the desktop layout.
- Hide-on-scroll behaviour; both toolbars stay visible.

## Users and scenarios

**Primary user:** someone using FairBets on a phone. They scroll a long list of sequences
and tap Ledgers at the bottom without scrolling back to the top.

## Functional requirements

- **FR-1** At mobile width (680px and below) the app MUST show a toolbar fixed to the
  bottom of the viewport containing the Sequences and Ledgers tabs, each with an icon and
  a label.
- **FR-2** The bottom toolbar MUST remain visible while the content scrolls, and the
  content MUST be able to scroll fully clear of it (nothing permanently hidden behind it).
- **FR-3** The tab strip at the top of the content MUST NOT show on mobile; the bottom
  toolbar replaces it. On wider screens the top tab strip is unchanged and the bottom
  toolbar is not shown.
- **FR-4** The selected tab MUST be visibly indicated and exposed with `role="tab"` and
  `aria-selected`; behaviour is the same as the existing tabs.
- **FR-5** The bottom toolbar MUST respect the device safe area at the bottom.
- **FR-6** Modals (add bet, settings) keep working; the toolbar MUST NOT cover modal
  actions.

## Business rules

None. Presentation only; no money rule changes.

## Acceptance scenarios

```gherkin
Scenario: Mobile shows a docked bottom toolbar
  Given a mobile viewport
  Then the bottom toolbar shows Sequences and Ledgers
  And the content tab strip is not shown

Scenario: The bottom toolbar stays visible while scrolling
  Given a mobile viewport
  When I scroll the page to the bottom
  Then the bottom toolbar is still fixed at the bottom of the screen
  And the top toolbar is still visible

Scenario: The bottom toolbar switches tabs
  Given a mobile viewport
  When I tap Ledgers in the bottom toolbar
  Then the Ledgers tab is selected

Scenario: Desktop has no bottom toolbar
  Given a desktop viewport
  Then the bottom toolbar is not shown
  And the tabs are shown above the content
```

## Edge cases

- Tall content: the last sequence card can be scrolled above the toolbar.
- Devices with a home indicator: padding uses `env(safe-area-inset-bottom)`.

## Data impact

None.

## Constitution check

- [x] No domain, persistence or cloud change

## Open questions

None. Docked (full-width) style is used rather than the floating variant; icons are
Lucide, consistent with the rest of the app.

## Out of scope for now

Floating toolbar variant and additional destinations.
