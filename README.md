# nathanherling.com

Static front end. No framework, no runtime dependency, no server. Open
`index.html` in a browser and it runs.

Nothing is fetched at runtime: the signature vectors, the spark cue and the two
font families are all compiled into the page, so there is no request to fail on
a `file://` origin. Serving it over HTTP works identically:

    python3 -m http.server 8000

`js/` holds the source modules and stays the thing you edit. `js/site.js` is a
classic (non-module) bundle built from them — browsers refuse to load ES modules
off `file://`, so that bundle is what `index.html` actually loads. Rebuild it,
and the other compiled-in copies, with `tools/build.sh` after changing anything
under `js/`, `assets/data/`, `assets/audio/` or `assets/fonts/`.

## Layout

    index.html          one page, five acts
    css/                tokens, base, and one file per region
    js/                 one module per component; main.js wires them
    js/site.js          GENERATED — the classic bundle index.html loads
    js/sigdata.js       GENERATED — signature.json, compiled in
    js/sfxdata.js       GENERATED — spark cue, compiled in (fallback)
    docs/               stage A spec + the reference tables it locks in
    assets/             favicons, manifest icons
    assets/brand/       the NH mark + make_icons.py to regenerate the ladder
    assets/fonts/       self-hosted Orbitron + Share Tech Mono
    assets/og/          social card images
    tools/              build.sh, plus og-card.html + make-og.py
    assets/data/        signature vector data, traced from the ink scan
    assets/audio/       splash spark cue, charged-bed loop, and their source wavs
    assets/cv/          CV pdf, embedded by deck face 1 (not shipped in the drop)

## The five acts

| act | what | driven by |
|---|---|---|
| 1 | statistical band, power module, url and entry button — all present at load; the press cuts the signature in pen order, holds it, then wipes | `splash.js` + `power.js`, untimed |
| 2 | horizontal wipe, shell revealed, init command types itself | `shell.js` |
| 3 | shell docks to the rail, PELAGIC lights in its slot, placard lights, deck rakes up and prints | `main.js` beat loop |
| 4 | live desk: rail, top panel, rotating deck | `deck.js` |
| 5 | face click minimises the deck into rail slot L4 and opens the panel | `deck.js` |

Acts 2 and 3 run as one continuous timeline off a single `t0`.

## Modules

| module | state |
|---|---|
| `config.js` | the only place a tunable number is written down |
| `splash.js` | act 1 — band, signature cut, arcs, spark bursts |
| `power.js` | act 1 — battery, charge gauge, source orb, phase-lock gauge |
| `cube.js` | PELAGIC — lives in rail slot L1 |
| `shell.js` | typing + keystroke sfx, docks to rail slot L2 |
| `layout.js` | rail geometry and the identity placard |
| `deck.js` | carousel, grab / toggle / card-swing, minimise, open |
| `signature.js` | vector paths + arc-length tables |
| `layout.js` | rail geometry + the identity placard (splash composition, shrunk) |

| `audio.js` | synthesized sfx, plus `cue()` for file-backed one-shots |

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

- `CFG.crt` — the Helix_Splash preset. Ported verbatim; treat it as a contract.
- `CFG.drift` — granulation and chroma sweeps, each with its own range, period
  and phase. `enabled: false` pins either at its `CFG.crt` value.
- `CFG.frame` — where the signature, url, cube and button sit in the tube, as
  fractions of the tube box.
- `CFG.etchJobs` — carve order and duration. Order is url, then button.
- `CFG.beats` — the acts 2+3 timeline.
- `CFG.ink` — phosphor colour for the signature, used by the tube and rail L3.
- `CFG.cracks` — glass fracture budget for the button carve. Fractures spawn on
  the button's outer edge and propagate outward. `total` is the count, `during`
  splits it across / after the cut, `scale` sets reach. `total: 0` turns
  fracturing off.
- `CFG.deck` — `lift` (how far the deck rides above centre), `maxCard`,
  `margin`, and `togScale`/`togMin`/`togMax` for the toggle row. Card size is
  solved from the geometry; `maxCard` is only a ceiling.
- `CFG.urlEtch` — pulse depth, heat-ramp length, carve intensity and ember
  colours for the etched url. `heatMin`/`heatSpread` set how long a spot smoulders before it
  pops; `ember` is the spark colour ladder.
- `CFG.crt.color` — beam palette, `ares` by default. `LASER` in `config.js`
  also carries `amber`, `red`, `green`, `cyan`, `violet`.
- `CFG.panels` — the four deck faces.

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
