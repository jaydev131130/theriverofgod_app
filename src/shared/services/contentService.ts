import * as FileSystem from 'expo-file-system/legacy';
import axios from 'axios';

// Firebase Hosting URL (to be configured)
const CONTENT_BASE_URL = 'https://your-project.web.app';

export interface ContentManifest {
  version: string;
  languages: LanguageContent[];
}

export interface LanguageContent {
  code: string;
  name: string;
  localName: string;
  file: string;
  size: string;
  version: string;
  rtl?: boolean;
}

// Directory for storing downloaded content
const CONTENT_DIR = `${FileSystem.documentDirectory}content/`;

export const ensureContentDirectory = async (): Promise<void> => {
  const dirInfo = await FileSystem.getInfoAsync(CONTENT_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(CONTENT_DIR, { intermediates: true });
  }
};

export const fetchManifest = async (): Promise<ContentManifest> => {
  try {
    const response = await axios.get<ContentManifest>(`${CONTENT_BASE_URL}/manifest.json`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch manifest:', error);
    throw error;
  }
};

export const downloadEpub = async (
  language: LanguageContent,
  onProgress?: (progress: number) => void
): Promise<string> => {
  await ensureContentDirectory();

  const fileName = `${language.code}.epub`;
  const localPath = `${CONTENT_DIR}${fileName}`;
  const downloadUrl = `${CONTENT_BASE_URL}/${language.file}`;

  try {
    const downloadResumable = FileSystem.createDownloadResumable(
      downloadUrl,
      localPath,
      {},
      (downloadProgress) => {
        const progress =
          downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
        onProgress?.(progress);
      }
    );

    const result = await downloadResumable.downloadAsync();
    if (!result?.uri) {
      throw new Error('Download failed');
    }

    return result.uri;
  } catch (error) {
    console.error('Failed to download EPUB:', error);
    throw error;
  }
};

export const isEpubDownloaded = async (languageCode: string): Promise<boolean> => {
  const filePath = `${CONTENT_DIR}${languageCode}.epub`;
  const fileInfo = await FileSystem.getInfoAsync(filePath);
  return fileInfo.exists;
};

export const getEpubPath = (languageCode: string): string => {
  return `${CONTENT_DIR}${languageCode}.epub`;
};

export const deleteEpub = async (languageCode: string): Promise<void> => {
  const filePath = `${CONTENT_DIR}${languageCode}.epub`;
  const fileInfo = await FileSystem.getInfoAsync(filePath);
  if (fileInfo.exists) {
    await FileSystem.deleteAsync(filePath);
  }
};

export const getDownloadedLanguages = async (): Promise<string[]> => {
  await ensureContentDirectory();

  const files = await FileSystem.readDirectoryAsync(CONTENT_DIR);
  return files
    .filter((file) => file.endsWith('.epub'))
    .map((file) => file.replace('.epub', ''));
};

export const getContentSize = async (languageCode: string): Promise<number> => {
  const filePath = `${CONTENT_DIR}${languageCode}.epub`;
  const fileInfo = await FileSystem.getInfoAsync(filePath);
  if (fileInfo.exists && 'size' in fileInfo) {
    return fileInfo.size || 0;
  }
  return 0;
};

// Format bytes to human-readable string
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};
