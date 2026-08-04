# nathanherling.com — STAGE A spec (lock-in reference)

stage: A [conceptual vetting] · rev 2 · supersedes the two-act spec

One page. Five acts. Acts 1 and 4/5 are untimed and wait for the user; acts 2
and 3 are a single uninterrupted timed run.

---

## 1. Cast

| name | what it is |
|---|---|
| TUBE | the CRT. Everything in act 1 happens inside it. |
| SIGNATURE | vector ink, traced from the scan. Lives on the phosphor. |
| PELAGIC | the rotating etch cube. **Inside the tube**, not beside it. |
| ETCH LAYER | the front glass. Laser-carved marks live here, not on the phosphor. |
| SHELL | `[shell]>_`, ported from init_home. |
| DECK | 4-face rotating placard carousel. |
| RAIL | the left column, four slots. |

---

## 2. Act 1 — SPLASH (untimed)

The tube loads **on the Helix_Splash metrics**. Those numbers are the contract;
`js/config.js → CFG.crt` is the only place they are written down.

    pixel 3 · chroma 5 · gran 28 · noise 18 · scroll 30 · scan 60
    flicker 30 · fade 4.0s · warm 0.5s · etch 1.0 · beam ares

Two of those no longer sit still (`CFG.drift`). Granulation sweeps 0-20 on an
8.7 s clock and chromatic split sweeps 0-14 on a 29.3 s clock. The periods are
not a whole-number ratio (3.368), so they never phase-lock into a visible
repeat — measured correlation between the two sweeps is r = +0.13. Set
`enabled: false` on either to pin it back at its `CFG.crt` value.

Beats:

| beat | ms | what |
|---|---|---|
| WARM | 500 | black tube, static only |
| RESOLVE | 4000 | SIGNATURE resolves: block 46 → 3, chroma settles 27 → 5, shear decays. PELAGIC fades up inside the tube |
| ETCH · url | 1800 | laser carves `nathanherling.com` under the signature |
| ETCH · enter | 4800 | laser carves the `[PRESS TO ENTER]` button: border → scratch infill → text |
| READY | ∞ | button live, breathing; waits for the user |

Etch order is fixed: **url first, button second.** Both are separate jobs with
their own arm-in.

Cutting-head rules, carried forward and non-negotiable:

- the head starts centred in the tube and travels straight to its first cut,
  beams dark; that arrival **is** its first contact
- edge nodes fire only while a cut is in progress and go dark on the frame the
  cut completes — no trailing beams, no leftover mark at the last contact point
- completed cuts persist and glow; they do not re-animate

The signature burns **green** on the phosphor (`CFG.ink.sig`), not white. The
CRT splits the source into R/G/B and recombines with `lighter`, so a green
source fringes more softly than a white one — the red and blue channels have
less to carry. Rail slot L3 uses the same ink, since it is the main screen
shrunk down.

Glass fracture is budgeted, not free (`CFG.cracks`): 7 fractures total, split
**70% during the cut and 30% at completion**. The during-cut ones are scheduled
across the carve window at job start rather than gated on a minimum interval,
so the split is exact rather than emergent — measured 5 during, 2 after. Every fracture **originates on the button's outer edge** and
propagates outward; segments that would run back across the button interior are
steered out (`keepOut`). The button is carved-out material, so the glass gives
around the cut rather than webbing across the face. Fractures are a button-job
flourish only — the url is a fine cut and throws none.

The beam palette is `ares`, sampled directly out of the Tron: Ares reference
frame rather than eyeballed. Roles take measured values off the red luminance
ladder, widest/dimmest to narrowest/brightest, weighted to the dark end:

    glow   rgba(112,0,0)   deep body cluster   #700000
    beam   rgb(224,0,16)   saturated cluster   #e00010
    hot    #fd4543         lit edge      p75
    hot2   #fe8061         hot edge      p92
    flare  253,157,126     core          p99

The reference red leans blue (b > g), which is what separates it from the amber
it replaces. Amber has not left the page — it moved jobs. Red is now the beam
family; amber is the heat family, carried by the url embers and the machine
status LED.

The url is incandescent **from the moment it is cut**, not after. Material
behind the cutting head is drawn hot in three bands so there is a cooling
gradient rather than a flat wash, and it never drops to the cool sprite. The
same treatment persists once the job finishes (`CFG.urlEtch`). It breathes on three
incommensurate sines so the pulse never lands on a countable beat, and spots on the
glyph run **heat before they let go**: a spot smoulders for 420-940 ms on a u^2
ramp, climbing the ember ladder from beam red through amber to a white-hot
pinpoint, flickering the whole way, and only then bursts. Up to 3 spots heat at
once. Sparks thrown by the burst are amber, mixed across six tones, so a burst
is never one flat colour — hot metal leaving a red cut.

