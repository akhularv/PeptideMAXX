import { hasSupabaseEnv, supabase } from './supabase'

export type Platform = 'tiktok' | 'instagram'
export type EvidenceSignal = 'cited' | 'anecdotal' | 'experiential' | 'unknown'
export type ClaimType = 'mechanism' | 'dosing' | 'effect' | 'warning' | 'anecdote' | 'review'

export interface SocialPost {
  id: string
  platform: Platform
  source_handle: string
  caption: string
  hashtags: string[]
  view_count: number
  like_count: number
  video_url: string
  thumbnail_url: string
  posted_at: string
  compound_mentions: CompoundMention[]
}

export interface CompoundMention {
  compound_key: string
  compound_name: string
  claim_excerpt: string
  claim_type: ClaimType
  evidence_signal: EvidenceSignal
  confidence: number
}

export interface TrendSignal {
  compound_key: string
  compound_name: string
  mention_count: number
  total_views: number
  trending_up: boolean | null
}

export interface TrackedSource {
  id: string
  type: 'account' | 'hashtag'
  platform: Platform
  handle: string
  display_name: string | null
  follower_est: number | null
  focus_tags: string[]
}

// ─── Supabase Queries ───────────────────────────────────────────────────────

export async function fetchTrendPosts(options: {
  platform?: Platform
  compoundKey?: string
  limit?: number
} = {}): Promise<SocialPost[]> {
  if (!hasSupabaseEnv) return MOCK_POSTS

  let query = supabase
    .from('social_posts')
    .select(`
      id, platform, source_handle, caption, hashtags,
      view_count, like_count, video_url, thumbnail_url, posted_at,
      compound_mentions (
        compound_key, compound_name, claim_excerpt,
        claim_type, evidence_signal, confidence
      )
    `)
    .eq('processed', true)
    .not('compound_mentions', 'is', null)
    .order('posted_at', { ascending: false })
    .limit(options.limit ?? 40)

  if (options.platform) query = query.eq('platform', options.platform)

  const { data, error } = await query
  if (error || !data) return MOCK_POSTS

  const posts = data as SocialPost[]
  return posts.length > 0 ? posts : MOCK_POSTS
}

export async function fetchTrendSignals(): Promise<TrendSignal[]> {
  if (!hasSupabaseEnv) return MOCK_TRENDS

  // Only read from the most recent 13-hour window to avoid stale rows
  // accumulating from prior scrape cycles (process-posts uses INSERT not UPSERT)
  const cutoff = new Date(Date.now() - 13 * 3600_000).toISOString()
  const { data, error } = await supabase
    .from('trend_signals')
    .select('compound_key, mention_count, total_views, trending_up')
    .gte('computed_at', cutoff)
    .order('mention_count', { ascending: false })
    .limit(10)

  if (error || !data || data.length === 0) return MOCK_TRENDS

  return (data as TrendSignal[]).map((t) => ({
    ...t,
    compound_name: COMPOUND_NAMES[t.compound_key] ?? t.compound_key,
  }))
}

export async function fetchTrackedSources(): Promise<TrackedSource[]> {
  if (!hasSupabaseEnv) return MOCK_SOURCES

  const { data, error } = await supabase
    .from('tracked_sources')
    .select('id, type, platform, handle, display_name, follower_est, focus_tags')
    .eq('is_active', true)
    .order('follower_est', { ascending: false })

  if (error || !data || data.length === 0) return MOCK_SOURCES
  return data as TrackedSource[]
}

// ─── Helpers ────────────────────────────────────────────────────────────────

export const COMPOUND_NAMES: Record<string, string> = {
  'bpc-157':      'BPC-157',
  'tb-500':       'TB-500',
  'semax':        'Semax',
  'selank':       'Selank',
  'ghk-cu':       'GHK-Cu',
  'ipamorelin':   'Ipamorelin',
  'dihexa':       'Dihexa',
  'nad-plus':     'NAD+',
  'cjc-1295-dac': 'CJC-1295',
  'pt-141':       'PT-141',
}

export function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

export function platformLabel(p: Platform): string {
  return p === 'tiktok' ? 'TikTok' : 'Instagram'
}

