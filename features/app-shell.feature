Feature: Application shell

  Background:
    Given the app is loaded with a valid FairBets ledger

  Scenario: Open the app on the sequences workspace
    When the app starts
    Then the sequences workspace should be the first thing shown
    And no separate home or overview destination should be offered

  Scenario: Read the ledger summary from the sidebar
    Given the sequences workspace is shown on a wide screen
    Then the summary sidebar should show the available balance
    And it should show the settled profit and loss
    And it should show goal tracking
    And it should show the largest stake
    And every figure should match the value the overview page used to show

  Scenario: Reach the summary on a small screen
    Given the sequences workspace is shown on a small screen
    When the user opens the summary drawer
    Then the same summary figures should be shown
    When the user closes the summary drawer
    Then the sequences workspace should be fully visible again

  Scenario: Read the next stake guidance in the sequences header
    Given the ledger has an active sequence
    When the sequences workspace is rendered
    Then the header should show the win rate, the active sequence status, and the next stake guidance

  Scenario: Warn about breached guardrails above the sequences
    Given a guardrail such as the maximum stake is breached
    When the sequences workspace is rendered
    Then a warning banner should be shown above the sequences
    And the banner should offer a way to review the guardrail settings

  Scenario: Dismiss a guardrail warning without silencing it
    Given a guardrail warning banner is shown
    When the user dismisses the banner
    Then the banner should be hidden for that set of warnings
    But it should return when the set of breached guardrails changes
    And it should return when the app is reloaded

  Scenario: Open and close settings as an overlay
    Given the sequences workspace is shown
    When the user opens settings
    Then settings should be shown as an overlay above the sequences
    When the user closes the overlay
    Then the sequences workspace should be shown again

  Scenario: Return to the sequences after a ledger-wide action
    Given the user is in the settings overlay
    When the user imports a workbook, loads the demo ledger, or starts fresh
    Then the overlay should close
    And the sequences workspace should show the resulting ledger
