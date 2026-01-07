import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Theme = 'light' | 'dark' | 'sepia';
export type FontSize = 'small' | 'medium' | 'large' | 'xlarge';
export type ReadingMode = 'page' | 'scroll';
export type TTSSpeed = 'slow' | 'normal' | 'fast' | 'veryFast';

interface SettingsState {
  // Appearance
  theme: Theme;
  fontSize: FontSize;
  readingMode: ReadingMode;

  // Language
  language: string;

  // TTS
  autoPlayTTS: boolean;
  ttsVoiceId: string | null;  // null = auto select best voice
  ttsSpeed: TTSSpeed;

  // Onboarding
  hasCompletedOnboarding: boolean;

  // Actions
  setTheme: (theme: Theme) => void;
  setFontSize: (fontSize: FontSize) => void;
  setReadingMode: (mode: ReadingMode) => void;
  setLanguage: (language: string) => void;
  setAutoPlayTTS: (autoPlay: boolean) => void;
  setTTSVoiceId: (voiceId: string | null) => void;
  setTTSSpeed: (speed: TTSSpeed) => void;
  completeOnboarding: () => void;
  resetSettings: () => void;
}

const initialState = {
  theme: 'light' as Theme,
  fontSize: 'medium' as FontSize,
  readingMode: 'page' as ReadingMode,
  language: 'en',
  autoPlayTTS: false,
  ttsVoiceId: null as string | null,
  ttsSpeed: 'normal' as TTSSpeed,
  hasCompletedOnboarding: false,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...initialState,

      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      setReadingMode: (readingMode) => set({ readingMode }),
      setLanguage: (language) => set({ language }),
      setAutoPlayTTS: (autoPlayTTS) => set({ autoPlayTTS }),
      setTTSVoiceId: (ttsVoiceId) => set({ ttsVoiceId }),
      setTTSSpeed: (ttsSpeed) => set({ ttsSpeed }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      resetSettings: () => set(initialState),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Font size in pixels
export const FONT_SIZES: Record<FontSize, number> = {
  small: 14,
  medium: 18,
  large: 24,
  xlarge: 32,
};

// TTS speed values
export const TTS_SPEEDS: Record<TTSSpeed, number> = {
  slow: 0.75,
  normal: 1.0,
  fast: 1.25,
  veryFast: 1.5,
};

// Theme color type
export interface ThemeColors {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  primary: string;
  accent: string;
  border: string;
  success: string;
  warning: string;
  error: string;
}

// Theme colors
export const THEME_COLORS: Record<Theme, ThemeColors> = {
  light: {
    background: '#F5F5F5',
    surface: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#666666',
    primary: '#6366F1',
    accent: '#007AFF',
    border: '#E5E5E5',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
  },
  dark: {
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#A0A0A0',
    primary: '#818CF8',
    accent: '#0A84FF',
    border: '#333333',
    success: '#4ADE80',
    warning: '#FBBF24',
    error: '#F87171',
  },
  sepia: {
    background: '#F4ECD8',
    surface: '#FAF6ED',
    text: '#5B4636',
    textSecondary: '#8B7355',
    primary: '#B8860B',
    accent: '#8B7355',
    border: '#D4C4A8',
    success: '#6B8E23',
    warning: '#D97706',
    error: '#CD5C5C',
  },
};
