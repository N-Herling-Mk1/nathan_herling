# nathanherling.com

Static front end. No framework, no runtime dependency, no server. Open
`index.html` in a browser and it runs.

The splash and desk fetch nothing at runtime: the signature vectors, the spark
cue and the two font families are all compiled into the page, so there is no
request to fail on a `file://` origin. The one exception is the tools (Calendar,
Link Dock), which read their JSON from `data/` — over HTTP that is fetched fresh,
from disk they offer a file picker instead. See `docs/apps.md`. Serving it over
HTTP:

    python3 -m http.server 8000

`js/` holds the source modules and stays the thing you edit. `js/site.js` is a
classic (non-module) bundle built from them — browsers refuse to load ES modules
off `file://`, so that bundle is what `index.html` actually loads. Rebuild it,
and the other compiled-in copies, with `tools/build.sh` after changing anything
under `js/`, `assets/data/`, `assets/audio/` or `assets/fonts/`.

## Layout

    index.html          one page, five acts
    css/                tokens, base, and one file per region (apps.css = tools)
    js/                 one module per component; main.js wires them
    js/apps/            tool apps: calendar, linkdock, shared ui kit, registry
    js/site.js          GENERATED — the classic bundle index.html loads
    data/               JSON the tools read: schedule.json, links.json
    js/sigdata.js       GENERATED — signature.json, compiled in
    js/sfxdata.js       GENERATED — spark cue, compiled in (fallback)
    docs/               stage A spec, the reference tables it locks in, apps.md
    docs/history/       drop notes from every round so far (read-only record)
    assets/             favicons, manifest icons
    assets/brand/       the NH mark + make_icons.py to regenerate the ladder
    assets/fonts/       self-hosted Orbitron + Share Tech Mono
    assets/og/          social card images
    tools/              build.sh, og-card.html + make-og.py, fetch_icons.py
    assets/data/        signature vector data, traced from the ink scan
    assets/audio/       splash spark cue, charged-bed loop, and their source wavs
    assets/cv/          CV pdf, embedded by deck face 1
    assets/linkicons/   icons pulled by tools/fetch_icons.py for the Link Dock

## The five acts

| act | what | driven by |
|---|---|---|
| 1 | statistical band, power module, url and entry button — all present at load; the press cuts the signature in pen order, holds it, then wipes | `splash.js` + `power.js`, untimed |
| 2 | horizontal wipe, shell revealed, init command types itself | `shell.js` |
| 3 | shell docks to the rail, PELAGIC lights in its slot, placard lights, deck rakes up and prints | `main.js` beat loop |
| 4 | live desk: rail, top panel (4 deck cards + tool tiles), rotating deck | `deck.js` |
| 5 | face or tool-tile click minimises the deck into rail slot L4 and opens the panel / tool | `deck.js`, `apps/` |

Acts 2 and 3 run as one continuous timeline off a single `t0`.

## Modules

| module | state |
|---|---|
| `config.js` | the only place a tunable number is written down |
| `splash.js` | act 1 — band, signature cut, arcs, spark bursts |
| `power.js` | act 1 — battery, charge gauge, source orb, phase-lock gauge |
| `nameglitch.js` | act 1 — the url's CRT glitch bands |
| `media.js` | preloads every audio file while the splash is up |
| `audio.js` | synthesized sfx, plus `cue()` for file-backed one-shots |
| `voice.js` | narration lines + their RMS envelopes for the cube |
| `cube.js` | PELAGIC — lives in rail slot L1 |
| `shell.js` | typing + keystroke sfx, docks to rail slot L2 |
| `layout.js` | rail geometry + the identity placard (splash composition, shrunk) |
| `deck.js` | carousel, grab / toggle / card-swing, tool tiles, dock, open |
| `signature.js` | vector paths + arc-length tables |
| `apps/index.js` | tool registry: id → `mount(root) → destroy()` |
| `apps/calendar.js` | T1 — month grid from `data/schedule.json` |
| `apps/linkdock.js` | T2 — drop a URL, resolve its icon, export `data/links.json` |
| `apps/ui.js` | shared by the tools: element builder, status bar, JSON loader |

Everything tunable for act 1 sits under `CFG.splash` in `js/config.js`: cut and
hold lengths, proximity radius, band geometry, arc gap limits, orb levels.

Controls (`#overlay`: back-to-splash, deck toggles) live **outside** `#desk`.
`#desk` opens a stacking context at `z-index:10`, so anything nested inside it
renders under the fixed deck stage regardless of its own z-index, and the drag
surface swallows the clicks.

## Icons

`assets/favicon.ico` carries 16/24/32/48/64/128/256. Regenerate the whole ladder
from the mark with:

    python3 assets/brand/make_icons.py

Anything that travels between regions is `position:fixed` and asks `layout.js`
for a target box. `layout.rect()` measures through the offset chain rather than
`getBoundingClientRect`, because the rail slots enter with a `translateX` and a
rect taken mid-transition parks things 14px short.

## Tuning

Everything lives in `js/config.js`.

- `CFG.splash` — act 1: cut and hold lengths, proximity radius, band geometry, arc gap limits, orb levels.
- `CFG.deck` — `lift` (how far the deck rides above centre), `maxCard`,
  `margin`, and `togScale`/`togMin`/`togMax` for the toggle row. Card size is
  solved from the geometry; `maxCard` is only a ceiling.
- `CFG.urlEtch` — pulse depth, heat-ramp length, carve intensity and ember
  colours for the etched url. `heatMin`/`heatSpread` set how long a spot smoulders before it
  pops; `ember` is the spark colour ladder.
- `CFG.panels` — the four deck faces.
- `CFG.tools` — the tool tiles; `id` is also the URL hash (`#calendar`).
- `CFG.beam` — beam palette for the placard and embers, a key of `LASER`.

## Before ship

- ~~self-host Orbitron + Share Tech Mono~~ done; the page makes no external request
- fill panels 2–4 in `docs/panels.csv` and `CFG.panels`
- add `assets/cv/NHerling_CV_2026.pdf` (see the README in that folder)
- add a CNAME for the custom domain
- decide whether PELAGIC gets more design in rail slot L1

## Verified

Walked end to end in headless Chromium at 1440x900 and 820x900: etch arms the
button, wipe hands over to the shell, the rail and deck choreograph, card click
swings the deck, face click docks it into L4 and opens the panel, close returns
it. No console errors.
