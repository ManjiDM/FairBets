---
applyTo: "e2e/**,features/**"
---

# Behaviour and E2E instructions

Cucumber is the single E2E runner; Playwright is its browser automation layer. There is
no separate Playwright Test suite — do not add one.

## Where things go

| Path | Purpose |
| --- | --- |
| `features/` | Product-level Gherkin, readable by non-developers, not executed |
| `e2e/features/` | Executable Gherkin |
| `e2e/steps/` | Playwright-backed step definitions |
| `e2e/support/` | World, hooks, browser lifecycle |
| `cucumber.json` | Paths and report configuration |

## Rules

- Scenarios describe observable user behaviour. Never reference component names, storage
  keys, or internal functions in Gherkin.
- Reuse existing step phrasings in `e2e/steps/fairbets.steps.js` before inventing new
  ones; duplicated near-identical steps make the suite brittle.
- Keep scenarios deterministic and independent — no reliance on the order of execution or
  on state left behind by another scenario.
- Workbook-import fixtures are **generated in step definitions**, not committed as binary
  `.xlsx` files.
- Service workers are blocked in tests on purpose: the app service worker navigates
  clients during activation and breaks deterministic assertions. Do not re-enable them.
- New acceptance scenarios from a spec land in `features/` as behaviour of record, and in
  `e2e/features/` when automatable through the UI.

## Verify

```bash
pnpm exec playwright install chromium   # once
pnpm test:e2e
pnpm test:e2e:headed                    # visible browser, PWDEBUG=1
```

Reports are written to `dist/e2e/`.
