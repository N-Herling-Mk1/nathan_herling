#!/usr/bin/env python3
"""Regenerate the favicon ladder from the NH mark.

    python3 assets/brand/make_icons.py

Source is brand/nh_ico_mk1_source.png. The circle is masked out of the square
artwork, which also drops the watermark badge that sits in the top-right corner
outside the ring. Small sizes get a contrast + unsharp pass, because LANCZOS
downscaling softens the thin ring and the NH counters until they mush.
"""
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE.parent
CX, CY, R = 512, 504, 436          # ring centre and outer radius in the source
SS = 4                             # mask supersample
SIZES = [16, 24, 32, 48, 64, 128, 256]

im = Image.open(HERE / 'nh_ico_mk1_source.png').convert('RGBA')
pad = int(R * 0.045)
crop = im.crop((CX - R - pad, CY - R - pad, CX + R + pad, CY + R + pad))
S = crop.size[0]

mask = Image.new('L', (S * SS, S * SS), 0)
ImageDraw.Draw(mask).ellipse([pad * SS, pad * SS, (pad + 2 * R) * SS, (pad + 2 * R) * SS], fill=255)
crop.putalpha(mask.resize((S, S), Image.LANCZOS))
crop.save(HERE / 'nh_mark.png')

def variant(size, boost):
    v = crop.resize((size, size), Image.LANCZOS)
    if boost > 1.0:
        rgb = ImageEnhance.Contrast(v.convert('RGB')).enhance(boost)
        rgb = ImageEnhance.Color(rgb).enhance(1.12)
        if size <= 32:
            rgb = rgb.filter(ImageFilter.UnsharpMask(radius=1, percent=140, threshold=0))
        v = Image.merge('RGBA', (*rgb.split(), v.split()[3]))
    return v

imgs = {s: variant(s, 1.30 if s <= 48 else 1.06) for s in SIZES}
imgs[256].save(OUT / 'favicon.ico', format='ICO', sizes=[(s, s) for s in SIZES],
               append_images=[imgs[s] for s in SIZES if s != 256])
imgs[16].save(OUT / 'favicon-16.png')
imgs[32].save(OUT / 'favicon-32.png')
crop.resize((180, 180), Image.LANCZOS).save(OUT / 'apple-touch-icon.png')
crop.resize((192, 192), Image.LANCZOS).save(OUT / 'icon-192.png')
crop.resize((512, 512), Image.LANCZOS).save(OUT / 'icon-512.png')
print('icons written to', OUT)
