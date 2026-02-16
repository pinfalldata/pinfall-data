// ============================================================
// Pinfall Data — Database Types (V6 COMPLETE)
// ============================================================

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// --- ENUMS & TYPES ---
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
// ROW INTERFACES (Les données brutes)
// ============================================================

export interface Era {
  id: number; name: string; slug: string; start_year: number; end_year: number | null; description_md: string | null; image_url: string | null; sort_order: number; created_at: string; updated_at: string
}

export interface Superstar {
  id: number; name: string; slug: string; real_name: string | null; birth_date: string | null; death_date: string | null; height_cm: number | null; weight_kg: number | null; gender: SuperstarGender; status: SuperstarStatus; role: SuperstarRole; debut_date: string | null; retirement_date: string | null; photo_url: string | null; banner_url: string | null; bio_md: string | null; billed_from: string | null; era_id: number | null; is_hall_of_fame: boolean; win_count: number; loss_count: number; draw_count: number; total_matches: number; total_championship_days: number; total_reigns: number; birth_city: string | null; birth_state: string | null; birth_country: string | null; nationalities: string[] | null; current_brand: string | null; created_at: string; updated_at: string; cagematch_id: number | null
}

export interface MatchManager {
  id: number; match_id: number; superstar_id: number; managing_for_superstar_id: number | null; team_number: number | null; created_at: string
}

export interface MatchObject {
  id: number; name: string; slug: string; description: string | null; image_url: string | null; created_at: string
}

export interface MatchObjectUsage {
  id: number; match_id: number; object_id: number; used_by_superstar_id: number | null; description: string | null; timestamp_seconds: number | null; created_at: string
}

export interface MatchCommentator {
  id: number; match_id: number; superstar_id: number; created_at: string
}

export interface ShowSeries {
  id: number; name: string; slug: string; short_name: string | null; logo_url: string | null; description: string | null; first_episode_date: string | null; is_active: boolean; sort_order: number; created_at: string; updated_at: string
}

export interface Show {
  id: number; name: string; slug: string; date: string; show_type: ShowType; venue: string | null; city: string | null; state_province: string | null; country: string | null; attendance: number | null; tv_audience: number | null; logo_url: string | null; banner_url: string | null; description_md: string | null; highlights_md: string | null; ppv_series_name: string | null; show_series_id: number | null; episode_number: number | null; start_time: string | null; theme_song: string | null; theme_song_artist: string | null; theme_song_url: string | null; rating: number | null; primary_color: string | null; era_id: number | null; created_at: string; updated_at: string
}

export interface Match {
  id: number; show_id: number | null; match_type_id: number | null; championship_id: number | null; date: string; match_order: number | null; duration_seconds: number | null; rating: number | null; result_type: ResultType | null; winner_id: number | null; winner_team: number | null; is_title_change: boolean; summary_md: string | null; video_url: string | null; card_position: string | null; notes: string | null; slug: string | null; score_winner: number | null; score_loser: number | null; is_dark_match: boolean; is_spoiler: boolean; image_url: string | null; time_limit_seconds: number | null; created_at: string; updated_at: string
}

export interface MatchParticipant {
  id: number; match_id: number; superstar_id: number; team_number: number | null; is_winner: boolean; entrance_order: number | null; elimination_order: number | null; attire_url: string | null; entrance_url: string | null; eliminated_by_id: number | null; elimination_time_seconds: number | null; entry_number: number | null; is_survivor: boolean; elimination_method: string | null; tag_team_id: number | null; photo_url_override: string | null; created_at: string
}

export interface MatchReferee {
  id: number; match_id: number; superstar_id: number | null; referee_name: string | null; is_special_referee: boolean; created_at: string
}

export interface ShowSegment {
  id: number; show_id: number; slug: string; title: string; category: SegmentCategory; description_md: string | null; image_url: string | null; video_url: string | null; sort_order: number; duration_seconds: number | null; rating: number | null; is_spoiler: boolean; created_at: string; updated_at: string
}

