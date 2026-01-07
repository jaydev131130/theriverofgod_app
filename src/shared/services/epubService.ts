import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';

// Bundled EPUB assets mapping
const BUNDLED_EPUBS: Record<string, number> = {
  en: require('../../../assets/books/en.epub'),
};

const EPUB_DIR = `${FileSystem.documentDirectory}epubs/`;

export const ensureEpubDirectory = async (): Promise<void> => {
  const dirInfo = await FileSystem.getInfoAsync(EPUB_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(EPUB_DIR, { intermediates: true });
  }
};

export const getBundledEpubPath = async (languageCode: string): Promise<string | null> => {
  const assetModule = BUNDLED_EPUBS[languageCode];
  if (!assetModule) {
    console.log(`No bundled EPUB for language: ${languageCode}`);
    return null;
  }

  await ensureEpubDirectory();

  const localPath = `${EPUB_DIR}${languageCode}.epub`;
  const fileInfo = await FileSystem.getInfoAsync(localPath);

  // If already copied, return the path
  if (fileInfo.exists) {
    return localPath;
  }

  // Copy from asset to local filesystem
  try {
    const asset = Asset.fromModule(assetModule);
    await asset.downloadAsync();

    if (asset.localUri) {
      await FileSystem.copyAsync({
        from: asset.localUri,
        to: localPath,
      });
      return localPath;
    }
  } catch (error) {
    console.error('Failed to copy bundled EPUB:', error);
  }

  return null;
};

export const getEpubUri = async (languageCode: string, filePath?: string): Promise<string | null> => {
  // If a specific file path is provided, use it
  if (filePath) {
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (fileInfo.exists) {
      return filePath;
    }
  }

  // Otherwise, try bundled EPUB
  return getBundledEpubPath(languageCode);
};

export const readEpubAsBase64 = async (epubPath: string): Promise<string | null> => {
  try {
    const base64 = await FileSystem.readAsStringAsync(epubPath, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  } catch (error) {
    console.error('Failed to read EPUB as base64:', error);
    return null;
  }
};

// Get available bundled languages
export const getAvailableBundledLanguages = (): string[] => {
  return Object.keys(BUNDLED_EPUBS);
};

// Chapter interface
export interface EpubChapter {
  id: string;
  title: string;
  href: string;
}

// Parse EPUB TOC from NCX file
export const parseEpubToc = async (epubPath: string): Promise<EpubChapter[]> => {
  try {
    const base64 = await readEpubAsBase64(epubPath);
    if (!base64) return [];

    // Convert base64 to binary
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // We'll use a simpler approach - extract TOC from the EPUB using the WebView
    // For now, return empty and let the WebView handle it
    return [];
  } catch (error) {
    console.error('Failed to parse EPUB TOC:', error);
    return [];
  }
};
