# Copilot instructions for FairBets

## Start here

- [`AGENTS.md`](../AGENTS.md) is the tool-agnostic entry point for any AI agent.
- [`specs/README.md`](../specs/README.md) describes the spec-driven development workflow.
- [`specs/constitution.md`](../specs/constitution.md) holds the non-negotiable principles.
- Path-scoped rules live in [`.github/instructions/`](./instructions/); stage prompts live
  in [`.github/prompts/`](./prompts/).

## Spec-driven development

Every non-trivial change starts with a spec, not with code:

1. **Reserve an ID** — inspect `specs/FB-*` and allocate one greater than the highest
   existing sequential FairBets ID (`FB-001`, `FB-002`, ...). Use it in the permanent
   `specs/FB-NNN-feature-slug/` directory name and throughout the change. Do not use a
   GitHub issue number as the sequence or reuse an ID.
2. **Specify and commit first** — create `spec.md` from
   `specs/templates/spec-template.md`, including unresolved questions as
   `[NEEDS CLARIFICATION: ...]`, then commit the draft before clarification, planning, or
   implementation. Use `spec(FB-NNN): define <feature-slug>`; keep the slug concise
   enough to fit the commit hook's 50-character subject limit. Keep this commit limited
   to the new spec artifacts. If the commit is blocked by a hook or Git configuration,
   stop and report the blocker rather than continuing without it.
3. **Clarify** — resolve every marker before planning. Never guess on money rules, data
   shapes, or risk limits.
4. **Plan** — `plan.md`. Approach, affected modules, data and migration impact, risks.
5. **Tasks** — `tasks.md`. Small, ordered, individually verifiable steps.
6. **Implement** — work the tasks in order, ticking them off as they land.
7. **Verify** — `pnpm lint`, `pnpm build`, `pnpm test:e2e`, plus each acceptance scenario.

Bugfixes use a shortened track with `specs/templates/bugfix-template.md`: reproduce,
establish whether the code or the expectation is wrong, write a regression scenario that
fails before the fix, name the root cause, check the blast radius on persisted ledgers,
then fix minimally.

Trivial changes (typos, dependency bumps, formatting) may skip the spec but still need
green gates. Do not push or open pull requests unless explicitly asked.

## Commit message convention

Every commit message is a single line with no body and no co-authored section:

```
<type>(<ITEM ID>): <subject>
```

Rules for the `<subject>`:

- **50 characters maximum.**
- **Imperative mood** — `add sidebar`, not `added sidebar` or `adds sidebar`.
- Lower case, no trailing punctuation.
- A concise summary of the change.

### ITEM ID

The FairBets work item. A spec reserves its own sequential `FB-NNN` ID, which is used
for its folder, spec metadata, and every commit in that change from the initial spec
commit through implementation. Related GitHub issue numbers go in the spec's `Related`
field; they do not replace the spec ID.

- Use the reserved spec ID for all spec, feature, fix, test, and documentation commits.
- When no ID applies, use `no-id` — `docs(no-id): clarify setup steps`.

### Types

| Type | Use |
| --- | --- |
| `feat` | New or changed user-facing behaviour |
| `fix` | Bugfix |
| `spec` | Artifacts under `specs/` — spec, clarify, plan, or tasks |
| `docs` | README, `AGENTS.md`, `CONTRIBUTING.md`, instructions, prompts |
| `test` | Gherkin features, step definitions, fixtures |
| `refactor` | Behaviour-preserving restructure |
| `style` | Formatting only, no logic change |
| `perf` | Performance only |
| `build` | Vite, TypeScript config, dependencies |
| `ci` | Workflows under `.github/workflows/` |
| `chore` | Housekeeping that fits no other type |
| `revert` | Reverts a previous commit |

Examples:

```
feat(FB-432): show summary in a sidebar
spec(FB-003): define import-preview
feat(FB-003): add import-preview
fix(FB-517): correct available balance
test(FB-432): cover guardrail banner
docs(no-id): clarify setup steps
```

### Enforcement

The initial commit for every feature or bugfix is the draft spec commit, made before
clarification, planning, or implementation. Continue to use that same `FB-NNN` ID for
every later commit in the work item.

A `commit-msg` hook in `.githooks/` runs `scripts/check-commit-msg.mjs` and rejects any
message that breaks these rules. `pnpm install` points Git at that directory through the
`prepare` script; run `git config core.hooksPath .githooks` by hand if hooks are not
firing. Merge, revert, `fixup!`, and `squash!` messages are exempt. Check a message
without committing with `pnpm lint:commit <file>`.

## Repository overview

This repo is a Vite + React + TypeScript app for a mobile-first, local-first betting ledger. The product model is a FairBets tracker: a sequence starts at a base stake, continues through losses or open outcomes, and closes on the next win; the next sequence resets from the configured base stake.

The most important implementation boundary is between the UI layer and the deterministic finance logic:

- `src/App.tsx` is the main UI/state container. It owns browser persistence (`localStorage`), migration from legacy saved data, and optional cloud sync flows. The app shell is sequences-first: there is no home or overview page and no tabbed navigation. Ledger totals live in a summary sidebar (a drawer below 860px), settings render as a modal overlay above the sequences, and guardrail breaches surface as a dismissible banner at the top of the sequences view.
- `src/domain/ledger.ts` is the source of truth for the ledger model and all sequence/stake calculations. Financial rules live here (`Bet`, `StrategySettings`, `calculateLedger`, `suggestStakeForOdds`). If a change affects stake math or sequence behavior, start here.
- `src/domain/workbookImport.ts` converts `.xlsx` imports into the app’s `LedgerState` shape. It expects workbook layouts with `DATETIME`, `ODD`/`ODDS`, and specific related columns.
- `src/lib/cloudStore.ts` and `src/lib/supabase.ts` handle optional Supabase auth and backup/restore flows. `supabase/schema.sql` defines the RLS-protected cloud schema.

## Build, lint, and validation

Use the existing package scripts from the repo root:

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm build
pnpm lint
pnpm test:e2e
```

Notes:

- `pnpm dev` runs the Vite dev server for local development.
- `pnpm build` runs TypeScript build checks plus the production bundle build.
- `pnpm lint` uses `oxlint` (`package.json` defines the project lint command).
- `pnpm test:e2e` runs the Cucumber feature suite in `e2e/features/`, using Playwright in step definitions under `e2e/steps/`; the runner starts Vite automatically.
- `pnpm test:e2e:headed` runs the Cucumber scenarios with a visible browser.
- `pnpm test:e2e:headed` runs the same Cucumber/Playwright suite with a visible browser and `PWDEBUG=1`.
- Feature files live in `e2e/features/`, Playwright-backed step definitions in `e2e/steps/`, and browser lifecycle support in `e2e/support/`.
- There is no separate Playwright Test suite; Cucumber is the single E2E runner and Playwright is its browser automation layer.
- Workbook import scenarios live in `e2e/features/workbook-import.feature`; their `.xlsx` fixtures are generated by the Cucumber step definitions rather than committed as binary files.

## Local setup and runtime expectations

- Run locally with the README instructions: install dependencies, then launch Vite and open the local URL.
- Cloud sync is optional and depends on `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local` (copied from `.env.example`).
- Do not add a Supabase service-role key to browser-side config or `.env.local`.
- The app stores its primary ledger in browser local storage; cloud storage is for backup/restore and sync once a user is authenticated.

## Domain and data conventions

- Keep the app centered on `LedgerState`: `{ ledgerName, settings, bets }`.
- Use `Bet` objects consistently with fields like `id`, `placedAt`, `label`, `odds`, `outcome`, a required `strategy`, and optional `stakeOverride`.
- Preserve the FairBets sequence model: open bets are exposure, not silently treated as settled losses; the next win closes the active sequence and starts a new one from the base stake.
- Strategy values are pinned per bet. `BetStrategy` (`baseStake`, `threshold`, `recoveryWeight`, `stakeRounding`, `maxStake`) is stamped onto a bet when it is placed, imported, or restored, and `calculateLedger` prices each bet from `bet.strategy` rather than live settings. Changing those settings must never re-price existing bets. Guardrail warnings (over-stake, open exposure) intentionally stay on live settings. Every construction site must go through `pickStrategy`/`stampBets`.
- When editing money logic, stay aligned with `StrategySettings` (`baseStake`, `goalRate`, `threshold`, `recoveryWeight`, `stakeRounding`, `maxStake`, `maxOpenExposure`, `currency`) and use the existing rounding/validation rules instead of introducing new assumptions.
- The workbook importer intentionally expects the betting sheet layout described in the README and in `src/domain/workbookImport.ts`; changing it requires preserving compatibility with the expected `DATETIME` and `ODD`/`ODDS` fields and the legacy import logic.
- Cloud data validation is strict in `src/lib/cloudStore.ts`; if the schema changes, update both the Supabase SQL schema and the Cloud row parsers together.

## Conventions specific to this codebase

- Prefer editing domain logic in `src/domain/*.ts` over adding one-off calculations in `App.tsx`.
- Keep migration/backward-compatibility code in the UI layer when dealing with persisted local storage structures (the app explicitly handles legacy data migration from older storage keys).
- Prefer small, deterministic functions for sequence math and import parsing; this app revolves around auditability of stake calculations and ledger state.
- Treat the app as a private tracker rather than a prediction engine or automated betting tool.

## Existing repo-specific guidance to retain

- [`AGENTS.md`](../AGENTS.md) is the shared entry point for all AI agents; keep it in sync
  with this file.
- README is the operational source for local setup and cloud sync steps.
- `supabase/schema.sql` is the authoritative schema for the optional cloud backup feature.
- There is no convention of separate backend/API folders; the repo is a front-end domain model with optional Supabase persistence.
- Playwright tests block service workers because the app service worker navigates clients during activation, which can interfere with deterministic browser assertions.
