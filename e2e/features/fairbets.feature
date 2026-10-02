Feature: FairBets app overview

  Background:
    Given the FairBets app is available

  Scenario: The app loads and shows the default ledger
    Then I should see the "FairBets demo" ledger
    And I should see the "Current ledger" section

  Scenario: A user can add a new bet
    When I navigate to the Sequences view
    And I add a bet labeled "Test selection" with odds "2.00"
    Then the ledger should show the bet "Test selection"

  Scenario: The app opens on the sequences view
    Then the sequences view should be shown
    And no Overview destination should be offered

  Scenario: Summary information stays visible alongside the sequences
    Then the summary sidebar should show the "Available balance" metric
    And the summary sidebar should show the "Settled P&L" metric
    And the summary sidebar should show the "Largest stake" metric
    And the summary sidebar should show goal tracking

  Scenario: Settings opens over the sequences view
    When I open the settings overlay
    Then the settings overlay should be shown
    When I close the settings overlay
    Then the settings overlay should not be shown
    And the sequences view should be shown

  Scenario: The FairBets brand is the only Settings entry point
    Then there should be no separate Settings button
    When I open the settings overlay
    Then the settings overlay should be shown

  Scenario: The summary is reachable as a drawer on a small screen
    Given the viewport is a small phone
    Then the mobile summary control should show an accessible sidebar icon
    When I open the summary drawer
    Then the summary drawer should be open
    And the toolbar should remain above the summary drawer
    When I open the summary drawer
    Then the summary drawer should be closed

  Scenario: The summary drawer has no separate Close button
    Given the viewport is a small phone
    When I open the summary drawer
    Then the summary drawer should be open
    And there should be no separate drawer Close button

  Scenario: No guardrail warning is shown while within limits
    Then no guardrail warning should be shown

  Scenario: A breached limit warns on the sequences view and can be dismissed
    Then no guardrail warning should be shown
    When I add a bet labeled "Big bet" with odds "1.50" and a manual stake of "10"
    And I set the maximum stake to "5"
    Then a guardrail warning should be shown
    When I dismiss the guardrail warning
    Then no guardrail warning should be shown
