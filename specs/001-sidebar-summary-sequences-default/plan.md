# Plan: Persistent summary sidebar with Sequences as the default view

| Field | Value |
| --- | --- |
| Spec | [`spec.md`](./spec.md) |
| Status | Approved |
| Updated | 2026-09-23 |

## Approach

This is a **presentation-only restructure of `src/App.tsx` and `src/App.css`**. No file
under `src/domain/` is touched, and no value rendered by the app changes.

Today the app is a three-tab switch driven by `activeTab: Tab`, where each tab renders a
mutually exclusive page. The change collapses that switch:

- **Sequences becomes the only page.** It is no longer conditional — it renders
  unconditionally as the app's single working surface.
- **The Overview page is deleted.** Its twelve elements are redistributed per the spec's
  rehoming table: four to a new sidebar, four folded into the Sequences header, one to a
  new banner, one to the Sequences empty state, one dropped.
- **Settings stops being a page and becomes an overlay** rendered above Sequences,
  following the pattern the app already uses for the Add-bet modal.
- **`Tab` and `activeTab` disappear entirely**, replaced by a single
  `settingsOpen: boolean`. Both nav bars are removed.

The layout becomes a two-column workspace at desktop widths — sequence list on the left,
summary sidebar on the right — collapsing below the existing 860px breakpoint to a single
column with the sidebar reachable as a drawer.

**Alternative rejected:** keeping `activeTab` and adding `"sidebar"` as a fourth pseudo-tab,
or keeping a two-item nav. Rejected because the clarified spec calls for no tabbed
navigation at all, and retaining the switch would leave dead `"overview"` branches that
invite drift. Removing the union type forces the compiler to surface every call site.

**Second alternative rejected:** extracting the sidebar and Settings overlay into new
files under `src/components/`. Tempting, but `App.tsx` currently holds all presentational
components inline and there is no `src/components/` directory. Introducing one is a
structural change outside this spec's scope, and would obscure the diff. Components stay
inline; extraction can be its own change later.

## Affected modules

| File | Change | Notes |
| --- | --- | --- |
| `src/App.tsx` | Substantial restructure | Remove `Tab`/`activeTab`, delete the Overview page, add sidebar + drawer + guardrail banner, convert Settings to an overlay |
| `src/App.css` | New layout and components | Workspace grid, sidebar, drawer, banner; remove nav styles |
| `e2e/features/fairbets.feature` | Update expectations | No Home landing; assert Sequences on load |
| `e2e/features/bets.feature` | Update expectations | Drop the "Overview" navigation step; balance now updates in place |
| `e2e/features/workbook-import.feature` | Check and update | Import currently lands on Home |
| `e2e/steps/fairbets.steps.js` | Update and add steps | Remove the "Overview" click; add settings-overlay, drawer, and banner steps |
| `features/app-shell.feature` | New file | Product-level description of the new shell |
| `README.md` | Update description | Any text describing a Home/Overview screen |

`src/domain/ledger.ts`, `src/domain/workbookImport.ts`, `src/lib/cloudStore.ts`,
`src/lib/supabase.ts`, and `supabase/schema.sql` are **not** touched.

## Domain changes

**None.** No export in `src/domain/` is added, removed, or modified.

The UI continues to read `calculation` — `availableBalance`, `settledProfit`, `winRate`,
`sequences`, `activeSequence`, `largestStake`, `goal`, `riskFlags`, `nextSuggestion`,
`nextOddsGuide` — exactly as it does now. Only the JSX location of each read changes.

This is the load-bearing constraint for verification: if any figure differs before and
after, the change is wrong.

## Data and migration

- **`LedgerState` shape:** unchanged.
- **`localStorage` migration:** not needed. Nothing about persistence changes.
- **Cloud schema:** unchanged.
- **New persisted UI state:** none, deliberately.
  - Sidebar visibility on desktop is not state — it is always rendered.
  - `drawerOpen` is component state, initialised closed on every load.
  - `dismissedRiskKey` is component state and resets on reload (FR-5a).
  - `settingsOpen` is component state, initialised closed.
- **Backward compatibility:** a ledger saved before this change loads identically. There
  is no version gate and no upgrade path required.

## UI changes

### State replacing `activeTab`

```ts
const [settingsOpen, setSettingsOpen] = useState(false);
const [drawerOpen, setDrawerOpen] = useState(false);
const [dismissedRiskKey, setDismissedRiskKey] = useState<string | null>(null);
```

`type Tab` (line 32) and `activeTab` (line 765) are deleted.

### Header

- Brand button (line 1353) opens the Settings overlay, per the clarification, with
  `aria-label="Open settings"` so the target is explicit to assistive technology.
- An explicit **Settings** button is added alongside it. The brand alone is not a
  discoverable settings affordance, and FR-8 requires Settings to be reachable.
- A **Summary** button is added, visible only below the mobile breakpoint, which opens
  the drawer.
- The desktop nav (1363–1374) and mobile nav (1943–1954) are removed outright.

### Workspace layout

`.main-content` gains a `.workspace` child laid out as a two-column grid: the sequence
page and an `<aside className="summary-sidebar">`. Below 860px the grid collapses to one
column and the aside is removed from flow, re-presented as a drawer.

### Sidebar contents

Four items, in this fixed order, reusing the existing `MetricCard` component and the
existing goal panel markup so values and formatting are untouched:

1. Available balance — value + open-exposure hint
2. Settled P&L — value + win/loss counts
3. Goal tracking — settled result, goal value, progress bar, percentage
4. Largest stake — value + safety-limit hint

### Guardrail banner

Rendered at the top of the Sequences page, above the section title:

