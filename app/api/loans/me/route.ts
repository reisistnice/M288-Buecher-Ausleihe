import { NextRequest, NextResponse } from 'next/server'
import { MockDb } from '@/lib/mock-db'
import { decodeUserId } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1]
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const userId = decodeUserId(token)
  if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const loans = MockDb.getLoansByUser(userId).map(l => ({
    id: l.id,
    bookTitle: l.book.title,
    isbn: l.book.isbn,
    borrowedAt: l.borrowedAt,
  }))

  return NextResponse.json(loans)
}
