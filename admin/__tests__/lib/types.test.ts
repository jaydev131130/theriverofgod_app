import type { LanguagePack, Manifest, ManifestLanguage, ApiResponse } from '@/lib/types';

describe('types', () => {
  describe('LanguagePack', () => {
    it('should allow valid LanguagePack object', () => {
      const pack: LanguagePack = {
        id: '123',
        code: 'en',
        name: 'English',
        localName: 'English',
        file: 'en.epub',
        size: '2.5 MB',
        sizeBytes: 2621440,
        version: '1.0',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      expect(pack.code).toBe('en');
      expect(pack.rtl).toBeUndefined();
    });

    it('should allow rtl flag', () => {
      const pack: LanguagePack = {
        id: '456',
        code: 'ar',
        name: 'Arabic',
        localName: 'العربية',
        file: 'ar.epub',
        size: '2.7 MB',
        sizeBytes: 2831155,
        version: '1.0',
        rtl: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      expect(pack.rtl).toBe(true);
    });
  });

  describe('Manifest', () => {
    it('should allow valid Manifest object', () => {
      const manifest: Manifest = {
        version: '1.0',
        updatedAt: '2024-01-01T00:00:00.000Z',
        languages: [],
      };

      expect(manifest.version).toBe('1.0');
      expect(manifest.languages).toEqual([]);
    });
  });

  describe('ManifestLanguage', () => {
    it('should allow valid ManifestLanguage object', () => {
      const lang: ManifestLanguage = {
        code: 'ko',
        name: 'Korean',
        localName: '한국어',
        file: 'books/ko.epub',
        size: '2.8 MB',
        version: '1.0',
      };

      expect(lang.code).toBe('ko');
    });
  });

  describe('ApiResponse', () => {
    it('should allow success response with data', () => {
      const response: ApiResponse<string[]> = {
        success: true,
        data: ['en', 'ko'],
      };

      expect(response.success).toBe(true);
      expect(response.data).toEqual(['en', 'ko']);
    });

    it('should allow error response', () => {
      const response: ApiResponse = {
        success: false,
        error: 'Something went wrong',
      };

      expect(response.success).toBe(false);
      expect(response.error).toBe('Something went wrong');
    });
  });
});
