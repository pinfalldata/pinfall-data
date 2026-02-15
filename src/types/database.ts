// ============================================================
// Pinfall Data — Database Types (matches Supabase schema)
// ============================================================
// To auto-generate these types from Supabase, run:
// npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
// For now, these manual types match our schema.
// ============================================================

export type SuperstarStatus = 'active' | 'retired' | 'deceased' | 'released' | 'inactive'
export type SuperstarGender = 'male' | 'female' | 'other'
export type SuperstarRole = 'wrestler' | 'manager' | 'referee' | 'announcer' | 'commentator' | 'authority' | 'promoter' | 'trainer' | 'producer' | 'other'
export type ChampionshipStatus = 'active' | 'retired'
export type ShowType = 'ppv' | 'weekly' | 'special' | 'tournament' | 'other'
export type ResultType = 'pinfall' | 'submission' | 'dq' | 'count_out' | 'no_contest' | 'forfeit' | 'ko' | 'referee_stoppage' | 'escape' | 'retrieve' | 'last_elimination' | 'other'
export type MoveType = 'finisher' | 'signature'
export type OmgCategory = 'extreme' | 'wtf' | 'sexy' | 'return' | 'betrayal' | 'emotional'

// ============================================================
// Row types (what you GET from the database)
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
  // Colonnes géographiques
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
  created_at: string
  updated_at: string
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
      matches: { Row: Match; Insert: Omit<Match, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Match, 'id'>> }
      shows: { Row: Show; Insert: Omit<Show, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Show, 'id'>> }
      championships: { Row: Championship; Insert: Omit<Championship, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Championship, 'id'>> }
      championship_reigns: { Row: ChampionshipReign; Insert: Omit<ChampionshipReign, 'id' | 'created_at'>; Update: Partial<Omit<ChampionshipReign, 'id'>> }
      match_types: { Row: MatchType; Insert: Omit<MatchType, 'id' | 'created_at'>; Update: Partial<Omit<MatchType, 'id'>> }
      rivalries: { Row: Rivalry; Insert: Omit<Rivalry, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Rivalry, 'id'>> }
      tag_teams: { Row: TagTeam; Insert: Omit<TagTeam, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<TagTeam, 'id'>> }
      stables: { Row: Stable; Insert: Omit<Stable, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Stable, 'id'>> }
    }
    Functions: {
      get_random_match: { Args: Record<string, never>; Returns: { match_id: number; show_name: string; match_date: string; match_type: string; rating: number; winner_name: string; duration_seconds: number }[] }
      get_random_rivalry: { Args: Record<string, never>; Returns: { rivalry_id: number; rivalry_name: string; rivalry_slug: string; image_url: string; start_date: string; end_date: string; participant_names: string[] }[] }
      get_site_stats: { Args: Record<string, never>; Returns: { total_superstars: number; total_matches: number; total_shows: number; total_championships: number; total_rivalries: number; total_match_types: number; years_of_history: number }[] }
    }
  }
}
