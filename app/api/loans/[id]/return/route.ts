import { NextRequest, NextResponse } from 'next/server'

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:5068'

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const authHeader = req.headers.get('authorization')
  const res = await fetch(`${BACKEND}/api/loans/${id}/return`, {
    method: 'PUT',
    cache: 'no-store',
    headers: authHeader ? { Authorization: authHeader } : {},
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
