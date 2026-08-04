// ============ VOICE ============
// Plays one narration line at a time and exposes its running RMS as a 0..1
// level, which cube.js reads to drive hue, edge glow and scratch-run density.
//
// Getting a level out of an <audio> element has one hard constraint worth
// stating plainly, because it decides the whole design:
//
//   `createMediaElementSource()` routes the element through the Web Audio
//   graph, and Web Audio refuses cross-origin media. A file:// page has an
//   opaque origin, so on a local open the node would produce silence — not a
//   silent ANALYSER, a silent VOICE. The audio would stop being audible.
//
// This page is meant to open off disk, so the analyser is only used when the
// page is actually served. Off disk the element plays untouched and the level
// comes from a precomputed envelope in js/vodata.js — real RMS, measured at
// build time by tools/build.sh, indexed by playback position. Same numbers,
// no graph.
//
// If a line has no envelope yet (file dropped in, build not re-run) there is a
// synthetic fallback so the cube still moves. It is NOT the real signal and is
// labelled as such at its call site.

import { CFG } from './config.js';
import { VO_ENV } from './vodata.js';

const SERVED = location.protocol !== 'file:';

let actx = null, analyser = null, buf = null, freqBuf = null;
let el = null, curKey = '', wired = new WeakSet();
let level = 0, synthPhase = 0;
let onEndCb = null;

const els = new Map();

/* 0..1, smoothed. cube.js reads this every frame. */
export const rms = () => level;
export const playing = () => !!el && !el.paused && !el.ended;
export const current = () => (playing() ? curKey : '');

function url(key) {
  const base = (CFG.voice && CFG.voice.dir) || 'assets/audio/voice/';
  return base + 'vo_' + key + '.wav';
}

function element(key) {
  let a = els.get(key);
  if (!a) { a = new Audio(url(key)); a.preload = 'auto'; els.set(key, a); }
  return a;
}

/* Analyser is opt-in and only when served — see the note at the top. */
function attach(a) {
  if (!SERVED || wired.has(a)) return;
  try {
    if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
    const src = actx.createMediaElementSource(a);
    if (!analyser) {
      analyser = actx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.6;
      buf = new Float32Array(analyser.fftSize);
      freqBuf = new Uint8Array(analyser.frequencyBinCount);
      analyser.connect(actx.destination);
    }
    src.connect(analyser);
    wired.add(a);
  } catch (e) { analyser = null; }
}

export function preload(keys) {
  (keys || []).forEach(k => { try { element(k); } catch (e) {} });
}

/* One line at a time. A new line interrupts whatever is running — the cube can
   only express one thing, and queueing narration behind a click the visitor has
   already moved on from is worse than cutting it off. */
export function play(key, onEnd) {
  if (!key) return;
  stop();
  try {
    const a = element(key);
    attach(a);
    if (actx && actx.state === 'suspended') actx.resume();
    a.currentTime = 0;
    onEndCb = onEnd || null;
    a.onended = () => { if (onEndCb) { const f = onEndCb; onEndCb = null; f(); } };
    const p = a.play();
    if (p && p.catch) p.catch(() => { if (onEndCb) { const f = onEndCb; onEndCb = null; f(); } });
    el = a; curKey = key; synthPhase = 0;
  } catch (e) {
    if (onEnd) onEnd();
  }
}

export function stop() {
  onEndCb = null;
  baseline = 0; deltaPeak = 0; smoothed = 0; out = 0;
  if (el) { try { el.onended = null; el.pause(); } catch (e) {} }
  el = null; curKey = ''; target = 0;
}

/* Envelope lookup. VO_ENV[key] carries four arrays at CFG.voice.envHz — the
   full-band RMS and three band RMS tracks — so the same band-weighted maths the
   mk5 rig does with an FFT can run off a lookup instead. This is what lets the
   cube react correctly on a file:// origin, where Web Audio cannot analyse a
   media element at all. */
function envAt(key, t) {
  const e = VO_ENV[key];
  if (!e || !e.rms || !e.rms.length) return null;
  const hz = (CFG.voice && CFG.voice.envHz) || 50;
  let i = Math.floor(t * hz);
  if (i < 0) i = 0;
  if (i >= e.rms.length) return { rms: 0, b: 0, v: 0, h: 0 };
  return { rms: e.rms[i] / 255, b: e.b[i] / 255, v: e.v[i] / 255, h: e.h[i] / 255 };
}

function analyserBands() {
  if (!analyser) return null;
  analyser.getFloatTimeDomainData(buf);
  let acc = 0;
  for (let i = 0; i < buf.length; i++) acc += buf[i] * buf[i];
  const r = Math.sqrt(acc / buf.length);

  analyser.getByteFrequencyData(freqBuf);
  const nyq = actx.sampleRate / 2, n = freqBuf.length;
  const band = (lo, hi) => {
    const a = Math.max(0, Math.floor(lo / nyq * n));
    const b = Math.min(n - 1, Math.ceil(hi / nyq * n));
    if (b < a) return 0;
    let sum = 0;
    for (let i = a; i <= b; i++) sum += freqBuf[i];
    return (sum / (b - a + 1)) / 255;
  };
  return { rms: r, b: band(20, 200), v: band(200, 3000), h: band(3000, 12000) };
}

