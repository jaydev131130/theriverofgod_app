import { promises as fs } from 'fs';
import path from 'path';
import type { LanguagePack, Manifest, ManifestLanguage } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const BOOKS_DIR = path.join(process.cwd(), 'public', 'books');
const LANGUAGES_FILE = path.join(DATA_DIR, 'languages.json');
const MANIFEST_FILE = path.join(process.cwd(), 'public', 'manifest.json');

// 디렉토리 초기화
export const ensureDirectories = async (): Promise<void> => {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(BOOKS_DIR, { recursive: true });
};

// 언어팩 목록 읽기
export const getLanguagePacks = async (): Promise<LanguagePack[]> => {
  await ensureDirectories();
  try {
    const data = await fs.readFile(LANGUAGES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

// 언어팩 목록 저장
export const saveLanguagePacks = async (packs: LanguagePack[]): Promise<void> => {
  await ensureDirectories();
  await fs.writeFile(LANGUAGES_FILE, JSON.stringify(packs, null, 2));
};

// 언어팩 추가
export const addLanguagePack = async (pack: LanguagePack): Promise<void> => {
  const packs = await getLanguagePacks();
  const existingIndex = packs.findIndex(p => p.code === pack.code);

  if (existingIndex >= 0) {
    packs[existingIndex] = pack;
  } else {
    packs.push(pack);
  }

  await saveLanguagePacks(packs);
  await generateManifest();
};

// 언어팩 삭제
export const deleteLanguagePack = async (code: string): Promise<boolean> => {
  const packs = await getLanguagePacks();
  const pack = packs.find(p => p.code === code);

  if (!pack) return false;

  // EPUB 파일 삭제
  const filePath = path.join(BOOKS_DIR, pack.file);
  try {
    await fs.unlink(filePath);
  } catch {
    // 파일이 없어도 계속 진행
  }

  const filtered = packs.filter(p => p.code !== code);
  await saveLanguagePacks(filtered);
  await generateManifest();

  return true;
};

// 언어팩 버전 업데이트
export const updateLanguagePackVersion = async (
  code: string,
  version: string
): Promise<boolean> => {
  const packs = await getLanguagePacks();
  const pack = packs.find(p => p.code === code);

  if (!pack) return false;

  pack.version = version;
  pack.updatedAt = new Date().toISOString();

  await saveLanguagePacks(packs);
  await generateManifest();

  return true;
};

// manifest.json 생성
export const generateManifest = async (): Promise<Manifest> => {
  const packs = await getLanguagePacks();

  const languages: ManifestLanguage[] = packs.map(pack => ({
    code: pack.code,
    name: pack.name,
    localName: pack.localName,
    file: `books/${pack.file}`,
    size: pack.size,
    version: pack.version,
    ...(pack.rtl ? { rtl: true } : {}),
  }));

  const manifest: Manifest = {
    version: '1.0',
    updatedAt: new Date().toISOString(),
    languages,
  };

  await fs.writeFile(MANIFEST_FILE, JSON.stringify(manifest, null, 2));

  return manifest;
};

// 파일 크기 포맷
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// EPUB 파일 저장
export const saveEpubFile = async (
  code: string,
  buffer: Buffer
): Promise<{ fileName: string; size: string; sizeBytes: number }> => {
  await ensureDirectories();

  const fileName = `${code}.epub`;
  const filePath = path.join(BOOKS_DIR, fileName);

  await fs.writeFile(filePath, buffer);

  const sizeBytes = buffer.length;
  const size = formatFileSize(sizeBytes);

  return { fileName, size, sizeBytes };
};
