# AGENTS.md

Entry point for any AI coding agent working in this repository. It is intentionally
tool-agnostic: GitHub Copilot, Claude Code, Cursor, Codex, and similar agents should all
start here.

## What this project is

FairBets is a mobile-first, **local-first** betting ledger built with Vite + React +
TypeScript. A sequence starts at the configured base stake, continues through losses or
open outcomes, and closes on the next win; the following sequence resets to the base
stake.

The app is a **private tracker**. It never places bets and never claims to predict
outcomes. Do not add features that contradict this.

## Repository map

| Path | Responsibility |
| --- | --- |
| `src/App.tsx` | UI/state container, `localStorage` persistence, legacy migration, cloud sync flows |
| `src/domain/ledger.ts` | Source of truth for `Bet`, `StrategySettings`, `calculateLedger`, `suggestStakeForOdds` |
| `src/domain/workbookImport.ts` | `.xlsx` → `LedgerState` conversion |
| `src/lib/cloudStore.ts`, `src/lib/supabase.ts` | Optional Supabase auth, backup, restore |
| `supabase/schema.sql`, `supabase/migrations/` | Authoritative cloud schema (RLS protected) |
| `specs/` | Spec-driven development artifacts (constitution, specs, plans, tasks) |
| `features/` | Product-level Gherkin behaviour specs (not executed) |
| `e2e/features/`, `e2e/steps/`, `e2e/support/` | Executable Cucumber + Playwright suite |

## Commands

```bash
pnpm install --frozen-lockfile
pnpm dev          # Vite dev server
pnpm build        # tsc -b + production bundle (type check gate)
pnpm lint         # oxlint
pnpm test:e2e     # Cucumber suite, starts Vite automatically
pnpm test:e2e:headed
pnpm exec playwright install chromium   # once, before the first E2E run
```

Run `pnpm lint` and `pnpm build` before declaring any code change complete. Run
`pnpm test:e2e` when behaviour visible in the UI changes.

## Spec-driven development workflow

**Every non-trivial change starts with a spec, not with code.** The full workflow,
templates, and definitions of done live in [`specs/README.md`](./specs/README.md) and the
non-negotiable rules live in [`specs/constitution.md`](./specs/constitution.md).

Short version:

1. **Specify** — write `specs/<NNN-slug>/spec.md` from `specs/templates/spec-template.md`.
   Describe the *what* and *why* only. No file names, no APIs, no code.
2. **Clarify** — resolve every `[NEEDS CLARIFICATION]` marker before planning.
3. **Plan** — write `plan.md` from `specs/templates/plan-template.md`. Technical
   approach, affected modules, data shape changes, risks.
4. **Tasks** — write `tasks.md` from `specs/templates/tasks-template.md`. Small,
   ordered, individually verifiable steps.
5. **Implement** — execute tasks in order, ticking them off as they land.
6. **Verify** — lint, build, E2E, plus each acceptance scenario in the spec.

Slash-style prompts for each stage are in `.github/prompts/`. The reusable skill is in
`.agents/skills/spec-driven-development/`.

Trivial changes (typo fixes, dependency bumps, comment edits) may skip the spec, but
must still pass lint and build.

## Hard rules

- **Financial logic belongs in `src/domain/`.** Never add stake or sequence math to
  `src/App.tsx`.
- Keep `LedgerState` shaped as `{ ledgerName, settings, bets }`.
- Open bets are **exposure**, never silently settled losses.
- Respect `StrategySettings` (`baseStake`, `goalRate`, `threshold`, `recoveryWeight`,
  `stakeRounding`, `maxStake`, `maxOpenExposure`, `currency`) and the existing rounding
  and validation rules. Do not invent new ones.
- Never commit secrets. Never put a Supabase **service-role** key in `.env.local`, in
  browser code, or in any committed file. Only `VITE_SUPABASE_URL` and
  `VITE_SUPABASE_ANON_KEY` are browser-safe.
- Changing the cloud data shape means updating `supabase/schema.sql`, a new file in
  `supabase/migrations/`, and the parsers in `src/lib/cloudStore.ts` together.
- Keep backward-compatible `localStorage` migration code in the UI layer.
- Do not push branches or open pull requests unless explicitly asked.

## Definition of done

- [ ] `spec.md`, `plan.md`, and `tasks.md` exist and are current (non-trivial changes)
- [ ] Every task in `tasks.md` is checked or explicitly deferred with a reason
- [ ] `pnpm lint` passes
- [ ] `pnpm build` passes
- [ ] `pnpm test:e2e` passes when UI behaviour changed
- [ ] Acceptance scenarios in `spec.md` are demonstrably satisfied
- [ ] `README.md` and affected docs updated
