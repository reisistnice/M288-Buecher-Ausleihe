'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { decodeEmail } from '@/lib/utils'

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
  const [username, setUsername] = useState<string | null>(null)
  const [email, setEmailState] = useState<string | null>(null)
  const [token, setTokenState] = useState<string | null>(null)
  const [darkMode, setDarkMode] = useState(false)
  const [ready, setReady] = useState(false)

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
    } else {
      localStorage.removeItem('token')
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
    if (storedToken) setTokenState(storedToken)

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
  }, [])

  if (!ready) return null

  return (
    <AuthContext.Provider value={{ username, email, token, darkMode, setUsername, setEmail, setToken, toggleDarkMode }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
