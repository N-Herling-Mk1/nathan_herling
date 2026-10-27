#!/usr/bin/env python3
"""
fetch_icons.py — download the real icon for every entry in data/links.json into the repo.

The Link Dock tool (js/apps/linkdock.js) can only *display* remote icons; it can't
read a site's HTML or save image bytes (CORS). This script runs on your machine:
  1. fetch each site's HTML and parse <link rel="icon" | "apple-touch-icon"> and the
     web-app manifest for declared icons,
  2. rank them by declared size, download the best one that is a real image,
  3. save it to assets/linkicons/<host>.<ext> and rewrite the entry's "icon" to that
     site-root-relative path.

Stdlib only. You review the diff and commit yourself — this script never touches git.

Usage (from anywhere; paths resolve against the repo root):
    python tools/fetch_icons.py                 # data/links.json, skip already-local icons
    python tools/fetch_icons.py --force         # re-fetch everything
    python tools/fetch_icons.py --dry-run       # report what it would do, write nothing
"""
from __future__ import annotations

import argparse
import base64
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from html.parser import HTMLParser
from pathlib import Path

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/130.0 Safari/537.36")
TIMEOUT = 12
MAX_HTML = 2_000_000
MAX_ICON = 2_000_000
ROOT = Path(__file__).resolve().parent.parent   # repo root: tools/ lives directly under it


# ---------------------------------------------------------------- progress
def bar(i: int, n: int, width: int = 24) -> str:
    filled = int(width * i / n) if n else width
    return "[" + "#" * filled + "-" * (width - filled) + f"] {i}/{n}"


def log(msg: str) -> None:
    print(msg, flush=True)


# ---------------------------------------------------------------- http
def get(url: str, limit: int) -> tuple[bytes, str, str]:
    """Return (body, content-type, final-url)."""
    if url.startswith("data:"):
        head, _, payload = url.partition(",")
        ctype = head[5:].split(";")[0] or "application/octet-stream"
        body = base64.b64decode(payload) if ";base64" in head else urllib.parse.unquote_to_bytes(payload)
        return body[:limit], ctype, url
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
        return r.read(limit + 1)[:limit], r.headers.get("Content-Type", ""), r.geturl()


