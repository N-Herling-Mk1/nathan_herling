# Tools — Calendar, Link Dock, Gallery, Week

Tool tiles sit to the right of the four deck cards (T1, T2). They are not deck
faces: clicking one docks the deck into rail slot L4, exactly like opening a
face, and mounts the tool's app in the main area. Close / Esc unmounts it.

| tile | id | code | data |
|---|---|---|---|
| T1 Calendar | `calendar` | `js/apps/calendar.js` | `data/schedule.json` |
| T2 Link Dock | `linkdock` | `js/apps/linkdock.js` | `data/links.json` |
| T3 Gallery | `gallery` | `js/apps/gallery.js` | `data/gallery.json` + `assets/gallery/` |
| T4 Week | `planner` | `js/apps/planner.js` | `data/planner.json` (+ course catalog in `data/gallery.json`) |

Shared pieces: `js/apps/ui.js` (element builder, status/progress bar, JSON
loader, file picker, localStorage wrapper), `js/apps/index.js` (id → module
registry), `css/apps.css` (tiles + both apps, on the site tokens). The tile
list itself is `CFG.tools` in `js/config.js`.

**Deep links.** The tool id is mirrored in the URL hash. `nathanherling.com/#calendar`
skips the splash and lands on the calendar; closing the tool clears the hash.

**Data loading.** Over http(s) — GitHub Pages, or `python3 -m http.server` —
each app fetches its JSON fresh (`cache: no-store`), so the update path is
*edit the file → commit → push*. Opened straight from disk (`file://`) the browser
refuses that read; the app says so and shows a **LOAD** button to pick the file
by hand. This is the only part of the site that reads a file at runtime.

Adding a tool: write `js/apps/<id>.js` exporting `mount(root) → destroy()`,
register it in `js/apps/index.js`, add an entry to `CFG.tools`, rebuild
`js/site.js`.

---

## Calendar — `data/schedule.json`

```jsonc
{
  "meta": { "title": "Fall 2026", "updated": "2026-10-27" },

  "categories": {                        // key -> legend label + colour
    "class": { "label": "Class", "color": "#00e5ff" }
  },

  "recurring": [                         // weekly repeats
    {
      "title": "CHEM 181 lecture",
      "days": ["Mo", "We", "Fr"],        // Su Mo Tu We Th Fr Sa
      "start": "09:00", "end": "09:50",  // 24h HH:MM; omit both = all day; start only = a point in time
      "from": "2026-08-24", "until": "2026-12-10",
      "location": "Commons 105",
      "category": "class",
      "except": ["2026-11-11"]           // skipped dates (holidays, cancellations)
    }
  ],

  "events": [                            // one-offs
    { "title": "INFO 579 Project 2 due", "date": "2026-11-08", "start": "23:59", "category": "deadline" },
    { "title": "Thanksgiving — no classes", "date": "2026-11-26", "endDate": "2026-11-27", "category": "holiday" }
  ]
}
```

Optional on any entry: `location`, `notes`, `url`, `category`.

- Status bar walks fetch → parse → validate → render. A bad entry is skipped and
  listed under an amber **N warnings** button (and the console); it never takes
  the page down.
- Each entry is its own row in a day cell. Cells are fixed-height and scroll;
  they never grow.
- Click a day for detail. `←` / `→` change month, `T` jumps to today.
- Legend chips hide/show a category (remembered per browser).
- Only the visible six weeks are expanded, so long `from`/`until` ranges cost nothing.

## Link Dock — `data/links.json`

Drop a link, a tab's address-bar icon, or a bookmark onto the page (or paste /
type URLs). For each URL the browser probes, in parallel:

1. `https://<site>/apple-touch-icon.png`
2. `https://<site>/favicon.ico`
3. DuckDuckGo's icon service
4. Google's s2 favicon service (its generic 16px globe for unknown sites ranks last)

The largest image that actually loads wins; the rest show as clickable
alternates. Services 3 and 4 learn which domains you drop.

Why no backend: a static page cannot read another site's HTML (CORS), but it
can display a cross-origin image. What it cannot do is save the image bytes —
that is `tools/fetch_icons.py`, run locally.

Workflow:

1. Open the tool, drop URLs, fix titles inline, pick alternates if needed.
2. **EXPORT** → save as `data/links.json` in the repo.
3. `python3 tools/fetch_icons.py` — fetches each site's HTML, parses
   `<link rel=icon|apple-touch-icon>` and the manifest, downloads the largest
   real image (magic-byte checked) to `assets/linkicons/<host>.<ext>`, and
   rewrites each `icon` to that path. Progress per link; never touches git.
4. Review the diff, commit.

Unexported changes survive reloads in the same browser only (localStorage
draft). Nobody else sees them until committed.

```json
{
  "updated": "2026-10-27",
  "links": [
    { "title": "github.com", "url": "https://github.com/", "icon": "assets/linkicons/github.com.png", "iconSource": "scraped: <link icon 32x32> https://..." }
  ]
}
```

Needs server code only for: live HTML scraping at drop time (a small Cloudflare
Worker proxy), or visitor-added links that persist for everyone (a real backend
— that belongs on the private `nathan_herling_dev` side).

## Gallery — `data/gallery.json` + `assets/gallery/`

