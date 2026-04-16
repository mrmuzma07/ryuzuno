# Skill: /new-component

Scaffold a new reusable React component for the RYUZUNO project.

## Arguments

- `<ComponentName>` (required): PascalCase name (e.g., `CourseFilter`)
- `--dir <subdirectory>`: Optional subdirectory under `src/components/` (e.g., `lesson`, `teacher`)

## Instructions

Follow the existing project patterns (CourseCard.tsx, Navbar.tsx):

### 1. Create the component file

- Default location: `src/components/<ComponentName>.tsx`
- With --dir: `src/components/<dir>/<ComponentName>.tsx`

### 2. Component structure

```tsx
interface ComponentNameProps {
  // Define props with TypeScript interface
}

const ComponentName = ({ ...props }: ComponentNameProps) => {
  return (
    <div>
      {/* Component content */}
    </div>
  );
};

export default ComponentName;
```

### 3. Guidelines

- Use `@/components/ui/*` for shadcn/ui primitives (Button, Card, Input, etc.)
- Use `lucide-react` for icons
- Use Tailwind CSS classes for styling (no inline styles)
- Use `cn()` from `@/lib/utils` for conditional class merging
- Import path alias: `@/` maps to `src/`
- Always define a TypeScript `interface` for props
- Use default export (not named export)
