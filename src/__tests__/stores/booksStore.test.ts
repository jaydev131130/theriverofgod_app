import { useBooksStore } from '../../shared/stores/booksStore';

describe('BooksStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useBooksStore.setState({
      books: [],
      currentBookId: null,
      readingProgress: {},
      bookChapters: {},
    });
  });

  describe('addBook', () => {
    it('should add a new book to the store', () => {
      const { addBook, books } = useBooksStore.getState();

      addBook({
        id: 'test-book-1',
        title: 'Test Book',
        author: 'Test Author',
        language: 'en',
        version: '1.0',
        isDownloaded: true,
      });

      const updatedBooks = useBooksStore.getState().books;
      expect(updatedBooks).toHaveLength(1);
      expect(updatedBooks[0].id).toBe('test-book-1');
      expect(updatedBooks[0].title).toBe('Test Book');
      expect(updatedBooks[0].author).toBe('Test Author');
      expect(updatedBooks[0].createdAt).toBeDefined();
      expect(updatedBooks[0].updatedAt).toBeDefined();
    });

    it('should add multiple books', () => {
      const { addBook } = useBooksStore.getState();

      addBook({
        id: 'book-1',
        title: 'Book 1',
        author: 'Author 1',
        language: 'en',
        version: '1.0',
        isDownloaded: true,
      });

      addBook({
        id: 'book-2',
        title: 'Book 2',
        author: 'Author 2',
        language: 'ko',
        version: '1.0',
        isDownloaded: false,
      });

      const { books } = useBooksStore.getState();
      expect(books).toHaveLength(2);
    });
  });

  describe('updateBook', () => {
    it('should update an existing book', () => {
      const { addBook, updateBook } = useBooksStore.getState();

      addBook({
        id: 'test-book',
        title: 'Original Title',
        author: 'Author',
        language: 'en',
        version: '1.0',
        isDownloaded: false,
      });

      updateBook('test-book', { title: 'Updated Title', isDownloaded: true });

      const { books } = useBooksStore.getState();
      expect(books[0].title).toBe('Updated Title');
      expect(books[0].isDownloaded).toBe(true);
    });

    it('should not modify other books', () => {
      const { addBook, updateBook } = useBooksStore.getState();

      addBook({
        id: 'book-1',
        title: 'Book 1',
        author: 'Author',
        language: 'en',
        version: '1.0',
        isDownloaded: false,
      });

      addBook({
        id: 'book-2',
        title: 'Book 2',
        author: 'Author',
        language: 'ko',
        version: '1.0',
        isDownloaded: false,
      });

      updateBook('book-1', { title: 'Updated Book 1' });

      const { books } = useBooksStore.getState();
      expect(books[0].title).toBe('Updated Book 1');
      expect(books[1].title).toBe('Book 2');
    });
  });

  describe('removeBook', () => {
    it('should remove a book from the store', () => {
      const { addBook, removeBook } = useBooksStore.getState();

      addBook({
        id: 'test-book',
        title: 'Test Book',
        author: 'Author',
        language: 'en',
        version: '1.0',
        isDownloaded: true,
      });

      removeBook('test-book');

      const { books } = useBooksStore.getState();
      expect(books).toHaveLength(0);
    });

    it('should clear currentBookId if removed book was current', () => {
      const { addBook, setCurrentBook, removeBook } = useBooksStore.getState();

      addBook({
        id: 'test-book',
        title: 'Test Book',
        author: 'Author',
        language: 'en',
        version: '1.0',
        isDownloaded: true,
      });

      setCurrentBook('test-book');
      expect(useBooksStore.getState().currentBookId).toBe('test-book');

      removeBook('test-book');
      expect(useBooksStore.getState().currentBookId).toBeNull();
    });
  });

  describe('setCurrentBook', () => {
    it('should set the current book', () => {
      const { addBook, setCurrentBook } = useBooksStore.getState();

      addBook({
        id: 'test-book',
        title: 'Test Book',
        author: 'Author',
        language: 'en',
        version: '1.0',
        isDownloaded: true,
      });

      setCurrentBook('test-book');
      expect(useBooksStore.getState().currentBookId).toBe('test-book');
    });

    it('should allow setting to null', () => {
      const { setCurrentBook } = useBooksStore.getState();

      setCurrentBook('some-id');
      setCurrentBook(null);

      expect(useBooksStore.getState().currentBookId).toBeNull();
    });
  });

  describe('updateReadingProgress', () => {
    it('should update reading progress for a book', () => {
      const { updateReadingProgress } = useBooksStore.getState();

      updateReadingProgress('book-1', 'chapter-1', 0.5);

      const { readingProgress } = useBooksStore.getState();
      expect(readingProgress['book-1']).toBeDefined();
      expect(readingProgress['book-1'].chapterId).toBe('chapter-1');
      expect(readingProgress['book-1'].position).toBe(0.5);
      expect(readingProgress['book-1'].updatedAt).toBeDefined();
    });

    it('should overwrite previous progress', () => {
      const { updateReadingProgress } = useBooksStore.getState();

      updateReadingProgress('book-1', 'chapter-1', 0.3);
      updateReadingProgress('book-1', 'chapter-2', 0.7);

      const { readingProgress } = useBooksStore.getState();
      expect(readingProgress['book-1'].chapterId).toBe('chapter-2');
      expect(readingProgress['book-1'].position).toBe(0.7);
    });
  });

  describe('getBook', () => {
    it('should return a book by id', () => {
      const { addBook, getBook } = useBooksStore.getState();

      addBook({
        id: 'test-book',
        title: 'Test Book',
        author: 'Author',
        language: 'en',
        version: '1.0',
        isDownloaded: true,
      });

      const book = useBooksStore.getState().getBook('test-book');
      expect(book).toBeDefined();
      expect(book?.title).toBe('Test Book');
    });

    it('should return undefined for non-existent book', () => {
      const book = useBooksStore.getState().getBook('non-existent');
      expect(book).toBeUndefined();
    });
  });

  describe('getCurrentBook', () => {
    it('should return the current book', () => {
      const { addBook, setCurrentBook } = useBooksStore.getState();

      addBook({
        id: 'test-book',
        title: 'Test Book',
        author: 'Author',
        language: 'en',
        version: '1.0',
        isDownloaded: true,
      });

      setCurrentBook('test-book');

      const currentBook = useBooksStore.getState().getCurrentBook();
      expect(currentBook).toBeDefined();
      expect(currentBook?.id).toBe('test-book');
    });

    it('should return undefined when no book is selected', () => {
      const currentBook = useBooksStore.getState().getCurrentBook();
      expect(currentBook).toBeUndefined();
    });
  });

  describe('Chapter Management', () => {
    const mockChapters = [
      { id: 'ch1', title: 'Preface', href: 'preface.xhtml' },
      { id: 'ch2', title: 'Chapter 1: Introduction', href: 'chapter1.xhtml' },
      { id: 'ch3', title: 'Chapter 2: Main Content', href: 'chapter2.xhtml' },
      { id: 'ch4', title: 'Conclusion', href: 'conclusion.xhtml' },
    ];

    describe('setBookChapters', () => {
      it('should store chapters for a book', () => {
        const { setBookChapters } = useBooksStore.getState();

        setBookChapters('book-1', mockChapters);

        const { bookChapters } = useBooksStore.getState();
        expect(bookChapters['book-1']).toEqual(mockChapters);
      });

      it('should store chapters for multiple books independently', () => {
        const { setBookChapters } = useBooksStore.getState();

        const book1Chapters = [
          { id: 'b1-ch1', title: 'Book 1 Chapter 1', href: 'b1-ch1.xhtml' },
        ];
        const book2Chapters = [
          { id: 'b2-ch1', title: 'Book 2 Chapter 1', href: 'b2-ch1.xhtml' },
          { id: 'b2-ch2', title: 'Book 2 Chapter 2', href: 'b2-ch2.xhtml' },
        ];

        setBookChapters('book-1', book1Chapters);
        setBookChapters('book-2', book2Chapters);

        const { bookChapters } = useBooksStore.getState();
        expect(bookChapters['book-1']).toHaveLength(1);
        expect(bookChapters['book-2']).toHaveLength(2);
      });

      it('should overwrite previous chapters for the same book', () => {
        const { setBookChapters } = useBooksStore.getState();

        setBookChapters('book-1', [{ id: 'old', title: 'Old', href: 'old.xhtml' }]);
        setBookChapters('book-1', mockChapters);

        const { bookChapters } = useBooksStore.getState();
        expect(bookChapters['book-1']).toEqual(mockChapters);
        expect(bookChapters['book-1']).not.toContainEqual({ id: 'old', title: 'Old', href: 'old.xhtml' });
      });
    });

    describe('getBookChapters', () => {
      it('should return chapters for a book', () => {
        const { setBookChapters, getBookChapters } = useBooksStore.getState();

        setBookChapters('book-1', mockChapters);

        const chapters = useBooksStore.getState().getBookChapters('book-1');
        expect(chapters).toEqual(mockChapters);
        expect(chapters).toHaveLength(4);
      });

      it('should return empty array for book with no chapters', () => {
        const chapters = useBooksStore.getState().getBookChapters('non-existent-book');
        expect(chapters).toEqual([]);
        expect(chapters).toHaveLength(0);
      });

      it('should return correct chapter data', () => {
        const { setBookChapters } = useBooksStore.getState();

        setBookChapters('book-1', mockChapters);

        const chapters = useBooksStore.getState().getBookChapters('book-1');
        expect(chapters[0]).toHaveProperty('id', 'ch1');
        expect(chapters[0]).toHaveProperty('title', 'Preface');
        expect(chapters[0]).toHaveProperty('href', 'preface.xhtml');
      });
    });

    describe('Chapter Navigation (PRD F1: EPUB Reader)', () => {
      it('should support chapter href for navigation', () => {
        const { setBookChapters } = useBooksStore.getState();

        setBookChapters('book-1', mockChapters);

        const chapters = useBooksStore.getState().getBookChapters('book-1');

        // Each chapter should have a valid href for navigation
        chapters.forEach((chapter) => {
          expect(chapter.href).toBeTruthy();
          expect(chapter.href).toMatch(/\.xhtml$/);
        });
      });

      it('should preserve chapter order', () => {
        const { setBookChapters } = useBooksStore.getState();

        setBookChapters('book-1', mockChapters);

        const chapters = useBooksStore.getState().getBookChapters('book-1');
        expect(chapters[0].title).toBe('Preface');
        expect(chapters[1].title).toBe('Chapter 1: Introduction');
        expect(chapters[2].title).toBe('Chapter 2: Main Content');
        expect(chapters[3].title).toBe('Conclusion');
      });
    });
  });
});
