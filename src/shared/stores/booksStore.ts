import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Book {
  id: string;
  title: string;
  author: string;
  language: string;
  version: string;
  coverPath?: string;
  filePath?: string;
  isDownloaded: boolean;
  downloadProgress?: number;
  createdAt: number;
  updatedAt: number;
}

export interface ReadingProgress {
  bookId: string;
  chapterId: string;
  position: number; // 0.0 ~ 1.0
  updatedAt: number;
}

export interface Chapter {
  id: string;
  title: string;
  href: string;
}

interface BooksState {
  books: Book[];
  currentBookId: string | null;
  readingProgress: Record<string, ReadingProgress>;
  bookChapters: Record<string, Chapter[]>;

  // Actions
  loadBooks: () => void;
  addBook: (book: Omit<Book, 'createdAt' | 'updatedAt'>) => void;
  updateBook: (id: string, updates: Partial<Book>) => void;
  removeBook: (id: string) => void;
  setCurrentBook: (id: string | null) => void;
  updateReadingProgress: (bookId: string, chapterId: string, position: number) => void;
  setBookChapters: (bookId: string, chapters: Chapter[]) => void;
  getBookChapters: (bookId: string) => Chapter[];
  getBook: (id: string) => Book | undefined;
  getCurrentBook: () => Book | undefined;
}

export const useBooksStore = create<BooksState>()(
  persist(
    (set, get) => ({
      books: [],
      currentBookId: null,
      readingProgress: {},
      bookChapters: {},

      loadBooks: () => {
        // Books are automatically loaded from AsyncStorage via persist middleware
        // This method exists for explicit refresh if needed
      },

      addBook: (book) => {
        const now = Date.now();
        set((state) => ({
          books: [
            ...state.books,
            {
              ...book,
              createdAt: now,
              updatedAt: now,
            },
          ],
        }));
      },

      updateBook: (id, updates) =>
        set((state) => ({
          books: state.books.map((book) =>
            book.id === id ? { ...book, ...updates, updatedAt: Date.now() } : book
          ),
        })),

      removeBook: (id) =>
        set((state) => ({
          books: state.books.filter((book) => book.id !== id),
          currentBookId: state.currentBookId === id ? null : state.currentBookId,
        })),

      setCurrentBook: (id) => set({ currentBookId: id }),

      updateReadingProgress: (bookId, chapterId, position) =>
        set((state) => ({
          readingProgress: {
            ...state.readingProgress,
            [bookId]: {
              bookId,
              chapterId,
              position,
              updatedAt: Date.now(),
            },
          },
        })),

      setBookChapters: (bookId, chapters) =>
        set((state) => ({
          bookChapters: {
            ...state.bookChapters,
            [bookId]: chapters,
          },
        })),

      getBookChapters: (bookId) => get().bookChapters[bookId] || [],

      getBook: (id) => get().books.find((book) => book.id === id),

      getCurrentBook: () => {
        const { books, currentBookId } = get();
        return currentBookId ? books.find((book) => book.id === currentBookId) : undefined;
      },
    }),
    {
      name: 'books-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
