// @ts-nocheck
import { supabase } from './supabase'

/**
 * Ce fichier utilise @ts-nocheck pour ignorer les erreurs de typage strictes.
 * Objectif : garder les relations complexes sans casser le build TS.
 */

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
function logError(label: string, error: any) {
  if (!error) return
  console.error(`[queries] ${label}`, error)
}

/**
 * Fetch match_championships for a set of match IDs (multi-championship support).
 */
async function fetchMatchChampionships(matchIds: number[]): Promise<Map<number, any[]>> {
  const map = new Map<number, any[]>()
  if (!matchIds.length) return map
  try {
    const { data: rows } = await supabase.from('match_championships').select('match_id, championship_id, is_title_change').in('match_id', matchIds)
    if (!rows || rows.length === 0) return map
    const champIds = [...new Set(rows.map(r => r.championship_id))]
    const { data: champs } = await supabase.from('championships').select('id, name, slug, image_url').in('id', champIds)
    const champMap = new Map((champs || []).map(c => [c.id, c]))
    for (const r of rows) {
      const c = champMap.get(r.championship_id)
      if (!c) continue
      if (!map.has(r.match_id)) map.set(r.match_id, [])
      map.get(r.match_id)!.push({ ...c, is_title_change: r.is_title_change || false })
    }
  } catch (err) { logError('fetchMatchChampionships', err) }
  return map
}

/**
 * ★ Dynamic superstar photos by year.
 * Given matches with participants, replace each superstar's photo_url
 * with the era-appropriate photo from superstar_photos table.
 * Falls back to the original photo_url if no entry exists.
 */
async function applyEraPhotos(matches: any[], showYear: number | null) {
  if (!showYear || !matches || matches.length === 0) return

  // Collect all unique superstar IDs from participants, managers, referees
  const sids = new Set<number>()
  for (const m of matches) {
    for (const p of (m.participants || [])) {
      if (p.superstar?.id) sids.add(p.superstar.id)
    }
    for (const mg of (m.managers || [])) {
      if (mg.superstar?.id) sids.add(mg.superstar.id)
      if (mg.managing_for?.id) sids.add(mg.managing_for.id)
    }
    for (const r of (m.referees || [])) {
      if (r.superstar?.id) sids.add(r.superstar.id)
    }
  }
  if (sids.size === 0) return

  // Batch-fetch all photos for these superstars
  try {
    const { data: photos } = await supabase
      .from('superstar_photos')
      .select('superstar_id, year, photo_url')
      .in('superstar_id', [...sids].slice(0, 500))
      .order('year', { ascending: true })

    if (!photos || photos.length === 0) return

    // Build map: superstarId → [{year, photo_url}, ...]
    const photoMap = new Map<number, { year: number; photo_url: string }[]>()
    for (const p of photos) {
      if (!photoMap.has(p.superstar_id)) photoMap.set(p.superstar_id, [])
      photoMap.get(p.superstar_id)!.push({ year: p.year, photo_url: p.photo_url })
    }

    // Helper: pick the best photo for a given year
    const pick = (sid: number, fallback: string | null): string | null => {
      const list = photoMap.get(sid)
      if (!list || list.length === 0) return fallback
      // Find the closest year <= showYear, or the earliest available
      let best = list[0]
      for (const p of list) {
        if (p.year <= showYear) best = p
        else break // sorted ascending, so first > showYear means we passed it
      }
      return best.photo_url
    }

    // Override photo_url in-place for all participants
    for (const m of matches) {
      for (const p of (m.participants || [])) {
        if (p.superstar?.id && photoMap.has(p.superstar.id)) {
          p.superstar.photo_url = pick(p.superstar.id, p.superstar.photo_url)
        }
      }
      for (const mg of (m.managers || [])) {
        if (mg.superstar?.id && photoMap.has(mg.superstar.id)) {
          mg.superstar.photo_url = pick(mg.superstar.id, mg.superstar.photo_url)
        }
        if (mg.managing_for?.id && photoMap.has(mg.managing_for.id)) {
          mg.managing_for.photo_url = pick(mg.managing_for.id, mg.managing_for.photo_url)
        }
      }
      for (const r of (m.referees || [])) {
        if (r.superstar?.id && photoMap.has(r.superstar.id)) {
          r.superstar.photo_url = pick(r.superstar.id, r.superstar.photo_url)
        }
      }
    }
  } catch (err) {
    logError('applyEraPhotos', err)
  }
}

