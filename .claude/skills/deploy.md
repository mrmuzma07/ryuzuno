# Skill: /deploy

Build and prepare the RYUZUNO project for deployment.

## Instructions

### 1. Pre-deploy checks

Run the full quality pipeline first:
- TypeScript check: `npx tsc --noEmit`
- Lint: `npm run lint`
- Tests: `npm run test`
- If any check fails, report the errors and stop

### 2. Production build

```bash
npm run build
```

### 3. Preview locally

```bash
npm run preview
```

Report the preview URL for the user to verify before deploying.

### 4. Build report

- Total bundle size
- Number of chunks
- Any warnings from the build
- Confirm the `dist/` directory is ready for deployment

### 5. Deployment notes

Remind the user:
- Ensure environment variables are set on the hosting platform:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`
- The `dist/` folder contains the static files to deploy
- SPA routing requires server-side redirect config (all routes -> index.html)
