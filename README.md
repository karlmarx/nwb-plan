# NWB Workout Plan

A Progressive Web App for MRI-adjusted non-weight-bearing (NWB) Push/Pull/Legs training. Built around a femoral neck stress fracture + L4-L5 DDD protocol — every exercise selected and modified to protect the injured hip, spine, and labrum while maximising upper body and unilateral leg development.

**Live:** [nwb-plan.vercel.app](https://nwb-plan.vercel.app) / [nfit.93.fyi](https://nfit.93.fyi)
**Companion yoga app:** [nwb-yoga.vercel.app](https://nwb-yoga.vercel.app)

---

## Features

- **Today tab** — shows today's scheduled workout in the PPL rotation, with a 42-day ProgressClock
- **Push / Pull / Legs / Recovery** — 6-day PPL split with A/B variants
- **3 progression phases** — Foundation → Build → Peak (sets/reps auto-adjust per phase)
- **Left leg & core supersets** — interleaved rehab exercises with toggle controls, equipment-aware suggestions
- **Machine type picker** — visual card selector per exercise (e.g., plate-loaded vs selectorized)
- **Nearby equipment chips** — "What's within reach?" drives context-aware superset suggestions
- **Equipment-aware swaps** — toggle gear on/off; exercises auto-route to available alternatives
- **21 animated SVG diagrams** — TRX Core, Supine Oblique, Arm Balance, Glute Bridge, Clamshells, Planche, Side Plank
- **HEVY deep-links** — one-tap "Open in HEVY" button on every workout
- **Dark/light theme** — toggle in header, persisted to localStorage
- **Rest timer** — per-exercise countdown with pulse animation
- **Offline-capable PWA** — installs to home screen, works without internet
- **AI suggestions** — Claude-powered exercise suggestions (behind feature flag)

## Tabs

| Tab | Purpose |
|-----|---------|
| **Today** | Today's scheduled workout + 42-day ProgressClock |
| **Workouts** | Full exercise library (Push / Pull / Legs), all phases |
| **Cardio** | NWB cardio options (arm bike, battle rope, SkiErg, etc.) |
| **Core** | 19 core exercises in 4 blocks + animated movement demos |
| **Equip** | Toggle available equipment; updates swaps throughout |
| **Safety** | Injury cues, NWB rules, and red-flag checklist |

## Protocol Constraints

Every exercise satisfies all of the following:

| Constraint | Reason |
|---|---|
| Zero weight-bearing on left leg | Compression-sided medial femoral neck stress fracture |
| No hip flexion past 90° | Bilateral FAI + anterosuperior labral tears |
| No spinal flexion/rotation under load | L4-L5 degenerative disc disease |
| No active left hip flexor recruitment | Protect stress fracture site during healing |

---

## Architecture

### High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Vercel Edge                              │
│  ┌──────────────────┐  ┌──────────────────────────────────────┐ │
│  │   Static Assets  │  │        Serverless Functions          │ │
│  │   Next.js SSG    │  │                                      │ │
│  │   ┌──────────┐   │  │  /api/auth/[...nextauth]  (Google)  │ │
│  │   │ app/     │   │  │  /api/suggest             (Claude)  │ │
│  │   │ page.tsx │   │  │  /api/users               (stub)    │ │
│  │   └──────────┘   │  │  /api/saved-suggestions   (stub)    │ │
│  │   public/sw.js   │  │                                      │ │
│  │   public/*.png   │  └──────────────────────────────────────┘ │
│  └──────────────────┘                                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Browser (PWA)                                │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  WorkoutView (client component — all UI state)            │  │
│  │                                                           │  │
│  │  ┌─────────┐ ┌──────────┐ ┌────────┐ ┌──────┐ ┌───────┐ │  │
│  │  │ Section │ │ExerciseRow│ │RestTimer│ │Badge │ │Callout│ │  │
│  │  └─────────┘ └──────────┘ └────────┘ └──────┘ └───────┘ │  │
│  │  ┌──────────────┐ ┌─────────────┐ ┌──────────────────┐   │  │
│  │  │MachineSelector│ │NearbyPicker │ │  DiagramModal    │   │  │
│  │  └──────────────┘ └─────────────┘ │  ├ PlancheDiagram │   │  │
│  │  ┌──────────────┐ ┌─────────────┐ │  ├ SidePlankDiag  │   │  │
│  │  │ProgressClock │ │SuggestionCard│ │  ├ GluteBridgeDiag│  │  │
│  │  └──────────────┘ └─────────────┘ │  ├ ClamshellDiag  │   │  │
│  │                                   │  └ CoreDemoGuide  │   │  │
│  │                                   └──────────────────┘   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                    ┌─────────┴─────────┐                        │
│                    │   localStorage    │                        │
│                    │   (all UI state)  │                        │
│                    └──────────────────┘                         │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
┌──────────────────────┐
│  lib/exercises.ts    │──── 67 exercises, typed, with safety constraints,
│  (~96KB)             │     machine variants, swap chains, diagram keys
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐     ┌──────────────────────┐
│  lib/supplements.ts  │     │    lib/storage.ts     │
│  Left leg rehab      │     │  loadState/saveState  │
│  Core daily routines │     │  ← localStorage →     │
│  Nearby supersets    │     └──────────┬───────────┘
│  Cable supersets     │                │
└────────┬─────────────┘                │
         │                              │
         ▼                              ▼
┌─────────────────────────────────────────────────────┐
│              WorkoutView (client)                    │
│                                                     │
│  State:                                             │
│  ├ tab, phase, openSections, expandedEx             │
│  ├ equipment (toggles), swaps                       │
│  ├ machineSelections, nearbySelections              │
│  ├ supplementToggles { leftLeg, core }              │
│  ├ hevyIds, startDay, theme                         │
│  └ timer, diagramOpen                               │
│                                                     │
│  Derives:                                           │
│  ├ suppMap (interleaved left leg + core per exercise)│
│  ├ ssInfo (equipment-specific superset suggestion)  │
│  ├ nearbySupersets (from nearby chips + in-use)     │
│  └ availableSwaps (filtered to prevent duplicates)  │
└─────────────────────────────────────────────────────┘
```

### Directory Structure

```
nwb-plan/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout, PWA meta, theme script
│   ├── page.tsx                  # Home → renders WorkoutView
│   ├── globals.css               # Tailwind + theme vars + desktop scaling
│   ├── admin/page.tsx            # Admin panel (role-gated)
│   └── api/
│       ├── auth/[...nextauth]/   # NextAuth v5 Google OAuth
│       ├── suggest/              # Claude AI suggestions (feature-flagged)
│       │   ├── route.ts
│       │   └── system-prompt.ts  # NWB safety constraints for AI
│       ├── users/route.ts        # User management (stub)
│       └── saved-suggestions/    # Saved suggestions (stub)
│
├── components/                   # React client components
│   ├── workout-view.tsx          # Main app shell, all state, 6 tabs
│   ├── exercise-row.tsx          # Exercise detail panel with safety cues
│   ├── machine-selector.tsx      # Visual machine type picker cards
│   ├── nearby-picker.tsx         # Multi-select nearby equipment chips
│   ├── diagram-modal.tsx         # Diagram registry + modal wrapper
│   ├── core-demo-guide.tsx       # 17 animated core exercise SVGs
│   ├── exercise-diagrams.tsx     # Glute Bridge + Clamshells animated SVGs
│   ├── suggestion-card.tsx       # AI suggestion display (feature-flagged)
│   ├── progress-clock.tsx        # 6-week program timer
│   ├── rest-timer.tsx            # Post-exercise countdown
│   ├── section.tsx               # Collapsible section wrapper
│   ├── callout.tsx               # Info/warning/danger callout cards
│   ├── badge.tsx                 # Status pill badges
│   ├── removed-row.tsx           # Removed exercise display
│   ├── auth-button.tsx           # NextAuth sign-in/out (lazy-loaded)
│   └── providers.tsx             # SessionProvider wrapper
│
├── lib/                          # Data & configuration
│   ├── exercises.ts              # 67 exercises, types, workouts, schedule
│   ├── supplements.ts            # Left leg rehab, core routines, supersets
│   ├── auth.ts                   # NextAuth v5 config (Google OAuth)
│   ├── anthropic.ts              # Anthropic SDK client
│   └── storage.ts                # localStorage helpers
│
├── public/                       # Static PWA assets
│   ├── sw.js                     # Service worker (cache-first, v6)
│   ├── manifest.json             # PWA manifest (standalone, dark)
│   ├── icon.svg                  # Lotus flower SVG icon
│   ├── icon-192.png              # PWA icon 192x192
│   └── icon-512.png              # PWA icon 512x512 (maskable)
│
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript strict mode
├── postcss.config.mjs            # PostCSS for Tailwind
├── vercel.json                   # Vercel deployment (framework: nextjs)
└── package.json                  # Next.js 16, React 19, Tailwind v4
```

### Superset System

```
Exercise expanded
    │
    ├── Machine type selected? ──→ Show variant-specific superset
    │   (machineVariants[].superset)   e.g. "Same machine — switch legs"
    │
    ├── Cable exercise? ──→ First cable per workout gets ankle dorsiflexion
    │   (cableSuperset flag)
    │
    ├── Nearby equipment selected? ──→ Show nearby-driven suggestions
    │   (NEARBY_SUPERSETS[])          e.g. cable station → ankle dorsiflexion
    │                                      bench → quad sets
    │
    └── Supplement toggles ON? ──→ Interleaved left leg + core cards
        (suppMap built from SUPPLEMENT_LEFT_LEG + SUPPLEMENT_CORE)
        Left leg: teal accent, 3 base + 2 extra on leg days
        Core: orange accent, 4 exercises per day with region tags
```

### PWA & Offline

```
Install → sw.js registers → precaches /, manifest, icons
    │
    Request arrives
    ├── /api/* or /_next/* → network only (always fresh)
    ├── Navigation request → cache first, fallback to cached /
    └── Static asset → cache first, fallback to network

Cache: nwb-plan-v6 (bumped on deploy, old caches auto-cleaned)
```

## Stack

| | |
|---|---|
| **Framework** | Next.js 16 App Router with Turbopack |
| **Language** | TypeScript (strict) |
| **Styling** | Tailwind CSS v4 + CSS custom properties for theming |
| **State** | React hooks in WorkoutView, localStorage persistence |
| **Auth** | NextAuth v5, Google OAuth |
| **AI** | Anthropic Claude (behind feature flag) |
| **PWA** | Service worker (cache-first), standalone manifest |
| **Deployment** | Vercel — push to `main`, auto-deploys |

## localStorage Keys

| Key | Contents |
|-----|---------|
| `nwb_tab` | Active tab index |
| `nwb_phase` | Progression phase (0=Foundation, 1=Build, 2=Peak) |
| `nwb_equipment` | Equipment id → boolean (available/unavailable) |
| `nwb_swaps` | Exercise swap selections |
| `nwb_hevy` | Workout key → HEVY routine URL |
| `nwb_startDay` | Day-of-week index the PPL rotation starts on |
| `nwb_machines` | Exercise → selected machine variant id |
| `nwb_nearby` | Exercise → selected nearby equipment ids |
| `nwb_supplements` | `{ leftLeg: bool, core: bool }` toggle state |
| `nwb_theme` | `"dark"` or `"light"` |

## Development

```bash
npm install
npm run dev          # Turbopack dev server
npm run build        # Production build
```

## Environment Variables

```bash
# Feature flags
NEXT_PUBLIC_FEATURE_AI_SUGGESTIONS=false

# AI (set in Vercel dashboard when ready)
ANTHROPIC_API_KEY=

# Auth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=

# See .env.local.example for full list
```

## Deploy

Push to `main` — Vercel auto-deploys.
