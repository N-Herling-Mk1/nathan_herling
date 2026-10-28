#!/usr/bin/env python3
"""
build_gallery.py — rebuild data/gallery.json (and thumbnails) from assets/gallery/.

Layout:
    assets/gallery/<album-id>/<image>.png|jpg|jpeg|webp|gif
    assets/gallery/<album-id>/_thumbs/<image>.webp      (generated)

Each sub-folder of assets/gallery/ is an album. The manifest is MERGED, not
regenerated: titles, captions, groups, album titles/notes/groups and image order
you edited in data/gallery.json are kept. New files are appended (sorted by name) with a title
derived from the file name; entries whose file is gone are dropped and listed.

Thumbnails (480 px wide WebP) need Pillow:  pip install pillow
Without it the manifest still builds; the viewer then uses the full images.

Never touches git — review the diff and commit yourself.

Usage:
    python tools/build_gallery.py               # scan, merge, make missing thumbs
    python tools/build_gallery.py --dry-run     # report only, write nothing
    python tools/build_gallery.py --rethumb     # regenerate every thumbnail
"""
from __future__ import annotations

import argparse
import json
import re
import struct
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GALLERY = ROOT / "assets" / "gallery"
MANIFEST = ROOT / "data" / "gallery.json"
EXTS = {".png", ".jpg", ".jpeg", ".webp", ".gif"}
THUMB_W = 480

try:
    from PIL import Image
except ImportError:          # thumbnails are optional
    Image = None


def bar(i: int, n: int, width: int = 24) -> str:
    f = int(width * i / n) if n else width
    return "[" + "#" * f + "-" * (width - f) + f"] {i}/{n}"


def log(msg: str) -> None:
    print(msg, flush=True)


def title_from(name: str) -> str:
    stem = Path(name).stem
    stem = re.sub(r"^\d+[_\-\s]*", "", stem)            # leading sort prefix: 003_
    stem = re.sub(r"[_\-]+", " ", stem).strip()
    return stem or Path(name).stem


def size_of(path: Path) -> tuple[int, int]:
    if Image:
        try:
            with Image.open(path) as im:
                return im.size
        except Exception:
            return 0, 0
    head = path.read_bytes()[:32]                       # PNG header fallback
    if head.startswith(b"\x89PNG\r\n\x1a\n"):
        return struct.unpack(">II", head[16:24])
    return 0, 0


def make_thumb(src: Path, dst: Path) -> bool:
    if not Image:
        return False
    try:
        with Image.open(src) as im:
            im = im.convert("RGBA") if im.mode in ("P", "LA") else im
            if im.width > THUMB_W:
                im = im.resize((THUMB_W, max(1, round(im.height * THUMB_W / im.width))), Image.LANCZOS)
            dst.parent.mkdir(parents=True, exist_ok=True)
            im.save(dst, "WEBP", quality=82, method=6)
        return True
    except Exception as e:
        log(f"    ! thumbnail failed for {src.name}: {e}")
        return False


def rel(p: Path) -> str:
    return p.relative_to(ROOT).as_posix()


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--dry-run", action="store_true", help="report only, write nothing")
    ap.add_argument("--rethumb", action="store_true", help="regenerate every thumbnail")
    args = ap.parse_args()

    old = {"albums": []}
    if MANIFEST.is_file():
        try:
            old = json.loads(MANIFEST.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            log(f"error: {MANIFEST} is not valid JSON ({e}) — fix or delete it first")
            return 2
    old_albums = {a.get("id"): a for a in old.get("albums", []) if a.get("id")}

    if not GALLERY.is_dir():
        log(f"no {rel(GALLERY)}/ yet — create it and add an album folder, e.g. assets/gallery/spring-2027/")
        return 1
    folders = sorted(d for d in GALLERY.iterdir() if d.is_dir() and not d.name.startswith((".", "_")))
    # album order: as already listed in the manifest, then new folders by name
    known = [a for a in old_albums if (GALLERY / a).is_dir()]
    order = known + [d.name for d in folders if d.name not in old_albums]

    if not Image:
        log("  (Pillow not installed — thumbnails skipped; pip install pillow)")

    work = []  # (album_id, path) for progress
    plan = {}
    for aid in order:
        files = sorted(p for p in (GALLERY / aid).iterdir() if p.is_file() and p.suffix.lower() in EXTS)
        plan[aid] = files
        work += [(aid, f) for f in files]

    log(f"{rel(GALLERY)}: {len(order)} album(s), {len(work)} image(s)" + (" (dry run)" if args.dry_run else ""))

    albums, added, dropped, thumbs = [], [], [], 0
    done = 0
    t0 = time.time()
    for aid in order:
        prev = old_albums.get(aid, {})
        prev_imgs = {im.get("file"): im for im in prev.get("images", []) if im.get("file")}
        files = {rel(f): f for f in plan[aid]}
        ordered = [k for k in (im.get("file") for im in prev.get("images", [])) if k in files]
        ordered += [k for k in files if k not in prev_imgs]
        dropped += [k for k in prev_imgs if k not in files]

        images = []
        for key in ordered:
            f = files[key]
            done += 1
            log(f"{bar(done, len(work))}  {aid}/{f.name}")
            p = prev_imgs.get(key, {})
            if not p:
                added.append(key)
            w, h = size_of(f)
            thumb_path = f.parent / "_thumbs" / (f.stem + ".webp")
            stale = not thumb_path.exists() or thumb_path.stat().st_mtime < f.stat().st_mtime
            if (stale or args.rethumb) and not args.dry_run and Image:
                if make_thumb(f, thumb_path):
                    thumbs += 1
            entry = {
                "file": key,
                "thumb": rel(thumb_path) if (thumb_path.exists() or (args.dry_run and Image)) else "",
                "title": p.get("title") or title_from(f.name),
                "caption": p.get("caption", ""),
                "w": w, "h": h,
            }
            # keep anything else hand-written on the entry (e.g. "group")
            entry.update({k: v for k, v in p.items() if k not in entry})
            images.append(entry)
        album = {
            "id": aid,
            "title": prev.get("title") or title_from(aid).title(),
            "notes": prev.get("notes", ""),
        }
        # keep hand-written album fields (e.g. "groups") — only images are rebuilt
        album.update({k: v for k, v in prev.items() if k not in album and k != "images"})
        album["images"] = images
        albums.append(album)

    for a in old_albums:
        if a not in order:
            log(f"  album '{a}' has no folder any more — dropped from the manifest")

    log(f"done in {time.time() - t0:.1f}s — {len(added)} new, {len(dropped)} removed, {thumbs} thumbnail(s) written")
    for k in added:
        log(f"  + {k}")
    for k in dropped:
        log(f"  - {k}  (file missing)")

    if args.dry_run:
        return 0
    out = {"updated": time.strftime("%Y-%m-%d"), "albums": albums}
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(json.dumps(out, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    log(f"wrote {rel(MANIFEST)} — review with git diff, then commit yourself")
    return 0


if __name__ == "__main__":
    sys.exit(main())
