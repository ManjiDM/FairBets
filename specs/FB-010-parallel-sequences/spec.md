# Spec: Add bets to parallel sequences

| Field | Value |
| --- | --- |
| ID | `FB-010-parallel-sequences` |
| Status | Draft |
| Created | 2026-10-02 |
| Related | — |

> Describe **what** changes for the user and **why**. No file names, function names,
> library choices, or code. Mark unknowns as `[NEEDS CLARIFICATION: question]` and
> resolve them all before planning.

## Problem

The app currently prevents adding a bet while any bet is open. This forces the user to
wait for one bet to settle before recording an independent bet, and it offers no clear
way to continue one chosen sequence while other sequences are also in progress.

## Goal

Let users keep multiple sequences in progress at once. A new bet starts its own
sequence; a separate plus button on an eligible sequence adds that sequence's next bet.

## Non-goals

- Allowing more than one open bet within a single sequence.
- Changing the rule that a win closes its sequence.
- Automatically placing bets or predicting outcomes.
- Changing the ledger-wide recovery rule for a new sequence defined in
  [FB-009](../FB-009-recover-settled-profit-gap/spec.md).

## Users and scenarios

**Primary user:** A person tracking their own betting sequences.

The user records one bet and leaves it open. They can still use the main **Add bet**
button to record an unrelated bet in a separate sequence. If a sequence's latest bet
loses, a plus button on that sequence lets them record its next recovery bet while
other sequences continue independently.

## Functional requirements

- **FR-1** The main **Add bet** button MUST remain available when one or more bets are
  open. Using it MUST start a new, independent sequence.
- **FR-2** A sequence MUST contain no more than one open bet at a time.
- **FR-3** Each sequence MUST retain its own bet history and recovery calculation.
  Starting another sequence MUST NOT move, merge, or recalculate bets in an existing
  sequence.
- **FR-4** A sequence MUST close as soon as one of its bets is marked as won. Other
  sequences MUST remain unchanged.
- **FR-5** Each sequence card MUST show a plus-sign button to add the next bet to that
  sequence only when its latest bet is lost.
- **FR-6** The plus-sign button MUST NOT be shown when the latest bet is open or won.
- **FR-7** Using a sequence's plus button MUST add the new bet to that same sequence
  and use that sequence's recovery calculation.
- **FR-8** A new independent sequence MUST use the existing new-sequence suggestion
  rules, including the ledger-wide recovery behavior.
- **FR-9** Sequence membership MUST remain stable when other sequences receive bets,
  and after the ledger is reloaded or restored.
- **FR-10** Combined open exposure across all sequences MUST continue to respect the
  configured risk limits. Allowing parallel sequences MUST NOT bypass stake or
  exposure validation.
- **FR-11** The plus-sign button MUST have an accessible name that identifies the
  sequence it will add a bet to.

## Business rules

| Input | Expected result | Notes |
| --- | --- | --- |
| Add a new bet while another sequence has an open bet | Create a separate sequence | Each sequence has at most one open bet |
| Latest bet in a sequence is lost | Show that sequence's plus button | Adds the next recovery bet to that sequence |
| Latest bet in a sequence is open | Do not show that sequence's plus button | Wait for its outcome |
| A bet in a sequence is won | Close that sequence | Other sequences remain as they were |
| Start an independent sequence | Use the current new-sequence recovery rule | Includes FB-009 ledger-wide gap |
| Add a bet to an existing sequence | Use that sequence's recovery gap | Does not use another sequence's state |

## Acceptance scenarios

```gherkin
Scenario: Start a separate sequence while another bet is open
  Given a sequence has an open bet
  When I use the main Add bet button to record another bet
  Then the new bet should start a separate sequence
  And both sequences should retain their own bet
  And the main Add bet button should remain available
```

```gherkin
Scenario: Add a recovery bet to a sequence whose latest bet lost
  Given a sequence's latest bet is lost
  And another sequence is also in progress
  When I use the plus button on the lost sequence
  And I record a new bet
  Then the new bet should belong to the sequence whose plus button I used
  And the other sequence should remain unchanged
```

```gherkin
Scenario: Show the sequence plus button only after a loss
  Given a sequence has an open latest bet
  Then its plus button should not be shown
  When I mark that bet as lost
  Then its plus button should be shown
  When I use the plus button and record another open bet
  Then the sequence should contain only one open bet
  And its plus button should not be shown
```

```gherkin
Scenario: A win closes only the sequence containing that bet
  Given two sequences each have an open bet
  When I mark a bet in one sequence as won
  Then that sequence should be closed
  And the other sequence should remain open
  And the closed sequence's plus button should not be shown
```

```gherkin
Scenario: Keep sequence membership after reload
  Given multiple sequences contain recorded bets
  When I reload the ledger
  Then each bet should remain in its original sequence
  And each sequence should keep its own status and recovery state
```

## Edge cases

- A new independent bet is entered with a placement time earlier than an existing
  sequence's bets; it still starts its own sequence.
- Two or more independent sequences each have an open bet.
- A sequence's latest bet changes from open to lost, then a next bet is recorded.
- A sequence's latest bet changes from open to won and closes.
- Combined open exposure reaches or exceeds the configured limit.
- Existing saved ledgers contain bets but no explicitly recorded sequence membership.
- Imported workbook bets need to remain grouped consistently with their current
  sequence behavior.

## Data impact

Sequence membership must be retained with recorded bets so separate sequences and
their recovery state survive reload and restore. Existing saved and imported ledgers
must remain readable and keep their current grouping. Any local or cloud data changes
will be detailed in the plan; no workbook layout change is intended.

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
- [x] IX. Behaviour specified in Gherkin
- [ ] X. Gates pass

## Open questions

None. One open bet per sequence is allowed; different sequences may each have an open
bet. A win closes only its own sequence. The sequence plus button is available only
when that sequence's latest bet is lost.

## Out of scope for now

Allowing multiple open bets within one sequence, or delaying sequence closure after a
win.
