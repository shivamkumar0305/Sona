'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface DNAHorizontalBarProps {
  label: string
  value: number
  colorClass?: string
  delay?: number
}

export function DNAHorizontalBar({ label, value, colorClass = "from-foreground to-foreground/60", delay = 0 }: DNAHorizontalBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-xs font-mono">
        <span className="text-muted-foreground uppercase font-bold">{label}</span>
        <span className="font-bold text-foreground">{value}%</span>
      </div>
      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden border border-border/40">
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
  size = 110,
  strokeWidth = 6,
  color = "currentColor",
  delay = 0,
  sublabel
}: DNACircularProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="flex flex-col items-center justify-center p-5 bg-card rounded-xl border border-border/80 hover:border-foreground/30 transition-all duration-200 group">
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
            stroke={color === "currentColor" ? "var(--foreground)" : color}
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>
        {/* Value Text display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold tracking-tight text-foreground font-mono">{value}%</span>
          {sublabel && <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-mono">{sublabel}</span>}
        </div>
      </div>
      {label && (
        <span className="mt-3 font-mono font-bold text-xs uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
          {label}
        </span>
      )}
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
      "flex items-center gap-2.5 px-4 py-2 bg-card border border-border/80 hover:border-border rounded-full transition-all duration-200 shadow-sm",
      className
    )}>
      {icon && <div className="text-foreground">{icon}</div>}
      <div className="flex flex-col">
        <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-mono font-bold">{label}</span>
        <span className="text-xs font-bold text-foreground font-mono leading-none mt-0.5">{value}</span>
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

export function DNARadialCard({ title, description, value, colorClass = "var(--foreground)", delay = 0 }: DNARadialCardProps) {
  return (
    <div className="premium-card bg-card border border-border/80 rounded-xl overflow-hidden relative group p-6">
      <div className="relative z-10 flex items-center justify-between gap-6">
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-foreground uppercase tracking-tight">{title}</h4>
          <p className="text-xs text-muted-foreground font-mono leading-relaxed max-w-sm">{description}</p>
        </div>
        <div className="flex-shrink-0">
          <DNACircularProgress
            label=""
            value={value}
            size={70}
            strokeWidth={5}
            color={colorClass}
            delay={delay}
          />
        </div>
      </div>
    </div>
  )
}
