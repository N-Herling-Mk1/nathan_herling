// ============ TOOL: LINK DOCK ============
// Drop a URL, resolve the site's icon in the browser, export data/links.json.
//
// A static page cannot read another site's HTML (CORS), but it can DISPLAY a
// cross-origin image. So each URL is probed against several icon locations and
// the largest one that actually loads wins. Pulling the real image bytes into
// the repo is tools/fetch_icons.py's job — see docs/apps.md.
//
// mount(root) builds everything inside root and returns destroy().

import { h, statusBar, loadJSON, jsonPicker, store } from './ui.js';

const SOURCE = 'data/links.json';
const DRAFT_KEY = 'nh-linkdock-draft-v1';
const PROBE_TIMEOUT_MS = 8000;

/* ---------- URL + icon probing ---------- */
export function normUrl(raw) {
  let s = (raw || '').trim();
  if (!s || s[0] === '#') return null;
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(s)) s = 'https://' + s;
  try {
    const u = new URL(s);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    if (!u.hostname.includes('.') && u.hostname !== 'localhost') return null;
    u.hash = '';
    return u;
  } catch (e) { return null; }
}
const bareHost = u => u.hostname.replace(/^www\./, '');

export function candidatesFor(u) {
  return [
    { src: u.origin + '/apple-touch-icon.png', label: 'site apple-touch-icon' },
    { src: u.origin + '/favicon.ico', label: 'site favicon.ico' },
    { src: 'https://icons.duckduckgo.com/ip3/' + u.hostname + '.ico', label: 'DuckDuckGo' },
    // Google returns a generic 16px globe for unknown domains — ranked last.
    { src: 'https://www.google.com/s2/favicons?domain=' + encodeURIComponent(u.hostname) + '&sz=128', label: 'Google s2', weakAt: 16 },
  ];
}

function probe(c) {
  return new Promise(resolve => {
    const img = new Image();
    const timer = setTimeout(() => { img.src = ''; resolve(Object.assign({}, c, { ok: false })); }, PROBE_TIMEOUT_MS);
    img.onload = () => {
      clearTimeout(timer);
      const w = img.naturalWidth || 0;
      resolve(Object.assign({}, c, { ok: w > 0, w, h: img.naturalHeight || 0, weak: !!(c.weakAt && w <= c.weakAt) }));
    };
    img.onerror = () => { clearTimeout(timer); resolve(Object.assign({}, c, { ok: false })); };
    img.referrerPolicy = 'no-referrer';
    img.src = c.src;
  });
}

export function rank(results) {
  return results.filter(r => r.ok).sort((a, b) =>
    (a.weak === b.weak) ? Math.min(b.w, 256) - Math.min(a.w, 256) : (a.weak ? 1 : -1));
}

/* ---------- drag data ---------- */
function urlsFromDrop(dt) {
  const out = [];
  let title = '';
  const list = dt.getData('text/uri-list');
  if (list) out.push(...list.split(/\r?\n/).filter(s => s && s[0] !== '#'));
  const moz = dt.getData('text/x-moz-url');               // Firefox: "url\ntitle"
  if (moz) { const [u, t] = moz.split(/\r?\n/); if (u && !out.length) out.push(u); if (t) title = t; }
  const html = dt.getData('text/html');                   // Chrome link drags carry <a>text</a>
  if (html && !title) {
    const a = new DOMParser().parseFromString(html, 'text/html').querySelector('a[href]');
    if (a) { if (!out.length) out.push(a.href); title = a.textContent.trim(); }
  }
  if (!out.length) out.push(...(dt.getData('text/plain') || '').split(/\s+/));
  return { urls: out, title: title.slice(0, 80) };
}

