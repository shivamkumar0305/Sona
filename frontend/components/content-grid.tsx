'use client'

import { ImageWithFallback } from '@/components/ui/image-with-fallback'

interface ContentGridProps {
  title: string
  items: Array<{
    id: string
    name: string
    subtitle: string
    count?: string
    imageUrl?: string
  }>
  icon?: 'music' | 'trending' | 'chart'
  square?: boolean
}

export default function ContentGrid({ title, items, icon = 'music', square = false }: ContentGridProps) {
  return (
    <div>
      <p className="section-title">{title}</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="group flex flex-col gap-3 cursor-pointer"
          >
            {/* Art */}
            <div className={`relative overflow-hidden border border-border bg-secondary ${square ? 'aspect-square' : 'aspect-[3/4]'} rounded-2xl`}>
              {item.imageUrl ? (
                <ImageWithFallback
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  fallback={(
                    <div className="w-full h-full bg-secondary" />
                  )}
                />
              ) : (
                <div className="w-full h-full bg-secondary" />
              )}
            </div>

            {/* Info */}
            <div className="space-y-0.5 min-w-0 px-0.5">
              <p
                className="text-xs font-bold text-foreground truncate leading-tight group-hover:underline decoration-dotted underline-offset-2"
                style={{ fontFamily: 'var(--font-syne)', letterSpacing: '-0.01em' }}
              >
                {item.name}
              </p>
              <p className="text-[10px] text-muted-foreground truncate" style={{ fontFamily: 'var(--font-space-mono)' }}>
                {item.subtitle}
              </p>
              {item.count && (
                <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-wider" style={{ fontFamily: 'var(--font-space-mono)' }}>
                  {item.count}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
