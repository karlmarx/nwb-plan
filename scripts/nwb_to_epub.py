#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.14"
# dependencies = [
#   "ebooklib>=0.18",
#   "cairosvg>=2.7",
#   "pillow>=10.4",
# ]
# ///
"""Generate a Kobo-friendly ePub from nwb-plan workout data.

This script reads a JSON description of a multi-phase workout plan
(typically NWB / PWB / FWB), rasterises any embedded SVG exercise
diagrams to grayscale PNGs sized for e-ink, and emits an ePub3 file
that Calibre can sync to a Kobo.

Usage:
    uv run nwb_to_epub.py plan.json --out nwb-plan.epub

The expected JSON shape (see `SCHEMA.md` block at the bottom of this
file) is intentionally flat so it can be produced by a small adapter
script on top of the existing nwb-plan data structures.
"""

from __future__ import annotations

import argparse
import base64
import io
import json
import re
import sys
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import cairosvg
from ebooklib import epub
from PIL import Image

# Kobo Libra 2 / Libra Colour native resolution is 1264x1680.
# Targeting 1100px wide gives comfortable margins inside KOReader.
TARGET_IMAGE_WIDTH = 1100
JPEG_QUALITY = 82


@dataclass(frozen=True)
class RenderedImage:
    """A rasterised exercise image ready to embed in the ePub.

    Attributes:
        filename: ePub-internal filename, e.g. ``images/db-bench.png``.
        data: Raw PNG bytes (grayscale, sized for e-ink).
        media_type: MIME type, always ``image/png`` here.
    """

    filename: str
    data: bytes
    media_type: str = "image/png"


def slugify(value: str) -> str:
    """Return a filesystem-safe, lowercase slug for ``value``.

    Args:
        value: Arbitrary human-readable string.

    Returns:
        A slug containing only ``[a-z0-9-]``.
    """
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", value.strip().lower())
    return slug.strip("-") or "untitled"


def svg_to_png_bytes(svg_source: str | Path, *, base_dir: Path) -> bytes:
    """Rasterise an SVG to grayscale PNG bytes sized for e-ink.

    Animated SVGs are rendered in their static initial state, which
    matches what KOReader would display anyway.

    Args:
        svg_source: Either inline SVG markup, a path relative to
            ``base_dir``, or an absolute path.
        base_dir: Directory used to resolve relative SVG paths.

    Returns:
        PNG bytes, grayscale, ~1100px wide.

    Raises:
        FileNotFoundError: If ``svg_source`` is a path that does not exist.
    """
    if isinstance(svg_source, Path) or (
        isinstance(svg_source, str)
        and not svg_source.lstrip().startswith("<")
    ):
        path = Path(svg_source)
        if not path.is_absolute():
            path = base_dir / path
        if not path.exists():
            raise FileNotFoundError(f"SVG not found: {path}")
        svg_bytes = path.read_bytes()
    else:
        svg_bytes = svg_source.encode("utf-8")

    png_bytes = cairosvg.svg2png(
        bytestring=svg_bytes,
        output_width=TARGET_IMAGE_WIDTH,
    )
    return _to_grayscale_png(png_bytes)


def raster_to_png_bytes(path: Path, *, base_dir: Path) -> bytes:
    """Load an existing raster image and convert it for e-ink.

    Args:
        path: Path to a PNG/JPEG/WebP. Relative paths are resolved
            against ``base_dir``.
        base_dir: Directory used to resolve relative paths.

    Returns:
        PNG bytes, grayscale, ~1100px wide.
    """
    resolved = path if path.is_absolute() else base_dir / path
    if not resolved.exists():
        raise FileNotFoundError(f"Image not found: {resolved}")
    return _to_grayscale_png(resolved.read_bytes())


def _to_grayscale_png(image_bytes: bytes) -> bytes:
    """Downscale and grayscale-convert image bytes for e-ink display.

    Args:
        image_bytes: Source image bytes (any Pillow-supported format).

    Returns:
        PNG bytes in mode ``L`` (8-bit grayscale), no wider than
        :data:`TARGET_IMAGE_WIDTH`.
    """
    with Image.open(io.BytesIO(image_bytes)) as img:
        img = img.convert("LA" if img.mode in ("RGBA", "LA", "P") else "L")
        if img.mode == "LA":
            # Flatten transparency against white so e-ink shows clean lines.
            background = Image.new("L", img.size, color=255)
            background.paste(img.convert("L"), mask=img.split()[-1])
            img = background
        if img.width > TARGET_IMAGE_WIDTH:
            ratio = TARGET_IMAGE_WIDTH / img.width
            new_size = (TARGET_IMAGE_WIDTH, int(img.height * ratio))
            img = img.resize(new_size, Image.LANCZOS)
        buf = io.BytesIO()
        img.save(buf, format="PNG", optimize=True)
        return buf.getvalue()


