import { AVAILABLE_LANGUAGES, RTL_LANGUAGES, isRtlLanguage, getLanguageInfo } from '@/lib/languages';

describe('languages', () => {
  describe('AVAILABLE_LANGUAGES', () => {
    it('should contain at least 10 languages', () => {
      expect(AVAILABLE_LANGUAGES.length).toBeGreaterThanOrEqual(10);
    });

    it('should have correct structure for each language', () => {
      AVAILABLE_LANGUAGES.forEach((lang) => {
        expect(lang).toHaveProperty('code');
        expect(lang).toHaveProperty('name');
        expect(lang).toHaveProperty('localName');
        expect(typeof lang.code).toBe('string');
        expect(typeof lang.name).toBe('string');
        expect(typeof lang.localName).toBe('string');
      });
    });

    it('should include English and Korean', () => {
      const codes = AVAILABLE_LANGUAGES.map((l) => l.code);
      expect(codes).toContain('en');
      expect(codes).toContain('ko');
    });
  });

  describe('RTL_LANGUAGES', () => {
    it('should contain Arabic, Hebrew, Persian, and Urdu', () => {
      expect(RTL_LANGUAGES).toContain('ar');
      expect(RTL_LANGUAGES).toContain('he');
      expect(RTL_LANGUAGES).toContain('fa');
      expect(RTL_LANGUAGES).toContain('ur');
    });
  });

  describe('isRtlLanguage', () => {
    it('should return true for Arabic', () => {
      expect(isRtlLanguage('ar')).toBe(true);
    });

    it('should return true for Hebrew', () => {
      expect(isRtlLanguage('he')).toBe(true);
    });

    it('should return false for English', () => {
      expect(isRtlLanguage('en')).toBe(false);
    });

    it('should return false for Korean', () => {
      expect(isRtlLanguage('ko')).toBe(false);
    });
  });

  describe('getLanguageInfo', () => {
    it('should return correct info for English', () => {
      const info = getLanguageInfo('en');
      expect(info).toBeDefined();
      expect(info?.code).toBe('en');
      expect(info?.name).toBe('English');
      expect(info?.localName).toBe('English');
    });

    it('should return correct info for Korean', () => {
      const info = getLanguageInfo('ko');
      expect(info).toBeDefined();
      expect(info?.code).toBe('ko');
      expect(info?.name).toBe('Korean');
      expect(info?.localName).toBe('한국어');
    });

    it('should return undefined for unknown code', () => {
      const info = getLanguageInfo('unknown');
      expect(info).toBeUndefined();
    });
  });
});
