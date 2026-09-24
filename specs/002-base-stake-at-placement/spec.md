# Spec: Strategy values are fixed when a bet is placed

| Field | Value |
| --- | --- |
| ID | `002-base-stake-at-placement` |
| Status | Clarified |
| Created | 2026-09-24 |
| Related | FB-002 |

## Problem

The strategy settings are **live**, and every figure in the ledger is recalculated from
their current values. Changing them rewrites history.

A person who has been tracking at a base stake of €1.00 and decides to move up to €2.00
does not just change what happens next. The moment they save, every bet they have ever
placed — settled wins, settled losses, and bets still open — is re-priced as though it
had always been staked at €2.00. Recorded stakes double, sequence profit changes, the
recovery gap changes, the settled balance changes, and the available balance changes.

This is wrong twice over:

1. **It is factually false.** Those bets were placed under the old strategy. That is what
   was risked and that is what was won or lost. The ledger is a record of what happened,
   not a projection of what would have happened under today's settings.
2. **It destroys auditability.** A person cannot reconcile the app against their
   bookmaker account, because the app's history silently changed underneath them.

The same is true of a bet that is still **open**. It has been placed. The money is
already committed at the stake it was placed with.

The base stake is the most visible case, but it is not the only one. Threshold, recovery
weight, stake rounding, and the maximum stake all feed the stake a bet was placed at, and
all of them rewrite history today.

## Goal

The strategy values in effect when a bet was placed are the values that bet keeps for the
rest of its life. Changing a strategy setting affects only bets placed from that point
on.

## Non-goals

- No change to the stake formula itself. The way a stake is derived from base stake,
  recovery gap, odds, threshold, and recovery weight is unchanged.
- No change to the sequence model. A sequence still starts on the bet after a win and
  closes on the next win.
- No settings history log, no "as at date" reporting, and no way to view the whole ledger
  under a hypothetical strategy.
- No bulk re-pricing tool. Corrections are made one bet at a time.
- Starting balance, goal rate, and currency are not pinned. They describe the ledger as a
  whole rather than an individual bet.

## Users and scenarios

**Primary user:** a person tracking their own betting sequences, whose bankroll has grown
enough that they want to raise their base stake.

They have six months of history at €1.00. They open settings, change the base stake to
€2.00, and save. They expect the next bet they record to be suggested at the new, larger
stake. They expect their existing records — and their balance — to be exactly as they
were before they opened settings.

Today they instead find that their settled profit and available balance have both moved,
and none of their recorded stakes match their bookmaker history any more.

A second scenario: the same person notices that a bet recorded last week was priced under
a base stake they had mistyped. They open that bet and correct the recorded value, and
only that bet is re-priced.

## Functional requirements

### What is recorded

- **FR-1** Each bet MUST carry the strategy values that were in effect at the moment it
  was recorded: base stake, threshold, recovery weight, stake rounding, and maximum
  stake.
- **FR-2** Changing any of those settings MUST NOT change any figure derived from a bet
  that was already recorded — its stake, its profit, its expected profit, its
  contribution to the sequence recovery gap, or its contribution to the settled balance.
- **FR-3** Changing any of those settings MUST apply to every bet recorded after the
  change.
- **FR-4** A bet whose outcome is still **open** MUST be treated as already placed, and
  MUST keep the values it was recorded with.
- **FR-5** Settled balance, available balance, settled profit, expected profit, total
  staked, largest stake, goal progress, and win rate MUST all be identical before and
  after a strategy change, for a ledger with no new bets.
- **FR-6** The next-stake suggestion shown for the *upcoming* bet MUST use the new values
  immediately after the change.
- **FR-7** A sequence that is active when the strategy changes MUST remain a single
  sequence. Its earlier bets keep the old values and its later bets use the new ones.

### Risk limits stay live

- **FR-8** Guardrail warnings MUST be evaluated against the **current** settings, not the
  pinned ones. Lowering the maximum stake MUST still warn that a historical stake exceeds
  it, and open exposure MUST still be compared with the current exposure limit.
- **FR-9** The pinned maximum stake governs only what a bet *was capped at* when it was
  placed. Raising the maximum stake later MUST NOT increase a historical stake that was
  capped at the time.

### Existing data

- **FR-10** Existing saved ledgers MUST continue to load, and MUST NOT show different
  figures after upgrading. Bets with no recorded strategy values MUST be stamped with the
  values currently saved in that ledger's settings, which reproduces exactly what the
  previous version displayed.
- **FR-11** Bets restored from a cloud backup MUST keep the values they were recorded
  with. A backup saved by the previous version MUST be stamped from the settings stored
  in that same backup.
- **FR-12** Bets created by a workbook import MUST be stamped with the strategy values
  currently in settings at the time of the import.

### Editing and correcting

- **FR-13** Editing a bet's label, date, odds, outcome, or manual stake MUST NOT change
  the strategy values recorded against it.