```ts
const riskKey = calculation.riskFlags.join("|");
const showRiskBanner =
  calculation.riskFlags.length > 0 && dismissedRiskKey !== riskKey;
```

Keying dismissal on the joined flag list gives FR-5a for free: if the set of flags
changes, `riskKey` changes, the stored key no longer matches, and the banner returns.
Because the key lives in component state, a reload also restores it.

The banner carries the existing flag text, a link that opens Settings, and a Dismiss
control. The "Within your limits" reassurance branch (line 1501) is **not** carried over —
the banner renders nothing when there are no flags.

It sits outside the drawer, so a breach is never hidden behind a control (FR-6, FR-5).

### Sequences header

The existing `SectionTitle` is extended with the rehomed hero content: ledger name,
the "suggestions are based on your settings, not predictions" copy (kept verbatim —
constitution I), the meta line (sequence count, win rate, active-sequence status), and
the next-stake figure reduced to an inline amount plus odds. The full stake breakdown
card is not carried over; the Add-bet form retains its own live suggestion.

### Settings overlay

The Settings block (1664+) moves inside a dialog wrapper with `role="dialog"`,
`aria-modal="true"`, an accessible name, and an explicit Close control, mirroring the
existing Add-bet modal. Its contents are unchanged.

### Redirect call sites

| Line | Current | Becomes |
| --- | --- | --- |
| 1171 | `setActiveTab("history")` | Removed — Sequences is always shown |
| 1262 | `setActiveTab("overview")` after import | `setSettingsOpen(false)` |
| 1333 | `setActiveTab("overview")` after restore | `setSettingsOpen(false)` |
| 1344 | `setActiveTab("overview")` after reset | `setSettingsOpen(false)` |
| 1515 | `setActiveTab("settings")` from risk panel | `setSettingsOpen(true)` from banner |
| 1526 | `setActiveTab("history")` from empty state | Removed with the Overview page |

Closing the overlay satisfies FR-7: the user is returned to Sequences, which is the only
page.

### Domain separation

Every figure is read from the `calculation` object. No arithmetic is introduced in the
UI. `riskKey` is a string join for dismissal identity, not a calculation.

## Test strategy

### Product scenarios (`features/`)

Add `features/app-shell.feature` describing the app shell: Sequences as the landing view,
the persistent summary, the exception-only guardrail banner, and Settings as an overlay.
The existing `settings-and-risk.feature` is reviewed for statements that assume a Home
page.

### Executable scenarios (`e2e/features/`)

| Feature | Change |
| --- | --- |
| `fairbets.feature` | Assert the Sequences view on load instead of a "Current ledger" Home section; the ledger name assertion stays, since the name moves to the Sequences header |
| `bets.feature` | Delete the "Overview" navigation step after settlement; assert the balance updates in place. **`€38.07` and `€39.07` must remain unchanged** |
| `workbook-import.feature` | Assert the post-import landing is Sequences |
| New scenarios | Settings overlay opens and closes; guardrail banner appears only on breach and can be dismissed; mobile drawer opens and closes |

### Steps (`e2e/steps/`)

- Remove the step that clicks "Overview".
- Add steps for opening/closing the Settings overlay, opening/dismissing the drawer, and
  asserting banner presence and absence.
- Keep the existing balance-reading step working against its new location.

### Manual checks

- Visual layout at desktop, 860px, and 680px. Not automated — the E2E suite asserts
  reachability, not appearance.
- Side-by-side comparison of every figure before and after on a real ledger. This is the
  FR-4 check and is the one that actually matters.

## Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| A figure silently changes while moving JSX | Breaks FR-4 and user trust in the numbers | Move markup verbatim; never retype a value expression. Compare figures before/after on the same ledger |
| Guardrail warnings lost in the restructure | Violates constitution VI — the top risk of deleting Home | Banner implemented and tested **before** the Overview page is deleted; dedicated E2E scenarios for breach and no-breach |
| Dismissal becomes a permanent mute | User stops seeing real warnings | Dismissal keyed on the flag set and held in component state only; never persisted |
| Mobile left with no navigation | App unusable on a phone | Settings is an overlay reachable from the header at every width; drawer verified below the breakpoint |
| E2E churn masks a real regression | A genuine break gets "fixed" by editing an expectation | Baseline is green now (6/6). Every expectation change is justified in the spec's test-impact section. Balance figures are treated as immutable |
| `App.tsx` restructure is large and hard to review | Bugs slip through | Land in ordered commits: banner → sidebar → Settings overlay → remove Overview → remove nav → tests |

## Constitution check

- **I. Private tracker** — the "suggestions are based on your settings, not predictions"
  copy is preserved verbatim rather than dropped with the hero.
- **II. Local-first** — no network behaviour touched.
- **III. Deterministic domain logic** — `src/domain/` is not modified at all.
- **IV. UI and domain separated** — the sidebar renders values from `calculation`; no math
  moves into the UI.
- **V. Sequence model preserved** — untouched.
- **VI. Risk limits enforced** — the single real tension in this change. Mitigated by
  building the banner first, keeping it outside the drawer, and making dismissal
  transient and self-resurfacing.
- **VII. Data compatibility** — no shape change, no migration, no new persisted state.
- **VIII. No secrets** — none involved.
- **IX. Gherkin** — scenarios in the spec; E2E updated in the same change.
- **X. Gates** — `pnpm lint`, `pnpm build`, `pnpm test:e2e` at verification.

## Rollback

Straightforward: no data is migrated and no persisted shape changes, so reverting the
commits restores the previous behaviour completely. A ledger written after this change is
byte-identical in structure to one written before it, so a revert cannot strand data.

If only part is wrong, the commit ordering allows partial revert — the guardrail banner,
the sidebar, and the Settings overlay each land separately and ahead of the Overview
deletion.