/* Synthetic stand-in, used only when a line is playing and neither a served
   analyser nor a built envelope is available. Speech-shaped, but NOT the real
   signal. Run tools/build.sh once the wav files are in place. */
function synthetic(t) {
  synthPhase += 0.13;
  const syllable = 0.5 + 0.5 * Math.sin(synthPhase * 2.1);
  const phrase = Math.max(0, Math.sin(t * 1.15) * 1.4);
  const jitter = 0.75 + 0.25 * Math.sin(synthPhase * 5.7 + 1.3);
  const r = Math.min(1, syllable * phrase * jitter * 0.8);
  return { rms: r, b: r * 0.8, v: r, h: r * 0.6 };
}

/* ---- mk5 response, ported ----
   ΔRMS measures rise above a running baseline: transients pop and sustained
   loudness fades out. Plain RMS is what made this read as a wash. */
let baseline = 0, deltaPeak = 0, smoothed = 0, scaleMax = 0.1, out = 0;
let pegFrames = 0, quietFrames = 0;

export function frame() {
  const V = CFG.voice || {};
  const sm = (V.smooth == null ? 50 : V.smooth) / 100;

  if (!playing()) {
    out += (0 - out) * 0.06;
    level = out;
    return level;
  }

  const t = Number(el.currentTime) || 0;
  const a = envAt(curKey, t) || analyserBands() || synthetic(t);

  const W = V.bands || { bass: 80, vocal: 35, high: 60 };
  const wB = W.bass / 100, wV = W.vocal / 100, wH = W.high / 100;
  const wsum = wB + wV + wH || 1;
  const band = (a.b * wB + a.v * wV + a.h * wH) / wsum;
  const sig = (a.rms * 0.5 + band * 0.5) * ((V.sens == null ? 50 : V.sens) / 50);

  const SCALE_MIN = (V.gainFloor == null ? 8 : V.gainFloor) / 100;
  const SCALE_MAX = (V.gainCeil == null ? 40 : V.gainCeil) / 100;
  const adaptive = V.adaptive !== false;
  const mode = V.mode || 'delta';
  let norm = 0;

  if (mode === 'abs') {
    smoothed += (sig - smoothed) * (1 - sm * 0.95);
    if (adaptive) {
      if (smoothed >= scaleMax * 0.98) {
        pegFrames++; quietFrames = 0;
        if (pegFrames > 8) scaleMax = Math.min(SCALE_MAX, scaleMax * 1.03);
      } else if (smoothed < scaleMax * 0.25) {
        quietFrames++; pegFrames = 0;
        if (quietFrames > 30) scaleMax = Math.max(SCALE_MIN, scaleMax * 0.97);
      } else {
        pegFrames = 0; quietFrames = Math.max(0, quietFrames - 1);
        scaleMax += (smoothed * 1.4 - scaleMax) * 0.005;
        scaleMax = Math.max(SCALE_MIN, Math.min(SCALE_MAX, scaleMax));
      }
    } else scaleMax = SCALE_MAX;
    norm = Math.min(smoothed / scaleMax, 1);

  } else if (mode === 'delta') {
    // smoothing sets the baseline time constant: slow baseline = broad dynamics
    const tau = 0.004 + (1 - sm) * 0.06;
    baseline += (sig - baseline) * tau;
    const delta = Math.max(0, sig - baseline);
    deltaPeak = Math.max(delta, deltaPeak * 0.995);
    if (adaptive) deltaPeak = Math.max(SCALE_MIN * 0.35, Math.min(SCALE_MAX, deltaPeak));
    else deltaPeak = SCALE_MAX * 0.5;
    norm = Math.min(delta / (deltaPeak || 1e-6), 1);
    scaleMax = deltaPeak;

  } else {
    const db = 20 * Math.log10(Math.max(sig, 1e-5));
    norm = Math.min(1, Math.max(0, (db + 60) / 60));
    smoothed += (norm - smoothed) * (1 - sm * 0.95);
    if (adaptive) {
      scaleMax += (smoothed * 1.25 - scaleMax) * 0.004;
      scaleMax = Math.max(SCALE_MIN, Math.min(SCALE_MAX, scaleMax));
      norm = Math.min(smoothed / Math.max(scaleMax, 1e-3), 1);
    } else { scaleMax = SCALE_MAX; norm = smoothed; }
  }

  out += (norm - out) * (0.10 + (1 - sm) * 0.55);
  level = Math.max(0, Math.min(1, out));
  return level;
}
