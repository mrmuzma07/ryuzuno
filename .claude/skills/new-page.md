# Skill: /new-page

Scaffold a new page component and register its route in the RYUZUNO app.

## Arguments

- `<PageName>` (required): PascalCase name for the page (e.g., `AboutUs`)
- `<route>` (optional): URL path (e.g., `/about`). Defaults to lowercase page name.
- `--dashboard <role>`: Create as dashboard page under a role (student/teacher/admin/moderator)

## Instructions

Follow the existing project patterns exactly:

### 1. Create the page file

- **Public page**: Create `src/pages/<PageName>.tsx`
- **Dashboard page**: Create `src/pages/dashboard/<PageName>.tsx`

Use this pattern (matching existing pages like Index.tsx, Catalog.tsx):

```tsx
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PageName = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Page content */}
      </main>
      <Footer />
    </div>
  );
};

export default PageName;
```

For dashboard pages, use `DashboardLayout` instead of Navbar/Footer:

```tsx
import DashboardLayout from "@/components/DashboardLayout";

const PageName = () => {
  return (
    <DashboardLayout>
      {/* Page content */}
    </DashboardLayout>
  );
};

export default PageName;
```

### 2. Register the route in App.tsx

- Add the import at the top of `src/App.tsx` following the existing import grouping
- Add a `<Route>` inside `<Routes>` in the appropriate section:
  - Public pages: near other public routes
  - Dashboard pages: near the matching role's routes (student `/dashboard/*`, teacher `/teacher/*`, admin `/admin/*`, moderator `/moderator/*`)

### 3. Confirm

- Verify there are no TypeScript errors
- Report the new file path and route
