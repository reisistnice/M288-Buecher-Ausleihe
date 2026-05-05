'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

interface Book {
  id: number
  title: string
  author: string
  total_copies: number
  available_copies: number
}

interface Toast {
  id: number
  message: string
  type: 'success' | 'error'
}

const PAGE_SIZE = 8

function decodeUsername(token: string): string {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return payload.username ?? ''
  } catch {
    return ''
  }
}

export default function CatalogPage() {
  const router = useRouter()
  const { token, setToken } = useAuth()

  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [borrowingId, setBorrowingId] = useState<number | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])

  const username = token ? decodeUsername(token) : ''

  function addToast(message: string, type: 'success' | 'error') {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }

  async function fetchBooks() {
    setLoading(true)
    setFetchError(null)
    try {
      const res = await fetch('/api/books', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.status === 401) { setToken(null); router.push('/'); return }
      if (!res.ok) throw new Error('Failed to load books')
      setBooks(await res.json())
    } catch (e: any) {
      setFetchError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!token) { router.push('/'); return }
    fetchBooks()
  }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { setPage(1) }, [search])

  async function handleBorrow(bookId: number) {
    setBorrowingId(bookId)
    try {
      const res = await fetch('/api/loans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookId }),
      })
      if (res.status === 409) { addToast('No copies available', 'error'); return }
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        addToast(d.message ?? 'Borrow failed', 'error')
        return
      }
      addToast('Book borrowed', 'success')
      await fetchBooks()
    } catch {
      addToast('Network error', 'error')
    } finally {
      setBorrowingId(null)
    }
  }

  function handleLogout() {
    setToken(null)
    router.push('/')
  }

  const filtered = books.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase())
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 h-16 flex items-center justify-between sticky top-0 z-10">
        <span className="text-sm font-bold tracking-widest text-gray-900 uppercase select-none">
          BookLender
        </span>
        <div className="flex gap-1">
          {[
            { label: 'Catalog', href: '/catalog', active: true },
            { label: 'My Loans', href: '/loans', active: false },
          ].map(({ label, href, active }) => (
            <button
              key={label}
              onClick={() => router.push(href)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                active
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {username && (
            <span className="text-sm text-gray-500 font-medium">{username}</span>
          )}
          <button
            onClick={handleLogout}
            className="rounded-lg border border-gray-200 px-3.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-8">

        {/* Page header + search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Book Catalog</h1>
            <p className="text-sm text-gray-400 mt-0.5">Browse and borrow available books</p>
          </div>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by title or author…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-72 rounded-lg border border-gray-300 bg-white pl-9 pr-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
            />
          </div>
        </div>

        {/* Table card */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-52 text-sm text-gray-400">
              <svg className="animate-spin w-5 h-5 mr-2 text-gray-300" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Loading books…
            </div>
          ) : fetchError ? (
            <div className="flex flex-col items-center justify-center h-52 gap-3">
              <p className="text-sm text-red-500">{fetchError}</p>
              <button
                onClick={fetchBooks}
                className="text-xs text-gray-500 underline underline-offset-2 hover:text-gray-700"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/70">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Author</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Available</th>
                    <th className="px-5 py-3.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-14 text-sm text-gray-400">
                        No books match your search
                      </td>
                    </tr>
                  ) : (
                    paginated.map(book => {
                      const avail = book.available_copies > 0
                      const borrowing = borrowingId === book.id
                      return (
                        <tr key={book.id} className="hover:bg-gray-50/60 transition">
                          <td className="px-5 py-4 font-medium text-gray-900">{book.title}</td>
                          <td className="px-5 py-4 text-gray-500">{book.author}</td>
                          <td className="px-5 py-4">
                            <span className={`text-sm font-medium ${avail ? 'text-gray-700' : 'text-red-500'}`}>
                              {book.available_copies}
                              <span className="text-gray-400 font-normal"> / {book.total_copies}</span>
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button
                              onClick={() => handleBorrow(book.id)}
                              disabled={!avail || borrowing}
                              className={`rounded-lg px-4 py-2 text-xs font-semibold transition min-w-[80px] ${
                                avail
                                  ? 'bg-black text-white hover:bg-gray-800 active:scale-95'
                                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              } disabled:opacity-60`}
                            >
                              {borrowing ? 'Borrowing…' : 'BORROW'}
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/40">
                  <span className="text-xs text-gray-400">
                    {filtered.length} book{filtered.length !== 1 ? 's' : ''}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 border border-gray-200 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                      ← Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                      <button
                        key={n}
                        onClick={() => setPage(n)}
                        className={`w-8 h-8 rounded-lg text-xs font-medium border transition ${
                          n === page
                            ? 'bg-black text-white border-black'
                            : 'text-gray-600 border-gray-200 hover:bg-white'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 border border-gray-200 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Toast stack */}
      <div className="fixed bottom-5 right-5 flex flex-col gap-2 z-50 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm shadow-lg border pointer-events-auto animate-in fade-in slide-in-from-bottom-2 ${
              t.type === 'error'
                ? 'bg-white border-red-200 text-red-700'
                : 'bg-white border-green-200 text-green-700'
            }`}
          >
            {t.type === 'error' ? (
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
            )}
            {t.message}
          </div>
        ))}
      </div>
    </div>
  )
}
