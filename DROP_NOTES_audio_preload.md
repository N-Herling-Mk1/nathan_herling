# DROP — audio preload

Apply over `0_nHerling_com/`.

## Add

    js/media.js

## Replace

    js/audio.js
    js/voice.js
    js/main.js
    js/site.js          (rebuilt — esbuild 0.28.1, same command as tools/build.sh)
    index.html
    css/splash.css

No asset changes. `tools/build.sh` does not need re-running unless you edit the
modules again; `js/site.js` in this drop is already built from them.

---

## What was actually wrong

Not randomness — download timing. Every file-backed cue was created with
`new Audio(url)` at the moment it was first wanted and played on the same tick:

    js/audio.js   cue()  shot()  startTrack()  loopArm()
    js/voice.js   element()

`preload="auto"` is a hint the browser is free to defer, and on a cold visit it
does. So the first `play()` of a cue raced its own fetch. Three distinct
failures came out of that, and they look different from each other, which is why
it read as flaky rather than as one bug:

1. **Late.** The spark on the press starts downloading when the press happens.
   `bass_roar_3s.wav` is 265 KB, the narration lines up to 528 KB. On a warm
   cache they are instant; on a cold one the cue lands after the beat it was
   cueing, or not at all.

2. **Silently skipped, and it took the next cue with it.** `shot()` did
   `el.currentTime = 0` before playing. On an element with `readyState === 0`
   that assignment **throws `InvalidStateError`**. The `catch` around it calls
   `onEnd()`. So the ready tone could "finish" in zero milliseconds, and
   `main.js` line 158 chains the narration off exactly that callback —
   `vo_online` fires on top of a tone that never played. Same shape in
   `voice.play()`.

3. **First-play-only.** Second and later plays reuse a cached element and always
   worked. That asymmetry is the tell: the bug lives in the first play of each
   file, not in the playback.

## The fix

`js/media.js` — one cache, warmed once, when the splash lands.

- **Manifest is derived from `CFG`**, not hardcoded: splash `sfx` + `loop`, both
  `bootSfx`, `track`, and every `voice` line (`panel` + `cube` + `boot`). Ten
  files, ~2.1 MB. Add a cue to `config.js` and it is preloaded automatically.
- **Served origin:** `fetch` → `Blob` → object URL, with byte-level progress off
  `content-length`. The element then plays from memory. Three concurrent, so the
  splash animation is not fighting the network for the main thread.
- **`file://` origin:** `fetch` is blocked by the opaque origin, so it falls back
  to warming the element itself and waiting on `loadeddata`/`canplaythrough`,
  capped at 12 s per file. Weaker than blobs, still far ahead of loading at the
  moment of use.
- **`media.rewind(el)`** replaces every bare `currentTime = 0` — it checks
  `readyState` first. That is failure 2 above, closed at the source.
- **Failure is contained.** A file that will not load is marked and `src()`
  returns the plain path, which is exactly the old behaviour — the beat is
  silent, nothing else changes, and the console names the file.

`audio.js` and `voice.js` now pull elements from that one cache instead of
minting their own, so `voice.preload()` and `media.warm()` cannot fetch the same
wav twice.

## The note in main.js this contradicts — read before reverting

The old comment said preloading "bought nothing and cost a stack of
`AudioContext was not allowed to start` warnings." That conflated two things:

- **Arming** — building an `AudioContext` and calling `play()` before any
  gesture exists. The policy refuses this and logs it. Still true, still avoided.
- **Fetching** — pulling bytes over the network. Needs no gesture, no context,
  no policy involvement at all.

This drop does only the second. No context is created, nothing plays, the bed is
not armed. The speaker toggle is still the mechanism that makes sound *audible*;
it just no longer has to wait for a download when clicked. If you revisit this,
keep those two apart.

## Progress readout

`#preload`, bottom-left of the splash: `AUDIO ▓▓▓▓░░ 62% 6/10`, going to
`READY`, then fading out 1.4 s later. Bar and percent fields are fixed-width so
counting up cannot reflow the row. Turns amber if any file failed. Console gets
one summary line — count, bytes, ms — plus a named warning per failure.

It **reports, it does not gate**. The entry button stays live throughout; a press
mid-load still works, it just may not have every cue in hand yet.

## Verifying it

Console on load:

    [nh] audio preload: 10/10 ready (2.08 MB) in 412ms

DevTools → Network → throttle to Slow 3G → hard reload. Before this drop the
spark, roar and narration miss their beats under throttling. After it they do
not, because the press cannot happen until the readout has been sitting on
screen. Any file that 404s names itself:

    [nh] audio unavailable, that cue will be silent: assets/audio/tone_up_3.wav

## Not touched

`power_loop.mp3`, `hover_effect_5sec.mp3`, `Custom_Spark_Effect_3.wav` and
`B_Electricity spark sound effects HQ 2.wav` are in `assets/audio/` but nothing
in `CFG` references them, so they are not in the manifest and not fetched. The
last one is the 3.4 MB source `hover_loop.mp3` was built from — worth keeping out
of the repo's shipped path if you ever trim it.
