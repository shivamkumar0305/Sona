'use client'

import { useApp } from '@/context/AppContext'
import { motion } from 'framer-motion'
import { Music, RefreshCw } from 'lucide-react'

export function LoginPage() {
  const { login, isLoggingIn } = useApp()

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between p-8 md:p-12 relative overflow-hidden select-none">
      {/* Visual background lines / stark border framework */}
      <div className="absolute inset-0 border-[16px] border-border pointer-events-none z-50" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full bg-border/40 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-none bg-accent flex items-center justify-center">
            <Music className="w-4 h-4 text-accent-foreground" />
          </div>
          <span className="font-mono text-sm font-bold uppercase tracking-wider text-foreground">Sona Studio</span>
        </div>
        <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Phase 2 Engine</span>
      </header>

      {/* Hero / Sign in section */}
      <main className="relative z-10 my-auto max-w-4xl mx-auto text-center space-y-12 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-4"
        >
          <span className="text-xs uppercase tracking-widest text-accent font-bold font-mono block">
            Multidimensional Taste Profile
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold uppercase tracking-tight text-foreground leading-[0.95]">
            Decode Your <br />
            Music DNA
          </h1>
          <p className="text-sm md:text-base text-muted-foreground font-mono max-w-xl mx-auto leading-relaxed pt-4">
            Connect your Spotify account to run numerical matrix computations on your listening logs, genres, and track acoustic signatures.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center"
        >
          <button
            onClick={login}
            disabled={isLoggingIn}
            className="group relative border border-accent bg-accent/10 hover:bg-accent hover:text-accent-foreground text-accent font-mono font-bold text-sm tracking-wider uppercase py-4 px-10 transition-all duration-300 flex items-center gap-3 cursor-pointer"
          >
            {isLoggingIn ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                >
                  <RefreshCw className="w-4 h-4" />
                </motion.div>
                <span>Authorizing Spotify Session...</span>
              </>
            ) : (
              <>
                <span>Connect Spotify Session</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </>
            )}
          </button>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono text-muted-foreground uppercase tracking-widest border-t border-border/30 pt-6">
        <div>© 2026 Sona Studio</div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-accent transition-colors">Privacy</a>
          <a href="#" className="hover:text-accent transition-colors">OAuth Terms</a>
        </div>
      </footer>
    </div>
  )
}
