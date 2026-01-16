/**
 * API Route Tests
 *
 * Note: These tests focus on unit testing the utility functions.
 * For full API integration tests, use tools like supertest or
 * run the dev server and test with fetch/axios.
 */

import { formatFileSize } from '@/lib/storage';

describe('API utilities', () => {
  describe('formatFileSize', () => {
    it('should return "0 B" for 0 bytes', () => {
      expect(formatFileSize(0)).toBe('0 B');
    });

    it('should format bytes correctly', () => {
      expect(formatFileSize(500)).toBe('500 B');
    });

    it('should format KB correctly', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });

    it('should format MB correctly', () => {
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(2621440)).toBe('2.5 MB');
    });

    it('should format GB correctly', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });
  });
});

/**
 * Note: API route handlers (GET, POST, etc.) cannot be unit tested directly
 * because they require Next.js server runtime. Use integration tests with
 * a running dev server for full API testing.
 *
 * Example integration test approach:
 *
 * 1. Start the dev server: npm run dev
 * 2. Use fetch or axios to test endpoints:
 *    - GET http://localhost:3000/api/languages
 *    - POST http://localhost:3000/api/languages (with FormData)
 *    - DELETE http://localhost:3000/api/languages/en
 */
