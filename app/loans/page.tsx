'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { LoanService, type Loan } from '@/lib/loan-service'
import { formatDate } from '@/lib/utils'
import Navbar from '@/components/Navbar'
import ToastStack, { type Toast } from '@/components/ToastStack'

export default function LoansPage() {
  const router = useRouter()
  const { username, token, setUsername } = useAuth()

  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [returningId, setReturningId] = useState<number | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])

  function addToast(message: string, type: 'success' | 'error') {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }

  async function fetchLoans() {
    if (!username) return
    setLoading(true)
    setFetchError(null)
    try {
      setLoans(await LoanService.fetchMyLoans())
    } catch (e: any) {
      if (e.message === 'UNAUTHORIZED') { setUsername(null); router.push('/'); return }
      setFetchError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!username) { router.push('/'); return }
    fetchLoans()
  }, [username]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleReturn(loanId: number) {
    if (!username) return
    setReturningId(loanId)
    try {
      await LoanService.returnLoan(loanId, token)
      setLoans(prev => prev.filter(l => l.id !== loanId))
      addToast('Book returned', 'success')
    } catch (e: any) {
      if (e.message === 'UNAUTHORIZED') { setUsername(null); router.push('/'); return }
      addToast(e.message, 'error')
    } finally {
      setReturningId(null)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar activeTab="loans" />

      <main className="flex-1 px-6 py-8 overflow-auto">

        {/* Page header with loan count badge */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">My Loans</h1>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">Your currently borrowed books</p>
          </div>
          {!loading && !fetchError && (
            <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5">
              <span className="text-sm text-gray-500 dark:text-gray-400">Active loans</span>
              <span className={`text-sm font-bold min-w-[1.5rem] text-center ${
                loans.length > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
              }`}>
                {loans.length}
              </span>
            </div>
          )}
        </div>

        {/* Table card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-52 text-sm text-gray-400 dark:text-gray-500">
              <svg className="animate-spin w-5 h-5 mr-2 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Loading loans…
            </div>
          ) : fetchError ? (
            <div className="flex flex-col items-center justify-center h-52 gap-3">
              <p className="text-sm text-red-500">{fetchError}</p>
              <button
                onClick={fetchLoans}
                className="text-xs text-gray-500 dark:text-gray-400 underline underline-offset-2 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Retry
              </button>
            </div>
          ) : loans.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-52 gap-3 text-center px-6">
              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No active loans</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Head to the catalog to borrow a book</p>
              </div>
              <button
                onClick={() => router.push('/catalog')}
                className="mt-1 rounded-lg bg-black dark:bg-white px-4 py-2 text-xs font-semibold text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/50">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Borrowed On</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loans.map(loan => {
                  const returning = returningId === loan.id
                  return (
                    <tr key={loan.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition">
                      <td className="px-5 py-4 font-medium text-gray-900 dark:text-white">{loan.bookTitle}</td>
                      <td className="px-5 py-4 text-gray-500 dark:text-gray-400">{formatDate(loan.loanDate)}</td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleReturn(loan.id)}
                          disabled={returning}
                          className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition min-w-[80px]"
                        >
                          {returning ? 'Returning…' : 'RETURN'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>

      <ToastStack toasts={toasts} />
    </div>
  )
}
