// @ts-nocheck
import { supabase } from './supabase'

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
    { data: roles }, { data: eras }, { data: nicknames }, { data: aliases },
    { data: finishers }, { data: themes }, { data: timeline },
    { data: draftHistory }, { data: careerBreaks }, { data: families },
    { data: trainers }, { data: socialLinks }, { data: books }, { data: films },
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
    supabase.from('superstar_families').select('*, related:superstars!superstar_families_related_superstar_id_fkey(id, name, slug, photo_url)').eq('superstar_id', superstar.id),
    supabase.from('superstar_trainers').select('*, trainer:superstars!superstar_trainers_trainer_id_fkey(id, name, slug)').eq('superstar_id', superstar.id),
    supabase.from('superstar_social_links').select('*').eq('superstar_id', superstar.id),
    supabase.from('books').select('*').eq('superstar_id', superstar.id).order('year', { ascending: false }),
    supabase.from('films').select('*').eq('superstar_id', superstar.id).order('year', { ascending: false }),
  ])

  return {
    ...superstar,
    roles: roles || [], eras: eras || [], nicknames: nicknames || [],
    aliases: aliases || [], finishers: finishers || [], themes: themes || [],
    timeline: timeline || [], draftHistory: draftHistory || [],
    careerBreaks: careerBreaks || [], families: families || [],
    trainers: trainers || [], socialLinks: socialLinks || [],
    books: books || [], films: films || [],
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

  let episodeNumber = show.episode_number
  if (!episodeNumber && show.show_series_id) {
    const { data: epData } = await supabase
      .from('show_episode_numbers')
      .select('calculated_episode_number')
      .eq('show_id', show.id)
      .single()
    episodeNumber = epData?.calculated_episode_number || null
  }

  const [
    { data: matches, error: matchesError },
    { data: segments },
    { data: commentators },
    { data: ringAnnouncers },
    { data: media },
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
      .select('*, participants:show_segment_participants(*, superstar:superstars(id, name, slug, photo_url, status)), media:segment_media(*)')
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

  // Compute average age of wrestlers at show date
  let averageAge: number | null = null
  const safeMatches = matches || []
  if (safeMatches.length > 0) {
    const showDate = new Date(show.date)
    const seen = new Set<number>()
    const ages: number[] = []
    for (const m of safeMatches) {
      for (const p of (m.participants || [])) {
        if (p.superstar?.birth_date && p.superstar?.id && !seen.has(p.superstar.id)) {
          seen.add(p.superstar.id)
          const bd = new Date(p.superstar.birth_date)
          let age = showDate.getFullYear() - bd.getFullYear()
          const mo = showDate.getMonth() - bd.getMonth()
          if (mo < 0 || (mo === 0 && showDate.getDate() < bd.getDate())) age--
          if (age > 0 && age < 100) ages.push(age)
        }
      }
    }
    if (ages.length > 0) {
      averageAge = Math.round((ages.reduce((s, a) => s + a, 0) / ages.length) * 10) / 10
    }
  }

  // Adjacent shows (prev/next in same series)
  let prevShow: { slug: string; name: string; date: string } | null = null
  let nextShow: { slug: string; name: string; date: string } | null = null
  if (show.show_series_id) {
    const [{ data: prev }, { data: next }] = await Promise.all([
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
    prevShow = prev || null
    nextShow = next || null
  }

  return {
    ...show,
    episodeNumber,
    matches: safeMatches,
    segments: segments || [],
    commentators: commentators || [],
    ringAnnouncers: ringAnnouncers || [],
    media: media || [],
    averageAge,
    prevShow,
    nextShow,
  }
}

// ============================================================
// MATCH
// ============================================================
export async function getMatchBySlug(showSlug: string, matchSlug: string) {
  const { data: show, error: showError } = await supabase
    .from('shows')
    .select(`
      id, name, slug, date, primary_color, logo_url, banner_url,
      show_type, venue, city, state_province, country,
      attendance, tv_audience, start_time, episode_number,
      theme_song, theme_song_artist,
      show_series:show_series_id(id, name, short_name, slug)
    `)
    .eq('slug', showSlug)
    .single()

  if (showError || !show) {
    logError('getMatchBySlug(show)', showError)
    return null
  }

  let episodeNumber = show.episode_number
  if (!episodeNumber && show.show_series?.id) {
    const { data: epData } = await supabase
      .from('show_episode_numbers')
      .select('calculated_episode_number')
      .eq('show_id', show.id)
      .single()
    episodeNumber = epData?.calculated_episode_number || null
  }

  const [{ data: showCommentators }, { data: showAnnouncers }] = await Promise.all([
    supabase.from('show_commentators').select('*, superstar:superstars(id, name, slug, photo_url)').eq('show_id', show.id),
    supabase.from('show_ring_announcers').select('*, superstar:superstars(id, name, slug, photo_url)').eq('show_id', show.id),
  ])

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

  const { data: matchFull, error: fullError } = await supabase
    .from('matches')
    .select(
      `*,
       match_type:match_types(*),
       championship:championships(id, name, slug, image_url, status),
       participants:match_participants(*,
          superstar:superstars!match_participants_superstar_id_fkey(id, name, slug, photo_url, status, height_cm, weight_kg, birth_date, birth_country, nationalities, win_count, loss_count, draw_count, total_matches, total_reigns, total_championship_days),
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
    .single()

  const showData = { ...show, episodeNumber, commentators: showCommentators || [], ringAnnouncers: showAnnouncers || [] }

  if (fullError || !matchFull) {
    logError('getMatchBySlug(match full) — falling back to base', fullError)
    return { ...matchBase, show: showData, participants: [], managers: [], referees: [], objects: [], media: [] }
  }

  return { ...matchFull, show: showData }
}

// ============================================================
// SEGMENT
// ============================================================
export async function getSegmentBySlug(showSlug: string, segmentSlug: string) {
  const { data: show, error: showError } = await supabase
    .from('shows')
    .select('id, name, slug, date, primary_color, logo_url, show_series:show_series_id(*)')
    .eq('slug', showSlug)
    .single()
  if (showError || !show) return null

  const { data: segment, error } = await supabase
    .from('show_segments')
    .select('*, participants:show_segment_participants(*, superstar:superstars(id, name, slug, photo_url, status)), media:segment_media(*)')
    .eq('show_id', show.id)
    .eq('slug', segmentSlug)
    .single()
  if (error || !segment) return null

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
