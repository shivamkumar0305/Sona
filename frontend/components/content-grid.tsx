'use client'

import { Music, TrendingUp, BarChart3 } from 'lucide-react'

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
}

export default function ContentGrid({ title, items, icon = 'music' }: ContentGridProps) {
  const getIcon = () => {
    switch (icon) {
      case 'trending':
        return <TrendingUp className="w-4 h-4" />
      case 'chart':
        return <BarChart3 className="w-4 h-4" />
      default:
        return <Music className="w-4 h-4" />
    }
  }

  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-foreground border border-border">
          {getIcon()}
        </div>
        <h3 className="text-lg font-bold tracking-tight text-foreground uppercase">{title}</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="premium-card bg-card border border-border/80 hover:border-foreground/40 rounded-xl p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              {/* Image Rendering */}
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-40 object-cover rounded-lg mb-4 border border-border/40"
                />
              ) : (
                <div className="w-full h-40 bg-secondary/40 rounded-lg mb-4 flex items-center justify-center border border-border/30">
                  <Music className="w-8 h-8 text-muted-foreground/30" />
                </div>
              )}

              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h4 className="font-bold text-foreground text-sm leading-tight uppercase tracking-tight">
                    {item.name}
                  </h4>
                  <p className="text-xs text-muted-foreground font-medium">{item.subtitle}</p>
                </div>
                {item.count && (
                  <span className="text-[10px] font-bold text-foreground bg-secondary border border-border px-2 py-0.5 rounded-md flex-shrink-0 uppercase">
                    {item.count}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

