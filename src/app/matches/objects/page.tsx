'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'


const HERO = 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page/resultats-wwe-tlc-couverture-en-direct_2026-03-22_10_41_26.529402.jpg.png'

export default function ObjectsListPage() {
  const t = useTranslations()

  const [objects, setObjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/objects-list').then(r => r.json()).then(d => setObjects(d.objects || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const filtered = search ? objects.filter(o => o.name.toLowerCase().includes(search.toLowerCase())) : objects

  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative w-full h-[220px] sm:h-[300px] lg:h-[380px] overflow-hidden">
        <Image src={HERO} alt="WWE Objects Used" fill priority sizes="100vw" quality={100} unoptimized className="object-cover object-center lg:object-[50%_60%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-60" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 sm:pb-8 lg:pb-10 px-4">
          <Link href="/matches" className="text-[10px] text-text-secondary uppercase tracking-widest mb-2 hover:text-neon-blue transition-colors">← Matches & Shows</Link>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-white text-center tracking-tight mb-2">
            {t('matches.objects.heroPrefix')} <span className="text-neon-blue">{t('matches.objects.heroHighlight')}</span>
          </h1>
          <p className="text-text-secondary text-sm sm:text-base text-center max-w-2xl">{t('matches.objects.heroSubtitle')}</p>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
        {/* Search */}
        <div className="mb-6 max-w-md">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t('matches.objects.searchPlaceholder')}
            className="w-full px-4 py-2.5 rounded-xl bg-bg-secondary/30 border border-border-subtle/30 text-sm text-text-white placeholder:text-text-secondary/50 focus:outline-none focus:border-neon-blue/50" />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 12 }).map((_, i) => <div key={i} className="aspect-square rounded-2xl bg-bg-secondary/30 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20"><span className="text-5xl block mb-4 opacity-20">🪑</span><p className="text-text-secondary text-lg">No objects found</p></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((obj: any) => (
              <Link key={obj.id} href={`/matches/objects/${obj.slug}`}
                className="group relative flex flex-col rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 overflow-hidden transition-all hover:border-neon-blue/30 hover:translate-y-[-2px] card-glow">
                <div className="relative aspect-square overflow-hidden bg-bg-tertiary/30">
                  {obj.image_url ? (
                    <Image src={obj.image_url} alt={obj.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 20vw" unoptimized />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><span className="text-5xl opacity-20">🪑</span></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/70 to-transparent" />
                  {/* Usage count badge */}
                  <div className="absolute top-2 right-2">
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-bg-primary/80 backdrop-blur-sm border border-neon-blue/20 text-neon-blue font-bold">
                      {obj.usage_count}x
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-display text-sm font-bold text-text-white group-hover:text-neon-blue transition-colors line-clamp-1">{obj.name}</h3>
                  {obj.description && <p className="text-[10px] text-text-secondary mt-1 line-clamp-2">{obj.description}</p>}
                  <p className="text-[10px] text-neon-blue font-mono mt-1">{obj.usage_count} match{obj.usage_count !== 1 ? 'es' : ''}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
        <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-text-white mb-3">About <span className="text-neon-blue">{t('matches.objects.title')}</span></h2>
          <p className="text-text-secondary text-sm leading-relaxed">A complete database of every foreign object used in WWE matches. From steel chairs to announce tables, every weapon is tracked with usage stats and full match history.</p>
        </div>
      </section>
    </div>
  )
}
