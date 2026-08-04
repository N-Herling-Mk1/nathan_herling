# DROP — redesign, acts 1 through 5

Apply over `0_nHerling_com/`. Every file below replaces or adds; the deletes at
the bottom are stale duplicates that were already in the repo twice.

## Replace

    index.html
    README.md
    css/tokens.css
    css/base.css
    css/crt.css
    css/cube.css
    css/shell.css
    js/config.js
    js/audio.js
    js/crt.js
    js/cube.js
    js/etch.js
    js/main.js
    js/shell.js
    docs/STAGE_A_spec.md
    docs/sequence.csv
    docs/panels.csv

## Round 2 — back-to-splash, favicon, toggles

**Toggles were dead.** `#deck-stage` is `position:fixed` at `z-index:14` at root
level; `#toggles` sat inside `#main` inside `#desk`, and `#desk` opens a stacking
context at `z-index:10`. So the drag surface covered the buttons and ate every
click — Playwright reported `<div id="deck-stage"> intercepts pointer events`.
Both controls now live in a fixed `#overlay` outside `#desk` at `z-index:18`,
tracked to `#main` by `layout.placeOverlay()`.

My earlier "toggles on: True" check only asserted the CSS class, never clicked
the button. That is why this shipped broken. The test suite now clicks real
controls and asserts the facing card actually changes.

**Back to splash** sits at the top centre of the main area, styled amber to mark
it as a mode change rather than a deck control. It does a full in-place reset —
`deck.reset()`, `layout.teardown()`, `shell.undock()`, `cube.mount(pelagic)`,
`etch.reset()`, `crt.reboot()` — rather than a page reload, so audio stays
unlocked and there is no white flash. `nh_seen` is cleared so the replay runs.

**Favicon** is built from your NH mark. The source artwork is square with a
watermark badge in the top-right corner, outside the ring — masking to the
circle drops it, so no crop was needed. Small sizes get a contrast and unsharp
pass because LANCZOS softens the thin ring and the NH counters until they mush;
at 16px the mark still resolves to 22% ring and 19% lettering.

The placeholder cube SVG I generated last round is deleted — this replaces it.

## Round 11 — bigger deck, social card, self-hosted fonts

**Deck cards are now sized from the geometry, not a cap.** The old flat 360 px
ceiling was the wrong instrument: the facing card sits at `translateZ(R)`, so
perspective magnifies it by `P/(P-R)` — over 1.3x at R = 0.82*pw. Raising a flat
cap would either waste space on a wide screen or let the magnified card punch up
into the top-panel row on a short one. `sizeCards()` binary-searches the largest
card that clears the top edge above the lifted centre, the toggle row below it,
and the side cards swinging out to +/-R. Measured:

    1920x1080   546 px card, facing projects to 795x501
    1440x900    473 px card, facing projects to 648x409
    1180x800    395 px
     820x900    351 px

All four viewports verified clear of the top panel and the toggles.

**The toggle row scales with it.** Enlarging the cards alone left the `< >`
buttons at default button size, visibly undersized next to a 500 px card.
`--ts` is now set from JS and drives the toggles' font size, padding, gap and
min-width:

    1920   --ts 21.0px   buttons 64x52
    1440   --ts 17.7px   buttons 55x44
    1180   --ts 14.4px   buttons 45x36
     820   --ts 13.0px   buttons 41x33  (floor)

`--ts` is derived from the STAGE width, not the card width — the other way round
is circular, since the cards are sized around the room the toggle row needs. The
row's height then feeds back as that reserve.

**Social card.** `assets/og/og-card.png` (1200x630) and `og-card-square.png`
(1200x1200), rendered by `tools/og-card.html` and regenerated with
`python3 tools/make-og.py`. Drawn from the site's OWN signature vectors and
`CFG` palette rather than traced off a screenshot, so the card cannot drift away
from the identity placard in rail slot L3 — same green ink, same beam red, same
grid, scanlines and corner ticks. Quantized to 192 colours afterwards: flat dark
artwork, so it is invisible and cuts 538 KB to 192 KB.

Full Open Graph and Twitter tag set in `index.html`, plus a canonical link.
`og:image` is absolute — most scrapers will not resolve a relative one. Alt text
is set on both.

**Fonts are self-hosted** (`css/fonts.css`, `assets/fonts/`, from @fontsource).
This was on the pre-ship list, but it also became necessary: the card renderer
needs the real faces or the type on the card would not match the site. The
Google Fonts `<link>` is gone and the page now makes **no external request at
all** — verified.

One bug the tests caught here: `css/fonts.css` initially did not exist. A `cp`
with brace expansion failed and `&&`-short-circuited the heredoc that was
supposed to write it, while the `index.html` edit ran anyway from the next line.
The page 404'd on its own stylesheet and silently fell back to system fonts.

## Round 10 — CV loads in the window

Panel 01 now embeds the PDF in the main area with a download button above it.

    target:   assets/cv/NHerling_CV_2026.pdf
    download: NHerling_CV_2026.pdf

Set in `CFG.panels[0]`, so moving or renaming the file is a one-line change. The
old config still pointed at `nherling_cv.pdf`; that is corrected.

Rendering is the browser's own PDF viewer inside an iframe. The download button
is always visible rather than a link buried under the viewer, because iOS Safari
paints only the first page of a PDF in an iframe — the button is the fallback
path on the platform most likely to need it. A centred "use Download above"
message sits behind the iframe and shows through if the viewer fails to paint.

`#view` gets a `pdf` class that turns `.body` into a flex column so the frame
fills the remaining height and stops at the bottom of `#main`. Closing the panel
blanks `.body`, which unloads the viewer rather than leaving it running behind
the deck.

**The PDF is not in this drop.** `assets/cv/` ships with a README only. Shipping
a placeholder at that exact filename would overwrite your real CV when you
unzip over the repo. A two-page fixture was generated at that path to test the
embed and deleted before packaging.

Verified: iframe 1026x587 inside `#main`, the PDF fetched 200, the download
button carries `download="NHerling_CV_2026.pdf"` and a real click produces a
download with that filename, the viewer unloads on close, and non-PDF panels
still render prose with no iframe.

## Round 9 — harder url carve, deck lifted, backface bug

**The url carve throws far harder.** `CFG.urlEtch.cutSparks` 7 -> 34 per frame
at the burn front, ejection speed 1.0 -> 1.55, plus a 14%-per-frame chance of a
70-spark flare with its own flash, and smoke at 0.65. Carve sparks now use the
same amber ember ladder the finished cut spits, so the whole url reads as one
material. Measured peak sparks in flight during the 1.8 s carve, swept:

    cutSparks    7 -> 117   (the old behaviour)
    cutSparks   17 -> 238
    cutSparks   34 -> 340   <- shipped
    cutSparks   52 -> 625

Settled on 34 — about 3x the old load without becoming a firehose on a short
cut. The ladder is in the config comment so the knob has a measured response
curve next to it. `MAXS` raised 1000 -> 2200 so the cap does not clip the peak.

**Deck and toggles lifted.** `CFG.deck.lift = 0.20` of the stage height. The
lift is applied to `#deck` *inside* the stage rather than by moving the stage
box — the box is the drag surface and has to stay inside `#main`, since shifting
it up would park it over the top-panel cards and swallow their clicks. Toggles
translate up by the same amount. Measured: the facing card's top sits 17% down
the main area, was ~35%; 160 px of clearance under the toggles; top-panel cards
still test as topmost at their own centres. The docked (mini) deck gets no lift.

**Bug the larger deck exposed: the rear placard was eating the click.** The card
directly opposite the camera is a *backface* — it renders mirrored, which is
visible in the screenshots as a reversed "Projects" behind the CV card. Once the
deck grew, that mirrored box covered the front card's centre point and
intercepted the click, so act 5 stopped working entirely: Playwright reported
`<span class="b">Detector instrumentation...</span> from <div class="placard
printed"> subtree intercepts pointer events`.

Fixed with `pointer-events:none` on all placards and `auto` only on `.face`.
That alone solves it: the rear card can overlap all it likes if it is not a hit
target.

**Do not reach for `backface-visibility:hidden` here.** It was tried and it is
wrong — the two side cards sit at exactly +/-90 deg, right on the backface
threshold, so it culls them along with the rear card and leaves one card
visible. A comment in `css/deck.css` says so at the point of temptation. The
overlap was a hit-testing problem, never a visibility one.

