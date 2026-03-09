'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'

/* ============================================================ TYPES */
interface Manager {
  id: number; name: string; slug: string; photo_url: string | null
  gender: string | null; status: string | null; height_cm: number | null
  is_hall_of_fame: boolean; birth_country: string | null; birth_city: string | null
  birth_date: string | null; debut_date: string | null
  total_matches: number | null; win_count: number | null; loss_count: number | null; total_reigns: number | null
  manager_matches: number; manager_wins: number; manager_losses: number
}
interface Filters {
  letter: string; search: string; eraId: string; status: string; gender: string; hofOnly: boolean
  country: string; city: string; birthYear: string; minHeight: string; maxHeight: string; debutYear: string
}
interface FilterOpts {
  eras: { id: number; name: string }[]; countries: string[]; heightMin: number | null; heightMax: number | null; cities: string[]
}
interface SearchResult { id: number; name: string; slug: string; photo_url: string | null; matchedVia?: string }

const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const defaultFilters: Filters = {
  letter:'',search:'',eraId:'',status:'',gender:'',hofOnly:false,country:'',city:'',birthYear:'',minHeight:'',maxHeight:'',debutYear:'',
}
const NOW_YEAR = new Date().getFullYear()
const YEARS_BIRTH = Array.from({length:NOW_YEAR-1900+1},(_,i)=>NOW_YEAR-i)
const YEARS_DEBUT = Array.from({length:NOW_YEAR-1950+1},(_,i)=>NOW_YEAR-i)