// ─── Mock Data (demo mode when Supabase is not connected) ───────────────────

const MOCK_POSTS: SocialPost[] = [
  {
    id: 'mock-1',
    platform: 'tiktok',
    source_handle: 'thebiohackingdoc',
    caption: 'BPC-157 has been one of the most researched peptides for tendon healing in animal models. 200-500mcg subQ daily for 4-8 weeks. No completed human RCTs but anecdotal reports are strong. Always source from reputable peptide vendors. #BPC157 #peptides #biohacking #tendonhealing',
    hashtags: ['bpc157','peptides','biohacking','tendonhealing'],
    view_count: 2_840_000,
    like_count: 187_000,
    video_url: 'https://www.tiktok.com/@thebiohackingdoc',
    thumbnail_url: '',
    posted_at: new Date(Date.now() - 1 * 86400_000).toISOString(),
    compound_mentions: [
      { compound_key: 'bpc-157', compound_name: 'BPC-157', claim_excerpt: 'most researched peptides for tendon healing in animal models. 200-500mcg subQ daily', claim_type: 'dosing', evidence_signal: 'anecdotal', confidence: 0.96 },
    ],
  },
  {
    id: 'mock-2',
    platform: 'instagram',
    source_handle: 'jay_campbell_official',
    caption: 'Stacking CJC-1295 with Ipamorelin is the gold standard GH pulse protocol. CJC provides the GHRH signal, Ipa provides the GHRP signal. Together you get a synergistic GH release without cortisol or prolactin elevation. Dose: 100mcg each, 2-3x/week. #peptides #peptidetherapy #GH #longevity #biohacking',
    hashtags: ['peptides','peptidetherapy','gh','longevity','biohacking'],
    view_count: 1_230_000,
    like_count: 94_000,
    video_url: 'https://www.instagram.com/jay_campbell_official',
    thumbnail_url: '',
    posted_at: new Date(Date.now() - 2 * 86400_000).toISOString(),
    compound_mentions: [
      { compound_key: 'cjc-1295-dac', compound_name: 'CJC-1295', claim_excerpt: 'CJC provides the GHRH signal — gold standard GH pulse protocol', claim_type: 'mechanism', evidence_signal: 'experiential', confidence: 0.91 },
      { compound_key: 'ipamorelin', compound_name: 'Ipamorelin', claim_excerpt: 'Ipa provides the GHRP signal — synergistic GH release without cortisol or prolactin elevation', claim_type: 'mechanism', evidence_signal: 'experiential', confidence: 0.93 },
    ],
  },
  {
    id: 'mock-3',
    platform: 'tiktok',
    source_handle: 'peptide.doc',
    caption: 'Semax nasal spray for cognitive enhancement. ACTH(4-7) analogue approved in Russia for stroke rehab. 600mcg per nostril daily. I\'ve been using it for 6 months — markedly improved focus and recall. Clinical backing exists in Slavic literature. #semax #nootropics #cognitive #peptides',
    hashtags: ['semax','nootropics','cognitive','peptides'],
    view_count: 980_000,
    like_count: 72_000,
    video_url: 'https://www.tiktok.com/@peptide.doc',
    thumbnail_url: '',
    posted_at: new Date(Date.now() - 3 * 86400_000).toISOString(),
    compound_mentions: [
      { compound_key: 'semax', compound_name: 'Semax', claim_excerpt: 'ACTH(4-7) analogue approved in Russia for stroke rehab. 600mcg per nostril daily', claim_type: 'dosing', evidence_signal: 'cited', confidence: 0.94 },
    ],
  },
  {
    id: 'mock-4',
    platform: 'tiktok',
    source_handle: 'longevitylab_',
    caption: 'NAD+ declines 50% by age 50. I run IV NAD+ 500mg twice yearly plus daily NMN 500mg oral. The research on sirtuins and mitochondrial function is compelling. David Sinclair\'s work at Harvard specifically. This isn\'t biohacking — it\'s maintenance. #NAD #NMN #longevity #aging #mitochondria',
    hashtags: ['nad','nmn','longevity','aging','mitochondria'],
    view_count: 4_200_000,
    like_count: 341_000,
    video_url: 'https://www.tiktok.com/@longevitylab_',
    thumbnail_url: '',
    posted_at: new Date(Date.now() - 4 * 86400_000).toISOString(),
    compound_mentions: [
      { compound_key: 'nad-plus', compound_name: 'NAD+', claim_excerpt: 'NAD+ declines 50% by age 50. IV NAD+ 500mg twice yearly plus daily NMN 500mg oral', claim_type: 'dosing', evidence_signal: 'cited', confidence: 0.97 },
    ],
  },
  {
    id: 'mock-5',
    platform: 'instagram',
    source_handle: 'thebiohackingdoc',
    caption: 'TB-500 for the heart. Phase I/II trials show cardioprotective effects post-MI. The actin sequestration mechanism reduces infarct size. 2mg SubQ 2x/week loading phase. This one has actual human data — don\'t confuse it with BPC which is still in animal model territory. #TB500 #peptides #cardioprotection',
    hashtags: ['tb500','peptides','cardioprotection'],
    view_count: 1_560_000,
    like_count: 112_000,
    video_url: 'https://www.instagram.com/thebiohackingdoc',
    thumbnail_url: '',
    posted_at: new Date(Date.now() - 5 * 86400_000).toISOString(),
    compound_mentions: [
      { compound_key: 'tb-500', compound_name: 'TB-500', claim_excerpt: 'Phase I/II trials show cardioprotective effects post-MI. 2mg SubQ 2x/week loading phase', claim_type: 'mechanism', evidence_signal: 'cited', confidence: 0.95 },
    ],
  },
  {
    id: 'mock-6',
    platform: 'tiktok',
    source_handle: 'nootrostack',
    caption: 'Selank for anxiety without sedation. It\'s a tuftsin analogue — approved in Russia, non-habit-forming. 250mcg intranasal. I\'ve been combining it with Semax for the anxiolytic + nootropic stack. Both are in the same class. #selank #nootropics #anxiety #smartdrugs',
    hashtags: ['selank','nootropics','anxiety','smartdrugs'],
    view_count: 660_000,
    like_count: 48_000,
    video_url: 'https://www.tiktok.com/@nootrostack',
    thumbnail_url: '',
    posted_at: new Date(Date.now() - 6 * 86400_000).toISOString(),
    compound_mentions: [
      { compound_key: 'selank', compound_name: 'Selank', claim_excerpt: 'tuftsin analogue — approved in Russia, non-habit-forming. 250mcg intranasal', claim_type: 'dosing', evidence_signal: 'cited', confidence: 0.92 },
      { compound_key: 'semax', compound_name: 'Semax', claim_excerpt: 'combining it with Semax for the anxiolytic + nootropic stack', claim_type: 'effect', evidence_signal: 'experiential', confidence: 0.87 },
    ],
  },
  {
    id: 'mock-7',
    platform: 'instagram',
    source_handle: 'drbradnabers',
    caption: 'GHK-Cu — the copper peptide that keeps getting more interesting. Endogenous tripeptide that modulates 4,000+ genes. Topical application shows real wound healing and skin collagen data. Systemic use is where it gets speculative. Research by Loren Pickart is worth reading. #GHKCu #peptides #skincare #longevity',
    hashtags: ['ghkcu','peptides','skincare','longevity'],
    view_count: 890_000,
    like_count: 67_000,
    video_url: 'https://www.instagram.com/drbradnabers',
    thumbnail_url: '',
    posted_at: new Date(Date.now() - 7 * 86400_000).toISOString(),
    compound_mentions: [
      { compound_key: 'ghk-cu', compound_name: 'GHK-Cu', claim_excerpt: 'copper peptide that modulates 4,000+ genes. Topical shows real wound healing and skin collagen data', claim_type: 'mechanism', evidence_signal: 'cited', confidence: 0.93 },
    ],
  },
  {
    id: 'mock-8',
    platform: 'tiktok',
    source_handle: 'stackingprotocols',
    caption: 'PT-141 is the only FDA-approved peptide for sexual health (as Vyleesi). Acts centrally on melanocortin receptors — totally different mechanism from PDE5 inhibitors. Works in both men and women. 1.75mg autoinjector 45min before. #PT141 #Bremelanotide #peptides #sexualhealth',
    hashtags: ['pt141','bremelanotide','peptides','sexualhealth'],
    view_count: 3_100_000,
    like_count: 248_000,
    video_url: 'https://www.tiktok.com/@stackingprotocols',
    thumbnail_url: '',
    posted_at: new Date(Date.now() - 2 * 86400_000).toISOString(),
    compound_mentions: [
      { compound_key: 'pt-141', compound_name: 'PT-141', claim_excerpt: 'FDA-approved peptide for sexual health (as Vyleesi). Acts centrally on melanocortin receptors. 1.75mg autoinjector 45min before', claim_type: 'dosing', evidence_signal: 'cited', confidence: 0.98 },
    ],
  },
]

