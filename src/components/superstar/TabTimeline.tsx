import { formatDate } from '@/lib/utils'

interface TabTimelineProps {
  superstar: any
}

const EVENT_COLORS: Record<string, string> = {
  debut: 'bg-status-success',
  title_win: 'bg-neon-blue',
  title_loss: 'bg-status-danger',
  injury: 'bg-status-danger',
  return: 'bg-status-success',
  gimmick_change: 'bg-neon-pink',
  feud: 'bg-status-warning',
  wrestlemania: 'bg-neon-pink',
  hall_of_fame: 'bg-neon-blue',
  departure: 'bg-status-warning',
  retirement: 'bg-text-secondary',
  milestone: 'bg-neon-blue',
  career: 'bg-border-subtle',
}

export function TabTimeline({ superstar }: TabTimelineProps) {
  if (!superstar.timeline || superstar.timeline.length === 0) {
    return (
      <div className="text-center py-12 text-text-secondary">
        No timeline events yet.
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 sm:left-6 top-0 bottom-0 w-px bg-border-subtle" />

        {/* Events */}
        <div className="space-y-6">
          {superstar.timeline.map((event: any, index: number) => (
            <div key={event.id} className="relative pl-12 sm:pl-16">
              {/* Dot */}
              <div className={`absolute left-3 sm:left-5 top-1 w-3 h-3 rounded-full border-2 border-bg-primary ${
                EVENT_COLORS[event.event_type] || EVENT_COLORS.career
              }`} />

              {/* Date */}
              <p className="text-text-secondary text-xs mb-1">
                {formatDate(event.date)}
                {event.event_type && event.event_type !== 'career' && (
                  <span className="ml-2 text-[10px] uppercase tracking-wider opacity-60">
                    {event.event_type.replace('_', ' ')}
                  </span>
                )}
              </p>

              {/* Title */}
              <h4 className="text-text-white font-medium text-sm sm:text-base mb-1">
                {event.title}
              </h4>

              {/* Description */}
              {event.description_md && (
                <p className="text-text-secondary text-sm leading-relaxed">
                  {event.description_md}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
