# Exercise Library Backend

Scaffold for a Postgres-backed exercise library that the static client
import (`lib/exercises.ts`) will eventually migrate onto. As of this PR
the API exists alongside the static import — nothing in the client
fetches from it yet.

## Why a backend at all

The exercise library is currently a 120 KB TypeScript constant. We want:

1. **Remote mutation via MCP** — an MCP server (running on Vercel or
   Cloudflare Workers) that mutates the library on Karl's behalf
   ("add prone hip extension as a Legs B alternate", "swap the cue on
   barbell floor press"). MCP cannot edit a TS file; it needs an API.
2. **A single source of truth** when more than one device is editing.
3. **Leaving offline-first behaviour intact** for the workout client.
   The PWA's value proposition is that it loads under a squat rack
   with two bars of reception. The DB must be additive — never on
   the critical render path.

## Stack

| Layer       | Choice                              | Why |
|-------------|-------------------------------------|-----|
| Database    | Neon Postgres (Vercel Marketplace)  | Relational shape (exercises + variants + workouts + workout_exercises). Auto-provisioned env vars. Branchable for preview deploys. |
| Client lib  | `@vercel/postgres`                  | Zero config when Marketplace-provisioned. Reads `POSTGRES_URL` lazily so `next build` doesn't need DB env. |
| Migrations  | Plain `db/schema.sql` + tsx script  | We're at one schema rev. Bringing Drizzle/Prisma right now is overkill. Revisit when we hit migration #3. |
| Auth (read) | None — public                       | Library data is non-sensitive. Cache-friendly. |
| Auth (write)| Bearer token (`EXERCISE_API_TOKEN`) | Single tenant. Token lives in MCP server's env. Easy to rotate. |

## Schema

See `db/schema.sql`. Highlights:

- `exercises` — one row per exercise, JSONB columns for `requires`,
  `swaps`, `amp`, `sets`, `constraints`. JSONB because these are read
  together with the row and the structure (e.g. nested set/rep tuples)
  doesn't decompose cleanly into a relational shape.
- `machine_variants` — separate table, FK to `exercises(id)`. Variants
  have stable ids (`plate_loaded`, `pin_loaded`, `rogue_rack_barbell`)
  that the MCP server may want to query/mutate independently.
- `workouts` + `workout_exercises` — preserves ordered exercise list
  per Push A / Pull A / etc.
- `core_finishers`, `schedule`, `phases`, `equipment` — flat lookup
  tables that mirror the corresponding `lib/exercises.ts` exports.
- `lib/supplements.ts` is **not** modelled. The supplement / superset
  data is tightly coupled to the NWB safety invariants (declared at
  the top of that file) and is mutated less than once per quarter.
  Keeping it static avoids the risk of an MCP write violating an
  invariant. If/when that calculus changes, add `supplement_left_leg`
  / `supplement_core` tables in a follow-up migration.

## API surface

All routes live under `app/api/exercises/`.

| Method | Path                       | Auth   | Cache                   |
|--------|----------------------------|--------|-------------------------|
| GET    | `/api/exercises`           | public | 1h public + s-maxage     |
| GET    | `/api/exercises/[id]`      | public | 1h public + s-maxage     |
| POST   | `/api/exercises`           | bearer | n/a                     |
| PATCH  | `/api/exercises/[id]`      | bearer | n/a                     |
| DELETE | `/api/exercises/[id]`      | bearer | n/a                     |

Bearer token is checked against `process.env.EXERCISE_API_TOKEN`. A
mismatch returns 401; missing server-side env returns 503 (signals an
ops issue rather than blaming the caller).

## Caching

- Framework: each GET handler exports `revalidate = 3600`, so Next.js
  caches the rendered Response across function invocations within an
  hour (per-region in Vercel).
- HTTP: GET also sets `Cache-Control: public, max-age=3600,
  s-maxage=3600, stale-while-revalidate=86400`. SWR gives us 24 h
  of "old but usable" responses if the DB hiccups.
- Why not Cache Components / `cacheLife`? Stable in Next 16 but the
  ergonomics for tag-based invalidation from a write route are still
  in flux. Plain `revalidate = 3600` works on every Vercel runtime
  and is trivially replaceable with `revalidateTag('exercises')` once
  we add the tag in Phase 1.

## Migration plan

### Phase 0 — this PR
- Schema, DB client, API routes, migration script all exist.
- The client (`components/workout-view.tsx`) still imports `EX` /
  `WORKOUTS` directly from `lib/exercises.ts`.
- Migration script has NOT been run. Postgres is NOT provisioned yet.
- API will return 500 if hit (no DB) — that's fine; nothing calls it.

### Phase 1 — provision + seed
1. Provision Neon via Vercel Marketplace (`vercel storage add postgres`).
2. `vercel env pull .env.local`.
3. Apply schema: `psql "$POSTGRES_URL" -f db/schema.sql`.
4. Run migration: `npx tsx scripts/migrate-exercises-to-db.ts`.
5. Set `EXERCISE_API_TOKEN` in Vercel (preview + prod):
   `vercel env add EXERCISE_API_TOKEN`. Generate with
   `openssl rand -hex 32`.
6. Verify GET `/api/exercises` from prod (`curl https://nfit.93.fyi/api/exercises | jq '.exercises | length'`)
   matches `Object.keys(EX).length` from the source.
7. Tag responses with `exercises` and switch the GET handlers to use
   `revalidateTag` for Phase 2.

### Phase 2 — client refactor (additive)
Goal: client treats DB as truth, but offline UX never degrades.

- On first load, fetch `/api/exercises`.
  - If success: store in IndexedDB under `nwb-plan/exercise-library`.
  - If fail (offline, 5xx, etc.): fall back to the static import
    that's still bundled in. **Static import stays in the bundle as
    a permanent fallback.** It's 120 KB; we can afford it.
- On subsequent loads:
  - Read from IndexedDB synchronously (block render on it).
  - Background-fetch `/api/exercises` and update IndexedDB if the
    response differs (compare hash or `updated_at` max).
  - If the fetched library differs, surface a "Library updated —
    refresh?" toast. Don't auto-refresh mid-workout.
- Storage key: `exercise-library-v1`. Bump the suffix on schema-breaking
  changes.

### Phase 3 — live updates (optional)
- After a write through the API (POST/PATCH/DELETE), the MCP server
  could call a `/api/exercises/_invalidate` endpoint that bumps a
  sentinel in Vercel KV (or Edge Config).
- Service worker polls the sentinel every N minutes and pushes a
  `MessageChannel` event to active clients telling them to re-fetch.
- Defer until Phase 2 is in production and stable.

## Operational notes

- Migration script is upsert-only — it never deletes. To remove an
  exercise that's been removed from the source, do it through the
  DELETE API.
- Backups: Neon has PITR by default. Snapshot before any schema
  change.
- Local dev: `vercel env pull .env.local`, then `npm run dev`. The
  GET routes will work; writes need `EXERCISE_API_TOKEN` set in
  `.env.local`.

## Open TODOs before this is production-ready

- [ ] Provision Neon Postgres via Vercel Marketplace.
- [ ] Set `EXERCISE_API_TOKEN` in Vercel env (preview + prod).
- [ ] Apply `db/schema.sql` against the provisioned database.
- [ ] Run `scripts/migrate-exercises-to-db.ts`.
- [ ] Smoke-test all 5 routes against prod.
- [ ] Add `revalidateTag('exercises')` invocations in POST/PATCH/DELETE
      and switch GET handlers to `unstable_cache` keyed on the tag.
- [ ] Decide if `lib/supplements.ts` joins the DB (currently no).
- [ ] Add an integration test (`e2e/test_exercise_api.py`) covering
      GET happy + auth-fail + create→fetch round-trip.
- [ ] Phase 2 client refactor (separate PR).
