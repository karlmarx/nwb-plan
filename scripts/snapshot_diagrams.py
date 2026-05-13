#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.14"
# dependencies = [
#   # Pinned exactly. The CI workflow's `playwright install` step must use the
#   # same pin (.github/workflows/ebook.yml) — otherwise the two uv envs can
#   # resolve to different Playwright versions, which want different Chromium
#   # revisions, and the script crashes at `chromium.launch()` because the
#   # binary at the version it expects was never downloaded.
#   "playwright==1.59.0",
# ]
# ///
"""Snapshot every exercise diagram into a static SVG file.

Boots the Next dev/start server externally (the orchestrator handles
that), then navigates to ``/diagram-snapshot/<id>?t=0.5`` for every
diagram ID referenced from ``components/diagrams`` and serialises the
rendered ``<svg id="diagram-snapshot">`` element to
``dist/diagrams/<id>.svg``.

The diagrams are pure functional React components that take a single
``t`` prop in [0, 1] — pinning ``t=0.5`` yields the mid-point pose, which
is a reasonable canonical frame for a static reference.

Usage:
    uv run scripts/snapshot_diagrams.py --base-url http://localhost:3000 \
        --out dist/diagrams
"""

from __future__ import annotations

import argparse
import asyncio
import json
import re
import sys
from pathlib import Path
from urllib.parse import urljoin

from playwright.async_api import async_playwright


def discover_diagram_ids(repo_root: Path) -> list[str]:
    """Scan ``components/diagrams/*.tsx`` for the keys of every ``*_ANIMS`` map.

    Walks each file looking for a top-level ``export const FOO_ANIMS =
    {...}`` and extracts the keys, regardless of formatting. This avoids
    having to keep a parallel registry in sync with the TS source.
    """
    diagrams_dir = repo_root / "components" / "diagrams"
    map_pattern = re.compile(
        r"export\s+const\s+\w+_ANIMS[^=]*=\s*\{(.*?)\}\s*;",
        re.DOTALL,
    )
    key_pattern = re.compile(r"^\s*([A-Za-z_][\w]*)\s*[,:]", re.MULTILINE)

    ids: list[str] = []
    for tsx_file in sorted(diagrams_dir.glob("*.tsx")):
        text = tsx_file.read_text(encoding="utf-8")
        for match in map_pattern.finditer(text):
            body = match.group(1)
            for key_match in key_pattern.finditer(body):
                key = key_match.group(1)
                if key and key not in ids:
                    ids.append(key)
    return ids


async def snapshot_one(page, base_url: str, diagram_id: str, out_dir: Path) -> bool:
    """Navigate to one diagram route and persist the rendered SVG.

    Returns True on success, False on any error (404, missing element,
    etc.) so the caller can summarise failures without aborting.
    """
    url = urljoin(base_url + "/", f"diagram-snapshot/{diagram_id}?t=0.5")
    try:
        response = await page.goto(url, wait_until="networkidle")
    except Exception as exc:
        print(f"[snapshot] {diagram_id}: navigation error: {exc}", file=sys.stderr)
        return False
    if response is None or response.status != 200:
        status = response.status if response else "no response"
        print(f"[snapshot] {diagram_id}: HTTP {status}", file=sys.stderr)
        return False

    svg_html = await page.evaluate(
        """() => {
            const el = document.getElementById('diagram-snapshot');
            return el ? el.outerHTML : null;
        }"""
    )
    if not svg_html:
        print(f"[snapshot] {diagram_id}: #diagram-snapshot not found", file=sys.stderr)
        return False

    out_path = out_dir / f"{diagram_id}.svg"
    out_path.write_text(svg_html, encoding="utf-8")
    return True


async def run(base_url: str, out_dir: Path, repo_root: Path, ids: list[str]) -> int:
    """Open one browser, walk every diagram ID, report a summary."""
    out_dir.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        try:
            context = await browser.new_context(viewport={"width": 800, "height": 600})
            page = await context.new_page()
            ok = 0
            failed: list[str] = []
            for diagram_id in ids:
                if await snapshot_one(page, base_url, diagram_id, out_dir):
                    ok += 1
                else:
                    failed.append(diagram_id)
            print(
                f"[snapshot] wrote {ok}/{len(ids)} diagrams to {out_dir}",
                file=sys.stderr,
            )
            if failed:
                print(f"[snapshot] failures: {', '.join(failed)}", file=sys.stderr)
        finally:
            await browser.close()
    return 0 if not failed else 1


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--base-url",
        default="http://localhost:3000",
        help="Base URL of the running Next server.",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=Path("dist/diagrams"),
        help="Directory to write SVG files into.",
    )
    parser.add_argument(
        "--repo-root",
        type=Path,
        default=Path(__file__).resolve().parent.parent,
        help="Repo root used to discover diagram IDs.",
    )
    parser.add_argument(
        "--ids",
        default=None,
        help="Optional JSON array of diagram IDs to snapshot (overrides auto-discovery).",
    )
    args = parser.parse_args()

    if args.ids:
        ids = json.loads(args.ids)
    else:
        ids = discover_diagram_ids(args.repo_root)
    if not ids:
        print("[snapshot] no diagram IDs discovered", file=sys.stderr)
        return 1

    return asyncio.run(run(args.base_url, args.out, args.repo_root, ids))


if __name__ == "__main__":
    sys.exit(main())
