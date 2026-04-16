# Redesign: Apply "The Academic Architecture" Design System

## Background

The project currently uses a **children's learning app** aesthetic — Fredoka/Nunito fonts, playful purple/pink/orange gradients, fun-card layouts. The `DESIGN.md` spec and the two reference HTML files (`index.html`, `course-detail.html`) define a completely different system: **"The Academic Architecture"** — a sophisticated, editorial LMS look with Royal Blue + Burnt Orange, Manrope/Inter typography, glassmorphism nav, and Material Symbols icons.

The task is to migrate the React/Vite project's design system to match the reference templates.

---

## User Review Required

> [!IMPORTANT]
> This is a **full visual redesign** of every page. Existing component logic (data fetching, routing, auth) will NOT change — only styles, fonts, colors, and component visual structure will be updated.

> [!WARNING]
> The reference templates use **Tailwind CSS** with a custom color palette (direct hex tokens like `text-primary`, `bg-surface-container-low`). The existing project uses shadcn/ui CSS variables. The plan bridges both: we extend `tailwind.config.ts` with the new Academic Architecture color tokens while keeping shadcn variables functional.

---

## Proposed Changes

### 1. Design Tokens & Global CSS

#### [MODIFY] [index.css](file:///Users/mrmuzma/Documents/WELBON/git/ClaudeCode/ryuzuno/src/index.css)
- Replace `Fredoka`/`Nunito` Google Font import → `Manrope` + `Inter`
- Replace all CSS variables: `--primary`, `--background`, `--foreground`, etc. to match the Academic Architecture palette (Royal Blue `#003d9b`, surface tokens, tertiary orange `#693600`)
- Add `.signature-gradient`, `.hero-gradient` utility classes
- Add Material Symbols Outlined font import

#### [MODIFY] [tailwind.config.ts](file:///Users/mrmuzma/Documents/WELBON/git/ClaudeCode/ryuzuno/tailwind.config.ts)
- Update `fontFamily` → `headline: Manrope`, `body: Inter`
- Add all Academic Architecture color tokens as flat Tailwind colors (e.g. `surface`, `surface-container-low`, `on-surface`, `primary`, `tertiary`, `outline-variant`, etc.) matching the reference templates exactly
- Update `borderRadius` defaults to `DEFAULT: 0.5rem`, `lg: 1rem`, `xl: 1.5rem`
- Keep existing keyframes/animations (accordion, float) — remove `pulse-glow` purple

---

### 2. Shared Components

#### [MODIFY] [Navbar.tsx](file:///Users/mrmuzma/Documents/WELBON/git/ClaudeCode/ryuzuno/src/components/Navbar.tsx)
- Glass nav: `bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50`
- Logo: `font-headline font-extrabold text-primary text-2xl`
- Nav links: `font-headline font-bold text-on-surface-variant hover:text-primary`
- Search bar: pill-shaped `bg-surface-container-low rounded-full`
- Action icons: Material Symbols Outlined (notifications, cart)
- Replace playful toggle/avatar styles

#### [MODIFY] [Footer.tsx](file:///Users/mrmuzma/Documents/WELBON/git/ClaudeCode/ryuzuno/src/components/Footer.tsx)
- `bg-white border-t border-outline-variant/10`
- Footer links: `text-on-surface-variant hover:text-tertiary` uppercase tracking
- Brand: `font-headline font-black text-primary uppercase tracking-widest`

#### [MODIFY] [CourseCard.tsx](file:///Users/mrmuzma/Documents/WELBON/git/ClaudeCode/ryuzuno/src/components/CourseCard.tsx)
- Card: `bg-surface-container-lowest rounded-xl border border-outline-variant/5 hover:shadow-md`
- No border separators inside card — use 24px gaps
- Category badge: `bg-white/90 backdrop-blur rounded-full text-primary font-bold`
- "Enroll Now" text: `text-primary font-bold`
- Rating icon: `text-tertiary` (orange)

---

### 3. Pages

#### [MODIFY] [Index.tsx](file:///Users/mrmuzma/Documents/WELBON/git/ClaudeCode/ryuzuno/src/pages/Index.tsx)
- Hero: `bg-surface text-on-surface`, large `font-headline` h1
- Signature gradient CTA button
- Featured courses section on `bg-surface-container-low`
- Tech stack marquee section: grayscale → color on hover
- Focus CTA section: `signature-gradient` full-bleed rounded card

#### [MODIFY] [CourseDetail.tsx](file:///Users/mrmuzma/Documents/WELBON/git/ClaudeCode/ryuzuno/src/pages/CourseDetail.tsx)
- Hero: `hero-gradient text-white` with breadcrumb, stars, enrollment CTA
- Sticky tab nav: `bg-white/90 backdrop-blur-md`
- Course overview: `bg-surface-container-lowest` card with ghost border
- Curriculum accordion: white cards, `tertiary` module labels
- Sidebar: sticky purchase card with price + "Enroll Now"

#### [MODIFY] [Catalog.tsx](file:///Users/mrmuzma/Documents/WELBON/git/ClaudeCode/ryuzuno/src/pages/Catalog.tsx)
- `bg-surface-container-low` background section
- Filter sidebar on left with surface tonal hierarchy
- Cards grid using updated `CourseCard`

#### [MODIFY] [Login.tsx](file:///Users/mrmuzma/Documents/WELBON/git/ClaudeCode/ryuzuno/src/pages/Login.tsx) / [Register.tsx](file:///Users/mrmuzma/Documents/WELBON/git/ClaudeCode/ryuzuno/src/pages/Register.tsx)
- `bg-surface` page background
- Form card: `bg-surface-container-lowest` with signature gradient header strip
- Input fields: `bg-surface-container-lowest` with `focus:border-primary` 2px

#### [MODIFY] Other pages (Cart, Checkout, Leaderboard, LearningPaths etc.)
- Apply surface hierarchy tokens, typography, and button styles consistently

---

## Verification Plan

### Automated Tests
- Run `npm run dev` (or `bun dev`) and verify the dev server starts without errors
- Open browser to confirm visual changes match reference templates

### Manual Verification
- Check Navbar glassmorphism effect
- Check Hero gradient on Index and CourseDetail
- Check card styles match the reference `index.html`
- Check typography: Manrope headlines, Inter body
- Check tertiary orange on star ratings and module badges
