# scripts/

Build and maintenance scripts for nwb-plan.

## Ebook pipeline

End-to-end Kobo-friendly ePub (plus a Calibre PDF) generated from the
live exercise/workout data in `lib/` and the animated React diagrams in
`components/diagrams/`.

```
npm run build:ebook
```

Output lands in `dist/`:

- `dist/plan.json` — flattened plan data
- `dist/diagrams/*.svg` — one static SVG per diagram, captured at `t=0.5`
- `dist/nwb-plan.epub` — primary artifact, reflow-friendly for KOReader
- `dist/nwb-plan.pdf` — secondary artifact via `ebook-convert`

### Pieces

| File | Purpose |
| --- | --- |
| `export-plan.ts` | Imports `EX`, `WORKOUTS`, `SCHED`, `DEFAULT_PROGRAM_PHASES` and writes the flat plan JSON consumed by `nwb_to_epub.py`. |
| `snapshot_diagrams.py` | Boots a Playwright/Chromium against a running Next server and saves the `<svg>` rendered at `/_diagrams/<id>?t=0.5` for every diagram in `components/diagrams/`. |
| `nwb_to_epub.py` | Reads the plan JSON, rasterises the snapshotted SVGs to grayscale PNGs, and emits an ePub3 file. |
| `build-ebook.sh` | Orchestrator: runs `next build` + `next start`, runs the three above in order, then invokes `ebook-convert` for the PDF. |

The snapshot route lives at `app/_diagrams/[id]/page.tsx` — it renders
one diagram component at a pinned `t` with no chrome. It is intentionally
not linked anywhere in the main app.

## Local install

The pipeline needs Cairo (for `cairosvg`), a Chromium browser (for
Playwright), and Calibre (for `ebook-convert`).

### Ubuntu / WSL Ubuntu

```bash
sudo apt-get update
sudo apt-get install -y \
  libcairo2 libpango-1.0-0 libpangocairo-1.0-0 \
  libgdk-pixbuf-2.0-0 libffi-dev shared-mime-info \
  calibre

# Chromium for Playwright (installed under uv's managed Python)
uv run --python 3.14 --with playwright python -m playwright install chromium --with-deps
```

### macOS

```bash
brew install cairo pango gdk-pixbuf libffi calibre
uv run --python 3.14 --with playwright python -m playwright install chromium
```

If Calibre is missing the PDF step is skipped with a warning; the ePub is
still produced.

## CI

`.github/workflows/ebook.yml` runs the pipeline on every push to `main`
or `dev` and on `v*` tag pushes. Tag pushes also attach the produced
ePub and PDF to a GitHub Release.

## Other scripts

- `migrate-exercises-to-db.ts` — one-shot upsert of `EX` / `WORKOUTS` /
  `SCHED` / `PHASES` into Vercel Postgres. Unrelated to the ebook.