// ============================================================
// SUPERSTAR
// ============================================================
export async function getSuperstarBySlug(slug: string) {
  const { data: superstar, error } = await supabase
    .from('superstars')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !superstar) {
    logError('getSuperstarBySlug(superstars)', error)
    return null
  }

  const [
    { data: roles, error: rolesError },
    { data: eras, error: erasError },
    { data: nicknames, error: nicknamesError },
    { data: aliases, error: aliasesError },
    { data: finishers, error: finishersError },
    { data: themes, error: themesError },
    { data: timeline, error: timelineError },
    { data: draftHistory, error: draftError },
    { data: careerBreaks, error: breaksError },
    { data: families, error: familiesError },
    { data: trainers, error: trainersError },
    { data: socialLinks, error: socialError },
    { data: books, error: booksError },
    { data: films, error: filmsError },
  ] = await Promise.all([
    supabase.from('superstar_roles').select('*').eq('superstar_id', superstar.id).order('is_primary', { ascending: false }),
    supabase.from('superstar_eras').select('*, eras(*)').eq('superstar_id', superstar.id).order('era_id', { ascending: true }),
    supabase.from('superstar_nicknames').select('*').eq('superstar_id', superstar.id).order('sort_order', { ascending: true }),
    supabase.from('superstar_aliases').select('*').eq('superstar_id', superstar.id).order('start_date', { ascending: true }),
    supabase.from('finishers').select('*').eq('superstar_id', superstar.id),
    supabase.from('entrance_themes').select('*').eq('superstar_id', superstar.id).order('start_date', { ascending: true }),
    supabase.from('superstar_timeline').select('*').eq('superstar_id', superstar.id).order('sort_order', { ascending: true }),
    supabase.from('superstar_draft_history').select('*').eq('superstar_id', superstar.id).order('draft_date', { ascending: true }),
    supabase.from('superstar_career_breaks').select('*').eq('superstar_id', superstar.id).order('start_date', { ascending: true }),
    supabase
      .from('superstar_families')
      .select('*, related:superstars!superstar_families_related_superstar_id_fkey(id, name, slug, photo_url)')
      .eq('superstar_id', superstar.id),
    supabase
      .from('superstar_trainers')
      .select('*, trainer:superstars!superstar_trainers_trainer_id_fkey(id, name, slug)')
      .eq('superstar_id', superstar.id),
    supabase.from('superstar_social_links').select('*').eq('superstar_id', superstar.id),
    supabase.from('books').select('*').eq('superstar_id', superstar.id).order('year', { ascending: false }),
    supabase.from('films').select('*').eq('superstar_id', superstar.id),
  ])

  logError('getSuperstarBySlug(roles)', rolesError)
  logError('getSuperstarBySlug(eras)', erasError)
  logError('getSuperstarBySlug(nicknames)', nicknamesError)
  logError('getSuperstarBySlug(aliases)', aliasesError)
  logError('getSuperstarBySlug(finishers)', finishersError)
  logError('getSuperstarBySlug(themes)', themesError)
  logError('getSuperstarBySlug(timeline)', timelineError)
  logError('getSuperstarBySlug(draftHistory)', draftError)
  logError('getSuperstarBySlug(careerBreaks)', breaksError)
  logError('getSuperstarBySlug(families)', familiesError)
  logError('getSuperstarBySlug(trainers)', trainersError)
  logError('getSuperstarBySlug(socialLinks)', socialError)
  logError('getSuperstarBySlug(books)', booksError)
  logError('getSuperstarBySlug(films)', filmsError)

  return {
    ...superstar,
    roles: roles || [],
    eras: eras || [],
    nicknames: nicknames || [],
    aliases: aliases || [],
    finishers: finishers || [],
    themes: themes || [],
    timeline: timeline || [],
    draftHistory: draftHistory || [],
    careerBreaks: careerBreaks || [],
    families: families || [],
    trainers: trainers || [],
    socialLinks: socialLinks || [],
    books: books || [],
    films: films || [],
  }
}

