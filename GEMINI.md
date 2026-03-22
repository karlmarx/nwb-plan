# GEMINI.md - NWB Workout Plan

This document provides foundational context and development guidelines for the **NWB Workout Plan** project.

## Project Overview

The **NWB Workout Plan** is a Progressive Web App (PWA) designed as a specialized training protocol for individuals with non-weight-bearing (NWB) restrictions (specifically tailored for injuries like femoral neck stress fractures and L4-L5 degenerative disc disease).

### Core Technologies
- **Runtime:** Static Web (HTML/JS/CSS)
- **Framework:** React 18.2 (loaded via CDN)
- **Architecture:** Single-file Single Page Application (SPA).
- **Styling:** Inline JavaScript styles with a centralized color palette.
- **PWA:** Service Worker (`sw.js`) and Web App Manifest (`manifest.json`) for offline-capable, standalone mobile use.
- **Deployment:** Vercel (Auto-deploy on push to `main`).

## Development Guidelines

### 1. No-Build Architecture
This project intentionally avoids build tools, bundlers, and transpilers.
- **No JSX:** All React components must use `React.createElement` (aliased as `const e = React.createElement`).
- **No Imports/Modules:** Dependencies are loaded via CDN `<script>` tags in `index.html`.
- **Single File:** The entire application logic, data, and styling reside in `index.html`.

### 2. Coding Conventions
- **Component Pattern:** Use stateless sub-components (functions) to minimize complexity and avoid common React mounting errors in this environment.
- **Data-Driven:** The UI is heavily driven by large constants:
    - `EX`: The master exercise database with setup, execution, and safety cues.
    - `WORKOUTS`: Definitions of Push/Pull/Legs/Recovery routines.
    - `EQUIPMENT`: Registry of available gym gear.
- **State Management:** Centralized `useState` hooks in the main `App` component.
- **Styling:** Use the `C` constant for all colors to maintain theme consistency (Dark Mode).

### 3. PWA & Offline Support
- Any new assets (icons, scripts) must be added to the `filesToCache` array in `sw.js`.
- The app is designed for "Standalone" display mode on mobile devices.

## Building and Running

### Local Development
Since there is no build step, you can run the project using any static file server:
```bash
# Using npx (Node.js)
npx serve .

# Using Python
python -m http.server 8080
```
Or simply open `index.html` directly in a browser.

### Testing and Validation
- **Manual Testing:** Open in Chrome DevTools using "Responsive" mode (target: Mobile) to verify the layout.
- **PWA Validation:** Use the Lighthouse tab in Chrome DevTools to audit the manifest and service worker.
- **Automated Testing:** No traditional test suite is configured. (Note: `.playwright-mcp` is present but appears used for external automation).

### Deployment
Deployment is handled automatically by Vercel:
- **Production:** Push to the `main` branch.
- **Build Command:** None (Leave empty).
- **Output Directory:** `.` (Root).

## Key Files
- `index.html`: The entire application (Logic, UI, Data, Styles).
- `manifest.json`: PWA configuration.
- `sw.js`: Service Worker for offline caching.
- `vercel.json`: Deployment configuration for Vercel.
- `CLAUDE.md`: Additional development notes for AI assistants.
