'use client'

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { decodeEmail, decodeExpiry } from '@/lib/utils'

interface AuthContextType {
  username: string | null
  email: string | null
  token: string | null
  darkMode: boolean
  setUsername: (u: string | null) => void
  setEmail: (e: string | null) => void
  setToken: (t: string | null) => void
  toggleDarkMode: () => void
}

const AuthContext = createContext<AuthContextType>({
  username: null,
  email: null,
  token: null,
  darkMode: false,
  setUsername: () => {},
  setEmail: () => {},
  setToken: () => {},
  toggleDarkMode: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [username, setUsername] = useState<string | null>(null)
  const [email, setEmailState] = useState<string | null>(null)
  const [token, setTokenState] = useState<string | null>(null)
  const [darkMode, setDarkMode] = useState(false)
  const [ready, setReady] = useState(false)
  const expiryTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function clearExpiryTimer() {
    if (expiryTimer.current) {
      clearTimeout(expiryTimer.current)
      expiryTimer.current = null
    }
  }

  function scheduleExpiry(t: string) {
    clearExpiryTimer()
    const expiry = decodeExpiry(t)
    if (!expiry) return
    const msUntilExpiry = expiry.getTime() - Date.now()
    if (msUntilExpiry <= 0) {
      performLogout('Session timed out. Please sign in again.')
      return
    }
    expiryTimer.current = setTimeout(() => {
      performLogout('Session timed out. Please sign in again.')
    }, msUntilExpiry)
  }

  function performLogout(errorMsg?: string) {
    clearExpiryTimer()
    fetch('/api/auth/logout', { method: 'POST' })
    localStorage.removeItem('token')
    localStorage.removeItem('email')
    setTokenState(null)
    setEmailState(null)
    setUsername(null)
    if (errorMsg) sessionStorage.setItem('sessionError', errorMsg)
    router.push('/')
  }

  function setEmail(e: string | null) {
    setEmailState(e)
    if (e) localStorage.setItem('email', e)
    else localStorage.removeItem('email')
  }

  function setToken(t: string | null) {
    setTokenState(t)
    if (t) {
      localStorage.setItem('token', t)
      const decoded = decodeEmail(t)
      if (decoded) setEmail(decoded)
      scheduleExpiry(t)
    } else {
      localStorage.removeItem('token')
      clearExpiryTimer()
    }
  }

  function toggleDarkMode() {
    setDarkMode(prev => {
      const next = !prev
      if (next) {
        document.documentElement.classList.add('dark')
        localStorage.setItem('darkMode', '1')
      } else {
        document.documentElement.classList.remove('dark')
        localStorage.removeItem('darkMode')
      }
      return next
    })
  }

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      setTokenState(storedToken)
      scheduleExpiry(storedToken)
    }

    const storedEmail = localStorage.getItem('email')
    if (storedEmail) setEmailState(storedEmail)

    const storedDark = localStorage.getItem('darkMode') === '1'
    if (storedDark) {
      setDarkMode(true)
      document.documentElement.classList.add('dark')
    }

    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.username) setUsername(data.username)
      })
      .finally(() => setReady(true))

    return () => clearExpiryTimer()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!ready) return null

  return (
    <AuthContext.Provider value={{ username, email, token, darkMode, setUsername, setEmail, setToken, toggleDarkMode }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
