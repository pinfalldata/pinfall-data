'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { StarRating } from '@/components/ui/StarRating'
import { formatDateShort, isBattleRoyalType } from '@/lib/utils'

/* ============================================================
   TYPES
   ============================================================ */
interface Team {
  team_number: number
  is_winner: boolean
  members: { id: number; name: string; slug: string; photo_url: string | null }[]
}

interface MatchData {
  id: number; slug: string; date: string; duration_seconds: number | null
  rating: number | null; result_type: string | null; is_title_change: boolean
  is_dark_match: boolean; isDraw: boolean
  match_type: { id: number; name: string; slug: string } | null
  championship: { id: number; name: string; slug: string; image_url: string | null } | null
  show: {
    id: number; name: string; slug: string; city: string | null; country: string | null
    show_series: { id: number; name: string; short_name: string | null; logo_url: string | null } | null
  } | null
  teams: Team[]; participantCount: number
  omg: { id: number; title: string; category: string } | null
}

interface Filters {
  year: string; month: string
  superstarId: string; superstarName: string
  opponentId: string; opponentName: string
  teammateId: string; teammateName: string
  showSeriesId: string; matchTypeId: string
  minRating: string; resultType: string
  country: string; city: string
  championshipId: string; championshipOnly: boolean
  titleChangeOnly: boolean; omgOnly: boolean
}

interface FilterOptions {
  matchTypes: { id: number; name: string; match_count?: number }[]
  showSeries: { id: number; name: string; short_name: string | null }[]
  championships: { id: number; name: string; image_url: string | null }[]
  countries: string[]
}

const PER_PAGE = 50
const defaultFilters: Filters = {
  year:'',month:'',superstarId:'',superstarName:'',opponentId:'',opponentName:'',
  teammateId:'',teammateName:'',showSeriesId:'',matchTypeId:'',minRating:'',
  resultType:'',country:'',city:'',championshipId:'',championshipOnly:false,
  titleChangeOnly:false,omgOnly:false,
}

const YEAR0 = 1953
const NOW_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: NOW_YEAR - YEAR0 + 1 }, (_, i) => NOW_YEAR - i)

const RESULT_TYPES = [
  {value:'pinfall',label:'Pinfall'},{value:'submission',label:'Submission'},
  {value:'dq',label:'Disqualification'},{value:'count_out',label:'Count Out'},
  {value:'ko',label:'Knockout'},{value:'referee_stoppage',label:'Referee Stoppage'},
  {value:'escape',label:'Escape'},{value:'retrieve',label:'Retrieve'},
  {value:'last_elimination',label:'Last Elimination'},{value:'forfeit',label:'Forfeit'},
  {value:'no_contest',label:'No Contest'},{value:'time_limit_draw',label:'Time Limit Draw'},
  {value:'other',label:'Other'},
]

/* ============================================================
   MAIN PAGE
   ============================================================ */
