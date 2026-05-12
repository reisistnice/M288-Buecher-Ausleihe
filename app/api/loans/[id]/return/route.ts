import { NextRequest, NextResponse } from 'next/server'

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:5068'

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const token = req.cookies.get('token')?.value
const res = await fetch(`${BACKEND}/api/loans/${id}/return`, {
    method: 'PUT',
    cache: 'no-store',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  }
  return NextResponse.json({}, { status: res.status })
}