def render_exercise_image(
    exercise: dict[str, Any], *, base_dir: Path, used: set[str]
) -> RenderedImage | None:
    """Render the diagram for an exercise, if one is specified.

    Looks for (in order): ``svg_inline``, ``svg_path``, ``image_path``.

    Args:
        exercise: Exercise dict from the plan JSON.
        base_dir: Directory used to resolve relative paths.
        used: Set of filenames already claimed (mutated to avoid clashes).

    Returns:
        A :class:`RenderedImage` or ``None`` if the exercise has no diagram.
    """
    name_slug = slugify(exercise.get("name", "exercise"))
    base_filename = f"images/{name_slug}.png"
    filename = base_filename
    counter = 1
    while filename in used:
        counter += 1
        filename = f"images/{name_slug}-{counter}.png"

    data: bytes | None = None
    if inline := exercise.get("svg_inline"):
        data = svg_to_png_bytes(inline, base_dir=base_dir)
    elif svg_path := exercise.get("svg_path"):
        data = svg_to_png_bytes(Path(svg_path), base_dir=base_dir)
    elif image_path := exercise.get("image_path"):
        data = raster_to_png_bytes(Path(image_path), base_dir=base_dir)

    if data is None:
        return None
    used.add(filename)
    return RenderedImage(filename=filename, data=data)


def render_exercise_html(
    exercise: dict[str, Any], image: RenderedImage | None
) -> str:
    """Render one exercise as an ePub-friendly HTML fragment.

    Args:
        exercise: Exercise dict from the plan JSON.
        image: Pre-rendered diagram for this exercise, if any.

    Returns:
        XHTML fragment (no ``<html>`` wrapper).
    """
    parts: list[str] = []
    name = exercise.get("name", "Untitled exercise")
    parts.append(f"<h3>{_esc(name)}</h3>")

    meta: list[str] = []
    for key in ("sets", "reps", "rest", "tempo", "load"):
        if value := exercise.get(key):
            meta.append(f"<strong>{key.title()}:</strong> {_esc(str(value))}")
    if meta:
        parts.append('<p class="exercise-meta">' + " · ".join(meta) + "</p>")

    if image is not None:
        parts.append(
            f'<p class="exercise-image">'
            f'<img src="{image.filename}" alt="{_esc(name)} diagram" />'
            f"</p>"
        )

    if notes := exercise.get("notes"):
        parts.append(f"<p>{_esc(notes)}</p>")

    if cues := exercise.get("cues"):
        bullets = "".join(f"<li>{_esc(c)}</li>" for c in cues)
        parts.append(f"<ul class='cues'>{bullets}</ul>")

    if safety := exercise.get("safety"):
        parts.append(
            f'<p class="safety"><strong>Safety:</strong> {_esc(safety)}</p>'
        )

    return "\n".join(parts)


def render_day_chapter(
    day: dict[str, Any],
    *,
    phase_slug: str,
    day_index: int,
    base_dir: Path,
    used_image_names: set[str],
) -> tuple[epub.EpubHtml, list[RenderedImage]]:
    """Build a single 'day' chapter and collect its images.

    Args:
        day: Day dict from the plan JSON.
        phase_slug: Slug of the parent phase, used for the chapter filename.
        day_index: 1-based index within the phase.
        base_dir: Directory used to resolve relative image paths.
        used_image_names: Mutable set tracking image filename collisions.

    Returns:
        Tuple of the constructed :class:`~ebooklib.epub.EpubHtml` chapter
        and the list of rendered images that go with it.
    """
    title = day.get("name") or f"Day {day_index}"
    file_name = f"{phase_slug}-day-{day_index:02d}.xhtml"

    images: list[RenderedImage] = []
    body_parts: list[str] = [f"<h2>{_esc(title)}</h2>"]
    if summary := day.get("summary"):
        body_parts.append(f"<p>{_esc(summary)}</p>")

    for exercise in day.get("exercises", []):
        image = render_exercise_image(
            exercise, base_dir=base_dir, used=used_image_names
        )
        if image is not None:
            images.append(image)
        body_parts.append(render_exercise_html(exercise, image))

    chapter = epub.EpubHtml(title=title, file_name=file_name, lang="en")
    chapter.content = _wrap_xhtml(title, "\n".join(body_parts))
    return chapter, images


