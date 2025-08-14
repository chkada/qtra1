# UI Redesign — AI Execution Rules & Workflow

> **Purpose:** Rules for the AI assistant to follow when executing the UI redesign plan for Qindil. These make the process repeatable, auditable, and safe for collaboration with human reviewers.

---

## 1. General Principles (must-follow)

- **Ask first:** Before executing any sub-task, the AI **must** ask all clarifying questions and request any missing documents or screenshots. Do not start work until the user answers.
- **One sub-task at a time:** Never start the next sub-task until the user explicitly answers `yes` or `y` to proceed.
- **Be explicit:** Each change must reference a single sub-task id (e.g., `2.1`, `3.2`) in the commit message and PR.
- **No feature work:** This redesign only changes visuals (colors, shapes, icons, spacing, animations). No new features unless explicitly authorized.
- **Use approved libraries:** 
  - Icons: **Lucide**  
  - Animations: **Framer Motion**  
  - Illustrations: **Undraw**

---

## 2. Branding colors (embed in every style change)

Use these hex values exactly in Tailwind config and CSS variables:

- **Golden Glow** — `#FFD166`  
- **Aguirre Sky** — `#118AB2`  
- **Warm Beige** — `#E8DAB2`  
- **Sunrise Orange** — `#EF476F`  

(If you have an alternate official palette, provide it now — do not proceed until confirmed.)

---

## 3. Task / Sub-task Protocol

- **Parent tasks** are `1.0, 2.0, ...`.  
- **Sub-tasks** are numbered `1.1, 1.2, 2.1, ...`.  
- **Start**: AI posts the parent task list (phase 1). Wait for user `Go`.  
- **Execute**: For each sub-task:
  1. Ask any clarifying questions (if needed).
  2. Wait for user `yes` or `y`.
  3. Implement the change in a dedicated branch.
  4. Run local checks (lint, tests, accessibility, visual diff).
  5. Commit with the required message format.
  6. Push the branch and open a PR with screenshots & checklist.
  7. Mark the sub-task `[x]` only after PR is merged.
  8. Announce completion and ask to proceed to next sub-task.

---

## 4. Git / Branch / Commit / PR rules

- **Branch naming:** `feat/ui-redesign/<task-id>-short-description`  
  - Example: `feat/ui-redesign/2-1-button-styles`
- **Commit messages:** Use Conventional-style but include task id:
  - Format: `ui-redesign: <task-id> — <short description>`
  - Example: `ui-redesign: 2.1 — Implement primary and secondary button styles`
- **Commits per sub-task:** One or a few focused commits are okay, but final commit that closes the sub-task must reference the task id.
- **Push + PR:** Push branch and open a PR into the project's `dev` (or `main` if no dev branch) with:
  - Title: `UI Redesign — <task-id> <short desc>`
  - Description: short summary, link to task, checklist of acceptance criteria, before/after screenshots (see Visual QA).
  - Labels: `ui-redesign`, `needs-review`, `accessibility`
- **Merging:** Use **squash-and-merge** with a tidy commit message that references the task id and includes the PR link.
- **PR size:** Keep PRs small — ideally a single sub-task change. If a sub-task is large, split it into smaller sub-subtasks.

---

## 5. Commit checklist (must pass before opening PR)

Run and confirm these locally; add commands in PR description:

- [ ] `npm run lint` (or `npx eslint .`)
- [ ] `npm run format` (Prettier)
- [ ] `npm test` or `npx jest` (if test coverage exists)
- [ ] `npm run build` (or `next build`) — verify build succeeds
- [ ] Accessibility scan: `npx axe-core` or `npx pa11y <page-url>` (or `npm run a11y` if script exists)
- [ ] Visual QA: add before/after screenshots (desktop & mobile)
- [ ] Tailwind JIT compile check (no broken classes)
- [ ] Confirm no console errors in dev build

> If CI exists, reference the CI job URL and note test artifacts.

---

## 6. PR Content Requirements

Every PR must include:

- Task id and link to `ui-redesign.md` line(s) it implements.
- Short summary of change.
- Acceptance checklist (what to test).
- Before and after screenshots (desktop and mobile; recommended sizes: 1366×768 and 375×812).
- Accessibility notes (WCAG checks done + results).
- Performance note (bundle delta and lighthouse if available).
- Any new dependencies and rationale (e.g., `framer-motion` for motion).

---

## 7. Visual QA & Accessibility rules

- **Contrast:** All color combos used for text and UI must meet **WCAG 2.1 AA** text contrast ratios. Use an automated tool and list the results in PR.
- **Keyboard:** All interactive elements must be keyboard reachable; focus state must be visible.
- **Aria:** Use appropriate ARIA attributes for complex widgets.
- **RTL:** Verify `dir="rtl"` layout for Arabic—text alignment, icons mirroring, spacing.
- **Automated checks:** Run `axe-core` or pa11y and include scan report (or summary) with PR.
- **Manual checks:** Include manual verification steps in PR (e.g., check menu in RTL, check button focus ring).

---

