Feature: Workbook import

  Background:
    Given the FairBets app is available
    And the user is on the Settings screen

  Scenario: Import a FairBets workbook
    Given the user selects a valid FairBets workbook
    When the workbook is imported
    Then the imported ledger should be displayed
    And the import success message should mention "1 bets imported"

  Scenario: Reject an incompatible workbook
    Given the user selects an incompatible workbook
    When the workbook is imported
    Then the import error should be displayed
    And the current ledger should still be displayed
