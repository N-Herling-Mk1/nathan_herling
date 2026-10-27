# Tools — Calendar and Link Dock

Tool tiles sit to the right of the four deck cards (T1, T2). They are not deck
faces: clicking one docks the deck into rail slot L4, exactly like opening a
face, and mounts the tool's app in the main area. Close / Esc unmounts it.

| tile | id | code | data |
|---|---|---|---|
| T1 Calendar | `calendar` | `js/apps/calendar.js` | `data/schedule.json` |
| T2 Link Dock | `linkdock` | `js/apps/linkdock.js` | `data/links.json` |

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
