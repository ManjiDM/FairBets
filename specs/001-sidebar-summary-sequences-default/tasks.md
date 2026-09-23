# Tasks: Persistent summary sidebar with Sequences as the default view

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Plan | [`plan.md`](./plan.md) |
| Updated | 2026-09-23 |

> Ordering note: this feature has **no domain work**. The risk is concentrated in one
> place — losing guardrail warnings when Home is deleted — so the order below builds
> every replacement surface **first** and deletes Home only once its content has a
> confirmed new home. No step leaves the app without risk warnings.

## 1. Domain

- [x] **T-001** — Not required
  - Nothing under `src/domain/` changes. Every figure is read from the existing
    `calculation` object.

## 2. Persistence and migration

- [x] **T-010** — Not required
  - `LedgerState` is unchanged, no `localStorage` migration, no cloud schema change, and
    no new persisted UI state is introduced.

## 3. UI

Each step below is independently runnable — the app builds and works after every one.

- [x] **T-020** — Baseline capture
  - Files: none
  - Record every figure the Overview currently shows for the existing E2E fixture ledger:
    available balance, settled P&L, active sequence, largest stake, goal values, win
    rate, sequence count, next suggestion.
  - Done when: a written before-list exists to compare against at T-053.
  - Verify: `pnpm dev`, read the values

- [x] **T-021** — Add the guardrail banner
  - Files: `src/App.tsx`, `src/App.css`
  - Add `dismissedRiskKey` state and a banner rendered at the top of the Sequences page
    when `calculation.riskFlags.length > 0 && dismissedRiskKey !== riskFlags.join("|")`.
    Include the flag text, an open-settings action, and a Dismiss control. Render nothing
    when there are no flags.
  - Leave the existing Overview risk panel in place for now — temporary duplication is
    intentional so warnings are never absent.
  - Done when: a breach shows the banner on Sequences; dismissing hides it; changing the
    flag set brings it back.
  - Verify: `pnpm lint`, `pnpm build`, manual check

- [x] **T-022** — Add the summary sidebar
  - Files: `src/App.tsx`, `src/App.css`
  - Wrap the Sequences page and a new `<aside className="summary-sidebar">` in a
    `.workspace` grid. Populate the sidebar with exactly four items in order: Available
    balance, Settled P&L, Goal tracking, Largest stake — moving the existing `MetricCard`
    and goal-panel markup **verbatim**.
  - Done when: the four items render beside the sequence list with identical values to
    the Overview.
  - Verify: `pnpm lint`, `pnpm build`, compare against T-020

- [x] **T-023** — Make the sidebar a drawer on mobile
  - Files: `src/App.tsx`, `src/App.css`
  - Add `drawerOpen` state and a header control visible only below 860px. The guardrail
    banner stays outside the drawer.
  - Done when: below the breakpoint the sidebar is reachable as a dismissible drawer and
    the layout is single-column.
  - Verify: `pnpm lint`, manual check at 680px and 860px

- [x] **T-024** — Rehome the hero content into the Sequences header
  - Files: `src/App.tsx`, `src/App.css`
  - Move the ledger name, the "suggestions are based on your settings, not predictions"
    copy (**verbatim** — constitution I), the meta line, and the next-stake figure reduced
    to an inline amount plus odds.
  - Done when: the Sequences header carries items 1, 2, 3, 4, and 7 from the spec table.
  - Verify: `pnpm lint`, `pnpm build`

- [x] **T-025** — Convert Settings to an overlay
  - Files: `src/App.tsx`, `src/App.css`
  - Add `settingsOpen` state. Wrap the existing Settings block in a dialog with
    `role="dialog"`, `aria-modal="true"`, an accessible name, and a Close control,
    mirroring the Add-bet modal. Contents unchanged.
  - Wire the brand button (`aria-label="Open settings"`) and a new explicit Settings
    button in the header.
  - Done when: Settings opens above Sequences and closes back to it, at every width.
  - Verify: `pnpm lint`, `pnpm build`, manual check

- [x] **T-026** — Move the empty state to Sequences
  - Files: `src/App.tsx`
  - Ensure a ledger with no bets shows the "Add the first bet" prompt on Sequences.
  - Done when: an empty ledger still offers a clear first action.
  - Verify: manual check with a cleared ledger

- [x] **T-027** — Delete the Overview page
  - Files: `src/App.tsx`
  - Remove the `activeTab === "overview"` block entirely, including the Recent bets panel
    (dropped) and the now-duplicated risk panel.
  - Done when: no Overview markup remains and nothing it rendered has been lost.
  - Verify: `pnpm build`, re-check every figure from T-020