`vis_check.py` now asserts all four faces render: projected areas 454 / 113 /
307 / 113 px, every card opaque with `backface-visibility: visible`, real lit
pixels inside each card's own rect, and exactly one card taking pointer events.

## Round 8 — hot-as-cut url, live rail placard, blinking caret, bigger deck

**The url is hot while it is being cut.** Previously `drawTextCut` painted the
already-cut run with the *cool* sprite and only lit it once the job finished, so
it read as cut-then-ignite. Cut material now carries bloom + edge + hot in three
clipped bands, giving a cooling gradient behind the head instead of a flat wash.
Measured on the left third of the run: mid-carve brightness 429 vs 445 once
complete — a 4% difference, where before it was dark until the job ended.

**The rail placard is live.** Rail slot L3 was a one-shot static draw. It now
runs its own frame: the same three-sine breath as the tube copy, and embers off
the url run drawn from the same `CFG.urlEtch.ember` ladder. The static half —
bed and signature — is baked once into an offscreen and blitted, so only the
glow and the particles cost anything per frame. Measured: sparks in flight in
103 of 156 sampled frames, luminance swing 11.4.

**The shell caret blinks again.** `shell.frame()` rebuilt `innerHTML` every
frame, and since the elapsed clock clamps at `TOTAL` it kept doing so forever
after the boot finished — restarting the caret's CSS animation on every frame,
which is why it looked frozen. The shell now renders its final state once and
then leaves the DOM alone. Verified: `#term-inner` shows 1 distinct innerHTML
over 1.2 s, and the caret's computed opacity toggles between 0 and 1.

**The deck is bigger.** Placard cap 260 -> 360 px, and the fractions of the main
area went 0.36/0.62 -> 0.44/0.72. Measured 360 px placards in a 1070x734 stage,
still fitting with room, and labels still fit at 1440 / 1180 / 820.

## Round 7 — drifting tube, heavier url, crack timing

**Granulation and chroma now sweep** (`CFG.drift`). Granulation 0-20 on an 8.7 s
clock, chromatic split 0-14 on a 29.3 s clock. The ratio is 3.368, deliberately
not a whole number, so the two never phase-lock into a repeat. Measured over
32 s: gran reversals imply a 9.1 s period, chroma a 32 s period, correlation
r = +0.13. `enabled: false` pins either back to its `CFG.crt` value.

**The url carries a real halo now.** A `bloom` sprite is baked at build time —
three stroke passes at increasing shadow blur so the falloff accumulates instead
of reading as one flat ring — and drawn under the existing pulse at
`CFG.urlEtch.bloom`. Cheaper than a per-frame canvas filter.

**Pops throw far more.** Two groups per burst: a fast one (9-20 sparks) and a
slow shower behind it (5-12) that hangs in the air, plus a wider flash and 2
smoke puffs. Peak simultaneous ember sparks went from ~29 to 120.

**Crack timing is now 70/30, during vs after the cut.** Previously the
during-cut fractures were gated on a minimum carve-progress interval, so the
split was emergent and roughly 50/50. The schedule is now laid out at job start:
`CFG.cracks.total` fractures, `during: 0.70` of them spread across the carve
window with `jitter` controlling spacing, the remainder at completion. Exact and
measured: 5 during, 2 after.

`CFG.cracks.interval` and `corners` are gone, replaced by `total` / `during` /
`startAt` / `jitter`.

One test threshold had to move: `splash_check` measured crack density in a band
that ran across the url, so the new halo read as cracks and pushed it over
limit. It now samples the gutters beside the button only — cracks alone,
0.397%.

## Round 6 — the four panels

    01 CV  ·  02 Research  ·  03 Projects  ·  04 Mathematics

Wired into `CFG.panels` with real copy in a new `body` field, so the panel view
renders written content instead of the stub notice. `docs/panels.csv` matches.

I had argued slot 3 should be **Instrumentation** rather than Projects, on the
grounds that a generic Projects panel becomes a junk drawer. That objection was
about ordering, not about the slot: Projects works and keeps the flexibility to
absorb later work, provided it leads with instrumentation and hardware and puts
software tooling underneath. That constraint is written into the config as a
comment and into the stage A spec, because it is the thing that makes the panel
carry the experimental-physics argument rather than dilute it.

Labels verified to fit at 1440 / 1180 / 820 px on both the top cards and the
3D deck faces. Two earlier measurement attempts were wrong and worth recording:
`scrollWidth` on `.l` returns the box width because the placard is a flexbox, and
`getBoundingClientRect` on a deck face returns its 3D-**projected** width — 37 px
for an edge-on card. Text is now measured with canvas metrics against the
untransformed `offsetWidth`.

## Round 5 — heat-then-pop, Ares red, amber embers

**Spots now heat before they pop.** The previous build emitted sparks the
instant a spot was scheduled, which is why it did not read as heating — there
was no ramp to watch. A scheduled spot now enters `hots[]` and smoulders for
420-940 ms on a u^2 curve (long dim smoulder, sharp run-up), growing a bloom,
flickering on two incommensurate sines, and lighting a white-hot pinpoint past
45% heat. Only at full heat does it burst. Up to `maxHot: 3` heat at once.
Measured: a spot is mid-heat in 77% of sampled frames, 30 pops in 26 s.

**Palette is `ares`, sampled from your reference frame.** Nothing here was
recalled or guessed — each role takes a measured value off the red luminance
ladder in that image, weighted to the dark end as asked:

    glow   rgba(112,0,0)   deep body cluster   #700000
    beam   rgb(224,0,16)   saturated cluster   #e00010
    hot    #fd4543         lit edge      p75
    hot2   #fe8061         hot edge      p92
    flare  253,157,126     core          p99

The reference red leans blue (b > g); that is what distinguishes it from the
amber. A/B against the old palette on the button border stroke: green falls
242 -> 161, b/g rises 0.820 -> 0.933. Both keep a white-hot innermost stroke,
which is why raw brightness alone cannot tell them apart.

The website name in rail slot L3 follows the beam palette too, so the tube and
the rail agree.

**Url sparks are amber, not beam red.** `CFG.urlEtch.ember` is a six-tone
ladder from near-white through scorched; each spark draws its own colour, so a
burst is never flat. The heat ramp climbs the same ladder, so the spot visibly
goes red -> amber -> white before it lets go. All six tones confirmed in flight.

This also gives amber a job rather than leaving it as a stray third accent: red
is the beam family, amber is the heat family.

## Round 4 — cracks relocated, url stays hot

**Cracks now originate on the button's outer edge**, not at the moving cutting
head. Previously the head was often *inside* the button during the scratch and
text stages, and the spawn direction was fully random, so fractures started
under the label and webbed across the whole tube. `edgePoint()` picks a random
point on the button perimeter and returns the outward normal there;
`CFG.cracks.keepOut` steers any segment that would run back across the button
interior. Verified by reading live crack origins out of the module: 6/6 sat on
the perimeter within 6px.

Budget raised from round 3 as asked: `max` 4 -> 7, `interval` 0.42 -> 0.26,
`steps` 7 -> 8, `corners` 2 -> 3. Still well under the original 11/0.18/4.

**The url stays hot.** `CFG.urlEtch` drives a breathing additive overlay on
three incommensurate sines, so the pulse never lands on a countable beat —
measured luminance swing 86 on a mean of 402. Sparks pop off random points of
the glyph run, sampled from the sprite's own alpha at build time so they leave
the letters rather than a bounding box. Intervals use squared random, so short
bursts are common and long silences dominate: 24 pops in 22 s, mean gap 1.18 s,
CV 0.62.

`etch.stats()` is now exported — live crack/spark/pop counters, crack origins
and the button rect. Useful in the console, and it is what the harness reads.

## Round 3 — splash edits

**Signature renders green.** `CFG.ink.sig` / `sigGlow` / `sigBlur`, one token
used by both the tube and rail slot L3. Measured mean of the lit signature
pixels is now (73,154,109) — green leads red by 2.1x.

**The floating second name was a real bug, not a designed ghost.** The pixel
block step downscaled into `work2`'s top-left corner and then drew `work2` onto
*itself* to scale back up. `drawImage` composites source-over, so with a
transparent-background source the small intermediate survived wherever the
upscaled frame was transparent. Helix never showed it because its source was an
opaque logo that filled the tube. At steady state `block = CFG.crt.pixel = 3`,
which is exactly the 1/3 scale you were seeing. The downscale now lands in its
own buffer. That corner measures 0 lit pixels out of 31,383.