export function mount(root) {
  let links = [];                 // {id,title,url,host,icon,iconSource,candidates,state,auto}
  let removed = new Set();        // urls removed locally, so repo entries don't come back
  let nextId = 1, qTotal = 0, qDone = 0;

  const status = statusBar();
  const tiles = h('ul.ld-tiles');
  const urlIn = h('input.ld-input', { type: 'text', placeholder: 'https://example.com', autocomplete: 'off', spellcheck: 'false' });
  const zone = h('section.ld-drop', { tabindex: '0' },
    h('p.ld-drop-main', { text: 'Drag a link, a tab’s address-bar icon, or a bookmark here' }),
    h('p.ld-drop-sub', { text: 'or paste (Ctrl+V) / type below — several URLs at once is fine' }),
    h('form.ld-form', { onsubmit: e => { e.preventDefault(); add(urlIn.value.split(/\s+/)); urlIn.value = ''; } },
      urlIn, h('button.app-btn', { type: 'submit', text: 'ADD' })));

  const btn = (label, tip, fn) => h('button.app-btn', { type: 'button', title: tip, onclick: fn, text: label });
  root.append(h('div.app.app-linkdock', null,
    h('div.app-bar', null,
      h('h3', { text: 'DROP A URL' }),
      h('div.app-actions', null,
        jsonPicker('LOAD', (data, name) => { const n = ingest(data); save(); status.set('loaded ' + n + ' new from ' + name, 'ok', 100); },
                   msg => status.set(msg, 'err')),
        btn('COPY JSON', 'Copy links.json to the clipboard', copyJson),
        btn('EXPORT', 'Download links.json — commit it as data/links.json', download),
        btn('CLEAR', 'Remove every tile from this browser’s draft', clearAll))),
    h('div.app-statusrow', null, status.el),
    zone, tiles));

  /* ---------- queue + status ---------- */
  function tick(label) {
    const pct = qTotal ? Math.round(qDone / qTotal * 100) : 100;
    status.set(qDone < qTotal ? 'probing icons ' + qDone + '/' + qTotal + ' — ' + label
                              : links.length + ' link' + (links.length === 1 ? '' : 's') + ' · icons resolved', 'info', pct);
  }
  function enqueue(list) {
    if (!list.length) return;
    qTotal += list.length; tick(list[0].host);
    list.forEach(l => resolve(l).finally(() => { qDone++; tick(l.host); }));
  }

  async function resolve(link) {
    link.state = 'probing'; draw(link);
    const ranked = rank(await Promise.all(candidatesFor(new URL(link.url)).map(probe)));
    link.candidates = ranked;
    if (!link.icon || link.auto) {
      link.icon = ranked.length ? ranked[0].src : '';
      link.iconSource = ranked.length ? ranked[0].label : 'none found';
      link.auto = true;
    }
    link.state = ranked.length ? 'done' : 'failed';
    draw(link); save();
  }

  /* ---------- add / remove / import ---------- */
  function make(u, title, icon, iconSource) {
    return { id: nextId++, url: u.href, host: bareHost(u), title: title || bareHost(u),
             icon: icon || '', iconSource: iconSource || '', candidates: [], state: 'done', auto: !icon };
  }
  function add(raw, titleHint) {
    const fresh = [];
    for (const r of raw) {
      const u = normUrl(r);
      if (!u) continue;
      if (links.some(l => l.url === u.href)) { status.set('already docked: ' + bareHost(u)); continue; }
      removed.delete(u.href);
      const l = make(u, raw.length === 1 ? titleHint : '');
      links.push(l); fresh.push(l);
    }
    save(); enqueue(fresh);
  }
  function ingest(data) {
    const arr = Array.isArray(data) ? data : (data && Array.isArray(data.links) ? data.links : null);
    if (!arr) throw new Error('expected {"links":[...]}');
    const fresh = [];
    for (const e of arr) {
      const u = normUrl(e.url);
      if (!u || links.some(l => l.url === u.href) || removed.has(u.href)) continue;
      const l = make(u, e.title, e.icon, e.iconSource);
      links.push(l); draw(l);
      if (!l.icon) fresh.push(l);
    }
    enqueue(fresh);
    return arr.length;
  }
  function remove(id) {
    const i = links.findIndex(l => l.id === id);
    if (i < 0) return;
    removed.add(links[i].url);
    links.splice(i, 1);
    const el = tiles.querySelector('[data-id="' + id + '"]');
    if (el) el.remove();
    save(); tick('');
  }
  function clearAll() {
    if (!links.length || !confirm('Remove all ' + links.length + ' tiles from this browser’s draft?')) return;
    links.forEach(l => removed.add(l.url));
    links = []; tiles.replaceChildren(); save();
    status.set('cleared — data/links.json in the repo is untouched until you export and commit', 'info', 100);
  }

  /* ---------- tiles ---------- */
  function iconBox(link) {
    const ph = () => h('span.ph', { text: link.state === 'probing' ? '…' : (link.host[0] || '?').toUpperCase() });
    const box = h('div.ld-icon');
    if (link.icon) {
      const img = h('img', { alt: '', referrerpolicy: 'no-referrer', src: link.icon });
      img.onerror = () => box.replaceChildren(ph());
      box.append(img);
    } else box.append(ph());
    return box;
  }
  function draw(link) {
    let li = tiles.querySelector('[data-id="' + link.id + '"]');
    if (!li) { li = h('li.ld-tile', { 'data-id': link.id }); tiles.append(li); }
    li.dataset.state = link.state;

    const title = h('input.ld-title', { value: link.title, spellcheck: 'false' });
    title.addEventListener('change', () => { link.title = title.value.trim() || link.host; save(); });
    const best = link.candidates.find(c => c.src === link.icon);
    const src = link.state === 'probing' ? h('div.ld-src', { text: 'probing…' })
      : h('div.ld-src', null, 'icon: ', h('b', { text: link.iconSource || '—' }), best && best.w ? ' · ' + best.w + '×' + best.h + 'px' : '');

    const alts = link.candidates.length > 1 ? h('div.ld-alts', null, link.candidates.map(c =>
      h('button.ld-alt' + (c.src === link.icon ? '.on' : ''), {
        type: 'button', title: c.label + ' · ' + c.w + '×' + c.h,
        onclick: () => { link.icon = c.src; link.iconSource = c.label; link.auto = false; draw(link); save(); },
      }, h('img', { src: c.src, alt: '', referrerpolicy: 'no-referrer' })))) : null;

    li.replaceChildren(...[
      h('div.ld-head', null, iconBox(link),
        h('div.ld-text', null, title, h('a.ld-url', { href: link.url, target: '_blank', rel: 'noopener', text: link.url }))),
      src, alts,
      h('div.ld-actions', null,
        link.icon ? h('button.app-btn', { type: 'button', text: 'SAVE ICON', title: 'Download the selected icon', onclick: () => saveIcon(link) }) : null,
        h('button.app-btn', { type: 'button', text: 'RE-PROBE', onclick: () => { link.auto = true; enqueue([link]); } }),
        h('button.app-btn.danger', { type: 'button', text: 'REMOVE', onclick: () => remove(link.id) })),
    ].filter(Boolean));
  }

  /* ---------- save one icon ----------
     <a download> is ignored for cross-origin URLs, so the bytes have to come
     through fetch(). That only works when the icon's host sends CORS headers.
     When it does not, open the image in a new tab: one right-click to save. */
  const EXT = { 'image/png': 'png', 'image/x-icon': 'ico', 'image/vnd.microsoft.icon': 'ico',
                'image/svg+xml': 'svg', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/webp': 'webp' };
  async function saveIcon(link) {
    status.set('fetching icon for ' + link.host + '…', 'info', 40);
    try {
      const res = await fetch(link.icon, { mode: 'cors', referrerPolicy: 'no-referrer' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const blob = await res.blob();
      const type = (blob.type || '').split(';')[0];
      if (!type.startsWith('image/')) throw new Error('not an image (' + (type || 'no type') + ')');
      const fromUrl = (new URL(link.icon).pathname.match(/\.(png|ico|svg|jpe?g|gif|webp)$/i) || [])[1];
      const ext = EXT[type] || (fromUrl || 'png').toLowerCase();
      const a = h('a', { href: URL.createObjectURL(blob), download: link.host.replace(/[^a-z0-9.-]/gi, '_') + '.' + ext });
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      status.set('saved ' + link.host + '.' + ext + ' (' + (blob.size / 1024).toFixed(1) + ' KB)', 'ok', 100);
    } catch (e) {
      // CORS block surfaces as a TypeError with no detail; anything else is real
      window.open(link.icon, '_blank', 'noopener');
      status.set(link.host + '\u2019s server blocks direct download — opened the icon in a new tab: right-click → Save image as', 'warn', 100);
    }
  }

  /* ---------- export + draft ---------- */
  const exportObj = () => ({
    updated: new Date().toISOString().slice(0, 10),
    links: links.map(l => ({ title: l.title, url: l.url, icon: l.icon, iconSource: l.iconSource })),
  });
  const exportText = () => JSON.stringify(exportObj(), null, 2) + '\n';
  function save() { store.set(DRAFT_KEY, { links: exportObj().links, removed: [...removed] }); }
  function download() {
    const a = h('a', { href: URL.createObjectURL(new Blob([exportText()], { type: 'application/json' })), download: 'links.json' });
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    status.set('exported ' + links.length + ' links → links.json (commit as data/links.json)', 'ok', 100);
  }
  async function copyJson() {
    try { await navigator.clipboard.writeText(exportText()); status.set('links.json copied to clipboard', 'ok', 100); }
    catch (e) { status.set('clipboard blocked — use EXPORT instead', 'err'); }
  }

  /* ---------- drag, drop, paste — live only while the app is mounted ---------- */
  let depth = 0;
  const on = ev => { ev.preventDefault(); depth++; zone.classList.add('over'); };
  const leave = () => { if (--depth <= 0) { depth = 0; zone.classList.remove('over'); } };
  const over = ev => { ev.preventDefault(); ev.dataTransfer.dropEffect = 'copy'; };
  const drop = ev => {
    ev.preventDefault(); depth = 0; zone.classList.remove('over');
    const f = ev.dataTransfer.files && ev.dataTransfer.files[0];
    if (f && /json$/i.test(f.name)) {
      f.text().then(t => { const n = ingest(JSON.parse(t)); save(); status.set('loaded ' + n + ' from ' + f.name, 'ok', 100); })
              .catch(e => status.set(f.name + ': ' + e.message, 'err'));
      return;
    }
    const { urls, title } = urlsFromDrop(ev.dataTransfer);
    if (!urls.some(normUrl)) { status.set('nothing URL-shaped in that drop', 'err'); return; }
    add(urls, title);
  };
  const paste = ev => {
    if (ev.target.closest && ev.target.closest('input, textarea')) return;
    const t = ev.clipboardData.getData('text/plain');
    if (t) add(t.split(/\s+/));
  };
  addEventListener('dragenter', on); addEventListener('dragleave', leave);
  addEventListener('dragover', over); addEventListener('drop', drop);
  document.addEventListener('paste', paste);

  /* ---------- boot: repo file, then this browser's unexported draft ---------- */
  (async () => {
    const draft = store.get(DRAFT_KEY, null);
    if (draft && Array.isArray(draft.removed)) removed = new Set(draft.removed);
    status.set('fetching ' + SOURCE + '…', 'info', 20);
    const r = await loadJSON(SOURCE);
    try { if (r.data) ingest(r.data); } catch (e) { status.set(SOURCE + ': ' + e.message, 'err'); }
    if (r.error) status.set(r.error, 'err');
    const repo = links.length;
    if (draft && Array.isArray(draft.links)) ingest({ links: draft.links });
    const local = links.length - repo;
    if (!qTotal) {
      const parts = [r.offline ? 'opened from disk (repo list not readable here — use LOAD)' : repo + ' from ' + SOURCE];
      if (local > 0) parts.push(local + ' from unexported local draft');
      status.set('ready · ' + parts.join(' · ') + ' · drop a URL', 'ok', 100);
    }
  })();

  return function destroy() {
    removeEventListener('dragenter', on); removeEventListener('dragleave', leave);
    removeEventListener('dragover', over); removeEventListener('drop', drop);
    document.removeEventListener('paste', paste);
  };
}
