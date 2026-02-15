interface TabMovesProps {
  superstar: any
}

export function TabMoves({ superstar }: TabMovesProps) {
  const finishersList = superstar.finishers?.filter((f: any) => f.move_type === 'finisher') || []
  const signatureList = superstar.finishers?.filter((f: any) => f.move_type === 'signature') || []

  if (finishersList.length === 0 && signatureList.length === 0) {
    return (
      <div className="text-center py-12 text-text-secondary">
        No moves data yet.
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Finishers */}
      {finishersList.length > 0 && (
        <div>
          <h3 className="font-display text-lg font-bold text-neon-blue mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-neon-blue rounded-full" />
            Finishing Moves
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {finishersList.map((move: any) => (
              <MoveCard key={move.id} move={move} accent="blue" />
            ))}
          </div>
        </div>
      )}

      {/* Signature moves */}
      {signatureList.length > 0 && (
        <div>
          <h3 className="font-display text-lg font-bold text-neon-pink mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-neon-pink rounded-full" />
            Signature Moves
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {signatureList.map((move: any) => (
              <MoveCard key={move.id} move={move} accent="pink" />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MoveCard({ move, accent }: { move: any; accent: 'blue' | 'pink' }) {
  const borderColor = accent === 'blue' ? 'border-neon-blue/20 hover:border-neon-blue/40' : 'border-neon-pink/20 hover:border-neon-pink/40'
  const nameColor = accent === 'blue' ? 'text-neon-blue' : 'text-neon-pink'

  return (
    <div className={`glass rounded-xl p-5 border ${borderColor} transition-all duration-300`}>
      <div className="flex items-start justify-between mb-2">
        <h4 className={`${nameColor} font-display font-bold text-base`}>
          {move.name}
        </h4>
        {move.is_current && (
          <span className="text-[10px] text-status-success uppercase tracking-wider bg-status-success/10 px-1.5 py-0.5 rounded">
            Current
          </span>
        )}
      </div>

      {move.description && (
        <p className="text-text-secondary text-sm mb-2">{move.description}</p>
      )}

      {(move.year_started || move.year_stopped) && (
        <p className="text-text-secondary text-xs">
          {move.year_started || '?'} — {move.year_stopped || 'Present'}
        </p>
      )}
    </div>
  )
}
