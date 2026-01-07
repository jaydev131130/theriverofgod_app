import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { useSettingsStore, THEME_COLORS, type ThemeColors } from '../stores';
import { usePurchaseStore, FREE_CHAPTER_LIMIT } from '../stores/purchaseStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onPurchaseSuccess?: () => void;
  chapterTitle?: string;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  visible,
  onClose,
  onPurchaseSuccess,
  chapterTitle,
}) => {
  const { t } = useTranslation();
  const theme = useSettingsStore((state) => state.theme);
  const colors = THEME_COLORS[theme];

  const products = usePurchaseStore((state) => state.products);
  const isLoadingProducts = usePurchaseStore((state) => state.isLoadingProducts);
  const isPurchasing = usePurchaseStore((state) => state.isPurchasing);
  const purchaseError = usePurchaseStore((state) => state.purchaseError);
  const isRestoring = usePurchaseStore((state) => state.isRestoring);
  const restoreError = usePurchaseStore((state) => state.restoreError);

  const loadProducts = usePurchaseStore((state) => state.loadProducts);
  const purchaseFullAccess = usePurchaseStore((state) => state.purchaseFullAccess);
  const restorePurchases = usePurchaseStore((state) => state.restorePurchases);

  const styles = createStyles(colors);

  useEffect(() => {
    if (visible && products.length === 0) {
      loadProducts();
    }
  }, [visible]);

  const handlePurchase = async () => {
    const success = await purchaseFullAccess();
    if (success) {
      onPurchaseSuccess?.();
      onClose();
    }
  };

  const handleRestore = async () => {
    const restored = await restorePurchases();
    if (restored) {
      onPurchaseSuccess?.();
      onClose();
    }
  };

  const product = products[0]; // Full access product

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Lock icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed" size={48} color={colors.primary} />
          </View>

          {/* Title */}
          <Text style={styles.title}>{t('paywall.title')}</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            {chapterTitle
              ? t('paywall.chapterLocked', { chapter: chapterTitle })
              : t('paywall.subtitle', { freeChapters: FREE_CHAPTER_LIMIT })}
          </Text>

          {/* Features */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={styles.featureText}>{t('paywall.feature1')}</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={styles.featureText}>{t('paywall.feature2')}</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={styles.featureText}>{t('paywall.feature3')}</Text>
            </View>
          </View>

          {/* Error message */}
          {(purchaseError || restoreError) && (
            <Text style={styles.errorText}>{purchaseError || restoreError}</Text>
          )}

          {/* Loading products */}
          {isLoadingProducts ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>{t('common.loading')}</Text>
            </View>
          ) : (
            <>
              {/* Purchase button */}
              <TouchableOpacity
                style={[styles.purchaseButton, isPurchasing && styles.buttonDisabled]}
                onPress={handlePurchase}
                disabled={isPurchasing || isRestoring}
                testID="purchase-button"
              >
                {isPurchasing ? (
                  <ActivityIndicator size="small" color={colors.surface} />
                ) : (
                  <>
                    <Text style={styles.purchaseButtonText}>
                      {t('paywall.unlockAll')}
                    </Text>
                    {product && (
                      <Text style={styles.priceText}>{product.price}</Text>
                    )}
                  </>
                )}
              </TouchableOpacity>

              {/* Restore button */}
              <TouchableOpacity
                style={styles.restoreButton}
                onPress={handleRestore}
                disabled={isPurchasing || isRestoring}
                testID="restore-button"
              >
                {isRestoring ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Text style={styles.restoreButtonText}>
                    {t('paywall.restore')}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Continue with free */}
              <TouchableOpacity
                style={styles.continueButton}
                onPress={onClose}
                testID="continue-free-button"
              >
                <Text style={styles.continueButtonText}>
                  {t('paywall.continueFree')}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* Privacy note */}
          <Text style={styles.privacyNote}>{t('paywall.privacyNote')}</Text>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    container: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      paddingBottom: 40,
      alignItems: 'center',
      maxHeight: '90%',
    },
    closeButton: {
      position: 'absolute',
      top: 16,
      right: 16,
      padding: 8,
      zIndex: 1,
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 16,
      marginBottom: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 22,
      paddingHorizontal: 16,
    },
    featuresContainer: {
      width: '100%',
      marginBottom: 24,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      paddingHorizontal: 16,
    },
    featureText: {
      fontSize: 15,
      color: colors.text,
      marginLeft: 12,
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },
    loadingText: {
      marginLeft: 8,
      color: colors.textSecondary,
    },
    errorText: {
      color: colors.error,
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 16,
    },
    purchaseButton: {
      width: '100%',
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 12,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    },
    buttonDisabled: {
      opacity: 0.7,
    },
    purchaseButtonText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.surface,
    },
    priceText: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.surface,
    },
    restoreButton: {
      paddingVertical: 12,
      marginBottom: 8,
    },
    restoreButtonText: {
      fontSize: 15,
      color: colors.primary,
      fontWeight: '500',
    },
    continueButton: {
      paddingVertical: 8,
    },
    continueButtonText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    privacyNote: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 16,
      paddingHorizontal: 24,
    },
  });