**Cracks cut back.** The budget moved into `CFG.cracks` so it is tunable rather
than buried: `max` 11 -> 4 live trees, `interval` 0.18 -> 0.42 carve progress
between spawns, `branches` 3 -> 2, `steps` 12 -> 7, `corners` 4 -> 2 on
completion. Measured on a clean strip of tube margin (no text, no button):
0.737% -> 0.240% of pixels, a 67% reduction. Turn them off entirely with
`max: 0, corners: 0`.

## Add

    css/layout.css      rail, top panel, main area
    css/deck.css        deck, dock state, opened panel view
    js/layout.js        rail geometry + identity placard
    js/deck.js          replaces js/desktop.js
    docs/rail.csv       what each rail slot holds
    site.webmanifest
    assets/favicon.ico              16/24/32/48/64/128/256
    assets/favicon-16.png
    assets/favicon-32.png
    assets/apple-touch-icon.png     180
    assets/icon-192.png
    assets/icon-512.png
    assets/brand/nh_ico_mk1_source.png   your original upload
    assets/brand/nh_mark.png             circle-masked master
    assets/brand/make_icons.py           regenerates the ladder

## Delete

    main.js             root-level duplicate of js/main.js
    config.js           root-level duplicate of js/config.js
    STAGE_A_spec.md     root-level duplicate of docs/STAGE_A_spec.md
    css/desktop.css     superseded by css/layout.css + css/deck.css
    assets/favicon.svg  placeholder cube icon, superseded by the NH mark
    js/desktop.js       superseded by js/deck.js

## Unchanged

    js/signature.js
    assets/data/signature.json

Both are shipped in this drop so the folder runs standalone. If you already have
them locally, skip them.

---

## Three decisions I made — overrule any of these

**1. Card selects, face opens.** Your (4)c3 says a top-panel click swings the
deck; your (5) says a panel click minimises it. I made the top-panel card a
selector (swing only) and the deck face the door (minimise + open). If a card
should also open the panel, it is one line in `deck.js`:

    b.addEventListener('click', () => { if (live) { if (mini) close(); swingTo(i); } });
                                                                     ^ add open(i)

**2. No three.js.** The deck is CSS 3D. Nothing on this page needs a renderer,
and it drops the vendored dependency the old README was carrying.

**3. PELAGIC does not physically fly from the tube to the rail.** The tube fades
out under the wipe, so the same cube node is re-mounted into rail slot L1 while
it is invisible, then faded up there. Your words were "will appear." A real
flight out of an `overflow:hidden` tube is not possible without rebuilding it as
a fixed-position element outside the tube, which costs the under-the-scanlines
read you asked for.

## Still open

- deck faces 2, 3 and 4 are stubs — `docs/panels.csv`
- rail slot L4 is deliberately empty until a deck is minimised into it
- PELAGIC in rail slot L1 is the quietest thing on screen. Its scratch light is
  aperiodic so most faces are at rest at any instant. If you want it louder
  before the design pass, raise the `--g` floor in `cube.js` `frame()`.

## Bugs caught and fixed during the build

- rail slots enter with `translateX(-14px)`; measuring the slot with
  `getBoundingClientRect` mid-transition docked the terminal 14px outside the
  rail. `layout.rect()` now measures through the offset chain, which ignores
  transforms.
- `setPointerCapture` on the deck stage retargeted the click away from the
  placards, which killed act 5 entirely. Drag now uses window-level
  move/up listeners and a 6px movement threshold so a drag never opens a panel.
- PELAGIC read as near-black against a flat rail panel. Both cube hosts now
  carry a drop-shadow lift and the edge-glow floor is raised.
- cube and entry button had 17px of clearance in the tube and visually collided
  through the glow. `CFG.frame` moved the cube to `cy 0.655 / size 0.100`,
  giving 46px.

---

## Splash mk2 — act 1 replaced

The CRT tube and the two-job laser gantry are gone. `js/crt.js`, `js/etch.js`
and `css/crt.css` were deleted; `js/splash.js`, `js/power.js` and
`css/splash.css` replace them. Acts 2-5 are untouched — the shell still types
`init_home` with keystroke sfx and is still the last beat before the desk.

What act 1 is now:

- **Present at load:** pixelated statistical band across the middle, the url,
  the entry button, the power module top-left. No fade in, no chroma split, no
  sheen, no cube.
- **Absent at load:** the signature. It is cut, in pen order, when the button is
  struck.
- **Proximity charges the page.** Pointer distance to the entry button drives
  band heat and wave layers, the url glow, the button chrome, and every
  instrument in the power module. The module loads at 50%.
- **The press:** 3 s cut + 2 s hold + 620 ms wipe. The hold is not dead air —
  cut points revert to their burst cycle and the arcs run over the finished
  mark.

Geometry comes from `assets/data/signature.json`, the same vector data the rail
placard uses: real stroke order with arc-length tables, so the cut head moves at
constant feed. Emitters are resampled by arc length rather than reused from the
stored points, which are RDP-simplified and would cluster in the tight loops.

Two things carried over from tuning and should not be quietly "improved":

- **Arc gaps are capped short** (`CFG.splash.arc.max`). Wider letter-to-letter
  jumps were tried. There are far more candidate pairs at that range, they read
  as bright as the short hops, and the frame saturates — the effect only works
  while each strike is sparse enough to register on its own.
- **The frequency gauge does not reuse the band's dither.** Two pixelated bands
  on one screen read as the same instrument twice. It is a bank of five
  free-running oscillators that phase-lock as power rises.

### Other changes in this drop

- `assets/audio/spark_5s.mp3` — the on-press cue, the first 5 s of
  `Custom_Spark_Effect_3.wav` (also in `assets/audio/`), normalised to -16 LUFS,
  mono 32 kHz. Referenced by path from `CFG.splash.sfx`, not inlined.
- `js/audio.js` gains `cue(url)` / `preload(url)` for file-backed one-shots,
  kept separate from `startTrack` so a cue and a background track can overlap.
- `assets/og/*` regenerated from the mk2 card art, with the "Made with AI" stamp
  removed. The OG `alt` text was stale — it still described a green signature
  on the old card.
- Root-level `main.js` and `config.js` were stale duplicates of the `js/`
  versions, unreferenced by `index.html`, and imported the now-deleted
  `crt.js`. Deleted.
- `js/desktop.js` is orphaned: nothing imports it, and the four ids it queries
  (`#desk-wrap`, `#panels`, `#open`, `#open-close`) do not exist in
  `index.html`. Left in place — flagging it rather than deciding for you.


### Runs with no server

The drop originally required an HTTP server and should not have. `index.html`
opens straight off disk now. Four things had to change, because each one is a
subresource fetch that a `file://` origin blocks:

| was | now |
|---|---|
| `<script type="module" src="js/main.js">` | `<script src="js/site.js" defer>` — a classic bundle |
| `fetch('assets/data/signature.json')` | `js/sigdata.js`, compiled in |
| `@font-face url('../assets/fonts/*.woff2')` | base64 data URIs in `css/fonts.css` |
| `new Audio('assets/audio/spark_5s.mp3')` | same, with `js/sfxdata.js` as an on-error fallback |

The originals all stay in place and remain the source of truth — the spark cue
still loads from `assets/audio/` first, and only falls back to the compiled-in
copy if the browser refuses it. `tools/build.sh` regenerates the four artefacts.

Note the failure mode this had, because it is a nasty one: the stylesheets load
fine over `file://`, so the page renders with correct chrome — styled power
module, url, button — and every canvas black. It reads as a rendering bug when
it is actually "no JavaScript ran at all".

The frame loop is also wrapped now. The reschedule sits at the end of `loop()`,
so an exception anywhere in a frame meant no further frames — a dead canvas with
no message. It catches, logs once, and keeps going.

---

## Tweaks

1. **Identity placard rebuilt.** Rail slot L3 was a miniature of the CRT tube —
   a phosphor bed with a green signature — and the tube no longer exists
   anywhere on the site. It is now the splash composition shrunk down: the same
   band on the same per-cell hash, cyan signature over the centreline, red url
   beneath, live band cells, and the same arc discharge. The arc pool is built
   once in `splash.js` and reused here via `splash.inkGeometry()` rather than
   rebuilt, so the two are literally striking the same gaps in the hand. Two
   glow tiers instead of three — at placard size a separate core pass just
   fattens the stroke instead of reading as heat.
2. **Back-to-splash button** 10px/9-18 padding to 14px/14-34, bold, wider
   tracking.