export default function MatchSearchPage() {
  const [matches, setMatches] = useState<MatchData[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [init, setInit] = useState(true)
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [opts, setOpts] = useState<FilterOptions>({ matchTypes:[], showSeries:[], championships:[], countries:[] })
  const [showF, setShowF] = useState(true)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => { if (typeof window !== 'undefined' && window.innerWidth < 640) setShowF(false) }, [])

  useEffect(() => {
    fetch('/api/match-search-filters').then(r=>r.json()).then(d=>setOpts(d)).catch(()=>{})
  }, [])

  const fetchM = useCallback(async () => {
    setLoading(true)
    const p = new URLSearchParams({ page: String(page), limit: String(PER_PAGE) })
    if (filters.year) p.set('year', filters.year)
    if (filters.year && filters.month) p.set('month', filters.month)
    if (filters.superstarId) p.set('superstarId', filters.superstarId)
    if (filters.opponentId) p.set('opponentId', filters.opponentId)
    if (filters.teammateId) p.set('teammateId', filters.teammateId)
    if (filters.showSeriesId) p.set('showSeriesId', filters.showSeriesId)
    if (filters.matchTypeId) p.set('matchTypeId', filters.matchTypeId)
    if (filters.minRating) p.set('minRating', filters.minRating)
    if (filters.resultType) p.set('resultType', filters.resultType)
    if (filters.country) p.set('country', filters.country)
    if (filters.city) p.set('city', filters.city)
    if (filters.championshipId) p.set('championshipId', filters.championshipId)
    if (filters.championshipOnly) p.set('championshipOnly', 'true')
    if (filters.titleChangeOnly) p.set('titleChangeOnly', 'true')
    if (filters.omgOnly) p.set('omgOnly', 'true')
    try {
      const r = await fetch(`/api/match-search?${p.toString()}`)
      const d = await r.json()
      setMatches(d.matches || []); setTotal(d.total || 0); setTotalPages(d.totalPages || 0)
    } catch { setMatches([]); setTotal(0) }
    finally { setLoading(false); setInit(false) }
  }, [page, filters])

  useEffect(() => { fetchM() }, [fetchM])

  const upd = (k: keyof Filters, v: string|boolean) => { setFilters(p=>({...p,[k]:v})); setPage(1) }
  const reset = () => { setFilters(defaultFilters); setPage(1) }
  const hasF = Object.entries(filters).some(([,v])=>v!==''&&v!==false)
  const fCount = Object.entries(filters).filter(([,v])=>v!==''&&v!==false).length
  const goP = (n:number) => { setPage(n); ref.current?.scrollIntoView({behavior:'smooth',block:'start'}) }

  return (
    <div className="relative">
      {/* ===== HERO ===== */}
      <section className="relative w-full h-[220px] sm:h-[300px] lg:h-[380px] xl:h-[420px] overflow-hidden">
        <Image src="https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page/pagesearchmatch.webp"
          alt="WWE Match Search" fill priority sizes="100vw" quality={100} unoptimized
          className="object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/30 via-transparent to-bg-primary/30" />
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-60" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 sm:pb-8 lg:pb-10 px-4">
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-white text-center tracking-tight mb-2">
            <span className="text-neon-blue">Match</span> Search
          </h1>
          <p className="text-text-secondary text-sm sm:text-base lg:text-lg text-center max-w-2xl">
            Search through every WWE match ever recorded with the most powerful filters available.
          </p>
        </div>
      </section>

      {/* ===== CONTENT ===== */}
      <section ref={ref} className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 lg:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
          <p className="text-text-secondary text-sm">
            {loading && !init ? 'Searching…' : `${total.toLocaleString()} match${total!==1?'es':''} found`}
          </p>
          <button onClick={()=>setShowF(!showF)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${showF?'bg-neon-blue/10 border-neon-blue/30 text-neon-blue':'bg-bg-secondary/50 border-border-subtle/30 text-text-secondary hover:text-text-white'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
            {showF ? 'Hide Filters' : 'Show Filters'}
            {fCount>0 && <span className="w-5 h-5 rounded-full bg-neon-blue text-[10px] text-black font-bold flex items-center justify-center">{fCount}</span>}
          </button>
        </div>

        {/* ===== FILTERS ===== */}
        {showF && (
          <div className="mb-6 p-4 sm:p-5 rounded-2xl border border-border-subtle/30 bg-bg-secondary/30 backdrop-blur-sm animate-fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              <Sel label="Year" value={filters.year} set={v=>upd('year',v)} opts={YEARS.map(y=>({value:String(y),label:String(y)}))} ph="All years"/>
              {filters.year && <Sel label="Month" value={filters.month} set={v=>upd('month',v)}
                opts={Array.from({length:12},(_,i)=>({value:String(i+1),label:new Date(2000,i).toLocaleString('en-US',{month:'long'})}))} ph="All months"/>}
              <Sel label="Promotion" value={filters.showSeriesId} set={v=>upd('showSeriesId',v)}
                opts={opts.showSeries.map(s=>({value:String(s.id),label:s.name}))} ph="All promotions"/>
              <Sel label="Match Type" value={filters.matchTypeId} set={v=>upd('matchTypeId',v)}
                opts={opts.matchTypes.map(t=>({value:String(t.id),label:t.name}))} ph="All types"/>
              <Sel label="Min. Rating" value={filters.minRating} set={v=>upd('minRating',v)}
                opts={Array.from({length:11},(_,i)=>({value:String(i),label:`${i}+/10`}))} ph="Any rating"/>
              <Sel label="Finish Type" value={filters.resultType} set={v=>upd('resultType',v)} opts={RESULT_TYPES} ph="Any finish"/>
              <Sel label="Country" value={filters.country} set={v=>upd('country',v)}
                opts={opts.countries.map(c=>({value:c,label:c}))} ph="All countries"/>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-text-secondary uppercase tracking-wider font-medium">City</label>
                <input type="text" value={filters.city} onChange={e=>upd('city',e.target.value)} placeholder="e.g. New York"
                  className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-border-subtle/40 text-sm text-text-white placeholder:text-text-secondary/50 focus:outline-none focus:border-neon-blue/50 transition-colors"/>
              </div>
              <SSrch label="Superstar" ph="Search superstar…" value={filters.superstarName}
                onSel={(id,n)=>{upd('superstarId',id);setFilters(p=>({...p,superstarName:n}))}}
                onClr={()=>{upd('superstarId','');setFilters(p=>({...p,superstarName:''}))}}/>
              {filters.superstarId && <>
                <SSrch label="Opponent" ph="Search opponent…" value={filters.opponentName}
                  onSel={(id,n)=>{upd('opponentId',id);setFilters(p=>({...p,opponentName:n}))}}
                  onClr={()=>{upd('opponentId','');setFilters(p=>({...p,opponentName:''}))}}/>
                <SSrch label="Teammate" ph="Search teammate…" value={filters.teammateName}
                  onSel={(id,n)=>{upd('teammateId',id);setFilters(p=>({...p,teammateName:n}))}}
                  onClr={()=>{upd('teammateId','');setFilters(p=>({...p,teammateName:''}))}}/>
              </>}
              <Sel label="Championship" value={filters.championshipId} set={v=>upd('championshipId',v)}
                opts={opts.championships.map(c=>({value:String(c.id),label:c.name}))} ph="All championships"/>
            </div>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-subtle/20">
              <div className="flex items-center gap-4 flex-wrap">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-9 h-5 rounded-full relative transition-colors cursor-pointer ${filters.championshipOnly?'bg-yellow-500/40':'bg-bg-tertiary'}`}
                    onClick={()=>upd('championshipOnly',!filters.championshipOnly)}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform ${filters.championshipOnly?'translate-x-[18px] bg-yellow-400':'translate-x-[2px] bg-text-secondary'}`}/>
                  </div>
                  <span className="text-xs text-text-secondary group-hover:text-text-white transition-colors">🏆 Championship matches only</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-9 h-5 rounded-full relative transition-colors cursor-pointer ${filters.titleChangeOnly?'bg-yellow-500/40':'bg-bg-tertiary'}`}
                    onClick={()=>upd('titleChangeOnly',!filters.titleChangeOnly)}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform ${filters.titleChangeOnly?'translate-x-[18px] bg-yellow-400':'translate-x-[2px] bg-text-secondary'}`}/>
                  </div>
                  <span className="text-xs text-text-secondary group-hover:text-text-white transition-colors">🔄 Title changes only</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-9 h-5 rounded-full relative transition-colors cursor-pointer ${filters.omgOnly?'bg-purple-500/40':'bg-bg-tertiary'}`}
                    onClick={()=>upd('omgOnly',!filters.omgOnly)}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform ${filters.omgOnly?'translate-x-[18px] bg-purple-400':'translate-x-[2px] bg-text-secondary'}`}/>
                  </div>
                  <span className="text-xs text-text-secondary group-hover:text-text-white transition-colors">⚡ OMG Moments only</span>
                </label>
              </div>
              {hasF && <button onClick={reset} className="text-xs text-neon-pink hover:text-neon-pink/80 transition-colors flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                Clear all filters
              </button>}
            </div>
          </div>
        )}

        {/* ===== MATCH LIST ===== */}
        {init ? (
          <div className="space-y-2">{Array.from({length:10}).map((_,i)=><div key={i} className="h-[72px] rounded-xl bg-bg-secondary/30 animate-pulse"/>)}</div>
        ) : matches.length===0 ? (
          <div className="text-center py-20">
            <svg className="w-16 h-16 mx-auto text-text-secondary/20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <p className="text-text-secondary text-lg mb-2">No matches found</p>
            <p className="text-text-secondary/60 text-sm mb-4">Try adjusting your filters</p>
            {hasF && <button onClick={reset} className="text-sm text-neon-blue hover:underline">Clear all filters</button>}
          </div>
        ) : (
          <>
            {/* Desktop header */}
            <div className="hidden lg:grid lg:grid-cols-[90px_minmax(120px,1.2fr)_130px_minmax(250px,3fr)_100px_55px] gap-3 px-4 pb-2 text-[10px] text-text-secondary uppercase tracking-wider font-medium border-b border-border-subtle/20">
              <span>Date</span><span>Show</span><span>Type</span><span>Participants</span><span>Title</span><span className="text-center">Rating</span>
            </div>
            <div className={`space-y-0.5 mt-0.5 transition-opacity duration-200 ${loading&&!init?'opacity-50':'opacity-100'}`}>
              {matches.map(m=><MRow key={m.id} m={m}/>)}
            </div>
            {totalPages>1 && <Pag page={page} tp={totalPages} total={total} go={goP}/>}
          </>
        )}
      </section>

      {/* ===== SEO CONTENT ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
        <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-text-white mb-3">
            About the <span className="text-neon-blue">Match Search Engine</span>
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed mb-3">
            The most powerful WWE match search engine ever built. Filter through every match in history by year, promotion,
            match type, rating, finish type, country, city, specific superstar, opponent, teammate, and championship.
          </p>
          <p className="text-text-secondary text-sm leading-relaxed">
            Whether you&apos;re researching WrestleMania main events, tracking a superstar&apos;s career against a specific rival,
            or finding the highest-rated Steel Cage matches of all time — this search has you covered.
          </p>
        </div>
      </section>
    </div>
  )
}

/* ============================================================
   MATCH ROW
   ============================================================ */
function MRow({ m }: { m: MatchData }) {
  const isBR = isBattleRoyalType(m.match_type?.name||null)
  const many = m.participantCount > 10
  const showP = !many && !isBR
  const teams = m.teams || []

  return (
    <Link href={`/shows/${m.show?.slug}/matches/${m.slug}`} className="block group">
      {/* Desktop */}
      <div className="hidden lg:grid lg:grid-cols-[90px_minmax(120px,1.2fr)_130px_minmax(250px,3fr)_100px_55px] gap-3 items-center px-4 py-3.5 rounded-lg border border-transparent transition-all duration-150 hover:bg-bg-secondary/40 hover:border-border-subtle/20">
        <span className="text-xs text-text-secondary font-mono whitespace-nowrap">{m.date?formatDateShort(m.date):'—'}</span>
        <div className="flex items-center gap-2 min-w-0">
          {m.show?.show_series?.logo_url && <div className="w-5 h-5 rounded overflow-hidden shrink-0"><Image src={m.show.show_series.logo_url} alt="" width={20} height={20} className="w-full h-full object-contain"/></div>}
          <span className="text-sm text-text-white truncate">{m.show?.name||'—'}</span>
        </div>
        <span className="text-xs text-neon-blue font-semibold truncate uppercase">{m.match_type?.name||'Match'}</span>
        <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
          {m.omg && (() => {
            const oc: Record<string,string> = { extreme:'#ef4444',wtf:'#a855f7',sexy:'#ec4899',return:'#22c55e',betrayal:'#f97316',emotional:'#3b82f6' }
            const c = oc[m.omg.category] || '#c7a05a'
            return <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider shrink-0" style={{background:`${c}15`,color:c,border:`1px solid ${c}35`}}>⚡ OMG</span>
          })()}
          {showP ? teams.map((t,i)=>(
            <span key={i} className="flex items-center gap-1 min-w-0 shrink-0">
              {i>0 && <span className="text-[11px] text-neon-blue font-bold mx-0.5 shrink-0">vs</span>}
              <div className="flex -space-x-1.5 shrink-0">
                {t.members.slice(0,3).map(p=>(
                  <div key={p.id} className={`w-7 h-7 rounded-full overflow-hidden border-2 ${t.is_winner?'border-emerald-500/40':m.isDraw?'border-yellow-500/30':'border-bg-primary'}`}>
                    {p.photo_url?<Image src={p.photo_url} alt="" width={28} height={28} className="w-full h-full object-cover"/>:<div className="w-full h-full bg-bg-tertiary"/>}
                  </div>
                ))}
                {t.members.length>3 && <div className="w-7 h-7 rounded-full bg-bg-tertiary border-2 border-bg-primary flex items-center justify-center text-[8px] text-text-secondary">+{t.members.length-3}</div>}
              </div>
              <span className={`text-xs truncate max-w-[140px] ${t.is_winner?'text-emerald-400 font-semibold':'text-text-white'}`}>{t.members.map(p=>p.name).join(', ')}</span>
              {t.is_winner && <span className="text-[9px] text-emerald-400 font-bold shrink-0">✓</span>}
            </span>
          )) : <span className="text-xs text-text-secondary italic truncate">{m.match_type?.name||'Match'} — {m.participantCount} participants</span>}
        </div>
        <div className="flex items-center gap-1.5 min-w-0">
          {m.championship ? <>
            {m.championship.image_url && <div className="w-7 h-5 shrink-0"><Image src={m.championship.image_url} alt="" width={28} height={20} className="w-full h-full object-contain"/></div>}
            <span className="text-[10px] text-yellow-400 font-medium truncate">{m.championship.name}</span>
            {m.is_title_change && <span className="text-[8px] px-1 py-0.5 rounded bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 font-bold shrink-0">NEW!</span>}
          </> : <span className="text-[10px] text-text-secondary/30">—</span>}
        </div>
        <div className="flex justify-center">{m.rating?<StarRating rating={m.rating} size="xs"/>:<span className="text-[10px] text-text-secondary/30">—</span>}</div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden px-3 py-3.5 rounded-xl border border-transparent transition-all hover:bg-bg-secondary/40 hover:border-border-subtle/20">
        <div className="flex items-center gap-2 mb-2">
          {m.show?.show_series?.logo_url && <div className="w-4 h-4 rounded overflow-hidden shrink-0"><Image src={m.show.show_series.logo_url} alt="" width={16} height={16} className="w-full h-full object-contain"/></div>}
          <span className="text-[11px] text-text-secondary truncate flex-1">{m.show?.name}</span>
          <span className="text-[10px] text-text-secondary font-mono shrink-0">{m.date?formatDateShort(m.date):''}</span>
        </div>
        <div className="space-y-1.5">
          {showP ? teams.map((t,i)=>(
            <div key={i} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-[9px] font-bold border ${t.is_winner?'bg-emerald-500/10 border-emerald-500/20 text-emerald-400':m.isDraw?'bg-yellow-500/10 border-yellow-500/20 text-yellow-400':'bg-bg-tertiary/50 border-border-subtle/20 text-text-secondary/50'}`}>
                {t.is_winner?'W':m.isDraw?'D':'L'}
              </div>
              <div className="flex -space-x-1 shrink-0">
                {t.members.slice(0,3).map(p=>(
                  <div key={p.id} className="w-6 h-6 rounded-full overflow-hidden border border-bg-primary">
                    {p.photo_url?<Image src={p.photo_url} alt="" width={24} height={24} className="w-full h-full object-cover"/>:<div className="w-full h-full bg-bg-tertiary"/>}
                  </div>
                ))}
              </div>
              <span className={`text-xs truncate ${t.is_winner?'text-text-white font-medium':'text-text-secondary'}`}>{t.members.map(p=>p.name).join(', ')}</span>
            </div>
          )) : <div className="text-xs text-text-secondary">{m.match_type?.name||'Match'} — {m.participantCount} participants</div>}
        </div>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className="text-[10px] text-neon-blue font-semibold uppercase">{m.match_type?.name||'Match'}</span>
          {m.omg && (() => {
            const oc: Record<string,string> = { extreme:'#ef4444',wtf:'#a855f7',sexy:'#ec4899',return:'#22c55e',betrayal:'#f97316',emotional:'#3b82f6' }
            const c = oc[m.omg.category] || '#c7a05a'
            return <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider shrink-0" style={{background:`${c}15`,color:c,border:`1px solid ${c}35`}}>⚡ OMG</span>
          })()}
          {m.championship && <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-bold">🏆 {m.championship.name}</span>}
          {m.rating && <div className="ml-auto shrink-0"><StarRating rating={m.rating} size="xs"/></div>}
        </div>
      </div>
    </Link>
  )
}

/* ============================================================
   PAGINATION
   ============================================================ */
function Pag({ page,tp,total,go }:{page:number;tp:number;total:number;go:(n:number)=>void}) {
  const vis = () => {
    const p:(number|'e')[] = []
    if(tp<=7){for(let i=1;i<=tp;i++)p.push(i)}
    else{p.push(1);if(page>3)p.push('e');for(let i=Math.max(2,page-1);i<=Math.min(tp-1,page+1);i++)p.push(i);if(page<tp-2)p.push('e');p.push(tp)}
    return p
  }
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-border-subtle/20">
      <p className="text-xs text-text-secondary">Page {page} of {tp} — {total.toLocaleString()} matches</p>
      <div className="flex items-center gap-1">
        <button onClick={()=>go(page-1)} disabled={page===1} className="w-8 h-8 rounded-lg border border-border-subtle/30 flex items-center justify-center text-text-secondary hover:text-text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
        </button>
        {vis().map((p,i)=>p==='e'?<span key={`e${i}`} className="w-8 text-center text-text-secondary text-xs">…</span>:
          <button key={p} onClick={()=>go(p as number)} className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${p===page?'bg-neon-blue/20 border border-neon-blue/40 text-neon-blue':'border border-transparent text-text-secondary hover:text-text-white hover:bg-bg-secondary/50'}`}>{p}</button>)}
        <button onClick={()=>go(page+1)} disabled={page===tp} className="w-8 h-8 rounded-lg border border-border-subtle/30 flex items-center justify-center text-text-secondary hover:text-text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
        </button>
      </div>
    </div>
  )
}

/* ============================================================
   FILTER SELECT
   ============================================================ */
function Sel({label,value,set,opts,ph}:{label:string;value:string;set:(v:string)=>void;opts:{value:string;label:string}[];ph:string}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] text-text-secondary uppercase tracking-wider font-medium">{label}</label>
      <select value={value} onChange={e=>set(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-border-subtle/40 text-sm text-text-white focus:outline-none focus:border-neon-blue/50 transition-colors appearance-none cursor-pointer"
        style={{backgroundImage:`url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23666' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,backgroundPosition:'right 8px center',backgroundRepeat:'no-repeat',backgroundSize:'16px',paddingRight:'32px'}}>
        <option value="">{ph}</option>
        {opts.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

/* ============================================================
   SUPERSTAR SEARCH
   ============================================================ */
function SSrch({label,ph,value,onSel,onClr}:{label:string;ph:string;value:string;onSel:(id:string,n:string)=>void;onClr:()=>void}) {
  const [q,setQ]=useState(value)
  const [res,setRes]=useState<any[]>([])
  const [open,setOpen]=useState(false)
  const db=useRef<NodeJS.Timeout>()
  const cRef=useRef<HTMLDivElement>(null)
  useEffect(()=>{setQ(value)},[value])
  useEffect(()=>{
    const h=(e:MouseEvent)=>{if(cRef.current&&!cRef.current.contains(e.target as Node))setOpen(false)}
    document.addEventListener('mousedown',h); return ()=>document.removeEventListener('mousedown',h)
  },[])
  const search=(v:string)=>{
    setQ(v); if(v.length<2){setRes([]);setOpen(false);return}
    clearTimeout(db.current)
    db.current=setTimeout(async()=>{
      try{const r=await fetch(`/api/search-superstars?q=${encodeURIComponent(v)}`);const d=await r.json();setRes(d.results||[]);setOpen(true)}catch{setRes([])}
    },300)
  }
  return (
    <div ref={cRef} className="flex flex-col gap-1 relative">
      <label className="text-[10px] text-text-secondary uppercase tracking-wider font-medium">{label}</label>
      <div className="relative">
        <input type="text" value={q} onChange={e=>search(e.target.value)} onFocus={()=>res.length>0&&setOpen(true)} placeholder={ph}
          className="w-full px-3 py-2 pr-8 rounded-lg bg-bg-primary border border-border-subtle/40 text-sm text-text-white placeholder:text-text-secondary/50 focus:outline-none focus:border-neon-blue/50 transition-colors"/>
        {value && <button onClick={()=>{onClr();setQ('');setRes([]);setOpen(false)}} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-white">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
        </button>}
      </div>
      {open&&res.length>0&&(
        <div className="absolute top-full left-0 right-0 mt-1 bg-bg-secondary border border-border-subtle/40 rounded-xl overflow-hidden shadow-xl z-50 max-h-48 overflow-y-auto">
          {res.map((s:any)=>(
            <button key={s.id} onClick={()=>{onSel(String(s.id),s.name);setQ(s.name);setOpen(false)}}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-white hover:bg-bg-tertiary transition-colors text-left">
              {s.photo_url && <div className="w-6 h-6 rounded-full overflow-hidden shrink-0"><Image src={s.photo_url} alt="" width={24} height={24} className="w-full h-full object-cover"/></div>}
              <span className="truncate">{s.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
