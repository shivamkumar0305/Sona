'use client'

import { useApp } from '@/context/AppContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Music, RefreshCw, Headphones, BarChart3, Sparkles } from 'lucide-react'

const FEATURES = [
  { icon: BarChart3, label: 'Music DNA', desc: 'Deep acoustic analysis of your taste profile' },
  { icon: Headphones, label: 'Listening habits', desc: 'Discovery, loyalty, and replay patterns' },
  { icon: Sparkles, label: 'Taste Summary', desc: 'Narrative description of your sonic identity' },
]

export function LoginPage() {
  const { login, isLoggingIn } = useApp()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-foreground rounded-lg flex items-center justify-center">
            <Music className="w-3.5 h-3.5 text-background" />
          </div>
          <span
            className="text-sm font-extrabold tracking-tight text-foreground"
            style={{ fontFamily: 'var(--font-syne), sans-serif' }}
          >
            Sona
          </span>
        </div>
        <span className="mono-label">Music Intelligence</span>
      </header>

      {/* Hero area */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border bg-secondary text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-8"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-foreground/50 inline-block" />
          Powered by Spotify API
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.0] mb-5 max-w-3xl"
          style={{ fontFamily: 'var(--font-syne), sans-serif', letterSpacing: '-0.03em' }}
        >
          Understand your<br />
          <span className="text-muted-foreground">music identity.</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed mb-12"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          Sona analyses your Spotify listening logs, genres, and audio signals to build a multidimensional profile of your taste.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mb-16"
        >
          <button
            onClick={login}
            disabled={isLoggingIn}
            className="btn-solid cursor-pointer text-sm px-8 py-4 rounded-2xl shadow-sm"
          >
            {isLoggingIn ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin-slow" />
                <span>Connecting to Spotify…</span>
              </>
            ) : (
              <>
                <Music className="w-4 h-4" />
                <span>Connect with Spotify</span>
              </>
            )}
          </button>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-stretch max-w-xl mx-auto stagger"
        >
          {FEATURES.map((f) => (
            <div
              key={f.label}
              className="animate-fade-up flex-1 bg-card border border-border rounded-2xl px-5 py-5 text-left space-y-2.5 hover:border-foreground/20 transition-colors duration-200"
            >
              <f.icon className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs font-extrabold text-foreground uppercase tracking-tight" style={{ fontFamily: 'var(--font-syne)' }}>
                {f.label}
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed" style={{ fontFamily: 'var(--font-space-mono)' }}>
                {f.desc}
              </p>
            </div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-5 border-t border-border/60 flex justify-between items-center">
        <span className="mono-label">© 2026 Sona Studio</span>
        <div className="flex gap-5">
          <a href="#" className="mono-label hover:text-foreground transition-colors">Privacy</a>
          <a href="#" className="mono-label hover:text-foreground transition-colors">Terms</a>
        </div>
      </footer>
    </div>
  )
}
