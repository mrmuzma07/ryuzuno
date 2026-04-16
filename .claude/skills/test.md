# Skill: /test

Run tests for the RYUZUNO project.

## Arguments

- No args: run all tests with `npm run test`
- `watch`: run tests in watch mode with `npm run test:watch`
- `e2e`: run Playwright E2E tests with `npx playwright test`
- A file path: run tests for specific file with `npx vitest run <path>`

## Instructions

1. Parse the argument to determine test mode
2. Run the appropriate test command
3. If tests fail, analyze failures and suggest fixes
4. Report test results summary (passed/failed/skipped)
