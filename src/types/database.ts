// ============================================================
// Pinfall Data — Database Types (v6 — Shows, Matches, Segments)
// ============================================================

export type SuperstarStatus = 'active' | 'retired' | 'deceased' | 'released' | 'inactive'
export type SuperstarGender = 'male' | 'female' | 'other'
export type SuperstarRole = 'wrestler' | 'manager' | 'referee' | 'announcer' | 'commentator' | 'authority' | 'promoter' | 'trainer' | 'producer' | 'other'
export type ChampionshipStatus = 'active' | 'retired'
export type ShowType = 'ppv' | 'weekly' | 'special' | 'tournament' | 'other'
export type ResultType = 'pinfall' | 'submission' | 'dq' | 'count_out' | 'no_contest' | 'forfeit' | 'ko' | 'referee_stoppage' | 'escape' | 'retrieve' | 'last_elimination' | 'other'
export type MoveType = 'finisher' | 'signature'
export type OmgCategory = 'extreme' | 'wtf' | 'sexy' | 'return' | 'betrayal' | 'emotional'
export type SegmentCategory = 'in_ring_segment' | 'backstage' | 'interference' | 'ceremony' | 'authority' | 'psychology' | 'props_spectacle' | 'medical_injury' | 'musical' | 'fan_engagement' | 'broadcast' | 'digital'

// ============================================================
// Row types
// ============================================================

