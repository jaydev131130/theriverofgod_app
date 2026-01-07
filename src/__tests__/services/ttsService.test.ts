import * as Speech from 'expo-speech';
import {
  getAvailableVoices,
  getVoicesForLanguage,
  getBestVoiceForLanguage,
  speak,
  stop,
  pause,
  resume,
  isSpeaking,
  isLanguageSupported,
  SPEED_PRESETS,
  PITCH_PRESETS,
} from '../../shared/services/ttsService';

// Mock expo-speech
jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
  pause: jest.fn().mockResolvedValue(undefined),
  resume: jest.fn().mockResolvedValue(undefined),
  isSpeakingAsync: jest.fn().mockResolvedValue(false),
  getAvailableVoicesAsync: jest.fn().mockResolvedValue([
    { identifier: 'en-US-1', name: 'Samantha', language: 'en-US', quality: 'Enhanced' },
    { identifier: 'en-US-2', name: 'Alex', language: 'en-US', quality: 'Default' },
    { identifier: 'ko-KR-1', name: 'Yuna', language: 'ko-KR', quality: 'Enhanced' },
    { identifier: 'ar-SA-1', name: 'Maged', language: 'ar-SA', quality: 'Default' },
  ]),
}));

describe('TtsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAvailableVoices', () => {
    it('should return list of available voices', async () => {
      const voices = await getAvailableVoices();
      expect(voices).toHaveLength(4);
      expect(voices[0]).toHaveProperty('identifier');
      expect(voices[0]).toHaveProperty('name');
      expect(voices[0]).toHaveProperty('language');
    });

    it('should return empty array on error', async () => {
      (Speech.getAvailableVoicesAsync as jest.Mock).mockRejectedValueOnce(new Error('TTS Error'));
      const voices = await getAvailableVoices();
      expect(voices).toEqual([]);
    });
  });

  describe('getVoicesForLanguage', () => {
    it('should filter voices by language code', async () => {
      const enVoices = await getVoicesForLanguage('en');
      expect(enVoices).toHaveLength(2);
      expect(enVoices.every((v) => v.language.startsWith('en'))).toBe(true);
    });

    it('should return Korean voices', async () => {
      const koVoices = await getVoicesForLanguage('ko');
      expect(koVoices).toHaveLength(1);
      expect(koVoices[0].language).toBe('ko-KR');
    });

    it('should return empty array for unsupported language', async () => {
      const voices = await getVoicesForLanguage('xyz');
      expect(voices).toEqual([]);
    });
  });

  describe('getBestVoiceForLanguage (PRD F6: TTS 음성 품질 자동 선택)', () => {
    it('should return Enhanced voice over Default (PRD requirement)', async () => {
      const bestVoice = await getBestVoiceForLanguage('en');
      expect(bestVoice).not.toBeNull();
      expect(bestVoice?.quality).toBe('Enhanced');
      expect(bestVoice?.name).toBe('Samantha');
    });

    it('should return null for unsupported language', async () => {
      const bestVoice = await getBestVoiceForLanguage('xyz');
      expect(bestVoice).toBeNull();
    });
  });

  describe('speak', () => {
    it('should call Speech.speak with text and options', async () => {
      await speak('Hello World', { language: 'en' });
      expect(Speech.speak).toHaveBeenCalledWith(
        'Hello World',
        expect.objectContaining({
          language: 'en',
          pitch: 1.0,
          rate: 1.0,
        })
      );
    });

    it('should use default language if not specified', async () => {
      await speak('Test text');
      expect(Speech.speak).toHaveBeenCalledWith(
        'Test text',
        expect.objectContaining({
          language: 'en',
        })
      );
    });

    it('should pass callback functions', async () => {
      const onDone = jest.fn();
      const onError = jest.fn();

      await speak('Test', { onDone, onError });

      // Callbacks are wrapped internally for debugging, so check they're functions
      expect(Speech.speak).toHaveBeenCalledWith(
        'Test',
        expect.objectContaining({
          onDone: expect.any(Function),
          onError: expect.any(Function),
        })
      );
    });

    it('should auto-select best voice for language', async () => {
      await speak('안녕하세요', { language: 'ko' });

      expect(Speech.speak).toHaveBeenCalledWith(
        '안녕하세요',
        expect.objectContaining({
          language: 'ko',
          voice: 'ko-KR-1', // Enhanced Korean voice
        })
      );
    });
  });

  describe('stop', () => {
    it('should call Speech.stop', () => {
      stop();
      expect(Speech.stop).toHaveBeenCalled();
    });
  });

  describe('pause', () => {
    it('should call Speech.pause', async () => {
      await pause();
      expect(Speech.pause).toHaveBeenCalled();
    });
  });

  describe('resume', () => {
    it('should call Speech.resume', async () => {
      await resume();
      expect(Speech.resume).toHaveBeenCalled();
    });
  });

  describe('isSpeaking', () => {
    it('should return speaking status', async () => {
      const result = await isSpeaking();
      expect(Speech.isSpeakingAsync).toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should return true when speaking', async () => {
      (Speech.isSpeakingAsync as jest.Mock).mockResolvedValueOnce(true);
      const result = await isSpeaking();
      expect(result).toBe(true);
    });
  });

  describe('isLanguageSupported', () => {
    it('should return true for English', async () => {
      const supported = await isLanguageSupported('en');
      expect(supported).toBe(true);
    });

    it('should return true for Korean', async () => {
      const supported = await isLanguageSupported('ko');
      expect(supported).toBe(true);
    });

    it('should return true for Arabic (RTL language)', async () => {
      const supported = await isLanguageSupported('ar');
      expect(supported).toBe(true);
    });

    it('should return false for unsupported language', async () => {
      const supported = await isLanguageSupported('xyz');
      expect(supported).toBe(false);
    });
  });

  describe('Speed and Pitch Presets (PRD F6: 속도조절)', () => {
    it('should have correct speed presets', () => {
      expect(SPEED_PRESETS.slow).toBeLessThan(SPEED_PRESETS.normal);
      expect(SPEED_PRESETS.normal).toBe(1.0);
      expect(SPEED_PRESETS.fast).toBeGreaterThan(SPEED_PRESETS.normal);
      expect(SPEED_PRESETS.veryFast).toBeGreaterThan(SPEED_PRESETS.fast);
    });

    it('should have correct pitch presets', () => {
      expect(PITCH_PRESETS.low).toBeLessThan(PITCH_PRESETS.normal);
      expect(PITCH_PRESETS.normal).toBe(1.0);
      expect(PITCH_PRESETS.high).toBeGreaterThan(PITCH_PRESETS.normal);
    });

    it('should use speed presets when speaking', async () => {
      await speak('Fast speech', { rate: SPEED_PRESETS.fast });
      expect(Speech.speak).toHaveBeenCalledWith(
        'Fast speech',
        expect.objectContaining({
          rate: 1.25,
        })
      );
    });
  });
});

describe('TTS Graceful Degradation (PRD F6)', () => {
  it('should handle missing TTS gracefully', async () => {
    // When no voices available for a language, speak should still work with fallback
    (Speech.getAvailableVoicesAsync as jest.Mock).mockResolvedValueOnce([]);

    await speak('Hello', { language: 'unsupported' });

    // Should still call speak even without best voice
    expect(Speech.speak).toHaveBeenCalled();
  });
});
