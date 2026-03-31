# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NWB Workout Plan — a Next.js App Router PWA for MRI-adjusted non-weight-bearing Push/Pull/Legs training protocol. Deployed on Vercel at nwb-plan.vercel.app / nfit.93.fyi.

## Development

- **Run locally:** `npm run dev` (uses Turbopack)
- **Build:** `npm run build`
- **Deploy:** Push to `main` — Vercel auto-deploys
- **No tests configured yet**

## Architecture

Next.js 16 App Router with TypeScript and Tailwind CSS v4.

### Key directories
- `app/` — App Router pages and API routes
- `components/` — React client components
- `lib/` — Data, auth config, API clients
- `public/` — PWA assets (icons, manifest, service worker)

### Data flow
- Exercise data in `lib/exercises.ts` (typed, ~90KB)
- All UI state in `components/workout-view.tsx` (localStorage persistence)
- Auth via NextAuth v5 (`lib/auth.ts`, Google OAuth)
- AI suggestions via `/api/suggest` (Anthropic Claude, behind feature flag)

### Feature flags
- `NEXT_PUBLIC_FEATURE_AI_SUGGESTIONS` — enables AI suggestion system (default: false)

### Key components
- `workout-view.tsx` — Main app shell, all state, 6 tabs
- `exercise-row.tsx` — Exercise detail panel with safety cues
- `machine-selector.tsx` — Visual machine type picker (NEW)
- `nearby-picker.tsx` — Multi-select nearby equipment chips (NEW)
- `suggestion-card.tsx` — AI suggestion display (behind feature flag)
- `progress-clock.tsx` — 6-week program timer

## PWA

- `public/sw.js` — service worker with cache-first strategy
- `public/manifest.json` — standalone mode, dark theme
- Base workout fully offline; AI suggestions show offline indicator

## Key Constraints

- ZERO left leg weight bearing (femoral neck stress fracture)
- ZERO left iliopsoas activation (no left hip flexion against gravity)
- Hip flexion <90° both sides (bilateral FAI + labral tears)
- No swimming
- The AI system prompt in `app/api/suggest/system-prompt.ts` enforces all safety constraints
