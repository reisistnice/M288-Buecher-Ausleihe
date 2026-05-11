'use client'

import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'

interface NavbarProps {
  activeTab: 'catalog' | 'loans'
}

const NAV_ITEMS: Array<{ label: string; href: string; key: 'catalog' | 'loans'; icon: React.ReactNode }> = [
  {
    label: 'Catalog',
    href: '/catalog',
    key: 'catalog',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    label: 'My Loans',
    href: '/loans',
    key: 'loans',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
]

export default function Navbar({ activeTab }: NavbarProps) {
  const router = useRouter()
  const { username, email, darkMode, setUsername, toggleDarkMode } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUsername(null)
    router.push('/')
  }

  return (
    <aside className="w-64 min-h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-white/[0.07] flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100 dark:border-white/[0.07]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-gray-900 dark:bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-gray-900 dark:text-white tracking-wide">BookLender</span>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ label, href, key, icon }) => (
          <button
            key={key}
            onClick={() => router.push(href)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
              activeTab === key
                ? 'bg-gray-100 dark:bg-indigo-500/15 text-gray-900 dark:text-indigo-300'
                : 'text-gray-500 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-white/[0.04] hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {icon}
            {label}
          </button>
        ))}
      </nav>

      {/* User info */}
      <div className="px-3 py-4 border-t border-gray-100 dark:border-white/[0.07]" ref={ref}>
        <div className="relative">
          {/* Popover */}
          {open && (
            <div className="absolute bottom-full mb-2 left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/[0.08] rounded-xl shadow-lg dark:shadow-2xl dark:shadow-black/60 p-3 space-y-3">
              {email && (
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 truncate">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="truncate">{email}</span>
                </div>
              )}
              <button
                onClick={toggleDarkMode}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-white/[0.05] hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-colors text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                <span className="flex items-center gap-2">
                  {darkMode ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                  {darkMode ? 'Light mode' : 'Dark mode'}
                </span>
                <div className={`w-8 h-4 rounded-full transition-colors ${darkMode ? 'bg-gray-900 dark:bg-indigo-500' : 'bg-gray-300'}`}>
                  <div className={`w-3 h-3 rounded-full bg-white mt-0.5 transition-transform ${darkMode ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </div>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign out
              </button>
            </div>
          )}

          {/* Trigger button */}
          <button
            onClick={() => setOpen(v => !v)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.07] hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-colors text-left"
          >
            <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-indigo-500/20 flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-gray-700 dark:text-indigo-300 uppercase">
                {username ? username[0] : '?'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 dark:text-gray-500">Hello,</p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{username}</p>
            </div>
            <svg className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  )
}