Each sub-folder of `assets/gallery/` is an album. Drop images in, then:

    python tools/build_gallery.py            # merge new files into the manifest, make thumbnails
    python tools/build_gallery.py --dry-run  # report only

The manifest is merged, not regenerated: titles, captions, album titles/notes and
image order edited in `data/gallery.json` survive a rescan. New files are
appended by file name (prefix them `001_`, `002_` … to control order), with a
title taken from the name. Entries whose file is gone are dropped and listed.
Thumbnails are 480 px WebP in `<album>/_thumbs/` and need Pillow
(`pip install pillow`); without it the grid uses the full images.

```json
{
  "updated": "2026-10-28",
  "albums": [
    { "id": "spring-2027", "title": "Spring 2027 — classes", "notes": "…",
      "images": [
        { "file": "assets/gallery/spring-2027/001_example.png",
          "thumb": "assets/gallery/spring-2027/_thumbs/001_example.webp",
          "title": "example", "caption": "", "w": 1920, "h": 1080 } ] }
  ]
}
```

**Course groups (optional, hand-written).** An album can carry `groups`, and an
image can name one with `"group"`. The viewer then shows one card per group —
code, name, units/career/mode/grading, description, enrollment requirements,
and a table with one row per section — with that group's screenshots under it.
Sections of different courses that overlap in day and time are flagged in the
Clash column. A rescan keeps all of this; only `file`/`thumb`/`w`/`h` are rebuilt.

```json
"groups": [
  { "id": "math-424", "code": "MATH 424", "name": "Theory of Complex Variables",
    "units": "3", "career": "Undergraduate", "mode": "In Person", "grading": "Regular Grades A, B, C, D, E",
    "description": "…", "requirements": "MATH 250B, 254 or 355.",
    "sections": [ { "section": "001", "type": "Lecture", "classNo": "42340", "status": "Open w/ Req",
                    "days": "TuTh", "time": "2:00PM - 3:15PM", "room": "Psychology, Rm 207",
                    "instructor": "To be Announced", "dates": "1/13/27 – 5/5/27" } ],
    "notes": "" }
]
```

Viewer: album tabs (when there is more than one), a filter box over titles and
captions, and a lightbox. In the lightbox: `←` / `→` page, wheel zooms toward the
cursor, drag pans, double-click toggles fit / zoom, `0` fit, `1` actual pixels,
`+` / `-` zoom, swipe pages on touch, Esc closes the lightbox (a second Esc
closes the tool). **ORIGINAL ↗** opens the full file in a new tab.

## Week planner — `data/planner.json`

The course catalog — codes, sections, times, rooms, requirements — is written
once, as `groups` on a gallery album (`js/apps/courses.js` reads it for both
tools). The planner file only says **which** courses, **which** of their
sections, and **what category**:

```json
{
  "version": 1,
  "categories": {
    "take":      { "label": "Take",      "color": "#4fd6ff" },
    "sit-in":    { "label": "Sit in",    "color": "#ffb24a" },
    "undecided": { "label": "Undecided", "color": "#7d93a3", "dashed": true }
  },
  "defaultCategory": "undecided",
  "terms": [{
    "id": "spring-2027", "title": "Spring 2027", "dates": "…",
    "catalog": { "source": "data/gallery.json", "album": "spring-2027" },
    "week": { "days": ["Mo","Tu","We","Th","Fr"], "start": "08:00", "end": "20:00" },
    "picks": [
      { "course": "chem-182", "sections": ["001", "001A"], "category": "take", "note": "" }
    ]
  }]
}
```

Built to grow: add a category (any key, label, colour, optional `dashed`);
add a term (its own catalog album and picks — a term selector appears); add a
course by adding a group to the album and a pick here. Unknown courses,
sections or categories are reported in the console and skipped, never fatal.

- **Week grid.** One column per day; the hour range widens to fit whatever is
  placed. Sections that overlap are drawn **side by side** in lanes. A busy day
  gets proportionally more width; past that the week scrolls sideways with the
  hour labels pinned.
- **Overlap marks.** Amber dot: overlaps another course. Red edge + dot: two
  courses both marked *Take* overlap. Dual-numbered pairs (`"same"` on the
  group, e.g. ECE 455/555) never count as overlapping each other.
- **Side panel.** Click a block or a course chip: the course's screenshots
  (‹ › or arrow keys; click the image or **WIDE** to widen the panel), a
  category switch, one row per section with a tick box to put it on or take it
  off the week, a note, and the full course card. The week stays on screen.
  Esc closes the panel; a second Esc closes the tool.
- **IMAGES mode.** **IMAGES** (or `i`) swaps the week out of the main area for a
  full-size viewer over every screenshot in the term, in course order: ‹ › or
  `←` `→` to step (wraps around), click the image for actual size / fit, and a
  filmstrip of all of them underneath. The header names the course and its
  category; **COURSE DETAILS** returns to the week with that course's panel
  open. **WEEK**, `i` or Esc swaps the calendar back.
- **Legend.** Category chips hide/show a category. Totals per category: course
  count, units, contact hours per week (`*` = alternative sections still ticked).
- **Saving.** Panel edits are kept as a draft in this browser ("unexported
  changes"). **EXPORT** downloads `planner.json` → replace `data/planner.json`,
  commit. **RESET** drops the draft. Once the repo file matches the draft, the
  draft clears itself.
