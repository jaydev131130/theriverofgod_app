#!/usr/bin/env npx ts-node

import * as fs from 'fs';
import * as path from 'path';
import { getLanguageInfo, isValidLanguageCode, AVAILABLE_LANGUAGES } from './languages';

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

function parseArgs(): { code: string; file: string } | null {
  const args = process.argv.slice(2);
  let code = '';
  let file = '';

  for (const arg of args) {
    if (arg.startsWith('--code=')) {
      code = arg.split('=')[1];
    } else if (arg.startsWith('--file=')) {
      file = arg.split('=')[1];
    }
  }

  if (!code || !file) {
    console.error('Usage: npm run add-epub -- --code=<language-code> --file=<epub-path>');
    console.error('Example: npm run add-epub -- --code=ko --file=./book-korean.epub');
    console.error('\nAvailable language codes:');
    AVAILABLE_LANGUAGES.forEach((lang) => {
      console.error(`  ${lang.code}: ${lang.name} (${lang.localName})`);
    });
    return null;
  }

  return { code, file };
}

function validateLanguageCode(code: string): boolean {
  if (!isValidLanguageCode(code)) {
    console.error(`Error: Invalid language code "${code}"`);
    console.error('\nAvailable language codes:');
    AVAILABLE_LANGUAGES.forEach((lang) => {
      console.error(`  ${lang.code}: ${lang.name} (${lang.localName})`);
    });
    return false;
  }
  return true;
}

function copyEpubFile(sourcePath: string, code: string): boolean {
  const absoluteSource = path.isAbsolute(sourcePath)
    ? sourcePath
    : path.resolve(process.cwd(), sourcePath);

  if (!fs.existsSync(absoluteSource)) {
    console.error(`Error: Source file not found: ${absoluteSource}`);
    return false;
  }

  // Ensure assets/books directory exists
  if (!fs.existsSync(ASSETS_BOOKS_DIR)) {
    fs.mkdirSync(ASSETS_BOOKS_DIR, { recursive: true });
  }

  const destPath = path.join(ASSETS_BOOKS_DIR, `${code}.epub`);
  fs.copyFileSync(absoluteSource, destPath);
  console.log(`✅ Copied to ${path.relative(ROOT_DIR, destPath)}`);
  return true;
}

function updateEpubService(code: string): boolean {
  if (!fs.existsSync(EPUB_SERVICE_PATH)) {
    console.error(`Error: epubService.ts not found at ${EPUB_SERVICE_PATH}`);
    return false;
  }

  let content = fs.readFileSync(EPUB_SERVICE_PATH, 'utf-8');

  // Check if language already exists
  const entryPattern = new RegExp(`^\\s*${code}:\\s*require`, 'm');
  if (entryPattern.test(content)) {
    console.log(`ℹ️  Language "${code}" already exists in epubService.ts`);
    return true;
  }

  // Find BUNDLED_EPUBS object and add new entry
  // Pattern: matches the closing brace of BUNDLED_EPUBS object
  const bundledEpubsPattern = /(const BUNDLED_EPUBS:\s*Record<string,\s*number>\s*=\s*\{[\s\S]*?)(};)/;
  const match = content.match(bundledEpubsPattern);

  if (!match) {
    console.error('Error: Could not find BUNDLED_EPUBS object in epubService.ts');
    return false;
  }

  // Add new entry before closing brace
  const newEntry = `  ${code}: require('../../../assets/books/${code}.epub'),\n`;
  const updatedContent = content.replace(
    bundledEpubsPattern,
    `$1${newEntry}$2`
  );

  fs.writeFileSync(EPUB_SERVICE_PATH, updatedContent, 'utf-8');
  console.log(`✅ Updated epubService.ts`);
  return true;
}

function updateManifest(code: string): boolean {
  const langInfo = getLanguageInfo(code);
  if (!langInfo) {
    console.error(`Error: Language info not found for code "${code}"`);
    return false;
  }

  let manifest: Manifest = { version: 1, languages: [] };

  if (fs.existsSync(MANIFEST_PATH)) {
    try {
      const content = fs.readFileSync(MANIFEST_PATH, 'utf-8');
      manifest = JSON.parse(content);
    } catch {
      console.warn('Warning: Could not parse existing manifest.json, creating new one');
    }
  }

  // Check if language already exists
  const existingIndex = manifest.languages.findIndex((l) => l.code === code);
  const entry: ManifestEntry = {
    code: langInfo.code,
    name: langInfo.name,
    localName: langInfo.localName,
    ...(langInfo.rtl && { rtl: true }),
    addedAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    manifest.languages[existingIndex] = entry;
    console.log(`ℹ️  Updated existing entry for "${code}" in manifest.json`);
  } else {
    manifest.languages.push(entry);
    console.log(`✅ Added "${code}" to manifest.json`);
  }

  // Sort by code
  manifest.languages.sort((a, b) => a.code.localeCompare(b.code));

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf-8');
  return true;
}

function main(): void {
  console.log('\n📚 EPUB Language Pack Manager - Add\n');

  const args = parseArgs();
  if (!args) {
    process.exit(1);
  }

  const { code, file } = args;

  if (!validateLanguageCode(code)) {
    process.exit(1);
  }

  const langInfo = getLanguageInfo(code);
  console.log(`Adding: ${langInfo?.name} (${langInfo?.localName})\n`);

  // Step 1: Copy EPUB file
  if (!copyEpubFile(file, code)) {
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
  console.log(`  2. git commit -m "Add ${langInfo?.name} language pack"`);
  console.log('  3. Deploy to app stores\n');
}

main();
