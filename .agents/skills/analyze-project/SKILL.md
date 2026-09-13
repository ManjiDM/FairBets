---
name: analyze-project
description: "Analyze project structure, architecture, and quality"
allowed-tools: Bash Read Write
---
# Analyze Project Skill

## Purpose

This skill analyzes software projects to evaluate architecture, structure, code quality, and performance.

The agent must behave like a senior software architect and code reviewer.

---

## When This Skill Should Be Used

Use this skill when:

- A project is completed
- The user requests code review
- The user wants improvements
- Architecture evaluation is needed
- Performance issues are suspected

---

## Analysis Workflow

Follow these steps carefully:

---

### Step 1 — Read Project Files

Analyze:

- All source code files
- Configuration files
- Dependency files
- README documentation

Identify:

- Programming language
- Framework
- Project purpose
- Folder structure

---

### Step 2 — Analyze Project Structure

Evaluate:

- Folder organization
- Separation of concerns
- Naming conventions
- Modularity

Check for:

- Deep nesting
- Duplicate logic
- Poor file organization

---

### Step 3 — Analyze Code Quality

Evaluate:

- Readability
- Maintainability
- Code duplication
- Function complexity
- Variable naming clarity

Check for:

- Long functions
- Hardcoded values
- Poor formatting

---

### Step 4 — Detect Performance Issues

Identify:

- Inefficient loops
- Unnecessary computations
- Memory-heavy operations
- Blocking operations

Suggest:

- Optimization techniques
- Efficient alternatives

---

### Step 5 — Security Review

Check for:

- Exposed secrets
- Unsafe inputs
- Missing validation
- Hardcoded credentials

Suggest:

- Security improvements
- Validation methods

---

### Step 6 — Dependency Analysis

Review:

- Installed dependencies
- Unused libraries
- Outdated packages

Suggest:

- Dependency cleanup
- Updates if required

---

### Step 7 — Architecture Evaluation

Evaluate:

- Design patterns used
- Scalability readiness
- Maintainability
- Reusability

Check if:

- MVC pattern used
- Modular design exists
- Components are reusable

---

### Step 8 — Generate Improvement Suggestions

Provide:

- Refactoring suggestions
- Folder restructuring ideas
- Naming improvements
- Modularization suggestions

---

### Step 9 — Generate Quality Score

Assign score:

0–100

Based on:

- Code quality
- Structure
- Performance
- Security
- Documentation

Explain scoring logic.

---

## Output Format

Always produce:

1. Project Overview
2. Structure Analysis
3. Code Quality Review
4. Performance Issues
5. Security Review
6. Dependency Review
7. Architecture Suggestions
8. Improvement Recommendations
9. Final Quality Score

---

## Analysis Philosophy

Always:

- Be objective
- Be constructive
- Provide actionable feedback
- Avoid vague suggestions

Never:

- Criticize without solution
- Provide incomplete analysis