'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { decodeUsername } from '@/lib/utils'

interface NavbarProps {
  activeTab: 'catalog' | 'loans'
}

const NAV_ITEMS: Array<{ label: string; href: string; key: 'catalog' | 'loans' }> = [
  { label: 'Catalog',  href: '/catalog', key: 'catalog' },
  { label: 'My Loans', href: '/loans',   key: 'loans'   },
]

export default function Navbar({ activeTab }: NavbarProps) {
  const router = useRouter()
  const { token, setToken } = useAuth()
  const username = token ? decodeUsername(token) : ''

  function handleLogout() {
    setToken(null)
    router.push('/')
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 h-16 flex items-center justify-between sticky top-0 z-10">
      <span className="text-sm font-bold tracking-widest text-gray-900 uppercase select-none">
        BookLender
      </span>

      <div className="flex gap-1">
        {NAV_ITEMS.map(({ label, href, key }) => (
          <button
            key={key}
            onClick={() => router.push(href)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === key
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        {username && <span className="text-sm text-gray-500 font-medium">{username}</span>}
        <button
          onClick={handleLogout}
          className="rounded-lg border border-gray-200 px-3.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition"
        >
          Logout
        </button>
      </div>
    </nav>
  )
}
