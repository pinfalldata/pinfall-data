import { formatDate } from '@/lib/utils'

const DOT_COLORS: Record<string, string> = {
  debut: 'bg-status-success', title_win: 'bg-neon-blue', title_loss: 'bg-status-danger',
  injury: 'bg-status-danger', return: 'bg-status-success', gimmick_change: 'bg-neon-pink',
  feud: 'bg-status-warning', wrestlemania: 'bg-neon-pink', hall_of_fame: 'bg-neon-blue',
  departure: 'bg-status-warning', retirement: 'bg-text-secondary', milestone: 'bg-neon-blue', career: 'bg-border-subtle',
}

export function TabTimeline({ superstar }: { superstar: any }) {
  if (!superstar.timeline?.length) return <p className="text-center py-12 text-text-secondary">No timeline events yet.</p>

  return (
    <div className="max-w-3xl mx-auto relative">
      <div className="absolute left-4 sm:left-6 top-0 bottom-0 w-px bg-border-subtle/50" />
      <div className="space-y-6">
        {superstar.timeline.map((ev: any) => (
          <div key={ev.id} className="relative pl-12 sm:pl-16">
            <div className={`absolute left-3 sm:left-5 top-1.5 w-3 h-3 rounded-full border-2 border-bg-primary ${DOT_COLORS[ev.event_type] || DOT_COLORS.career}`} />
            <p className="text-text-secondary text-xs mb-1">
              {formatDate(ev.date)}
              {ev.event_type && ev.event_type !== 'career' && <span className="ml-2 text-[10px] uppercase tracking-wider opacity-60">{ev.event_type.replace('_', ' ')}</span>}
            </p>
            <h4 className="text-text-white font-medium text-sm sm:text-base mb-1">{ev.title}</h4>
            {ev.description_md && <p className="text-text-secondary text-sm leading-relaxed">{ev.description_md}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
