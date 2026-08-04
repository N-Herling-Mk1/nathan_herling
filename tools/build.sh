#!/bin/sh
# Regenerate the three build artefacts. Only needed after editing js/*.js,
# assets/data/signature.json, assets/audio/spark_5s.mp3, or assets/fonts/*.
#
# The site itself needs NO build step and NO server to run — index.html opens
# straight off disk. This script exists only to rebuild the compiled-in copies
# when their sources change.
#
#   js/site.js     classic bundle of the js/ modules   (esbuild)
#   js/sigdata.js  assets/data/signature.json inlined  (python3)
#   js/sfxdata.js  assets/audio/*.mp3 inlined            (python3)
#   css/fonts.css  assets/fonts/*.woff2 inlined        (python3)
#   assets/cv/page-*.png  the CV rendered page by page  (pdftoppm)
#
# Two steps need binaries that are not always installed. They used to warn and
# carry on, which is how js/vodata.js shipped empty for a whole round: the cube
# fell back to a synthetic stand-in and nothing said so again. They now stop the
# build. Set NH_ALLOW_MISSING=1 to skip them deliberately.
set -e

need() {
  command -v "$1" >/dev/null 2>&1 && return 0
  if [ "$NH_ALLOW_MISSING" = "1" ]; then
    echo "  ! $1 not found — SKIPPING $2 (NH_ALLOW_MISSING=1)"; return 1
  fi
  echo "  ! $1 not found, and it is needed for $2." >&2
  echo "    Install it, or re-run with NH_ALLOW_MISSING=1 to skip on purpose." >&2
  exit 1
}
cd "$(dirname "$0")/.."

npx esbuild --bundle js/main.js --outfile=js/site.js --format=iife \
  --banner:js="/* GENERATED — do not edit. Built from the js/ modules by tools/build.sh. */"

python3 - <<'PY'
import json, base64
sig = json.load(open('assets/data/signature.json'))
open('js/sigdata.js','w').write(
  "// GENERATED — mirrors assets/data/signature.json.\n"
  "export const SIG_DATA = " + json.dumps(sig, separators=(',',':')) + ";\n")
def uri(path):
    return base64.b64encode(open(path,'rb').read()).decode()
open('js/sfxdata.js','w').write(
  "// GENERATED — mirrors the files in assets/audio/ (fallbacks only).\n"
  "export const SPARK_DATA = 'data:audio/mpeg;base64," + uri('assets/audio/spark_5s.mp3') + "';\n"
  "export const LOOP_DATA  = 'data:audio/mpeg;base64," + uri('assets/audio/hover_loop.mp3') + "';\n")
PY
# ---- CV page images ------------------------------------------------------
# The CV panel shows rendered pages, not a framed pdf: Chromium will not display
# a file:// subresource document, so an iframe cannot paint when index.html is
# opened off disk. An <img> is an ordinary subresource and does. Page list lives
# in js/config.js -> CFG.panels[0].pages.
if need pdftoppm "the CV page images"; then
  CV=assets/cv/NHerling_CV_2026.pdf
  if [ -f "$CV" ]; then
    rm -f assets/cv/page-*.png
    pdftoppm -r 144 -png -aa yes -aaVector yes "$CV" assets/cv/page
    python3 - <<'PY2' || echo "  (Pillow not installed — pages left unquantised)"
from PIL import Image
import glob, os
for f in sorted(glob.glob('assets/cv/page-*.png')):
    Image.open(f).convert('L').convert('P', palette=Image.ADAPTIVE, colors=32) \
         .save(f, optimize=True)
    print('  cv page %-22s %4d KB' % (os.path.basename(f), os.path.getsize(f)//1024))
PY2
    echo "  NOTE: if the page count changed, update CFG.panels[0].pages in js/config.js"
  else
    echo "  (no $CV — CV pages skipped)"
  fi
fi

# ---- narration envelopes -------------------------------------------------
# Measures the real RMS of every assets/audio/voice/vo_*.wav at 50 Hz and writes
# js/vodata.js. This is what lets the cube react to the ACTUAL signal on a
# file:// open, where Web Audio cannot analyse a media element. Needs ffmpeg;
# Hard requirement now: an empty VO_ENV is silent breakage, not a soft failure.
need ffmpeg "the narration envelopes"
python3 - <<'PY'
import glob, json, os, subprocess, array, math

HZ = 50                      # must match CFG.voice.envHz
SR = 16000
BANDS = {'b': 'lowpass=f=200',
         'v': 'highpass=f=200,lowpass=f=3000',
         'h': 'highpass=f=3000'}

def pcm(path, filt=None):
    cmd = ['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR)]
    if filt: cmd += ['-af', filt]
    cmd += ['-f', 's16le', '-']
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    a = array.array('h'); a.frombytes(raw[: len(raw) // 2 * 2]); return a

def envelope(a):
    win = SR // HZ
    out = []
    for i in range(0, len(a), win):
        seg = a[i:i + win]
        if not seg: break
        out.append(math.sqrt(sum(v * v for v in seg) / len(seg)) / 32768.0)
    return out

files = sorted(glob.glob('assets/audio/voice/vo_*.wav'))
out = {}
if not files:
    print('  (no assets/audio/voice/vo_*.wav yet — envelopes skipped)')
else:
    print('  %d voice lines found' % len(files))
for f in files:
    key = os.path.basename(f)[3:].rsplit('.', 1)[0]
    try:
        tracks = {'rms': envelope(pcm(f))}
        for k, filt in BANDS.items():
            tracks[k] = envelope(pcm(f, filt))
    except Exception as e:
        print('  ! could not read %s (%s)' % (f, e)); continue
    n = min(len(v) for v in tracks.values())
    # One shared peak across all four tracks, so the band balance the rig was
    # tuned against survives — normalising each band separately would flatten it.
    peak = max((max(v[:n]) for v in tracks.values()), default=0.0) or 1.0
    out[key] = {k: [min(255, int(round(x / peak * 255))) for x in v[:n]]
                for k, v in tracks.items()}
    print('  envelope %-14s %4d samples x4 bands' % (key, n))

open('js/vodata.js', 'w').write(
  "// GENERATED — RMS envelopes for assets/audio/voice/, at 50 Hz.\n"
  "// Per line: full-band `rms` plus `b` / `v` / `h` band tracks, all sharing\n"
  "// one peak normalisation. Rebuilt by tools/build.sh. See js/voice.js.\n"
  "export const VO_ENV = " + json.dumps(out, separators=(',', ':')) + ";\n")
PY

npx esbuild --bundle js/main.js --outfile=js/site.js --format=iife \
  --banner:js="/* GENERATED — do not edit. Built from the js/ modules by tools/build.sh. */"

echo "rebuilt js/site.js, js/sigdata.js, js/sfxdata.js, js/vodata.js, assets/cv/page-*.png"
python3 - <<'PY'
import json, re
env = re.search(r'export const VO_ENV = (\{.*\});', open('js/vodata.js').read(), re.S)
n = len(json.loads(env.group(1))) if env else 0
print('  check: %d narration envelopes in js/vodata.js%s' % (n, '' if n else '  <-- EMPTY, cube will run on synthetic level'))
PY
