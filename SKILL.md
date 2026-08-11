---
name: design-system-story-driven
title: Design System — Story-Driven Portfolio
summary: |
  A reusable skill that captures a narrative-first, cinematic design workflow
  for building premium-minimalist portfolios and landing pages. Focuses on
  design tokens, typography roles, layered backgrounds, grid discipline,
  and purposeful motion.
scope: workspace
triggers:
  - "create design system"
  - "build cinematic hero"
  - "generate portfolio section"
uses:
  - "Skills.md"
version: 0.1.0
---

## Purpose

Provide a repeatable, checklist-driven workflow for producing narrative-first
UI designs and exportable implementation artifacts (CSS tokens, component
templates, responsive grid). Ideal as a guide for designers and front-end
implementers working in this repository.

## When to use

- Starting a new portfolio or landing page.
- Converting design mockups into code components.
- Creating a cinematic hero or section-based story flow.

## Step-by-step workflow

1. Define story and scope: establish the narrative and primary sections.
2. Build design tokens: colors, typography roles, spacing scale, borders,
   animation timing.
3. Establish typography roles: `Display`, `Monospace`, `Body` (sizes/weights).
4. Create responsive grid: columns, gutters, and breakpoint rules.
5. Layer visuals: background color → noise → scanlines → gradient → tint
   → grid → masks → lighting.
6. Design modular sections: hero, dossier, experience, skills, testimonials,
   contact — each with label, title, metadata, content block.
7. Add purposeful motion: loading, reveals, scan sweeps, hover transitions.
8. Accessibility & polish: contrast, keyboard focus, reduced-motion support.
9. Export artifacts: `:root` CSS tokens, component snippets, usage notes.

## Decision points

- Use of video vs. static layered background.
- Accent color: single green accent or alternate palette.
- Motion intensity and reduced-motion fallback.
- Grid density (2-column vs 3-column) per breakpoint.

## Completion criteria (quality checks)

- Design tokens are defined and committed to a CSS file.
- Typography roles implemented and demonstrated in components.
- Hero occupies full viewport with clear title + minimal text.
- Layered effects present but performant (no large media-bytes).
- Animations have meaningful purpose, with `prefers-reduced-motion`.
- Responsive behavior verified across breakpoints.

## Example prompts

- "Create CSS design tokens for this project following the skill."
- "Scaffold a cinematic hero section using the tokens and a video bg."
- "Export a 3-step responsive grid and example card component."

## Ambiguities / Questions (please confirm)

- Preferred accent color hex? (default: `#6EE7B7` suggested)
- Primary display font choice (name or variable).
- Target breakpoints (mobile/tablet/desktop widths).
- Should hero use a video background from `/assets/`?

## Related customizations

- Generate `tokens.css` and import into `styles.css`.
- Add component templates in `src/` (e.g., `Hero.jsx`, `Section.jsx`).
- Create animation utility classes with `prefers-reduced-motion` rules.

## Example output files

- `styles/tokens.css` — CSS variables for colors & spacing
- `src/components/Hero.jsx` — hero scaffold
- `design/section-checklist.md` — per-section QA checklist

## Notes

Keep the palette restrained and interactions predictable. The skill is
workspace-scoped — adapt tokens and components to project conventions.

---
