#!/usr/bin/env ts-node

import fs from 'fs';
import path from 'path';

// 🔹 Chemin vers les messages
const MESSAGES_DIR = path.resolve('./messages');

// 🔹 Langues supportées
const LOCALES = ['fr', 'en', 'ln'];

// 🔹 Clé racine à ignorer (ex: "LUVIKA")
const ROOT_KEYS_TO_IGNORE = new Set(['LUVIKA']);

/**
 * Parcourt un objet récursivement et extrait toutes les clés sous forme de chemin doté
 * ex: { a: { b: "x" } } → ["a.b"]
 */
function extractKeys(obj: any, prefix = ''): string[] {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return prefix ? [prefix] : [];
  }

  return Object.keys(obj).flatMap(key => {
    if (ROOT_KEYS_TO_IGNORE.has(key) && prefix === '') {
      return [];
    }
    const newPrefix = prefix ? `${prefix}.${key}` : key;
    return extractKeys(obj[key], newPrefix);
  });
}

/**
 * Compare les clés entre deux langues et retourne les manquantes/orphelines
 */
function diffKeys(baseKeys: Set<string>, targetKeys: Set<string>, locale: string) {
  const missing = Array.from(baseKeys).filter(k => !targetKeys.has(k));
  const orphaned = Array.from(targetKeys).filter(k => !baseKeys.has(k));
  return { missing, orphaned };
}

/**
 * Charge et parse un fichier JSON (tolérant aux commentaires)
 */
function safeReadJSON(filePath: string): any {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`❌ Échec du chargement : ${filePath}`);
    throw err;
  }
}

/**
 * Formate un chemin de clé pour l’affichage
 */
function formatKeyPath(key: string): string {
  return key.split('.').map((k, i) => 
    i === 0 ? k : `"${k}"`
  ).join('.');
}

/**
 * ✅ Point d’entrée principal
 */
async function main() {
  console.log('🔍 Validation des fichiers de traduction...\n');

  // Charger les clés de référence (fr.json = source de vérité)
  const frPath = path.join(MESSAGES_DIR, 'fr.json');
  if (!fs.existsSync(frPath)) {
    console.error('❌ fr.json introuvable. Vérifiez le chemin.');
    process.exit(1);
  }

  const frData = safeReadJSON(frPath);
  const baseKeys = new Set(extractKeys(frData));
  console.log(`✅ Langue de référence : fr (${baseKeys.size} clés)\n`);

  let hasErrors = false;

  // Vérifier les autres locales
  for (const locale of LOCALES.filter(l => l !== 'fr')) {
    const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
    
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  ${locale}.json introuvable – ignoré.\n`);
      continue;
    }

    const data = safeReadJSON(filePath);
    const keys = new Set(extractKeys(data));
    const { missing, orphaned } = diffKeys(baseKeys, keys, locale);

    console.log(`📄 ${locale.toUpperCase()}: ${keys.size} clés`);
    
    if (missing.length > 0) {
      hasErrors = true;
      console.log(`  ❌ Manquantes (${missing.length}) :`);
      missing.slice(0, 10).forEach(k => 
        console.log(`    • ${formatKeyPath(k)}`)
      );
      if (missing.length > 10) {
        console.log(`    ... et ${missing.length - 10} autres`);
      }
    }

    if (orphaned.length > 0) {
      console.log(`  ⚠️  Orphelines (${orphaned.length}) :`);
      orphaned.slice(0, 5).forEach(k => 
        console.log(`    • ${formatKeyPath(k)}`)
      );
      if (orphaned.length > 5) {
        console.log(`    ... et ${orphaned.length - 5} autres`);
      }
    }

    if (missing.length === 0 && orphaned.length === 0) {
      console.log(`  ✅ Parfait !`);
    }
    console.log();
  }

  // 🔹 Rapport final
  if (hasErrors) {
    console.error('🚨 Erreurs détectées : certaines traductions sont incomplètes.');
    console.log('\n💡 Conseil : copiez-collez les clés manquantes depuis fr.json et traduisez-les.');
    process.exit(1);
  } else {
    console.log('🎉 Toutes les traductions sont synchronisées ✅');
    process.exit(0);
  }
}

// 🚀 Exécute le script
if (require.main === module) {
  main().catch(err => {
    console.error('💥 Erreur fatale :', err);
    process.exit(1);
  });
}

export default main;