# RyuZuno Data Flow Design

## 1. Overview
This document describes the data flow in the RyuZuno e-learning platform, from user interaction in the frontend to data storage and retrieval in the backend and database.

## 2. Data Flow Diagram

```
[User]
  |
  v
[Frontend (React SPA)]
  |
  |  (API calls via Supabase JS)
  v
[Supabase Backend (Auth, Storage, RPC)]
  |
  |  (SQL queries, triggers)
  v
[PostgreSQL Database]
```

## 3. Main Data Flows

### 3.1 Authentication
- User logs in/registers via frontend form.
- Credentials sent to Supabase Auth API.
- On success, JWT token is returned and stored in browser (localStorage/cookie).
- AuthContext in frontend manages user session and provides user info to components.

### 3.2 Fetching Data (e.g., Courses, Lessons)
- Frontend uses React Query to call Supabase client (REST/RPC) for data (e.g., list of courses).
- Supabase validates JWT, applies Row Level Security (RLS) policies.
- Data is fetched from PostgreSQL and returned to frontend.
- Components render data (e.g., course catalog, lesson content).

### 3.3 User Actions (e.g., Enroll, Submit Assignment)
- User triggers an action (e.g., enroll in course, submit quiz/assignment).
- Frontend sends request to Supabase (insert/update row in relevant table).
- Supabase validates permissions, updates database.
- On success, UI updates (e.g., enrollment status, progress bar).

### 3.4 Progress Tracking
- As user completes lessons/quizzes, frontend updates progress via Supabase (e.g., insert/update `lesson_progress`).
- Backend may trigger additional logic (e.g., award XP, unlock badge).
- Progress and achievements are fetched and displayed in dashboard/leaderboard.

### 3.5 Teacher/Admin Actions
- Teachers create/edit courses, lessons, quizzes via dashboard forms.
- Data is sent to Supabase and stored in relevant tables.
- Moderators/admins review content, manage users, etc.

### 3.6 E-Commerce (Checkout)
- User initiates checkout for a paid course.
- Frontend sends order data to Supabase (creates `orders` row).
- Payment processing (if integrated) updates order status.
- On success, user is enrolled and gains access to course content.

## 4. Data Consistency & Security
- All data access is protected by Supabase RLS and JWT-based auth.
- Only authorized users can read/write their own data (e.g., progress, submissions).
- Teachers/admins have elevated permissions for content management.

## 5. Technologies Involved
- **Frontend**: React, React Query, Context API
- **API Layer**: Supabase JS client (REST/RPC)
- **Backend**: Supabase (Auth, Storage, Functions)
- **Database**: PostgreSQL (27+ tables, RLS, triggers)

## 6. Example Data Flow: Submitting a Quiz
1. Student answers quiz in frontend.
2. On submit, answers are sent to Supabase (`quiz_attempts`, `quiz_questions` tables).
3. Supabase validates user and stores attempt.
4. Backend may auto-grade and update score.
5. Frontend fetches result and displays feedback to student.

---

For more details, see `ARCHITECTURE.md` and `PRD.md`.