- **FR-14** The strategy values recorded against a bet MUST be visible when viewing or
  editing that bet.
- **FR-15** The user MUST be able to explicitly correct any recorded strategy value on a
  past bet, and only that bet MUST be re-priced as a result.
- **FR-16** A corrected value MUST be subject to the same validation as the equivalent
  setting. An invalid correction MUST be rejected with a clear message and MUST NOT be
  saved.

## Business rules

The values pinned to a bet are exactly those that determine the stake it was placed at:

| Pinned | Not pinned |
| --- | --- |
| Base stake | Starting balance |
| Threshold | Goal rate |
| Recovery weight | Currency |
| Stake rounding | Maximum open exposure |
| Maximum stake (as the cap that applied) | |

**Maximum open exposure is deliberately not pinned.** It never affects a recorded stake;
it only drives a warning, and warnings stay live under FR-8.

### Worked example — the reported problem

Settings: base stake **€1.00**, threshold €0.50, recovery weight 0.5, rounding 2
decimals, maximum stake €15.00, starting balance €50.00.

| # | Odds | Outcome | Base stake in effect | Stake | Profit |
| --- | --- | --- | --- | --- | --- |
| 1 | 2.00 | lost | €1.00 | €1.00 | −€1.00 |
| 2 | 2.00 | won | €1.00 | €2.00 | +€2.00 |

After bet 1 the sequence is behind: expected €1.00 against profit −€1.00, a recovery gap
of €2.00. Bet 2 needs €2.00 of recovery at odds 2.00, which is weighted by 0.5 to €1.00
and added to the €1.00 base, giving a €2.00 stake. The win closes the sequence with
€1.00 of profit. Settled balance €51.00.

The user now changes the base stake to **€2.00**.

| | Today | Required |
| --- | --- | --- |
| Bet 1 stake | €2.00 | €1.00 |
| Bet 1 profit | −€2.00 | −€1.00 |
| Bet 2 stake | €4.00 | €2.00 |
| Bet 2 profit | +€4.00 | +€2.00 |
| Sequence profit | €2.00 | €1.00 |
| Settled balance | €52.00 | €51.00 |

A third bet recorded after the change, opening a fresh sequence at odds 2.00, is
suggested at **€2.00** — the new base stake — under both the current and the required
behaviour.

### Worked example — a capped stake

Settings: base stake €1.00, maximum stake **€1.50**, everything else as above.

Bet 1 at odds 2.00 loses, leaving a €2.00 recovery gap. Bet 2 would be priced at €2.00
but is capped at **€1.50**, and is flagged as capped.

The user later raises the maximum stake to €15.00. Bet 2 MUST stay at €1.50. It was
placed at €1.50; no later setting can change what was risked.

### Worked example — a mixed sequence

Settings start at base stake €1.00.

| # | Odds | Outcome | Base stake in effect |
| --- | --- | --- | --- |
| 1 | 2.00 | lost | €1.00 |
| — | — | *user changes base stake to €2.00* | — |
| 2 | 2.00 | lost | €2.00 |
| 3 | 2.00 | won | €2.00 |

Bet 1 keeps its €1.00 base. Bets 2 and 3 use €2.00. All three remain in the same
sequence, and the sequence closes on bet 3.

## Acceptance scenarios

```gherkin
Scenario: Raising the base stake leaves settled history untouched
  Given a ledger with settled bets recorded at a base stake of "1.00"
  And the available balance is shown
  When the user changes the base stake to "2.00" and saves
  Then the available balance should be unchanged
  And the settled profit should be unchanged
  And every recorded stake should be unchanged
```

```gherkin
Scenario: Raising the base stake leaves an open bet untouched
  Given a ledger with an open bet recorded at a base stake of "1.00"
  When the user changes the base stake to "2.00" and saves
  Then the stake of that open bet should be unchanged
  And the open exposure should be unchanged
```

```gherkin
Scenario: The new base stake applies to the next bet
  Given a ledger whose sequences are all closed
  When the user changes the base stake to "2.00" and saves
  And the user records a new bet at odds "2.00"
  Then the new bet should be staked at "2.00"
```

```gherkin
Scenario: A sequence that spans a strategy change stays one sequence
  Given an active sequence containing a losing bet recorded at a base stake of "1.00"
  When the user changes the base stake to "2.00" and saves
  And the user records another losing bet in that sequence
  Then both bets should belong to the same sequence
  And the first bet should keep its original stake
  And the second bet should be priced from the new base stake
```

```gherkin
Scenario: Raising the maximum stake does not re-price a capped bet
  Given a settled bet whose stake was capped at the maximum stake in force at the time
  When the user raises the maximum stake and saves
  Then that bet's stake should be unchanged
```

```gherkin
Scenario: Lowering the maximum stake still warns about historical stakes
  Given a ledger with a settled bet staked at "10.00"
  When the user lowers the maximum stake to "5.00" and saves
  Then a guardrail warning should be shown
  And the recorded stake should still be "10.00"
```

