'use client'

import { useEffect } from 'react'
import { AuthProvider } from '@/lib/auth-context'

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(data => console.log('[health]', data))
      .catch(err => console.error('[health]', err))
  }, [])

  return <AuthProvider>{children}</AuthProvider>
}
