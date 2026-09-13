Feature: Settings and risk analysis

  Background:
    Given the app is loaded with a valid FairBets ledger
    And the user can view the overview, history, and settings tabs

  Scenario: Save and validate strategy settings
    Given the user opens the settings tab
    When the user changes values such as base stake, goal rate, max stake, or exposure limits
    And the values are positive and consistent
    Then the updated settings should be saved
    And the ledger should recalculate stake suggestions and risk warnings

  Scenario: Reject invalid strategy settings
    Given the user opens the settings tab
    When the user enters a goal rate above 100%
    Or a max stake lower than the base stake
    Or a non-integer rounding value outside 0 to 4
    Then the app should reject the settings save
    And it should show an error message

  Scenario: View sequence history and active sequence status
    Given multiple bets have been recorded across wins and losses
    When the user opens the history tab
    Then the app should group bets into FairBets sequences
    And it should distinguish active and closed sequences
    And it should show totals such as profit, exposure, and largest stake

  Scenario: Suggest the next stake based on recovery gap and odds
    Given the current sequence has a recovery gap
    And the user has a candidate odds value
    When the app computes the stake suggestion
    Then it should use the configured base stake plus recovery weighting
    And it should cap the stake if it exceeds the configured max stake
    And it should surface risk warnings when the suggestion is capped

  Scenario: Show ledger health warnings
    Given the ledger has open exposure above the configured threshold
    Or a recorded stake exceeds the maximum stake
    Or the next suggested stake is capped
    When the overview is rendered
    Then the app should show relevant warning messages as risk flags
