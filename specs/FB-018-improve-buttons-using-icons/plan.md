# Plan: Improve buttons using icons

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Status | Done |
| Updated | 2026-10-05 |

> How the spec will be built. Written after every `[NEEDS CLARIFICATION]` marker in
> the spec is resolved. If implementation reveals this plan is wrong, update this
> file before continuing.

## Approach

Use small inline SVGs to represent the specified actions; the project has no icon
library and adding a dependency is unnecessary. Share a small icon component or
equivalent SVG definitions so the same action has consistent geometry. Keep text out
of the visual controls, and place the descriptive action in `aria-label` and `title`.
Keep the existing button variants, click handlers, and enabled-state logic.

Convert the toolbar Add Bet button, Add Bet form submit button, Won/Lost/Cancelled
settlement buttons, Close Sequence button, and add-to-sequence plus glyph to icon-only
controls. Preserve contextual accessible names for sequence continuation buttons.
Remove the View action from compact sequence summaries; rely on their native
`details`/`summary` behavior and verify other buttons inside the summary do not toggle
it as a side effect.

## Affected modules

| File | Change | Notes |
| --- | --- | --- |
| `src/App.tsx` | Render inline action icons with descriptive accessible names and titles; remove View | Preserve action callbacks and status labels |
| `src/App.css` | Style icon-only action buttons at compact sizes and keep focus/hover states visible | Reuse existing button colors and layouts |
| `e2e/features/bets.feature` | Cover icon-only controls, accessible names, and summary expand/collapse behavior | Keep outcome and continuation behavior covered |
| `e2e/steps/fairbets.steps.js` | Add reusable assertions for icon-only controls and summary interaction | Select controls by accessible names |
| `specs/FB-018-improve-buttons-using-icons/*` | Track planned and completed work | |

## UI implementation

- Add small decorative SVG icons for add, won/check, lost/cross, cancelled/ban, and
  close-sequence/archive actions.
- Set `aria-hidden="true"` and `focusable="false"` on decorative SVGs.
- Set `aria-label` and `title` on each icon-only button; retain contextual sequence
  numbers in continuation accessible names.
- Keep outcome colors and focus-visible affordances; do not communicate outcomes by
  color alone.
- Remove the separate View button and any CSS that only supports it, without changing
  the native summary disclosure behavior.

## Test strategy

- Add Gherkin assertions that the named actions expose accessible names, contain
  decorative SVGs, and have no visible text.
- Exercise open-bet outcome actions and verify they still update the status.
- Verify sequence continuation and close actions remain available and labeled.
- Verify a compact sequence opens and closes by clicking its summary and has no View
  button.
- Run `pnpm test:e2e`, `pnpm lint`, and `pnpm build`.

## Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Icon meaning is unclear without visual text | User selects the wrong action | Use conventional distinct shapes, accessible names, and pointer tooltips |
| Removing View leaves cards difficult to expand | Sequence details become inaccessible | Test native summary click and keyboard behavior |
| Nested actions toggle the sequence | Accidental open/close while deleting | Keep event isolation and test Delete action |
| Icon buttons reduce keyboard affordance | Actions are hard to discover/focus | Retain semantic buttons and visible focus styles |

## Constitution check

- I-II: Presentation-only change; no storage or network changes.
- III-VII: Financial and sequence behavior remains unchanged.
- VIII: No secrets or dependencies introduced.
- IX-X: Add interaction-focused E2E coverage and run all project gates.

## Rollback

Restore the existing button labels and View control. The inline SVGs require no data
migration and can be removed without affecting persisted ledgers.
