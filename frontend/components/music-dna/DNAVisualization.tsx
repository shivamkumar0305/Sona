'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface DNAHorizontalBarProps {
  label: string
  value: number
  colorClass?: string
  delay?: number
}

export function DNAHorizontalBar({ label, value, colorClass = "from-accent to-accent/60", delay = 0 }: DNAHorizontalBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground font-medium">{label}</span>
        <span className="font-semibold text-foreground">{value}%</span>
      </div>
      <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden border border-border/20">
        <motion.div
          className={cn("h-full rounded-full bg-gradient-to-r", colorClass)}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, delay, ease: "easeOut" }}
        />
      </div>
    </div>
  )
}

interface DNACircularProgressProps {
  label: string
  value: number
  size?: number
  strokeWidth?: number
  color?: string
  delay?: number
  sublabel?: string
}

export function DNACircularProgress({
  label,
  value,
  size = 120,
  strokeWidth = 8,
  color = "oklch(0.65 0.18 40)", // accent
  delay = 0,
  sublabel
}: DNACircularProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-card/40 rounded-2xl border border-border/50 backdrop-blur-sm group hover:border-accent/40 transition-colors duration-300">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            className="text-secondary"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          {/* Active progress */}
          <motion.circle
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, delay, ease: "easeOut" }}
            strokeLinecap="round"
            stroke={color}
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>
        {/* Value Text display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold tracking-tight text-foreground">{value}%</span>
          {sublabel && <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{sublabel}</span>}
        </div>
      </div>
      <span className="mt-4 font-semibold text-sm text-center text-foreground group-hover:text-accent transition-colors">
        {label}
      </span>
    </div>
  )
}

interface DNAMetricPillProps {
  label: string
  value: number | string
  icon?: React.ReactNode
  className?: string
}

export function DNAMetricPill({ label, value, icon, className }: DNAMetricPillProps) {
  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-2.5 bg-card/60 border border-border/40 hover:border-border rounded-full backdrop-blur-sm transition-all duration-300",
      className
    )}>
      {icon && <div className="text-accent">{icon}</div>}
      <div className="flex flex-col">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{label}</span>
        <span className="text-sm font-bold text-foreground">{value}</span>
      </div>
    </div>
  )
}

interface DNARadialCardProps {
  title: string
  description: string
  value: number
  colorClass?: string
  delay?: number
}

export function DNARadialCard({ title, description, value, colorClass = "from-accent to-accent/40", delay = 0 }: DNARadialCardProps) {
  return (
    <div className="premium-card premium-gradient overflow-hidden relative group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/10 transition-colors duration-300" />
      <div className="relative z-10 flex items-center justify-between gap-6">
        <div className="space-y-2">
          <h4 className="text-lg font-bold text-foreground">{title}</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
        <div className="flex-shrink-0">
          <DNACircularProgress
            label=""
            value={value}
            size={80}
            strokeWidth={6}
            delay={delay}
          />
        </div>
      </div>
    </div>
  )
}