## 8. Visual Diffing & Screenshots

- **Before/After**: For every visual change, include before/after PNGs (mobile + desktop).
- **Location:** Put temporary images in `public/ui-redesign/proof/<task-id>/before.png` and `.../after.png` OR attach them to the PR if repo size is a concern.
- **Optional Visual Diff Tool:** Recommend `reg-suit` or `pixelmatch` for future automated visual diffs.

---

## 9. Assets & Naming

- **New assets:** Add to `public/assets/ui-redesign/<YYYYMMDD>/<task-id>/`.
- **SVG icons:** Use Lucide icons as React components (avoid inline SVG duplication).
- **Illustrations:** Use Undraw SVGs, recolor with CSS variables when needed.
- **File names:** kebab-case with task id prefix, e.g., `2-1-primary-button.svg`.
- **Optimize:** Run `svgo` or `imageoptim` before committing assets.

---

## 10. Styling & Code conventions

- **Tailwind + CSS-in-JS:** Maintain Tailwind-first approach; use CSS-in-JS only where dynamic styles are needed.
- **Design tokens:** Register brand colors as CSS variables and Tailwind theme tokens in `tailwind.config.ts`. Example:
  ```js
  // tailwind.config.ts (example)
  theme: {
    extend: {
      colors: {
        golden: '#FFD166',
        aguirre: '#118AB2',
        beige: '#E8DAB2',
        sunrise: '#EF476F',
      }
    }
  }
  ```
- **Button component:** Centralize styles in `src/components/UI/Button.tsx`. All uses must import and use this component.
- **Spacing:** Use a 4px baseline grid (Tailwind spacing scale).
- **Typography:** Use Noto Sans for Arabic support (configure in `globals.css`/Tailwind).
- **No hardcoded colors:** Use tokens or tailwind classes only.

---

## 11. Animation & Motion rules

- **Framer Motion** usage rules:
  - Keep motion subtle — prefer `spring` or `tween` with low stiffness.
  - Use motion for micro-interactions: button presses, hover lift, modal transitions, subtle parallax.
  - Avoid layout-shifting heavy animations on page load.
  - Provide a reduced-motion flag: respect `prefers-reduced-motion` and expose a `reducedMotion` prop in components.

---

## 12. Tests & QA acceptance criteria (per sub-task)

Each sub-task’s PR must include an acceptance checklist similar to:

- [ ] Visual matches design reference (attach before/after)
- [ ] Colors are applied from design tokens exactly
- [ ] Buttons and links keyboard focusable and visible
- [ ] Accessibility scan passed (no critical violations)
- [ ] RTL layout verified for affected pages
- [ ] No JS console errors
- [ ] Build passes

Only after all boxes are checked and PR is merged should the sub-task be marked `[x]`.

---

## 13. Completion & Release notes

- When all sub-tasks for a parent task are merged, mark the parent task `[x]`.
- Prepare a short release note summarizing visual changes and any new dependencies.
- If deploying to staging, include a link to the staging preview in the release note.

---

## 14. Escalations & exceptions

- If a requested change requires a breaking structural change (affects data shape or feature logic), **stop** and ask the user for permission to proceed.
- If a change causes performance regression >10% (bundle size or lighthouse), propose alternatives and wait for approval.

---

## 15. Required pre-execution checks (AI must ask these before touching code)

Before performing any sub-task, the AI must confirm the answers to these with the user (or fetch the documents):

1. Which branch should be targeted for PRs? (default: `dev`)
2. Do you want the rule set saved to `/Tasks/ui-redesign.md` (replace) or `/Tasks/ui-redesign-rules.md` (new)?
3. Confirm the final brand hex values (list above) or provide replacements.
4. Are the package scripts available for:
   - `lint`, `format`, `test`, `build`, `a11y`? If not, permit the AI to add standard scripts to `package.json`.
5. Are there CI checks that must be satisfied (e.g., GitHub Actions)? If yes, provide the workflow names or repo access.
6. Confirm acceptance of the libraries:
   - `lucide-react`, `framer-motion`, `undraw` (or the Undraw SVGs). Are new dependencies allowed?
7. Do you prefer PR merges with **squash** or **merge commit**?
8. Provide any Figma screenshots or confirm the `Tasks/*.png` files are the definitive visual reference.

---

## Example PR title & commit examples

- **Branch:** `feat/ui-redesign/2-1-button-styles`  
- **Commit:** `ui-redesign: 2.1 — Implement primary and secondary button styles`  
- **PR title:** `UI Redesign — 2.1 Button styles (Golden Glow / Sunrise Orange)`  
- **PR description top lines:**  
  ```
  Implements sub-task 2.1 from /Tasks/ui-redesign.md.

  - Adds new Button component styles using Tailwind tokens.
  - Adds tests for button focus state.
  - Before/after images: public/ui-redesign/20250811/2-1-before.png, 2-1-after.png
  ```

---

### Final note
I will **not** modify the repo until you confirm the pre-execution checks above. The AI **must** ask these questions and receive explicit answers before proceeding with any code change.
