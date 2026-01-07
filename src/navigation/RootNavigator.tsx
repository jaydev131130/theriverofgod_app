import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { MainTabNavigator } from './MainTabNavigator';
import { BookDetailScreen } from '../screens/BookDetail/BookDetailScreen';
import { LanguageDownloadScreen } from '../screens/LanguageDownload/LanguageDownloadScreen';
import { ChapterListScreen } from '../screens/ChapterList/ChapterListScreen';
import { useSettingsStore, THEME_COLORS } from '../shared/stores';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { t } = useTranslation();
  const theme = useSettingsStore((state) => state.theme);
  const colors = THEME_COLORS[theme];

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BookDetail"
        component={BookDetailScreen}
        options={{ title: t('library.bookDetails') }}
      />
      <Stack.Screen
        name="LanguageDownload"
        component={LanguageDownloadScreen}
        options={{ title: t('library.downloadLanguages') }}
      />
      <Stack.Screen
        name="ChapterList"
        component={ChapterListScreen}
        options={{ title: t('reader.tableOfContents') }}
      />
    </Stack.Navigator>
  );
};
