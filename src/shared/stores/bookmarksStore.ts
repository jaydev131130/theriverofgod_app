import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Bookmark {
  id: string;
  bookId: string;
  chapterId: string;
  position: number;
  title?: string;
  createdAt: number;
}

export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink';

export interface Highlight {
  id: string;
  bookId: string;
  chapterId: string;
  startOffset: number;
  endOffset: number;
  text: string;
  color: HighlightColor;
  note?: string;
  createdAt: number;
}

interface BookmarksState {
  bookmarks: Bookmark[];
  highlights: Highlight[];

  // Bookmark actions
  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => void;
  removeBookmark: (id: string) => void;
  getBookmarksByBook: (bookId: string) => Bookmark[];

  // Highlight actions
  addHighlight: (highlight: Omit<Highlight, 'id' | 'createdAt'>) => void;
  updateHighlight: (id: string, updates: Partial<Highlight>) => void;
  removeHighlight: (id: string) => void;
  getHighlightsByBook: (bookId: string) => Highlight[];
  getHighlightsByChapter: (bookId: string, chapterId: string) => Highlight[];
}

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const useBookmarksStore = create<BookmarksState>()(
  persist(
    (set, get) => ({
      bookmarks: [],
      highlights: [],

      // Bookmark actions
      addBookmark: (bookmark) =>
        set((state) => ({
          bookmarks: [
            ...state.bookmarks,
            {
              ...bookmark,
              id: generateId(),
              createdAt: Date.now(),
            },
          ],
        })),

      removeBookmark: (id) =>
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => b.id !== id),
        })),

      getBookmarksByBook: (bookId) =>
        get().bookmarks.filter((b) => b.bookId === bookId),

      // Highlight actions
      addHighlight: (highlight) =>
        set((state) => ({
          highlights: [
            ...state.highlights,
            {
              ...highlight,
              id: generateId(),
              createdAt: Date.now(),
            },
          ],
        })),

      updateHighlight: (id, updates) =>
        set((state) => ({
          highlights: state.highlights.map((h) =>
            h.id === id ? { ...h, ...updates } : h
          ),
        })),

      removeHighlight: (id) =>
        set((state) => ({
          highlights: state.highlights.filter((h) => h.id !== id),
        })),

      getHighlightsByBook: (bookId) =>
        get().highlights.filter((h) => h.bookId === bookId),

      getHighlightsByChapter: (bookId, chapterId) =>
        get().highlights.filter(
          (h) => h.bookId === bookId && h.chapterId === chapterId
        ),
    }),
    {
      name: 'bookmarks-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Highlight color values
export const HIGHLIGHT_COLORS: Record<HighlightColor, string> = {
  yellow: '#FFEB3B',
  green: '#4CAF50',
  blue: '#2196F3',
  pink: '#E91E63',
};
