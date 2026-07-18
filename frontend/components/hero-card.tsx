'use client'

export default function HeroCard() {
  return (
    <div className="premium-card premium-gradient p-8 md:p-12 mb-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -mr-32 -mt-32" />
      
      <div className="relative z-10">
        <p className="text-sm font-medium text-muted-foreground mb-2">Welcome back</p>
        <h2 className="text-3xl md:text-4xl font-bold mb-2">Listening Overview</h2>
        <p className="text-muted-foreground mb-6">
          Your week has been filled with 124 songs from your favorite artists
        </p>
        
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-background/40 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">Hours Listened</p>
            <p className="text-2xl font-bold">42.5</p>
          </div>
          <div className="bg-background/40 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">Unique Artists</p>
            <p className="text-2xl font-bold">187</p>
          </div>
          <div className="bg-background/40 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">Playlists</p>
            <p className="text-2xl font-bold">24</p>
          </div>
        </div>
      </div>
    </div>
  )
}
