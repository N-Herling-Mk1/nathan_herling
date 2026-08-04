#!/usr/bin/env python3
"""Render the social cards from tools/og-card.html.

    python3 tools/make-og.py

Needs playwright + pillow. Writes assets/og/og-card.png (1200x630) and
assets/og/og-card-square.png (1200x1200), then quantizes both — flat dark
artwork, so 192 colours is invisible and about a third of the bytes.

Drawn from the site's own signature vectors and CFG palette, so the card cannot
drift away from the identity placard in rail slot L3.
"""
import threading, http.server, socketserver, functools, os
from playwright.sync_api import sync_playwright
import pathlib
ROOT=str(pathlib.Path(__file__).resolve().parent.parent); PORT=8907
os.makedirs(ROOT+"/assets/og", exist_ok=True)
H=functools.partial(http.server.SimpleHTTPRequestHandler,directory=ROOT)
socketserver.TCPServer.allow_reuse_address=True
s=socketserver.TCPServer(("127.0.0.1",PORT),H)
threading.Thread(target=s.serve_forever,daemon=True).start()
jobs=[(1200,630,"og-card.png"),(1200,1200,"og-card-square.png")]
with sync_playwright() as p:
    b=p.chromium.launch()
    for w,h,name in jobs:
        pg=b.new_page(viewport={"width":w,"height":h}, device_scale_factor=1)
        errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto(f"http://127.0.0.1:{PORT}/tools/og-card.html?w={w}&h={h}")
        pg.wait_for_selector("body[data-ready='1']", timeout=15000)
        pg.wait_for_timeout(400)
        out=f"{ROOT}/assets/og/{name}"
        pg.locator("#card").screenshot(path=out)
        from PIL import Image
        Image.open(out).convert("RGB").quantize(colors=192).save(out, optimize=True)
        print(f"  {name}: {w}x{h}  errors={errs or 'none'}")
        pg.close()
    b.close()