3. **UI clicks louder.** `snap()` and `deal()` roughly doubled, `enter()` up
   ~50%, master 1.0 to 1.55. Master alone was not enough — it feeds a
   compressor at -16 dB with 5:1, so raising it just gets squashed; the layer
   gains had to come up with it.
4. **Cards at 85%** via `CFG.deck.scale`, applied after the geometry solver.
   The solver finds the largest card that fits; this trims it back so the deck
   sits inside the frame instead of filling it.
5. **Charged bed on the splash.** `assets/audio/power_loop.mp3` loops while
   proximity holds the charge readout above `CFG.splash.loopOnPct` (52) and
   stops below `loopOffPct` (50.5) — two thresholds, so a pointer resting on the
   boundary cannot chatter it, but the gap is narrow so it fires as soon as the
   charge is genuinely climbing. Full volume, on and off, no ramp. Built from
   `B_Electricity spark sound effects HQ 2.wav` (restored to `assets/audio/`;
   it had been removed in the splash-mk2 drop) with a half-second crossfade
   wrapped around the loop point so it does not click. The cue takes over on
   the press: the bed stops when the cut starts.

   **Autoplay caveat.** Pointer movement is not user activation, so the first
   `play()` can be rejected outright and the bed will not sound until the
   visitor has clicked something. It is marked pending and retried on the next
   real gesture, but on a cold load with no prior interaction the first pass
   over the button may be silent. That is browser policy, not a bug here.


### Charged bed: threshold units and the ramp

Two corrections after the first pass, both worth recording because they are easy
to reintroduce:

- **The threshold is in GAUGE PERCENT, not internal power.** They are not the
  same number. The readout sits at `baseCharge` (50) at rest and climbs to 100
  at the button, so a threshold of 0.55 in internal power is 77.5% on the
  gauge — about 100 px from the button, i.e. nearly on top of it. Asking for
  "above 55%" and getting "within 100 px of the button" is why the trigger felt
  erratic. `loopOnPct` / `loopOffPct` are now compared against the same number
  the gauge shows.

  For reference, at the current 460 px radius with the squared falloff:
  52% -> 368 px out · 55% -> 315 px · 75% -> 135 px · 90% -> 49 px.

- **No volume ramp.** The first version eased the gain in over roughly a second.
  At the moment of crossing the threshold that is indistinguishable from the
  trigger having failed. It plays at full volume or not at all.

---

## Wave / audio sync, dock hint, double-click open

- **The horizontal wave layers now share the charged bed's trigger.** They were
  driven by raw power, which at the loop threshold is only about 0.04 — visually
  nothing. The sound would start with no matching movement on screen, so it read
  as unrelated to the page. The wave drive now snaps to `CFG.splash.waveFloor`
  (0.45) the instant the loop starts and rises with power from there. The loop
  decision was also moved to the top of the frame, before the band is drawn, so
  the sound and the movement cross the threshold on the same frame rather than
  one frame apart.
- **Dock hint.** The dock slot read "empty", which says nothing about how to
  fill it. While a face is live and unopened it carries "double click or click
  on panel to open" instead, in amber. Not gated on the carousel being settled —
  the instruction is true either way, and gating it made the hint flicker every
  time the deck drifted.
- **Double click on a top-panel button opens that panel.** Single click still
  just swings the deck to it; `dblclick` fires after the second click's `click`,
  so the face is already correct by the time it opens.

---

## Autoplay solved properly, F11-only entry, clean console on file://

**The charged bed no longer needs a gesture.** The earlier "pointer movement is
not user activation, so the first pass may be silent" caveat was a limitation of
the approach, not of the browser. Muted playback is always permitted, and
unmuting an element that is already playing is not gated. So `audio.loopArm()`
is called at boot: the bed starts playing immediately, looping, muted. Crossing
the threshold only flips `muted`, which is instant and cannot be refused.
`loopStop()` re-mutes rather than pausing, so every later crossing is also just
a property flip. The gesture retry stays as a backstop.

**F11 is the only key that enters.** Previously any key except Tab did it, which
means a stray keystroke — or a screen reader moving focus — dropped you into the
site. The button is otherwise the only way in. F11 is deliberately NOT
`preventDefault`-ed, so the browser still toggles fullscreen; add
`e.preventDefault()` in `js/main.js` if that is not wanted. Enter/Space still
activate the button when it has focus, which is native button behaviour and
worth keeping for keyboard users.

**Manifest attached from script.** A manifest fetch runs under CORS and a
`file://` page has a null origin, so the static `<link rel="manifest">` threw two
console errors on every local open — for a resource that does nothing off a
server anyway. It is now appended from a classic inline script only when
`location.protocol !== 'file:'`.

---

## New audio, phase-lock disturbance, bolts

- **Hover bed** is now `assets/audio/hover_loop.mp3`, built from
  `hover_effect_5sec.mp3` (0.20–5.20 s, 0.4 s crossfade wrapped around the loop
  point, -19 LUFS). The supplied file is 9.4 s and evenly textured, so the only
  work was making it wrap without a seam. `power_loop.mp3` is gone.
- **Boot cue** re-clipped from `Custom_Spark_Effect_3.wav`, first 5 s straight,
  20 ms attack / 220 ms fade landing on the wipe, -16 LUFS.
- **Phase-lock disturbance.** For the duration of the press cue the gauge
  overlays three red traces at incommensurate frequencies, each amplitude-
  modulated by a second detuned oscillator so no two cycles match. The point is
  the contrast: the cyan bank is converging on one frequency and one phase while
  these do the opposite. Ramped in, not switched, so it arrives with the cue
  rather than popping. Measured: 0% red pixels idle, 69% during the cue.
- **Bolts.** Above `CFG.splash.boltOnPct` (65 on the gauge) discharge jumps from
  the twinkling dither cells down to the centreline, ramping to full at 100%.
  Two deliberate constraints, both learned from the letter-to-letter arc
  experiment that had to be reverted: a hard cap on live bolts
  (`boltMax`, 7) so they stay rarer than the signature's own discharge, and
  spawn x pulled toward the pointer (`boltBias`) so activity concentrates where
  the visitor is instead of spreading evenly into mush.

---

## Boot one-shots

Two cues on the act 2/3 timeline, wired by path in `CFG.bootSfx`:

- **`bass_roar_3s.wav`** fires the instant the last character of `CFG.cmd` lands
  on the line — before the EXEC keystroke, so it reads as the machine answering
  rather than as part of the typing. Hook is in `shell.js`, guarded by
  `roarDone` and cleared by `shell.reset()`.
- **`tone_up_3.wav`** fires once `e >= TOTAL`, i.e. the LIVE beat — the last
  entry in `CFG.beats` — has run out and the desk is fully assembled. Hook is in
  the `main.js` frame loop, guarded by `didReady`.

Neither plays on the skip path (`skipToDesk`, used for repeat visits and
reduced-motion). That path lands on a desk that simply *is* loaded rather than
one that becomes loaded, and a tone announcing the end of a sequence that never
ran is just noise.

These use a new `audio.shot()` rather than `audio.cue()`. `cue()` substitutes
the compiled-in spark on failure, which is right for the splash and wrong here —
a missing file should be silence, not the wrong sound. `shot()` caches one
element per url and has no fallback.

---

## Narration — js/voice.js

Six lines in `assets/audio/voice/`, played one at a time, each driving PELAGIC's
hue, edge glow and scratch-run density from its running RMS.

| trigger | line |
|---|---|
| ready tone finishes on boot | `vo_online.wav` |
| click PELAGIC | `vo_pelagic.wav` |
| select/open CV | `vo_cv.wav` |
| select/open Research | `vo_research.wav` |
| select/open Projects | `vo_projects.wav` |
| select/open Mathematics | `vo_mathematics.wav` |

Panel lines fire on a **deliberate** selection only — a click on the top card, a
click on the placard, or the double-click shortcut. Hover-swing is excluded: the
deck swings on `mouseenter`, and narrating every pass of the cursor across the
card row would be unbearable. Re-selecting the face that is already talking does
not restart it.

### Why the level is not simply an AnalyserNode

`createMediaElementSource()` routes an element through the Web Audio graph, and
Web Audio refuses cross-origin media. A `file://` page has an opaque origin, so
on a local open that node produces silence — and not a silent *analyser*, a
silent *voice*. Wiring the obvious analyser would have muted the narration on
exactly the workflow this site is built for.

