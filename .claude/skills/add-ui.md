# Skill: /add-ui

Add a shadcn/ui component to the RYUZUNO project.

## Arguments

- `<component-name>` (required): The shadcn/ui component name (e.g., `calendar`, `data-table`, `combobox`)

## Instructions

1. Run `npx shadcn@latest add <component-name>` to install the component
2. If the component has additional dependencies, install them
3. Confirm the component was added to `src/components/ui/`
4. Show a brief usage example tailored to this project

### Available components reference

Common shadcn/ui components: accordion, alert, alert-dialog, aspect-ratio, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, combobox, command, context-menu, data-table, date-picker, dialog, drawer, dropdown-menu, form, hover-card, input, input-otp, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, skeleton, slider, sonner, switch, table, tabs, textarea, toast, toggle, toggle-group, tooltip

### Notes

- This project uses the "default" style with "slate" base color
- CSS variables are enabled for theming
- Components are installed to `src/components/ui/`