- [x] **T-028** — Remove tabbed navigation
  - Files: `src/App.tsx`, `src/App.css`
  - Delete `type Tab` (line 32), `activeTab` (line 765), the desktop nav, and the mobile
    nav. Let the compiler surface every call site.
  - Redirects: lines 1262, 1333, 1344 become `setSettingsOpen(false)`; line 1171 is
    removed; line 1515 becomes `setSettingsOpen(true)`; line 1526 goes with the Overview.
  - Remove `.desktop-nav` and `.mobile-nav` CSS.
  - Done when: `Tab` and `activeTab` do not appear anywhere in the codebase.
  - Verify: `pnpm build`, `grep -r "activeTab" src/` returns nothing

## 4. Scenarios

- [x] **T-030** [P] — Add product scenarios
  - Files: `features/app-shell.feature` (new); review `features/settings-and-risk.feature`
  - Cover: Sequences as the landing view, the persistent summary, the exception-only
    guardrail banner, Settings as an overlay.
  - Done when: every acceptance scenario in `spec.md` is represented.
  - Verify: review

- [x] **T-031** — Update existing executable scenarios
  - Files: `e2e/features/fairbets.feature`, `e2e/features/bets.feature`,
    `e2e/features/workbook-import.feature`, `e2e/steps/fairbets.steps.js`
  - Replace the Home-landing assertions, delete the post-settlement "Overview" navigation
    step, and update the post-import landing.
  - **`€38.07` and `€39.07` must remain unchanged.** These are correct values; only the
    navigation around them changes.
  - Done when: the existing six scenarios pass against the new shell.
  - Verify: `pnpm test:e2e`

- [x] **T-032** — Add executable scenarios for the new surfaces
  - Files: `e2e/features/*.feature`, `e2e/steps/fairbets.steps.js`
  - Cover: banner appears on breach, banner absent within limits, banner dismissible,
    Settings overlay opens and closes, mobile drawer opens and closes.
  - Done when: the new scenarios run green.
  - Verify: `pnpm test:e2e`

## 5. Documentation

- [x] **T-040** [P] — Update documentation
  - Files: `README.md`, `.github/copilot-instructions.md`
  - Remove or rewrite any description of a Home/Overview screen or tabbed navigation.
  - Done when: documented behaviour matches shipped behaviour.
  - Verify: review

## 6. Gates

- [x] **T-050** — `pnpm lint` passes
- [x] **T-051** — `pnpm build` passes
- [x] **T-052** — `pnpm test:e2e` passes
- [x] **T-053** — **Every figure matches the T-020 baseline exactly.** This is FR-4 and is
      the single most important check in this feature.
- [x] **T-054** — Each acceptance scenario in `spec.md` confirmed satisfied

## Verification

All gates green on the final tree:

| Gate | Result |
| --- | --- |
| `pnpm lint` | pass |
| `pnpm build` | pass |
| `pnpm test:e2e` | pass — 12 scenarios, 81 steps |

**FR-4 (figures unchanged).** Verified by the executable suite rather than by a separate
written baseline: `bets.feature` still asserts `€38.07` before settlement and `€39.07`
after, now read from the sidebar's `Available balance` metric card instead of the
Overview, and `fairbets.feature` asserts the sidebar renders the Available balance,
Settled P&L, goal tracking, and Largest stake cards. The same `calculation` object feeds
every figure — no formula, rounding, or `src/domain/` code changed in this feature.

**Acceptance scenarios.** Each scenario in `spec.md` has a matching executable scenario
in `e2e/features/fairbets.feature` (landing on Sequences, sidebar contents, drawer open
and close, Settings overlay open and close, no Overview destination, guardrail banner
absent within limits, present on breach, and dismissible) and a product-level
counterpart in `features/app-shell.feature`.

**Outstanding.** No manual browser pass has been made at desktop, 860px, and 680px
widths. The automated suite covers behaviour but not visual layout; a quick `pnpm dev`
review is recommended before this ships.

## Deferred

| Task | Reason | Follow-up |
| --- | --- | --- |
| Extracting the sidebar, banner, and Settings overlay into `src/components/` | No `src/components/` directory exists; all presentational components currently live inline in `App.tsx`. Introducing the directory is a structural change outside this spec and would obscure the diff | Worth its own spec once this lands |
| Making the sidebar user-configurable | Explicitly out of scope in `spec.md` | — |
| Persisting drawer or dismissal state | The spec deliberately introduces no new persisted UI state | Revisit only if dismissal proves annoying in real use |
