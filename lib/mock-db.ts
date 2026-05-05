export interface MockBook {
  id: number
  title: string
  author: string
  isbn: string
  total_copies: number
  available_copies: number
}

export interface MockLoan {
  id: number
  bookId: number
  userId: number
  borrowedAt: string
}

export const mockBooks: MockBook[] = [
  { id: 1, title: 'Clean Code',               author: 'Robert C. Martin', isbn: '978-0-13-235088-4', total_copies: 3, available_copies: 2 },
  { id: 2, title: 'The Pragmatic Programmer', author: 'Hunt & Thomas',    isbn: '978-0-13-595705-9', total_copies: 2, available_copies: 1 },
  { id: 3, title: 'Design Patterns',          author: 'Gang of Four',     isbn: '978-0-20-163361-5', total_copies: 1, available_copies: 0 },
  { id: 4, title: 'Refactoring',              author: 'Martin Fowler',    isbn: '978-0-13-468599-1', total_copies: 2, available_copies: 1 },
  { id: 5, title: "You Don't Know JS",        author: 'Kyle Simpson',     isbn: '978-1-49-190518-0', total_copies: 3, available_copies: 3 },
]

export const mockLoans: MockLoan[] = [
  { id: 1, bookId: 1, userId: 1, borrowedAt: new Date(Date.now() - 7 * 86400000).toISOString() },
  { id: 2, bookId: 2, userId: 1, borrowedAt: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 3, bookId: 4, userId: 2, borrowedAt: new Date(Date.now() - 1 * 86400000).toISOString() },
  { id: 4, bookId: 3, userId: 3, borrowedAt: new Date(Date.now() - 5 * 86400000).toISOString() },
]

let nextLoanId = 10

export class MockDb {
  static getBooks(): MockBook[] {
    return mockBooks
  }

  static getLoansByUser(userId: number): Array<MockLoan & { book: MockBook }> {
    return mockLoans
      .filter(l => l.userId === userId)
      .map(l => ({ ...l, book: mockBooks.find(b => b.id === l.bookId)! }))
      .filter(l => l.book)
  }

  static borrow(bookId: number, userId: number): MockLoan | null {
    const book = mockBooks.find(b => b.id === bookId)
    if (!book || book.available_copies <= 0) return null
    book.available_copies--
    const loan: MockLoan = { id: nextLoanId++, bookId, userId, borrowedAt: new Date().toISOString() }
    mockLoans.push(loan)
    return loan
  }

  static return(loanId: number, userId: number): boolean {
    const idx = mockLoans.findIndex(l => l.id === loanId && l.userId === userId)
    if (idx === -1) return false
    const book = mockBooks.find(b => b.id === mockLoans[idx].bookId)
    if (book) book.available_copies++
    mockLoans.splice(idx, 1)
    return true
  }
}
