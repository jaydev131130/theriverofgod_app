import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'theriverofgod.db';

let db: SQLite.SQLiteDatabase | null = null;

export const initDatabase = async (): Promise<void> => {
  try {
    db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    await createTables();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

const createTables = async (): Promise<void> => {
  if (!db) throw new Error('Database not initialized');

  // Books table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT,
      language TEXT NOT NULL,
      version TEXT,
      is_bundled INTEGER DEFAULT 0,
      is_downloaded INTEGER DEFAULT 0,
      file_path TEXT,
      cover_path TEXT,
      created_at INTEGER,
      updated_at INTEGER
    );
  `);

  // Reading progress table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS reading_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id TEXT NOT NULL,
      chapter_id TEXT,
      position REAL,
      updated_at INTEGER,
      FOREIGN KEY (book_id) REFERENCES books(id)
    );
  `);

  // Bookmarks table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id TEXT NOT NULL,
      chapter_id TEXT NOT NULL,
      position REAL,
      title TEXT,
      created_at INTEGER,
      FOREIGN KEY (book_id) REFERENCES books(id)
    );
  `);

  // Highlights table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS highlights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id TEXT NOT NULL,
      chapter_id TEXT NOT NULL,
      start_offset INTEGER,
      end_offset INTEGER,
      text TEXT,
      color TEXT DEFAULT 'yellow',
      note TEXT,
      created_at INTEGER,
      FOREIGN KEY (book_id) REFERENCES books(id)
    );
  `);

  // Settings table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);
};

export const getDatabase = (): SQLite.SQLiteDatabase => {
  if (!db) throw new Error('Database not initialized');
  return db;
};

// Book operations
export const insertBook = async (book: {
  id: string;
  title: string;
  author?: string;
  language: string;
  version?: string;
  isBundled?: boolean;
  isDownloaded?: boolean;
  filePath?: string;
  coverPath?: string;
}): Promise<void> => {
  if (!db) throw new Error('Database not initialized');

  const now = Date.now();
  await db.runAsync(
    `INSERT OR REPLACE INTO books (id, title, author, language, version, is_bundled, is_downloaded, file_path, cover_path, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      book.id,
      book.title,
      book.author || null,
      book.language,
      book.version || null,
      book.isBundled ? 1 : 0,
      book.isDownloaded ? 1 : 0,
      book.filePath || null,
      book.coverPath || null,
      now,
      now,
    ]
  );
};

export const getBooks = async (): Promise<any[]> => {
  if (!db) throw new Error('Database not initialized');
  return await db.getAllAsync('SELECT * FROM books ORDER BY updated_at DESC');
};

export const getBookById = async (id: string): Promise<any | null> => {
  if (!db) throw new Error('Database not initialized');
  const result = await db.getFirstAsync('SELECT * FROM books WHERE id = ?', [id]);
  return result || null;
};

// Reading progress operations
export const updateReadingProgress = async (
  bookId: string,
  chapterId: string,
  position: number
): Promise<void> => {
  if (!db) throw new Error('Database not initialized');

  const existing = await db.getFirstAsync(
    'SELECT id FROM reading_progress WHERE book_id = ?',
    [bookId]
  );

  if (existing) {
    await db.runAsync(
      'UPDATE reading_progress SET chapter_id = ?, position = ?, updated_at = ? WHERE book_id = ?',
      [chapterId, position, Date.now(), bookId]
    );
  } else {
    await db.runAsync(
      'INSERT INTO reading_progress (book_id, chapter_id, position, updated_at) VALUES (?, ?, ?, ?)',
      [bookId, chapterId, position, Date.now()]
    );
  }
};

export const getReadingProgress = async (bookId: string): Promise<any | null> => {
  if (!db) throw new Error('Database not initialized');
  const result = await db.getFirstAsync(
    'SELECT * FROM reading_progress WHERE book_id = ?',
    [bookId]
  );
  return result || null;
};

// Bookmark operations
export const insertBookmark = async (bookmark: {
  bookId: string;
  chapterId: string;
  position: number;
  title?: string;
}): Promise<number> => {
  if (!db) throw new Error('Database not initialized');

  const result = await db.runAsync(
    'INSERT INTO bookmarks (book_id, chapter_id, position, title, created_at) VALUES (?, ?, ?, ?, ?)',
    [bookmark.bookId, bookmark.chapterId, bookmark.position, bookmark.title || null, Date.now()]
  );
  return result.lastInsertRowId;
};

export const deleteBookmark = async (id: number): Promise<void> => {
  if (!db) throw new Error('Database not initialized');
  await db.runAsync('DELETE FROM bookmarks WHERE id = ?', [id]);
};

export const getBookmarksByBook = async (bookId: string): Promise<any[]> => {
  if (!db) throw new Error('Database not initialized');
  return await db.getAllAsync(
    'SELECT * FROM bookmarks WHERE book_id = ? ORDER BY created_at DESC',
    [bookId]
  );
};

// Highlight operations
export const insertHighlight = async (highlight: {
  bookId: string;
  chapterId: string;
  startOffset: number;
  endOffset: number;
  text: string;
  color?: string;
  note?: string;
}): Promise<number> => {
  if (!db) throw new Error('Database not initialized');

  const result = await db.runAsync(
    `INSERT INTO highlights (book_id, chapter_id, start_offset, end_offset, text, color, note, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      highlight.bookId,
      highlight.chapterId,
      highlight.startOffset,
      highlight.endOffset,
      highlight.text,
      highlight.color || 'yellow',
      highlight.note || null,
      Date.now(),
    ]
  );
  return result.lastInsertRowId;
};

export const updateHighlight = async (
  id: number,
  updates: { color?: string; note?: string }
): Promise<void> => {
  if (!db) throw new Error('Database not initialized');

  const setClause: string[] = [];
  const params: any[] = [];

  if (updates.color !== undefined) {
    setClause.push('color = ?');
    params.push(updates.color);
  }
  if (updates.note !== undefined) {
    setClause.push('note = ?');
    params.push(updates.note);
  }

  if (setClause.length > 0) {
    params.push(id);
    await db.runAsync(
      `UPDATE highlights SET ${setClause.join(', ')} WHERE id = ?`,
      params
    );
  }
};

export const deleteHighlight = async (id: number): Promise<void> => {
  if (!db) throw new Error('Database not initialized');
  await db.runAsync('DELETE FROM highlights WHERE id = ?', [id]);
};

export const getHighlightsByBook = async (bookId: string): Promise<any[]> => {
  if (!db) throw new Error('Database not initialized');
  return await db.getAllAsync(
    'SELECT * FROM highlights WHERE book_id = ? ORDER BY created_at DESC',
    [bookId]
  );
};

export const getHighlightsByChapter = async (
  bookId: string,
  chapterId: string
): Promise<any[]> => {
  if (!db) throw new Error('Database not initialized');
  return await db.getAllAsync(
    'SELECT * FROM highlights WHERE book_id = ? AND chapter_id = ? ORDER BY start_offset',
    [bookId, chapterId]
  );
};
