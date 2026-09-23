# Spec-driven development in FairBets

Specs are the primary artifact. Code is the derivative. Before anything non-trivial is
written, the intended behaviour is written down, reviewed, and turned into an ordered
task list.

## Why here

FairBets computes money. Every stake shown to a user has to be explainable and
reproducible. Writing the rule down before implementing it is what makes it auditable —
and it gives AI agents an unambiguous contract to work against.

## Layout

```text
specs/
  constitution.md              # Non-negotiable project principles
  README.md                    # This file
  templates/
    spec-template.md           # Stage 1 — what and why
    plan-template.md           # Stage 3 — how
    tasks-template.md          # Stage 4 — ordered steps
    bugfix-template.md         # Shortened track for defects
    feature-template.feature   # Gherkin scaffold
  NNN-feature-slug/
    spec.md
    plan.md
    tasks.md
```

`NNN` is a zero-padded, incrementing number: `001-stake-rounding-modes`,
`002-cloud-conflict-resolution`. Bugfixes share the same numbering with a `fix-` slug,
for example `003-fix-open-exposure-double-count`. One directory per change, kept after
it ships so the history of decisions stays readable.

## The workflow

### 1. Specify

Copy `templates/spec-template.md` to `specs/<NNN-slug>/spec.md` and fill it in.

Write for a reader who does not know the codebase. Describe user outcomes, business
rules, and acceptance scenarios. **No file paths, no function names, no code, no
library choices.** Mark every open question with `[NEEDS CLARIFICATION: question]`.

Prompt: `.github/prompts/specify.prompt.md`

### 2. Clarify

Resolve every `[NEEDS CLARIFICATION]` marker. Ask the user; do not guess on anything
that affects money, data shape, or risk limits. Record the answers directly in the spec
and delete the markers.

Planning does not start while markers remain.

Prompt: `.github/prompts/clarify.prompt.md`

### 3. Plan

Copy `templates/plan-template.md` to `plan.md`. Decide the technical approach: which
modules change, what the data shape becomes, which migrations are needed, what the risks
are, and how each constitution principle is respected.

Prompt: `.github/prompts/plan.prompt.md`

### 4. Tasks

Copy `templates/tasks-template.md` to `tasks.md`. Break the plan into small, ordered,
individually verifiable steps. Domain logic first, then UI, then scenarios, then docs.
Each task states the files it touches and how it is verified.

Prompt: `.github/prompts/tasks.prompt.md`

### 5. Implement

Work the tasks in order. Tick each one off as it lands. If reality contradicts the plan,
stop and update `plan.md` and `tasks.md` before continuing — the spec directory must
always describe what was actually built.

Prompt: `.github/prompts/implement.prompt.md`

### 6. Verify

```bash
pnpm lint
pnpm build
pnpm test:e2e      # when UI behaviour changed
```

Then walk each acceptance scenario in `spec.md` and confirm it holds.

Prompt: `.github/prompts/verify.prompt.md`

## Gherkin lives in two places

| Directory | Purpose | Executed |
| --- | --- | --- |
| `features/` | Product-level intent, readable by non-developers | No |
| `e2e/features/` | Executable coverage, backed by `e2e/steps/` | Yes, via `pnpm test:e2e` |

Acceptance scenarios in a spec should land in `features/` as behaviour of record, and in
`e2e/features/` when they are automatable through the UI.

## Bugfixes

A defect follows a shortened track. The full six stages are overkill; skipping the
process entirely is how a money bug comes back.

Use `specs/templates/bugfix-template.md` at `specs/<NNN-fix-slug>/spec.md`. There is no
separate `plan.md` or `tasks.md` unless the fix turns out to be large enough to need
one — at which point it is really a feature and should switch to the full track.

### 1. Reproduce before diagnosing

Write the exact input state and observed output. For anything involving money, record
settings, bets, the observed figure, and the expected figure.

### 2. Establish which side is wrong

A mismatch between code and test means **one of them is wrong, and you do not yet know
which**. Do the arithmetic by hand and cite the rule — a function in `src/domain/`, a
scenario in `features/`, or a principle in `constitution.md`.

Changing the expectation to match the code turns a real bug into a permanently blessed
one. Changing correct code to match a stale test breaks working behaviour. Prove it
first.

### 3. Write the failing scenario

The regression scenario must **fail before the fix**. Record the red output in the spec.
A fix whose test never failed has proven nothing.

### 4. Name the root cause

File, function, and the faulty assumption — plus why existing tests missed it.

### 5. Assess blast radius

Shared code paths, already-persisted ledgers holding wrong values, and whether an
incorrect figure reached the cloud copy. A wrong number saved to a user's ledger is not
fixed by correcting the formula alone.

### 6. Fix, then verify

Keep the change minimal and targeted; a bugfix is not a refactor. Confirm the scenario
goes green, run the gates, and check that a pre-existing saved ledger still computes
correctly.

Prompt: `.github/prompts/bugfix.prompt.md`

### Cosmetic defects

Typos, misaligned layout, and wording fixes need no spec — just the gates. The moment a
defect touches a displayed figure, persisted data, or a validation rule, it needs the
track above.

## When a spec is not required

Typo fixes, dependency bumps, comment edits, formatting, and cosmetic defects.
Everything else — new behaviour, changed money rules, changed persisted shapes, new UI
surfaces, and any defect affecting a figure, stored data, or validation — needs one.
Lint and build gates always apply.

## Review checklist

- [ ] Spec describes behaviour only, with no implementation detail
- [ ] No `[NEEDS CLARIFICATION]` markers remain
- [ ] Acceptance scenarios are testable and unambiguous
- [ ] Plan names every affected module and migration
- [ ] Plan checks the change against `constitution.md`
- [ ] Tasks are ordered, small, and each has a verification step
- [ ] Implementation matches the spec; divergences are written back into it
