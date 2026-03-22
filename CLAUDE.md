# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NWB Workout Plan — a PWA for MRI-adjusted non-weight-bearing Push/Pull/Legs training protocol. Pure static site deployed on Vercel with no build step.

## Development

No build tools, bundler, or package manager needed. The entire app is a single `index.html` file using React 18.2 from CDN (no JSX — uses `React.createElement` directly).

- **Run locally:** Open `index.html` in a browser, or use any static file server
- **Deploy:** Push to `main` — Vercel auto-deploys (no build command, output directory is root)
- **No tests, linter, or type checking configured**

## Architecture

Single-file SPA (`index.html`, ~838 lines) with everything inline:

- **React components** defined as plain functions using `React.createElement` (aliased as `e()`)
- **Stateless sub-components:** `Badge`, `Section` (collapsible), `ExRow` (exercise row with expandable details), `Callout`, `EqTable`
- **Main `App` component:** Tab-based UI (Schedule, Workouts, Cardio, Core, Equipment, Safety) with state for active tab, phase selection, open sections, and expanded exercises
- **Data constants:** `PHASES` (3 progression phases), `SCHED` (6-day PPL calendar), `EX_DETAILS` (exercise descriptions with setup/execution/safety cues)
- **Styling:** Inline JS style objects with a centralized color palette constant `C`
- **Dark theme** throughout, designed for mobile/gym use

## PWA

- `sw.js` — service worker with cache-first strategy (cache name `nwb-plan-v1`)
- `manifest.json` — standalone mode, dark theme, maskable icons
- Cached assets: `index.html`, `manifest.json`, icons

## Key Constraints

- No JSX — all components use `React.createElement` (abbreviated as `e`)
- React and ReactDOM loaded from CDN `<script>` tags — no imports/modules
- All state management uses `React.useState` hooks in the App component
- Sub-components are stateless to avoid React Error 310 (see commit 42e438b)