/* ============================================================ MAIN */
export default function ManagersPageClient() {
  const [managers, setManagers] = useState<Manager[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [init, setInit] = useState(true)
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [opts, setOpts] = useState<FilterOpts>({eras:[],countries:[],heightMin:null,heightMax:null,cities:[]})
  const [showFilters, setShowFilters] = useState(true)
  const [sortBy, setSortBy] = useState('name')
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(()=>{if(typeof window!=='undefined'&&window.innerWidth<640)setShowFilters(false)},[])

  useEffect(()=>{
    const url = filters.country ? `/api/managers-filters?country=${encodeURIComponent(filters.country)}` : '/api/managers-filters'
    fetch(url).then(r=>r.json()).then(d=>setOpts(d)).catch(()=>{})
  },[filters.country])

  const fetchM = useCallback(async()=>{
    setLoading(true)
    const p = new URLSearchParams({page:String(page)})
    if(filters.letter)p.set('letter',filters.letter)
    if(filters.search)p.set('search',filters.search)
    if(filters.eraId)p.set('eraId',filters.eraId)
    if(filters.status)p.set('status',filters.status)
    if(filters.gender)p.set('gender',filters.gender)
    if(filters.hofOnly)p.set('hofOnly','true')
    if(filters.country)p.set('country',filters.country)
    if(filters.city)p.set('city',filters.city)
    if(filters.birthYear)p.set('birthYear',filters.birthYear)
    if(filters.minHeight)p.set('minHeight',filters.minHeight)
    if(filters.maxHeight)p.set('maxHeight',filters.maxHeight)
    if(filters.debutYear)p.set('debutYear',filters.debutYear)
    if(sortBy!=='name')p.set('sortBy',sortBy)
    try{const r=await fetch(`/api/managers-list?${p}`);const d=await r.json();setManagers(d.managers||[]);setTotal(d.total||0);setTotalPages(d.totalPages||0)}
    catch{setManagers([]);setTotal(0)}finally{setLoading(false);setInit(false)}
  },[page,filters,sortBy])

  useEffect(()=>{fetchM()},[fetchM])

  const upd=(k:keyof Filters,v:string|boolean)=>{setFilters(p=>({...p,[k]:v}));setPage(1)}
  const reset=()=>{setFilters(defaultFilters);setSortBy('name');setPage(1)}
  const hasF=Object.entries(filters).some(([,v])=>v!==''&&v!==false)
  const fCount=Object.entries(filters).filter(([,v])=>v!==''&&v!==false).length
  const goP=(n:number)=>{setPage(n);gridRef.current?.scrollIntoView({behavior:'smooth',block:'start'})}

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* ===== HERO ===== */}
      <section className="relative w-full h-[220px] sm:h-[300px] lg:h-[380px] xl:h-[420px] overflow-hidden">
        <Image src="https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20superstars/WM2-Ex1.jpg"
          alt="WWE Managers" fill priority sizes="100vw" quality={100} unoptimized className="object-cover object-[center_30%]"/>
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/50 to-transparent"/>
        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/30 via-transparent to-bg-primary/30"/>
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-60"/>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 sm:pb-8 lg:pb-10 px-4">
          <nav className="flex items-center gap-2 text-xs text-text-secondary mb-3">
            <Link href="/superstars" className="hover:text-neon-blue transition-colors">Superstars</Link>
            <span className="text-border-subtle">/</span>
            <span className="text-neon-blue">Managers</span>
          </nav>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-white text-center tracking-tight mb-2">
            <span className="text-neon-blue">WWE</span> Managers
          </h1>
          <p className="text-text-secondary text-sm sm:text-base lg:text-lg text-center max-w-2xl">
            The masterminds behind the superstars — managers who shaped careers, turned championship matches, and became legends in their own right.
          </p>
        </div>
      </section>

      {/* ===== DASHBOARD ===== */}
      <section ref={gridRef} className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 lg:py-10">
        <SBar onSelect={slug=>{window.location.href=`/superstars/${slug}`}} onSearch={q=>{upd('search',q);upd('letter','')}}/>

        {/* A-Z */}
        <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 mt-5">
          <button onClick={()=>{upd('letter','');upd('search','')}} className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-xs sm:text-sm font-bold transition-all ${!filters.letter?'bg-neon-blue/20 border border-neon-blue/40 text-neon-blue':'border border-border-subtle/30 text-text-secondary hover:text-text-white hover:bg-bg-secondary/50'}`}>ALL</button>
          {ALPHA.map(l=><button key={l} onClick={()=>{upd('letter',l);upd('search','')}} className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-xs sm:text-sm font-bold transition-all ${filters.letter===l?'bg-neon-blue/20 border border-neon-blue/40 text-neon-blue':'border border-border-subtle/30 text-text-secondary hover:text-text-white hover:bg-bg-secondary/50'}`}>{l}</button>)}
        </div>

        {/* Header + sort */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-6">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-text-secondary text-sm">{loading&&!init?'Searching…':`${total.toLocaleString()} manager${total!==1?'s':''}`}</p>
            <div className="flex items-center gap-1 ml-2">
              {[{k:'name',l:'A-Z'},{k:'manager_matches',l:'🎩 Most Managed'},{k:'manager_wins',l:'✅ Most Wins'},{k:'manager_losses',l:'❌ Most Losses'}].map(s=>(
                <button key={s.k} onClick={()=>{setSortBy(s.k);setPage(1)}}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${sortBy===s.k?'bg-neon-blue/15 border border-neon-blue/30 text-neon-blue':'border border-border-subtle/20 text-text-secondary hover:text-text-white'}`}>
                  {s.l}
                </button>
              ))}
            </div>
          </div>
          <button onClick={()=>setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${showFilters?'bg-neon-blue/10 border-neon-blue/30 text-neon-blue':'bg-bg-secondary/50 border-border-subtle/30 text-text-secondary hover:text-text-white'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
            {showFilters?'Hide':'Filters'}{fCount>0&&<span className="w-5 h-5 rounded-full bg-neon-blue text-[10px] text-black font-bold flex items-center justify-center">{fCount}</span>}
          </button>
        </div>

        {/* Filters */}
        {showFilters&&(
          <div className="mt-4 p-4 sm:p-5 rounded-2xl border border-border-subtle/30 bg-bg-secondary/30 backdrop-blur-sm animate-fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              <Sel label="Era" value={filters.eraId} set={v=>upd('eraId',v)} opts={opts.eras.map(e=>({value:String(e.id),label:e.name}))} ph="All eras"/>
              <Sel label="Status" value={filters.status} set={v=>upd('status',v)} opts={[{value:'active',label:'Active'},{value:'retired',label:'Retired'},{value:'deceased',label:'Deceased'}]} ph="All"/>
              <Sel label="Gender" value={filters.gender} set={v=>upd('gender',v)} opts={[{value:'male',label:'Men'},{value:'female',label:'Women'}]} ph="All"/>
              <Sel label="Country" value={filters.country} set={v=>{upd('country',v);upd('city','')}} opts={opts.countries.map(c=>({value:c,label:c}))} ph="All countries"/>
              {filters.country&&opts.cities.length>0&&<Sel label="City" value={filters.city} set={v=>upd('city',v)} opts={opts.cities.map(c=>({value:c,label:c}))} ph="All cities"/>}
              <Sel label="Birth Year" value={filters.birthYear} set={v=>upd('birthYear',v)} opts={YEARS_BIRTH.map(y=>({value:String(y),label:String(y)}))} ph="Any"/>
              <Sel label="Debut Year" value={filters.debutYear} set={v=>upd('debutYear',v)} opts={YEARS_DEBUT.map(y=>({value:String(y),label:String(y)}))} ph="Any"/>
              <div className="flex flex-col gap-1"><label className="text-[10px] text-text-secondary uppercase tracking-wider font-medium">Min Height (cm)</label>
                <input type="number" value={filters.minHeight} onChange={e=>upd('minHeight',e.target.value)} placeholder={opts.heightMin?`${opts.heightMin}`:'Min'} className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-border-subtle/40 text-sm text-text-white placeholder:text-text-secondary/50 focus:outline-none focus:border-neon-blue/50 transition-colors"/></div>
              <div className="flex flex-col gap-1"><label className="text-[10px] text-text-secondary uppercase tracking-wider font-medium">Max Height (cm)</label>
                <input type="number" value={filters.maxHeight} onChange={e=>upd('maxHeight',e.target.value)} placeholder={opts.heightMax?`${opts.heightMax}`:'Max'} className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-border-subtle/40 text-sm text-text-white placeholder:text-text-secondary/50 focus:outline-none focus:border-neon-blue/50 transition-colors"/></div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-subtle/20">
              <Tog label="🏛️ Hall of Fame only" active={filters.hofOnly} toggle={()=>upd('hofOnly',!filters.hofOnly)}/>
              {hasF&&<button onClick={reset} className="text-xs text-neon-pink hover:text-neon-pink/80 transition-colors flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>Clear all
              </button>}
            </div>
          </div>
        )}

        {/* ===== GRID ===== */}
        <div className="mt-6">
          {init?<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">{Array.from({length:20}).map((_,i)=><div key={i} className="rounded-2xl bg-bg-secondary/30 animate-pulse aspect-[3/4]"/>)}</div>
          :managers.length===0?<div className="text-center py-20"><p className="text-text-secondary text-lg mb-2">No managers found</p>{hasF&&<button onClick={reset} className="text-sm text-neon-blue hover:underline">Clear all filters</button>}</div>
          :<><div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 transition-opacity duration-200 ${loading&&!init?'opacity-50':'opacity-100'}`}>
            {managers.map(m=><MCard key={m.id} m={m}/>)}
          </div>{totalPages>1&&<Pag page={page} tp={totalPages} total={total} go={goP}/>}</>}
        </div>
      </section>

      {/* SEO */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
        <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-text-white mb-3">About the <span className="text-neon-blue">WWE Managers</span> Directory</h2>
          <p className="text-text-secondary text-sm leading-relaxed">The complete database of WWE managers — the masterminds who guided superstars to championship gold. From Bobby &ldquo;The Brain&rdquo; Heenan to Paul Heyman, every manager is listed with their ringside record: matches managed, wins and losses as a manager (not as a competitor). Filter by era, nationality, Hall of Fame status, and more.</p>
        </div>
      </section>
    </div>
  )
}

/* ============================================================ MANAGER CARD */
function MCard({m}:{m:Manager}){
  return(
    <Link href={`/superstars/${m.slug}`} className="group relative rounded-2xl border border-border-subtle/20 bg-bg-secondary/20 overflow-hidden transition-all duration-300 hover:border-neon-blue/20 hover:bg-bg-secondary/30 active:scale-[0.98]">
      <div className="relative aspect-square bg-bg-tertiary overflow-hidden">
        {m.photo_url?<Image src={m.photo_url} alt={m.name} fill className="object-cover object-top transition-transform duration-500 group-hover:scale-105" sizes="(max-width:640px)50vw,(max-width:768px)33vw,(max-width:1024px)25vw,20vw" unoptimized/>
        :<div className="w-full h-full flex items-center justify-center"><span className="text-4xl font-bold text-border-subtle">{m.name[0]}</span></div>}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/90 via-bg-primary/20 to-transparent"/>
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {m.is_hall_of_fame&&<span className="text-[9px] px-1.5 py-0.5 rounded-md bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 font-bold backdrop-blur-sm">HOF</span>}
          {m.status==='retired'&&<span className="text-[9px] px-1.5 py-0.5 rounded-md bg-text-secondary/20 border border-text-secondary/20 text-text-secondary font-medium backdrop-blur-sm">Retired</span>}
          {m.status==='deceased'&&<span className="text-[9px] px-1.5 py-0.5 rounded-md bg-red-500/20 border border-red-500/20 text-red-400 font-medium backdrop-blur-sm">Legend</span>}
        </div>
      </div>
      <div className="p-3 text-center">
        <h3 className="font-display text-sm sm:text-base font-bold text-text-white group-hover:text-neon-blue transition-colors truncate">{m.name}</h3>
        {/* Manager stats — ringside record, NOT wrestling record */}
        {m.manager_matches>0?(
          <div className="mt-1">
            <span className="text-[9px] text-text-secondary uppercase tracking-wider">as manager</span>
            <div className="flex items-center justify-center gap-2 mt-0.5">
              <span className="text-[10px] text-neon-blue font-mono font-bold">{m.manager_matches}</span>
              <span className="text-[10px] text-text-secondary">matches</span>
              <span className="text-[9px] text-text-secondary">·</span>
              <span className="text-[10px] text-emerald-400 font-mono">{m.manager_wins}W</span>
              <span className="text-[10px] text-text-secondary">-</span>
              <span className="text-[10px] text-red-400 font-mono">{m.manager_losses}L</span>
            </div>
          </div>
        ):(
          <p className="text-[10px] text-text-secondary/50 mt-1">No ringside data yet</p>
        )}
      </div>
    </Link>
  )
}

/* ============================================================ SEARCH BAR */
function SBar({onSelect,onSearch}:{onSelect:(slug:string)=>void;onSearch:(q:string)=>void}){
  const[q,setQ]=useState('');const[res,setRes]=useState<SearchResult[]>([]);const[open,setOpen]=useState(false);const[ld,setLd]=useState(false)
  const db=useRef<NodeJS.Timeout>();const cRef=useRef<HTMLDivElement>(null)
  useEffect(()=>{const h=(e:MouseEvent)=>{if(cRef.current&&!cRef.current.contains(e.target as Node))setOpen(false)};document.addEventListener('mousedown',h);return()=>document.removeEventListener('mousedown',h)},[])
  const doS=(val:string)=>{setQ(val);if(val.length<2){setRes([]);setOpen(false);return};clearTimeout(db.current)
    db.current=setTimeout(async()=>{setLd(true);try{const cl=val.replace(/^the\s+/i,'');const r=await fetch(`/api/search-superstars?q=${encodeURIComponent(val)}&limit=8`);const d=await r.json();let rs=d.results||[]
      if(cl!==val&&rs.length<3){const r2=await fetch(`/api/search-superstars?q=${encodeURIComponent(cl)}&limit=8`);const d2=await r2.json();const seen=new Set(rs.map((r:any)=>r.id));for(const s of(d2.results||[]))if(!seen.has(s.id)){rs.push(s);seen.add(s.id)}}
      setRes(rs.slice(0,8));setOpen(rs.length>0)}catch{setRes([])}finally{setLd(false)}},250)}
  return(
    <div ref={cRef} className="relative max-w-2xl mx-auto">
      <div className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <input type="text" value={q} onChange={e=>doS(e.target.value)} onFocus={()=>res.length>0&&setOpen(true)} onKeyDown={e=>{if(e.key==='Enter'&&q.length>=2){setOpen(false);onSearch(q)}}}
          placeholder="Search a manager by name, alias, or nickname…" className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-bg-secondary/50 border border-border-subtle/40 text-text-white text-sm sm:text-base placeholder:text-text-secondary/50 focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/20 transition-all"/>
        {q&&<button onClick={()=>{setQ('');setRes([]);setOpen(false);onSearch('')}} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-white"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button>}
        {ld&&<div className="absolute right-12 top-1/2 -translate-y-1/2"><div className="w-4 h-4 border-2 border-neon-blue/30 border-t-neon-blue rounded-full animate-spin"/></div>}
      </div>
      {open&&res.length>0&&(
        <div className="absolute top-full left-0 right-0 mt-2 bg-bg-secondary/95 backdrop-blur-xl border border-border-subtle/40 rounded-2xl overflow-hidden shadow-2xl z-50 max-h-[380px] overflow-y-auto">
          <div className="h-[2px] bg-gradient-to-r from-transparent via-neon-blue to-transparent"/>
          {res.map(s=>(
            <button key={s.id} onClick={()=>{onSelect(s.slug);setOpen(false)}} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neon-blue/5 transition-colors text-left border-b border-border-subtle/10 last:border-0">
              <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-bg-tertiary border border-border-subtle/30">
                {s.photo_url?<Image src={s.photo_url} alt="" width={40} height={40} className="w-full h-full object-cover object-top" unoptimized/>:<div className="w-full h-full flex items-center justify-center text-sm font-bold text-border-subtle">{s.name[0]}</div>}
              </div>
              <div className="min-w-0 flex-1"><span className="text-sm font-medium text-text-white block truncate">{s.name}</span>{s.matchedVia&&<span className="text-[10px] text-text-secondary">aka &ldquo;{s.matchedVia}&rdquo;</span>}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ============================================================ PAGINATION */
function Pag({page,tp,total,go}:{page:number;tp:number;total:number;go:(n:number)=>void}){
  const vis=()=>{const p:(number|'e')[]=[];if(tp<=7){for(let i=1;i<=tp;i++)p.push(i)}else{p.push(1);if(page>3)p.push('e');for(let i=Math.max(2,page-1);i<=Math.min(tp-1,page+1);i++)p.push(i);if(page<tp-2)p.push('e');p.push(tp)};return p}
  return(
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-border-subtle/20">
      <p className="text-xs text-text-secondary">Page {page}/{tp} — {total.toLocaleString()} managers</p>
      <div className="flex items-center gap-1">
        <button onClick={()=>go(page-1)} disabled={page===1} className="w-8 h-8 rounded-lg border border-border-subtle/30 flex items-center justify-center text-text-secondary hover:text-text-white disabled:opacity-30 transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg></button>
        {vis().map((p,i)=>p==='e'?<span key={`e${i}`} className="w-8 text-center text-text-secondary text-xs">…</span>:<button key={p} onClick={()=>go(p as number)} className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${p===page?'bg-neon-blue/20 border border-neon-blue/40 text-neon-blue':'border border-transparent text-text-secondary hover:text-text-white hover:bg-bg-secondary/50'}`}>{p}</button>)}
        <button onClick={()=>go(page+1)} disabled={page===tp} className="w-8 h-8 rounded-lg border border-border-subtle/30 flex items-center justify-center text-text-secondary hover:text-text-white disabled:opacity-30 transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg></button>
      </div>
    </div>
  )
}

/* ============================================================ HELPERS */
function Sel({label,value,set,opts,ph}:{label:string;value:string;set:(v:string)=>void;opts:{value:string;label:string}[];ph:string}){
  return(<div className="flex flex-col gap-1"><label className="text-[10px] text-text-secondary uppercase tracking-wider font-medium">{label}</label>
    <select value={value} onChange={e=>set(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-border-subtle/40 text-sm text-text-white focus:outline-none focus:border-neon-blue/50 transition-colors appearance-none cursor-pointer"
      style={{backgroundImage:`url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23666' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,backgroundPosition:'right 8px center',backgroundRepeat:'no-repeat',backgroundSize:'16px',paddingRight:'32px'}}>
      <option value="">{ph}</option>{opts.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
    </select></div>)
}
function Tog({label,active,toggle}:{label:string;active:boolean;toggle:()=>void}){
  return(<label className="flex items-center gap-2 cursor-pointer group"><div className={`w-9 h-5 rounded-full relative transition-colors cursor-pointer ${active?'bg-yellow-500/40':'bg-bg-tertiary'}`} onClick={toggle}><div className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform ${active?'translate-x-[18px] bg-yellow-400':'translate-x-[2px] bg-text-secondary'}`}/></div><span className="text-xs text-text-secondary group-hover:text-text-white transition-colors">{label}</span></label>)
}
