#!/usr/bin/env npx ts-node

import * as fs from 'fs';
import * as path from 'path';
import { getLanguageInfo, AVAILABLE_LANGUAGES } from './languages';

// Paths
const ROOT_DIR = path.resolve(__dirname, '..');
const ASSETS_BOOKS_DIR = path.join(ROOT_DIR, 'assets', 'books');
const MANIFEST_PATH = path.join(ROOT_DIR, 'assets', 'manifest.json');
const EPUB_SERVICE_PATH = path.join(
  ROOT_DIR,
  'src',
  'shared',
  'services',
  'epubService.ts'
);

interface ManifestEntry {
  code: string;
  name: string;
  localName: string;
  rtl?: boolean;
  addedAt: string;
}

interface Manifest {
  version: number;
  languages: ManifestEntry[];
}

function parseArgs(): { code: string } | null {
  const args = process.argv.slice(2);
  let code = '';

  for (const arg of args) {
    if (arg.startsWith('--code=')) {
      code = arg.split('=')[1];
    }
  }

  if (!code) {
    console.error('Usage: npm run remove-epub -- --code=<language-code>');
    console.error('Example: npm run remove-epub -- --code=ko');
    return null;
  }

  return { code };
}

function removeEpubFile(code: string): boolean {
  const epubPath = path.join(ASSETS_BOOKS_DIR, `${code}.epub`);

  if (!fs.existsSync(epubPath)) {
    console.log(`ℹ️  EPUB file for "${code}" does not exist`);
    return true;
  }

  fs.unlinkSync(epubPath);
  console.log(`✅ Removed ${path.relative(ROOT_DIR, epubPath)}`);
  return true;
}

function updateEpubService(code: string): boolean {
  if (!fs.existsSync(EPUB_SERVICE_PATH)) {
    console.error(`Error: epubService.ts not found at ${EPUB_SERVICE_PATH}`);
    return false;
  }

  let content = fs.readFileSync(EPUB_SERVICE_PATH, 'utf-8');

  // Pattern to match the language entry line
  const entryPattern = new RegExp(`^\\s*${code}:\\s*require\\([^)]+\\),?\\n`, 'm');

  if (!entryPattern.test(content)) {
    console.log(`ℹ️  Language "${code}" not found in epubService.ts`);
    return true;
  }

  content = content.replace(entryPattern, '');
  fs.writeFileSync(EPUB_SERVICE_PATH, content, 'utf-8');
  console.log(`✅ Removed "${code}" from epubService.ts`);
  return true;
}

function updateManifest(code: string): boolean {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.log(`ℹ️  manifest.json does not exist`);
    return true;
  }

  let manifest: Manifest;
  try {
    const content = fs.readFileSync(MANIFEST_PATH, 'utf-8');
    manifest = JSON.parse(content);
  } catch {
    console.warn('Warning: Could not parse manifest.json');
    return true;
  }

  const originalLength = manifest.languages.length;
  manifest.languages = manifest.languages.filter((l) => l.code !== code);

  if (manifest.languages.length === originalLength) {
    console.log(`ℹ️  Language "${code}" not found in manifest.json`);
    return true;
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf-8');
  console.log(`✅ Removed "${code}" from manifest.json`);
  return true;
}

function listCurrentLanguages(): void {
  console.log('\nCurrently bundled languages:');

  // Check epubService.ts
  if (fs.existsSync(EPUB_SERVICE_PATH)) {
    const content = fs.readFileSync(EPUB_SERVICE_PATH, 'utf-8');
    const matches = content.match(/^\s*(\w+):\s*require/gm);
    if (matches) {
      matches.forEach((match) => {
        const code = match.trim().split(':')[0];
        const langInfo = getLanguageInfo(code);
        console.log(`  ${code}: ${langInfo?.name || 'Unknown'} (${langInfo?.localName || ''})`);
      });
    }
  }
}

function main(): void {
  console.log('\n📚 EPUB Language Pack Manager - Remove\n');

  const args = parseArgs();
  if (!args) {
    listCurrentLanguages();
    process.exit(1);
  }

  const { code } = args;

  // Prevent removing English (default language)
  if (code === 'en') {
    console.error('Error: Cannot remove English (en) - it is the default language');
    process.exit(1);
  }

  const langInfo = getLanguageInfo(code);
  console.log(`Removing: ${langInfo?.name || code} (${langInfo?.localName || 'Unknown'})\n`);

  // Step 1: Remove EPUB file
  if (!removeEpubFile(code)) {
    process.exit(1);
  }

  // Step 2: Update epubService.ts
  if (!updateEpubService(code)) {
    process.exit(1);
  }

  // Step 3: Update manifest.json
  if (!updateManifest(code)) {
    process.exit(1);
  }

  console.log('\n✅ Done! Next steps:');
  console.log('  1. git add assets/ src/shared/services/epubService.ts');
  console.log(`  2. git commit -m "Remove ${langInfo?.name || code} language pack"`);
  console.log('  3. Deploy to app stores\n');
}

main();
