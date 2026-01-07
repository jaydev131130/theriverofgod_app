// Web stub for database - uses localStorage for basic persistence
// This is a simplified version for web testing

const DATABASE_NAME = 'theriverofgod-web';

export const initDatabase = async (): Promise<void> => {
  console.log('Web database initialized (localStorage)');
};

export const getDatabase = () => {
  return null;
};

// Book operations - stub for web
export const insertBook = async (book: any): Promise<void> => {
  const books = JSON.parse(localStorage.getItem(`${DATABASE_NAME}-books`) || '[]');
  const existing = books.findIndex((b: any) => b.id === book.id);
  if (existing >= 0) {
    books[existing] = { ...book, updated_at: Date.now() };
  } else {
    books.push({ ...book, created_at: Date.now(), updated_at: Date.now() });
  }
  localStorage.setItem(`${DATABASE_NAME}-books`, JSON.stringify(books));
};

export const getBooks = async (): Promise<any[]> => {
  return JSON.parse(localStorage.getItem(`${DATABASE_NAME}-books`) || '[]');
};

export const getBookById = async (id: string): Promise<any | null> => {
  const books = JSON.parse(localStorage.getItem(`${DATABASE_NAME}-books`) || '[]');
  return books.find((b: any) => b.id === id) || null;
};

// Reading progress - stub
export const updateReadingProgress = async (
  bookId: string,
  chapterId: string,
  position: number
): Promise<void> => {
  const progress = JSON.parse(localStorage.getItem(`${DATABASE_NAME}-progress`) || '{}');
  progress[bookId] = { book_id: bookId, chapter_id: chapterId, position, updated_at: Date.now() };
  localStorage.setItem(`${DATABASE_NAME}-progress`, JSON.stringify(progress));
};

export const getReadingProgress = async (bookId: string): Promise<any | null> => {
  const progress = JSON.parse(localStorage.getItem(`${DATABASE_NAME}-progress`) || '{}');
  return progress[bookId] || null;
};

// Bookmark operations - stub
export const insertBookmark = async (bookmark: any): Promise<number> => {
  const bookmarks = JSON.parse(localStorage.getItem(`${DATABASE_NAME}-bookmarks`) || '[]');
  const id = Date.now();
  bookmarks.push({ ...bookmark, id, created_at: Date.now() });
  localStorage.setItem(`${DATABASE_NAME}-bookmarks`, JSON.stringify(bookmarks));
  return id;
};

export const deleteBookmark = async (id: number): Promise<void> => {
  const bookmarks = JSON.parse(localStorage.getItem(`${DATABASE_NAME}-bookmarks`) || '[]');
  const filtered = bookmarks.filter((b: any) => b.id !== id);
  localStorage.setItem(`${DATABASE_NAME}-bookmarks`, JSON.stringify(filtered));
};

export const getBookmarksByBook = async (bookId: string): Promise<any[]> => {
  const bookmarks = JSON.parse(localStorage.getItem(`${DATABASE_NAME}-bookmarks`) || '[]');
  return bookmarks.filter((b: any) => b.book_id === bookId);
};

// Highlight operations - stub
export const insertHighlight = async (highlight: any): Promise<number> => {
  const highlights = JSON.parse(localStorage.getItem(`${DATABASE_NAME}-highlights`) || '[]');
  const id = Date.now();
  highlights.push({ ...highlight, id, created_at: Date.now() });
  localStorage.setItem(`${DATABASE_NAME}-highlights`, JSON.stringify(highlights));
  return id;
};

export const updateHighlight = async (id: number, updates: any): Promise<void> => {
  const highlights = JSON.parse(localStorage.getItem(`${DATABASE_NAME}-highlights`) || '[]');
  const idx = highlights.findIndex((h: any) => h.id === id);
  if (idx >= 0) {
    highlights[idx] = { ...highlights[idx], ...updates };
    localStorage.setItem(`${DATABASE_NAME}-highlights`, JSON.stringify(highlights));
  }
};

export const deleteHighlight = async (id: number): Promise<void> => {
  const highlights = JSON.parse(localStorage.getItem(`${DATABASE_NAME}-highlights`) || '[]');
  const filtered = highlights.filter((h: any) => h.id !== id);
  localStorage.setItem(`${DATABASE_NAME}-highlights`, JSON.stringify(filtered));
};

export const getHighlightsByBook = async (bookId: string): Promise<any[]> => {
  const highlights = JSON.parse(localStorage.getItem(`${DATABASE_NAME}-highlights`) || '[]');
  return highlights.filter((h: any) => h.book_id === bookId);
};

export const getHighlightsByChapter = async (bookId: string, chapterId: string): Promise<any[]> => {
  const highlights = JSON.parse(localStorage.getItem(`${DATABASE_NAME}-highlights`) || '[]');
  return highlights.filter((h: any) => h.book_id === bookId && h.chapter_id === chapterId);
};
