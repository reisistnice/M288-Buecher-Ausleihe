import { NextRequest, NextResponse } from 'next/server'

const MOCK_USERS = [
  { id: 1, username: 'user1', password: 'pass123' },
  { id: 2, username: 'user2', password: 'pass123' },
  { id: 3, username: 'user3', password: 'pass123' },
]

function b64url(obj: object): string {
  return Buffer.from(JSON.stringify(obj))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function makeMockJwt(userId: number, username: string): string {
  const header = b64url({ alg: 'none', typ: 'JWT' })
  const payload = b64url({ userId, username, iat: Math.floor(Date.now() / 1000) })
  return `${header}.${payload}.mock`
}

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()

  const user = MOCK_USERS.find(u => u.username === username && u.password === password)

  if (!user) {
    return NextResponse.json({ message: 'Invalid username or password' }, { status: 401 })
  }

  return NextResponse.json({ token: makeMockJwt(user.id, user.username) })
}
