---
mode: agent
description: "Shortened spec track for diagnosing and fixing a defect"
---

# Bugfix

Diagnose and fix: `${input:defect:Describe the defect, with the observed and expected behaviour}`

## Steps

### 1. Reproduce

Create `specs/<FG-NNN-fix-slug>/spec.md` from `specs/templates/bugfix-template.md`. Record
the exact input state and observed output before changing anything. For money defects,
capture settings, bets, the observed figure, and the expected figure.

### 2. Establish which side is wrong

Do the arithmetic by hand and cite the rule — a function in `src/domain/`, a scenario in
`features/`, or a principle in `specs/constitution.md`.

**A failing test means the code is wrong or the expectation is stale. Determine which
before editing either.** Never silence a failure by rewriting the expectation to match
current output, and never rewrite correct code to satisfy a stale test.

### 3. Write the failing scenario

Add a regression scenario to `e2e/features/` (or `features/` when it is not automatable)
that expresses the **correct** behaviour. Run it and confirm it **fails**. Paste the red
output into the spec.

### 4. Name the root cause

File, function, and faulty assumption — precisely. Also record why existing coverage
missed it.

### 5. Assess blast radius

- Which other calculations share this code path?
- Do already-persisted ledgers hold incorrect values?
- Did a wrong figure reach the cloud copy?
- Is a data correction or migration needed alongside the code fix?

### 6. Fix and verify

Make the minimal targeted change. Then:

```bash
pnpm lint
pnpm build
pnpm test:e2e
```

Confirm the regression scenario now passes and that a pre-existing saved ledger still
loads with correct figures.

## Rules

- No fix without a reproduction. A fix whose test never failed has proven nothing.
- Keep the change minimal. A bugfix is not a refactor; larger problems this reveals
  become their own spec.
- Stake and sequence corrections stay in `src/domain/` as pure functions. Never move
  math into the UI to make a fix easier.
- Do not weaken a validation rule or risk limit to make a symptom disappear.
- Cosmetic defects — typos, layout, wording — need no spec, only the gates.

## Output

Report the reproduction, which side was wrong and the evidence, the root cause, the
blast radius, the regression scenario and its red-then-green transition, and the gate
results.
