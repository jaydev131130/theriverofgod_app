import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import {
  useSettingsStore,
  THEME_COLORS,
  FONT_SIZES,
  TTS_SPEEDS,
  type Theme,
  type FontSize,
  type ReadingMode,
  type TTSSpeed,
  type ThemeColors,
} from '../../shared/stores';
import { SUPPORTED_LANGUAGES, changeLanguage } from '../../i18n';
import * as ttsService from '../../shared/services/ttsService';
import type { Voice } from '../../shared/services/ttsService';
import type { MainTabScreenProps } from '../../navigation/types';

type Props = MainTabScreenProps<'Settings'>;

export const SettingsScreen: React.FC<Props> = () => {
  const { t, i18n } = useTranslation();
  const {
    theme,
    fontSize,
    readingMode,
    autoPlayTTS,
    ttsVoiceId,
    ttsSpeed,
    setTheme,
    setFontSize,
    setReadingMode,
    setAutoPlayTTS,
    setTTSVoiceId,
    setTTSSpeed,
  } = useSettingsStore();

  // Voice picker state
  const [voices, setVoices] = useState<Voice[]>([]);
  const [voiceModalVisible, setVoiceModalVisible] = useState(false);
  const [loadingVoices, setLoadingVoices] = useState(false);

  // Load available voices on mount
  useEffect(() => {
    loadVoices();
  }, []);

  const loadVoices = async () => {
    setLoadingVoices(true);
    try {
      const availableVoices = await ttsService.getAvailableVoices();
      setVoices(availableVoices);
    } catch (error) {
      console.error('Failed to load voices:', error);
    } finally {
      setLoadingVoices(false);
    }
  };

  const getSelectedVoiceName = (): string => {
    if (!ttsVoiceId) return t('settings.ttsVoiceAuto');
    const voice = voices.find(v => v.identifier === ttsVoiceId);
    return voice ? voice.name : t('settings.ttsVoiceAuto');
  };

  const handleVoiceSelect = (voiceId: string | null) => {
    setTTSVoiceId(voiceId);
    setVoiceModalVisible(false);
  };

  const colors = THEME_COLORS[theme];
  const styles = createStyles(colors);

  const themes: { key: Theme; icon: string }[] = [
    { key: 'light', icon: 'sunny-outline' },
    { key: 'dark', icon: 'moon-outline' },
    { key: 'sepia', icon: 'leaf-outline' },
  ];

  const fontSizes: { key: FontSize; label: string }[] = [
    { key: 'small', label: t('settings.fontSizes.small') },
    { key: 'medium', label: t('settings.fontSizes.medium') },
    { key: 'large', label: t('settings.fontSizes.large') },
    { key: 'xlarge', label: t('settings.fontSizes.extraLarge') },
  ];

  const ttsSpeeds: { key: TTSSpeed; label: string }[] = [
    { key: 'slow', label: t('settings.ttsSpeeds.slow') },
    { key: 'normal', label: t('settings.ttsSpeeds.normal') },
    { key: 'fast', label: t('settings.ttsSpeeds.fast') },
    { key: 'veryFast', label: t('settings.ttsSpeeds.veryFast') },
  ];

  const handleLanguageChange = async (langCode: string) => {
    await changeLanguage(langCode);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Language Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
        <View style={styles.optionGroup}>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.optionButton,
                i18n.language === lang.code && styles.optionButtonActive,
              ]}
              onPress={() => handleLanguageChange(lang.code)}
            >
              <Text
                style={[
                  styles.optionText,
                  i18n.language === lang.code && styles.optionTextActive,
                ]}
              >
                {lang.localName}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Theme Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.theme')}</Text>
        <View style={styles.optionGroup}>
          {themes.map(({ key, icon }) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.themeButton,
                theme === key && styles.themeButtonActive,
              ]}
              onPress={() => setTheme(key)}
            >
              <Ionicons
                name={icon as any}
                size={24}
                color={theme === key ? colors.surface : colors.text}
              />
              <Text
                style={[
                  styles.themeText,
                  theme === key && styles.themeTextActive,
                ]}
              >
                {t(`settings.themes.${key}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Font Size Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.fontSize')}</Text>
        <View style={styles.fontSizeContainer}>
          {fontSizes.map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.fontSizeButton,
                fontSize === key && styles.fontSizeButtonActive,
              ]}
              onPress={() => setFontSize(key)}
            >
              <Text
                style={[
                  styles.fontSizeLabel,
                  { fontSize: FONT_SIZES[key] * 0.8 },
                  fontSize === key && styles.fontSizeLabelActive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Reading Mode Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.readingMode')}</Text>
        <View style={styles.optionGroup}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              readingMode === 'page' && styles.optionButtonActive,
            ]}
            onPress={() => setReadingMode('page')}
          >
            <Ionicons
              name="document-outline"
              size={20}
              color={readingMode === 'page' ? colors.surface : colors.text}
            />
            <Text
              style={[
                styles.optionText,
                readingMode === 'page' && styles.optionTextActive,
              ]}
            >
              {t('settings.readingModes.page')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.optionButton,
              readingMode === 'scroll' && styles.optionButtonActive,
            ]}
            onPress={() => setReadingMode('scroll')}
          >
            <Ionicons
              name="reader-outline"
              size={20}
              color={readingMode === 'scroll' ? colors.surface : colors.text}
            />
            <Text
              style={[
                styles.optionText,
                readingMode === 'scroll' && styles.optionTextActive,
              ]}
            >
              {t('settings.readingModes.scroll')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* TTS Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.tts')}</Text>

        {/* Auto Play TTS */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>{t('settings.autoPlayTTS')}</Text>
            <Text style={styles.settingDescription}>
              {t('settings.autoPlayTTSDescription')}
            </Text>
          </View>
          <Switch
            value={autoPlayTTS}
            onValueChange={setAutoPlayTTS}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.surface}
          />
        </View>

        {/* Voice Selection */}
        <TouchableOpacity
          style={styles.settingRowButton}
          onPress={() => setVoiceModalVisible(true)}
        >
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>{t('settings.ttsVoice')}</Text>
            <Text style={styles.settingDescription}>
              {getSelectedVoiceName()}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* TTS Speed */}
        <View style={styles.settingRowColumn}>
          <Text style={styles.settingLabel}>{t('settings.ttsSpeed')}</Text>
          <View style={styles.speedContainer}>
            {ttsSpeeds.map(({ key, label }) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.speedButton,
                  ttsSpeed === key && styles.speedButtonActive,
                ]}
                onPress={() => setTTSSpeed(key)}
              >
                <Text
                  style={[
                    styles.speedButtonText,
                    ttsSpeed === key && styles.speedButtonTextActive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Voice Picker Modal */}
      <Modal
        visible={voiceModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setVoiceModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('settings.ttsVoiceSelect')}</Text>
              <TouchableOpacity onPress={() => setVoiceModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {loadingVoices ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <FlatList
                data={[{ identifier: null, name: t('settings.ttsVoiceAuto'), language: '', quality: '' }, ...voices]}
                keyExtractor={(item) => item.identifier || 'auto'}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.voiceItem,
                      (item.identifier === ttsVoiceId || (item.identifier === null && ttsVoiceId === null)) && styles.voiceItemActive,
                    ]}
                    onPress={() => handleVoiceSelect(item.identifier)}
                  >
                    <View style={styles.voiceInfo}>
                      <Text style={styles.voiceName}>{item.name}</Text>
                      {item.language && (
                        <Text style={styles.voiceLanguage}>
                          {item.language} {item.quality ? `(${item.quality})` : ''}
                        </Text>
                      )}
                    </View>
                    {(item.identifier === ttsVoiceId || (item.identifier === null && ttsVoiceId === null)) && (
                      <Ionicons name="checkmark" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.about')}</Text>
        <View style={styles.aboutContainer}>
          <Text style={styles.appName}>The River of God</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 16,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 12,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    optionGroup: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    optionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 6,
    },
    optionButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    optionText: {
      fontSize: 14,
      color: colors.text,
    },
    optionTextActive: {
      color: colors.surface,
      fontWeight: '600',
    },
    themeButton: {
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      minWidth: 80,
    },
    themeButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    themeText: {
      fontSize: 12,
      color: colors.text,
      marginTop: 4,
    },
    themeTextActive: {
      color: colors.surface,
      fontWeight: '600',
    },
    fontSizeContainer: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      overflow: 'hidden',
    },
    fontSizeButton: {
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    fontSizeButtonActive: {
      backgroundColor: colors.primary + '20',
    },
    fontSizeLabel: {
      color: colors.text,
    },
    fontSizeLabelActive: {
      color: colors.primary,
      fontWeight: '600',
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 12,
    },
    settingRowButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 12,
      marginTop: 8,
    },
    settingRowColumn: {
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 12,
      marginTop: 8,
    },
    settingInfo: {
      flex: 1,
      marginRight: 16,
    },
    settingLabel: {
      fontSize: 16,
      color: colors.text,
      marginBottom: 4,
    },
    settingDescription: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    speedContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 12,
    },
    speedButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 16,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    speedButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    speedButtonText: {
      fontSize: 14,
      color: colors.text,
    },
    speedButtonTextActive: {
      color: colors.surface,
      fontWeight: '600',
    },
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '70%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    loadingContainer: {
      padding: 40,
      alignItems: 'center',
    },
    voiceItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
    },
    voiceItemActive: {
      backgroundColor: colors.primary + '15',
    },
    voiceInfo: {
      flex: 1,
    },
    voiceName: {
      fontSize: 16,
      color: colors.text,
    },
    voiceLanguage: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    separator: {
      height: 1,
      backgroundColor: colors.border,
    },
    aboutContainer: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      padding: 24,
      borderRadius: 12,
    },
    appName: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    version: {
      fontSize: 14,
      color: colors.textSecondary,
    },
  });
