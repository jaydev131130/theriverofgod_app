import * as Speech from 'expo-speech';

export interface Voice {
  identifier: string;
  name: string;
  language: string;
  quality?: string;
}

export interface TTSOptions {
  language?: string;
  pitch?: number;
  rate?: number;
  voice?: string;
  onStart?: () => void;
  onDone?: () => void;
  onStopped?: () => void;
  onError?: (error: any) => void;
}

// Get all available voices
export const getAvailableVoices = async (): Promise<Voice[]> => {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    return voices.map((v) => ({
      identifier: v.identifier,
      name: v.name,
      language: v.language,
      quality: v.quality,
    }));
  } catch (error) {
    console.error('Failed to get voices:', error);
    return [];
  }
};

// Get voices for a specific language
export const getVoicesForLanguage = async (languageCode: string): Promise<Voice[]> => {
  const voices = await getAvailableVoices();
  return voices.filter((v) => v.language.startsWith(languageCode));
};

// Get the best quality voice for a language
export const getBestVoiceForLanguage = async (languageCode: string): Promise<Voice | null> => {
  const voices = await getVoicesForLanguage(languageCode);

  if (voices.length === 0) return null;

  // Sort by quality (Enhanced > Default)
  const sorted = voices.sort((a, b) => {
    const qualityOrder: Record<string, number> = {
      Enhanced: 0,
      Default: 1,
    };
    const aOrder = qualityOrder[a.quality || 'Default'] ?? 2;
    const bOrder = qualityOrder[b.quality || 'Default'] ?? 2;
    return aOrder - bOrder;
  });

  return sorted[0];
};

// Speak text
export const speak = async (text: string, options: TTSOptions = {}): Promise<void> => {
  const { language = 'en', pitch = 1.0, rate = 1.0, voice, onStart, onDone, onStopped, onError } = options;

  // Debug: Check text
  console.log('TTS speak called with text length:', text?.length || 0);
  console.log('TTS text preview:', text?.substring(0, 100));

  if (!text || text.trim().length === 0) {
    console.error('TTS: Empty text provided');
    onError?.('Empty text');
    return;
  }

  // If no voice specified, try to get the best one for the language
  let voiceId = voice;
  if (!voiceId) {
    const bestVoice = await getBestVoiceForLanguage(language);
    voiceId = bestVoice?.identifier;
    console.log('TTS selected voice:', voiceId || 'default system voice');
  }

  // Check available voices for debugging
  const availableVoices = await getAvailableVoices();
  console.log('TTS available voices count:', availableVoices.length);

  console.log('TTS calling Speech.speak with:', { language, pitch, rate, voiceId: voiceId || 'none' });

  Speech.speak(text, {
    language,
    pitch,
    rate,
    voice: voiceId,
    onStart: () => {
      console.log('TTS Speech.speak onStart fired');
      onStart?.();
    },
    onDone: () => {
      console.log('TTS Speech.speak onDone fired');
      onDone?.();
    },
    onStopped: () => {
      console.log('TTS Speech.speak onStopped fired');
      onStopped?.();
    },
    onError: (err) => {
      console.error('TTS Speech.speak onError:', err);
      onError?.(err);
    },
  });
};

// Stop speaking
export const stop = (): void => {
  Speech.stop();
};

// Pause speaking (if supported)
export const pause = async (): Promise<void> => {
  await Speech.pause();
};

// Resume speaking (if supported)
export const resume = async (): Promise<void> => {
  await Speech.resume();
};

// Check if currently speaking
export const isSpeaking = async (): Promise<boolean> => {
  return await Speech.isSpeakingAsync();
};

// Check if language is supported for TTS
export const isLanguageSupported = async (languageCode: string): Promise<boolean> => {
  const voices = await getVoicesForLanguage(languageCode);
  return voices.length > 0;
};

// Speed presets
export const SPEED_PRESETS = {
  slow: 0.75,
  normal: 1.0,
  fast: 1.25,
  veryFast: 1.5,
};

// Pitch presets
export const PITCH_PRESETS = {
  low: 0.8,
  normal: 1.0,
  high: 1.2,
};
