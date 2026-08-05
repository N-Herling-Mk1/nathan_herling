// ============ MEDIA ============
// Every audio file the site will ever play, fetched once, when the splash
// lands. One element per url, cached here and handed to whoever wants it.
//
// WHY THIS EXISTS
// Before this, each file was created with `new Audio(url)` at the moment it was
// first wanted and played on the same tick. `preload="auto"` is a HINT, not a
// promise: the browser is free to defer it, and on a cold visit it usually
// does. So the first play() of a cue raced its own download —
//   * the spark on the press could land after the cut had already started,
//   * `currentTime = 0` on an element with readyState 0 throws
//     InvalidStateError, which shot() catches and turns into an immediate
//     onEnd — that is how the ready tone could "finish" instantly and drop the
//     narration on top of itself,
//   * and a slow file simply missed its beat and never caught up.
// That is the "sometimes it plays, sometimes it doesn't" behaviour. Nothing
// about it is random — it is download timing.
//
// WHAT THIS IS NOT
// This does not touch the autoplay policy and does not create an AudioContext.
// The old note in main.js about preloading being pointless was about ARMING —
// building a context and calling play() before any gesture existed, which the
// browser rightly refused and logged. Fetching bytes needs no gesture at all.
// Sound still cannot be HEARD until the visitor clicks; it can now be READY
// when they do. Keep those two apart if you revisit this.

import { CFG } from './config.js';

const SERVED = location.protocol !== 'file:';

const blobs = new Map();   // url -> object URL, once the bytes are in hand
const els   = new Map();   // url -> HTMLAudioElement
const stat  = new Map();   // url -> 'ready' | 'failed'

let warmed = false, warming = null;

/* ---- manifest ------------------------------------------------------------
   Built from CFG rather than hardcoded, so adding a cue to config.js is enough
   to get it preloaded. Anything CFG leaves empty (e.g. CFG.track) drops out. */
export function manifest() {
  const out = [];
  const add = u => { if (u && out.indexOf(u) < 0) out.push(u); };

  add((CFG.splash || {}).sfx);           // spark on the press
  add((CFG.splash || {}).loop);          // charged hover bed
  add((CFG.bootSfx || {}).roar);         // under EXEC
  add((CFG.bootSfx || {}).ready);        // desk live
  add(CFG.track);                        // optional background track

  const V = CFG.voice || {};
  const dir = V.dir || 'assets/audio/voice/';
  [].concat(V.panel || [], V.cube || [], V.boot || [])
    .forEach(k => { if (k) add(dir + 'vo_' + k + '.wav'); });

  return out;
}

/* The source to actually hand an element: the in-memory blob if we have it,
   otherwise the plain path — so a failed preload degrades to exactly the old
   behaviour rather than to silence. */
export const src = url => blobs.get(url) || url;
export const isReady = url => stat.get(url) === 'ready';
export const isWarm = () => warmed;

/* One element per url, shared by audio.js and voice.js. */
export function element(url) {
  let el = els.get(url);
  if (!el) {
    el = new Audio(src(url));
    el.preload = 'auto';
    els.set(url, el);
  }
  return el;
}

/* An element built before its bytes arrived gets upgraded to the blob — but
   only while it is idle. Swapping src on a playing element cuts it off. */
function adopt(url) {
  const el = els.get(url), b = blobs.get(url);
  if (!el || !b || el.src === b) return;
  if (!el.paused || el.currentTime > 0) return;
  try { el.src = b; el.load(); } catch (e) {}
}

/* Safe rewind. Setting currentTime on an unloaded element throws; that throw is
   what used to be mistaken for "the sound finished". */
export function rewind(el) {
  try { if (el && el.readyState > 0 && el.currentTime > 0) el.currentTime = 0; }
  catch (e) {}
}

/* ---- the two load paths --------------------------------------------------
   SERVED: fetch to a blob, with byte progress. The element then plays from
   memory, so its first play() is instant and cannot miss a beat.
   file://: fetch is blocked by the opaque origin, so fall back to warming the
   element itself and waiting for it to report enough buffered to play through.
   Weaker, but still far ahead of loading at the moment of use. */

async function fetchOne(url, onBytes) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const len = Number(res.headers.get('content-length')) || 0;

  if (!res.body || !res.body.getReader) {
    const b = await res.blob();
    onBytes(b.size, b.size);
    return b;
  }
  const reader = res.body.getReader(), chunks = [];
  let got = 0;
  for (;;) {
    const r = await reader.read();
    if (r.done) break;
    chunks.push(r.value);
    got += r.value.length;
    onBytes(got, len);
  }
  onBytes(got, got);
  return new Blob(chunks, { type: res.headers.get('content-type') || '' });
}

