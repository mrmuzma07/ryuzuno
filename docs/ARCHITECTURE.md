# RyuZuno Architecture Design

## 1. Overview
RyuZuno is a modern e-learning platform with gamification, built using React, TypeScript, Vite, Tailwind CSS, and Supabase (PostgreSQL). It targets students, teachers, moderators, and admins, aiming to make learning engaging through badges, XP, leaderboards, and structured learning paths.

## 2. High-Level Architecture

```
+-------------------+        +-------------------+        +-------------------+
|    Frontend (FE)  | <----> |    Backend (BaaS) | <----> |     Database      |
| React, Vite, TS   |  API   | Supabase (Auth,   |  SQL   | PostgreSQL        |
| Tailwind, shadcn  |        | Storage, RPC)     |        |                   |
+-------------------+        +-------------------+        +-------------------+
```

- **Frontend**: SPA using React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query, React Router, TipTap (editor), Recharts (charts).
- **Backend**: Supabase (BaaS) for authentication, storage, and database access. Custom logic via Supabase functions.
- **Database**: PostgreSQL with 27+ tables for users, courses, lessons, quizzes, assignments, gamification, e-commerce, etc.

## 3. Folder Structure

- `src/components/` — Reusable UI components (Navbar, Footer, CourseCard, etc.)
- `src/pages/` — Page-level components (Catalog, CourseDetail, Dashboard, etc.)
- `src/contexts/` — React Contexts (e.g., AuthContext)
- `src/hooks/` — Custom React hooks
- `src/integrations/supabase/` — Supabase client and helpers
- `src/lib/` — Utilities and mock data
- `src/pages/dashboard/` — Dashboard pages (CoursePlayer, TeacherCourseForm, etc.)
- `public/` — Static assets
- `supabase/` — Supabase config, functions, migrations
- `docs/` — Documentation (PRD, DESIGN, ROADMAP, implementation plan)

## 4. Main Components

- **Navbar, Footer**: Global navigation and branding
- **CourseCard**: Course preview in catalog
- **DashboardLayout**: Layout for authenticated dashboard
- **Lesson Components**: Assignment, Quiz, Coding Exercise, Attachments
- **Teacher Components**: Course/Lesson forms
- **UI Components**: Accordion, Button, Card, etc. (shadcn/ui)

## 5. Data Flow

- **Auth**: Supabase Auth manages user sessions (JWT). AuthContext provides user state to FE.
- **Data Fetching**: React Query fetches data from Supabase (REST/RPC). Pages/components subscribe to queries.
- **State**: Local state via React hooks; global state (auth, cart) via Context.
- **Routing**: React Router v6 for navigation.
- **Forms**: Controlled React forms, validated client-side, submitted to Supabase.

## 6. Database Design (Simplified)

- **User & Auth**: `profiles`, `user_roles`
- **Courses & Content**: `courses`, `categories`, `sections`, `lessons`, `lesson_attachments`
- **Learning Features**: `quizzes`, `quiz_questions`, `quiz_attempts`, `assignments`, `assignment_submissions`, `coding_exercises`, `coding_submissions`
- **Enrollment & Progress**: `enrollments`, `lesson_progress`
- **Gamification**: `badges`, `xp_points`, `leaderboard`
- **E-Commerce**: `orders`, `transactions`
- **Review & Moderation**: `reviews`, `moderation_logs`

## 7. Design System

- **Typography**: Manrope (headline), Inter (body)
- **Color Palette**: Royal Blue, Burnt Orange, surface tokens
- **Component Style**: Glassmorphism, Material Symbols, responsive, accessible
- **Reference**: See `DESIGN.md` and reference HTML files for visual spec

## 8. Dependencies

- React, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query, Supabase JS, TipTap, Recharts, React Router

## 9. Development Phases

1. **Foundation**: Setup, auth, landing, catalog, course detail
2. **Student**: Dashboard, course player, enrollment
3. **Teacher**: Dashboard, course builder
4. **Learning Paths & Gamification**: Badges, leaderboard
5. **Admin/Moderator**: Dashboards, review tools
6. **E-Commerce**: Checkout, transactions

---

For more details, see `docs/PRD.md`, `docs/DESIGN.md`, and `docs/ROADMAP.md`.