// ============================================================
// SHOW
// ============================================================
export async function getShowBySlug(slug: string) {
  const { data: show, error } = await supabase
    .from('shows')
    .select('*, show_series:show_series_id(*), arena:arena_id(*)')
    .eq('slug', slug)
    .single()

  if (error || !show) {
    logError('getShowBySlug(shows)', error)
    return null
  }

  // Episode number: fallback via view
  let episodeNumber = show.episode_number
  if (!episodeNumber && show.show_series_id) {
    const { data: epData, error: epError } = await supabase
      .from('show_episode_numbers')
      .select('calculated_episode_number')
      .eq('show_id', show.id)
      .single()

    logError('getShowBySlug(show_episode_numbers)', epError)
    episodeNumber = epData?.calculated_episode_number || null
  }

  // Adjacent shows (prev/next in same series)
  let prevShow = null
  let nextShow = null
  if (show.show_series_id) {
    const [{ data: prevData }, { data: nextData }] = await Promise.all([
      supabase
        .from('shows')
        .select('slug, name, date')
        .eq('show_series_id', show.show_series_id)
        .lt('date', show.date)
        .order('date', { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from('shows')
        .select('slug, name, date')
        .eq('show_series_id', show.show_series_id)
        .gt('date', show.date)
        .order('date', { ascending: true })
        .limit(1)
        .single(),
    ])
    prevShow = prevData || null
    nextShow = nextData || null
  }

  const [
    { data: matches, error: matchesError },
    { data: segments, error: segmentsError },
    { data: commentators, error: commError },
    { data: ringAnnouncers, error: announcersError },
    { data: media, error: mediaError },
  ] = await Promise.all([
    supabase
      .from('matches')
      .select(`
        *,
        match_type:match_types(*),
        championship:championships(id, name, slug, image_url),
        participants:match_participants(
          *,
          superstar:superstars!match_participants_superstar_id_fkey(id, name, slug, photo_url, status, birth_date),
          tag_team:tag_teams(id, name, slug),
          eliminated_by:superstars!match_participants_eliminated_by_id_fkey(id, name, slug)
        ),
        managers:match_managers(
          *,
          superstar:superstars!match_managers_superstar_id_fkey(id, name, slug, photo_url),
          managing_for:superstars!match_managers_managing_for_superstar_id_fkey(id, name, slug)
        ),
        referees:match_referees(*, superstar:superstars(id, name, slug, photo_url)),
        objects:match_object_usage(
          *,
          object:match_objects(*),
          used_by:superstars!match_object_usage_used_by_superstar_id_fkey(id, name, slug, photo_url)
        )
      `)
      .eq('show_id', show.id)
      .order('match_order', { ascending: true }),

    supabase
      .from('show_segments')
      .select(`*, participants:show_segment_participants(*, superstar:superstars(id, name, slug, photo_url, status)), media:segment_media(*)`)
      .eq('show_id', show.id)
      .order('sort_order', { ascending: true }),

    supabase
      .from('show_commentators')
      .select('*, superstar:superstars(id, name, slug, photo_url)')
      .eq('show_id', show.id),

    supabase
      .from('show_ring_announcers')
      .select('*, superstar:superstars(id, name, slug, photo_url)')
      .eq('show_id', show.id),

    supabase
      .from('show_media')
      .select('*')
      .eq('show_id', show.id)
      .order('sort_order', { ascending: true }),
  ])

  logError('getShowBySlug(matches)', matchesError)
  logError('getShowBySlug(segments)', segmentsError)
  logError('getShowBySlug(commentators)', commError)
  logError('getShowBySlug(ringAnnouncers)', announcersError)
  logError('getShowBySlug(media)', mediaError)

  // ★ Multi-championships from match_championships table
  const matchIds = (matches || []).map((m: any) => m.id)
  const mcMap = await fetchMatchChampionships(matchIds)
  const enrichedMatches = (matches || []).map((m: any) => {
    const mc = mcMap.get(m.id)
    const championships = mc && mc.length > 0 ? mc : m.championship ? [{ ...m.championship, is_title_change: m.is_title_change || false }] : []
    return { ...m, championships }
  })

  // ★ Dynamic era-appropriate superstar photos
  const showYear = show.date ? parseInt(show.date.slice(0, 4)) : null
  await applyEraPhotos(enrichedMatches, showYear)

  // Calculate average wrestler age at show date
  let averageAge: number | null = null
  if (matches && matches.length > 0 && show.date) {
    const showDate = new Date(show.date)
    const seen = new Set<number>()
    const ages: number[] = []

    for (const m of matches) {
      for (const p of (m.participants || [])) {
        const sid = p.superstar?.id
        const bd = p.superstar?.birth_date
        if (!sid || !bd || seen.has(sid)) continue
        seen.add(sid)
        const birth = new Date(bd)
        let age = showDate.getFullYear() - birth.getFullYear()
        const monthDiff = showDate.getMonth() - birth.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && showDate.getDate() < birth.getDate())) age--
        if (age > 0 && age < 100) ages.push(age)
      }
    }

    if (ages.length > 0) {
      averageAge = Math.round((ages.reduce((a, b) => a + b, 0) / ages.length) * 10) / 10
    }
  }

  return {
    ...show,
    episodeNumber,
    prevShow,
    nextShow,
    matches: enrichedMatches,
    segments: segments || [],
    commentators: commentators || [],
    ringAnnouncers: ringAnnouncers || [],
    media: media || [],
    averageAge,
  }
}

