"""Ingest the back catalogue in magazine/ into web-ready e-Mag issues.

The source PDFs are print-resolution (~1.1 MB/page, 454 MB for 22 issues). Two
things make them unusable as-is:

  * the flipbook hands the URL to pdf.js, which downloads the WHOLE file before
    it can show page one — 49 MB for the December 2025 issue;
  * the Netlify Blobs route returns a PDF as a function response, and functions
    cap responses near 6 MB, so only the two smallest issues would even serve.

So each issue is rendered once, here, into:

  public/emag/<slug>/pNNN.webp   page images the flipbook loads directly
  public/emag/<slug>/cover.jpg   the Media page's cover thumbnail
  public/emag/<slug>/issue.pdf   a compressed PDF for the Download button

Everything lands under public/emag/ rather than the public/uploads/emag/ the
admin writes to, and that matters: the admin upload action names that directory
with a literal join(), so Next's file tracer resolves it and copies the whole
thing into the serverless bundle. Parking 100 MB of back issues there put the
function over its 250 MB ceiling. Nothing in server code references
public/emag/, so it ships to the CDN only.

and a manifest is written for the seed. Everything derives from a single
150 dpi render pass, so the pixels behind the page images and the download PDF
are identical.

Usage:  python3 scripts/ingest-magazine.py [--only <slug-fragment>]
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "magazine"
PAGES_OUT = ROOT / "public" / "emag"
MANIFEST = ROOT / "data" / "migration" / "emag-issues.json"

RENDER_DPI = 150          # A4 -> ~1241px wide, the master render
PAGE_WIDTH = 993          # book pages; displayed at most ~560px, so this is 1.7x
COVER_WIDTH = 840         # Media page renders the cover at 420px
PDF_QUALITY = 78

MONTHS = {
    "jan": ("January", 1), "feb": ("February", 2), "mar": ("March", 3),
    "apr": ("April", 4), "may": ("May", 5), "jun": ("June", 6),
    "jul": ("July", 7), "aug": ("August", 8), "sep": ("September", 9),
    "oct": ("October", 10), "nov": ("November", 11), "dec": ("December", 12),
}


def parse_name(stem: str) -> tuple[str, int, int]:
    """'Nov 2024' / 'September 2024' -> ('November', 11, 2024)."""
    m = re.match(r"\s*([A-Za-z]+)\s+(\d{4})\s*$", stem)
    if not m:
        raise ValueError(f"cannot parse issue name: {stem!r}")
    key = m.group(1)[:3].lower()
    if key not in MONTHS:
        raise ValueError(f"unknown month in {stem!r}")
    name, num = MONTHS[key]
    return name, num, int(m.group(2))


def render_pages(pdf: Path, workdir: Path) -> list[Path]:
    subprocess.run(
        ["pdftoppm", "-jpeg", "-r", str(RENDER_DPI), str(pdf), str(workdir / "pg")],
        check=True, capture_output=True,
    )
    # pdftoppm zero-pads to the page count's width, so sort on the numeric part
    return sorted(workdir.glob("pg-*.jpg"), key=lambda p: int(re.findall(r"(\d+)$", p.stem)[0]))


def ingest(pdf: Path) -> dict:
    month, month_num, year = parse_name(pdf.stem)
    slug = f"khanatural-emag-{month.lower()}-{year}"
    title = f"Khanatural e-Mag — {month} {year} Issue"

    pages_dir = PAGES_OUT / slug
    if pages_dir.exists():
        shutil.rmtree(pages_dir)
    pages_dir.mkdir(parents=True)

    with tempfile.TemporaryDirectory() as tmp:
        rendered = render_pages(pdf, Path(tmp))
        if not rendered:
            raise RuntimeError(f"no pages rendered from {pdf}")

        pdf_frames: list[Image.Image] = []
        for i, src in enumerate(rendered, start=1):
            im = Image.open(src).convert("RGB")

            w = PAGE_WIDTH
            page = im.resize((w, round(w * im.height / im.width)), Image.LANCZOS)
            page.save(pages_dir / f"p{i:03d}.webp", "WEBP", quality=82, method=6)

            if i == 1:
                cw = COVER_WIDTH
                im.resize((cw, round(cw * im.height / im.width)), Image.LANCZOS).save(
                    pages_dir / "cover.jpg", "JPEG", quality=84, optimize=True, progressive=True
                )

            pdf_frames.append(im)

        # rebuild the download PDF from the same render pass
        out_pdf = pages_dir / "issue.pdf"
        pdf_frames[0].save(
            out_pdf, "PDF", save_all=True, append_images=pdf_frames[1:],
            resolution=float(RENDER_DPI), quality=PDF_QUALITY,
        )
        for f in pdf_frames:
            f.close()

    pages_bytes = sum(p.stat().st_size for p in pages_dir.glob("*.webp"))
    entry = {
        "slug": slug,
        "title": title,
        "excerpt": f"The {month} {year} issue of the Khanatural e-Mag.",
        "coverImage": f"/emag/{slug}/cover.jpg",
        "downloadUrl": f"/emag/{slug}/issue.pdf",
        "pageCount": len(rendered),
        "publishedAt": f"{year}-{month_num:02d}-01T00:00:00.000Z",
    }
    print(
        f"  {slug:<38} {len(rendered):>3} pages  "
        f"pages {pages_bytes/1e6:>5.1f} MB  pdf {out_pdf.stat().st_size/1e6:>5.1f} MB  "
        f"(source {pdf.stat().st_size/1e6:.0f} MB)"
    )
    return entry


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", help="substring filter on the source filename")
    args = ap.parse_args()

    pdfs = sorted(SRC.rglob("*.pdf"))
    if args.only:
        pdfs = [p for p in pdfs if args.only.lower() in str(p).lower()]
    if not pdfs:
        print("no PDFs found", file=sys.stderr)
        return 1

    print(f"ingesting {len(pdfs)} issue(s)")
    entries = [ingest(p) for p in pdfs]
    entries.sort(key=lambda e: e["publishedAt"])

    # merge with any existing manifest so a --only run doesn't drop the rest
    existing = {}
    if MANIFEST.exists():
        existing = {e["slug"]: e for e in json.loads(MANIFEST.read_text())}
    existing.update({e["slug"]: e for e in entries})
    merged = sorted(existing.values(), key=lambda e: e["publishedAt"])
    MANIFEST.write_text(json.dumps(merged, indent=2) + "\n")

    total_pages = sum(e["pageCount"] for e in merged)
    print(f"\nmanifest: {len(merged)} issues, {total_pages} pages -> {MANIFEST.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
