Feature: Docked bottom toolbar on mobile
  As a person using FairBets on a phone
  I want the Sequences and Ledgers tabs docked at the bottom of the screen
  So that I can switch views without scrolling back to the top

  Scenario: Mobile shows a docked bottom toolbar
    Given the FairBets app is available
    And the viewport is a small phone
    Then the bottom toolbar should show the Sequences and Ledgers tabs
    And the bottom toolbar should be docked to the bottom of the screen

  Scenario: The bottom toolbar stays visible while scrolling
    Given the FairBets app is available
    And the viewport is a small phone
    When I scroll the page to the bottom
    Then the bottom toolbar should be docked to the bottom of the screen
    And the top toolbar should still be visible

  Scenario: The bottom toolbar switches tabs
    Given the FairBets app is available
    And the viewport is a small phone
    When I open the Ledgers tab
    Then the "Ledgers" tab should be selected

  Scenario: Desktop has no docked toolbar
    Given the FairBets app is available
    Then the tabs should be shown above the content
