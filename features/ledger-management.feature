Feature: Ledger management

  Background:
    Given the app is loaded with a valid FairBets ledger
    And the user can view the sequences workspace, the summary sidebar, and settings

  Scenario: Load a demo ledger when no saved data exists
    Given no local ledger is stored in browser storage
    When the app starts
    Then it should load the built-in FairBets demo ledger
    And it should display the demo data without an error

  Scenario: Record a new open bet
    Given the user is in the sequences workspace
    When the user adds a bet with a label, a placed time, odds greater than 1, and no manual stake
    Then the new bet should be saved to the ledger
    And the sequence calculation should be recalculated immediately
    And the app should show the updated summary metrics

  Scenario: Reject invalid bet input
    Given the user opens the bet form
    When the user enters odds less than or equal to 1
    Or leaves the placed time blank
    Or enters a manual stake above the configured maximum stake
    Then the app should reject the save
    And it should show a clear validation message

  Scenario: Update an existing bet
    Given an existing bet is in the ledger
    When the user edits that bet and saves the changes
    Then the bet should be updated in place
    And the sequence totals and risk indicators should refresh

  Scenario: Settle an open bet as won or lost
    Given an open bet exists in the active sequence
    When the user marks it as "won" or "lost"
    Then the bet outcome should change from open to settled
    And the sequence should close on a win
    And the profit, exposure, and recovery values should update

  Scenario: Prevent invalid settlement changes
    Given a settled bet already exists
    When the user tries to change it back to open
    Then the app should block the action
    And it should show a validation message

  Scenario: Delete a bet from the ledger
    Given a bet exists in the ledger
    When the user confirms deletion
    Then the bet should be removed
    And all sequence calculations and summaries should be recalculated
