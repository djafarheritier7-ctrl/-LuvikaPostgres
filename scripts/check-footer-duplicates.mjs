// scripts/check-footer-duplicates.mjs
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const SRC_PATH = path.join(ROOT, 'src');
const ALLOWED_LAYOUT = 'src/app/(main)/layout.tsx';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      results.push(filePath);
    }
  });
  return results;
}

function isAllowedLayout(filePath) {
  const relative = path.relative(ROOT, filePath).replace(/\\/g, '/');
  return relative === ALLOWED_LAYOUT;
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const hasFooter = /<Footer\b/.test(content);
  return hasFooter && !isAllowedLayout(filePath);
}

console.log('🔍 Vérification des doublons de <Footer />...\n');

const files = walk(SRC_PATH);
let found = false;

for (const file of files) {
  if (checkFile(file)) {
    console.log(`⚠️  Doublon potentiel détecté : ${path.relative(ROOT, file)}`);
    found = true;
  }
}

if (!found) {
  console.log('✅ Aucun doublon trouvé. Le footer est uniquement dans (main)/layout.tsx.');
} else {
  console.error('\n❌ Correction requise : déplace ou supprime les <Footer /> hors de (main)/layout.tsx.');
  process.exit(1);
}