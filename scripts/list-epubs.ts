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

function getBundledLanguages(): string[] {
  if (!fs.existsSync(EPUB_SERVICE_PATH)) {
    return [];
  }

  const content = fs.readFileSync(EPUB_SERVICE_PATH, 'utf-8');
  const matches = content.match(/^\s*(\w+):\s*require/gm);

  if (!matches) {
    return [];
  }

  return matches.map((match) => match.trim().split(':')[0]);
}

function getEpubFiles(): string[] {
  if (!fs.existsSync(ASSETS_BOOKS_DIR)) {
    return [];
  }

  return fs
    .readdirSync(ASSETS_BOOKS_DIR)
    .filter((file) => file.endsWith('.epub'))
    .map((file) => file.replace('.epub', ''));
}

function getManifestLanguages(): ManifestEntry[] {
  if (!fs.existsSync(MANIFEST_PATH)) {
    return [];
  }

  try {
    const content = fs.readFileSync(MANIFEST_PATH, 'utf-8');
    const manifest: Manifest = JSON.parse(content);
    return manifest.languages || [];
  } catch {
    return [];
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function main(): void {
  console.log('\n📚 EPUB Language Pack Manager - List\n');

  const bundledCodes = getBundledLanguages();
  const epubFiles = getEpubFiles();
  const manifestEntries = getManifestLanguages();

  console.log('━'.repeat(70));
  console.log(
    '  Code'.padEnd(8) +
      'Name'.padEnd(15) +
      'Local Name'.padEnd(15) +
      'RTL'.padEnd(6) +
      'File'.padEnd(12) +
      'In Code'
  );
  console.log('━'.repeat(70));

  // Combine all known codes
  const allCodes = new Set([...bundledCodes, ...epubFiles]);

  Array.from(allCodes)
    .sort()
    .forEach((code) => {
      const langInfo = getLanguageInfo(code);
      const hasFile = epubFiles.includes(code);
      const inCode = bundledCodes.includes(code);

      // Get file size if exists
      let fileInfo = '';
      if (hasFile) {
        const filePath = path.join(ASSETS_BOOKS_DIR, `${code}.epub`);
        const stats = fs.statSync(filePath);
        fileInfo = formatFileSize(stats.size);
      }

      console.log(
        `  ${code.padEnd(6)}` +
          `${(langInfo?.name || 'Unknown').padEnd(15)}` +
          `${(langInfo?.localName || '').padEnd(15)}` +
          `${(langInfo?.rtl ? 'Yes' : '-').padEnd(6)}` +
          `${(hasFile ? fileInfo : '❌ Missing').padEnd(12)}` +
          `${inCode ? '✅' : '❌'}`
      );
    });

  console.log('━'.repeat(70));
  console.log(`\nTotal: ${allCodes.size} language(s)\n`);

  // Show warnings
  const missingFiles = bundledCodes.filter((code) => !epubFiles.includes(code));
  const orphanFiles = epubFiles.filter((code) => !bundledCodes.includes(code));

  if (missingFiles.length > 0) {
    console.log('⚠️  Warning: Languages in code but missing EPUB files:');
    missingFiles.forEach((code) => console.log(`   - ${code}`));
    console.log('');
  }

  if (orphanFiles.length > 0) {
    console.log('⚠️  Warning: EPUB files not referenced in code:');
    orphanFiles.forEach((code) => console.log(`   - ${code}`));
    console.log('');
  }

  // Show available languages that can be added
  const availableToAdd = AVAILABLE_LANGUAGES.filter(
    (lang) => !allCodes.has(lang.code)
  );

  if (availableToAdd.length > 0) {
    console.log('Available languages to add:');
    availableToAdd.forEach((lang) => {
      console.log(`  ${lang.code}: ${lang.name} (${lang.localName})`);
    });
    console.log('');
  }
}

main();
