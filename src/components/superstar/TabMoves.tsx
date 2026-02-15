export function TabMoves({ superstar }: { superstar: any }) {
  const finishers = superstar.finishers?.filter((f: any) => f.move_type === 'finisher') || []
  const signatures = superstar.finishers?.filter((f: any) => f.move_type === 'signature') || []

  if (!finishers.length && !signatures.length) return <p className="text-center py-12 text-text-secondary">No moves data yet.</p>

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {finishers.length > 0 && (
        <div>
          <h3 className="font-display text-lg font-bold text-neon-blue mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-neon-blue rounded-full" />Finishing Moves
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {finishers.map((m: any) => <MoveCard key={m.id} move={m} color="blue" />)}
          </div>
        </div>
      )}
      {signatures.length > 0 && (
        <div>
          <h3 className="font-display text-lg font-bold text-neon-pink mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-neon-pink rounded-full" />Signature Moves
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {signatures.map((m: any) => <MoveCard key={m.id} move={m} color="pink" />)}
          </div>
        </div>
      )}
    </div>
  )
}

function MoveCard({ move, color }: { move: any; color: 'blue' | 'pink' }) {
  const border = color === 'blue' ? 'border-neon-blue/20 hover:border-neon-blue/40' : 'border-neon-pink/20 hover:border-neon-pink/40'
  const nameColor = color === 'blue' ? 'text-neon-blue' : 'text-neon-pink'
  return (
    <div className={`glass rounded-xl p-5 border ${border} transition-all`}>
      <div className="flex items-start justify-between mb-2">
        <h4 className={`${nameColor} font-display font-bold text-base`}>{move.name}</h4>
        {move.is_current && <span className="text-[10px] text-status-success uppercase tracking-wider bg-status-success/10 px-1.5 py-0.5 rounded">Current</span>}
      </div>
      {move.description && <p className="text-text-secondary text-sm mb-2">{move.description}</p>}
      {(move.year_started || move.year_stopped) && <p className="text-text-secondary text-xs">{move.year_started || '?'} — {move.year_stopped || 'Present'}</p>}
    </div>
  )
}
