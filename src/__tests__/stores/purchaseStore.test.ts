import { usePurchaseStore, FREE_CHAPTER_LIMIT, PRODUCT_IDS } from '../../shared/stores/purchaseStore';

describe('PurchaseStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    usePurchaseStore.setState({
      isPurchased: false,
      purchaseDate: null,
      transactionId: null,
      products: [],
      isLoadingProducts: false,
      isPurchasing: false,
      purchaseError: null,
      isRestoring: false,
      restoreError: null,
    });
  });

  describe('Initial State', () => {
    it('should have isPurchased as false by default', () => {
      const { isPurchased } = usePurchaseStore.getState();
      expect(isPurchased).toBe(false);
    });

    it('should have no purchaseDate by default', () => {
      const { purchaseDate } = usePurchaseStore.getState();
      expect(purchaseDate).toBeNull();
    });

    it('should have no transactionId by default', () => {
      const { transactionId } = usePurchaseStore.getState();
      expect(transactionId).toBeNull();
    });

    it('should have empty products array by default', () => {
      const { products } = usePurchaseStore.getState();
      expect(products).toEqual([]);
    });
  });

  describe('FREE_CHAPTER_LIMIT constant', () => {
    it('should be defined and be a positive number', () => {
      expect(FREE_CHAPTER_LIMIT).toBeDefined();
      expect(typeof FREE_CHAPTER_LIMIT).toBe('number');
      expect(FREE_CHAPTER_LIMIT).toBeGreaterThan(0);
    });

    it('should be exactly 2 (Chapter 1 and 2 are free)', () => {
      expect(FREE_CHAPTER_LIMIT).toBe(2);
    });
  });

  describe('PRODUCT_IDS', () => {
    it('should have FULL_ACCESS product ID', () => {
      expect(PRODUCT_IDS.FULL_ACCESS).toBeDefined();
      expect(typeof PRODUCT_IDS.FULL_ACCESS).toBe('string');
    });

    it('should have proper product ID format', () => {
      expect(PRODUCT_IDS.FULL_ACCESS).toBe('com.theriverofgod.fullaccess');
    });
  });

  describe('Chapter Lock Logic', () => {
    it('should lock chapters after FREE_CHAPTER_LIMIT when not purchased', () => {
      const { isChapterLocked } = usePurchaseStore.getState();

      // Chapter 0 (index 0) = Introduction, should be FREE
      expect(isChapterLocked(0)).toBe(false);
      // Chapter 1 (index 1) = Chapter 1, should be FREE
      expect(isChapterLocked(1)).toBe(false);

      // Chapters 2+ should be locked
      expect(isChapterLocked(2)).toBe(true);
      expect(isChapterLocked(5)).toBe(true);
      expect(isChapterLocked(10)).toBe(true);
    });

    it('should unlock all chapters when purchased', () => {
      const { setPurchased, isChapterLocked } = usePurchaseStore.getState();

      // Purchase the full access
      setPurchased(true);

      // All chapters should be unlocked
      const state = usePurchaseStore.getState();
      expect(state.isChapterLocked(0)).toBe(false);
      expect(state.isChapterLocked(1)).toBe(false);
      expect(state.isChapterLocked(5)).toBe(false);
      expect(state.isChapterLocked(10)).toBe(false);
    });

    it('should re-lock chapters when purchase is reset', () => {
      const { setPurchased, resetPurchase } = usePurchaseStore.getState();

      // Purchase then reset
      setPurchased(true);
      resetPurchase();

      const { isChapterLocked } = usePurchaseStore.getState();
      expect(isChapterLocked(0)).toBe(false); // First chapter always free
      expect(isChapterLocked(1)).toBe(false); // Second chapter also free
      expect(isChapterLocked(2)).toBe(true);  // Third chapter locked again
    });
  });

  describe('Locked Chapter Count', () => {
    it('should return correct locked count when not purchased', () => {
      const { getLockedChapterCount } = usePurchaseStore.getState();

      // With 7 chapters, 5 should be locked (all except first two)
      expect(getLockedChapterCount(7)).toBe(5);

      // With 10 chapters, 8 should be locked
      expect(getLockedChapterCount(10)).toBe(8);

      // With 2 chapters, 0 should be locked (both free)
      expect(getLockedChapterCount(2)).toBe(0);
    });

    it('should return 0 locked chapters when purchased', () => {
      const { setPurchased } = usePurchaseStore.getState();
      setPurchased(true);

      const { getLockedChapterCount } = usePurchaseStore.getState();
      expect(getLockedChapterCount(7)).toBe(0);
      expect(getLockedChapterCount(100)).toBe(0);
    });
  });

  describe('Purchase Flow', () => {
    it('should set isPurchased to true after successful purchase', async () => {
      const { purchaseFullAccess } = usePurchaseStore.getState();

      const result = await purchaseFullAccess();

      expect(result).toBe(true);
      const { isPurchased, purchaseDate, transactionId } = usePurchaseStore.getState();
      expect(isPurchased).toBe(true);
      expect(purchaseDate).not.toBeNull();
      expect(transactionId).not.toBeNull();
    });

    it('should set isPurchasing during purchase', async () => {
      const { purchaseFullAccess } = usePurchaseStore.getState();

      const purchasePromise = purchaseFullAccess();

      // During purchase
      expect(usePurchaseStore.getState().isPurchasing).toBe(true);

      await purchasePromise;

      // After purchase
      expect(usePurchaseStore.getState().isPurchasing).toBe(false);
    });

    it('should return true immediately if already purchased', async () => {
      const { setPurchased, purchaseFullAccess } = usePurchaseStore.getState();

      setPurchased(true);

      const result = await usePurchaseStore.getState().purchaseFullAccess();

      expect(result).toBe(true);
      // Should not trigger purchasing flow
      expect(usePurchaseStore.getState().isPurchasing).toBe(false);
    });
  });

  describe('Restore Flow', () => {
    it('should set isRestoring during restore', async () => {
      const { restorePurchases } = usePurchaseStore.getState();

      const restorePromise = restorePurchases();

      // During restore
      expect(usePurchaseStore.getState().isRestoring).toBe(true);

      await restorePromise;

      // After restore
      expect(usePurchaseStore.getState().isRestoring).toBe(false);
    });

    it('should return false when no purchases to restore (mock)', async () => {
      const { restorePurchases } = usePurchaseStore.getState();

      const result = await restorePurchases();

      // Mock returns false (no purchases found)
      expect(result).toBe(false);
    });
  });

  describe('Load Products', () => {
    it('should load mock products', async () => {
      const { loadProducts } = usePurchaseStore.getState();

      await loadProducts();

      const { products, isLoadingProducts } = usePurchaseStore.getState();
      expect(isLoadingProducts).toBe(false);
      expect(products.length).toBeGreaterThan(0);
      expect(products[0].id).toBe(PRODUCT_IDS.FULL_ACCESS);
    });

    it('should set isLoadingProducts during load', async () => {
      const { loadProducts } = usePurchaseStore.getState();

      const loadPromise = loadProducts();

      // During load
      expect(usePurchaseStore.getState().isLoadingProducts).toBe(true);

      await loadPromise;

      // After load
      expect(usePurchaseStore.getState().isLoadingProducts).toBe(false);
    });

    it('should include price information in products', async () => {
      const { loadProducts } = usePurchaseStore.getState();

      await loadProducts();

      const { products } = usePurchaseStore.getState();
      const product = products[0];

      expect(product.price).toBeDefined();
      expect(product.priceAmount).toBeDefined();
      expect(product.currency).toBeDefined();
      expect(typeof product.priceAmount).toBe('number');
    });
  });

  describe('setPurchased helper', () => {
    it('should set purchased status with timestamp', () => {
      const { setPurchased } = usePurchaseStore.getState();

      const before = Date.now();
      setPurchased(true);
      const after = Date.now();

      const { isPurchased, purchaseDate, transactionId } = usePurchaseStore.getState();

      expect(isPurchased).toBe(true);
      expect(purchaseDate).toBeGreaterThanOrEqual(before);
      expect(purchaseDate).toBeLessThanOrEqual(after);
      expect(transactionId).toMatch(/^test_/);
    });

    it('should clear purchase data when set to false', () => {
      const { setPurchased } = usePurchaseStore.getState();

      setPurchased(true);
      setPurchased(false);

      const { isPurchased, purchaseDate, transactionId } = usePurchaseStore.getState();

      expect(isPurchased).toBe(false);
      expect(purchaseDate).toBeNull();
      expect(transactionId).toBeNull();
    });
  });

  describe('resetPurchase helper', () => {
    it('should reset all purchase state', () => {
      usePurchaseStore.setState({
        isPurchased: true,
        purchaseDate: Date.now(),
        transactionId: 'test_123',
        purchaseError: 'some error',
        restoreError: 'restore error',
      });

      const { resetPurchase } = usePurchaseStore.getState();
      resetPurchase();

      const state = usePurchaseStore.getState();
      expect(state.isPurchased).toBe(false);
      expect(state.purchaseDate).toBeNull();
      expect(state.transactionId).toBeNull();
      expect(state.purchaseError).toBeNull();
      expect(state.restoreError).toBeNull();
    });
  });
});

