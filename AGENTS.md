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
| `e2e/features/`, `e2e/steps/`, `e2e/support/` | Cucumber + Playwright behaviour suite |

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

1. **Reserve an ID** — inspect `specs/FB-*` and choose one greater than the highest
   sequential FairBets ID. Use it in the spec directory and metadata; never substitute a
   GitHub issue number.
2. **Specify and commit first** — write `specs/FB-NNN-feature-slug/spec.md` from
   `specs/templates/spec-template.md`. Describe the *what* and *why* only. Commit the
   draft as `spec(FB-NNN): define <feature-slug>` before clarification, planning, or code;
   keep the slug within the commit hook's 50-character subject limit. If the commit is
   blocked, stop and report the blocker.
3. **Clarify** — resolve every `[NEEDS CLARIFICATION]` marker before planning.
4. **Plan** — write `plan.md` from `specs/templates/plan-template.md`. Technical
   approach, affected modules, data shape changes, risks.
5. **Tasks** — write `tasks.md` from `specs/templates/tasks-template.md`. Small,
   ordered, individually verifiable steps.
6. **Implement** — execute tasks in order, ticking them off as they land. Use the same
   `FB-NNN` ID in every follow-up commit for this change.
7. **Verify** — lint, build, E2E, plus each acceptance scenario in the spec.

Slash-style prompts for each stage are in `.github/prompts/`. The reusable skill is in
`.agents/skills/spec-driven-development/`.

Trivial changes (typo fixes, dependency bumps, comment edits) may skip the spec, but
must still pass lint and build.

**Bugfixes follow a shortened track**: reserve the next `FB-NNN` → reproduce and commit
the bugfix spec → establish which side is wrong → failing regression scenario → root
cause → blast radius → minimal fix → verify. Use `specs/templates/bugfix-template.md`
and `.github/prompts/bugfix.prompt.md`. Use the same ID for every follow-up commit. The rule
that matters most: a failing test means the code is wrong *or* the expectation is stale
— prove which before editing either, and never fix a defect without a scenario that
failed first.

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
- Follow the commit message convention: `<type>(<ITEM ID>): <subject>`, one line, no
  body. See
  [`.github/copilot-instructions.md`](./.github/copilot-instructions.md#commit-message-convention)
  for the allowed types and the ITEM ID rules. A `commit-msg` hook rejects messages that
  break the convention.
- Do not push branches or open pull requests unless explicitly asked.

## Definition of done

- [ ] For non-trivial feature/behaviour changes: `spec.md`, `plan.md`, and `tasks.md`
      exist and are current. Bugfixes use `bugfix-template.md` and its regression evidence;
      add `plan.md` and `tasks.md` only if the fix grows into a feature.
- [ ] Every task in `tasks.md` is checked or explicitly deferred with a reason
- [ ] `pnpm lint` passes
- [ ] `pnpm build` passes
- [ ] `pnpm test:e2e` passes when UI behaviour changed
- [ ] Acceptance scenarios in `spec.md` are demonstrably satisfied
- [ ] `README.md` and affected docs updated
