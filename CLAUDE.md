# CLAUDE.md — NWB Training Plan (Femur Fracture Fitness)

## What Is This

A PWA for non-weight-bearing (NWB) Push/Pull/Legs training protocol after a left femur stress fracture. Tracks workouts, supplements (left leg rehab + core), nutrition, and equipment availability.

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
- Exercise data in `lib/exercises.ts` (typed, ~96KB, 67 exercises)
- Supplement/superset data in `lib/supplements.ts` (left leg rehab, core routines, nearby supersets)
- All UI state in `components/workout-view.tsx` (localStorage persistence via `lib/storage.ts`)
- Auth via NextAuth v5 (`lib/auth.ts`, Google OAuth)
- AI suggestions via `/api/suggest` (Anthropic Claude, behind feature flag)

### Component tree
```
WorkoutView (main shell, all state, 6 tabs)
├── Section (collapsible wrapper)
├── ExerciseRow (exercise detail + safety cues + swap buttons)
│   └── filters swaps to prevent duplicates in same workout
├── MachineSelector (visual machine type picker cards)
│   └── selected variant drives superset suggestions via machineVariants[].superset
├── NearbyPicker (multi-select equipment chips)
│   └── auto-highlights "in use" equipment, drives nearby superset suggestions
├── DiagramModal (registry + modal wrapper)
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
- `workout-view.tsx` — Main app shell, all state, 6 tabs
- `exercise-row.tsx` — Exercise detail panel with safety cues, duplicate-aware swaps
- `machine-selector.tsx` — Visual machine type picker cards
- `nearby-picker.tsx` — Multi-select nearby equipment chips with "in use" auto-highlight
- `diagram-modal.tsx` — 5 diagram components (Planche, SidePlank, GluteBridge, Clamshells, CoreDemos)
- `core-demo-guide.tsx` — 17 animated core exercise SVG diagrams (TRX, Supine, Arm Balance)
- `exercise-diagrams.tsx` — Animated GluteBridge + Clamshells diagrams (CSS keyframes)
- `suggestion-card.tsx` — AI suggestion display (behind feature flag)
- `progress-clock.tsx` — 6-week program timer

## PWA

- `public/sw.js` — service worker with cache-first strategy (v6)
- `public/manifest.json` — standalone mode, dark theme
- Base workout fully offline; AI suggestions show offline indicator
- Desktop scaling: zoom 1.25 at 700px+, 1.4 at 900px+

## Key Constraints

- ZERO left leg weight bearing (femoral neck stress fracture)
- ZERO left iliopsoas activation (no left hip flexion against gravity)
- Hip flexion <90° both sides (bilateral FAI + labral tears)
- No swimming
- The AI system prompt in `app/api/suggest/system-prompt.ts` enforces all safety constraints