export interface Era {
  id: number
  name: string
  slug: string
  start_year: number
  end_year: number | null
  description_md: string | null
  image_url: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Superstar {
  id: number
  name: string
  slug: string
  real_name: string | null
  birth_date: string | null
  death_date: string | null
  height_cm: number | null
  weight_kg: number | null
  gender: SuperstarGender
  status: SuperstarStatus
  role: SuperstarRole
  debut_date: string | null
  retirement_date: string | null
  photo_url: string | null
  banner_url: string | null
  bio_md: string | null
  billed_from: string | null
  era_id: number | null
  is_hall_of_fame: boolean
  win_count: number
  loss_count: number
  draw_count: number
  total_matches: number
  total_championship_days: number
  total_reigns: number
  birth_city: string | null
  birth_state: string | null
  birth_country: string | null
  nationalities: string[] | null
  current_brand: string | null
  created_at: string
  updated_at: string
}

export interface SuperstarRoleRow {
  id: number
  superstar_id: number
  role: SuperstarRole
  is_primary: boolean
  start_year: number | null
  end_year: number | null
  created_at: string
}

export interface SuperstarEra {
  id: number
  superstar_id: number
  era_id: number
  is_primary: boolean
  created_at: string
}

export interface SuperstarNickname {
  id: number
  superstar_id: number
  nickname: string
  is_primary: boolean
  sort_order: number
  created_at: string
}

export interface SuperstarAlias {
  id: number
  superstar_id: number
  alias_name: string
  start_date: string | null
  end_date: string | null
  created_at: string
}

export interface Finisher {
  id: number
  superstar_id: number
  name: string
  move_type: MoveType
  description: string | null
  created_at: string
}

export interface EntranceTheme {
  id: number
  superstar_id: number
  song_name: string
  artist: string | null
  start_date: string | null
  end_date: string | null
  is_current: boolean
  created_at: string
}

export interface SuperstarTimeline {
  id: number
  superstar_id: number
  title: string
  description: string | null
  date: string | null
  sort_order: number
  created_at: string
}

export interface SuperstarDraftHistory {
  id: number
  superstar_id: number
  brand: string
  draft_date: string
  notes: string | null
  created_at: string
}

export interface SuperstarCareerBreak {
  id: number
  superstar_id: number
  reason: string | null
  start_date: string
  end_date: string | null
  created_at: string
}

export interface SuperstarFamily {
  id: number
  superstar_id: number
  related_superstar_id: number
  relationship: string
  created_at: string
}

export interface SuperstarTrainer {
  id: number
  superstar_id: number
  trainer_id: number
  created_at: string
}

export interface SuperstarSocialLink {
  id: number
  superstar_id: number
  platform: string
  url: string
  created_at: string
}

export interface Book {
  id: number
  superstar_id: number
  title: string
  year: number | null
  description: string | null
  cover_url: string | null
  created_at: string
}

export interface Film {
  id: number
  superstar_id: number
  title: string
  year: number | null
  role: string | null
  description: string | null
  poster_url: string | null
  created_at: string
}

// ============================================================
// v6 — New types
// ============================================================

export interface ShowSeries {
  id: number
  name: string
  slug: string
  short_name: string | null
  logo_url: string | null
  description: string | null
  first_episode_date: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Show {
  id: number
  name: string
  slug: string
  date: string
  show_type: ShowType
  venue: string | null
  city: string | null
  state_province: string | null
  country: string | null
  attendance: number | null
  tv_audience: number | null
  logo_url: string | null
  banner_url: string | null
  description_md: string | null
  highlights_md: string | null
  ppv_series_name: string | null
  show_series_id: number | null
  episode_number: number | null
  start_time: string | null
  theme_song: string | null
  theme_song_artist: string | null
  theme_song_url: string | null
  rating: number | null
  primary_color: string | null
  era_id: number | null
  created_at: string
  updated_at: string
}

export interface Match {
  id: number
  show_id: number | null
  match_type_id: number | null
  championship_id: number | null
  date: string
  match_order: number | null
  duration_seconds: number | null
  rating: number | null
  result_type: ResultType | null
  winner_id: number | null
  winner_team: number | null
  is_title_change: boolean
  summary_md: string | null
  video_url: string | null
  card_position: string | null
  notes: string | null
  slug: string | null
  score_winner: number | null
  score_loser: number | null
  is_dark_match: boolean
  is_spoiler: boolean
  image_url: string | null
  time_limit_seconds: number | null
  created_at: string
  updated_at: string
}

export interface MatchParticipant {
  id: number
  match_id: number
  superstar_id: number
  team_number: number | null
  is_winner: boolean
  entrance_order: number | null
  elimination_order: number | null
  attire_url: string | null
  entrance_url: string | null
  eliminated_by_id: number | null
  elimination_time_seconds: number | null
  entry_number: number | null
  is_survivor: boolean
  elimination_method: string | null
  tag_team_id: number | null
  photo_url_override: string | null
  created_at: string
}

export interface MatchReferee {
  id: number
  match_id: number
  superstar_id: number | null
  referee_name: string | null
  is_special_referee: boolean
  created_at: string
}

export interface ShowSegment {
  id: number
  show_id: number
  slug: string
  title: string
  category: SegmentCategory
  description_md: string | null
  image_url: string | null
  video_url: string | null
  sort_order: number
  duration_seconds: number | null
  rating: number | null
  is_spoiler: boolean
  created_at: string
  updated_at: string
}

export interface ShowSegmentParticipant {
  id: number
  segment_id: number
  superstar_id: number
  role: string
  sort_order: number
  created_at: string
}

export interface ShowCommentator {
  id: number
  show_id: number
  superstar_id: number
  role: string
  created_at: string
}

export interface ShowRingAnnouncer {
  id: number
  show_id: number
  superstar_id: number
  created_at: string
}

export interface SuperstarPhoto {
  id: number
  superstar_id: number
  year: number
  photo_url: string
  description: string | null
  is_primary: boolean
  created_at: string
}

export interface ShowMedia {
  id: number
  show_id: number
  media_type: string
  title: string | null
  url: string
  thumbnail_url: string | null
  sort_order: number
  created_at: string
}

export interface MatchMedia {
  id: number
  match_id: number
  media_type: string
  title: string | null
  url: string
  thumbnail_url: string | null
  sort_order: number
  created_at: string
}

export interface SegmentMedia {
  id: number
  segment_id: number
  media_type: string
  title: string | null
  url: string
  thumbnail_url: string | null
  sort_order: number
  created_at: string
}

export interface Championship {
  id: number
  name: string
  slug: string
  status: ChampionshipStatus
  introduced_date: string | null
  retired_date: string | null
  description_md: string | null
  image_url: string | null
  brand: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface ChampionshipReign {
  id: number
  championship_id: number
  superstar_id: number
  won_date: string
  lost_date: string | null
  days_held: number | null
  reign_number: number | null
  won_at_show_id: number | null
  lost_at_show_id: number | null
  won_match_id: number | null
  lost_match_id: number | null
  notes: string | null
  created_at: string
}

export interface MatchType {
  id: number
  name: string
  slug: string
  description: string | null
  rules_md: string | null
  image_url: string | null
  created_at: string
}

export interface MatchManager {
  id: number
  match_id: number
  superstar_id: number
  managing_for_superstar_id: number | null
  team_number: number | null
  created_at: string
}

export interface MatchCommentator {
  id: number
  match_id: number
  superstar_id: number
  created_at: string
}

export interface MatchObject {
  id: number
  name: string
  slug: string
  description: string | null
  image_url: string | null
  created_at: string
}

export interface MatchObjectUsage {
  id: number
  match_id: number
  object_id: number
  used_by_superstar_id: number | null
  description: string | null
  timestamp_seconds: number | null
  created_at: string
}

export interface Rivalry {
  id: number
  name: string
  slug: string
  start_date: string | null
  end_date: string | null
  description_md: string | null
  image_url: string | null
  video_url: string | null
  created_at: string
  updated_at: string
}

export interface TagTeam {
  id: number
  name: string
  slug: string
  formed_date: string | null
  split_date: string | null
  is_active: boolean
  photo_url: string | null
  description_md: string | null
  created_at: string
  updated_at: string
}

export interface Stable {
  id: number
  name: string
  slug: string
  formed_date: string | null
  split_date: string | null
  is_active: boolean
  photo_url: string | null
  description_md: string | null
  created_at: string
  updated_at: string
}

// ============================================================
// Supabase Database type (for typed client)
// ============================================================

export interface Database {
  public: {
    Tables: {
      eras: { Row: Era; Insert: Omit<Era, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Era, 'id'>> }
      superstars: { Row: Superstar; Insert: Omit<Superstar, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Superstar, 'id'>> }
      superstar_roles: { Row: SuperstarRoleRow; Insert: Omit<SuperstarRoleRow, 'id' | 'created_at'>; Update: Partial<Omit<SuperstarRoleRow, 'id'>> }
      superstar_eras: { Row: SuperstarEra; Insert: Omit<SuperstarEra, 'id' | 'created_at'>; Update: Partial<Omit<SuperstarEra, 'id'>> }
      superstar_nicknames: { Row: SuperstarNickname; Insert: Omit<SuperstarNickname, 'id' | 'created_at'>; Update: Partial<Omit<SuperstarNickname, 'id'>> }
      superstar_aliases: { Row: SuperstarAlias; Insert: Omit<SuperstarAlias, 'id' | 'created_at'>; Update: Partial<Omit<SuperstarAlias, 'id'>> }
      finishers: { Row: Finisher; Insert: Omit<Finisher, 'id' | 'created_at'>; Update: Partial<Omit<Finisher, 'id'>> }
      entrance_themes: { Row: EntranceTheme; Insert: Omit<EntranceTheme, 'id' | 'created_at'>; Update: Partial<Omit<EntranceTheme, 'id'>> }
      superstar_timeline: { Row: SuperstarTimeline; Insert: Omit<SuperstarTimeline, 'id' | 'created_at'>; Update: Partial<Omit<SuperstarTimeline, 'id'>> }
      superstar_draft_history: { Row: SuperstarDraftHistory; Insert: Omit<SuperstarDraftHistory, 'id' | 'created_at'>; Update: Partial<Omit<SuperstarDraftHistory, 'id'>> }
      superstar_career_breaks: { Row: SuperstarCareerBreak; Insert: Omit<SuperstarCareerBreak, 'id' | 'created_at'>; Update: Partial<Omit<SuperstarCareerBreak, 'id'>> }
      superstar_families: { Row: SuperstarFamily; Insert: Omit<SuperstarFamily, 'id' | 'created_at'>; Update: Partial<Omit<SuperstarFamily, 'id'>> }
      superstar_trainers: { Row: SuperstarTrainer; Insert: Omit<SuperstarTrainer, 'id' | 'created_at'>; Update: Partial<Omit<SuperstarTrainer, 'id'>> }
      superstar_social_links: { Row: SuperstarSocialLink; Insert: Omit<SuperstarSocialLink, 'id' | 'created_at'>; Update: Partial<Omit<SuperstarSocialLink, 'id'>> }
      books: { Row: Book; Insert: Omit<Book, 'id' | 'created_at'>; Update: Partial<Omit<Book, 'id'>> }
      films: { Row: Film; Insert: Omit<Film, 'id' | 'created_at'>; Update: Partial<Omit<Film, 'id'>> }
      // v6
      show_series: { Row: ShowSeries; Insert: Omit<ShowSeries, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<ShowSeries, 'id'>> }
      shows: { Row: Show; Insert: Omit<Show, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Show, 'id'>> }
      matches: { Row: Match; Insert: Omit<Match, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Match, 'id'>> }
      match_participants: { Row: MatchParticipant; Insert: Omit<MatchParticipant, 'id' | 'created_at'>; Update: Partial<Omit<MatchParticipant, 'id'>> }
      match_referees: { Row: MatchReferee; Insert: Omit<MatchReferee, 'id' | 'created_at'>; Update: Partial<Omit<MatchReferee, 'id'>> }
      match_managers: { Row: MatchManager; Insert: Omit<MatchManager, 'id' | 'created_at'>; Update: Partial<Omit<MatchManager, 'id'>> }
      match_commentators: { Row: MatchCommentator; Insert: Omit<MatchCommentator, 'id' | 'created_at'>; Update: Partial<Omit<MatchCommentator, 'id'>> }
      match_types: { Row: MatchType; Insert: Omit<MatchType, 'id' | 'created_at'>; Update: Partial<Omit<MatchType, 'id'>> }
      match_objects: { Row: MatchObject; Insert: Omit<MatchObject, 'id' | 'created_at'>; Update: Partial<Omit<MatchObject, 'id'>> }
      match_object_usage: { Row: MatchObjectUsage; Insert: Omit<MatchObjectUsage, 'id' | 'created_at'>; Update: Partial<Omit<MatchObjectUsage, 'id'>> }
      match_media: { Row: MatchMedia; Insert: Omit<MatchMedia, 'id' | 'created_at'>; Update: Partial<Omit<MatchMedia, 'id'>> }
      show_segments: { Row: ShowSegment; Insert: Omit<ShowSegment, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<ShowSegment, 'id'>> }
      show_segment_participants: { Row: ShowSegmentParticipant; Insert: Omit<ShowSegmentParticipant, 'id' | 'created_at'>; Update: Partial<Omit<ShowSegmentParticipant, 'id'>> }
      show_commentators: { Row: ShowCommentator; Insert: Omit<ShowCommentator, 'id' | 'created_at'>; Update: Partial<Omit<ShowCommentator, 'id'>> }
      show_ring_announcers: { Row: ShowRingAnnouncer; Insert: Omit<ShowRingAnnouncer, 'id' | 'created_at'>; Update: Partial<Omit<ShowRingAnnouncer, 'id'>> }
      show_media: { Row: ShowMedia; Insert: Omit<ShowMedia, 'id' | 'created_at'>; Update: Partial<Omit<ShowMedia, 'id'>> }
      segment_media: { Row: SegmentMedia; Insert: Omit<SegmentMedia, 'id' | 'created_at'>; Update: Partial<Omit<SegmentMedia, 'id'>> }
      superstar_photos: { Row: SuperstarPhoto; Insert: Omit<SuperstarPhoto, 'id' | 'created_at'>; Update: Partial<Omit<SuperstarPhoto, 'id'>> }
      championships: { Row: Championship; Insert: Omit<Championship, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Championship, 'id'>> }
      championship_reigns: { Row: ChampionshipReign; Insert: Omit<ChampionshipReign, 'id' | 'created_at'>; Update: Partial<Omit<ChampionshipReign, 'id'>> }
      rivalries: { Row: Rivalry; Insert: Omit<Rivalry, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Rivalry, 'id'>> }
      tag_teams: { Row: TagTeam; Insert: Omit<TagTeam, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<TagTeam, 'id'>> }
      stables: { Row: Stable; Insert: Omit<Stable, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Stable, 'id'>> }
    }
    Functions: {
      get_random_match: { Args: Record<string, never>; Returns: { match_id: number; show_name: string; match_date: string; match_type: string; rating: number; winner_name: string; duration_seconds: number }[] }
      get_random_rivalry: { Args: Record<string, never>; Returns: { rivalry_id: number; rivalry_name: string; rivalry_slug: string; image_url: string; start_date: string; end_date: string; participant_names: string[] }[] }
      get_site_stats: { Args: Record<string, never>; Returns: { total_superstars: number; total_matches: number; total_shows: number; total_championships: number; total_rivalries: number; total_match_types: number; years_of_history: number }[] }
      get_superstar_photo: { Args: { p_superstar_id: number; p_year: number }; Returns: string }
      get_head_to_head: { Args: { p_superstar1_id: number; p_superstar2_id: number }; Returns: { total_matches: number; wins_superstar1: number; wins_superstar2: number; draws: number; avg_rating: number; avg_duration_seconds: number; last_match_date: string }[] }
      get_win_methods: { Args: { p_superstar_id: number }; Returns: { result_type: string; win_count: number; percentage: number }[] }
    }
  }
}
