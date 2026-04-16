# Skill: /check

Run full quality check pipeline for the RYUZUNO project.

## Instructions

Run all checks sequentially and report results:

### 1. TypeScript type checking

```bash
npx tsc --noEmit
```

### 2. ESLint

```bash
npm run lint
```

### 3. Unit tests

```bash
npm run test
```

### 4. Production build

```bash
npm run build
```

### 5. Report

Summarize results for each step:
- Type check: pass/fail (number of errors)
- Lint: pass/fail (number of warnings/errors)
- Tests: pass/fail (passed/failed/skipped counts)
- Build: pass/fail (bundle size)

If any step fails, analyze the errors and suggest fixes. Offer to auto-fix if the issues are straightforward.
