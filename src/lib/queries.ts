import { supabase } from './supabase'

// ============================================================
// Fetch a single superstar by slug (with all related data)
// ============================================================

export async function getSuperstarBySlug(slug: string) {
  const { data: superstar, error } = await supabase
    .from('superstars')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !superstar) return null

  // Fetch all related data in parallel for performance
  const [
    { data: roles },
    { data: eras },
    { data: nicknames },
    { data: aliases },
    { data: finishers },
    { data: themes },
    { data: timeline },
    { data: draftHistory },
    { data: careerBreaks },
    { data: families },
    { data: trainers },
    { data: socialLinks },
    { data: books },
    { data: films },
  ] = await Promise.all([
    supabase
      .from('superstar_roles')
      .select('*')
      .eq('superstar_id', superstar.id)
      .order('is_primary', { ascending: false }),
    supabase
      .from('superstar_eras')
      .select('*, eras(*)')
      .eq('superstar_id', superstar.id)
      .order('era_id', { ascending: true }),
    supabase
      .from('superstar_nicknames')
      .select('*')
      .eq('superstar_id', superstar.id)
      .order('sort_order', { ascending: true }),
    supabase
      .from('superstar_aliases')
      .select('*')
      .eq('superstar_id', superstar.id)
      .order('start_date', { ascending: true }),
    supabase
      .from('finishers')
      .select('*')
      .eq('superstar_id', superstar.id),
    supabase
      .from('entrance_themes')
      .select('*')
      .eq('superstar_id', superstar.id)
      .order('start_date', { ascending: true }),
    supabase
      .from('superstar_timeline')
      .select('*')
      .eq('superstar_id', superstar.id)
      .order('sort_order', { ascending: true }),
    supabase
      .from('superstar_draft_history')
      .select('*')
      .eq('superstar_id', superstar.id)
      .order('draft_date', { ascending: true }),
    supabase
      .from('superstar_career_breaks')
      .select('*')
      .eq('superstar_id', superstar.id)
      .order('start_date', { ascending: true }),
    supabase
      .from('superstar_families')
      .select('*, related:superstars!superstar_families_related_superstar_id_fkey(id, name, slug, photo_url)')
      .eq('superstar_id', superstar.id),
    supabase
      .from('superstar_trainers')
      .select('*, trainer:superstars!superstar_trainers_trainer_id_fkey(id, name, slug)')
      .eq('superstar_id', superstar.id),
    supabase
      .from('superstar_social_links')
      .select('*')
      .eq('superstar_id', superstar.id),
    supabase
      .from('books')
      .select('*')
      .eq('superstar_id', superstar.id)
      .order('year', { ascending: false }),
    supabase
      .from('films')
      .select('*')
      .eq('superstar_id', superstar.id)
      .order('year', { ascending: false }),
  ])

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
// Fetch all superstars (for the grid page)
// ============================================================

export async function getAllSuperstars(options?: {
  status?: string
  role?: string
  brand?: string
  search?: string
  page?: number
  perPage?: number
}) {
  const { status, role, brand, search, page = 1, perPage = 24 } = options || {}
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  let query = supabase
    .from('superstars')
    .select('id, name, slug, photo_url, status, role, gender, current_brand, nationality, total_matches, win_count, total_reigns, is_hall_of_fame, birth_country, nicknames:superstar_nicknames(nickname, is_primary)', { count: 'exact' })
    .order('name', { ascending: true })
    .range(from, to)

  if (status && status !== 'all') query = query.eq('status', status)
  if (role && role !== 'all') query = query.eq('role', role)
  if (brand) query = query.eq('current_brand', brand)
  if (search) query = query.ilike('name', `%${search}%`)

  const { data, error, count } = await query

  return {
    superstars: data || [],
    total: count || 0,
    page,
    perPage,
    totalPages: Math.ceil((count || 0) / perPage),
  }
}

// ============================================================
// Fetch all slugs (for static generation)
// ============================================================

export async function getAllSuperstarSlugs() {
  const { data } = await supabase
    .from('superstars')
    .select('slug')

  return data?.map((s) => s.slug) || []
}
