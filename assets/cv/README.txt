Put NHerling_CV_2026.pdf here.

The CV panel does NOT frame the pdf. Chromium refuses to display a file://
subresource document, so an iframe stays blank whenever index.html is opened off
disk — which is the normal way this site runs. The panel shows rendered page
images instead, which are ordinary subresources and load from disk fine.

    tools/build.sh   renders assets/cv/page-1.png, page-2.png, ... with pdftoppm

The pdf itself is still shipped and still linked: Download PDF, and Open in new
tab, which is a top-level navigation and so works locally.

Paths are set in js/config.js -> CFG.panels[0]:

    target:   'assets/cv/NHerling_CV_2026.pdf'
    download: 'NHerling_CV_2026.pdf'
    pages:    ['assets/cv/page-1.png', 'assets/cv/page-2.png']

If your new CV has a different page count, update `pages` to match. build.sh
prints a reminder.
