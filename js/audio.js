// Synthesized SFX. Nothing sounds until a user gesture unlocks the context.
import { SPARK_DATA, LOOP_DATA } from './sfxdata.js';
let actx = null, on = false, noiseBuf = null, master = null, trackEl = null;

export function unlock() {
  if (actx) { if (actx.state === 'suspended') actx.resume(); on = true; return; }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  actx = new AC(); on = true;
  const n = actx.sampleRate * 0.5;
  noiseBuf = actx.createBuffer(1, n, actx.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  master = actx.createGain(); master.gain.value = 1.55;
  const comp = actx.createDynamicsCompressor();
  comp.threshold.value = -16; comp.knee.value = 22; comp.ratio.value = 5;
  comp.attack.value = 0.002; comp.release.value = 0.14;
  master.connect(comp); comp.connect(actx.destination);
}
export const isOn = () => on;

function burst(o) {
  if (!on || !actx) return;
  const t = actx.currentTime;
  const s = actx.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
  const f = actx.createBiquadFilter();
  f.type = o.type || 'bandpass'; f.frequency.value = o.freq; f.Q.value = o.q || 5;
  const g = actx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(o.gain, t + 0.001);
  g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
  s.connect(f); f.connect(g); g.connect(master || actx.destination);
  s.start(t); s.stop(t + o.dur + 0.02);
}
function tone(o) {
  if (!on || !actx) return;
  const t = actx.currentTime;
  const osc = actx.createOscillator(); osc.type = o.type || 'triangle';
  osc.frequency.setValueAtTime(o.f0, t);
  if (o.f1) osc.frequency.exponentialRampToValueAtTime(o.f1, t + o.dur);
  const g = actx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(o.gain, t + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
  osc.connect(g); g.connect(master || actx.destination);
  osc.start(t); osc.stop(t + o.dur + 0.02);
}

// broadband click + body thock + pitched thump. A high-Q bandpass here sounds
// like castanets; that is why every layer is deliberately low-Q.
export function key() {
  const v = 0.86 + Math.random() * 0.28;
  burst({ type: 'highpass', freq: 3000 + Math.random() * 1800, q: 0.6, gain: 0.26 * v, dur: 0.011 });
  burst({ type: 'lowpass',  freq: 680 + Math.random() * 320,   q: 0.7, gain: 0.62 * v, dur: 0.046 });
  tone({ f0: 118 + Math.random() * 46, f1: 56, gain: 0.26 * v, dur: 0.042 });
}
export function enter() {
  burst({ type: 'highpass', freq: 2400, q: 0.6, gain: 0.34, dur: 0.014 });
  burst({ type: 'lowpass',  freq: 430,  q: 0.7, gain: 1.15, dur: 0.105 });
  tone({ f0: 86, f1: 44, gain: 0.52, dur: 0.115 });
}
export function wipe() {
  burst({ type: 'bandpass', freq: 1800, q: 0.8, gain: 0.42, dur: 0.22 });
  tone({ f0: 220, f1: 70, gain: 0.18, dur: 0.26, type: 'sawtooth' });
}
export function dock() {
  burst({ type: 'lowpass', freq: 900, q: 0.6, gain: 0.30, dur: 0.20 });
  tone({ f0: 150, f1: 62, gain: 0.16, dur: 0.24 });
}
export function deal() {
  burst({ type: 'highpass', freq: 2600, q: 0.5, gain: 0.32, dur: 0.022 });
  tone({ f0: 420, f1: 260, gain: 0.24, dur: 0.05 });
}
export function snap() {
  burst({ type: 'lowpass', freq: 620, q: 0.7, gain: 0.58, dur: 0.062 });
  burst({ type: 'highpass', freq: 2800, q: 0.6, gain: 0.16, dur: 0.012 });
  tone({ f0: 190, f1: 96, gain: 0.32, dur: 0.07 });
}
/* One-shot cue played from a file rather than synthesized — the splash spark
   track. Kept separate from startTrack so the cue and any background track can
   overlap without one cancelling the other. */
let cueEl = null, cueUrl = '';

/* The file in assets/audio/ is preferred. Some browsers refuse media
   subresources on a file:// origin, so on a load error we swap to the
   compiled-in copy rather than going silent. */
function makeCue(url) {
  const el = new Audio(url);
  el.preload = 'auto';
  el.addEventListener('error', () => {
    if (el.src !== SPARK_DATA) { el.src = SPARK_DATA; el.load(); }
  });
  return el;
}
export function cue(url) {
  const src = url || SPARK_DATA;
  try {
    if (!cueEl || cueUrl !== src) { cueEl = makeCue(src); cueUrl = src; }
    cueEl.currentTime = 0;
    const p = cueEl.play(); if (p && p.catch) p.catch(() => {});
  } catch (e) {}
}
export function preload(url) {
  const src = url || SPARK_DATA;
  try { if (!cueEl || cueUrl !== src) { cueEl = makeCue(src); cueUrl = src; } } catch (e) {}
}

export function startTrack(url) {
  if (!url || !on) return;
  try {
    if (!trackEl) { trackEl = new Audio(url); trackEl.preload = 'auto'; trackEl.volume = 0.8; }
    trackEl.currentTime = 0;
    const p = trackEl.play(); if (p && p.catch) p.catch(() => {});
  } catch (e) {}
}
export function stopTrack() { try { if (trackEl) { trackEl.pause(); trackEl.currentTime = 0; } } catch (e) {} }

/* ---- one-shot cues from files -------------------------------------------
   Separate from cue(): that one is the splash spark and substitutes the
   compiled-in copy on failure. These are ordinary assets with no inlined
   fallback, so a missing file is silence rather than the wrong sound. One
   element cached per url, so a cue can be re-fired without re-fetching. */
const shots = new Map();

export function shot(url, onEnd) {
  if (!url) { if (onEnd) onEnd(); return; }
  try {
    let el = shots.get(url);
    if (!el) { el = new Audio(url); el.preload = 'auto'; shots.set(url, el); }
    el.currentTime = 0;
    // onEnd fires on natural end OR on failure to play, so a missing file
    // cannot strand whatever was chained behind it
    el.onended = null;
    if (onEnd) el.onended = () => { el.onended = null; onEnd(); };
    const p = el.play();
    if (p && p.catch) p.catch(() => { if (onEnd) { el.onended = null; onEnd(); } });
  } catch (e) { if (onEnd) onEnd(); }
}

export function shotPreload(url) {
  if (!url) return;
  try { if (!shots.has(url)) { const el = new Audio(url); el.preload = 'auto'; shots.set(url, el); } }
  catch (e) {}
}

/* ---- looping bed ----------------------------------------------------------
   Used by the splash: the spark loop runs while the page is charged past a
   threshold.

   Autoplay, properly this time. Pointer movement is NOT user activation, so a
   cold play() at the moment the threshold trips can be rejected and the bed
   goes silent for the whole visit. But muted playback is always permitted, and
   unmuting an element that is already playing is not gated. So the element is
   armed at page load: playing, looping, muted. Crossing the threshold only
   flips `muted`, which is instant and cannot be refused.

   The gesture retry below stays as a backstop for the rare browser that also
   refuses the muted start. */
let loopEl = null, loopUrl = '', loopPending = false, loopWanted = false;
let activated = false;

/* The speaker toggle gates ONLY the hover bed. Boot cues — the spark on the
   press, the roar, the ready tone, the narration — are never affected by it:
   its purpose is to be something the visitor clicks, not a mute switch for the
   whole site. */
let bedAllowed = false;
export function setBedAllowed(v) {
  bedAllowed = !!v;
  if (!loopEl) return;
  try {
    if (!bedAllowed) loopEl.muted = true;
    else if (loopWanted && activated) { loopEl.muted = false; if (loopEl.paused) tryPlay(); }
  } catch (e) {}
}
export const bedIsAllowed = () => bedAllowed;

/* Sticky activation. Call from any real gesture — pointerdown, keydown,
   touchstart. Once set it holds for the life of the page, so a single click
   anywhere is enough for the rest of the visit. */
export function markActivated() {
  if (activated) return;
  activated = true;
  if (loopWanted && loopEl && bedAllowed) {
    // Unmuting a muted-autoplaying element without activation gets the element
    // PAUSED by Chromium, which is the trap the muted-arm trick falls into.
    // Now that we hold activation, re-issue play() properly.
    try { loopEl.muted = false; if (loopEl.paused) loopEl.play().catch(() => {}); } catch (e) {}
  }
}
export const isActivated = () => activated;

function tryPlay() {
  if (!loopEl) return;
  try {
    const p = loopEl.play();
    if (p && p.catch) p.catch(() => { loopPending = true; });
  } catch (e) { loopPending = true; }
}

/* Call once at boot. Starts the bed silently so the threshold has nothing left
   to negotiate with the autoplay policy. */
export function loopArm(url) {
  const src = url || LOOP_DATA;
  try {
    if (!loopEl || loopUrl !== src) {
      loopEl = new Audio(src);
      loopEl.loop = true;
      loopEl.preload = 'auto';
      loopEl.volume = 1;
      loopUrl = src;
      // same file:// guard as the cue — fall back to the compiled-in copy
      loopEl.addEventListener('error', () => {
        if (loopEl.src !== LOOP_DATA) {
          loopEl.src = LOOP_DATA; loopEl.load(); loopEl.muted = !loopWanted; tryPlay();
        }
      });
      loopEl.addEventListener('canplay', () => { if (loopEl.paused) tryPlay(); });
      // Chromium pauses a muted element that gets unmuted without activation.
      // If that happens while we still want the bed, drop back to muted
      // playback so the element stays warm and resumes instantly on the first
      // gesture, instead of sitting dead.
      loopEl.addEventListener('pause', () => {
        if (!loopWanted) return;
        if (activated) { tryPlay(); }
        else { try { loopEl.muted = true; tryPlay(); } catch (e) {} }
      });
    }
    loopEl.muted = true;
    tryPlay();
  } catch (e) {}
}

export function loopStart(url) {
  loopWanted = true;
  if (!loopEl) loopArm(url);
  try {
    loopEl.volume = 1;
    // Only unmute if we hold activation AND the toggle allows the bed. Unmuting
    // without activation does not produce sound — it gets the element paused —
    // so we stay muted and warm, and markActivated() turns it on the instant a
    // gesture arrives.
    loopEl.muted = !(activated && bedAllowed);
    if (loopEl.paused) tryPlay();
  } catch (e) {}
}

/* Muted rather than paused: the element keeps running, so the next crossing is
   a property flip instead of another play() the browser could refuse. */
export function loopStop() {
  loopWanted = false;
  try { if (loopEl) loopEl.muted = true; } catch (e) {}
}

/* call from any genuine user gesture */
export function loopRetry() {
  markActivated();
  if (!loopEl) return;
  loopPending = false;
  try {
    if (loopWanted && bedAllowed) loopEl.muted = false;
    if (loopEl.paused) tryPlay();
  } catch (e) {}
}
