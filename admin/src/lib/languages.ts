// 지원 가능한 언어 목록 (ISO 639-1 코드)
export const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'English', localName: 'English' },
  { code: 'ko', name: 'Korean', localName: '한국어' },
  { code: 'es', name: 'Spanish', localName: 'Español' },
  { code: 'zh', name: 'Chinese', localName: '中文' },
  { code: 'ar', name: 'Arabic', localName: 'العربية', rtl: true },
  { code: 'fr', name: 'French', localName: 'Français' },
  { code: 'pt', name: 'Portuguese', localName: 'Português' },
  { code: 'ru', name: 'Russian', localName: 'Русский' },
  { code: 'hi', name: 'Hindi', localName: 'हिन्दी' },
  { code: 'ja', name: 'Japanese', localName: '日本語' },
  { code: 'de', name: 'German', localName: 'Deutsch' },
  { code: 'it', name: 'Italian', localName: 'Italiano' },
  { code: 'vi', name: 'Vietnamese', localName: 'Tiếng Việt' },
  { code: 'th', name: 'Thai', localName: 'ไทย' },
  { code: 'id', name: 'Indonesian', localName: 'Bahasa Indonesia' },
  { code: 'tr', name: 'Turkish', localName: 'Türkçe' },
  { code: 'pl', name: 'Polish', localName: 'Polski' },
  { code: 'uk', name: 'Ukrainian', localName: 'Українська' },
  { code: 'nl', name: 'Dutch', localName: 'Nederlands' },
  { code: 'he', name: 'Hebrew', localName: 'עברית', rtl: true },
  { code: 'fa', name: 'Persian', localName: 'فارسی', rtl: true },
  { code: 'ur', name: 'Urdu', localName: 'اردو', rtl: true },
  { code: 'sw', name: 'Swahili', localName: 'Kiswahili' },
  { code: 'am', name: 'Amharic', localName: 'አማርኛ' },
] as const;

export const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

export const isRtlLanguage = (code: string): boolean => {
  return RTL_LANGUAGES.includes(code);
};

export const getLanguageInfo = (code: string) => {
  return AVAILABLE_LANGUAGES.find(lang => lang.code === code);
};
