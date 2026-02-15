import { formatDateShort } from '@/lib/utils'

export function TabMedia({ superstar }: { superstar: any }) {
  const hasThemes = superstar.themes?.length > 0
  const hasBooks = superstar.books?.length > 0
  const hasFilms = superstar.films?.length > 0

  if (!hasThemes && !hasBooks && !hasFilms) return <p className="text-center py-12 text-text-secondary">No media data yet.</p>

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {hasThemes && (
        <div>
          <h3 className="font-display text-lg font-bold text-neon-blue mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-neon-blue rounded-full" />Entrance Themes
          </h3>
          <div className="space-y-2">
            {superstar.themes.map((t: any) => (
              <div key={t.id} className={`glass rounded-xl p-4 border flex items-center justify-between gap-4 ${t.is_current ? 'border-neon-blue/30 bg-neon-blue/5' : 'border-border-subtle/50'}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${t.is_current ? 'bg-neon-blue/20' : 'bg-bg-tertiary'}`}>
                    <svg className={`w-4 h-4 ${t.is_current ? 'text-neon-blue' : 'text-text-secondary'}`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-medium truncate ${t.is_current ? 'text-neon-blue' : 'text-text-white'}`}>{t.song_name}</p>
                    {t.artist && <p className="text-text-secondary text-xs truncate">{t.artist}</p>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-text-secondary text-xs">{formatDateShort(t.start_date)} → {t.end_date ? formatDateShort(t.end_date) : 'Now'}</p>
                  {t.is_current && <span className="text-[10px] text-status-success uppercase">Current</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasBooks && (
        <div>
          <h3 className="font-display text-lg font-bold text-neon-pink mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-neon-pink rounded-full" />Books
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {superstar.books.map((b: any) => (
              <div key={b.id} className="glass rounded-xl p-4 border border-border-subtle/50">
                <p className="text-text-white text-sm font-medium">{b.title}</p>
                {b.year && <p className="text-text-secondary text-xs mt-0.5">{b.year}</p>}
                {b.description && <p className="text-text-secondary text-xs mt-1 line-clamp-2">{b.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {hasFilms && (
        <div>
          <h3 className="font-display text-lg font-bold text-neon-pink mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-neon-pink rounded-full" />Movies & TV
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {superstar.films.map((f: any) => (
              <div key={f.id} className="glass rounded-xl p-4 border border-border-subtle/50">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-text-white text-sm font-medium">{f.title}</p>
                  <span className="text-[10px] text-text-secondary uppercase px-1.5 py-0.5 bg-bg-tertiary rounded">{f.film_type === 'tv_show' ? 'TV' : f.film_type}</span>
                </div>
                <p className="text-text-secondary text-xs">{f.year}{f.role && ` · ${f.role}`}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
