// ============ SPLASH — URL PLATE ============
// The website name, rendered to a canvas so it can be sheared per scanline.
//
// The CSS version of this used two clip-path bands stepping sideways. At the
// size the name is drawn, a clip band is dozens of pixels tall, so the tear
// moved in big rectangular chunks — the "clumsy pixelation". Real horizontal
// shear displaces EVERY scanline by its own amount, which needs pixel access.
//
// So: draw the text once into an offscreen at device resolution, then blit it
// back one row-band at a time with a per-band horizontal offset. Bands are
// 1-2 device pixels, so the displacement reads as a continuous distortion of
// the glyph edges rather than as blocks moving.

import { CFG } from './config.js';

let host = null, cv = null, ctx = null, off = null, octx = null;
let W = 0, H = 0, DPR = 1, ready = false, t0 = 0;

const TEXT = () => CFG.domain;
/* Explicit, not read off the element: the h1 is painted transparent so the
   canvas is the only visible layer, which makes its computed colour useless. */
const INK = '#ff4a3d';

/* Value noise: smooth between integer stops, so a band's offset is related to
   its neighbours'. White noise per row would just look like static; this is
   what makes it read as a signal wobbling rather than sand. */
function hash(n) {
  const s = Math.sin(n * 12.9898) * 43758.5453;
  return (s - Math.floor(s)) * 2 - 1;
}
function vnoise(x) {
  const i = Math.floor(x), f = x - i;
  const u = f * f * (3 - 2 * f);
  return hash(i) * (1 - u) + hash(i + 1) * u;
}

export function init(el) {
  host = el;
  if (!host) return;
  cv = document.createElement('canvas');
  cv.className = 'name-plate';
  cv.setAttribute('aria-hidden', 'true');
  host.appendChild(cv);
  ctx = cv.getContext('2d');
  off = document.createElement('canvas');
  octx = off.getContext('2d');
  t0 = performance.now();
  measure();
}

/* Redraw the source plate. Called on resize and once fonts settle — a canvas
   drawn before the webfont loads bakes in the fallback face. */
export function measure() {
  if (!host || !cv) return;
  const r = host.getBoundingClientRect();
  if (r.width < 8 || r.height < 8) { ready = false; return; }
  DPR = Math.min(window.devicePixelRatio || 1, 2);

  // room either side for the shear to throw into without clipping
  const padX = Math.round(r.height * 0.5);
  W = Math.round(r.width) + padX * 2;
  H = Math.round(r.height * 1.5);

  cv.width = W * DPR; cv.height = H * DPR;
  cv.style.width = W + 'px'; cv.style.height = H + 'px';
  cv.style.left = -padX + 'px';
  cv.style.top = Math.round((r.height - H) / 2) + 'px';
  off.width = cv.width; off.height = cv.height;

  const cs = getComputedStyle(host);
  const g = octx;
  g.setTransform(DPR, 0, 0, DPR, 0, 0);
  g.clearRect(0, 0, W, H);
  g.font = cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.letterSpacing = cs.letterSpacing;      // ignored where unsupported

  /* Crisp. The previous version drew the text twice through shadowBlur at 22%
     and 55% of the plate height — that was not a glow, it was the blur, baked
     into the source before a single row had moved. Shearing a blurred plate
     just smears it further. One flat pass, no shadow. */
  g.shadowBlur = 0;
  g.fillStyle = INK;
  g.fillText(TEXT(), W / 2, H / 2);
  ready = true;
}

/* Aperiodic gate. Bursts arrive at irregular intervals and last a short,
   irregular time — a periodic wobble stops reading as a fault within about two
   cycles, which is what the travelling sine wave did. Between bursts the plate
   is completely still and completely sharp. */
let burstUntil = 0, nextBurst = 0, burstAmp = 0, burstSeed = 0;

function gate(t) {
  if (t > burstUntil) {
    if (t > nextBurst) {
      burstUntil = t + 0.06 + Math.random() * 0.22;   // 60-280ms of activity
      nextBurst  = burstUntil + 0.14 + Math.random() * 1.5;
      burstAmp   = 0.55 + Math.random() * 0.85;
      burstSeed  = Math.random() * 1000;
    }
    return 0;
  }
  return burstAmp;
}

export function frame(now) {
  if (!ready) return;
  const t = (now - t0) / 1000;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, cv.width, cv.height);

  const band = Math.max(1, Math.round(DPR));
  const rows = Math.ceil(cv.height / band);
  const px = DPR;
  const amp = gate(t);

  // during a burst, a slab of rows is affected rather than the whole plate
  const slabTop = amp > 0 ? (vnoise(burstSeed) * 0.5 + 0.5) * cv.height : 0;
  const slabH   = amp > 0 ? cv.height * (0.16 + 0.62 * Math.abs(vnoise(burstSeed + 7))) : 0;

  for (let i = 0; i < rows; i++) {
    const y = i * band;
    let dx = 0;

    if (amp > 0 && y >= slabTop && y < slabTop + slabH) {
      // static: adjacent rows uncorrelated, so it reads as noise on the line
      // rather than as the plate leaning
      dx = hash(y * 0.37 + burstSeed + Math.floor(t * 110)) * amp * 5.4 * px;
      // one or two rows per burst throw much further
      if (hash(y + burstSeed * 3) > 0.90) dx += hash(y - burstSeed) * amp * 22 * px;
    }

    // very sparse idle twitch, so the plate is never quite dead
    if (dx === 0 && hash(y * 0.91 + Math.floor(t * 10)) > 0.995) dx = px * 2 * (hash(y + t) > 0 ? 1 : -1);

    if (dx === 0) ctx.drawImage(off, 0, y, cv.width, band, 0, y, cv.width, band);
    else          ctx.drawImage(off, 0, y, cv.width, band, dx, y, cv.width, band);
  }

  /* Cathode comb, CUT OUT of the glyphs rather than painted over them.
     `multiply` against a transparent backdrop still lays down ink, so the comb
     was drawing black lines across the whole canvas rectangle — a faintly
     darker box sitting on the page background, which is why the element read as
     slightly off-colour. `destination-out` removes alpha instead of adding
     colour: the lines appear only where there is ink to cut, and everywhere
     else the canvas stays perfectly transparent. */
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = 'rgba(0,0,0,.62)';
  const step = Math.max(2, Math.round(3 * DPR));
  for (let y = 0; y < cv.height; y += step) ctx.fillRect(0, y, cv.width, 1);
  ctx.globalCompositeOperation = 'source-over';
}
