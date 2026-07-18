'use client'

export default function GenreCards() {
  const genres = [
    { name: 'Electronic', color: 'from-blue-500/30 to-blue-500/10', accentColor: 'text-blue-400' },
    { name: 'Jazz', color: 'from-orange-500/30 to-orange-500/10', accentColor: 'text-orange-400' },
    { name: 'Hip Hop', color: 'from-purple-500/30 to-purple-500/10', accentColor: 'text-purple-400' },
    { name: 'Indie', color: 'from-green-500/30 to-green-500/10', accentColor: 'text-green-400' },
    { name: 'Classical', color: 'from-pink-500/30 to-pink-500/10', accentColor: 'text-pink-400' },
    { name: 'Ambient', color: 'from-cyan-500/30 to-cyan-500/10', accentColor: 'text-cyan-400' },
  ]

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-6">Your Genres</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {genres.map((genre) => (
          <div
            key={genre.name}
            className={`bg-gradient-to-br ${genre.color} border border-border rounded-2xl p-6 flex items-center justify-center text-center group cursor-pointer hover:border-border/50 transition-all`}
          >
            <p className={`font-semibold ${genre.accentColor}`}>{genre.name}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
