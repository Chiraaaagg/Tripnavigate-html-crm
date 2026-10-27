#!/usr/bin/env python3
"""Assemble build/src/* into ../full-crm-preview.html (one self-contained file).

Order: live.css (the live CRM's compiled style sheet, unchanged), then every
src/*.css in name order, then every src/*.js in name order. Fonts stay in ../fonts/.
Run: python3 -I build/assemble.py          -> ../full-crm-preview.html (lead only)
     python3 -I build/assemble.py sales    -> build/out/sales.html (your private test copy)
"""
import pathlib, re, sys
B = pathlib.Path(__file__).resolve().parent
OUT = B.parent / 'full-crm-preview.html'
if len(sys.argv) > 1:  # private test copy: build/out/<name>.html
    (B / 'out').mkdir(exist_ok=True)
    OUT = B / 'out' / (sys.argv[1] + '.html')
css = [(B / 'live.css').read_text()]
css += [p.read_text() for p in sorted((B / 'src').glob('*.css'))]
js = []
for p in sorted((B / 'src').glob('*.js')):
    t = p.read_text()
    if '</script' in t.lower():
        sys.exit(f'{p.name} contains a closing script tag; escape it as <\\/script>')
    js.append(f'<script>/* ===== {p.name} ===== */\n{t}\n</script>')  # one tag per file: a broken file cannot stop the others
html = f'''<!doctype html>
<html lang="en-IN" class="__variable_871e24 __variable_fdc1b3">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>TripNavigate CRM</title>
<!-- TripNavigate full CRM preview, 27 October 2026. Every name, number and amount is invented.
     Built from the live CRM look (main f354d5b). Source parts: build/src, assembled by build/assemble.py. -->
<style>
{chr(10).join(css)}
</style>
</head>
<body>
<a class="skip-link z-60" href="#main">Skip to main content</a>
<div id="tn-root"></div>
<div id="tn-overlay"></div>
<div id="tn-toast" aria-live="polite"></div>
{chr(10).join(js)}
</body>
</html>
'''
if OUT.parent != B.parent:
    html = html.replace('url(fonts/', 'url(../../fonts/')
OUT.write_text(html)
print(f'wrote {OUT} ({len(html)//1024} KB, {len(js)} scripts)')