export interface ShowSegmentParticipant {
  id: number; segment_id: number; superstar_id: number; role: string; sort_order: number; created_at: string
}

export interface ShowCommentator {
  id: number; show_id: number; superstar_id: number; role: string; created_at: string
}

export interface ShowRingAnnouncer {
  id: number; show_id: number; superstar_id: number; created_at: string
}

export interface SuperstarPhoto {
  id: number; superstar_id: number; year: number; photo_url: string; description: string | null; is_primary: boolean; created_at: string
}

export interface ShowMedia {
  id: number; show_id: number; media_type: string; title: string | null; url: string; thumbnail_url: string | null; sort_order: number; created_at: string
}

export interface MatchMedia {
  id: number; match_id: number; media_type: string; title: string | null; url: string; thumbnail_url: string | null; sort_order: number; created_at: string
}

export interface SegmentMedia {
  id: number; segment_id: number; media_type: string; title: string | null; url: string; thumbnail_url: string | null; sort_order: number; created_at: string
}

export interface Championship {
  id: number; name: string; slug: string; status: ChampionshipStatus; introduced_date: string | null; retired_date: string | null; description_md: string | null; image_url: string | null; brand: string | null; sort_order: number; created_at: string; updated_at: string
}

export interface ChampionshipReign {
  id: number; championship_id: number; superstar_id: number; won_date: string; lost_date: string | null; days_held: number | null; reign_number: number | null; won_at_show_id: number | null; lost_at_show_id: number | null; won_match_id: number | null; lost_match_id: number | null; notes: string | null; created_at: string
}

export interface MatchType {
  id: number; name: string; slug: string; description: string | null; rules_md: string | null; image_url: string | null; created_at: string
}

export interface Rivalry {
  id: number; name: string; slug: string; start_date: string | null; end_date: string | null; description_md: string | null; image_url: string | null; video_url: string | null; created_at: string; updated_at: string
}

export interface TagTeam {
  id: number; name: string; slug: string; formed_date: string | null; split_date: string | null; is_active: boolean; photo_url: string | null; description_md: string | null; created_at: string; updated_at: string
}

export interface Stable {
  id: number; name: string; slug: string; formed_date: string | null; split_date: string | null; is_active: boolean; photo_url: string | null; description_md: string | null; created_at: string; updated_at: string
}

// Anciens types (pour compatibilité)
export interface SuperstarRoleRow { id: number; superstar_id: number; role: SuperstarRole; is_primary: boolean; start_year: number | null; end_year: number | null; created_at: string }
export interface SuperstarEra { id: number; superstar_id: number; era_id: number; is_primary: boolean; created_at: string }
export interface SuperstarNickname { id: number; superstar_id: number; nickname: string; is_primary: boolean; sort_order: number; created_at: string }
export interface SuperstarAlias { id: number; superstar_id: number; alias_name: string; start_date: string | null; end_date: string | null; created_at: string }
export interface Finisher { id: number; superstar_id: number; name: string; move_type: MoveType; description: string | null; created_at: string }
export interface EntranceTheme { id: number; superstar_id: number; song_name: string; artist: string | null; start_date: string | null; end_date: string | null; is_current: boolean; created_at: string }
export interface SuperstarTimeline { id: number; superstar_id: number; title: string; description: string | null; date: string | null; sort_order: number; created_at: string }
export interface SuperstarDraftHistory { id: number; superstar_id: number; brand: string; draft_date: string; notes: string | null; created_at: string }
export interface SuperstarCareerBreak { id: number; superstar_id: number; reason: string | null; start_date: string; end_date: string | null; created_at: string }
export interface SuperstarFamily { id: number; superstar_id: number; related_superstar_id: number; relationship: string; created_at: string }
export interface SuperstarTrainer { id: number; superstar_id: number; trainer_id: number; created_at: string }
export interface SuperstarSocialLink { id: number; superstar_id: number; platform: string; url: string; created_at: string }
export interface Book { id: number; superstar_id: number; title: string; year: number | null; description: string | null; cover_url: string | null; created_at: string }
export interface Film { id: number; superstar_id: number; title: string; year: number | null; role: string | null; description: string | null; poster_url: string | null; created_at: string }