describe('Paywall Business Logic', () => {
  beforeEach(() => {
    usePurchaseStore.setState({
      isPurchased: false,
      purchaseDate: null,
      transactionId: null,
    });
  });

  describe('Free Trial Chapter Access', () => {
    it('should allow access to first two chapters without purchase', () => {
      const { isChapterLocked } = usePurchaseStore.getState();

      // Chapter 1 (Introduction at index 0) should be free
      expect(isChapterLocked(0)).toBe(false);
      // Chapter 2 (index 1) should also be free
      expect(isChapterLocked(1)).toBe(false);
    });

    it('should require purchase for chapter 3 onwards', () => {
      const { isChapterLocked } = usePurchaseStore.getState();

      // Chapters after index 1 should be locked
      for (let i = 2; i <= 10; i++) {
        expect(isChapterLocked(i)).toBe(true);
      }
    });
  });

  describe('Full Access After Purchase', () => {
    it('should unlock all chapters after purchase', async () => {
      const { purchaseFullAccess } = usePurchaseStore.getState();

      await purchaseFullAccess();

      const { isChapterLocked } = usePurchaseStore.getState();

      // All chapters should be accessible
      for (let i = 0; i <= 20; i++) {
        expect(isChapterLocked(i)).toBe(false);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative chapter index gracefully', () => {
      const { isChapterLocked } = usePurchaseStore.getState();

      // Negative index should not crash
      expect(isChapterLocked(-1)).toBe(false);
    });

    it('should handle very large chapter index', () => {
      const { isChapterLocked } = usePurchaseStore.getState();

      expect(isChapterLocked(1000)).toBe(true);
    });

    it('should handle zero total chapters for locked count', () => {
      const { getLockedChapterCount } = usePurchaseStore.getState();

      expect(getLockedChapterCount(0)).toBe(0);
    });
  });
});
