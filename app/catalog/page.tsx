'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Navbar from '@/components/Navbar'
import ToastStack, { type Toast } from '@/components/ToastStack'

interface Book {
  id: number
  title: string
  author: string
  isbn: string
  availableCopies: number
  totalCopies: number
}

const PAGE_SIZE = 8

export default function CatalogPage() {
  const router = useRouter()
  const { username, setUsername } = useAuth()

  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [borrowingId, setBorrowingId] = useState<number | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])

  function addToast(message: string, type: 'success' | 'error') {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }

  async function fetchBooks() {
    setLoading(true)
    setFetchError(null)
    try {
      const res = await fetch('/api/books')
      if (res.status === 401) { setUsername(null); router.push('/'); return }
      if (!res.ok) throw new Error('Failed to load books')
      setBooks(await res.json())
    } catch (e: any) {
      setFetchError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!username) { router.push('/'); return }
    fetchBooks()
  }, [username]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { setPage(1) }, [search])

  async function handleBorrow(bookId: number) {
    setBorrowingId(bookId)
    try {
      const res = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  const filtered = books.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase())
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar activeTab="catalog" />

      <main className="flex-1 px-6 py-8 overflow-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Book Catalog</h1>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">Browse and borrow available books</p>
          </div>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by title or author…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-72 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 pl-9 pr-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none transition focus:border-gray-900 dark:focus:border-gray-400 focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-gray-400/10"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-52 text-sm text-gray-400 dark:text-gray-500">
              <svg className="animate-spin w-5 h-5 mr-2 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Loading books…
            </div>
          ) : fetchError ? (
            <div className="flex flex-col items-center justify-center h-52 gap-3">
              <p className="text-sm text-red-500">{fetchError}</p>
              <button onClick={fetchBooks} className="text-xs text-gray-500 dark:text-gray-400 underline underline-offset-2 hover:text-gray-700 dark:hover:text-gray-300">
                Retry
              </button>
            </div>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/50">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Author</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Available</th>
                    <th className="px-5 py-3.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-14 text-sm text-gray-400 dark:text-gray-500">
                        No books match your search
                      </td>
                    </tr>
                  ) : (
                    paginated.map(book => {
                      const avail = Math.min(book.availableCopies, book.totalCopies) > 0
                      const borrowing = borrowingId === book.id
                      return (
                        <tr key={book.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition">
                          <td className="px-5 py-4 font-medium text-gray-900 dark:text-white">{book.title}</td>
                          <td className="px-5 py-4 text-gray-500 dark:text-gray-400">{book.author}</td>
                          <td className="px-5 py-4">
                            <span className={`text-sm font-medium ${avail ? 'text-gray-700 dark:text-gray-300' : 'text-red-500'}`}>
                              {Math.min(book.availableCopies, book.totalCopies)}/{book.totalCopies}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button
                              onClick={() => handleBorrow(book.id)}
                              disabled={!avail || borrowing}
                              className={`rounded-lg px-4 py-2 text-xs font-semibold transition min-w-[80px] ${
                                avail
                                  ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 active:scale-95'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
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

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-800/30">
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {filtered.length} book{filtered.length !== 1 ? 's' : ''}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                      ← Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                      <button
                        key={n}
                        onClick={() => setPage(n)}
                        className={`w-8 h-8 rounded-lg text-xs font-medium border transition ${
                          n === page
                            ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                            : 'text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
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

      <ToastStack toasts={toasts} />
    </div>
  )
}
