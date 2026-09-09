#!/usr/bin/env python3
"""
Export the beach/studio campaign in newimages/ to web-ready files.

The WordPress-era product photography is not different photography — it is the
SAME shoots, saved out by WordPress at 600-1280px and recompressed. newimages/
holds the originals at 2400-8256px, so almost every swap below is the identical
frame at roughly four times the resolution rather than a change of picture.

Sources stay out of git (see /newimages/ in .gitignore); only these exports ship.

Sizes are driven by how each image is actually rendered:
  PRODUCT (2400px) – ProductGallery crops to a square at 50vw, so the SHORT edge
                     is what gets displayed. 2400 on the long edge leaves 1600 on
                     the short edge of a 3:2 frame, enough for 2x on a laptop.
  WIDE    (3000px) – full-bleed banners run at sizes="100vw".

    python3 scripts/export-newimages.py [--force]

Existing files are left alone unless --force, so re-running is cheap.
"""
import sys
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "newimages"
PRODUCTS = ROOT / "public" / "images" / "products"
SHOOT = ROOT / "public" / "images" / "shoot"

PRODUCT_PX = 2400
WIDE_PX = 3000
QUALITY = 82

# (source file, destination, long-edge cap)
MANIFEST = [
    # ---- All Natural Scrub -------------------------------------------------
    ("DSC08057.jpg", PRODUCTS / "all-natural-scrub-sand.jpg", PRODUCT_PX),
    ("DSC08695.jpg", PRODUCTS / "all-natural-scrub-surf.jpg", PRODUCT_PX),
    ("DSC08536.jpg", PRODUCTS / "all-natural-scrub-in-use.jpg", PRODUCT_PX),
    ("DSC08556.jpg", PRODUCTS / "all-natural-scrub-applying.jpg", PRODUCT_PX),
    # ---- Sea Moss Lotion ---------------------------------------------------
    ("DSC07720.jpg", PRODUCTS / "seamoss-lotion-dune-front.jpg", PRODUCT_PX),
    ("DSC07723.jpg", PRODUCTS / "seamoss-lotion-dune-angle.jpg", PRODUCT_PX),
    ("DSC08066.jpg", PRODUCTS / "seamoss-lotion-sand-trio.jpg", PRODUCT_PX),
    ("DSC08320.jpg", PRODUCTS / "seamoss-lotion-in-use.jpg", PRODUCT_PX),
    # ---- Reviving Facial Oil ----------------------------------------------
    ("DSC08092.jpg", PRODUCTS / "reviving-facial-oil-rock.jpg", PRODUCT_PX),
    # also stands in for the Our Brand editorial image, which pointed at the
    # 1024px WordPress export of this same frame
    ("DSC07708.jpg", PRODUCTS / "reviving-facial-oil-dune.jpg", PRODUCT_PX),
    # ---- Black Elderberry --------------------------------------------------
    ("DSC08930.jpg", PRODUCTS / "black-elderberry-rock-portrait.jpg", PRODUCT_PX),
    ("DSC08777.jpg", PRODUCTS / "black-elderberry-capsules-palm.jpg", PRODUCT_PX),
    ("DSC08753.jpg", PRODUCTS / "black-elderberry-held.jpg", PRODUCT_PX),
    ("DSC08970.jpg", PRODUCTS / "black-elderberry-rock-shore.jpg", PRODUCT_PX),
    ("DSC08955.jpg", PRODUCTS / "black-elderberry-shore-wide.jpg", PRODUCT_PX),
    # ---- Honey / Coco Avo Butter / Turmeric soap ---------------------------
    ("Khanatural shoot-1505(1).jpg", PRODUCTS / "khanatural-honey-jars.jpg", PRODUCT_PX),
    ("Khanatural-shoot-1369.jpg", PRODUCTS / "coco-avocado-butter-held.jpg", PRODUCT_PX),
    ("untitled folder 4_1P7A3292 copy1709196307578.jpg", PRODUCTS / "turmeric-soap-held.jpg", PRODUCT_PX),
    # ---- Brand / lifestyle -------------------------------------------------
    # replaces brand/khabo.jpg, the last WordPress frame referenced from code:
    # same couple subject, natively portrait for that tall panel, 4x the pixels
    ("KGZ_36271717425145264.jpg", SHOOT / "couple-robes.jpg", WIDE_PX),
    # the whole range on one plinth — the category heroes were repeating the
    # shop hero, and "Shop by range" now has a picture of the range
    ("DSC04992.jpg", SHOOT / "range-studio-seated.jpg", WIDE_PX),
    ("DSC09291.jpg", SHOOT / "beach-shore-walk.jpg", WIDE_PX),
    ("DSC07849.jpg", SHOOT / "beach-friends-tea.jpg", WIDE_PX),
    # under "Join the movement / Shop the range" on Our Brand, in place of the
    # other WordPress frame that was still in the code
    ("DSC09335.jpg", SHOOT / "beach-bag-leap.jpg", WIDE_PX),
]

# Not exported, for two different reasons.
#
# DSC09278 is behind-the-scenes: the photographer is in the frame.
#
# The rest are good frames with nowhere to go YET. Every WordPress image on the
# site has now been replaced, and the only slots left hold photography from the
# earlier shoots that the client has already signed off — so putting these in
# would mean overwriting approved artwork, not sweeping old artwork. Six frames,
# two of them alternates from takes already used above:
#
#   DSC04997 / DSC04998  the range plinth, two more poses
#   DSC09343 / DSC09346  more of the model with the KhaNatural bag on the rocks
#   KGZ_3634             close-up skin and neck
#
# Say where they should go and they are a line each.
HELD = [
    "DSC04997.jpg",
    "DSC04998.jpg",
    "DSC09343.jpg",
    "DSC09346.jpg",
    "KGZ_36341717425145264.jpg",
]


def main() -> int:
    force = "--force" in sys.argv
    missing = [name for name, _, _ in MANIFEST if not (SRC / name).exists()]
    if missing:
        print(f"missing {len(missing)} source file(s) in {SRC}:")
        for m in missing:
            print(f"  {m}")
        return 1

    total = 0
    for name, dest, cap in MANIFEST:
        if dest.exists() and not force:
            print(f"  skip  {dest.relative_to(ROOT)} (exists)")
            continue
        with Image.open(SRC / name) as im:
            im = ImageOps.exif_transpose(im).convert("RGB")
            before = im.size
            im.thumbnail((cap, cap), Image.LANCZOS)
            dest.parent.mkdir(parents=True, exist_ok=True)
            # progressive + optimize: these are large photographs on slow mobile
            # connections, and the shop is South-Africa-first
            im.save(dest, "JPEG", quality=QUALITY, optimize=True, progressive=True)
        kb = dest.stat().st_size / 1024
        total += dest.stat().st_size
        print(f"  ok    {dest.relative_to(ROOT)}  {before[0]}x{before[1]} -> {im.size[0]}x{im.size[1]}  {kb:.0f}KB")

    print(f"\n{len(MANIFEST)} exports, {total / 1e6:.1f} MB written")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
