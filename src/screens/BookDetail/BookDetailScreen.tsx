import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { useBooksStore, useSettingsStore, THEME_COLORS, type ThemeColors } from '../../shared/stores';
import * as contentService from '../../shared/services/contentService';
import type { RootStackScreenProps } from '../../navigation/types';

type Props = RootStackScreenProps<'BookDetail'>;

export const BookDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { bookId } = route.params;

  const theme = useSettingsStore((state) => state.theme);
  const colors = THEME_COLORS[theme];

  const books = useBooksStore((state) => state.books);
  const updateBook = useBooksStore((state) => state.updateBook);

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const book = books.find((b) => b.id === bookId);

  const styles = createStyles(colors);

  const handleDownload = async () => {
    if (!book) return;

    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      const filePath = await contentService.downloadEpub(
        {
          code: book.language,
          name: book.title,
          localName: book.title,
          file: `${book.language}.epub`,
          size: '0',
          version: book.version || '1.0',
        },
        (progress) => setDownloadProgress(progress)
      );

      updateBook(book.id, { isDownloaded: true, filePath });

      Alert.alert(
        t('common.success'),
        t('library.downloadComplete'),
        [
          {
            text: t('common.ok'),
            onPress: () => navigation.navigate('Main', { screen: 'Reader', params: { bookId: book.id } }),
          },
        ]
      );
    } catch (error) {
      Alert.alert(t('common.error'), t('library.downloadFailed'));
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!book) return;

    Alert.alert(
      t('library.deleteConfirm'),
      t('library.deleteConfirmMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await contentService.deleteEpub(book.language);
              updateBook(book.id, { isDownloaded: false, filePath: undefined });
            } catch (error) {
              Alert.alert(t('common.error'), t('library.deleteFailed'));
            }
          },
        },
      ]
    );
  };

  if (!book) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{t('common.error')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.coverContainer}>
        {book.coverPath ? (
          <Image source={{ uri: book.coverPath }} style={styles.cover} />
        ) : (
          <View style={[styles.cover, styles.placeholderCover]}>
            <Ionicons name="book" size={60} color={colors.textSecondary} />
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.title}>{book.title}</Text>
        {book.author && <Text style={styles.author}>{book.author}</Text>}
        <View style={styles.languageBadge}>
          <Text style={styles.languageText}>{book.language.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        {book.isDownloaded ? (
          <>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate('Main', { screen: 'Reader', params: { bookId: book.id } })}
            >
              <Ionicons name="book-outline" size={20} color={colors.surface} />
              <Text style={styles.primaryButtonText}>{t('reader.startReading')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={20} color={colors.error} />
              <Text style={[styles.secondaryButtonText, { color: colors.error }]}>
                {t('common.delete')}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <>
                <ActivityIndicator size="small" color={colors.surface} />
                <Text style={styles.primaryButtonText}>
                  {Math.round(downloadProgress * 100)}%
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="cloud-download-outline" size={20} color={colors.surface} />
                <Text style={styles.primaryButtonText}>{t('library.download')}</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 24,
    },
    coverContainer: {
      alignItems: 'center',
      marginBottom: 24,
    },
    cover: {
      width: 180,
      height: 260,
      borderRadius: 12,
    },
    placeholderCover: {
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    infoContainer: {
      alignItems: 'center',
      marginBottom: 32,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    author: {
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: 12,
    },
    languageBadge: {
      backgroundColor: colors.primary + '20',
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    languageText: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: '600',
    },
    actions: {
      gap: 12,
    },
    primaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 12,
      gap: 8,
    },
    primaryButtonText: {
      color: colors.surface,
      fontSize: 16,
      fontWeight: '600',
    },
    secondaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      paddingVertical: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 8,
    },
    secondaryButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    errorText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });
