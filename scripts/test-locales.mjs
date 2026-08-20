// scripts/test-locales.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const messagesDir = path.join(__dirname, '../src/messages');
const locales = ['ar','en','es','fr','kg','ln','nl','pt','sw'];

console.log('🔍 Test des fichiers de traduction...\n');

let allPassed = true;

for (const locale of locales) {
  const filePath = path.join(messagesDir, `${locale}.json`);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`❌ Manquant : ${locale}.json`);
      allPassed = false;
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    JSON.parse(content); // Valide le JSON
    console.log(`✅ ${locale}.json — OK`);
  } catch (err) {
    console.log(`💥 Erreur dans ${locale}.json : ${err.message}`);
    allPassed = false;
  }
}

console.log('\n---\n');

if (allPassed) {
  console.log('🎉 Tous les fichiers de traduction sont valides !');
  process.exit(0);
} else {
  console.log('🚨 Certains fichiers sont manquants ou invalides.');
  process.exit(1);
}