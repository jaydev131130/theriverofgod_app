import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './locales/en.json';
import ko from './locales/ko.json';

const resources = {
  en: { translation: en },
  ko: { translation: ko },
};

// RTL languages list
export const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

// Supported languages
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', localName: 'English' },
  { code: 'ko', name: 'Korean', localName: '한국어' },
  // Future languages will be added here
  // { code: 'ar', name: 'Arabic', localName: 'العربية', rtl: true },
];

// Get device language
const getDeviceLanguage = (): string => {
  const deviceLang = Localization.getLocales()[0]?.languageCode || 'en';
  // Check if device language is supported
  const isSupported = SUPPORTED_LANGUAGES.some(lang => lang.code === deviceLang);
  return isSupported ? deviceLang : 'en';
};

export const initI18n = async () => {
  await i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: getDeviceLanguage(),
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });
  return i18n;
};

export const isRTL = (languageCode: string): boolean => {
  return RTL_LANGUAGES.includes(languageCode);
};

export const changeLanguage = async (languageCode: string): Promise<void> => {
  await i18n.changeLanguage(languageCode);
};

export default i18n;
