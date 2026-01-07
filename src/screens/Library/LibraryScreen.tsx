import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { useBooksStore, useSettingsStore, THEME_COLORS, type ThemeColors } from '../../shared/stores';
import type { MainTabScreenProps } from '../../navigation/types';
import type { Book } from '../../shared/stores';

type Props = MainTabScreenProps<'Library'>;

export const LibraryScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const theme = useSettingsStore((state) => state.theme);
  const colors = THEME_COLORS[theme];

  const books = useBooksStore((state) => state.books);
  const loadBooks = useBooksStore((state) => state.loadBooks);

  useFocusEffect(
    useCallback(() => {
      loadBooks();
    }, [loadBooks])
  );

  const styles = createStyles(colors);

  const handleBookPress = (book: Book) => {
    if (book.isDownloaded) {
      navigation.navigate('Reader', { bookId: book.id });
    } else {
      navigation.navigate('BookDetail', { bookId: book.id });
    }
  };

  const handleAddLanguage = () => {
    navigation.navigate('LanguageDownload');
  };

  const renderBook = ({ item }: { item: Book }) => (
    <TouchableOpacity
      style={styles.bookCard}
      onPress={() => handleBookPress(item)}
      activeOpacity={0.7}
    >
      {item.coverPath ? (
        <Image source={{ uri: item.coverPath }} style={styles.bookCover} />
      ) : (
        <View style={[styles.bookCover, styles.placeholderCover]}>
          <Ionicons name="book" size={40} color={colors.textSecondary} />
        </View>
      )}
      <Text style={styles.bookTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.bookLanguage}>{item.language.toUpperCase()}</Text>
      {!item.isDownloaded && (
        <View style={styles.downloadBadge}>
          <Ionicons name="cloud-download-outline" size={14} color={colors.primary} />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="library-outline" size={80} color={colors.textSecondary} />
      <Text style={styles.emptyTitle}>{t('library.emptyState')}</Text>
      <Text style={styles.emptySubtitle}>{t('library.emptyStateSubtitle')}</Text>
      <TouchableOpacity style={styles.addButton} onPress={handleAddLanguage}>
        <Ionicons name="add-circle-outline" size={24} color={colors.surface} />
        <Text style={styles.addButtonText}>{t('library.downloadLanguages')}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {books.length > 0 ? (
        <>
          <FlatList
            data={books}
            renderItem={renderBook}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={styles.row}
          />
          <TouchableOpacity
            style={styles.fab}
            onPress={handleAddLanguage}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={28} color={colors.surface} />
          </TouchableOpacity>
        </>
      ) : (
        renderEmptyState()
      )}
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    listContent: {
      padding: 16,
    },
    row: {
      justifyContent: 'space-between',
    },
    bookCard: {
      width: '48%',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    bookCover: {
      width: '100%',
      aspectRatio: 0.7,
      borderRadius: 8,
      marginBottom: 8,
    },
    placeholderCover: {
      backgroundColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    bookTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    bookLanguage: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    downloadBadge: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 4,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      marginTop: 16,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 24,
      gap: 8,
    },
    addButtonText: {
      color: colors.surface,
      fontSize: 16,
      fontWeight: '600',
    },
    fab: {
      position: 'absolute',
      right: 20,
      bottom: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 8,
    },
  });
