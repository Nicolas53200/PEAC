const fs = require('fs');
const path = require('path');

const WWW_DIR = path.join(__dirname, '..', 'www');
const ROOT = path.join(__dirname, '..');

const WEB_FILES = [
  'index.html',
  'app.js',
  'styles.css',
  'qrcode-gen.js',
  'service-worker.js',
  'manifest.webmanifest',
  'logo-peac.png',
  'icon192.png',
  'icon512.png',
];

const WEB_DIRS = ['icons'];

// Clean and recreate www
if (fs.existsSync(WWW_DIR)) {
  fs.rmSync(WWW_DIR, { recursive: true });
}
fs.mkdirSync(WWW_DIR, { recursive: true });
fs.mkdirSync(path.join(WWW_DIR, 'libs'), { recursive: true });

// Copy files
for (const file of WEB_FILES) {
  const src = path.join(ROOT, file);
  const dest = path.join(WWW_DIR, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`  copied ${file}`);
  } else {
    console.warn(`  WARN: ${file} not found, skipping`);
  }
}

// Copy directories
for (const dir of WEB_DIRS) {
  const srcDir = path.join(ROOT, dir);
  const destDir = path.join(WWW_DIR, dir);
  if (fs.existsSync(srcDir)) {
    fs.cpSync(srcDir, destDir, { recursive: true });
    console.log(`  copied ${dir}/`);
  }
}

// Copy local libraries for offline use (from node_modules)
const LIBS = [
  { src: 'node_modules/xlsx/dist/xlsx.full.min.js', dest: 'libs/xlsx.full.min.js' },
  { src: 'node_modules/jsqr/dist/jsQR.js', dest: 'libs/jsQR.min.js' },
];

for (const lib of LIBS) {
  const src = path.join(ROOT, lib.src);
  const dest = path.join(WWW_DIR, lib.dest);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`  copied lib ${lib.dest}`);
  } else {
    console.warn(`  WARN: ${lib.src} not found — run npm install first`);
  }
}

// Patch index.html in www/ to use local libraries instead of CDN
// This does NOT modify the original index.html in the project root
const indexPath = path.join(WWW_DIR, 'index.html');
let html = fs.readFileSync(indexPath, 'utf-8');

html = html.replace(
  "loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js', 'lib-xlsx')",
  "loadScript('libs/xlsx.full.min.js', 'lib-xlsx')"
);
html = html.replace(
  "loadScript('https://cdnjs.cloudflare.com/ajax/libs/jsQR/1.4.0/jsQR.min.js', 'lib-jsqr')",
  "loadScript('libs/jsQR.min.js', 'lib-jsqr')"
);

fs.writeFileSync(indexPath, html, 'utf-8');
console.log('  patched index.html → local libs');

// Patch service-worker.js in www/ to remove unused qrcodejs CDN reference
const swPath = path.join(WWW_DIR, 'service-worker.js');
let sw = fs.readFileSync(swPath, 'utf-8');
sw = sw.replace(
  "  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',\n",
  ''
);
sw = sw.replace(
  "  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',\n",
  "  './libs/xlsx.full.min.js',\n"
);
sw = sw.replace(
  "  'https://cdnjs.cloudflare.com/ajax/libs/jsQR/1.4.0/jsQR.min.js',\n",
  "  './libs/jsQR.min.js',\n"
);

fs.writeFileSync(swPath, sw, 'utf-8');
console.log('  patched service-worker.js → local libs, removed unused qrcodejs');

console.log('www/ build complete.');