# ---------------------------------------------------------------- html parsing
class IconLinks(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.icons: list[dict] = []
        self.manifest: str | None = None
        self.base: str | None = None

    def handle_starttag(self, tag, attrs):
        a = {k.lower(): (v or "") for k, v in attrs}
        if tag == "base" and a.get("href") and self.base is None:
            self.base = a["href"]
        if tag != "link" or not a.get("href"):
            return
        rel = set(a.get("rel", "").lower().split())
        if "manifest" in rel:
            self.manifest = a["href"]
        if "mask-icon" in rel:          # monochrome Safari pinned-tab SVG — not a real icon
            return
        if rel & {"icon", "apple-touch-icon", "apple-touch-icon-precomposed"}:
            kind = "apple" if any(r.startswith("apple") for r in rel) else "icon"
            self.icons.append({"href": a["href"], "sizes": a.get("sizes", ""),
                               "type": a.get("type", ""), "kind": kind})


def declared_size(sizes: str, kind: str, href: str, ctype: str) -> int:
    s = sizes.lower().strip()
    if s == "any" or href.lower().endswith(".svg") or "svg" in ctype:
        return 512
    nums = [int(x) for x in re.findall(r"(\d+)\s*x\s*\d+", s)]
    if nums:
        return max(nums)
    return 180 if kind == "apple" else 32   # unstated: apple-touch is conventionally 180


# ---------------------------------------------------------------- image sniffing
def sniff(body: bytes, ctype: str) -> tuple[str | None, int]:
    """Return (extension, pixel width if cheaply known) or (None, 0) if not an image."""
    if body.startswith(b"\x89PNG\r\n\x1a\n") and len(body) > 24:
        return "png", int.from_bytes(body[16:20], "big")
    if body[:4] == b"\x00\x00\x01\x00" and len(body) > 7:
        w = body[6] or 256                     # ICO: first directory entry width, 0 means 256
        return "ico", w
    if body[:6] in (b"GIF87a", b"GIF89a"):
        return "gif", int.from_bytes(body[6:8], "little")
    if body[:3] == b"\xff\xd8\xff":
        return "jpg", 0
    if body[:4] == b"RIFF" and body[8:12] == b"WEBP":
        return "webp", 0
    head = body[:512].lstrip().lower()
    if b"<svg" in head or (head.startswith(b"<?xml") and b"<svg" in body[:4096].lower()) or "svg" in ctype:
        return ("svg", 512) if b"<svg" in body[:4096].lower() else (None, 0)
    return None, 0


# ---------------------------------------------------------------- per-link work
def candidates_for(page_url: str, prior_icon: str) -> tuple[list[dict], str]:
    """Collect ranked icon candidates. Returns (candidates, note)."""
    cands: list[dict] = []
    note = ""
    final = page_url
    try:
        body, ctype, final = get(page_url, MAX_HTML)
        charset = re.search(r"charset=([\w-]+)", ctype or "")
        html = body.decode(charset.group(1) if charset else "utf-8", errors="replace")
        p = IconLinks()
        p.feed(html)
        base = urllib.parse.urljoin(final, p.base) if p.base else final
        for ic in p.icons:
            url = urllib.parse.urljoin(base, ic["href"])
            cands.append({"url": url, "size": declared_size(ic["sizes"], ic["kind"], url, ic["type"]),
                          "why": f'<link {ic["kind"]}{" " + ic["sizes"] if ic["sizes"] else ""}>'})
        if p.manifest:
            murl = urllib.parse.urljoin(base, p.manifest)
            try:
                mbody, _, mfinal = get(murl, MAX_HTML)
                for ic in json.loads(mbody.decode("utf-8", errors="replace")).get("icons", []):
                    purpose = ic.get("purpose", "")
                    if not ic.get("src") or ("maskable" in purpose and "any" not in purpose):
                        continue
                    url = urllib.parse.urljoin(mfinal, ic["src"])
                    cands.append({"url": url, "size": declared_size(ic.get("sizes", ""), "icon", url, ic.get("type", "")),
                                  "why": "manifest"})
            except Exception as e:  # manifest is optional
                note = f"manifest skipped ({type(e).__name__})"
    except Exception as e:
        note = f"page fetch failed ({type(e).__name__}: {e})"

    origin = "{0.scheme}://{0.netloc}".format(urllib.parse.urlsplit(final))
    cands.append({"url": origin + "/apple-touch-icon.png", "size": 179, "why": "/apple-touch-icon.png"})
    cands.append({"url": origin + "/favicon.ico", "size": 31, "why": "/favicon.ico"})
    if prior_icon.startswith("http"):
        cands.append({"url": prior_icon, "size": 1, "why": "page's pick"})

    seen, ranked = set(), []
    for c in sorted(cands, key=lambda c: -c["size"]):
        if c["url"] not in seen:
            seen.add(c["url"])
            ranked.append(c)
    return ranked, note


def safe_name(host: str) -> str:
    return re.sub(r"[^a-z0-9.-]", "_", host.lower().removeprefix("www.")) or "site"


def process(entry: dict, out_dir: Path, rel_prefix: str, dry: bool) -> tuple[str, str]:
    url = entry["url"]
    host = urllib.parse.urlsplit(url).hostname or "site"
    ranked, note = candidates_for(url, entry.get("icon", ""))
    for c in ranked:
        try:
            body, ctype, _ = get(c["url"], MAX_ICON)
        except Exception:
            continue
        ext, w = sniff(body, ctype)
        if not ext or len(body) < 64:
            continue
        name = f"{safe_name(host)}.{ext}"
        if not dry:
            out_dir.mkdir(parents=True, exist_ok=True)
            for old in out_dir.glob(f"{safe_name(host)}.*"):   # replace any older format
                old.unlink()
            (out_dir / name).write_bytes(body)
            entry["icon"] = f"{rel_prefix}{name}"
            entry["iconSource"] = f"scraped: {c['why']} {c['url'][:200]}"
        size = f"{w}px" if w else "size n/a"
        return "ok", f"{ext} {size} {len(body)/1024:.1f} KB via {c['why']}" + (f" · {note}" if note else "")
    return "fail", note or "no candidate returned an image"


# ---------------------------------------------------------------- main
def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("links", nargs="?", default=str(ROOT / "data" / "links.json"))
    ap.add_argument("--force", action="store_true", help="re-fetch entries that already have a local icon")
    ap.add_argument("--dry-run", action="store_true", help="probe and report, write nothing")
    args = ap.parse_args()

    path = Path(args.links)
    if not path.is_file():
        log(f"error: {path} not found")
        return 2
    data = json.loads(path.read_text(encoding="utf-8"))
    entries = data["links"] if isinstance(data, dict) else data
    out_dir = ROOT / "assets" / "linkicons"
    rel_prefix = "assets/linkicons/"          # resolved against index.html at the site root

    todo = []
    for e in entries:
        icon = e.get("icon", "")
        local = icon and not icon.startswith(("http:", "https:", "data:"))
        if local and (ROOT / icon).is_file() and not args.force:
            continue
        todo.append(e)

    log(f"{path}: {len(entries)} links, {len(todo)} to fetch, {len(entries) - len(todo)} already local"
        + (" (dry run)" if args.dry_run else ""))
    if not todo:
        return 0

    ok = fail = 0
    t0 = time.time()
    for i, e in enumerate(todo, 1):
        host = urllib.parse.urlsplit(e["url"]).hostname
        log(f"{bar(i - 1, len(todo))}  {host} …")
        result, detail = process(e, out_dir, rel_prefix, args.dry_run)
        ok += result == "ok"
        fail += result == "fail"
        log(f"    {'OK  ' if result == 'ok' else 'FAIL'} {detail}")
    log(f"{bar(len(todo), len(todo))}  done in {time.time() - t0:.1f}s — {ok} ok, {fail} failed")

    if not args.dry_run and ok:
        if isinstance(data, dict):
            data["updated"] = time.strftime("%Y-%m-%d")
        path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        log(f"wrote {path}; icons in {out_dir}")
        log("review with `git status` / `git diff`, then commit yourself.")
    return 0 if fail == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