// ============================================================
// MATCH & SEGMENT
// ============================================================

export async function getMatchBySlug(showSlug: string, matchSlug: string) {
  // 1) Get show with arena + commentators + ring announcers
  const { data: show, error: showError } = await supabase
    .from('shows')
    .select('id, name, slug, date, primary_color, logo_url, venue, city, state_province, country, attendance, tv_audience, start_time, episode_number, show_series:show_series_id(*), arena:arena_id(*)')
    .eq('slug', showSlug)
    .single()

  if (showError || !show) {
    logError('getMatchBySlug(show)', showError)
    return null
  }

  // Episode number fallback
  let episodeNumber = show.episode_number
  if (!episodeNumber && show.show_series?.id) {
    const { data: epData } = await supabase
      .from('show_episode_numbers')
      .select('calculated_episode_number')
      .eq('show_id', show.id)
      .single()
    episodeNumber = epData?.calculated_episode_number || null
  }

  // 2) Get match base
  const { data: matchBase, error: baseError } = await supabase
    .from('matches')
    .select('*')
    .eq('show_id', show.id)
    .eq('slug', matchSlug)
    .single()

  if (baseError || !matchBase) {
    logError('getMatchBySlug(match base)', baseError)
    return null
  }

  // 3) Get enriched match + show commentators/announcers in parallel
  const [
    { data: matchFull, error: fullError },
    { data: showCommentators },
    { data: showAnnouncers },
    { data: matchCommentators },
  ] = await Promise.all([
    supabase
      .from('matches')
      .select(
        `*,
         match_type:match_types(*),
         championship:championships(id, name, slug, image_url),
         participants:match_participants(*,
            superstar:superstars!match_participants_superstar_id_fkey(id, name, slug, photo_url, status, height_cm, weight_kg, birth_country, nationalities, win_count, loss_count, draw_count, total_matches),
            tag_team:tag_teams(id, name, slug, photo_url),
            eliminated_by:superstars!match_participants_eliminated_by_id_fkey(id, name, slug)
         ),
         managers:match_managers(*,
            superstar:superstars!match_managers_superstar_id_fkey(id, name, slug, photo_url),
            managing_for:superstars!match_managers_managing_for_superstar_id_fkey(id, name, slug)
         ),
         referees:match_referees(*, superstar:superstars(id, name, slug, photo_url)),
         objects:match_object_usage(*,
            object:match_objects(*),
            used_by:superstars!match_object_usage_used_by_superstar_id_fkey(id, name, slug, photo_url)
         ),
         media:match_media(*)
        `
      )
      .eq('id', matchBase.id)
      .single(),
    supabase
      .from('show_commentators')
      .select('*, superstar:superstars(id, name, slug, photo_url)')
      .eq('show_id', show.id),
    supabase
      .from('show_ring_announcers')
      .select('*, superstar:superstars(id, name, slug, photo_url)')
      .eq('show_id', show.id),
    // Match-specific commentators (can override show commentators for this match)
    supabase
      .from('match_commentators')
      .select('*, superstar:superstars(id, name, slug, photo_url)')
      .eq('match_id', matchBase.id)
      .then(res => res)
      .catch(() => ({ data: null })),
  ])

  // Build show object with all extra info
  const enrichedShow = {
    ...show,
    episodeNumber,
    commentators: (matchCommentators && matchCommentators.length > 0) ? matchCommentators : (showCommentators || []),
    ringAnnouncers: showAnnouncers || [],
  }

  if (fullError || !matchFull) {
    logError('getMatchBySlug(match full) — falling back to base', fullError)
    return { ...matchBase, show: enrichedShow, participants: [], managers: [], referees: [], objects: [], media: [], championships: [] }
  }

  // ★ Multi-championships
  const mcMap = await fetchMatchChampionships([matchFull.id])
  const mc = mcMap.get(matchFull.id)
  const championships = mc && mc.length > 0 ? mc : matchFull.championship ? [{ ...matchFull.championship, is_title_change: matchFull.is_title_change || false }] : []

  // ★ Dynamic era-appropriate superstar photos
  const matchYear = show.date ? parseInt(show.date.slice(0, 4)) : null
  await applyEraPhotos([matchFull], matchYear)

  return { ...matchFull, show: enrichedShow, championships }
}

