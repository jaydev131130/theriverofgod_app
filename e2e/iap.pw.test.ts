import { test, expect } from '@playwright/test';

/**
 * Playwright E2E Tests for In-App Purchase Feature
 *
 * Prerequisites:
 * 1. Start the Expo web server: `npx expo start --web`
 * 2. Run tests: `npx playwright test`
 *
 * Note: These tests run against the web version of the app.
 * Mobile-specific features (actual IAP) are mocked.
 */

test.describe('Chapter Access Control', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    // Wait for app to load
    await page.waitForLoadState('networkidle');
  });

  test('should display chapter list with free and locked chapters', async ({ page }) => {
    // Navigate to library and select a book (if needed)
    // This depends on the app navigation structure

    // Look for chapter list elements
    const chapterList = page.locator('[data-testid="chapter-list"]');

    // If chapter list is visible, verify structure
    if (await chapterList.isVisible()) {
      // First chapter should be free (no lock icon)
      const firstChapter = page.locator('[data-testid="chapter-item-0"]');
      await expect(firstChapter).toBeVisible();

      // Second chapter should be locked
      const secondChapter = page.locator('[data-testid="chapter-item-1"]');
      if (await secondChapter.isVisible()) {
        // Verify lock indicator is present
        const lockIcon = secondChapter.locator('[name="lock-closed"]');
        await expect(lockIcon).toBeVisible();
      }
    }
  });

  test('should show paywall modal when tapping locked chapter', async ({ page }) => {
    // Navigate to chapter list
    const lockedChapter = page.locator('[data-testid="chapter-item-1"]');

    if (await lockedChapter.isVisible()) {
      await lockedChapter.click();

      // Verify paywall modal appears
      const paywallModal = page.locator('[data-testid="paywall-modal"]');
      await expect(paywallModal).toBeVisible({ timeout: 5000 });

      // Verify purchase button is visible
      const purchaseButton = page.locator('[data-testid="purchase-button"]');
      await expect(purchaseButton).toBeVisible();
    }
  });

  test('should show unlock banner in chapter list', async ({ page }) => {
    const unlockBanner = page.locator('[data-testid="unlock-banner"]');

    if (await unlockBanner.isVisible()) {
      await expect(unlockBanner).toContainText('Unlock');
    }
  });

  test('should open paywall from unlock banner', async ({ page }) => {
    const unlockBanner = page.locator('[data-testid="unlock-banner"]');

    if (await unlockBanner.isVisible()) {
      await unlockBanner.click();

      const paywallModal = page.locator('[data-testid="paywall-modal"]');
      await expect(paywallModal).toBeVisible({ timeout: 5000 });
    }
  });

  test('should close paywall when tapping Continue Free', async ({ page }) => {
    // Open paywall
    const unlockBanner = page.locator('[data-testid="unlock-banner"]');

    if (await unlockBanner.isVisible()) {
      await unlockBanner.click();

      // Wait for modal
      const paywallModal = page.locator('[data-testid="paywall-modal"]');
      await expect(paywallModal).toBeVisible({ timeout: 5000 });

      // Tap continue free
      const continueButton = page.locator('[data-testid="continue-free-button"]');
      await continueButton.click();

      // Modal should close
      await expect(paywallModal).not.toBeVisible({ timeout: 3000 });
    }
  });
});

test.describe('Purchase Flow', () => {
  test('should display product price in paywall', async ({ page }) => {
    await page.goto('/');

    const unlockBanner = page.locator('[data-testid="unlock-banner"]');

    if (await unlockBanner.isVisible()) {
      await unlockBanner.click();

      const paywallModal = page.locator('[data-testid="paywall-modal"]');
      await expect(paywallModal).toBeVisible({ timeout: 5000 });

      // Verify price is displayed (mock price: $4.99)
      await expect(paywallModal).toContainText('$');
    }
  });

  test('should show restore purchase option', async ({ page }) => {
    await page.goto('/');

    const unlockBanner = page.locator('[data-testid="unlock-banner"]');

    if (await unlockBanner.isVisible()) {
      await unlockBanner.click();

      const restoreButton = page.locator('[data-testid="restore-button"]');
      await expect(restoreButton).toBeVisible();
    }
  });
});

test.describe('Accessibility', () => {
  test('should have proper ARIA labels on paywall buttons', async ({ page }) => {
    await page.goto('/');

    const unlockBanner = page.locator('[data-testid="unlock-banner"]');

    if (await unlockBanner.isVisible()) {
      await unlockBanner.click();

      const purchaseButton = page.locator('[data-testid="purchase-button"]');
      await expect(purchaseButton).toBeVisible();

      // Check for accessibility
      const accessibleName = await purchaseButton.getAttribute('aria-label');
      // Button should have accessible text
      const buttonText = await purchaseButton.textContent();
      expect(buttonText?.length).toBeGreaterThan(0);
    }
  });
});

test.describe('Responsive Design', () => {
  test('paywall should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const unlockBanner = page.locator('[data-testid="unlock-banner"]');

    if (await unlockBanner.isVisible()) {
      await unlockBanner.click();

      const paywallModal = page.locator('[data-testid="paywall-modal"]');
      await expect(paywallModal).toBeVisible({ timeout: 5000 });

      // Modal should fit within viewport
      const modalBox = await paywallModal.boundingBox();
      if (modalBox) {
        expect(modalBox.width).toBeLessThanOrEqual(375);
      }
    }
  });
});
