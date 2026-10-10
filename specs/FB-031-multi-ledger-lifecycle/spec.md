# Spec: Ledger lifecycle with investments and closing statistics

| Field | Value |
| --- | --- |
| ID | `FB-031-multi-ledger-lifecycle` |
| Status | Clarified |
| Created | 2026-10-10 |
| Related | Follows the v1.0.0 release; groundwork for a larger refactor |

## Problem

Today the app holds a single ledger whose starting balance is just a setting. There is no
way to finish a ledger and keep its result, start a fresh one with new settings, or record
how much real money was put in. The user cannot see overall profit or loss across the
ledgers they have run, nor how much money is available to start the next one with.

## Goal

The user can run ledgers one after another. Each ledger has its own settings and a
starting balance, can be closed to freeze its final statistics, and draws on a pool of
money made up of timestamped investments plus the results of previously closed ledgers.

## Non-goals

- Running several ledgers in parallel. Exactly one ledger is active at a time.
- Changing stake, sequence, or guardrail rules inside a ledger.
- Withdrawals or any money leaving the pool other than a ledger's net result.
- Importing or exporting ledgers between users.

## Users and scenarios

**Primary user:** a person tracking their own bets who works in rounds. They finish a
round, want to see how it went, then start another from the money they now have.

Narrative: the user begins with an initial investment and a first ledger. When the round
ends they close the ledger and see its final statistics. The result flows back into their
overall money. They may add more investment at any time. They then start a new ledger,
choosing its settings and a starting balance no larger than the money they have available.

## Functional requirements

- **FR-1** The app MUST hold exactly one active ledger at a time and MUST NOT allow a
  second ledger to be started while one is active.
- **FR-2** The app MUST keep a history of closed ledgers, each with its name, settings,
  bets, starting balance, creation time, closing time and final statistics.
- **FR-3** The user MUST be able to start a new ledger, choosing a name, its own strategy
  settings and a starting balance.
- **FR-4** A new ledger's starting balance MUST NOT exceed the available funds (see
  Business rules) and MUST be above zero. Otherwise the app rejects it with a clear
  message that states the available amount.
- **FR-5** The user MUST be able to close the active ledger. Closing freezes the ledger:
  its bets and settings can no longer be edited, and it is stamped with a closing time.
- **FR-6** A closed ledger MUST show final statistics: starting balance, final balance,
  net result, total staked, wins, losses, win rate, closed sequences, and its opening
  and closing times.
- **FR-7** The user MUST be able to record an initial investment and further investments.
  Each investment has an amount above zero and a timestamp set when it is recorded.
- **FR-8** The app MUST show the overall position: total invested, total net result of
  closed ledgers, and the available funds.
- **FR-9** Investments, ledger creation and ledger closure MUST appear together on a
  timestamped history, in the order they happened.
- **FR-10** Existing saved data MUST load: the saved ledger becomes the first, active
  ledger, with an initial investment equal to its starting balance.
- **FR-11** The app MUST remain fully functional offline and without cloud configuration.
- **FR-12** After a ledger is closed and until a new one is started, the app MUST show that there is no active ledger and MUST NOT allow adding bets.
- **FR-13** The new ledger form MUST be pre-filled with the settings of the most recent ledger.

## Business rules

Definitions, all in the ledger currency:

- **Total invested** = sum of all recorded investments.
- **Realised result** = sum of the net result of every closed ledger.
- **Available funds** = total invested + realised result − starting balance of the active
  ledger (zero when no ledger is active).
- **Net result of a ledger** = final balance − starting balance, where final balance is
  the starting balance plus the settled profit of its bets.
- **Overall outcome** = realised result (open ledgers are not counted until closed).

| Input | Expected result | Notes |
| --- | --- | --- |
| Invest 100.00; ledger 1 starts at 40.00 | Available funds 60.00 | Money in the active ledger is committed |
| Ledger 1 closes with settled profit +12.50 | Realised result +12.50; available 112.50 | Starting balance is released with the result |
| Start ledger 2 at 112.60 | Rejected: available is 112.50 | Cannot exceed available funds |
| Start ledger 2 at 112.50 | Accepted | Exactly the limit is allowed |
| Ledger closes at −8.00 | Realised result −8.00 | Losses reduce available funds |
| Add investment 20.00 | Total invested 120.00; available +20.00 | Timestamped when recorded |

Editing the active ledger's starting balance in Settings keeps working as before and is not capped by the funds rule; the funds rule governs starting a new ledger. If an edit raises the active balance above the invested money, the available funds show as negative and a new ledger cannot start until more is invested.

## Acceptance scenarios

```gherkin
Scenario: A new ledger cannot start above the available funds
  Given an investment of 100.00 and a closed ledger with a net result of 12.50
  When I start a ledger with a starting balance of 112.60
  Then the app should reject it
  And the message should state that 112.50 is available

Scenario: Closing a ledger freezes it and shows final statistics
  Given an active ledger with settled bets
  When I close the ledger
  Then it appears in the closed ledgers with its final statistics
  And its bets can no longer be edited

Scenario: An investment is timestamped
  When I add an investment of 20.00
  Then the history shows the investment with the time it was recorded
  And the total invested increases by 20.00

Scenario: Only one ledger can be active
  Given an active ledger
  Then I cannot start another ledger until I close it

Scenario: A saved ledger from before this version still loads
  Given data saved by version 1.0.0
  When I open the app
  Then it is the first active ledger and all its bets are present
```

## Edge cases

- Closing a ledger with open bets is blocked until every bet is settled, because open bets are exposure and must never become silent losses.
- A ledger with zero bets can be closed with a net result of zero.
- Available funds are exactly zero: the user can still invest more before starting.
- Investments recorded while a ledger is active go to the available funds only; they never change the active ledger's balance.
- Old data has no investment record, so one is synthesised from its starting balance.

## Data impact

- `LedgerState` keeps its shape for each ledger. A new portfolio record wraps it with the investments, the closed ledgers and the active ledger's opening time.
- A `localStorage` migration is required (see FR-10); legacy keys keep working.
- Cloud: unchanged. The ledger history stays local-only in this change; backing it up needs its own spec with a schema, migration and parsers.
- Workbook import: imports into the active ledger; layout unchanged.

## Constitution check

- [ ] I. Private tracker, never an operator
- [ ] II. Local-first
- [ ] III. Deterministic domain logic — funds and results are pure functions in the domain
- [ ] IV. UI and domain stay separated
- [ ] V. The sequence model is preserved — unchanged inside a ledger
- [ ] VI. Risk limits stay enforced
- [ ] VII. Data compatibility preserved — migration of saved data
- [ ] VIII. No secrets introduced
- [ ] IX. Behaviour specified in Gherkin
- [ ] X. Gates pass

## Open questions

None. New ledger settings are pre-filled from the previous ledger and remain editable.

## Out of scope for now

- Parallel ledgers.
- Withdrawals.
- Charts across ledgers.