export async function getSegmentBySlug(showSlug: string, segmentSlug: string) {
  const { data: show, error: showError } = await supabase
    .from('shows')
    .select('id, name, slug, date, primary_color, logo_url, show_series:show_series_id(*)')
    .eq('slug', showSlug)
    .single()

  if (showError || !show) {
    logError('getSegmentBySlug(show)', showError)
    return null
  }

  const { data: segment, error } = await supabase
    .from('show_segments')
    .select(`*, participants:show_segment_participants(*, superstar:superstars(id, name, slug, photo_url, status)), media:segment_media(*)`)
    .eq('show_id', show.id)
    .eq('slug', segmentSlug)
    .single()

  if (error || !segment) {
    logError('getSegmentBySlug(segment)', error)
    return null
  }

  return { ...segment, show }
}

// ============================================================
// RPC FUNCTIONS
// ============================================================
export async function getHeadToHead(s1: number, s2: number) {
  const { data, error } = await supabase.rpc('get_head_to_head', { p_superstar1_id: s1, p_superstar2_id: s2 })
  if (error) logError('getHeadToHead(rpc)', error)
  return !data || data.length === 0 ? null : data[0]
}

export async function getWinMethods(id: number) {
  const { data, error } = await supabase.rpc('get_win_methods', { p_superstar_id: id })
  if (error) logError('getWinMethods(rpc)', error)
  return data || []
}

export async function getSuperstarPhotoByYear(id: number, year: number) {
  const { data, error } = await supabase.rpc('get_superstar_photo', { p_superstar_id: id, p_year: year })
  if (error) logError('getSuperstarPhotoByYear(rpc)', error)
  return error ? null : data
}
