// ============ TOOL: GALLERY ============
// Image viewer over data/gallery.json. Images live in assets/gallery/<album>/;
// tools/build_gallery.py rescans that folder, writes the manifest and makes the
// thumbnails. Schema and workflow: docs/apps.md.
//
// Grid of thumbnails per album, filter box, and a lightbox with prev/next,
// wheel zoom toward the cursor, drag to pan, double-click to toggle fit / 1:1.
//
// mount(root) builds everything inside root and returns destroy().

import { h, statusBar, loadJSON, jsonPicker, store } from './ui.js';
import { normalize, clashes, courseCard, groupText } from './courses.js';

export { normalize };

const SOURCE = 'data/gallery.json';
const ZMIN = 0.05, ZMAX = 8;

export function mount(root) {
  const st = { g: { albums: [] }, album: store.get('nh-gallery-album', ''), q: '', list: [], idx: -1 };
  const status = statusBar();
  const tabs = h('div.gal-tabs', { role: 'tablist' });
  const notes = h('p.gal-notes', { hidden: true });
  const grid = h('ul.gal-grid');
  const empty = h('p.gal-empty', { hidden: true });
  const filter = h('input.ld-input.gal-filter', { type: 'search', placeholder: 'filter by title / caption', spellcheck: 'false' });
  filter.addEventListener('input', () => { st.q = filter.value.trim().toLowerCase(); renderGrid(); });
  const picker = jsonPicker('LOAD JSON', d => apply(d, 'local file'), m => status.set(m, 'err'));
  picker.hidden = true;

  root.append(h('div.app.app-gallery', null,
    h('div.app-bar', null, h('h3', { text: 'GALLERY' }), h('div.app-actions', null, filter, picker)),
    h('div.app-statusrow', null, status.el),
    tabs, notes, grid, empty));

  /* ---------- lightbox: lives on #view, not inside the scrolling body ---------- */
  const host = root.closest('#view') || root;
  const img = h('img.gal-lb-img', { alt: '', draggable: 'false' });
  const stage = h('div.gal-lb-stage', null, img);
  const lbTitle = h('div.gal-lb-title');
  const lbCap = h('div.gal-lb-cap');
  const lbCount = h('span.gal-lb-count');
  const lbZoom = h('span.gal-lb-zoom');
  const btn = (t, tip, fn) => h('button.app-btn', { type: 'button', title: tip, text: t, onclick: fn });
  const lbOpenLink = h('a.app-btn', { target: '_blank', rel: 'noopener', title: 'Open the original in a new tab', text: 'ORIGINAL ↗' });
  const lb = h('div.gal-lb', { hidden: true, role: 'dialog', 'aria-label': 'Image viewer' },
    stage,
    h('button.gal-lb-nav.prev', { type: 'button', 'aria-label': 'Previous image', text: '‹', onclick: () => show(st.idx - 1) }),
    h('button.gal-lb-nav.next', { type: 'button', 'aria-label': 'Next image', text: '›', onclick: () => show(st.idx + 1) }),
    h('div.gal-lb-bar', null,
      h('div.gal-lb-text', null, lbTitle, lbCap),
      h('div.app-actions', null, lbCount, lbZoom,
        btn('FIT', 'Fit to view (0)', () => fit()),
        btn('1:1', 'Actual pixels (1)', () => zoomTo(1)),
        lbOpenLink,
        btn('CLOSE', 'Close (Esc)', close))));
  host.append(lb);

  /* ---------- data ---------- */
  function apply(data, origin) {
    status.set('validating manifest…', 'info', 60);
    const n = normalize(data);
    st.g = n;
    n.warnings.forEach(w => console.warn('[nh gallery]', w));
    if (!n.albums.find(a => a.id === st.album)) st.album = n.albums.length ? n.albums[0].id : '';
    renderTabs(); renderGrid();
    const total = n.albums.reduce((s, a) => s + a.images.length, 0);
    status.set(n.albums.length + ' album' + (n.albums.length === 1 ? '' : 's') + ' · ' + total + ' image' + (total === 1 ? '' : 's')
      + (n.updated ? ' · updated ' + n.updated : '') + (origin ? ' · ' + origin : '')
      + (n.warnings.length ? ' · ' + n.warnings.length + ' warning(s), see console' : ''),
      n.warnings.length ? 'warn' : 'ok', 100);
  }
  const current = () => st.g.albums.find(a => a.id === st.album);

  /* ---------- grid ---------- */
  function renderTabs() {
    tabs.hidden = st.g.albums.length < 2;
    tabs.replaceChildren(...st.g.albums.map(a => h('button.cal-chip' + (a.id === st.album ? '.on' : ''), {
      type: 'button', role: 'tab', 'aria-selected': a.id === st.album ? 'true' : 'false',
      '--c': 'var(--cyan)', text: a.title + ' (' + a.images.length + ')',
      onclick: () => { st.album = a.id; store.set('nh-gallery-album', a.id); renderTabs(); renderGrid(); },
    })));
  }

  function renderGrid() {
    const a = current();
    notes.hidden = !(a && a.notes);
    notes.textContent = a ? a.notes : '';
    const q = st.q;
    const hit = im => !q || (im.title + ' ' + im.caption).toLowerCase().includes(q);

    // display order: groups in manifest order, then anything ungrouped
    const blocks = [];
    if (a) {
      const clash = clashes(a.groups);
      for (const g of a.groups) {
        const gHit = !q || groupText(g).includes(q);
        const imgs = a.images.filter(im => im.group === g.id && (gHit || hit(im)));
        if (gHit || imgs.length) blocks.push({ g, imgs, card: courseCard(g, clash) });
      }
      const loose = a.images.filter(im => (!im.group || !a.groups.find(g => g.id === im.group)) && hit(im));
      if (loose.length) blocks.push({ g: null, imgs: loose, card: a.groups.length ? h('div.gal-course-head', null, h('span.gal-name', { text: 'Other' })) : null });
    }
    st.list = blocks.flatMap(b => b.imgs);
    empty.hidden = blocks.length > 0;
    empty.textContent = !a ? 'No albums yet. Put images in assets/gallery/<album>/ and run tools/build_gallery.py.'
                      : q ? 'Nothing matches "' + q + '".' : 'This album is empty.';

    let done = 0;
    const total = st.list.length;
    const tick = () => {
      done++;
      if (done < total) status.set('loading thumbnails ' + done + '/' + total, 'info', Math.round(done / total * 100));
      else status.set((a ? a.title + ' · ' : '') + (a && a.groups.length ? a.groups.length + ' courses · ' : '')
                      + total + ' image' + (total === 1 ? '' : 's'), 'ok', 100);
    };
    const thumb = im => {
      const i = st.list.indexOf(im);
      const t = h('img', { src: im.thumb || im.file, alt: im.title, decoding: 'async' });   // thumbs are ~10 KB: load all, so progress completes
      t.addEventListener('load', tick, { once: true });
      t.addEventListener('error', () => { t.replaceWith(h('span.gal-missing', { text: 'missing: ' + im.file })); tick(); }, { once: true });
      return h('li.gal-item', null,
        h('button.gal-thumb', { type: 'button', title: im.title + (im.w ? ' · ' + im.w + '×' + im.h : ''), onclick: () => open(i) },
          t, h('span.gal-label', { text: im.title })));
    };
    grid.replaceChildren(...blocks.map(b => h('li.gal-block', null,
      b.card, b.imgs.length ? h('ul.gal-grid-inner', null, b.imgs.map(thumb)) : null)));
    if (!total && blocks.length) status.set((a ? a.title + ' · ' : '') + 'no images match', 'ok', 100);
    else if (total) status.set('loading thumbnails 0/' + total, 'info', 0);
  }

  /* ---------- lightbox ---------- */
  const view = { s: 1, x: 0, y: 0, fitS: 1 };
  function applyT() {
    img.style.transform = 'translate(' + view.x + 'px,' + view.y + 'px) scale(' + view.s + ')';
    lbZoom.textContent = Math.round(view.s * 100) + '%';
  }
  function fit() {
    const r = stage.getBoundingClientRect();
    const nw = img.naturalWidth || 1, nh = img.naturalHeight || 1;
    view.fitS = Math.min((r.width - 24) / nw, (r.height - 24) / nh, 1);
    view.s = view.fitS;
    view.x = (r.width - nw * view.s) / 2;
    view.y = (r.height - nh * view.s) / 2;
    applyT();
  }
  function zoomTo(s, cx, cy) {
    const r = stage.getBoundingClientRect();
    if (cx == null) { cx = r.width / 2; cy = r.height / 2; }
    s = Math.max(ZMIN, Math.min(ZMAX, s));
    // keep the image point under the cursor fixed
    view.x = cx - (cx - view.x) * (s / view.s);
    view.y = cy - (cy - view.y) * (s / view.s);
    view.s = s;
    applyT();
  }

  /* #view scrolls, and the lightbox is absolute inside it — pin it to the
     part of the view that is actually on screen, then freeze the scroll. */
  function pin() {
    if (host === root) return;
    lb.style.top = host.scrollTop + 'px';
    lb.style.height = host.clientHeight + 'px';
    lb.style.bottom = 'auto';
  }
  function open(i) {
    lb.hidden = false;
    host.classList.add('gal-lb-on');
    pin();
    show(i);
  }
  function show(i) {
    const n = st.list.length;
    if (!n) return;
    st.idx = (i + n) % n;
    const im = st.list[st.idx];
    lbTitle.textContent = im.title;
    lbCap.textContent = im.caption;
    lbCap.hidden = !im.caption;
    lbCount.textContent = (st.idx + 1) + ' / ' + n;
    lbOpenLink.href = im.file;
    lbZoom.textContent = '…';
    img.onload = fit;
    img.onerror = () => { lbZoom.textContent = 'failed'; status.set('could not load ' + im.file, 'err'); };
    img.src = im.file;
    if (img.complete && img.naturalWidth) fit();
    // warm the neighbours so prev/next is instant
    [st.idx + 1, st.idx - 1].forEach(k => { const nb = st.list[(k + n) % n]; if (nb) new Image().src = nb.file; });
  }
  function close() {
    lb.hidden = true;
    host.classList.remove('gal-lb-on');
    img.removeAttribute('src');
    st.idx = -1;
  }

  stage.addEventListener('wheel', e => {
    e.preventDefault();
    const r = stage.getBoundingClientRect();
    zoomTo(view.s * Math.exp(-e.deltaY * 0.0015), e.clientX - r.left, e.clientY - r.top);
  }, { passive: false });
  stage.addEventListener('dblclick', e => {
    const r = stage.getBoundingClientRect();
    if (Math.abs(view.s - view.fitS) < 0.01) zoomTo(1 > view.fitS * 1.2 ? 1 : view.fitS * 2.5, e.clientX - r.left, e.clientY - r.top);
    else fit();
  });
  let drag = null;
  stage.addEventListener('pointerdown', e => {
    drag = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y, moved: 0 };
    stage.setPointerCapture(e.pointerId);
    stage.classList.add('grabbing');
  });
  stage.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    drag.moved = Math.max(drag.moved, Math.abs(dx) + Math.abs(dy));
    view.x = drag.vx + dx; view.y = drag.vy + dy; applyT();
  });
  const endDrag = e => {
    if (!drag) return;
    // a horizontal swipe on a fitted image pages instead of panning
    const dx = e.clientX - drag.x;
    if (Math.abs(view.s - view.fitS) < 0.01 && Math.abs(dx) > 70) { show(st.idx + (dx < 0 ? 1 : -1)); }
    drag = null; stage.classList.remove('grabbing');
  };
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);

  /* Capture phase on window so Esc closes the lightbox, not the whole tool
     (deck.js listens for Esc in the bubble phase). */
  const onKey = e => {
    if (lb.hidden) return;
    const k = e.key;
    if (k === 'Escape') close();
    else if (k === 'ArrowLeft') show(st.idx - 1);
    else if (k === 'ArrowRight') show(st.idx + 1);
    else if (k === '+' || k === '=') zoomTo(view.s * 1.25);
    else if (k === '-' || k === '_') zoomTo(view.s / 1.25);
    else if (k === '0') fit();
    else if (k === '1') zoomTo(1);
    else return;
    e.preventDefault(); e.stopPropagation();
  };
  addEventListener('keydown', onKey, true);
  const onResize = () => { if (!lb.hidden) { pin(); fit(); } };
  addEventListener('resize', onResize);

  /* ---------- load ---------- */
  (async () => {
    status.set('fetching ' + SOURCE + '…', 'info', 20);
    const r = await loadJSON(SOURCE);
    if (r.data) { status.set('parsing…', 'info', 45); apply(r.data); return; }
    picker.hidden = false;
    renderGrid();
    if (r.offline) status.set('Opened from disk: browsers block reading ' + SOURCE + ' here. Use LOAD JSON, or serve the folder.', 'warn', 100);
    else if (r.missing) status.set(SOURCE + ' not found — run tools/build_gallery.py', 'err', 100);
    else status.set(r.error, 'err', 100);
  })();

  return function destroy() {
    removeEventListener('keydown', onKey, true);
    removeEventListener('resize', onResize);
    host.classList.remove('gal-lb-on');
    lb.remove();
  };
}
