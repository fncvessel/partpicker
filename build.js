// Bundles src/ into dist/index.html (single self-contained page).
const fs = require('fs');
const path = require('path');
const src = (f) => fs.readFileSync(path.join(__dirname, 'src', f), 'utf8');
const html = src('page.html')
  .replace('/*STYLES*/', () => src('styles.css'))
  .replace('/*CATALOG*/', () => src('catalog.js'))
  .replace('/*ENGINE*/', () => src('engine.js'))
  .replace('/*APP*/', () => src('app.js'));
fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'dist', 'index.html'), html);
console.log('dist/index.html', (html.length / 1024).toFixed(1) + ' KB');
