'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface DNAHorizontalBarProps {
  label: string
  value: number
  colorClass?: string
  delay?: number
}

export function DNAHorizontalBar({ label, value, colorClass = 'from-foreground to-foreground/60', delay = 0 }: DNAHorizontalBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground" style={{ fontFamily: 'var(--font-space-mono)' }}>
          {label}
        </span>
        <span className="text-[11px] font-bold text-foreground" style={{ fontFamily: 'var(--font-space-mono)' }}>
          {value}%
        </span>
      </div>
      <div className="progress-track">
        <motion.div
          className={cn('h-full rounded-full bg-gradient-to-r', colorClass)}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.9, delay, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

/* ─── Circular Progress ─── */
interface DNACircularProgressProps {
  label: string
  value: number
  size?: number
  strokeWidth?: number
  color?: string
  delay?: number
}

export function DNACircularProgress({ label, value, size = 110, strokeWidth = 5, color, delay = 0 }: DNACircularProgressProps) {
  const radius = (size - strokeWidth * 2) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference
  const stroke = color || 'var(--foreground)'

  return (
    <div className="premium-card flex flex-col items-center justify-center gap-3 py-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90">
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            strokeWidth={strokeWidth} stroke="var(--secondary)"
            fill="transparent"
          />
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.1, delay, ease: 'easeOut' }}
            strokeLinecap="round"
            stroke={stroke}
            fill="transparent"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-extrabold text-foreground" style={{ fontFamily: 'var(--font-syne)' }}>
            {value}
          </span>
          <span className="text-[8px] text-muted-foreground uppercase tracking-widest" style={{ fontFamily: 'var(--font-space-mono)' }}>
            /100
          </span>
        </div>
      </div>
      {label && (
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground" style={{ fontFamily: 'var(--font-space-mono)' }}>
          {label}
        </span>
      )}
    </div>
  )
}

/* ─── Metric Pill ─── */
interface DNAMetricPillProps {
  label: string
  value: number | string
  icon?: React.ReactNode
  className?: string
}

export function DNAMetricPill({ label, value, icon, className }: DNAMetricPillProps) {
  return (
    <div className={cn('flex items-center gap-2.5 px-4 py-2.5 bg-card border border-border rounded-full hover:border-foreground/25 transition-colors', className)}>
      {icon && <div className="text-muted-foreground">{icon}</div>}
      <div>
        <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold" style={{ fontFamily: 'var(--font-space-mono)' }}>{label}</p>
        <p className="text-[11px] font-bold text-foreground leading-tight" style={{ fontFamily: 'var(--font-space-mono)' }}>{value}</p>
      </div>
    </div>
  )
}

/* ─── Radial Card (inline circular) ─── */
interface DNARadialCardProps {
  title: string
  description: string
  value: number
  colorClass?: string
  delay?: number
}

export function DNARadialCard({ title, description, value, delay = 0 }: DNARadialCardProps) {
  return (
    <div className="premium-card flex items-center justify-between gap-6">
      <div className="space-y-1.5 flex-1 min-w-0">
        <p className="text-xs font-extrabold text-foreground uppercase tracking-tight" style={{ fontFamily: 'var(--font-syne)' }}>
          {title}
        </p>
        <p className="text-[10px] text-muted-foreground leading-relaxed" style={{ fontFamily: 'var(--font-space-mono)' }}>
          {description}
        </p>
      </div>
      <DNACircularProgress label="" value={value} size={72} strokeWidth={5} delay={delay} />
    </div>
  )
}
