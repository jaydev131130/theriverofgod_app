import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import {
  useBooksStore,
  useSettingsStore,
  usePurchaseStore,
  THEME_COLORS,
  FREE_CHAPTER_LIMIT,
  type ThemeColors,
  type Chapter,
} from '../../shared/stores';
import { PaywallModal } from '../../shared/components/PaywallModal';
import type { RootStackScreenProps } from '../../navigation/types';

type Props = RootStackScreenProps<'ChapterList'>;

export const ChapterListScreen: React.FC<Props> = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { bookId } = route.params;

  const theme = useSettingsStore((state) => state.theme);
  const colors = THEME_COLORS[theme];

  const books = useBooksStore((state) => state.books);
  const readingProgress = useBooksStore((state) => state.readingProgress);
  const storedChapters = useBooksStore((state) => state.bookChapters[bookId] || []);

  const isPurchased = usePurchaseStore((state) => state.isPurchased);
  const isChapterLocked = usePurchaseStore((state) => state.isChapterLocked);

  const [showPaywall, setShowPaywall] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);

  const book = books.find((b) => b.id === bookId);
  const currentProgress = readingProgress[bookId];

  // Use chapters from store (populated by ReaderScreen)
  const chapters = storedChapters;
  const isLoading = chapters.length === 0;

  const styles = createStyles(colors);

  const handleChapterPress = (chapter: Chapter, index: number) => {
    console.log('[ChapterList] Chapter pressed:', { index, id: chapter.id, title: chapter.title, href: chapter.href });

    // Check if chapter is locked
    if (isChapterLocked(index)) {
      setSelectedChapter(chapter);
      setShowPaywall(true);
      return;
    }

    console.log('[ChapterList] Navigating to Reader with chapterHref:', chapter.href);
    // Navigate to reader with specific chapter
    navigation.navigate('Main', {
      screen: 'Reader',
      params: { bookId, chapterHref: chapter.href },
    });
  };

  const handlePurchaseSuccess = () => {
    // Show success message
    Alert.alert(
      t('common.success'),
      t('paywall.purchaseSuccess'),
      [{ text: t('common.ok') }]
    );
  };

  const getLockedCount = () => {
    if (isPurchased) return 0;
    return Math.max(0, chapters.length - FREE_CHAPTER_LIMIT);
  };

  const renderChapter = ({ item, index }: { item: Chapter; index: number }) => {
    const isCurrentChapter = currentProgress?.chapterId === item.id;
    const isLocked = isChapterLocked(index);
    const isFree = index < FREE_CHAPTER_LIMIT;

    return (
      <TouchableOpacity
        style={[
          styles.chapterItem,
          isCurrentChapter && styles.currentChapter,
          isLocked && styles.lockedChapter,
        ]}
        onPress={() => handleChapterPress(item, index)}
        activeOpacity={0.7}
        testID={`chapter-item-${index}`}
      >
        <View style={styles.chapterNumber}>
          {isLocked ? (
            <Ionicons name="lock-closed" size={16} color={colors.textSecondary} />
          ) : (
            <Text
              style={[
                styles.chapterNumberText,
                isCurrentChapter && styles.currentChapterText,
              ]}
            >
              {index + 1}
            </Text>
          )}
        </View>
        <View style={styles.chapterInfo}>
          <Text
            style={[
              styles.chapterTitle,
              isCurrentChapter && styles.currentChapterText,
              isLocked && styles.lockedChapterText,
            ]}
            numberOfLines={2}
          >
            {item.title}
          </Text>
          {isFree && !isPurchased && (
            <View style={styles.freeBadge}>
              <Text style={styles.freeBadgeText}>FREE</Text>
            </View>
          )}
        </View>
        {isCurrentChapter && !isLocked && (
          <Ionicons name="bookmark" size={20} color={colors.primary} />
        )}
        {isLocked && (
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="book-outline" size={60} color={colors.textSecondary} />
        <Text style={styles.loadingText}>{t('reader.noBookSelected')}</Text>
        <TouchableOpacity
          style={styles.openReaderButton}
          onPress={() => {
            navigation.navigate('Main', {
              screen: 'Reader',
              params: { bookId },
            });
          }}
        >
          <Text style={styles.openReaderButtonText}>{t('reader.startReading')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {book && (
        <View style={styles.header}>
          <Text style={styles.bookTitle}>{book.title}</Text>
          <View style={styles.headerMeta}>
            <Text style={styles.chapterCount}>
              {chapters.length} {t('reader.chapters')}
            </Text>
            {!isPurchased && getLockedCount() > 0 && (
              <View style={styles.lockedBadge}>
                <Ionicons name="lock-closed" size={12} color={colors.warning} />
                <Text style={styles.lockedBadgeText}>
                  {getLockedCount()} locked
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Unlock banner for non-purchasers */}
      {!isPurchased && (
        <TouchableOpacity
          style={styles.unlockBanner}
          onPress={() => setShowPaywall(true)}
          testID="unlock-banner"
        >
          <View style={styles.unlockBannerContent}>
            <Ionicons name="star" size={20} color={colors.warning} />
            <View style={styles.unlockBannerText}>
              <Text style={styles.unlockBannerTitle}>
                {t('paywall.unlockAll')}
              </Text>
              <Text style={styles.unlockBannerSubtitle}>
                {t('paywall.subtitle')}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.primary} />
        </TouchableOpacity>
      )}

      <FlatList
        data={chapters}
        renderItem={renderChapter}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        testID="chapter-list"
      />

      {/* Paywall Modal */}
      <PaywallModal
        visible={showPaywall}
        onClose={() => {
          setShowPaywall(false);
          setSelectedChapter(null);
        }}
        onPurchaseSuccess={handlePurchaseSuccess}
        chapterTitle={selectedChapter?.title}
      />
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    loadingText: {
      marginTop: 16,
      color: colors.textSecondary,
      fontSize: 16,
      textAlign: 'center',
    },
    openReaderButton: {
      marginTop: 20,
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 24,
    },
    openReaderButtonText: {
      color: colors.surface,
      fontSize: 16,
      fontWeight: '600',
    },
    header: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
    },
    bookTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    headerMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    chapterCount: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    lockedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.warning + '20',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
    },
    lockedBadgeText: {
      fontSize: 12,
      color: colors.warning,
      fontWeight: '500',
    },
    unlockBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.primary + '10',
      margin: 16,
      marginBottom: 8,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.primary + '30',
    },
    unlockBannerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: 12,
    },
    unlockBannerText: {
      flex: 1,
    },
    unlockBannerTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    unlockBannerSubtitle: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
    },
    listContent: {
      padding: 16,
    },
    chapterItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 12,
    },
    currentChapter: {
      backgroundColor: colors.primary + '15',
      borderWidth: 1,
      borderColor: colors.primary,
    },
    lockedChapter: {
      backgroundColor: colors.surface,
      opacity: 0.8,
    },
    chapterNumber: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    chapterNumberText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    currentChapterText: {
      color: colors.primary,
    },
    lockedChapterText: {
      color: colors.textSecondary,
    },
    chapterInfo: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    chapterTitle: {
      fontSize: 16,
      color: colors.text,
      flex: 1,
    },
    freeBadge: {
      backgroundColor: colors.success + '20',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
    },
    freeBadgeText: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.success,
    },
    separator: {
      height: 8,
    },
  });
