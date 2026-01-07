import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Product IDs for in-app purchases
export const PRODUCT_IDS = {
  FULL_ACCESS: 'com.theriverofgod.fullaccess',
} as const;

// Free chapter limit (Chapter 1 = index 0, Chapter 2 = index 1, so chapters 0-1 are free)
export const FREE_CHAPTER_LIMIT = 2;

export interface PurchaseProduct {
  id: string;
  title: string;
  description: string;
  price: string;
  priceAmount: number;
  currency: string;
}

export interface PurchaseState {
  // Purchase status
  isPurchased: boolean;
  purchaseDate: number | null;
  transactionId: string | null;

  // Products
  products: PurchaseProduct[];
  isLoadingProducts: boolean;

  // Purchase flow
  isPurchasing: boolean;
  purchaseError: string | null;

  // Restore
  isRestoring: boolean;
  restoreError: string | null;

  // Actions
  loadProducts: () => Promise<void>;
  purchaseFullAccess: () => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;

  // Helper functions
  isChapterLocked: (chapterIndex: number) => boolean;
  getLockedChapterCount: (totalChapters: number) => number;

  // For testing/development
  setPurchased: (purchased: boolean) => void;
  resetPurchase: () => void;
}

export const usePurchaseStore = create<PurchaseState>()(
  persist(
    (set, get) => ({
      // Initial state
      isPurchased: false,
      purchaseDate: null,
      transactionId: null,
      products: [],
      isLoadingProducts: false,
      isPurchasing: false,
      purchaseError: null,
      isRestoring: false,
      restoreError: null,

      // Load available products from store
      loadProducts: async () => {
        set({ isLoadingProducts: true, purchaseError: null });

        try {
          // TODO: Replace with actual IAP implementation
          // Using expo-in-app-purchases or react-native-iap

          // Mock product for development
          const mockProducts: PurchaseProduct[] = [
            {
              id: PRODUCT_IDS.FULL_ACCESS,
              title: 'Full Access',
              description: 'Unlock all chapters',
              price: '$4.99',
              priceAmount: 4.99,
              currency: 'USD',
            },
          ];

          // Simulate network delay
          await new Promise((resolve) => setTimeout(resolve, 500));

          set({ products: mockProducts, isLoadingProducts: false });
        } catch (error) {
          console.error('Failed to load products:', error);
          set({
            isLoadingProducts: false,
            purchaseError: 'Failed to load products',
          });
        }
      },

      // Purchase full access
      purchaseFullAccess: async () => {
        const { isPurchased } = get();

        if (isPurchased) {
          return true;
        }

        set({ isPurchasing: true, purchaseError: null });

        try {
          // TODO: Replace with actual IAP implementation
          // 1. Request purchase from store
          // 2. Validate receipt on server (optional but recommended)
          // 3. Grant access

          // Mock purchase for development
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Simulate successful purchase
          const transactionId = `mock_${Date.now()}`;

          set({
            isPurchased: true,
            purchaseDate: Date.now(),
            transactionId,
            isPurchasing: false,
          });

          return true;
        } catch (error) {
          console.error('Purchase failed:', error);
          set({
            isPurchasing: false,
            purchaseError: 'Purchase failed. Please try again.',
          });
          return false;
        }
      },

      // Restore previous purchases
      restorePurchases: async () => {
        set({ isRestoring: true, restoreError: null });

        try {
          // TODO: Replace with actual IAP restore implementation
          // This queries the store for previous purchases

          // Mock restore for development
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // For testing, we'll return false (no purchases to restore)
          // In production, this would check actual store records

          set({ isRestoring: false });

          return false;
        } catch (error) {
          console.error('Restore failed:', error);
          set({
            isRestoring: false,
            restoreError: 'Failed to restore purchases. Please try again.',
          });
          return false;
        }
      },

      // Check if a chapter is locked based on index
      isChapterLocked: (chapterIndex: number) => {
        const { isPurchased } = get();

        // If purchased, no chapters are locked
        if (isPurchased) {
          return false;
        }

        // Chapter 1 (index 0) is free, rest are locked
        return chapterIndex >= FREE_CHAPTER_LIMIT;
      },

      // Get count of locked chapters
      getLockedChapterCount: (totalChapters: number) => {
        const { isPurchased } = get();

        if (isPurchased) {
          return 0;
        }

        return Math.max(0, totalChapters - FREE_CHAPTER_LIMIT);
      },

      // For testing/development - set purchased status directly
      setPurchased: (purchased: boolean) => {
        set({
          isPurchased: purchased,
          purchaseDate: purchased ? Date.now() : null,
          transactionId: purchased ? `test_${Date.now()}` : null,
        });
      },

      // Reset purchase state (for testing)
      resetPurchase: () => {
        set({
          isPurchased: false,
          purchaseDate: null,
          transactionId: null,
          purchaseError: null,
          restoreError: null,
        });
      },
    }),
    {
      name: 'purchase-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist purchase status, not loading states
      partialize: (state) => ({
        isPurchased: state.isPurchased,
        purchaseDate: state.purchaseDate,
        transactionId: state.transactionId,
      }),
    }
  )
);