def build_epub(plan: dict[str, Any], *, base_dir: Path) -> epub.EpubBook:
    """Assemble the full :class:`~ebooklib.epub.EpubBook` from a plan dict.

    Args:
        plan: Parsed plan JSON.
        base_dir: Directory used to resolve relative SVG/image paths.

    Returns:
        A fully-populated ePub book ready to write to disk.
    """
    book = epub.EpubBook()
    book.set_identifier(plan.get("id") or str(uuid.uuid4()))
    book.set_title(plan.get("title", "NWB Plan"))
    book.set_language(plan.get("language", "en"))
    for author in plan.get("authors", ["Karl"]):
        book.add_author(author)

    book.add_item(_default_stylesheet())

    spine: list[Any] = ["nav"]
    toc: list[Any] = []
    used_image_names: set[str] = set()

    # Optional intro chapter
    if intro := plan.get("intro"):
        intro_chapter = epub.EpubHtml(
            title="Introduction", file_name="intro.xhtml", lang="en"
        )
        intro_chapter.content = _wrap_xhtml(
            "Introduction", f"<h1>Introduction</h1><p>{_esc(intro)}</p>"
        )
        book.add_item(intro_chapter)
        spine.append(intro_chapter)
        toc.append(intro_chapter)

    for phase in plan.get("phases", []):
        phase_title = phase.get("name", "Phase")
        phase_slug = slugify(phase.get("id") or phase_title)

        phase_overview = epub.EpubHtml(
            title=phase_title,
            file_name=f"{phase_slug}-overview.xhtml",
            lang="en",
        )
        overview_body = [f"<h1>{_esc(phase_title)}</h1>"]
        if desc := phase.get("description"):
            overview_body.append(f"<p>{_esc(desc)}</p>")
        if guidance := phase.get("guidance"):
            bullets = "".join(f"<li>{_esc(g)}</li>" for g in guidance)
            overview_body.append(f"<ul>{bullets}</ul>")
        phase_overview.content = _wrap_xhtml(
            phase_title, "\n".join(overview_body)
        )
        book.add_item(phase_overview)
        spine.append(phase_overview)

        day_chapters: list[epub.EpubHtml] = []
        for idx, day in enumerate(phase.get("days", []), start=1):
            chapter, images = render_day_chapter(
                day,
                phase_slug=phase_slug,
                day_index=idx,
                base_dir=base_dir,
                used_image_names=used_image_names,
            )
            for image in images:
                book.add_item(
                    epub.EpubImage(
                        uid=image.filename,
                        file_name=image.filename,
                        media_type=image.media_type,
                        content=image.data,
                    )
                )
            book.add_item(chapter)
            spine.append(chapter)
            day_chapters.append(chapter)

        toc.append((epub.Section(phase_title, href=phase_overview.file_name),
                    [phase_overview, *day_chapters]))

    book.toc = tuple(toc)
    book.add_item(epub.EpubNcx())
    book.add_item(epub.EpubNav())
    book.spine = spine
    return book


def _default_stylesheet() -> epub.EpubItem:
    """Return a minimal stylesheet tuned for e-ink readability.

    Returns:
        ePub stylesheet item with high-contrast typography rules.
    """
    css = """
    body { font-family: serif; line-height: 1.5; }
    h1 { font-size: 1.6em; margin-top: 1em; }
    h2 { font-size: 1.3em; margin-top: 1.2em; border-bottom: 1px solid #000; }
    h3 { font-size: 1.1em; margin-top: 1em; }
    .exercise-meta { font-style: italic; margin: 0.2em 0 0.6em 0; }
    .exercise-image { text-align: center; margin: 0.8em 0; }
    .exercise-image img { max-width: 95%; height: auto; }
    ul.cues { margin: 0.4em 0 0.8em 1.2em; }
    .safety { border-left: 3px solid #000; padding-left: 0.6em; }
    """
    return epub.EpubItem(
        uid="style",
        file_name="style/style.css",
        media_type="text/css",
        content=css.strip(),
    )


def _wrap_xhtml(title: str, body: str) -> bytes:
    """Wrap a body fragment in a minimal XHTML document.

    Returns ``bytes``, not ``str``: ebooklib 0.20's ``EpubHtml.get_body_content``
    parses ``content`` with lxml's ``fromstring`` which silently returns empty
    bytes when handed a ``str``. That empty body cascades into a
    ``lxml.etree.ParserError: Document is empty`` from the nav builder. The
    bug is reproducible with ``EpubHtml(...).content = "<html>...</html>"`` —
    only the bytes form survives ebooklib's round-trip.
    """
    return f"""<?xml version='1.0' encoding='utf-8'?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<title>{_esc(title)}</title>
<link rel="stylesheet" type="text/css" href="style/style.css" />
</head>
<body>
{body}
</body>
</html>
""".encode("utf-8")


def _esc(text: str) -> str:
    """Escape ``text`` for safe inclusion inside an XHTML element.

    Args:
        text: Arbitrary string.

    Returns:
        XHTML-safe string.
    """
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


def main(argv: list[str] | None = None) -> int:
    """CLI entry point.

    Args:
        argv: Optional arg list (defaults to ``sys.argv[1:]``).

    Returns:
        Process exit code.
    """
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("plan", type=Path, help="Path to the plan JSON file.")
    parser.add_argument(
        "--out",
        type=Path,
        default=Path("nwb-plan.epub"),
        help="Output ePub path (default: nwb-plan.epub).",
    )
    parser.add_argument(
        "--asset-root",
        type=Path,
        default=None,
        help="Directory used to resolve relative SVG/image paths "
        "(default: directory of the plan JSON).",
    )
    args = parser.parse_args(argv)

    plan = json.loads(args.plan.read_text(encoding="utf-8"))
    base_dir = args.asset_root or args.plan.parent
    book = build_epub(plan, base_dir=base_dir)
    epub.write_epub(str(args.out), book)
    print(f"Wrote {args.out} ({args.out.stat().st_size // 1024} KB)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
