# Skill: /review-code

Review code changes for RYUZUNO project standards and best practices.

## Arguments

- No args: review all uncommitted changes (`git diff`)
- `<file>`: review a specific file
- `--staged`: review only staged changes

## Instructions

### 1. Get the changes

- No args: run `git diff` and `git diff --cached`
- File specified: read the file
- --staged: run `git diff --cached`

### 2. Review checklist

Check each change against these project standards:

**TypeScript & React**
- Props defined with TypeScript `interface` (not `type`)
- Components use default export
- Hooks follow `use` prefix convention
- No `any` types (use proper Supabase types from `@/integrations/supabase/types`)

**Styling**
- Tailwind CSS only (no inline styles, no CSS modules)
- Responsive design considered (mobile-first)
- Dark mode support using CSS variables (not hardcoded colors)
- Use `cn()` from `@/lib/utils` for conditional classes

**Data Fetching**
- Use `@tanstack/react-query` for server state
- Use `supabase` client from `@/integrations/supabase/client`
- Handle loading and error states
- Use `sonner` toast for user notifications

**Imports**
- Use `@/` path alias (not relative `../`)
- UI components from `@/components/ui/*`
- Icons from `lucide-react`

**Security**
- No sensitive data hardcoded
- Supabase RLS relied upon for authorization
- User input validated with Zod when applicable

### 3. Report

Provide a summary with:
- Issues found (categorized by severity: error/warning/info)
- Specific file and line references
- Suggested fixes for each issue
