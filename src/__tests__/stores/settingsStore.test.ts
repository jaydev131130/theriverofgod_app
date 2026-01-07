import { useSettingsStore, THEME_COLORS, FONT_SIZES, TTS_SPEEDS } from '../../shared/stores/settingsStore';

describe('SettingsStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useSettingsStore.setState({
      theme: 'light',
      fontSize: 'medium',
      readingMode: 'page',
      language: 'en',
      autoPlayTTS: false,
      ttsVoiceId: null,
      ttsSpeed: 'normal',
      hasCompletedOnboarding: false,
    });
  });

  describe('Theme Settings', () => {
    it('should have light theme by default', () => {
      const { theme } = useSettingsStore.getState();
      expect(theme).toBe('light');
    });

    it('should set theme to dark', () => {
      const { setTheme } = useSettingsStore.getState();
      setTheme('dark');
      expect(useSettingsStore.getState().theme).toBe('dark');
    });

    it('should set theme to sepia', () => {
      const { setTheme } = useSettingsStore.getState();
      setTheme('sepia');
      expect(useSettingsStore.getState().theme).toBe('sepia');
    });

    it('should have correct colors for each theme', () => {
      expect(THEME_COLORS.light.background).toBe('#F5F5F5');
      expect(THEME_COLORS.dark.background).toBe('#121212');
      expect(THEME_COLORS.sepia.background).toBe('#F4ECD8');
    });
  });

  describe('Font Size Settings', () => {
    it('should have medium font size by default', () => {
      const { fontSize } = useSettingsStore.getState();
      expect(fontSize).toBe('medium');
    });

    it('should set font size to small', () => {
      const { setFontSize } = useSettingsStore.getState();
      setFontSize('small');
      expect(useSettingsStore.getState().fontSize).toBe('small');
    });

    it('should set font size to large', () => {
      const { setFontSize } = useSettingsStore.getState();
      setFontSize('large');
      expect(useSettingsStore.getState().fontSize).toBe('large');
    });

    it('should set font size to xlarge', () => {
      const { setFontSize } = useSettingsStore.getState();
      setFontSize('xlarge');
      expect(useSettingsStore.getState().fontSize).toBe('xlarge');
    });

    it('should have correct font size values (PRD: 14pt ~ 32pt)', () => {
      // PRD requires font range 14-32pt
      expect(FONT_SIZES.small).toBeGreaterThanOrEqual(14);
      expect(FONT_SIZES.xlarge).toBeLessThanOrEqual(32);
      expect(FONT_SIZES.small).toBeLessThan(FONT_SIZES.medium);
      expect(FONT_SIZES.medium).toBeLessThan(FONT_SIZES.large);
      expect(FONT_SIZES.large).toBeLessThan(FONT_SIZES.xlarge);
    });
  });

  describe('Reading Mode Settings', () => {
    it('should have page mode by default', () => {
      const { readingMode } = useSettingsStore.getState();
      expect(readingMode).toBe('page');
    });

    it('should switch to scroll mode', () => {
      const { setReadingMode } = useSettingsStore.getState();
      setReadingMode('scroll');
      expect(useSettingsStore.getState().readingMode).toBe('scroll');
    });

    it('should switch back to page mode', () => {
      const { setReadingMode } = useSettingsStore.getState();
      setReadingMode('scroll');
      setReadingMode('page');
      expect(useSettingsStore.getState().readingMode).toBe('page');
    });
  });

  describe('Language Settings', () => {
    it('should have English as default language', () => {
      const { language } = useSettingsStore.getState();
      expect(language).toBe('en');
    });

    it('should set language to Korean', () => {
      const { setLanguage } = useSettingsStore.getState();
      setLanguage('ko');
      expect(useSettingsStore.getState().language).toBe('ko');
    });

    it('should support RTL languages (PRD requirement)', () => {
      const { setLanguage } = useSettingsStore.getState();
      // PRD supports: ar, he, fa, ur
      setLanguage('ar');
      expect(useSettingsStore.getState().language).toBe('ar');
    });
  });

  describe('TTS Settings', () => {
    it('should have autoPlayTTS disabled by default', () => {
      const { autoPlayTTS } = useSettingsStore.getState();
      expect(autoPlayTTS).toBe(false);
    });

    it('should enable autoPlayTTS', () => {
      const { setAutoPlayTTS } = useSettingsStore.getState();
      setAutoPlayTTS(true);
      expect(useSettingsStore.getState().autoPlayTTS).toBe(true);
    });

    describe('TTS Voice Selection', () => {
      it('should have null (auto) voice by default', () => {
        const { ttsVoiceId } = useSettingsStore.getState();
        expect(ttsVoiceId).toBeNull();
      });

      it('should set specific voice ID', () => {
        const { setTTSVoiceId } = useSettingsStore.getState();
        setTTSVoiceId('en-US-Samantha');
        expect(useSettingsStore.getState().ttsVoiceId).toBe('en-US-Samantha');
      });

      it('should reset to auto voice (null)', () => {
        const { setTTSVoiceId } = useSettingsStore.getState();
        setTTSVoiceId('en-US-Samantha');
        setTTSVoiceId(null);
        expect(useSettingsStore.getState().ttsVoiceId).toBeNull();
      });
    });

    describe('TTS Speed Settings', () => {
      it('should have normal speed by default', () => {
        const { ttsSpeed } = useSettingsStore.getState();
        expect(ttsSpeed).toBe('normal');
      });

      it('should set TTS speed to slow', () => {
        const { setTTSSpeed } = useSettingsStore.getState();
        setTTSSpeed('slow');
        expect(useSettingsStore.getState().ttsSpeed).toBe('slow');
      });

      it('should set TTS speed to fast', () => {
        const { setTTSSpeed } = useSettingsStore.getState();
        setTTSSpeed('fast');
        expect(useSettingsStore.getState().ttsSpeed).toBe('fast');
      });

      it('should set TTS speed to veryFast', () => {
        const { setTTSSpeed } = useSettingsStore.getState();
        setTTSSpeed('veryFast');
        expect(useSettingsStore.getState().ttsSpeed).toBe('veryFast');
      });

      it('should have correct TTS speed values', () => {
        expect(TTS_SPEEDS.slow).toBe(0.75);
        expect(TTS_SPEEDS.normal).toBe(1.0);
        expect(TTS_SPEEDS.fast).toBe(1.25);
        expect(TTS_SPEEDS.veryFast).toBe(1.5);
      });

      it('should have speed values in ascending order', () => {
        expect(TTS_SPEEDS.slow).toBeLessThan(TTS_SPEEDS.normal);
        expect(TTS_SPEEDS.normal).toBeLessThan(TTS_SPEEDS.fast);
        expect(TTS_SPEEDS.fast).toBeLessThan(TTS_SPEEDS.veryFast);
      });
    });
  });
});
