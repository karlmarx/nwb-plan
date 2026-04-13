# NWB Watch — Pixel Watch Workout Coach

Wear OS companion app for the [NWB Training Plan](https://nfit.93.fyi) — voice-guided,
haptic-cued workout coaching for non-weight-bearing Push/Pull/Legs training protocol.

## Features

- **Today's Workout** — Auto-detects workout day (Push A/B, Pull A/B, Legs A/B, Recovery)
- **Voice Coaching** — TTS reads setup, execution, and NWB safety cues per exercise
- **Haptic Feedback** — Tempo beats, rest timer warnings, set completion confirmation
- **Phase-Aware** — 6-week program (Foundation → Build → Peak) with phase-adjusted sets/reps
- **Rest Timer** — Circular countdown with haptic escalation at 30s and 10s
- **Set Tracker** — Tap to log completed sets, auto-advance through workout
- **Supplement Interleaving** — Left leg maintenance, core routines, nearby equipment supersets
- **Quick Tile** — Glanceable workout info from the watch face
- **Standalone** — No phone required during workouts

## Requirements

- Pixel Watch 4 (or any Wear OS 4+ device)
- Android Studio Hedgehog+ with Wear OS SDK
- JDK 17

## Setup

```bash
# Export exercise data from the main app
cd /path/to/nwb-plan
npx ts-node --skip-project \
  --compiler-options '{"module":"commonjs","esModuleInterop":true,"types":["node"],"moduleResolution":"node"}' \
  watch/scripts/export-data.ts

# Open watch/ in Android Studio and build
```

## Architecture

```
watch/
├── app/src/main/kotlin/com/nwb/watch/
│   ├── MainActivity.kt          # Entry + Compose navigation
│   ├── WorkoutService.kt        # Foreground service (keeps workout alive)
│   ├── NwbWatchApp.kt           # Hilt application
│   ├── data/
│   │   ├── model/               # Kotlin data classes (Exercise, Workout, Supplement)
│   │   ├── ExerciseRepository.kt # Loads bundled JSON data
│   │   ├── WorkoutScheduler.kt  # 7-day rotation + phase calculation
│   │   └── WorkoutState.kt      # DataStore persistence
│   ├── coaching/
│   │   ├── VoiceCoach.kt        # TTS with priority queue
│   │   ├── HapticEngine.kt      # Vibration patterns
│   │   └── TempoTracker.kt      # Parse tempo → timed beats
│   ├── ui/
│   │   ├── WorkoutViewModel.kt  # Shared state + business logic
│   │   ├── theme/Theme.kt       # Material 3 Wear colors
│   │   ├── home/HomeScreen.kt   # Today's workout, start button
│   │   ├── workout/
│   │   │   ├── WorkoutScreen.kt        # Exercise list with progress
│   │   │   ├── ExerciseDetailScreen.kt # Full exercise info + set tracker
│   │   │   └── RestTimerScreen.kt      # Circular countdown
│   │   ├── settings/SettingsScreen.kt  # TTS/haptics toggles
│   │   └── supplement/SupplementCard.kt
│   ├── tile/WorkoutTile.kt      # Quick-glance tile
│   └── di/AppModule.kt          # Hilt dependency injection
└── scripts/export-data.ts       # TypeScript → JSON export
```

## Data Pipeline

Exercise data lives in the main nwb-plan TypeScript codebase and is exported
to JSON at build time. The watch app bundles ~134KB of JSON covering 102 exercises,
7 workouts, supplements, and mobility routines.
