# Copilot Instructions for Grid Button Selector

## Project Overview
- This is a Vite + React TypeScript project for a grid-based button selector UI, inspired by a Figma design (see README for link).
- Main UI logic is in `src/components/ClickableGrid.tsx` and `src/components/GridControls.tsx`.
- UI primitives and reusable components are in `src/components/ui/`.
- Styles are in `src/styles/globals.css` and `src/index.css`.

## Key Patterns & Conventions
- **Component Structure:**
  - Top-level app logic in `src/App.tsx`.
  - Grid configuration and controls in `GridControls.tsx` (handles width, height, and layer removal logic).
  - The grid display and interaction logic is in `ClickableGrid.tsx`.
- **State Management:**
  - State is managed locally in components and passed via props (no Redux or context API).
  - Example: `GridControls` receives and updates grid dimensions and layer removal count via props and callbacks.
- **UI Library:**
  - Custom UI primitives in `src/components/ui/` (e.g., `button.tsx`, `input.tsx`, `label.tsx`).
  - Use these for consistent styling and behavior.
- **Styling:**
  - Uses Tailwind CSS utility classes for layout and design.
  - Global styles in `src/styles/globals.css`.

## Developer Workflows
- **Install dependencies:** `npm i`
- **Start dev server:** `npm run dev`
- **No custom test/build scripts** beyond Vite defaults.
- **No backend or API integration**—all logic is client-side.

## Project-Specific Notes
- **Grid logic:**
  - Grid size is limited (min 1, max 20 for width/height).
  - "Layers to remove" is a special field with lock/unlock logic (see `GridControls.tsx`).
- **Figma reference:**
  - See README for the original design link for UI/UX intent.
- **No global state or routing**—all navigation and state are local.

## Examples
- To add a new UI primitive, place it in `src/components/ui/` and use Tailwind for styling.
- To change grid logic, update `ClickableGrid.tsx` and/or `GridControls.tsx`.

---
For more details, see `README.md` and the Figma link.