So the analyser is used only when `location.protocol !== 'file:'`. Off disk the
element plays untouched and the level comes from `js/vodata.js`: real RMS,
measured from the wav files at build time at 50 Hz, peak-normalised to 0..255,
indexed by playback position. Same numbers, no graph, works anywhere.

`tools/build.sh` generates those envelopes. **Run it once the wav files are in
place.** Until then `VO_ENV` is empty and the controller falls back to a
synthetic speech-shaped level — the cube still moves, but it is not the actual
audio.

### What the level does to the cube

All additive on top of the idle animation, so the cube never stops doing its own
thing while a line plays — it just runs hotter. `cube.drive(level)`:

- **glow** — lifts `--g` by up to 0.62 over the idle breath.
- **hue** — slides `--edge` from the idle cyan `79 214 255` toward
  `200 250 255`, on a 1.35 power curve so quiet passages stay clearly cyan and
  only real peaks bleach the edge.
- **runs** — compresses the gap between scratch-run spawns by up to 78%, so the
  light traversing the faces gets busier rather than only brighter.

Weights are `CFG.voice.hue` / `.glow` / `.runs`, all 1.0. Attack is fast (0.45)
and release slow (0.10) so consonants read as hits without the cube strobing on
every gap between words.

---

## More pulse; narration triggers; deck placement on reload

### Why it was washing rather than pulsing

Four causes, all addressed:

1. **No envelope, so the level was synthetic.** If the wav files are in
   `assets/audio/voice/` but `tools/build.sh` has not been run since, `VO_ENV` is
   empty and `voice.js` falls back to a speech-*shaped* stand-in that has no
   relationship to the actual audio. It moves the cube convincingly and tracks
   nothing. **This is the first thing to check.**
2. **Raw RMS has almost no dynamic range.** Speech spends most of its time in a
   narrow mid band, so mapping it straight to brightness gives a steady wash.
   The level is now gated (`CFG.voice.gate`, 0.14) and re-expanded to fill 0..1
   before shaping.
3. **Release was too slow** (0.10), smearing syllables into each other. Now
   0.22, with attack raised to 0.70.
4. **RMS is a smooth quantity and pulse lives in the edges.** There is now a
   separate transient term, `voice.punch()` — a fast-decaying spike on every
   onset — feeding glow, hue and run spawning alongside the level.

### What the cube does with it now

- **Size pulse** — `scale3d` up to +5.5% on transients. Small, but it is the
  only cue that moves the silhouette, and it carries further than brightness.
- **Idle breath ducked** by `CFG.voice.duck` (0.75) while a line plays, so the
  ambient animation stops competing with the voice.
- **Onsets spawn scratch runs directly**, outside the scheduler, so every
  syllable puts light on the faces instead of most of them missing the window.

Measured against a real envelope: `--g` swinging 0.344 → 0.945, where the idle
range is 0.20 → 0.46, and `--edge` reaching full hot.

### Triggers

Narration now fires on **double click** on a top-panel card, and on **single
click** on the deck placard itself. Single click on a top card only selects.

### Deck placement

`deck.ensureMain()` asserts the un-tucked layout rather than assuming it. `mini`
is module state that a reload clears, but the *classes* expressing it sit on
elements the skip path never touches, so a reload landing straight on the desk
could inherit the tucked layout. The skip path now also re-places the stage on
the next frame and again at 260 ms — nothing has been measured at that point, and
a stage placed against a zero rect lands wrong. `deck.place()` is additionally
hooked to resize and to `document.fonts.ready`, neither of which moved it before.

---

## Hover bed on a cold load: what is and is not possible

The bed cannot sound before the visitor has clicked, tapped or pressed a key.
This is browser policy, not a bug in the page, and it is worth writing down so it
does not get re-litigated.

Chromium grants "sticky activation" on `pointerdown`, `keydown`, `touchstart`
and friends. **Pointer movement is explicitly not on that list.** Moving a mouse
across a page is not an interaction as far as the autoplay policy is concerned.

The muted-arm trick — start the element playing but muted at load, then unmute
when the threshold trips — looks like it should sidestep this, and it was tried.
It does not work: Chromium **pauses** a muted-autoplaying element that gets
unmuted without activation. That is exactly the observed symptom, silence until
something is clicked. Web Audio is no better: the context starts suspended and
`resume()` needs the same activation.

What this drop does with that:

- Activation is now global and sticky. `pointerdown` / `keydown` / `touchstart`
  anywhere on the page unlocks audio for the whole visit, not just a click on
  the entry button. Returning from the desk to the splash therefore has sound,
  which matches what was already being observed.
- The element is still armed muted at load, but it is only unmuted once
  activation is actually held. Without it we stay muted and warm rather than
  triggering the pause trap, and a `pause` listener re-arms if it happens
  anyway — so the bed starts on the very first frame after the first gesture,
  with no reload needed.

If the bed genuinely must sound on a cold load — a kiosk or a demo machine —
that is a browser setting, not a code change:

- Edge/Chrome: Settings, Cookies and site permissions, Media autoplay, Allow for
  the site.
- Or launch with `--autoplay-policy=no-user-gesture-required`.
- Served over HTTPS and visited repeatedly, Chromium's Media Engagement Index
  eventually grants autoplay on its own, but that cannot be relied on for a
  first-time visitor.

---

## Deck parking over the dock on reload

`layout.rect()` measures with `offsetLeft` / `offsetWidth`, and those are **zero**
until the browser has actually laid the desk grid out. `deck.place()` accepted
whatever it was handed, so on a reload that lands straight on the desk it could
place the stage against a rect of zeros — an arbitrary position with a 60x60
floor size — and then nothing ever moved it again. That is the deck sitting on
top of the dock in the bottom-left.

Note `mini` was never the culprit: the dock hint was visible in the reported
screenshot, and that only renders while `!mini`. The stage was un-tucked and
simply placed against nothing.

Three changes, all about never trusting geometry that cannot be real:

- `place()` rejects any rect under 40px in either axis and re-queues itself on
  the next frame, up to 90 frames. No placement is better than a wrong one that
  sticks.
- A `ResizeObserver` on `#main` re-places the deck and the shell whenever the
  panel's width actually changes. This is the reliable signal — the grid settles
  after fonts and the first real layout pass, and guessing when that happens
  with timers is what the earlier `setTimeout(260)` was doing.
- A `load` listener does the same once more, for the case where the observer is
  unavailable.

Verified both ways: with realistic panel geometry the stage lands at the main
rect exactly (362,150 for a main rect at 352,140 plus the 10px inset); with a
zero-size panel it now sets no inline position at all and waits, rather than
parking itself somewhere wrong.

---

## Deck in the dock after a reboot — the actual cause

Reported sequence: open a panel (deck docks into L4), click back to splash,
enter again — the deck comes up in the dock.

`deck.reset()` cleared the `mini` FLAG and the `.mini` class, which is why the
earlier investigation kept coming up empty: `mini` really was false, and the dock
hint rendered correctly because of it. What reset did NOT clear is the stage's
inline `left/top/width/height`, which were measured against the dock slot while
the panel was open. Nothing re-placed the stage during the reboot — `deck.boot()`
switched the stage on but never called `place()` — so it drew at whatever the
dock geometry had been. Any later reflow (a resize, the ResizeObserver firing)
snapped it back to main, which is the "hitting any key pushes it back" symptom.

Fixes:

- `reset()` wipes the inline geometry, resets the place retry counter, and drops
  `filled` from the dock slot.
- `boot()` calls `place()` on the frame the stage first turns on, so the deck is
  positioned before it is visible on every run, not only on the skip path.

Verified through the exact reported sequence: boot lands at 362,150 (main);
opening a panel moves it to 22,706 (dock + 6px inset); back-to-splash clears it
to nothing; rebooting lands at 362,150 again.

## The two console errors

Unrelated to the layout — they are the CV panel's pdf. A `file://` page is a
unique security origin, so the browser refuses to load the document into a frame
and logs one error for the frame and one for the pdf URL. Nothing was broken by
it, but it left an empty viewer.

Opened from disk the panel now shows a short note pointing at the download
button instead of an iframe that cannot load. Served over HTTP the embedded
viewer works exactly as before.

---

## PELAGIC rebuilt on mk5

`js/cube.js` is now a port of `etch_cube_mk5.html`. Six faces, each a canvas
carrying a procedural etch field — grid substrate, orthogonal grooves on a 20px
lattice, solder pads — with light packets travelling the grooves. Edges glow
from a layered box-shadow stack written per frame. The rig builds its own DOM
inside `.cube-host`, so `index.html` just supplies an empty host and the cube can
be re-mounted without being rebuilt.

