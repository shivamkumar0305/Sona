'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/')
  }, [router])

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <p className="mono-label animate-pulse">Connecting Spotify...</p>
    </main>
  )
}
