// @ts-nocheck
import { supabase } from './supabase';

// ============================================================
// SHOW
// ============================================================

export async function getShowBySlug(slug: string) {
  const { data: show, error } = await supabase
    .from('shows')
    .select('*, show_series:show_series_id(*), arena_data:arenas(*)')
    .eq('slug', slug)
    .single();

  if (error || !show) return null;

  // Calcul du numéro d'épisode
  let episodeNumber = show.episode_number;
  if (!episodeNumber && show.show_series_id) {
    const { data: epData } = await supabase
      .from('show_episode_numbers')
      .select('calculated_episode_number')
      .eq('show_id', show.id)
      .single();
    episodeNumber = epData?.calculated_episode_number || null;
  }

  const [
    { data: matches },
    { data: segments },
    { data: commentators },
    { data: ringAnnouncers },
    { data: media },
  ] = await Promise.all([
    // Matches
    supabase
      .from('matches')
      .select(`
        *,
        match_type:match_types(*),
        championship:championships(id, name, slug, image_url),
        participants:match_participants(
          *,
          superstar:superstars(id, name, slug, photo_url, status),
          tag_team:tag_teams(id, name, slug),
          eliminated_by:superstars!match_participants_eliminated_by_id_fkey(id, name, slug)
        ),
        managers:match_managers(
          *,
          superstar:superstars!match_managers_superstar_id_fkey(id, name, slug, photo_url),
          managing_for:superstars!match_managers_managing_for_superstar_id_fkey(id, name, slug)
        ),
        referees:match_referees(
          *,
          superstar:superstars(id, name, slug, photo_url)
        ),
        objects:match_object_usage(
          *,
          object:match_objects(*),
          used_by:superstars!match_object_usage_used_by_superstar_id_fkey(id, name, slug, photo_url)
        ),
        match_commentators(
          *,
          superstar:superstars(id, name, slug, photo_url)
        )
      `)
      .eq('show_id', show.id)
      .order('match_order', { ascending: true }),

    // Segments
    supabase
      .from('show_segments')
      .select(`
        *,
        participants:show_segment_participants(
          *,
          superstar:superstars(id, name, slug, photo_url, status)
        ),
        media:segment_media(*)
      `)
      .eq('show_id', show.id)
      .order('sort_order', { ascending: true }),

    // Commentators
    supabase
      .from('show_commentators')
      .select('*, superstar:superstars(id, name, slug, photo_url)')
      .eq('show_id', show.id),

    // Ring Announcers
    supabase
      .from('show_ring_announcers')
      .select('*, superstar:superstars(id, name, slug, photo_url)')
      .eq('show_id', show.id),

    // Media
    supabase
      .from('show_media')
      .select('*')
      .eq('show_id', show.id)
      .order('sort_order', { ascending: true }),
  ]);

  return {
    ...show,
    episodeNumber,
    matches: matches || [],
    segments: segments || [],
    commentators: commentators || [],
    ringAnnouncers: ringAnnouncers || [],
    media: media || [],
  };
}

// ============================================================
// MATCH
// ============================================================

export async function getMatchBySlug(showSlug: string, matchSlug: string) {
  const { data: show } = await supabase
    .from('shows')
    .select('id, name, slug, date, primary_color, logo_url, show_series:show_series_id(*)')
    .eq('slug', showSlug)
    .single();

  if (!show) return null;

  const { data: match, error } = await supabase
    .from('matches')
    .select(`
      *,
      match_type:match_types(*),
      championship:championships(id, name, slug, image_url),
      participants:match_participants(
        *,
        superstar:superstars(id, name, slug, photo_url, status, height_cm, weight_kg, birth_country, nationalities, win_count, loss_count, draw_count, total_matches),
        tag_team:tag_teams(id, name, slug, photo_url),
        eliminated_by:superstars!match_participants_eliminated_by_id_fkey(id, name, slug)
      ),
      managers:match_managers(
        *,
        superstar:superstars!match_managers_superstar_id_fkey(id, name, slug, photo_url),
        managing_for:superstars!match_managers_managing_for_superstar_id_fkey(id, name, slug)
      ),
      referees:match_referees(
        *,
        superstar:superstars(id, name, slug, photo_url)
      ),
      objects:match_object_usage(
        *,
        object:match_objects(*),
        used_by:superstars!match_object_usage_used_by_superstar_id_fkey(id, name, slug, photo_url)
      ),
      match_commentators(
        *,
        superstar:superstars(id, name, slug, photo_url)
      ),
      media:match_media(*)
    `)
    .eq('show_id', show.id)
    .eq('slug', matchSlug)
    .single();

  if (error || !match) return null;

  return {
    ...match,
    show,
  };
}

// ============================================================
// SEGMENT
// ============================================================

export async function getSegmentBySlug(showSlug: string, segmentSlug: string) {
  const { data: show } = await supabase
    .from('shows')
    .select('id, name, slug, date, primary_color, logo_url, show_series:show_series_id(*)')
    .eq('slug', showSlug)
    .single();

  if (!show) return null;

  const { data: segment, error } = await supabase
    .from('show_segments')
    .select(`
      *,
      participants:show_segment_participants(
        *,
        superstar:superstars(id, name, slug, photo_url, status)
      ),
      media:segment_media(*)
    `)
    .eq('show_id', show.id)
    .eq('slug', segmentSlug)
    .single();

  if (error || !segment) return null;

  return {
    ...segment,
    show,
  };
}

// ============================================================
// STATS & UTILS
// ============================================================

export async function getHeadToHead(superstar1Id: number, superstar2Id: number) {
  const { data, error } = await supabase
    .rpc('get_head_to_head', {
      p_superstar1_id: superstar1Id,
      p_superstar2_id: superstar2Id,
    });

  if (error || !data || data.length === 0) return null;
  return data[0];
}

export async function getWinMethods(superstarId: number) {
  const { data, error } = await supabase
    .rpc('get_win_methods', {
      p_superstar_id: superstarId,
    });

  if (error) return [];
  return data || [];
}

export async function getSuperstarPhotoByYear(superstarId: number, year: number) {
  const { data, error } = await supabase
    .rpc('get_superstar_photo', {
      p_superstar_id: superstarId,
      p_year: year,
    });

  if (error) return null;
  return data;
}

// ============================================================
// SUPERSTAR (Simplifié)
// ============================================================

export async function getSuperstarBySlug(slug: string) {
  const { data: superstar, error } = await supabase
    .from('superstars')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !superstar) return null;

  // Récupération parallèle simple
  const [
    { data: roles },
    { data: eras },
    { data: finishers },
    { data: themes },
  ] = await Promise.all([
    supabase.from('superstar_roles').select('*').eq('superstar_id', superstar.id).order('is_primary', { ascending: false }),
    supabase.from('superstar_eras').select('*, eras(*)').eq('superstar_id', superstar.id),
    supabase.from('finishers').select('*').eq('superstar_id', superstar.id),
    supabase.from('entrance_themes').select('*').eq('superstar_id', superstar.id),
  ]);

  return {
    ...superstar,
    roles: roles || [],
    eras: eras || [],
    finishers: finishers || [],
    themes: themes || [],
    nicknames: [],
    aliases: [],
    timeline: [],
    draftHistory: [],
    careerBreaks: [],
    families: [],
    trainers: [],
    socialLinks: [],
    books: [],
    films: [],
  };
}