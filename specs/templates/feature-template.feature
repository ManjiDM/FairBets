Feature: [Feature name]
  # Scenarios belong in e2e/features/ and need matching steps in
  # e2e/steps/fairbets.steps.js.
  #
  # Write observable outcomes only: what the user does and what the app shows.
  # Never reference component names, storage keys, or function names.

  Background:
    Given the app is loaded with a valid FairBets ledger

  Scenario: [Happy path]
    Given [starting state]
    When [user action]
    Then [observable outcome]
    And [observable outcome]

  Scenario: [Rejection path]
    Given [starting state]
    When [invalid action]
    Then the app should reject the action
    And it should show a clear validation message

  Scenario Outline: [Rule with worked examples]
    Given a sequence with a base stake of <baseStake>
    When a bet is recorded at odds <odds>
    Then the suggested stake should be <suggestedStake>

    Examples:
      | baseStake | odds | suggestedStake |
      |           |      |                |