const MOCK_TRENDS: TrendSignal[] = [
  { compound_key: 'bpc-157',      compound_name: 'BPC-157',     mention_count: 847, total_views: 12_400_000, trending_up: true },
  { compound_key: 'nad-plus',     compound_name: 'NAD+',        mention_count: 612, total_views: 9_800_000,  trending_up: true },
  { compound_key: 'pt-141',       compound_name: 'PT-141',      mention_count: 431, total_views: 7_200_000,  trending_up: true },
  { compound_key: 'tb-500',       compound_name: 'TB-500',      mention_count: 384, total_views: 6_100_000,  trending_up: false },
  { compound_key: 'semax',        compound_name: 'Semax',       mention_count: 298, total_views: 4_400_000,  trending_up: true },
  { compound_key: 'ipamorelin',   compound_name: 'Ipamorelin',  mention_count: 276, total_views: 3_900_000,  trending_up: false },
  { compound_key: 'cjc-1295-dac', compound_name: 'CJC-1295',   mention_count: 241, total_views: 3_600_000,  trending_up: false },
  { compound_key: 'selank',       compound_name: 'Selank',      mention_count: 187, total_views: 2_800_000,  trending_up: true },
  { compound_key: 'ghk-cu',       compound_name: 'GHK-Cu',      mention_count: 164, total_views: 2_200_000,  trending_up: true },
  { compound_key: 'dihexa',       compound_name: 'Dihexa',      mention_count: 43,  total_views: 890_000,    trending_up: false },
]

