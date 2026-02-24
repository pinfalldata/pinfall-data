import Image from 'next/image'
import { formatDateShort } from '@/lib/utils'

// Film profile links — logo URLs from Supabase storage
const FILM_SITES = [
  {
    key: 'imdb_link',
    name: 'IMDb',
    logo: 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Films/IMDb.png',
    color: 'bg-[#f5c518]/10 border-[#f5c518]/30 hover:bg-[#f5c518]/20',
    textColor: 'text-[#f5c518]',
  },
  {
    key: 'tmdb_link',
    name: 'TMDB',
    logo: 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Films/TMDB.webp',
    color: 'bg-[#01b4e4]/10 border-[#01b4e4]/30 hover:bg-[#01b4e4]/20',
    textColor: 'text-[#01b4e4]',
  },
  {
    key: 'rotten_tomatoes_link',
    name: 'Rotten Tomatoes',
    logo: 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Films/Rotten%20Tomatoes%20(1).png',
    color: 'bg-[#fa320a]/10 border-[#fa320a]/30 hover:bg-[#fa320a]/20',
    textColor: 'text-[#fa320a]',
  },
]

export function TabMedia({ superstar }: { superstar: any }) {
  const hasThemes = superstar.themes?.length > 0
  const hasBooks = superstar.books?.length > 0

  // Films: new schema = one row with imdb_link, tmdb_link, rotten_tomatoes_link
  const filmEntry = superstar.films?.[0] || null
  const hasFilmLinks = filmEntry && (filmEntry.imdb_link || filmEntry.tmdb_link || filmEntry.rotten_tomatoes_link)

  if (!hasThemes && !hasBooks && !hasFilmLinks) {
    return <p className="text-center py-12 text-text-secondary">No data yet.</p>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* ============================================================ */}
      {/* ENTRANCE THEMES */}
      {/* ============================================================ */}
      {hasThemes && (
        <section>
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
        </section>
      )}

      {/* ============================================================ */}
      {/* FILMS — External profile links */}
      {/* ============================================================ */}
      {hasFilmLinks && (
        <section>
          <h3 className="font-display text-lg font-bold text-neon-pink mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-neon-pink rounded-full" />Films & TV
          </h3>
          <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-lg">
            {FILM_SITES.map((site) => {
              const link = filmEntry[site.key]
              if (!link) return null
              return (
                <a
                  key={site.key}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex flex-col items-center justify-center gap-2 sm:gap-2.5 py-4 sm:py-5 px-3 rounded-xl border transition-all duration-200 ${site.color}`}
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shrink-0">
                    <Image
                      src={site.logo}
                      alt={site.name}
                      width={40}
                      height={40}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className={`text-xs sm:text-sm font-medium text-center leading-tight ${site.textColor}`}>
                    {site.name}
                  </span>
                </a>
              )
            })}
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* BOOKS */}
      {/* ============================================================ */}
      {hasBooks && (
        <section>
          <h3 className="font-display text-lg font-bold text-neon-pink mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-neon-pink rounded-full" />Books
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {superstar.books.map((b: any) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

// ============================================================
// BOOK CARD — Uniform sizing with cover image
// ============================================================
function BookCard({ book }: { book: any }) {
  const Card = book.external_url ? 'a' : 'div'
  const linkProps = book.external_url
    ? { href: book.external_url, target: '_blank', rel: 'noopener noreferrer' }
    : {}

  return (
    <Card
      {...(linkProps as any)}
      className="group flex flex-col rounded-xl border border-border-subtle/40 bg-bg-secondary/30 overflow-hidden transition-all duration-200 hover:border-border-subtle/60 hover:bg-bg-secondary/50 hover:shadow-lg"
    >
      {/* Cover image — fixed aspect ratio for uniformity */}
      <div className="relative w-full aspect-[2/3] bg-bg-tertiary overflow-hidden">
        {book.image_url ? (
          <Image
            src={book.image_url}
            alt={book.title || 'Book cover'}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-10 h-10 text-text-secondary/30" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z" />
            </svg>
          </div>
        )}
        {/* Year badge */}
        {book.year && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[10px] text-text-white font-mono">
            {book.year}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 p-3 flex-1">
        <h4 className="text-sm font-medium text-text-white line-clamp-2 leading-snug">{book.title}</h4>
        {book.description && (
          <p className="text-[11px] text-text-secondary line-clamp-3 leading-relaxed mt-0.5">{book.description}</p>
        )}
        {book.external_url && (
          <span className="mt-auto pt-2 text-[10px] text-neon-blue font-medium flex items-center gap-1 group-hover:gap-1.5 transition-all">
            View book
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </span>
        )}
      </div>
    </Card>
  )
}
