import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// Main Tab Navigator
export type MainTabParamList = {
  Library: undefined;
  Reader: { bookId?: string; chapterHref?: string } | undefined;
  Settings: undefined;
};

// Root Stack Navigator
export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList>;
  BookDetail: { bookId: string };
  LanguageDownload: undefined;
  ChapterList: { bookId: string };
};

// Screen props types
export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

export type MainTabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>;

// Declaration for useNavigation hook
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