Three things were dropped from the standalone page on purpose: the control
panel, the palette picker (locked to `cyber`, which is the site's edge cyan) and
the file loader. The settings are fixed in `CFG.cube` from the tuned rig —
spinY 5, spinX 0, tilt -47, zoom 19, edge glow 100, etch flow 50. Spin X of zero
is the interesting one: the cube turns about a single axis and leans, rather
than tumbling.

### Response

`voice.js` now runs the mk5 `analyse()` maths rather than its own shaping:
ΔRMS against a running baseline, band-weighted, adaptive gain. Settings from the
rig: sensitivity 50, smoothing 50, bass 94 / vocal 80 / high 60, adaptive on,
floor 8, ceiling 40. ΔRMS is why this tracks better — it measures *rise* above a
baseline, so transients pop and sustained loudness fades back, where plain RMS
sat high and read as a wash.

Band weights need per-band energy, which means an FFT — and there is no FFT on a
`file://` origin. So `tools/build.sh` now measures **four** envelopes per line
rather than one: full-band `rms` plus `b` / `v` / `h` tracks, filtered at
200 Hz and 3 kHz to match the rig's band edges. All four share a single peak
normalisation, so the band balance the rig was tuned against survives —
normalising each band independently would flatten exactly the thing being
weighted. Verified on a three-tone test signal: bass 196, vocal 148, high 74
against a full-band 255, which is the expected ordering.

Verified in the harness: 6 faces with 6 canvases built, edge glow blur swinging
38.9 to 76.7px while a line plays, transform reading
`translateZ(19px) rotateX(-47deg) rotateY(...)`.

**Rerun `tools/build.sh` after dropping the voice wavs in** — the envelopes are
what make this work off disk.

---

## Broken desk layout — stray closing tag

The mk5 cube swap replaced the PELAGIC markup in `index.html` with a regex whose
tail matched more closing tags than it should have. The result was one extra
`</div>`: `#rail` closed after the first slot, so the shell, identity and dock
slots fell out of the rail grid and into `#desk` directly. They then sized
against the wrong container, which is why the identity placard rendered at the
full width of the main panel.

Fixed by hand; `index.html` is balanced again (36 open / 36 close divs, rail
holding exactly its four slots). Verified: stage places in main at 362,150 at
1430px wide; `#sig-canvas` back to its rail-slot size; `#pelagic-dock` sitting
inside `#slot-cube` where it belongs.

Lesson worth keeping: structural HTML edits by regex are not worth the
convenience. Anything touching nesting should be a literal string replacement
with both tags in the match, and the div balance should be counted afterwards.

---

## Cube tilt, and a way to actually find the CV error

### Tilt was a perspective mismatch, not the tilt value

Two bugs in the mk5 port, both in the projection rather than the -47:

1. **Perspective did not scale with the cube.** mk5 renders a 300px cube through
   a 900px perspective — a ratio of 3. In the rail the cube is roughly half that
   size, and the port left the perspective at a fixed 900px, so the ratio
   doubled and the same -47 degree tilt projected far harder. `resize()` now
   writes `perspective = PX * 3`, so the projection matches the rig at any size.
2. **Rotation came from the absolute page clock.** `now * 0.001 * ...` meant the
   cube's starting orientation depended on how long the page had been open, and
   the rates did not match the rig. Now accumulated from a frame delta, starting
   at 22 degrees of yaw, at mk5's rates: 34 deg/s at full Spin Y, 18 at full
   Spin X.

### The audio reader is the mk5 one

Confirmed in the built bundle: `baseline += (sig - baseline) * tau` and the
delta branch are both present, so `voice.js` is running the ΔRMS port rather
than the earlier hand-rolled shaping. `CFG.voice.mode` is `'delta'`, weights
94/80/60, sens 50, smooth 50, adaptive on.

### CV panel — a diagnostic instead of another guess

Chromium reports a failed subresource on a `file://` page as "Unsafe attempt to
load URL X from frame with URL Y" and attributes it to `index.html:1` rather
than to whatever requested it, which makes it untraceable from the console
alone. Everything referenced from the markup was checked and exists — all four
icons, the CV pdf, every stylesheet — and there is no iframe, img, embed or
object in the document.

So `main.js` now installs a capture-phase `error` listener that catches the
failure at the element that raised it and logs the tag name and URL. Reload and
the console will print `[nh] resource failed: TAG <url>`. That names the culprit
outright — including the case where the URL is empty, which resolves to the page
itself and produces exactly this message.

---

## PDF viewer restored — the "fix" was the regression

The CV panel stopped loading because of a change made two drops earlier. Seeing
`Unsafe attempt to load URL ... 'file:' URLs are treated as unique security
origins` in the console, the iframe was suppressed on `file://` and replaced
with a note. That reasoning was wrong: Chromium logs that warning for the load
but **still renders** a pdf sitting in the same directory tree, which is why the
panel worked before it was "fixed". The change traded one console warning for a
panel that could never work off disk.

The frame is emitted unconditionally again. The existing fallback line under the
viewer already covers the case where it genuinely fails to paint, and the
Download / Open in new tab buttons sit above it either way. `.pdf-note` and its
styling are gone.

Lesson: a console warning is not the same as a failure. The visible behaviour
should have been checked before designing around the message.

---

## PELAGIC: scale the rig, do not rebuild it

The port was wrong in a way the previous "fix" only papered over. mk5's DOM is
three levels — `.scene` (300px, `perspective:900px`) → `.cube` (`preserve-3d`)
→ six 300px faces at `translateZ(150px)`. The port rebuilt that at the rail
slot's pixel size AND inserted an extra `preserve-3d` wrapper between the
perspective element and the cube. An intermediate 3D context changes how the
child transform projects, so the result could not match the rig no matter what
the perspective value was.

It now builds mk5's scene verbatim at 300px and scales the whole thing down with
a plain 2D `transform: scale()` on a wrapper OUTSIDE the perspective, which
cannot alter the projection. Every internal ratio — translateZ to perspective,
face size to scene — is preserved exactly. Rendered in the rail at scale(0.42).

## Sound toggle

A speaker in the POWER SOURCE header, top right, in the module's own cyan.

It starts **off** and breathes slowly, because its real job is to be worth
clicking: browsers will not let audio sound until the visitor has interacted,
and pointer movement does not count as interaction. Clicking it IS that
interaction. Pressing the entry button also switches it on — by then the visitor
has interacted, so leaving it dark would misreport the state.

It gates **only the hover bed**. The spark cue on the press, the roar, the ready
tone and the narration are never affected by it. It is an invitation, not a mute
switch for the site: `audio.setBedAllowed()` touches nothing but the loop
element.

---

## Panel content: publications and projects

**Mathematics** — the two planned papers, titled, marked "Submitting Fall 2026.
Working titles." The intro paragraph was also corrected: the (a,b) chart uses
REAL parameters only, covering real and complex root classes with no imaginary
coordinate. The old wording ("both splitting regimes of a two-valued root map")
described the problem rather than the result.

**Research** — the two manuscripts now named rather than counted, taken from the
CV's "Manuscripts in progress" section so the site and the CV cannot drift:
closure-aware decorrelation across penalty families, and maximum-entropy
background estimation as an independent ABCD validator. Attributed to K. Johns
and co-authors, flagged as working titles and in preparation.

**Projects** — three named projects with synopsis and link, above the existing
instrumentation/hardware/tooling block:

1. FORGE, forge-observatory.com — the four gauges are stated explicitly rather
   than described as "Bayesian stuff", since that is the actual argument.
2. HELIX, n-herling-mk1.github.io/_HELIX_/ — led with the question it exists to
   answer rather than the tech stack.
3. PELAGIC mk2, voice recognition, marked IN DEVELOPMENT.

The instrumentation-first ordering principle recorded in `config.js` still holds
for the second half of that panel; the named projects sit above it because a
reader looking for work with a URL should not have to scroll past the tooling
paragraph to find it.

Panel bodies needed a typographic system rather than bare paragraphs: numbered
entries with leading-zero counters, a working-title caveat line, outbound links
that read as links inside the palette, and an amber IN DEVELOPMENT chip.

**Sound toggle** enlarged 22px to 34px with a filled plate behind it, and the
header padding widened to match.

---

## Power block sizing, and chasing the frame message

Block widened 262px to 302px (250px on narrow screens). The header now carries
`min-height:38px` and centres its contents, because the toggle is taller than
the label line and was overhanging the rule beneath it. Toggle 34px to 44px,
icon 22px to 28px, and it is no longer dimmed when off — it sits at nearly full
cyan with a lit border and a slow glow pulse. Off should read as "live but not
engaged", not as "disabled": the whole reason it exists is to look worth
clicking.

### The "Unsafe attempt to load URL" message

Audited every URL-bearing attribute in `index.html`: eight stylesheets, four
icons, one script, and meta/canonical values that are not fetched. Nothing
references the page itself. Nothing in `config.js` or any stylesheet does
either, and no `new Audio()` path can resolve empty — every caller passes a
literal from config.

The message is Chromium refusing a **frame navigation** on a `file://` origin,
not a failed subresource, which is why the resource-error listener added last
drop never caught it. The only frame this site creates is the CV pdf viewer.

So `main.js` now also watches for frames appearing anywhere in the document and
logs each one's raw `src` attribute alongside its resolved URL. Reload and:

- a `[nh] frame created` line names the offender and what it resolved to;
- **no** such line, with the message still present, means it is the browser's
  own pdf plugin frame and not this code — in which case it cannot be removed
  from here, only by not embedding the pdf at all.

---

## The "Unsafe attempt to load URL" error — found

It was the favicon links.

The error is attributed to `index.html:1`, which means the load is
parser-initiated. The full set of parser-initiated fetches in the document is
eight stylesheets, four icons and one script. The stylesheets and the script
demonstrably succeed — the page renders and runs — which leaves the icons as the
only candidate. That is a deduction from the attribution, not another guess.

Why icons specifically: a `file://` document has an opaque origin, and Chromium
refuses to **display** a `file://` subresource for an opaque origin, logging
"Unsafe attempt to load URL <page> from frame with URL <page>". Stylesheets and
scripts go through a different path — they are fetched and executed, not
displayed — which is why only this one complained. The reported URL is the page
itself because the check names the document as the resource whose origin failed.

The four icon links and the manifest are now attached from the same served-only
inline script. On a local open there are no icon requests at all, and a favicon
on a `file://` page does nothing anyway, so nothing is traded away. Served over
HTTP, everything attaches exactly as before.

## AudioContext warnings

Three "AudioContext was not allowed to start" warnings came from unlocking on
`pointerdown`. Chromium grants user activation on `mousedown`, `pointerup`,
`click`, `keydown` and `touchend` — **not** on `pointerdown` or `touchstart`.
The context was being created a moment before activation was granted. The
listener now uses the correct event set, which also makes the hover bed unlock
more reliably.

---

## Audio: nothing loads until asked

Every previous attempt to get ahead of the autoplay policy — preloading the
cues, preloading the narration, arming the bed muted at boot — bought nothing
and cost a stack of "AudioContext was not allowed to start" warnings, because
the context was being constructed before any gesture existed. All of it is gone.

Verified: **0 Audio elements created at boot.** Clicking the speaker creates
them.

The speaker is the mechanism now:

- **Off at load**, and off again every time the splash is returned to.
- **Click it** → unlocks the context (inside the click, so activation is already
  granted), arms the bed, and proximity audio works from then on.
- **Don't click it** → pressing the entry button switches it on anyway, because
  by then the visitor has interacted and the boot cues are about to play.
- Boot cues are never gated by it. It governs the proximity bed only.

It also moved out of the POWER SOURCE header, which never had the room, to
standalone in the top-right at 64px (52px on narrow screens).

## CRT treatment on the website name

Three layers on the one element:

1. **Horizontal shear** — two clipped copies of the string that jump sideways in
   `steps(1,end)`, never eased. A smooth slide reads as motion graphics; a hard
   jump reads as a signal fault. Most of each cycle is rest — the tear fires for
   about 6% of a 5.2s cycle and 5% of a 7.7s one. Continuous tearing stops
   reading as a fault and starts reading as a wobble.
2. **Scanline comb** — dark lines rather than light ones, `background-clip:text`
   so the comb cuts the glyphs and leaves the background alone. Veiling the
   letters with light lines would have washed the red out.
3. **Roll bar** — a slow bright band travelling down over 6.5s, the refresh beat.

The copies inherit the element's red, so this stays inside the palette instead
of turning into an RGB-split cliche. All of it is disabled under
`prefers-reduced-motion`.

---

## URL plate: real shear, not clip bands

The CSS version used two `clip-path` bands stepping sideways. At the size the
name is drawn a clip band is dozens of pixels tall, so the tear moved in big
rectangular chunks — the clumsy pixelation. Clip-path cannot do this: it can
only cut rectangles.

`js/nameglitch.js` draws the name once into an offscreen canvas and blits it
back **one 1-2 device pixel band at a time**, each with its own horizontal
offset. Every scanline is displaced independently, so the distortion happens at
the glyph edges rather than in blocks.

Three things shape the offsets:

- **Value noise, not white noise.** Offsets interpolate between integer stops,
  so a band's displacement is related to its neighbours'. Per-row white noise
  would just look like sand; this reads as a signal wobbling.
- **A continuous low wobble** (~1.4px) so the plate is always alive.
- **Tear events** — short windows where one region throws hard, with a falloff
  from the tear centre, plus sparse single-row dropouts shoved much further.
  Between events it settles back to the wobble.

The scanline comb is drawn over the blit rather than baked into the source, so
the comb stays fixed while the glyphs move underneath — the lines belong to the
tube, not to the image. The `h1` keeps its text for screen readers and
selection but is not painted; under `prefers-reduced-motion` the canvas is
dropped and the text is painted normally.

## PELAGIC entrance

It was not an entrance. The rig is built at mk5's 300px scene and scaled to fit
the rail, but `--cs` is only written once `main.js` has measured the slot — so
the first frames painted the cube unscaled at 300px, and the "jump" was simply
the first correctly-sized frame arriving.

`.cube-scale` now starts at `opacity:0`, and `frame()` refuses to render until
`resize()` has actually read a `--cs` value. It fades in over 250ms once sized,
in its box, at the right size from the first visible frame.

---

## CV panel: the frame reporter settled it

The reporter did its job. It logged:

    [nh] frame created — raw src: assets/cv/NHerling_CV_2026.pdf#view=FitH

alongside the "Unsafe attempt to load URL" error. The iframe IS the error.
Chromium refuses to DISPLAY a `file://` subresource for an opaque origin, and an
embedded pdf is a displayed subresource, so the viewer cannot paint from disk
however it is written.

An earlier round removed the `file://` guard on the assumption that the viewer
used to work locally. That assumption was wrong, and it reintroduced the error.
The guard is back, and the note now points at what actually does work: **Open in
new tab** is a top-level navigation rather than a subresource, so it opens the
pdf fine from disk. Download works too. Served over HTTP the embedded viewer
appears as before.

Verified: opening the CV panel on a `file://` origin creates **0 iframes** and
shows the note.

## URL plate: horizontal shear, no vertical roll

The previous version had a bright band travelling DOWN the plate. That is
vertical motion, which is the opposite of the brief — it was the most visible
thing on screen and it read as a scroll. Removed entirely.

The shear is now a travelling wave in the horizontal offset:

    dx = sin(y/H * 9.0  + t*2.6) * 4.5px
       + sin(y/H * 23.0 - t*1.7) * 2.2px

Two incommensurate wavelengths, so the lean never settles into a repeating
pattern, plus value noise on top so the glyph edges fray rather than staying
clean. Tear events and single-row dropouts sit above that. Every term displaces
a row SIDEWAYS as a function of how far down the plate it is — nothing moves
vertically at all now except the scanline comb, which is fixed.

---

## URL plate: the blur was baked in

The plate was drawn twice through `shadowBlur` at 22% and 55% of its height,
before a single row had moved. That was the blur — not a side effect of the
shear, and not something the shear could avoid, since displacing a blurred
source only smears it further.

The source is now one flat `fillText` with `shadowBlur = 0`, in an explicit ink
colour rather than one read off the element (the `h1` is painted transparent so
its computed colour is useless here). The base `text-shadow` on `#sitename` is
gone too — with transparent text it painted nothing, but leaving it invites
someone to "restore" a soft copy under the sharp one.

### Aperiodic, not a wave

The travelling sine wave is gone. A periodic wobble stops reading as a fault
within about two cycles, and at the amplitude needed to be visible it made the
name lean.

There is now a burst gate: activity arrives at irregular intervals (0.25-2.9s
apart) and lasts 50-210ms. Between bursts the plate is completely still and
completely sharp. During one, a slab of rows — not the whole plate — takes
uncorrelated per-row offsets of a few pixels, so it reads as static on the line
rather than as the image moving, with one or two rows per burst thrown much
further. Plus a very sparse single-pixel idle twitch so it is never quite dead.

### Proximity no longer touches it

`paintChrome` was writing a growing `text-shadow` onto the name from the power
level, which over the canvas plate read as the name blurring as the pointer
approached. Removed. The url is a fixed object; the button and the band carry
the charge.

---

## URL plate: the off-colour box, and more jitter

### The box

The cathode comb was drawn with `multiply`. Against a transparent backdrop that
still lays down ink, so the comb was painting black lines across the **whole
canvas rectangle** — a faintly darker panel sitting on the page background,
which is what read as the element's background being slightly off.

The comb is now `destination-out`: it removes alpha rather than adding colour,
so the lines appear only where there is ink to cut and everywhere else the
canvas stays perfectly transparent. There is no plate background to match the
page with, because there is no plate background at all.

Verified: 13.0% of the canvas rectangle has any alpha — the glyphs and nothing
else — and a 10x10 sample from the corner, always outside the text, comes back
0 px of ink.

### Turned up

- bursts arrive 0.14-1.64s apart (was 0.25-2.85), and last 60-280ms (was 50-210)
- amplitude 0.55-1.40 (was 0.35-1.00)
- per-row throw 5.4px at full amplitude (was 3.2), sampled at 110Hz (was 90)
- the far-throw rows fire on 10% of rows at up to 22px (was 7% at 14px)
- the affected slab covers 16-78% of the plate height (was 10-55%)
- idle twitch doubled to 2px and made ~2x more frequent

Still aperiodic and still fully still between bursts — the increase is in how
hard and how often it hits, not in making it continuous.

---

## Splash press: fuse blow

The entry button used to just disable itself and sit there while the cut ran
above it — the one element on the page that did nothing after being used. It now
fails, over-volt style, in four beats:

1. **60ms over-volt.** Brighter than the button is ever otherwise allowed:
   the label goes to white, the glow to 46px. Held flat, not eased in.
2. **240ms collapse** on a `1 - k^0.45` curve — steep at the start, trailing at
   the end. Deliberately asymmetric; a symmetric ease here reads as a dimmer
   being turned down rather than as something breaking.
3. **Corner brackets snap off.** They are the only pure-CSS part of the button,
   so the snap lives in CSS: a 260ms kick outward with rotation and fade, no
   return and no ease-in-out — the bracket is leaving, not bouncing.
4. **Arc discharge across the gap** where the label was, then a 1.6s ember that
   decays but never quite reaches black.

The arcs reuse the signature's discharge maths — same per-frame re-randomised
jitter, same crackle — so the button fails the way the ink conducts, rather than
importing a second visual vocabulary for the same physical idea. Colour stays in
the beam red; the signature's arcs stay cyan.

No retiming was needed: the cut and the audio cue still start on the press. The
fuse plays under the opening of the spark clip, which is its quiet part.

Measured profile (frames after the press): 46px glow at full white, 26.9px with
the label at 78% by frame 4, label gone and 7px by frame 18, 3.8px ember at
frame 44.

---

## PELAGIC: why it still was not the mk5 rig

First thing checked, because it is the cheapest thing to rule out: `js/site.js`
was rebuilt from the `js/` modules with esbuild and diffed against the shipped
copy. **Byte identical.** The page was already running current source, so this
was never a stale-bundle problem. Three actual defects:

**1. The entrance gate was defeated by its own fallback.** `cube.js` treats
"has `--cs` been written?" as "has the rail been measured?", and holds rendering
until then. But `css/cube.css` declared `--cs:150px` on `.cube-host` itself, so
`getComputedStyle(host)` always returned a value, the gate always passed, and
the rig painted at a scale of 0.5 from the first act-3 frame — then jumped to
the real rail size 700ms later when `sizeCubeInRail()` ran at MOUNT. The
default is removed; `--cs` is now written by `main.js` and nowhere else.
`sizeCubeInRail()` no longer silently no-ops when the slot has not settled: it
falls back to measuring the dock, then retries per-frame, because with the gate
actually working a failed measurement means a permanently dark cube.

**2. The glow mapping was not mk5's.** mk5 uses the Edge Glow slider two ways:
a 0-2x multiplier on the analysed level while audio runs, and a direct control
at `0.55x` when it does not — and it renders faces at a constant `0.25` when
idle, not `0`. The port collapsed both into `glow*(0.25 + 0.75*level)`. Net
effect: resting edges at `0.25` of the slider instead of `0.55`, less than half
the rig's idle brightness, and a live range compressed into `0.25..1` instead
of `0..1`. That compression is the wash. `cube.drive()` now takes
`voice.playing()` and the mapping is mk5's, literally.

**3. `js/vodata.js` was empty — `VO_ENV = {}`.** The build that produced it ran
without ffmpeg, so no envelopes were written and the warning scrolled past.
`voice.js` degrades silently to `synthetic()` in that case, which is a
sine-driven stand-in explicitly labelled as not the real signal. So every
narration line has been driving the cube off fabricated speech. Regenerated
from the six `assets/audio/voice/vo_*.wav` files: 107-300 samples x 4 bands
each, one shared peak normalisation.

**Still open: `CFG.cube` does not match the uploaded rig.** The site runs
`spinY 5 / spinX 0 / tilt -47 / zoom 19 / glow 100 / flow 50`. The
`etch_cube_mk5.html` in hand boots at `28 / 9 / -14 / -40 / 50 / 40`. The site's
numbers were transcribed from a screenshot of a tuned panel, so this is a taste
call, not a bug — but at `spinY 5` the cube turns at roughly a sixth of the
rig's rate, and with mk5's glow mapping now restored, `glow 100` idles at
`0.55` where the rig's own `glow 50` idles at `0.275`.

---

## CV panel: rendered pages, not a framed pdf

First, the attribution, because it matters for where to look next time: the
`file://` guard that shows the apology note was **already in the bundle you sent
me**. `grep "will not render a pdf inside the page" js/site.js` on the original
upload returns a hit. The cube patch did not cause this — it changed
`cube.js`, `main.js`, `vodata.js` and `cube.css`, none of which the panel
touches. What most likely happened is that the CV last read correctly while the
site was being served over HTTP, where the guard takes the other branch.

The guard itself is correct. Chromium refuses to DISPLAY a `file://` subresource
document for an opaque origin — the frame is the error, not the path or the
`#view=FitH` fragment — so an iframe cannot paint the pdf from disk however it
is written. A previous round removed the guard on the assumption it used to
work and had to put it back.

An `<img>`, though, is not a framed document. It is an ordinary subresource and
it loads from disk without complaint. So the panel now shows the CV as rendered
page images:

    tools/build.sh  ->  pdftoppm -r 144  ->  assets/cv/page-1.png, page-2.png
                        quantised to a 32-colour greyscale palette, ~131/163 KB

`CFG.panels[0].pages` lists them; `js/deck.js` builds a scrolling strip. Both
origins take this path — one code path that behaves the same everywhere beats
two that diverge exactly where they cannot be tested. Download PDF and Open in
new tab are unchanged, and the second is a top-level navigation, so it still
works locally. If the page count changes, `pages` has to change with it;
`build.sh` prints the reminder.

**`tools/build.sh` no longer warns and carries on.** Missing `ffmpeg` is how
`js/vodata.js` shipped empty for a round, with the cube quietly running on
`synthetic()`. Missing binaries now stop the build unless `NH_ALLOW_MISSING=1`
is set deliberately, and the last line of the build re-reads `vodata.js` and
prints how many envelopes actually landed.

## Cube tilt

`CFG.cube.tilt` -47 -> -38. Nothing else in the rig moved; the panel screenshot
still governs every other value.

## Cube tilt, settled

`CFG.cube.tilt` -52, taken off the rig rather than guessed. I had moved it
-47 -> -38 on the reading that "more parallel to the xy-plane" meant toward
zero, where zero is a face square to the screen. Wrong direction: the wanted
framing is a HARDER lean, -52, further from the site's original -47 in the
opposite sense. The lesson is the cheap one — for anything judged by eye, get
the number off the rig instead of reasoning about which way the sign runs.

Worth knowing when comparing screenshots: tilt is the only fixed part of the
orientation. Yaw accumulates from `spinY` and never stops, so two captures of
the same settings will not frame identically. Match the lean, not the pose.