Measured: a spot is heating in 77% of sampled frames, 30 pops in 26 s, all six
ember tones observed in flight.

Tube composition, as fractions of the tube box (`CFG.frame`):

    signature   cy 0.33   w 0.60
    url         cy 0.505
    PELAGIC     cy 0.685  size 0.115
    button      cy 0.875

---

## 3. Act 2 — SEGUE (on press, 1.97 s)

| beat | ms | what |
|---|---|---|
| WIPE | 420 | bright horizontal band sweeps the tube |
| TYPE | 1300 | behind the wipe: SHELL, centred. `./init_home_nathan_herling` types itself with keystroke sfx |
| EXEC | 250 | enter thunk |

The press unlocks audio. Nothing autoplays with sound before it.

---

## 4. Act 3 — ESTABLISH (5.3 s, continuous with act 2)

| beat | ms | what |
|---|---|---|
| FRAME | 900 | rail and top-panel rules draw in; SHELL drifts to rail slot L2 |
| MOUNT | 700 | PELAGIC re-docks from the tube to rail slot L1 |
| PLACARD | 700 | rail slot L3 lights: a small screen carrying the signature and the url |
| DECK | 1100 | flat disc rakes up into the 3D DECK in the main area |
| PRINT | 1400 | centre printer lays 4 placards onto the deck faces |
| CARDS | 700 | the 4 top-panel cards deal in |
| LIVE | 500 | controls hand over to the user |

Everything drifts. Nothing snaps between positions.

---

## 5. Act 4 — MAIN UI (live)

    +----------+------------------------------------------+
    |   RAIL   |  TOP PANEL   [CV][02][03][04]            |
    |          +------------------------------------------+
    | L1 cube  |                                          |
    | L2 shell |          MAIN AREA                       |
    | L3 plaque|          rotating DECK                   |
    | L4 (open)|                                          |
    +----------+------------------------------------------+

Rail slots:

| slot | content |
|---|---|
| L1 | PELAGIC — design to be extended later |
| L2 | the shell terminal |
| L3 | small screen: signature over `nathanherling.com`, live — the url keeps the same breath and embers as the tube copy |
| L4 | empty — reserved as the dock target for the minimised deck |

Deck controls, all three live at once:

1. **grab** — drag horizontally to spin, inertia, then snap to nearest face
2. **toggle** — prev/next buttons as an alternate route
3. **top-panel card click** — deck immediately swings that face flush to camera,
   shortest angular path

Top-panel cards mirror the deck faces one-to-one.

---

## 6. Act 5 — PANEL ACTION

Clicking a **deck face**:

1. the deck minimises out of the main area and docks into rail slot L4
2. the main area opens that panel's content
3. closing the panel returns the deck to the main area

Clicking a top-panel card only swings the deck (act 4 rule 3). The card is a
selector; the face is the door.

---

## 7. Panels — RESOLVED

| slot | label | kind | target | status |
|---|---|---|---|---|
| 1 | CV | pdf | assets/cv/nherling_cv.pdf | live |
| 2 | Research | page | | live |
| 3 | Projects | page | | live |
| 4 | Mathematics | page | | live |

Order is deliberate: credential, then the work, then the hands, then the
independent thinking.

**Slot 3 carries a constraint, not just content.** Projects must lead with
instrumentation and hardware — the DCS/SCADA work — and put software tooling
underneath. Without that ordering it degrades into a tile wall and stops
carrying the experimental-physics argument, which is the whole reason the panel
earns a quarter of the deck.

Copy lives in `CFG.panels[].body`. Labels are checked to fit at 1440, 1180 and
820 px on both the top cards and the deck faces; `Mathematics` is the longest
at 144 px against 229 px of face width.

---

## 8. Constraints carried forward

- no build step, no framework, no CDN at ship time
- the deck is CSS 3D, not three.js — nothing on this page needs a renderer
- `prefers-reduced-motion` jumps straight to the act 4 layout
- one run per session via `sessionStorage`
- self-host Orbitron + Share Tech Mono before ship
- add `assets/cv/nherling_cv.pdf` and a CNAME before ship

## 9. Out of scope

Backend, CMS, blog, analytics, multi-page routing. New ideas route back through
stage A.
