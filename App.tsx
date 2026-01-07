import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, ActivityIndicator, I18nManager } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { RootNavigator } from './src/navigation';
import { initI18n, isRTL } from './src/i18n';
import { initDatabase } from './src/shared/services/database';
import { useSettingsStore, useBooksStore, THEME_COLORS } from './src/shared/stores';
import { getAvailableBundledLanguages } from './src/shared/services/epubService';

const AppContent: React.FC = () => {
  const theme = useSettingsStore((state) => state.theme);
  const colors = THEME_COLORS[theme];

  return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <NavigationContainer
        theme={{
          dark: theme === 'dark',
          colors: {
            primary: colors.primary,
            background: colors.background,
            card: colors.surface,
            text: colors.text,
            border: colors.border,
            notification: colors.primary,
          },
          fonts: {
            regular: {
              fontFamily: 'System',
              fontWeight: '400',
            },
            medium: {
              fontFamily: 'System',
              fontWeight: '500',
            },
            bold: {
              fontFamily: 'System',
              fontWeight: '600',
            },
            heavy: {
              fontFamily: 'System',
              fontWeight: '700',
            },
          },
        }}
      >
        <RootNavigator />
      </NavigationContainer>
    </>
  );
};

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize i18n
        const i18n = await initI18n();

        // Set RTL if needed
        const currentLang = i18n.language;
        const shouldBeRTL = isRTL(currentLang);
        if (I18nManager.isRTL !== shouldBeRTL) {
          I18nManager.forceRTL(shouldBeRTL);
          I18nManager.allowRTL(shouldBeRTL);
        }

        // Initialize database
        await initDatabase();

        // Initialize bundled books
        const bundledLanguages = getAvailableBundledLanguages();
        const booksStore = useBooksStore.getState();
        const hasNoBooks = booksStore.books.length === 0;

        for (const lang of bundledLanguages) {
          const bookId = `bundled-${lang}`;
          const existingBook = booksStore.books.find(b => b.id === bookId);

          if (!existingBook) {
            booksStore.addBook({
              id: bookId,
              title: lang === 'en' ? 'The River of God' : `The River of God (${lang.toUpperCase()})`,
              author: 'David Pawson',
              language: lang,
              version: '1.0',
              isDownloaded: true,
            });
          }
        }

        // Set first bundled book as current if no book was selected
        if (hasNoBooks && bundledLanguages.length > 0) {
          booksStore.setCurrentBook(`bundled-${bundledLanguages[0]}`);
        }

        setIsReady(true);
      } catch (err) {
        console.error('Initialization error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    initialize();
  }, []);

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorTitle}>Initialization Error</Text>
        <Text style={styles.errorMessage}>{error}</Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
