import { NextRequest, NextResponse } from 'next/server'
import { MockDb } from '@/lib/mock-db'
import { decodeUserId } from '@/lib/utils'

export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
  const token = req.headers.get('authorization')?.split(' ')[1]
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const userId = decodeUserId(token)
  if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const { id } = await context.params
  const loanId = parseInt(id, 10)

  const ok = MockDb.return(loanId, userId)

  if (!ok) {
    return NextResponse.json({ message: 'Loan not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}