const MOCK_SOURCES: TrackedSource[] = [
  { id: 's1',  type: 'account', platform: 'tiktok',     handle: 'thebiohackingdoc',    display_name: 'The Biohacking Doc', follower_est: 310000, focus_tags: ['biohacking','nootropics','longevity'] },
  { id: 's2',  type: 'account', platform: 'tiktok',     handle: 'peptide.doc',          display_name: 'Peptide Doc',        follower_est: 220000, focus_tags: ['peptides','clinical'] },
  { id: 's3',  type: 'account', platform: 'tiktok',     handle: 'longevitylab_',        display_name: 'Longevity Lab',      follower_est: 260000, focus_tags: ['longevity','nad','peptides'] },
  { id: 's4',  type: 'account', platform: 'tiktok',     handle: 'stackingprotocols',    display_name: 'Stacking Protocols', follower_est: 145000, focus_tags: ['peptides','stacks'] },
  { id: 's5',  type: 'account', platform: 'tiktok',     handle: 'drbradnabers',         display_name: 'Dr. Brad Nabers',    follower_est: 180000, focus_tags: ['peptides','biohacking'] },
  { id: 's6',  type: 'account', platform: 'instagram',  handle: 'jay_campbell_official',display_name: 'Jay Campbell',       follower_est: 185000, focus_tags: ['peptides','trt','longevity'] },
  { id: 's7',  type: 'account', platform: 'instagram',  handle: 'thebiohackingdoc',     display_name: 'The Biohacking Doc', follower_est: 198000, focus_tags: ['biohacking','longevity'] },
  { id: 's8',  type: 'account', platform: 'instagram',  handle: 'drbradnabers',         display_name: 'Dr. Brad Nabers',    follower_est: 92000,  focus_tags: ['peptides','biohacking'] },
]
