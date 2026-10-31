const fs = require('fs');
const path = require('path');

const bDir = path.resolve(__dirname);
const rootDir = path.resolve(bDir, '..');
const outPath = path.resolve(rootDir, 'full-crm-preview.html');

const liveCss = fs.readFileSync(path.resolve(bDir, 'live.css'), 'utf8');
const srcDir = path.resolve(bDir, 'src');

const cssFiles = fs.readdirSync(srcDir).filter(f => f.endsWith('.css')).sort();
let cssContent = [liveCss];
for (const f of cssFiles) {
  cssContent.push(fs.readFileSync(path.resolve(srcDir, f), 'utf8'));
}

const jsFiles = fs.readdirSync(srcDir).filter(f => f.endsWith('.js')).sort();
let jsTags = [];
for (const f of jsFiles) {
  const content = fs.readFileSync(path.resolve(srcDir, f), 'utf8');
  if (content.toLowerCase().includes('</script')) {
    console.error(`Error: ${f} contains </script`);
    process.exit(1);
  }
  jsTags.push(`<script>/* ===== ${f} ===== */\n${content}\n</script>`);
}

const html = `<!doctype html>
<html lang="en-IN" class="__variable_871e24 __variable_fdc1b3">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>TripNavigate CRM</title>
<!-- TripNavigate full CRM preview, 27 October 2026. Every name, number and amount is invented.
     Built from the live CRM look (main f354d5b). Source parts: build/src, assembled by build/assemble.py. -->
<style>
${cssContent.join('\n')}
</style>
</head>
<body>
<a class="skip-link z-60" href="#main">Skip to main content</a>
<div id="tn-root"></div>
<div id="tn-overlay"></div>
<div id="tn-toast" aria-live="polite"></div>
${jsTags.join('\n')}
</body>
</html>
`;

fs.writeFileSync(outPath, html, 'utf8');
console.log(`Wrote ${outPath} (${Math.round(html.length / 1024)} KB, ${jsTags.length} scripts)`);
