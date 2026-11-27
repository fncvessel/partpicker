// Bundles src/ into dist/index.html (single self-contained page).
const fs = require('fs');
const path = require('path');
const { loadCatalog } = require('./lib/parts-io.js');
const src = (f) => fs.readFileSync(path.join(__dirname, 'src', f), 'utf8');
const html = src('page.html')
  .replace('/*STYLES*/', () => src('styles.css'))
  .replace('/*CATALOG*/', () => 'globalThis.SLOTWISE_DATA = ' + JSON.stringify(loadCatalog()) + ';\n' + src('catalog.js'))
  .replace('/*ENGINE*/', () => src('engine.js'))
  .replace('/*APP*/', () => src('app.js'));
fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'dist', 'index.html'), html);
const imported = path.join(__dirname, 'src', 'catalog.imported.json');
if (fs.existsSync(imported)) fs.copyFileSync(imported, path.join(__dirname, 'dist', 'parts.json'));
console.log('dist/index.html', (html.length / 1024).toFixed(1) + ' KB');