// A file that never fires either event would hang the whole preload, so every
// wait is capped. Timing out is not failure — it just means we stop waiting.
const EL_TIMEOUT = 12000;

function warmElement(url, onBytes) {
  return new Promise(resolve => {
    let el;
    try { el = element(url); } catch (e) { return resolve(false); }
    if (el.readyState >= 3) { onBytes(1, 1); return resolve(true); }

    let settled = false;
    const finish = ok => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      el.removeEventListener('canplaythrough', ok2);
      el.removeEventListener('loadeddata', ok2);
      el.removeEventListener('error', bad);
      el.removeEventListener('progress', tick);
      onBytes(1, 1);
      resolve(ok);
    };
    // loadeddata is enough to start on time; canplaythrough is the ideal.
    const ok2 = () => { if (el.readyState >= 2) finish(true); };
    const bad = () => finish(false);
    const tick = () => {
      try {
        const d = el.duration;
        if (d && el.buffered.length) onBytes(el.buffered.end(0) / d, 1);
      } catch (e) {}
    };
    el.addEventListener('canplaythrough', ok2);
    el.addEventListener('loadeddata', ok2);
    el.addEventListener('error', bad);
    el.addEventListener('progress', tick);
    const timer = setTimeout(() => finish(el.readyState >= 2), EL_TIMEOUT);
    try { el.load(); } catch (e) { finish(false); }
  });
}

/* ---- warm ----------------------------------------------------------------
   Call once, when the splash lands. Resolves when every file has either loaded
   or given up; never rejects, because a missing cue must not take the page with
   it. onProgress({ pct, done, total, bytes, url, ok }) fires as it goes — the
   splash readout and the console line are both driven off it. */
export function warm(onProgress) {
  if (warming) return warming;

  const urls = manifest();
  const total = urls.length;
  const frac = new Array(total).fill(0);   // 0..1 per file
  const t0 = (performance && performance.now) ? performance.now() : Date.now();
  let done = 0, bytes = 0, failed = [];

  const report = extra => {
    let s = 0;
    for (let i = 0; i < total; i++) s += frac[i];
    const pct = total ? Math.max(0, Math.min(100, (s / total) * 100)) : 100;
    if (onProgress) {
      try { onProgress(Object.assign({ pct, done, total, bytes }, extra || {})); }
      catch (e) {}
    }
  };

  async function one(url, i) {
    const onBytes = (got, len) => {
      frac[i] = len ? Math.min(1, got / len) : 0;
      report();
    };
    let ok = false;
    if (SERVED) {
      try {
        const blob = await fetchOne(url, onBytes);
        blobs.set(url, URL.createObjectURL(blob));
        bytes += blob.size;
        adopt(url);
        // Build the element now so the first play() has nothing left to do.
        element(url);
        ok = true;
      } catch (e) {
        // A served page can still fail on one file (typo, 404, offline). Fall
        // back to element warming rather than writing the file off.
        ok = await warmElement(url, onBytes);
      }
    } else {
      ok = await warmElement(url, onBytes);
    }
    frac[i] = 1;
    stat.set(url, ok ? 'ready' : 'failed');
    if (!ok) failed.push(url);
    done++;
    report({ url, ok });
  }

  // Three at a time: enough to keep the pipe full, few enough that the splash
  // animation does not fight the network for the main thread.
  async function pool(n) {
    let next = 0;
    const worker = async () => {
      for (;;) {
        const i = next++;
        if (i >= total) return;
        await one(urls[i], i);
      }
    };
    await Promise.all(Array.from({ length: Math.min(n, total) }, worker));
  }

  report();
  warming = pool(3).then(() => {
    warmed = true;
    const ms = Math.round(((performance && performance.now) ? performance.now() : Date.now()) - t0);
    const mb = (bytes / 1048576).toFixed(2);
    console.info('[nh] audio preload: %d/%d ready%s in %dms%s',
      total - failed.length, total,
      SERVED ? ' (' + mb + ' MB)' : ' (element warm, file:// origin)',
      ms, failed.length ? ' — ' + failed.length + ' failed' : '');
    if (failed.length) console.warn('[nh] audio preload failed:', failed);
    report({ finished: true });
    return { total, failed, bytes, ms };
  });
  return warming;
}
