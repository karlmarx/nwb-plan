# CLAUDE.md — NWB Training Plan (Femur Fracture Fitness)

## What Is This

A PWA for non-weight-bearing (NWB) Push/Pull/Legs training protocol after a left femur stress fracture. Tracks workouts, supplements (left leg rehab + core), nutrition, and equipment availability.

NWB Workout Plan — a Next.js App Router PWA for MRI-adjusted non-weight-bearing Push/Pull/Legs training protocol. Deployed on Vercel at nfit.93.fyi.

## Development

- **Run locally:** `npm run dev` (uses Turbopack)
- **Build:** `npm run build`
- **Deploy:** Push to `main` — Vercel auto-deploys
- **E2E tests:** `npm run test:e2e` — 97 Playwright tests via Python/pytest in `e2e/`
- **CI:** GitHub Actions (`.github/workflows/playwright.yml`) runs on PRs to main; branch protection requires passing "Playwright Tests" check

## Architecture

Next.js 16 App Router with TypeScript and Tailwind CSS v4.

### Key directories
- `app/` — App Router pages and API routes
- `components/` — React client components
- `lib/` — Data, auth config, API clients
- `public/` — PWA assets (icons, manifest, service worker)

### Data flow
- Exercise data in `lib/exercises.ts` (typed, ~120KB, 80+ exercises)
- Supplement/superset data in `lib/supplements.ts` (left leg rehab, core routines, nearby supersets)
- Diagram animations in `components/diagrams/` (35+ animated SVGs, 8 categories)
- All UI state in `components/workout-view.tsx` (localStorage persistence via `lib/storage.ts`)
- Auth via NextAuth v5 (`lib/auth.ts`, Google OAuth)
- AI suggestions via `/api/suggest` (Anthropic Claude, behind feature flag)

### Component tree
```
WorkoutView (main shell, all state, 7 tabs: Today/Upper/Lower/Core/Cardio/Equip/Safety)
├── Section (collapsible wrapper)
├── ExerciseRow (exercise detail + safety cues + swap buttons)
│   └── filters swaps to prevent duplicates in same workout
├── MachineSelector (visual machine type picker cards)
│   └── selected variant drives superset suggestions via machineVariants[].superset
├── NearbyPicker (multi-select equipment chips, 11 types incl TRX)
│   └── auto-highlights "in use" equipment, drives nearby superset suggestions
├── DiagramGallery (35+ animated SVGs, 8 categories, full-screen overlay)
├── DiagramModal (registry + modal wrapper for individual exercise diagrams)
│   ├── PlancheDiagram, SidePlankDiagram (static SVG)
│   ├── GluteBridgeDiagram, ClamshellDiagram (CSS keyframe animated)
│   └── CoreDemoGuide (17 JS-animated core exercise SVGs)
├── RestTimer (post-exercise countdown)
├── ProgressClock (42-day program timer)
├── SuggestionCard (AI suggestions, feature-flagged)
└── AuthButton (lazy-loaded, feature-flagged)
```

### Superset system
- `machineVariants[].superset` on exercises — variant-specific left leg superset (e.g. "same machine, switch legs")
- `cableSuperset` flag on cable exercises — first cable per workout gets ankle dorsiflexion
- `NEARBY_SUPERSETS` in supplements.ts — driven by nearby equipment chip selection
- `SUPPLEMENT_LEFT_LEG` / `SUPPLEMENT_CORE` — interleaved rehab cards below each exercise
- All controlled by `supplementToggles { leftLeg, core }` toggle buttons per workout

### Feature flags
- `NEXT_PUBLIC_FEATURE_AI_SUGGESTIONS` — enables AI suggestion system (default: false)

### Key components
- `workout-view.tsx` — Main app shell, all state, 7 tabs (Today/Upper/Lower/Core/Cardio/Equip/Safety)
- `exercise-row.tsx` — Exercise detail panel with safety cues, duplicate-aware swaps
- `machine-selector.tsx` — Visual machine type picker cards
- `nearby-picker.tsx` — Multi-select nearby equipment chips with "in use" auto-highlight
- `diagrams/gallery.tsx` — Unified exercise diagram gallery (35+ animated SVGs, 8 categories)
- `diagrams/data.ts` — Exercise diagram metadata and category definitions
- `diagrams/helpers.tsx` — Shared SVG primitives and animation utilities
- `diagram-modal.tsx` — Individual exercise diagram modal (Planche, SidePlank, GluteBridge, Clamshells, CoreDemos)
- `core-demo-guide.tsx` — 17 animated core exercise SVG diagrams (TRX, Supine, Arm Balance)
- `exercise-diagrams.tsx` — Animated GluteBridge + Clamshells diagrams (CSS keyframes)
- `suggestion-card.tsx` — AI suggestion display (behind feature flag)
- `progress-clock.tsx` — 6-week program timer

## PWA

- `public/sw.js` — service worker with cache-first strategy (v6)
- `public/manifest.json` — standalone mode, dark theme
- Base workout fully offline; AI suggestions show offline indicator
- Desktop: responsive font-size scaling (no zoom hack)

## Key Constraints (2026-05 full clearance — FWB phase)

- **Full weight-bearing, fully cleared for unrestricted resistance training.** Karl has been FWB for weeks; FWB lifts are already part of PT. Train like a healthy, fit lifter.
- **No exercise is off-limits and there is NO load cap.** Squat, leg press, single- AND double-leg KB RDL, BFR glute bridges, bilateral loading on the LEFT — all cleared and in the program.
- **Every prior NWB/PWB restriction is RETIRED**: no-left-squat/leg-press, axial-loading ban, toe-touch, hip-flexion cap, iliopsoas restriction, no-rowing-erg, and the sub-maximal/PT-capped-load framing are all gone. Do not reintroduce them or hedge around them.
- Hip flexion fully unrestricted; core unrestricted.
- Only standing safety net: stop a set (not the session) on sharp/localized left-hip pain.
- New FWB exercises live in `lib/exercises-fwb.ts` (parallel to `lib/exercises-pwb.ts`); they're `Object.assign`-merged into the main `EX` dictionary at the bottom of `lib/exercises.ts`, carry `phaseUnlock: "FWB-2026-05"` (renders an "FWB" badge), and are slotted into Legs A/B. The FWB phase is in `lib/program.ts` (`FWB_PHASE`, the ProgressClock) and in `lib/conditions/fnsf-left.ts` under `program.phases[]`.
- The AI system prompt in `app/api/suggest/system-prompt.ts` reads the phase line + constraints from the condition pack at `lib/conditions/fnsf-left.ts` (`phaseSummary`, `hardContraindications`, `aiPromptFragment`) — update the pack only; the prompt no longer hardcodes the phase.
