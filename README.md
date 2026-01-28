VertexED.ai is an all‑in‑one study hub aiming to make the process of education better for all.

## Overview

This project brings together AI assisted study utilities (notes, quiz, paper generator, answer reviewer, chatbot, study planner) in a single modern, accessible web app built with:

- React + TypeScript (Vite)
- Tailwind CSS with a small layer of custom design tokens (HSL variables) for dark/light theming
- Supabase (auth + data)
- Serverless / edge functions (API route scripts)

## Key Features (current focus)

- AI Note Taking & Quiz Generation
- Paper / Mock Exam Generator
- Study Planner (calendar + schedule + AI task suggestions)
- Answer Reviewer & Chatbot assistant

## Design Tokens & Theming

The UI relies on CSS custom properties defined globally (see `index.css`). Core tokens include:

```
--background
--foreground
--card
--primary
--accent
--border
```

Planner-specific styling now consumes ONLY these tokens (no hard‑coded hex colors) to ensure visual consistency with the rest of the app. Any additional color nuance (e.g. subtle gradients or glass effects) is derived using transparency (`background: hsl(var(--card) / 0.7)`) or layered shadows rather than introducing new brand colors.

## Study Planner Styling Guide

Files of interest:

- `src/pages/StudyPlanner.tsx` (page wrapper)
- `src/app/.../PlannerView.tsx` (main orchestrator – calendar, schedule, widgets, AI modal)
- `src/app/.../Calendar.tsx`
- `src/app/.../Schedule.tsx`
- `src/app/.../TimeLeftWidget.tsx`
- `planner.css` (theme-aligned custom rules – font, layout refinements, glass surfaces, focus rings)

### Fonts
The entire planner enforces the project primary font `"Sen", sans-serif`. If you add new interactive elements, rely on inheritance; only explicitly set the font where browser default widgets might override it.

### Layout Principles

- Responsive flex / grid wrappers (avoid fixed heights where possible)
- Intrinsic sizing for modals (AI Add Task popup auto-sizes to content)
- Consistent spacing scale (Tailwind `gap-*`, `p-*` utilities)
- Avoid magic numbers for vertical alignment; prefer flexbox centering

### Tasks & Time Slots

- Tasks are rendered as accessible interactive elements (`role="button"`, keyboard activation with Enter/Space)
- Font weight & contrast validated against dark background using token values
- Completed state handled via styling class (check `Schedule.tsx` for logic)

### Calendar

- Days are keyboard navigable (`tabIndex=0`)
- `aria-current="date"` applied to the selected day
- Focus ring uses `--primary` for consistent theming

### AI Add Task Modal

- Semantic dialog attributes: `role="dialog"`, `aria-modal="true"`
- Vertically centered via flex container on the viewport wrapper
- Advanced options appear in an auto-fit responsive grid

### Extending Styles

Keep additions token-driven:

```
/* Example: subtle elevated surface */
.planner-surface {
	background: hsl(var(--card) / 0.75);
	backdrop-filter: blur(12px) saturate(140%);
	box-shadow: 0 4px 10px -2px hsl(var(--background) / 0.6), 0 0 0 1px hsl(var(--border) / 0.4);
}
```

## Accessibility Enhancements

- Calendar & tasks fully keyboard operable
- Focus-visible outlines with sufficient contrast
- ARIA roles/labels for interactive and dialog elements
- Reduced motion friendly (animation kept subtle / removable)

When adding new components, ensure:

1. Keyboard navigation (Enter/Space activation, Escape to dismiss modals)
2. Meaningful `aria-label` or visible text
3. Focus trapping inside modals (if multiple new focusable elements introduced)

## Development

Install & run:

```
npm install
npm run dev
```

Build:

```
npm run build
```

## Contributing Notes

Styling Consistency Checklist:

- Use design tokens – never raw hex unless adding a new global variable
- Reuse shared utility classes or create a small, purposeful class (avoid deep nesting)
- Maintain font: `Sen` for all textual UI
- Provide focus styles (rely on `:focus-visible` + outline)
- Test dark mode contrast (use a contrast checker if introducing new combinations)

## Future Improvements (Ideas)

- Mobile-specific condensed planner layout
- Task categories / color coding via token hue shifts
- Animation preference toggle (reduced motion)
- Drag & drop task rescheduling

---

This document will evolve as new features/components are added. Feel free to extend sections with implementation details or architectural decisions.

✨✨😊😁
