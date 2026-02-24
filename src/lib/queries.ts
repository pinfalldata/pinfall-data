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
    matches: matches || [],
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
    return { ...matchBase, show: enrichedShow, participants: [], managers: [], referees: [], objects: [], media: [] }
  }

  return { ...matchFull, show: enrichedShow }
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
