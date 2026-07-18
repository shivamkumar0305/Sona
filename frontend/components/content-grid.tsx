'use client'

import { Music, TrendingUp, BarChart3 } from 'lucide-react'

interface ContentGridProps {
  title: string
  items: Array<{
    id: string
    name: string
    subtitle: string
    count?: string
  }>
  icon?: 'music' | 'trending' | 'chart'
}

export default function ContentGrid({ title, items, icon = 'music' }: ContentGridProps) {
  const getIcon = () => {
    switch (icon) {
      case 'trending':
        return <TrendingUp className="w-5 h-5" />
      case 'chart':
        return <BarChart3 className="w-5 h-5" />
      default:
        return <Music className="w-5 h-5" />
    }
  }

  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
          {getIcon()}
        </div>
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="premium-card group hover:bg-card/80 cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-foreground group-hover:text-accent transition-colors">
                  {item.name}
                </h4>
                <p className="text-sm text-muted-foreground">{item.subtitle}</p>
              </div>
              {item.count && (
                <span className="text-xs font-semibold text-accent bg-accent/10 px-3 py-1 rounded-lg">
                  {item.count}
                </span>
              )}
            </div>
            
            {/* Placeholder image */}
            <div className="w-full h-32 bg-gradient-to-br from-accent/30 to-accent/10 rounded-lg mb-3 flex items-center justify-center">
              <Music className="w-8 h-8 text-accent/40" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
