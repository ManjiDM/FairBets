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

  Scenario: Settings opens as a non-modal sidebar on desktop
    When I open Settings using the brand control
    Then the settings panel should be visible alongside sequences
    And there should be no modal backdrop
    And Settings should not be a modal dialog
    And the summary sidebar should remain visible
    And the brand control should be named "Close settings"
    When I toggle Settings using the brand control
    Then the settings drawer should be closed
    And the brand control should be named "Open settings"

  Scenario: The FairBets brand is the only Settings entry point
    Then there should be no separate Settings button
    When I open Settings using the brand control
    Then the settings panel should be visible alongside sequences

  Scenario: Settings uses a left drawer on mobile and toggles from the brand
    Given the viewport is a small phone
    When I open Settings using the brand control
    Then the settings drawer should be visible below the toolbar
    And there should be no modal backdrop
    And there should be no Back to sequences button
    And the brand control should be named "Close settings"
    When I toggle Settings using the brand control
    Then the settings drawer should be closed
    And the brand control should be named "Open settings"

  Scenario: The summary is reachable as a drawer on a small screen
    Given the viewport is a small phone
    Then the mobile summary control should show an accessible sidebar icon
    When I toggle the summary drawer
    Then the summary drawer should be open
    And the toolbar summary toggle should be named "Close summary"
    And the toolbar should remain above the summary drawer
    When I toggle the summary drawer
    Then the summary drawer should be closed
    And the toolbar summary toggle should be named "Open summary"

  Scenario: The summary drawer has no separate Close button
    Given the viewport is a small phone
    When I toggle the summary drawer
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
