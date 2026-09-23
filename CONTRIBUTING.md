# Contributing to FairBets

FairBets follows **spec-driven development**. The specification is the primary artifact;
code is derived from it. This applies to humans and to AI agents equally.

If you are an AI agent, start with [`AGENTS.md`](./AGENTS.md).

## Setup

```bash
pnpm install --frozen-lockfile
pnpm exec playwright install chromium   # once, before the first E2E run
pnpm dev
```

Cloud sync is optional: copy `.env.example` to `.env.local` and fill in
`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Never add a service-role key.

## The workflow

1. **Specify** — `specs/<NNN-slug>/spec.md` from `specs/templates/spec-template.md`.
   What and why, no implementation detail.
2. **Clarify** — resolve every `[NEEDS CLARIFICATION]` marker before planning.
3. **Plan** — `plan.md`. Approach, affected modules, data impact, risks.
4. **Tasks** — `tasks.md`. Small, ordered, individually verifiable.
5. **Implement** — work the tasks in order, ticking them off.
6. **Verify** — gates plus every acceptance scenario.

Full detail: [`specs/README.md`](./specs/README.md). Non-negotiables:
[`specs/constitution.md`](./specs/constitution.md).

Trivial changes — typos, dependency bumps, formatting, comments — may skip the spec.
The gates still apply.

## Gates

```bash
pnpm lint
pnpm build
pnpm test:e2e      # when UI behaviour changed
```

All three run in CI on every pull request. A failing gate blocks the change; it is not a
follow-up task.

## Code boundaries

- Stake and sequence math lives in `src/domain/` as pure, deterministic functions.
  `src/App.tsx` renders and persists — it never calculates.
- `LedgerState` stays `{ ledgerName, settings, bets }`.
- Open bets are exposure, never silently settled losses.
- `maxStake` and `maxOpenExposure` are hard ceilings.
- Persisted data is a contract. Migrate `localStorage` shapes forward; land cloud
  changes as `supabase/schema.sql` + a new `supabase/migrations/` file + updated parsers
  in `src/lib/cloudStore.ts`, together.

## Behaviour scenarios

- `features/` — product-level Gherkin, not executed.
- `e2e/features/` — executable Gherkin, run by Cucumber with Playwright steps in
  `e2e/steps/`.

Cucumber is the only E2E runner; do not add a separate Playwright Test suite.

## Commits and pull requests

- One-line commit messages. No commit body.
- Commit iteratively as tasks land.
- Fill in the pull request template, including the spec link and the gate results.

## Security

- Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are browser-safe.
- Never commit secrets, tokens, or personal ledger exports.
- Row-level security is mandatory on every cloud table.

## Scope

FairBets is a private tracker. It does not place bets and does not predict outcomes.
Proposals that change this are out of scope.
