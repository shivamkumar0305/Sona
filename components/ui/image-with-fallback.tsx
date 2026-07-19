'use client'

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

interface ImageWithFallbackProps {
  src?: string | null
  alt: string
  className?: string
  fallback: ReactNode
}

export function ImageWithFallback({ src, alt, className, fallback }: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false)
  const cleanSrc = typeof src === 'string' ? src.trim() : ''

  useEffect(() => {
    setHasError(false)
  }, [cleanSrc])

  if (!cleanSrc || hasError) {
    return <>{fallback}</>
  }

  return (
    <img
      src={cleanSrc}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setHasError(true)}
    />
  )
}
