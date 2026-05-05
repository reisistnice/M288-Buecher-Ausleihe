import { NextResponse } from 'next/server'

const MOCK_BOOKS = [
  { id: 1, title: 'Clean Code', author: 'Robert C. Martin', total_copies: 3, available_copies: 3 },
  { id: 2, title: 'The Pragmatic Programmer', author: 'Hunt & Thomas', total_copies: 2, available_copies: 2 },
  { id: 3, title: 'Design Patterns', author: 'Gang of Four', total_copies: 1, available_copies: 0 },
  { id: 4, title: 'Refactoring', author: 'Martin Fowler', total_copies: 2, available_copies: 1 },
  { id: 5, title: "You Don't Know JS", author: 'Kyle Simpson', total_copies: 3, available_copies: 3 },
]

export async function GET() {
  return NextResponse.json(MOCK_BOOKS)
}
