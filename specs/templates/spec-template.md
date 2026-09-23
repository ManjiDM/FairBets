# Spec: [Feature name]

| Field | Value |
| --- | --- |
| ID | `NNN-feature-slug` |
| Status | Draft \| Clarified \| Planned \| In progress \| Shipped |
| Created | YYYY-MM-DD |
| Related | Issue / PR links |

> Describe **what** changes for the user and **why**. No file names, function names,
> library choices, or code. Mark unknowns as `[NEEDS CLARIFICATION: question]` and
> resolve them all before planning.

## Problem

What is wrong, missing, or painful today? Who feels it, and when?

## Goal

One or two sentences describing the desired end state.

## Non-goals

What this change explicitly does not do. Keeps scope honest.

## Users and scenarios

**Primary user:** [e.g. a person tracking their own betting sequences]

Narrative of how they hit this feature and what they expect to happen.

## Functional requirements

Numbered, testable, and free of implementation detail.

- **FR-1** The system MUST ...
- **FR-2** The system MUST ...
- **FR-3** The system MUST NOT ...

## Business rules

Money and sequence rules in plain language. Include worked numeric examples where a
calculation is involved — these become the basis for verification.

| Input | Expected result | Notes |
| --- | --- | --- |
| | | |

## Acceptance scenarios

Gherkin. These are the definition of done.

```gherkin
Scenario: [Name]
  Given [starting state]
  When [user action]
  Then [observable outcome]
  And [observable outcome]
```

```gherkin
Scenario: [Edge case or rejection path]
  Given [starting state]
  When [invalid action]
  Then the app should reject it
  And show a clear validation message
```

## Edge cases

- What happens with zero bets, a single open bet, or an all-open sequence?
- What happens at exactly `maxStake` or exactly `maxOpenExposure`?
- What happens with existing saved data from a previous version?
- What happens with no network or no Supabase configuration?

## Data impact

- Does `LedgerState` change shape? Which fields?
- Is a `localStorage` migration needed for existing users?
- Is a cloud schema change needed?
- Does the workbook import layout change?

Answer "none" explicitly if nothing changes.

## Constitution check

Confirm against [`../constitution.md`](../constitution.md), noting anything that needs
discussion.

- [ ] I. Private tracker, never an operator
- [ ] II. Local-first
- [ ] III. Deterministic domain logic
- [ ] IV. UI and domain stay separated
- [ ] V. The sequence model is preserved
- [ ] VI. Risk limits stay enforced
- [ ] VII. Data compatibility preserved
- [ ] VIII. No secrets introduced
- [ ] IX. Behaviour specified in Gherkin
- [ ] X. Gates pass

## Open questions

- [NEEDS CLARIFICATION: ...]

## Out of scope for now

Ideas that surfaced but belong to a future spec.
