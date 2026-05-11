'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'

export default function RegisterPage() {
  const router = useRouter()
  const { setUsername } = useAuth()

  const [email, setEmail] = useState('')
  const [username, setUsernameInput] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
      })

      const data = await res.json()

      if (res.status === 409) {
        setError('Email or username already taken.')
        return
      }

      if (!res.ok) {
        setError(data.message ?? 'Registration failed.')
        return
      }

      setUsername(data.username)
      router.push('/catalog')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-black dark:bg-indigo-600 rounded-xl mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">BookLender</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Create an account</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/[0.08] rounded-2xl shadow-sm dark:shadow-2xl dark:shadow-black/50 px-8 py-8">

          {error && (
            <div className="mb-5 flex items-start gap-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 rounded-lg px-4 py-3 text-sm">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-xs outline-none transition focus:border-gray-900 dark:focus:border-indigo-500 focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-indigo-500/20 disabled:opacity-50"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={e => setUsernameInput(e.target.value)}
                placeholder="Choose a username"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-xs outline-none transition focus:border-gray-900 dark:focus:border-indigo-500 focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-indigo-500/20 disabled:opacity-50"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Choose a password"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-xs outline-none transition focus:border-gray-900 dark:focus:border-indigo-500 focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-indigo-500/20 disabled:opacity-50"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-black dark:bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-gray-800 dark:hover:bg-indigo-500 active:bg-gray-900 dark:active:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              {loading ? 'Registering…' : 'REGISTER'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link href="/" className="font-medium text-gray-900 dark:text-indigo-400 hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center gap-2">
          <p className="text-xs text-gray-400 dark:text-gray-600">Modul 223 — Bücherausleihe LB · INF23a</p>
        </div>

      </div>
    </div>
  )
}
