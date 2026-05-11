import { NextRequest, NextResponse } from 'next/server'

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:5068'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  const res = await fetch(`${BACKEND}/api/loans/my`, {
    cache: 'no-store',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
