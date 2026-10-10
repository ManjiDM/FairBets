# Plan: Use a consistent icon set

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Status | Approved |
| Updated | 2026-10-10 |

> How the spec will be built. Written after every `[NEEDS CLARIFICATION]` marker in
> the spec is resolved. If implementation reveals this plan is wrong, update this
> file before continuing.

## Approach

Adopt Lucide React as the app's single icon source and replace the custom action,
sidebar, and risk-alert glyphs with its React icons. Remove obsolete CSS-generated
symbol rules. Keep the existing icon button dimensions, action labels, titles, handlers,
and visual color rules. Import icons directly from the package so unused glyphs are
tree-shaken from the production bundle.

Reject keeping custom inline SVGs alongside a library: that would retain the mixed
visual source the user wants to remove.

## Affected modules

| File | Change | Notes |
| --- | --- | --- |
| `package.json`, `pnpm-lock.yaml` | Add Lucide React | Build-time dependency; icons render locally |
| `src/App.tsx` | Replace custom SVGs and alert glyph with Lucide icons | Preserve names, titles, and actions |
| `src/App.css` | Keep common icon sizing; remove stale CSS symbol icons | No layout or color redesign |
| `e2e/features/bets.feature` | Retain acceptance coverage for icon controls and actions | Existing Gherkin covers main action controls |
| `e2e/steps/fairbets.steps.js` | Adjust only if existing semantic assertions need adaptation | Continue checking accessible names and SVG presence |
| `specs/FB-019-consistent-icon-library/*` | Track specification, implementation plan, and verification tasks | |

## Domain changes

None. This is a presentation-only change.

## Data and migration

- **`LedgerState` shape:** unchanged
- **`localStorage` migration:** not needed
- **Cloud schema:** unchanged
- **Backward compatibility:** existing saved ledgers are unaffected

## UI changes

Use Lucide icons for Add, Won, Lost, Cancelled, Close Sequence, the summary drawer, and
guardrail alerts. Retain each button's semantic accessible name and tooltip; icons are
decorative. Keep the current action dimensions and color treatment, with no stake or
sequence calculations added to the UI.

## Test strategy

- Run the existing icon-only and sequence-disclosure scenarios in `e2e/features/bets.feature`.
- Verify guardrail warning icon rendering in the existing guardrail scenario.
- Verify icon-only controls remain accessible by their existing names and retain their
  SVG rendering via the existing Playwright assertions.
- Visually inspect the changed action, drawer, and disclosure icons, including a narrow
  viewport, because stylistic consistency is visual.
- Run `pnpm lint`, `pnpm build`, and `pnpm test:e2e`.

## Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| An icon's new shape is interpreted differently | User uncertainty or accidental action | Keep accessible names and tooltips; use conventional Lucide glyphs |
| A library component changes icon dimensions or stroke | Controls appear inconsistent | Apply the existing shared icon sizing and inspect compact and mobile layouts |
| Dependency adds runtime network requirements | App becomes unavailable offline | Bundle package icons into the local app; no external icon URL or font |

## Constitution check

- I-II: Icons are locally bundled and need no network; tracker behavior is unchanged.
- III-VII: No domain, sequence, risk, or persisted data changes.
- VIII: No secrets or credentials are introduced.
- IX-X: Existing Gherkin covers icon behavior; run the behavior suite and all required
  gates.

## Rollback

Revert the UI, stylesheet, and dependency changes. No persisted data or migration is
involved.