// ============================================================
// SUPABASE DATABASE DEFINITION
// ============================================================

export interface Database {
  public: {
    Tables: {
      eras: { Row: Era; Insert: Partial<Omit<Era, 'id' | 'created_at' | 'updated_at'>>; Update: Partial<Era> }
      superstars: { Row: Superstar; Insert: Partial<Omit<Superstar, 'id' | 'created_at' | 'updated_at'>>; Update: Partial<Superstar> }
      shows: { Row: Show; Insert: Partial<Omit<Show, 'id' | 'created_at' | 'updated_at'>>; Update: Partial<Show> }
      matches: { Row: Match; Insert: Partial<Omit<Match, 'id' | 'created_at' | 'updated_at'>>; Update: Partial<Match> }
      
      // Tables critiques qui manquaient :
      match_managers: { Row: MatchManager; Insert: Partial<Omit<MatchManager, 'id' | 'created_at'>>; Update: Partial<MatchManager> }
      match_objects: { Row: MatchObject; Insert: Partial<Omit<MatchObject, 'id' | 'created_at'>>; Update: Partial<MatchObject> }
      match_object_usage: { Row: MatchObjectUsage; Insert: Partial<Omit<MatchObjectUsage, 'id' | 'created_at'>>; Update: Partial<MatchObjectUsage> }
      match_commentators: { Row: MatchCommentator; Insert: Partial<Omit<MatchCommentator, 'id' | 'created_at'>>; Update: Partial<MatchCommentator> }
      
      // Le reste des tables :
      match_participants: { Row: MatchParticipant; Insert: Partial<Omit<MatchParticipant, 'id' | 'created_at'>>; Update: Partial<MatchParticipant> }
      match_referees: { Row: MatchReferee; Insert: Partial<Omit<MatchReferee, 'id' | 'created_at'>>; Update: Partial<MatchReferee> }
      match_types: { Row: MatchType; Insert: Partial<Omit<MatchType, 'id' | 'created_at'>>; Update: Partial<MatchType> }
      match_media: { Row: MatchMedia; Insert: Partial<Omit<MatchMedia, 'id' | 'created_at'>>; Update: Partial<MatchMedia> }
      
      show_series: { Row: ShowSeries; Insert: Partial<Omit<ShowSeries, 'id' | 'created_at' | 'updated_at'>>; Update: Partial<ShowSeries> }
      show_segments: { Row: ShowSegment; Insert: Partial<Omit<ShowSegment, 'id' | 'created_at' | 'updated_at'>>; Update: Partial<ShowSegment> }
      show_segment_participants: { Row: ShowSegmentParticipant; Insert: Partial<Omit<ShowSegmentParticipant, 'id' | 'created_at'>>; Update: Partial<ShowSegmentParticipant> }
      show_commentators: { Row: ShowCommentator; Insert: Partial<Omit<ShowCommentator, 'id' | 'created_at'>>; Update: Partial<ShowCommentator> }
      show_ring_announcers: { Row: ShowRingAnnouncer; Insert: Partial<Omit<ShowRingAnnouncer, 'id' | 'created_at'>>; Update: Partial<ShowRingAnnouncer> }
      show_media: { Row: ShowMedia; Insert: Partial<Omit<ShowMedia, 'id' | 'created_at'>>; Update: Partial<ShowMedia> }
      segment_media: { Row: SegmentMedia; Insert: Partial<Omit<SegmentMedia, 'id' | 'created_at'>>; Update: Partial<SegmentMedia> }
      
      superstar_photos: { Row: SuperstarPhoto; Insert: Partial<Omit<SuperstarPhoto, 'id' | 'created_at'>>; Update: Partial<SuperstarPhoto> }
      superstar_roles: { Row: SuperstarRoleRow; Insert: Partial<Omit<SuperstarRoleRow, 'id' | 'created_at'>>; Update: Partial<SuperstarRoleRow> }
      superstar_eras: { Row: SuperstarEra; Insert: Partial<Omit<SuperstarEra, 'id' | 'created_at'>>; Update: Partial<SuperstarEra> }
      superstar_nicknames: { Row: SuperstarNickname; Insert: Partial<Omit<SuperstarNickname, 'id' | 'created_at'>>; Update: Partial<SuperstarNickname> }
      superstar_aliases: { Row: SuperstarAlias; Insert: Partial<Omit<SuperstarAlias, 'id' | 'created_at'>>; Update: Partial<SuperstarAlias> }
      finishers: { Row: Finisher; Insert: Partial<Omit<Finisher, 'id' | 'created_at'>>; Update: Partial<Finisher> }
      entrance_themes: { Row: EntranceTheme; Insert: Partial<Omit<EntranceTheme, 'id' | 'created_at'>>; Update: Partial<EntranceTheme> }
      superstar_timeline: { Row: SuperstarTimeline; Insert: Partial<Omit<SuperstarTimeline, 'id' | 'created_at'>>; Update: Partial<SuperstarTimeline> }
      superstar_draft_history: { Row: SuperstarDraftHistory; Insert: Partial<Omit<SuperstarDraftHistory, 'id' | 'created_at'>>; Update: Partial<SuperstarDraftHistory> }
      superstar_career_breaks: { Row: SuperstarCareerBreak; Insert: Partial<Omit<SuperstarCareerBreak, 'id' | 'created_at'>>; Update: Partial<SuperstarCareerBreak> }
      superstar_families: { Row: SuperstarFamily; Insert: Partial<Omit<SuperstarFamily, 'id' | 'created_at'>>; Update: Partial<SuperstarFamily> }
      superstar_trainers: { Row: SuperstarTrainer; Insert: Partial<Omit<SuperstarTrainer, 'id' | 'created_at'>>; Update: Partial<SuperstarTrainer> }
      superstar_social_links: { Row: SuperstarSocialLink; Insert: Partial<Omit<SuperstarSocialLink, 'id' | 'created_at'>>; Update: Partial<SuperstarSocialLink> }
      books: { Row: Book; Insert: Partial<Omit<Book, 'id' | 'created_at'>>; Update: Partial<Book> }
      films: { Row: Film; Insert: Partial<Omit<Film, 'id' | 'created_at'>>; Update: Partial<Film> }

      championships: { Row: Championship; Insert: Partial<Omit<Championship, 'id' | 'created_at' | 'updated_at'>>; Update: Partial<Championship> }
      championship_reigns: { Row: ChampionshipReign; Insert: Partial<Omit<ChampionshipReign, 'id' | 'created_at'>>; Update: Partial<ChampionshipReign> }
      rivalries: { Row: Rivalry; Insert: Partial<Omit<Rivalry, 'id' | 'created_at' | 'updated_at'>>; Update: Partial<Rivalry> }
      tag_teams: { Row: TagTeam; Insert: Partial<Omit<TagTeam, 'id' | 'created_at' | 'updated_at'>>; Update: Partial<TagTeam> }
      stables: { Row: Stable; Insert: Partial<Omit<Stable, 'id' | 'created_at' | 'updated_at'>>; Update: Partial<Stable> }
    }
    Functions: {
      get_random_match: { Args: Record<string, never>; Returns: any[] }
      get_random_rivalry: { Args: Record<string, never>; Returns: any[] }
      get_site_stats: { Args: Record<string, never>; Returns: any[] }
      get_superstar_photo: { Args: { p_superstar_id: number; p_year: number }; Returns: string }
      get_head_to_head: { Args: { p_superstar1_id: number; p_superstar2_id: number }; Returns: any[] }
      get_win_methods: { Args: { p_superstar_id: number }; Returns: any[] }
    }
  }
}