---
name: spec-driven-development
description: "Drive FairBets changes through spec, plan, tasks, implementation, and verification. Use whenever a new feature, behaviour change, money-rule change, or data-shape change is requested."
allowed-tools: Bash Read Write Edit Glob Grep
---

# Spec-Driven Development Skill

## Purpose

Turn a feature request into a specification, a plan, an ordered task list, an
implementation, and a verified result — in that order. Code is never the first artifact.

FairBets computes money. Every stake shown must be explainable and reproducible, so the
rule is written down before it is implemented.

---

## When to use this skill

Use it when the user asks to:

- add a feature or change user-visible behaviour
- change stake or sequence calculations
- change `LedgerState`, `localStorage`, the cloud schema, or the workbook import layout
- add a new UI surface

Skip it for typo fixes, dependency bumps, comment edits, and formatting. Lint and build
gates still apply to those.

---

## Ground rules

Read [`specs/constitution.md`](../../../specs/constitution.md) first, every time. The
principles that most often decide a design:

- Stake and sequence math lives in `src/domain/` as pure deterministic functions. UI
  never calculates.
- `LedgerState` is `{ ledgerName, settings, bets }`.
- Open bets are exposure, never settled losses.
- `maxStake` and `maxOpenExposure` are hard ceilings.
- Persisted data is a contract: migrate forward, never drop.
- Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are browser-safe.

---

## Workflow

### Step 1 — Specify

1. Pick the next number under `specs/` and a kebab-case slug; create `specs/<NNN-slug>/`.
2. Copy `specs/templates/spec-template.md` to `spec.md` and complete every section.
3. Describe behaviour only. Mark unknowns `[NEEDS CLARIFICATION: question]`.
4. Include worked numeric examples for any money rule.

### Step 2 — Clarify

1. Collect all markers, ranked by impact — money, data shape, and risk limits first.
2. Ask the user in focused batches, each with a recommended default.
3. Answer from the codebase anything that is discoverable rather than a real decision.
4. Write answers into the spec and delete the markers. Zero markers before planning.

### Step 3 — Plan

1. Copy `specs/templates/plan-template.md` to `plan.md`.
2. Read the code that will change before writing the approach.
3. Record affected modules, exact new domain signatures, data impact and migrations,
   UI changes, test strategy, risks, the rejected alternative, and rollback.
4. Complete the constitution check with reasoning.

### Step 4 — Tasks

1. Copy `specs/templates/tasks-template.md` to `tasks.md`.
2. Order: domain → persistence/migration → UI → Gherkin → docs → gates.
3. Each task names files, a "done when", and a verification step. Mark `[P]` only for
   disjoint files.
4. Every acceptance scenario maps to at least one task.

### Step 5 — Implement

1. Work tasks in order, ticking each off as it lands.
2. Run each task's verification before moving on.
3. Build only what the spec requires; new ideas go to "Out of scope for now".
4. If the plan proves wrong, update `plan.md` and `tasks.md`, then continue.
5. Commit iteratively with single-line messages and no commit body. Do not push unless
   asked.

### Step 6 — Verify

```bash
pnpm lint
pnpm build
pnpm test:e2e      # when UI behaviour changed
```

Then confirm each acceptance scenario and each `FR-n`, re-run the constitution check
against the code as built, and check an existing saved ledger still loads correctly.

---

## Output format

Always report:

1. Spec path and summary
2. Clarifications asked and answered
3. Plan summary — affected modules, migrations, top risk
4. Task list with completion status
5. Gate results (`lint`, `build`, `test:e2e`)
6. Acceptance scenarios: pass, fail, or not verified with a reason
7. Anything deferred, and why

---

## Philosophy

Always:

- Write the rule before the code
- Ask rather than guess on money, data, and risk
- Keep spec, plan, and tasks describing what was actually built

Never:

- Start coding from an ambiguous request
- Put money math in the UI layer
- Report a scenario as verified without checking it
- Claim done with a failing gate
