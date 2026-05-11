'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AuthContextType {
  username: string | null
  token: string | null
  setUsername: (u: string | null) => void
  setToken: (t: string | null) => void
}

const AuthContext = createContext<AuthContextType>({
  username: null,
  token: null,
  setUsername: () => {},
  setToken: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(null)
  const [token, setTokenState] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  function setToken(t: string | null) {
    setTokenState(t)
    if (t) localStorage.setItem('token', t)
    else localStorage.removeItem('token')
  }

  useEffect(() => {
    const stored = localStorage.getItem('token')
    if (stored) setTokenState(stored)
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.username) setUsername(data.username) })
      .finally(() => setReady(true))
  }, [])

  if (!ready) return null

  return (
    <AuthContext.Provider value={{ username, token, setUsername, setToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