```gherkin
Scenario: Lowering the base stake does not rewrite history either
  Given a ledger with settled bets recorded at a base stake of "2.00"
  When the user changes the base stake to "0.50" and saves
  Then the settled balance should be unchanged
```

```gherkin
Scenario: Editing a bet does not re-stamp its strategy values
  Given a settled bet recorded at a base stake of "1.00"
  And the current base stake setting is "2.00"
  When the user edits that bet's label and saves
  Then the bet should still show a recorded base stake of "1.00"
  And its stake should be unchanged
```

```gherkin
Scenario: Correcting a mis-recorded base stake re-prices only that bet
  Given two settled bets recorded at a base stake of "1.00"
  When the user corrects the recorded base stake of the second bet to "2.00"
  Then the second bet should be re-priced
  And the first bet should be unchanged
```

```gherkin
Scenario: An invalid correction is rejected
  Given a settled bet recorded at a base stake of "1.00"
  When the user corrects the recorded base stake to "0"
  Then the app should reject it
  And show a clear validation message
```

```gherkin
Scenario: An existing saved ledger shows the same figures after upgrading
  Given a ledger saved by the previous version of the app
  When the app loads that ledger
  Then every figure should match what the previous version showed
```

## Edge cases

- **Zero bets.** Changing a setting has nothing to re-price; the next-bet suggestion
  reflects the new values.
- **A single open bet.** Its stake is frozen; open exposure does not move.
- **An all-open sequence.** No settled profit exists, so the recovery gap stays zero and
  no figure moves.
- **A manual stake override.** The recorded stake already ignores the base stake, but the
  bet's expected profit is still derived from the base stake, so it must be pinned too.
- **Exactly at the maximum stake.** A bet staked at exactly the pinned maximum is not
  capped; a bet that would have exceeded it is. Later changes to the setting do not
  revisit that decision.
- **A correction that crosses the current maximum stake.** The correction is validated on
  its own terms; the resulting stake is then subject to the live guardrail warnings of
  FR-8.
- **Existing saved data.** Covered by FR-10 and FR-11.
- **No network, no Supabase.** Entirely a local concern; the app must work offline as
  before.

## Data impact

- **`LedgerState` shape:** changes. Each bet gains the five recorded strategy values.
- **`localStorage` migration:** needed. Existing saved bets are stamped from the settings
  saved alongside them, so no displayed figure moves (FR-10).
- **Cloud schema:** changes. The recorded values must survive backup and restore. Rows
  written by the previous version are stamped from the settings stored in the same
  backup (FR-11).
- **Workbook import:** the import layout does not change. Imported bets are stamped from
  the settings in force at import time (FR-12).

## Constitution check

- [x] I. Private tracker, never an operator — no change to what the app claims or does
- [x] II. Local-first — no new network dependency
- [x] III. Deterministic domain logic — calculations stay pure; they read strategy values
      from the bet rather than from live settings
- [x] IV. UI and domain stay separated — the rule belongs in the domain layer
- [x] V. The sequence model is preserved — FR-7 keeps sequences intact across a change
- [x] VI. Risk limits stay enforced — FR-8 keeps every warning evaluated against current
      settings, so pinning can never mute a live breach
- [ ] VII. Data compatibility preserved — **needs attention.** This changes the persisted
      shape and the cloud schema. FR-10 and FR-11 exist to hold the line: old ledgers must
      load and must not shift by a single cent
- [x] VIII. No secrets introduced
- [x] IX. Behaviour specified in Gherkin — acceptance scenarios above
- [x] X. Gates pass — enforced at verification

This change **strengthens** principle III's spirit: today a pure function produces a
different answer for the same historical bet depending on a setting changed months later.

## Resolved decisions

| # | Question | Decision |
| --- | --- | --- |
| 1 | What is pinned to a bet? | Base stake, threshold, recovery weight, stake rounding, and maximum stake — everything that determines the stake placed |
| 2 | Is the maximum stake pinned? | Yes, as the cap that applied at placement. Guardrail warnings still use current settings |
| 3 | How are existing saved bets treated? | Stamped with the values currently saved in that ledger's settings, so no figure moves on upgrade |
| 4 | How are old cloud backups treated? | Stamped from the settings stored in the same backup |
| 5 | What do imported bets get? | The settings in force at import time |
| 6 | Does editing a bet re-stamp it? | No. Only an explicit correction changes a recorded value |
| 7 | Are recorded values visible? | Yes, in the bet's detail and edit view |
| 8 | Can a mis-recorded value be corrected? | Yes, any pinned value, one bet at a time, with the same validation as the setting |

## Out of scope for now

- A full settings-history log, letting the ledger be viewed as at any past date.
- Showing "this bet was placed under an older strategy" markers in the sequence list.
- Bulk re-pricing tools for correcting a stretch of history.
- Pinning the goal rate or starting balance, which describe the ledger rather than a bet.
