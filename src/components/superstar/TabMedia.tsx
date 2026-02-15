import { formatDateShort } from '@/lib/utils'

interface TabMediaProps {
  superstar: any
}

export function TabMedia({ superstar }: TabMediaProps) {
  const hasThemes = superstar.themes?.length > 0
  const hasBooks = superstar.books?.length > 0
  const hasFilms = superstar.films?.length > 0

  if (!hasThemes && !hasBooks && !hasFilms) {
    return (
      <div className="text-center py-12 text-text-secondary">
        No media data yet.
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Entrance Themes */}
      {hasThemes && (
        <div>
          <h3 className="font-display text-lg font-bold text-neon-blue mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-neon-blue rounded-full" />
            Entrance Themes
          </h3>
          <div className="space-y-2">
            {superstar.themes.map((theme: any) => (
              <div
                key={theme.id}
                className={`glass rounded-xl p-4 border flex items-center justify-between gap-4 ${
                  theme.is_current
                    ? 'border-neon-blue/30 bg-neon-blue/5'
                    : 'border-border-subtle/50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Music icon */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    theme.is_current ? 'bg-neon-blue/20' : 'bg-bg-tertiary'
                  }`}>
                    <svg className={`w-4 h-4 ${theme.is_current ? 'text-neon-blue' : 'text-text-secondary'}`} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-medium truncate ${theme.is_current ? 'text-neon-blue' : 'text-text-white'}`}>
                      {theme.song_name}
                    </p>
                    {theme.artist && (
                      <p className="text-text-secondary text-xs truncate">{theme.artist}</p>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-text-secondary text-xs">
                    {formatDateShort(theme.start_date)}
                    {' → '}
                    {theme.end_date ? formatDateShort(theme.end_date) : 'Now'}
                  </p>
                  {theme.is_current && (
                    <span className="text-[10px] text-status-success uppercase tracking-wider">Current</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Books */}
      {hasBooks && (
        <div>
          <h3 className="font-display text-lg font-bold text-neon-pink mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-neon-pink rounded-full" />
            Books
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {superstar.books.map((book: any) => (
              <div key={book.id} className="glass rounded-xl p-4 border border-border-subtle/50 flex gap-4">
                {book.image_url ? (
                  <img src={book.image_url} alt={book.title} className="w-16 h-24 rounded object-cover shrink-0" />
                ) : (
                  <div className="w-16 h-24 rounded bg-bg-tertiary shrink-0 flex items-center justify-center">
                    <svg className="w-6 h-6 text-border-subtle" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" />
                    </svg>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-text-white text-sm font-medium">{book.title}</p>
                  {book.year && <p className="text-text-secondary text-xs mt-0.5">{book.year}</p>}
                  {book.description && <p className="text-text-secondary text-xs mt-1 line-clamp-2">{book.description}</p>}
                  {book.external_url && (
                    <a href={book.external_url} target="_blank" rel="noopener noreferrer" className="text-neon-blue text-xs hover:underline mt-1 inline-block">
                      View →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Films */}
      {hasFilms && (
        <div>
          <h3 className="font-display text-lg font-bold text-neon-pink mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-neon-pink rounded-full" />
            Movies & TV
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {superstar.films.map((film: any) => (
              <div key={film.id} className="glass rounded-xl p-4 border border-border-subtle/50">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-text-white text-sm font-medium">{film.title}</p>
                  <span className="text-[10px] text-text-secondary uppercase tracking-wider px-1.5 py-0.5 bg-bg-tertiary rounded">
                    {film.film_type === 'tv_show' ? 'TV' : film.film_type === 'documentary' ? 'Doc' : film.film_type}
                  </span>
                </div>
                <p className="text-text-secondary text-xs">
                  {film.year}{film.role && ` · ${film.role}`}
                </p>
                {film.description && <p className="text-text-secondary text-xs mt-1">{film.description}</p>}
                {film.external_url && (
                  <a href={film.external_url} target="_blank" rel="noopener noreferrer" className="text-neon-blue text-xs hover:underline mt-1 inline-block">
                    IMDb →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
