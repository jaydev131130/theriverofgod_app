import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import {
  useBooksStore,
  useSettingsStore,
  THEME_COLORS,
  FONT_SIZES,
  TTS_SPEEDS,
  type ThemeColors,
} from '../../shared/stores';
import * as ttsService from '../../shared/services/ttsService';
import * as epubService from '../../shared/services/epubService';
import type { MainTabScreenProps } from '../../navigation/types';

type Props = MainTabScreenProps<'Reader'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 50;

export const ReaderScreen: React.FC<Props> = ({ route, navigation }) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const bookId = route.params?.bookId;
  const chapterHref = route.params?.chapterHref;

  // Track chapter navigation with focus effect for tab navigator reliability
  const [targetChapter, setTargetChapter] = useState<string | undefined>(undefined);

  // Update target chapter when params change
  useEffect(() => {
    console.log('[ReaderScreen] params changed - chapterHref:', chapterHref);
    if (chapterHref !== targetChapter) {
      setTargetChapter(chapterHref);
    }
  }, [chapterHref]);

  // Also check params on focus (for tab navigator edge cases)
  useFocusEffect(
    useCallback(() => {
      console.log('[ReaderScreen] focused - chapterHref:', chapterHref);
      if (chapterHref && chapterHref !== targetChapter) {
        setTargetChapter(chapterHref);
      }
    }, [chapterHref, targetChapter])
  );

  const theme = useSettingsStore((state) => state.theme);
  const fontSize = useSettingsStore((state) => state.fontSize);
  const readingMode = useSettingsStore((state) => state.readingMode);
  const ttsVoiceId = useSettingsStore((state) => state.ttsVoiceId);
  const ttsSpeed = useSettingsStore((state) => state.ttsSpeed);
  const colors = THEME_COLORS[theme];
  const fontSizeValue = FONT_SIZES[fontSize];
  const ttsSpeedValue = TTS_SPEEDS[ttsSpeed];

  const books = useBooksStore((state) => state.books);
  const currentBookId = useBooksStore((state) => state.currentBookId);
  const setCurrentBook = useBooksStore((state) => state.setCurrentBook);
  const updateProgress = useBooksStore((state) => state.updateReadingProgress);
  const setBookChapters = useBooksStore((state) => state.setBookChapters);

  const [isLoading, setIsLoading] = useState(true);
  const [epubBase64, setEpubBase64] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showControls, setShowControls] = useState(true); // Visible by default
  const [currentPageText, setCurrentPageText] = useState<string>('');
  const webViewRef = useRef<WebView>(null);

  const activeBookId = bookId || currentBookId;
  const currentBook = books.find((b) => b.id === activeBookId);

  // Touch tracking for gesture detection
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });

  useEffect(() => {
    if (bookId && bookId !== currentBookId) {
      setCurrentBook(bookId);
    }
  }, [bookId, currentBookId, setCurrentBook]);

  // Load EPUB when book changes
  useEffect(() => {
    const loadEpub = async () => {
      if (!currentBook) return;

      setIsLoading(true);
      setLoadError(null);

      try {
        const epubPath = await epubService.getEpubUri(
          currentBook.language,
          currentBook.filePath
        );

        if (!epubPath) {
          setLoadError('EPUB file not found');
          setIsLoading(false);
          return;
        }

        const base64 = await epubService.readEpubAsBase64(epubPath);
        if (base64) {
          setEpubBase64(base64);
        } else {
          setLoadError('Failed to read EPUB file');
        }
      } catch (error) {
        console.error('Failed to load EPUB:', error);
        setLoadError('Failed to load book');
      } finally {
        setIsLoading(false);
      }
    };

    loadEpub();
  }, [currentBook?.id, currentBook?.language, currentBook?.filePath]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        ttsService.stop();
        setIsSpeaking(false);
      };
    }, [])
  );

  const styles = createStyles(colors, fontSizeValue);

  const handlePrevPage = useCallback(() => {
    console.log('handlePrevPage called');
    webViewRef.current?.injectJavaScript(`
      if (window.rendition) {
        window.rendition.prev();
      }
      true;
    `);
  }, []);

  const handleNextPage = useCallback(() => {
    console.log('handleNextPage called');
    webViewRef.current?.injectJavaScript(`
      if (window.rendition) {
        window.rendition.next();
      }
      true;
    `);
  }, []);

  const handleToggleControls = useCallback(() => {
    console.log('handleToggleControls called');
    setShowControls((prev) => !prev);
  }, []);

  // PanResponder for gesture handling
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to horizontal movement
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderGrant: (evt: GestureResponderEvent) => {
        touchStartRef.current = {
          x: evt.nativeEvent.pageX,
          y: evt.nativeEvent.pageY,
          time: Date.now(),
        };
      },
      onPanResponderRelease: (
        evt: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        const { dx, dy } = gestureState;
        const touchDuration = Date.now() - touchStartRef.current.time;

        console.log('PanResponder release:', { dx, dy, touchDuration });

        // Check if it's a tap (small movement, short duration)
        if (Math.abs(dx) < 10 && Math.abs(dy) < 10 && touchDuration < 300) {
          const tapX = evt.nativeEvent.pageX;
          console.log('Tap detected at x:', tapX, 'screenWidth:', SCREEN_WIDTH);

          // Tap zones: left 25% = prev, right 25% = next, center 50% = toggle controls
          if (tapX < SCREEN_WIDTH * 0.25) {
            handlePrevPage();
          } else if (tapX > SCREEN_WIDTH * 0.75) {
            handleNextPage();
          } else {
            handleToggleControls();
          }
        }
        // Check if it's a horizontal swipe
        else if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
          if (dx > 0) {
            console.log('Swipe right - prev page');
            handlePrevPage();
          } else {
            console.log('Swipe left - next page');
            handleNextPage();
          }
        }
      },
    })
  ).current;

  const handleToggleTTS = async () => {
    if (isSpeaking) {
      ttsService.stop();
      setIsSpeaking(false);
    } else {
      // Request current page text from WebView and speak it
      webViewRef.current?.injectJavaScript(`
        (function() {
          var text = '';
          try {
            // Get text from current visible page only
            if (window.rendition && window.rendition.getContents) {
              var contents = window.rendition.getContents();
              if (contents && contents.length > 0 && contents[0].document) {
                text = contents[0].document.body.innerText || '';
              }
            }
            // Fallback: try to get text from iframe directly
            if (!text) {
              var iframe = document.querySelector('#viewer iframe');
              if (iframe && iframe.contentDocument && iframe.contentDocument.body) {
                text = iframe.contentDocument.body.innerText || '';
              }
            }
          } catch(e) {
            console.log('TTS text extraction error:', e);
          }

          if (text && text.trim().length > 0) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'speakPageText', text: text }));
          } else {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ttsError', message: 'No text found on this page' }));
          }
        })();
        true;
      `);
    }
  };

  const handleOpenChapters = () => {
    if (activeBookId) {
      navigation.navigate('ChapterList', { bookId: activeBookId });
    }
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      switch (data.type) {
        case 'ready':
          console.log('WebView ready');
          break;
        case 'debug':
          console.log('WebView Debug:', data.message);
          break;
        case 'toc':
          console.log('TOC received:', data.chapters?.length, 'chapters');
          if (data.chapters && activeBookId) {
            setBookChapters(activeBookId, data.chapters);
          }
          break;
        case 'progress':
          if (activeBookId) {
            updateProgress(activeBookId, data.chapterId || '', data.position || 0);
          }
          break;
        case 'speakPageText':
          console.log('TTS speakPageText received, text length:', data.text?.length || 0);
          if (data.text) {
            setCurrentPageText(data.text);
            setIsSpeaking(true);
            const lang = currentBook?.language || 'en';
            ttsService.speak(data.text, {
              language: lang,
              voice: ttsVoiceId || undefined,
              rate: ttsSpeedValue,
              onDone: () => setIsSpeaking(false),
              onStopped: () => setIsSpeaking(false),
              onError: () => setIsSpeaking(false),
            });
          }
          break;
        case 'ttsError':
          console.error('TTS text extraction failed:', data.message);
          setIsSpeaking(false);
          break;
        case 'error':
          console.error('EPUB error:', data.message);
          setLoadError(data.message);
          break;
      }
    } catch (e) {
      console.error('WebView message error:', e);
    }
  };

  if (!currentBook) {
    return (
      <View style={[styles.emptyContainer, { paddingTop: insets.top }]}>
        <Ionicons name="book-outline" size={80} color={colors.textSecondary} />
        <Text style={styles.emptyText}>{t('reader.noBookSelected')}</Text>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => navigation.navigate('Library')}
        >
          <Text style={styles.selectButtonText}>{t('reader.selectFromLibrary')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={[styles.emptyContainer, { paddingTop: insets.top }]}>
        <Ionicons name="alert-circle-outline" size={80} color={colors.error} />
        <Text style={styles.emptyText}>{loadError}</Text>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => navigation.navigate('Library')}
        >
          <Text style={styles.selectButtonText}>{t('reader.selectFromLibrary')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // EPUB HTML template with epub.js - simplified without touch handlers
  const epubHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <script>
        window.onerror = function(msg, url, line) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: "error",
            message: "JS Error: " + msg + " at " + url + ":" + line
          }));
        };
      </script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/epubjs/dist/epub.min.js"></script>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          -webkit-tap-highlight-color: transparent;
        }
        html, body {
          width: 100%;
          height: 100%;
          overflow: ${readingMode === 'scroll' ? 'auto' : 'hidden'};
          background-color: ${colors.background};
          color: ${colors.text};
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          user-select: none;
        }
        #viewer {
          width: 100%;
          height: 100%;
          position: relative;
          overflow: ${readingMode === 'scroll' ? 'auto' : 'hidden'};
        }
        #viewer iframe {
          width: 100% !important;
          height: 100% !important;
          border: none !important;
        }
        .epub-container {
          overflow: ${readingMode === 'scroll' ? 'auto !important' : 'hidden !important'};
        }
        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
          font-size: 16px;
          color: ${colors.textSecondary};
        }
        .error {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
          font-size: 16px;
          color: #EF4444;
          padding: 20px;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div id="viewer"><div class="loading">Loading book...</div></div>
      <script>
        (function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: "debug",
            message: "JSZip: " + (typeof JSZip !== 'undefined') + ", ePub: " + (typeof ePub !== 'undefined')
          }));

          const epubBase64 = "${epubBase64 || ''}";

          if (!epubBase64) {
            document.getElementById('viewer').innerHTML = '<div class="error">No book data</div>';
            return;
          }

          try {
            const binaryString = atob(epubBase64);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            const arrayBuffer = bytes.buffer;

            document.getElementById('viewer').innerHTML = '';

            const book = ePub(arrayBuffer);

            const isScrollMode = ${readingMode === 'scroll'};
            const rendition = book.renderTo("viewer", {
              width: "100%",
              height: "100%",
              spread: "none",
              flow: isScrollMode ? "scrolled-doc" : "paginated",
              manager: isScrollMode ? "continuous" : "default"
            });

            window.rendition = rendition;
            window.book = book;

            // Apply theme
            rendition.themes.default({
              body: {
                background: "${colors.background}",
                color: "${colors.text}",
                "font-size": "${fontSizeValue}px",
                "line-height": "1.8",
                padding: "20px"
              },
              p: {
                "margin-bottom": "1em"
              },
              h1: {
                color: "${colors.text}",
                "margin-bottom": "0.5em"
              },
              h2: {
                color: "${colors.text}",
                "margin-bottom": "0.5em"
              },
              a: {
                color: "${colors.primary}"
              }
            });

            // Display the book - navigate to specific chapter if provided
            const initialChapter = "${targetChapter || ''}";
            const displayTarget = initialChapter || undefined;

            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: "debug",
              message: "Attempting display with targetChapter: '" + initialChapter + "', displayTarget: " + (displayTarget ? "'" + displayTarget + "'" : "undefined")
            }));

            rendition.display(displayTarget).then(function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: "debug",
                message: "Display success" + (initialChapter ? " at " + initialChapter : " at beginning")
              }));
            }).catch(function(err) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: "error",
                message: "Display failed: " + (err.message || err)
              }));
            });

            // Track location changes
            rendition.on("locationChanged", function(location) {
              try {
                const progress = book.locations.percentageFromCfi(location.start.cfi);
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: "progress",
                  chapterId: location.start.href,
                  position: progress || 0
                }));
              } catch(e) {}
            });

            // Generate locations and extract TOC
            book.ready.then(function() {
              return book.locations.generate(1024);
            }).then(function() {
              // Extract TOC (Table of Contents) from epub.js
              var toc = book.navigation.toc || [];
              var chapters = toc.map(function(item, index) {
                // Clean up title: trim whitespace and normalize spaces
                var rawTitle = item.label || 'Chapter ' + (index + 1);
                var cleanTitle = rawTitle.replace(/\\s+/g, ' ').trim();

                return {
                  id: item.id || 'ch_' + index,
                  title: cleanTitle,
                  href: item.href || ''
                };
              });

              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: "toc",
                chapters: chapters
              }));

              window.ReactNativeWebView.postMessage(JSON.stringify({ type: "ready" }));
            });

          } catch (error) {
            document.getElementById('viewer').innerHTML = '<div class="error">Failed to load book</div>';
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: "error",
              message: "Error: " + (error.message || error)
            }));
          }
        })();
      </script>
    </body>
    </html>
  `;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      ) : (
        <View style={styles.webViewContainer}>
          <WebView
            key={`${readingMode}-${theme}-${fontSize}-${targetChapter || 'default'}`}
            ref={webViewRef}
            source={{ html: epubHtml }}
            style={styles.webView}
            onMessage={handleWebViewMessage}
            javaScriptEnabled
            domStorageEnabled
            allowFileAccess
            allowUniversalAccessFromFileURLs
            mixedContentMode="always"
            originWhitelist={['*']}
            scrollEnabled={readingMode === 'scroll'}
            bounces={readingMode === 'scroll'}
            nestedScrollEnabled={readingMode === 'scroll'}
          />
          {/* Transparent touch overlay for gesture handling - only in page mode */}
          {readingMode === 'page' && (
            <View
              style={styles.touchOverlay}
              {...panResponder.panHandlers}
            />
          )}
        </View>
      )}

      {/* Controls bar - semi-transparent */}
      {showControls && !isLoading && (
        <View style={[styles.controls, { backgroundColor: `${colors.surface}99` }]}>
          <TouchableOpacity style={styles.controlButton} onPress={handlePrevPage}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={handleOpenChapters}>
            <Ionicons name="list-outline" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={handleToggleTTS}>
            <Ionicons
              name={isSpeaking ? 'pause-circle' : 'play-circle'}
              size={24}
              color={isSpeaking ? colors.primary : colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={handleNextPage}>
            <Ionicons name="chevron-forward" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const createStyles = (colors: ThemeColors, fontSize: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    webViewContainer: {
      flex: 1,
      position: 'relative',
      marginBottom: 50, // Space for tab bar
    },
    webView: {
      flex: 1,
      backgroundColor: colors.background,
    },
    touchOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'transparent',
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
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
      backgroundColor: colors.background,
    },
    emptyText: {
      fontSize: 18,
      color: colors.textSecondary,
      marginTop: 16,
      marginBottom: 24,
      textAlign: 'center',
    },
    selectButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 24,
    },
    selectButtonText: {
      color: colors.surface,
      fontSize: 16,
      fontWeight: '600',
    },
    controls: {
      position: 'absolute',
      bottom: 8,  // Just above tab bar
      left: 30,
      right: 30,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      borderRadius: 25,
      paddingVertical: 8,
      paddingHorizontal: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 6,
    },
    controlButton: {
      padding: 8,
      borderRadius: 20,
    },
  });
