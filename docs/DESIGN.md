# Design System Specification: The Academic Architecture

> **Implementation Status (April 2026):** This design spec is fully implemented in the frontend.  
> All tokens live in `app/globals.css` under `@theme`. Components follow the No-Line Rule, Glass & Gradient Rule, and 44px hit target requirement throughout.

---

## Implementation Checklist

| Spec Rule | Status | Where |
|---|---|---|
| `@theme` color tokens | ✅ | `app/globals.css` |
| Manrope (headline) + Inter (body) | ✅ | `app/layout.tsx` via `next/font` |
| Material Symbols Outlined | ✅ | `app/layout.tsx` `<link>` |
| No-Line Rule (tonal transitions) | ✅ | All pages — surface hierarchy via bg tokens |
| Ghost Border at 15% opacity | ✅ | `border-outline-variant/15` throughout |
| Glass & Gradient nav | ✅ | `lesson-nav-bar.tsx` — `backdrop-blur-xl` |
| Signature Gradient | ✅ | `.signature-gradient`, `.hero-gradient` in globals.css |
| 44px hit targets | ✅ | Buttons use `px-6 py-3` minimum |
| Surface hierarchy (4 levels) | ✅ | `surface` → `surface-container-low` → `surface-container-lowest` |
| Tertiary orange — "Aha!" moments | ✅ | Project badges, project page banner, tertiary text |
| Secondary slate blue | ✅ | Quiz badges, quiz page banner |
| Collapsible sidebar | ✅ | `curriculum-sidebar.tsx` — `w-12` collapsed / `w-72` expanded |
| Progress bar (sidebar) | ✅ | Horizontal in expanded, vertical in collapsed |

---

## 1. Overview & Creative North Star
**Creative North Star: "The Digital Curator"**

This design system rejects the cluttered, "dashboard-heavy" aesthetics of traditional LMS platforms. Instead, it adopts the persona of a high-end digital curator: sophisticated, authoritative, yet radically clear. The goal is to transform technical e-learning into an editorial experience. 

We achieve a "Modern Campus" feel by breaking the rigid, boxed-in layouts of standard SaaS products. We use **intentional asymmetry**, allowing wide gutters and "breathing room" to guide the eye. By layering semi-transparent surfaces and utilizing high-contrast typography, we create a sense of intellectual clarity. The interface doesn't just hold content; it frames it as something valuable and permanent.

---

## 2. Colors & Surface Philosophy
The palette is rooted in a high-contrast relationship between deep Royal Blue and energetic Burnt Orange, set against a pristine, expansive background.

### The "No-Line" Rule
**Strict Mandate:** Prohibit the use of 1px solid borders for sectioning or containment. 
Structure is defined through **Tonal Transitions**. To separate the sidebar from the main content, or a lesson module from the background, shift the surface token (e.g., placing a `surface-container-low` panel against a `surface` background). This creates a seamless, "molded" look rather than a fragmented one.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of premium cardstock.
*   **Base Layer:** `surface` (#faf8ff) – The expansive canvas.
*   **Secondary Content:** `surface-container-low` (#f3f3fd) – Used for large architectural blocks (sidebars, secondary rails).
*   **Active Workspaces:** `surface-container-lowest` (#ffffff) – The highest "brightness" reserved for the primary focus area, like a code editor or reading pane.
*   **Elevated Details:** `surface-container-high` (#e7e7f2) – Used for interactive modules nested within a container.

### The "Glass & Gradient" Rule
To elevate the "SaaS-like" feel, use **Glassmorphism** for floating navigation bars or contextual overlays. Use `surface` at 80% opacity with a `20px` backdrop-blur. 
For primary CTAs and Hero backgrounds, apply a **Signature Gradient**: Linear 135° from `primary` (#003d9b) to `primary-container` (#0052cc). This provides a "soul" to the technical environment, preventing it from feeling sterile.

---

## 3. Typography: The Editorial Scale
We utilize a pairing of **Manrope** for high-impact display moments and **Inter** for rigorous technical reading.

*   **Display (Manrope):** Large, bold, and authoritative. Use `display-lg` (3.5rem) for landing page headers and `headline-md` (1.75rem) for course titles. The wide tracking and geometric shapes of Manrope signal modern academia.
*   **Body & Technical (Inter):** Inter is the workhorse. Use `body-lg` (1rem) for primary course content to ensure maximum legibility. 
*   **Labels & Metadata:** Use `label-md` (0.75rem) with `on-surface-variant` (#434654). 

**Hierarchy Tip:** Never rely on size alone. Use the contrast between `primary` text for headings and `on-surface-variant` for sub-text to create a clear "read-first, read-second" flow.

---

## 4. Elevation & Depth
Depth in this system is achieved through light and atmospheric layering, not heavy shadows.

*   **The Layering Principle:** A `surface-container-lowest` card sitting on a `surface-container-low` background creates a "Soft Lift." This is our preferred method for organizing dashboard widgets.
*   **Ambient Shadows:** For floating elements (Modals, Popovers), use an extra-diffused shadow:
    *   `box-shadow: 0 12px 40px rgba(0, 61, 155, 0.06);` (Note the 6% opacity tinted with our Primary Blue).
*   **The "Ghost Border" Fallback:** If a divider is essential for accessibility, use `outline-variant` (#c3c6d6) at **15% opacity**. It should be felt, not seen.
*   **Corner Radii:** 
    *   **Standard Components:** `DEFAULT` (8px / 0.5rem) for inputs and small cards.
    *   **Container Modules:** `lg` (16px / 1rem) for large content blocks.

---

## 5. Components

### Buttons
*   **Primary:** Gradient-filled (Primary to Primary-Container), white text, `0.5rem` radius. On hover, increase the gradient intensity.
*   **Secondary:** `surface-container-high` background with `on-primary-fixed-variant` (#0040a2) text. No border.
*   **Tertiary:** Ghost style. No background, `primary` text. Use for low-priority actions like "Cancel."

### Input Fields
*   **Structure:** Background `surface-container-lowest`. 
*   **State:** On focus, the "Ghost Border" becomes a 2px `primary` border. Use `tertiary` (#693600 - Orange) for the cursor/caret to add a spark of energy.

### Cards & Learning Modules
*   **Execution:** Forbid 1px dividers. Separate the "Course Title" from "Course Progress" using a 24px vertical gap or a subtle shift from `surface-container-lowest` to `surface-container-low` within the card.

### Additional Signature Components
*   **Progress Orbs:** Instead of flat bars, use a large, semi-transparent circular stroke in `primary` with a `tertiary` (Orange) accent for the completion percentage.
*   **The "Focus Mode" Toggle:** A glassmorphic overlay that dims the `surface` and highlights only the `surface-container-lowest` workspace.

---

## 6. Do's and Don'ts

### Do:
*   **Do** use asymmetrical margins. A lesson sidebar might be 300px, while the right-side gutter is 100px, creating an editorial feel.
*   **Do** use "energetic orange" (`tertiary`) sparingly for "Aha!" moments: progress completion, notifications, or callouts.
*   **Do** ensure all interactive elements have a minimum `44px` hit target, maintaining the "spacious" requirement.

### Don't:
*   **Don't** use pure black (#000000). Use `on-surface` (#191b23) for all high-contrast text.
*   **Don't** use lines to separate list items. Use 12px of vertical padding and a hover state background shift to `surface-container-high`.
*   **Don't** crowd the screen. If a page feels full, increase the `surface` padding. This system relies on white space to signify "premium" quality.