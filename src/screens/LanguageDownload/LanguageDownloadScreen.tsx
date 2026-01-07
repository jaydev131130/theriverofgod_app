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

import { useBooksStore, useSettingsStore, THEME_COLORS, type ThemeColors } from '../../shared/stores';
import * as contentService from '../../shared/services/contentService';
import type { LanguageContent } from '../../shared/services/contentService';
import type { RootStackScreenProps } from '../../navigation/types';

type Props = RootStackScreenProps<'LanguageDownload'>;

export const LanguageDownloadScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();

  const theme = useSettingsStore((state) => state.theme);
  const colors = THEME_COLORS[theme];

  const books = useBooksStore((state) => state.books);
  const addBook = useBooksStore((state) => state.addBook);

  const [availableLanguages, setAvailableLanguages] = useState<LanguageContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingLanguage, setDownloadingLanguage] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const styles = createStyles(colors);

  useEffect(() => {
    loadManifest();
  }, []);

  const loadManifest = async () => {
    try {
      setIsLoading(true);
      const manifest = await contentService.fetchManifest();
      setAvailableLanguages(manifest.languages);
    } catch (error) {
      // Use mock data for now until Firebase is configured
      setAvailableLanguages([
        { code: 'en', name: 'English', localName: 'English', file: 'en.epub', size: '2.5 MB', version: '1.0' },
        { code: 'ko', name: 'Korean', localName: '한국어', file: 'ko.epub', size: '2.8 MB', version: '1.0' },
        { code: 'es', name: 'Spanish', localName: 'Español', file: 'es.epub', size: '2.6 MB', version: '1.0' },
        { code: 'zh', name: 'Chinese', localName: '中文', file: 'zh.epub', size: '3.0 MB', version: '1.0' },
        { code: 'ar', name: 'Arabic', localName: 'العربية', file: 'ar.epub', size: '2.7 MB', version: '1.0', rtl: true },
        { code: 'fr', name: 'French', localName: 'Français', file: 'fr.epub', size: '2.5 MB', version: '1.0' },
        { code: 'pt', name: 'Portuguese', localName: 'Português', file: 'pt.epub', size: '2.6 MB', version: '1.0' },
        { code: 'ru', name: 'Russian', localName: 'Русский', file: 'ru.epub', size: '2.8 MB', version: '1.0' },
        { code: 'hi', name: 'Hindi', localName: 'हिन्दी', file: 'hi.epub', size: '2.7 MB', version: '1.0' },
        { code: 'ja', name: 'Japanese', localName: '日本語', file: 'ja.epub', size: '2.9 MB', version: '1.0' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const isLanguageDownloaded = (code: string): boolean => {
    return books.some((b) => b.language === code && b.isDownloaded);
  };

  const isLanguageAdded = (code: string): boolean => {
    return books.some((b) => b.language === code);
  };

  const handleAddLanguage = (language: LanguageContent) => {
    if (isLanguageAdded(language.code)) {
      Alert.alert(t('library.alreadyAdded'), t('library.alreadyAddedMessage'));
      return;
    }

    addBook({
      id: `book-${language.code}`,
      title: `The River of God (${language.localName})`,
      author: 'David Pawson',
      language: language.code,
      version: language.version,
      isDownloaded: false,
    });

    Alert.alert(
      t('common.success'),
      t('library.languageAdded'),
      [
        { text: t('common.ok') },
        {
          text: t('library.downloadNow'),
          onPress: () => handleDownload(language),
        },
      ]
    );
  };

  const handleDownload = async (language: LanguageContent) => {
    setDownloadingLanguage(language.code);
    setDownloadProgress(0);

    try {
      // For now, just simulate download since Firebase is not configured
      // In production, this would use contentService.downloadEpub
      await new Promise((resolve) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 0.1;
          setDownloadProgress(progress);
          if (progress >= 1) {
            clearInterval(interval);
            resolve(true);
          }
        }, 200);
      });

      // Update book as downloaded
      const bookId = `book-${language.code}`;
      const existingBook = books.find((b) => b.id === bookId);
      if (existingBook) {
        // Update existing book
      } else {
        addBook({
          id: bookId,
          title: `The River of God (${language.localName})`,
          author: 'David Pawson',
          language: language.code,
          version: language.version,
          isDownloaded: true,
        });
      }

      Alert.alert(t('common.success'), t('library.downloadComplete'));
    } catch (error) {
      Alert.alert(t('common.error'), t('library.downloadFailed'));
    } finally {
      setDownloadingLanguage(null);
    }
  };

  const renderLanguageItem = ({ item }: { item: LanguageContent }) => {
    const isDownloaded = isLanguageDownloaded(item.code);
    const isAdded = isLanguageAdded(item.code);
    const isDownloading = downloadingLanguage === item.code;

    return (
      <View style={styles.languageCard}>
        <View style={styles.languageInfo}>
          <Text style={styles.languageName}>{item.localName}</Text>
          <Text style={styles.languageEnglishName}>{item.name}</Text>
          <Text style={styles.languageSize}>{item.size}</Text>
        </View>
        <View style={styles.languageActions}>
          {isDownloading ? (
            <View style={styles.downloadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.progressText}>{Math.round(downloadProgress * 100)}%</Text>
            </View>
          ) : isDownloaded ? (
            <View style={styles.downloadedBadge}>
              <Ionicons name="checkmark-circle" size={24} color={colors.success} />
            </View>
          ) : isAdded ? (
            <TouchableOpacity
              style={styles.downloadButton}
              onPress={() => handleDownload(item)}
            >
              <Ionicons name="cloud-download-outline" size={20} color={colors.surface} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => handleAddLanguage(item)}
            >
              <Ionicons name="add" size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={availableLanguages}
        renderItem={renderLanguageItem}
        keyExtractor={(item) => item.code}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
      marginTop: 12,
      color: colors.textSecondary,
      fontSize: 14,
    },
    listContent: {
      padding: 16,
    },
    languageCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 12,
    },
    languageInfo: {
      flex: 1,
    },
    languageName: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    languageEnglishName: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    languageSize: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    languageActions: {
      marginLeft: 16,
    },
    addButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 2,
      borderColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    downloadButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    downloadedBadge: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },
    downloadingContainer: {
      alignItems: 'center',
      width: 44,
    },
    progressText: {
      fontSize: 10,
      color: colors.primary,
      marginTop: 2,
    },
    separator: {
      height: 12,
    },
  });
