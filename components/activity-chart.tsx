'use client'

export default function ActivityChart() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const data = [65, 78, 55, 92, 88, 72, 85]
  const maxValue = Math.max(...data)

  return (
    <div className="premium-card mb-8">
      <h3 className="text-lg font-semibold mb-6">Weekly Listening Activity</h3>
      
      <div className="flex items-end justify-between h-48 gap-2">
        {days.map((day, index) => {
          const percentage = (data[index] / maxValue) * 100
          return (
            <div key={day} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-gradient-to-t from-accent/30 to-accent rounded-t-lg relative group cursor-pointer hover:from-accent/40 hover:to-accent transition-colors" style={{ height: `${percentage}%` }}>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-background border border-border rounded px-2 py-1 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {data[index]}h
                </div>
              </div>
              <span className="text-xs text-muted-foreground mt-2">{day}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
