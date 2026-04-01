import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  fetchTrendPosts,
  fetchTrendSignals,
  fetchTrackedSources,
  formatViews,
  type CompoundMention,
  type Platform,
  type SocialPost,
  type TrendSignal,
  type TrackedSource,
} from '@/lib/trends'

const EVIDENCE_COLORS: Record<string, string> = {
  cited:        'var(--accent)',
  experiential: 'var(--accent-cool)',
  anecdotal:    'var(--accent-warm)',
  unknown:      'var(--muted)',
}

const PLATFORM_COLORS: Record<Platform, string> = {
  tiktok:    '#7DF0C8',
  instagram: '#7ABFFF',
}

function PlatformBadge({ platform }: { platform: Platform }) {
  return (
    <span
      className="atlas-chip"
      style={{
        borderColor: `${PLATFORM_COLORS[platform]}40`,
        color: PLATFORM_COLORS[platform],
        fontSize: 10,
        letterSpacing: '0.14em',
      }}
    >
      {platform === 'tiktok' ? '↯ TIKTOK' : '◈ INSTAGRAM'}
    </span>
  )
}

function EvidenceDot({ signal }: { signal: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontFamily: 'var(--mono)',
        fontSize: 10,
        letterSpacing: '0.12em',
        color: EVIDENCE_COLORS[signal] ?? 'var(--muted)',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: EVIDENCE_COLORS[signal] ?? 'var(--muted)',
          flexShrink: 0,
        }}
      />
      {signal.toUpperCase()}
    </span>
  )
}

function CompoundTag({ mention }: { mention: CompoundMention }) {
  return (
    <button
      className="atlas-chip"
      style={{
        cursor: 'default',
        borderColor: `${EVIDENCE_COLORS[mention.evidence_signal] ?? 'var(--muted)'}30`,
        color: EVIDENCE_COLORS[mention.evidence_signal] ?? 'var(--muted)',
      }}
    >
      {mention.compound_name}
    </button>
  )
}

function PostCard({ post, onAskVoss }: { post: SocialPost; onAskVoss: (post: SocialPost) => void }) {
  const [expanded, setExpanded] = useState(false)
  const topMention = post.compound_mentions[0]

  return (
    <motion.div
      layout
      className="atlas-panel"
      style={{ padding: '20px 24px', cursor: 'pointer' }}
      onClick={() => setExpanded((v) => !v)}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <PlatformBadge platform={post.platform} />
        <span
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 11,
            color: 'var(--accent)',
            letterSpacing: '0.04em',
          }}
        >
          @{post.source_handle}
        </span>
        <span className="atlas-label" style={{ marginLeft: 'auto' }}>
          {formatViews(post.view_count)} views
        </span>
        <span className="atlas-label">
          {new Date(post.posted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>

      {/* Caption */}
      <p
        className="atlas-copy"
        style={{
          fontSize: 14,
          lineHeight: 1.55,
          marginBottom: 14,
          display: '-webkit-box',
          WebkitLineClamp: expanded ? undefined : 3,
          WebkitBoxOrient: 'vertical',
          overflow: expanded ? 'visible' : 'hidden',
        }}
      >
        {post.caption}
      </p>

      {/* Compound tags */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {post.compound_mentions.map((m) => (
          <CompoundTag
            key={m.compound_key}
            mention={m}
          />
        ))}
      </div>

      {/* Expanded: claim excerpts */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                borderTop: '1px solid var(--panel-edge)',
                paddingTop: 14,
                marginBottom: 14,
                display: 'grid',
                gap: 10,
              }}
            >
              {post.compound_mentions.map((m) => (
                <div key={m.compound_key} style={{ display: 'grid', gap: 4 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 700,
                        fontSize: 12,
                        color: 'var(--text)',
                      }}
                    >
                      {m.compound_name}
                    </span>
                    <EvidenceDot signal={m.evidence_signal} />
                    <span className="atlas-label" style={{ textTransform: 'capitalize' }}>
                      {m.claim_type}
                    </span>
                  </div>
                  <p className="atlas-caption" style={{ fontStyle: 'italic', color: 'var(--text-dim)' }}>
                    "{m.claim_excerpt}"
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}
        onClick={(e) => e.stopPropagation()}
      >
        {topMention && <EvidenceDot signal={topMention.evidence_signal} />}
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
          <a
            href={post.video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="atlas-chip"
            style={{ textDecoration: 'none', fontSize: 10 }}
          >
            View source ↗
          </a>
          <button
            className="atlas-button-primary"
            style={{ padding: '6px 12px', fontSize: 11 }}
            onClick={() => onAskVoss(post)}
          >
            Ask Dr. Voss
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function TrendBar({ signal, rank }: { signal: TrendSignal; rank: number }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '18px minmax(0,1fr) auto',
        gap: 10,
        alignItems: 'center',
        padding: '8px 0',
        borderBottom: '1px solid var(--panel-edge)',
      }}
    >
      <span className="atlas-label" style={{ color: 'var(--muted)', textAlign: 'right' }}>
        {rank}
      </span>
      <div>
        <div
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
            fontSize: 13,
            color: 'var(--text)',
            marginBottom: 3,
          }}
        >
          {signal.compound_name}
          {signal.trending_up && (
            <span style={{ color: 'var(--accent)', marginLeft: 6, fontSize: 11 }}>↑</span>
          )}
        </div>
        <div className="atlas-label">{formatViews(signal.total_views)} views · 7d</div>
      </div>
      <div
        className="atlas-readout__value"
        style={{ fontSize: 20, textAlign: 'right', color: 'var(--text-dim)' }}
      >
        {signal.mention_count}
      </div>
    </div>
  )
}

function SourceRow({ source }: { source: TrackedSource }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 0',
        borderBottom: '1px solid var(--panel-edge)',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--mono)',
          fontSize: 10,
          color: source.platform === 'tiktok' ? 'var(--accent)' : 'var(--accent-cool)',
          letterSpacing: '0.1em',
          flexShrink: 0,
        }}
      >
        {source.platform === 'tiktok' ? '↯' : '◈'}
      </span>
      <span className="atlas-caption" style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>
        @{source.handle}
      </span>
      {source.follower_est && (
        <span className="atlas-label" style={{ marginLeft: 'auto', flexShrink: 0 }}>
          {formatViews(source.follower_est)}
        </span>
      )}
    </div>
  )
}

export function Trends() {
  const navigate = useNavigate()

  const [posts, setPosts] = useState<SocialPost[]>([])
  const [trends, setTrends] = useState<TrendSignal[]>([])
  const [sources, setSources] = useState<TrackedSource[]>([])
  const [loading, setLoading] = useState(true)
  const [platform, setPlatform] = useState<'all' | Platform>('all')
  const [compoundFilter, setCompoundFilter] = useState<string>('all')

  useEffect(() => {
    Promise.all([
      fetchTrendPosts({ limit: 40 }),
      fetchTrendSignals(),
      fetchTrackedSources(),
    ]).then(([p, t, s]) => {
      setPosts(p)
      setTrends(t)
      setSources(s)
      setLoading(false)
    })
  }, [])

  const allCompounds = useMemo(() => {
    const keys = new Set<string>()
    posts.forEach((p) => p.compound_mentions.forEach((m) => keys.add(m.compound_key)))
    return Array.from(keys)
  }, [posts])

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      if (platform !== 'all' && p.platform !== platform) return false
      if (compoundFilter !== 'all' && !p.compound_mentions.some((m) => m.compound_key === compoundFilter)) return false
      return true
    })
  }, [posts, platform, compoundFilter])

  const handleAskVoss = (post: SocialPost) => {
    const topCompound = post.compound_mentions[0]?.compound_name ?? ''
    sessionStorage.setItem(
      'drVossInitialMessage',
      `I saw a post from @${post.source_handle} about ${topCompound}. They said: "${post.compound_mentions[0]?.claim_excerpt ?? ''}". Can you review the evidence quality and help me evaluate this claim?`
    )
    navigate('/app/chat')
  }

  return (
    <div className="atlas-shell">
      <div className="atlas-page-intro">
        <div className="atlas-kicker" style={{ marginBottom: 12 }}>
          Social intelligence
        </div>
        <h1 className="atlas-page-title atlas-page-title--wide">
          What the community is actually saying.
        </h1>
        <p className="atlas-copy atlas-page-lead">
          Posts from tracked peptide and nootropic creators, processed by Dr. Voss to extract
          compound mentions, dosing claims, and evidence signals — so you can evaluate the noise.
        </p>
      </div>

      <div className="atlas-layout-library">
        {/* Left rail — filters + trending */}
        <aside className="atlas-panel atlas-panel--soft atlas-sticky-rail" style={{ padding: 22 }}>
          <div className="atlas-kicker" style={{ marginBottom: 18 }}>
            Filter rail
          </div>

          {/* Platform filter */}
          <div style={{ marginBottom: 18 }}>
            <div className="atlas-label" style={{ marginBottom: 10 }}>Platform</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {(['all', 'tiktok', 'instagram'] as const).map((p) => (
                <button
                  key={p}
                  className={platform === p ? 'atlas-chip atlas-chip--active' : 'atlas-chip'}
                  onClick={() => setPlatform(p)}
                  style={{ justifyContent: 'center' }}
                >
                  {p === 'all' ? 'All' : p === 'tiktok' ? '↯ TikTok' : '◈ Instagram'}
                </button>
              ))}
            </div>
          </div>

          {/* Compound filter */}
          <div style={{ marginBottom: 22 }}>
            <div className="atlas-label" style={{ marginBottom: 10 }}>Compound</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <button
                className={compoundFilter === 'all' ? 'atlas-chip atlas-chip--active' : 'atlas-chip'}
                onClick={() => setCompoundFilter('all')}
                style={{ justifyContent: 'center' }}
              >
                All
              </button>
              {allCompounds.map((key) => {
                const name = trends.find((t) => t.compound_key === key)?.compound_name ?? key
                return (
                  <button
                    key={key}
                    className={compoundFilter === key ? 'atlas-chip atlas-chip--active' : 'atlas-chip'}
                    onClick={() => setCompoundFilter(key)}
                    style={{ justifyContent: 'center' }}
                  >
                    {name}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="atlas-divider" style={{ marginBottom: 18 }} />

          {/* Post count */}
          <div className="atlas-readout" style={{ marginBottom: 22 }}>
            <div className="atlas-readout__value" style={{ fontSize: 34, marginBottom: 4 }}>
              {filtered.length}
            </div>
            <div className="atlas-label">Posts in view</div>
          </div>

          <div className="atlas-divider" style={{ marginBottom: 18 }} />

          {/* Trending compounds */}
          <div className="atlas-label" style={{ marginBottom: 12 }}>
            Trending this week
          </div>
          {trends.slice(0, 8).map((t, i) => (
            <TrendBar key={t.compound_key} signal={t} rank={i + 1} />
          ))}
        </aside>

        {/* Center — post feed */}
        <section style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
          {loading && (
            <div className="atlas-panel" style={{ padding: 32, textAlign: 'center' }}>
              <p className="atlas-caption">Loading intelligence feed…</p>
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="atlas-panel" style={{ padding: 32 }}>
              <p className="atlas-caption">No posts match the current filters.</p>
            </div>
          )}
          {filtered.map((post) => (
            <PostCard key={post.id} post={post} onAskVoss={handleAskVoss} />
          ))}
        </section>

        {/* Right rail — tracked sources */}
        <aside className="atlas-panel atlas-panel--soft atlas-sticky-rail" style={{ padding: 22 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 18,
              paddingBottom: 14,
              borderBottom: '1px solid var(--panel-edge)',
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--accent)',
                boxShadow: '0 0 8px var(--accent)',
                flexShrink: 0,
              }}
            />
            <span className="atlas-label">Pipeline active</span>
          </div>

          <div className="atlas-kicker" style={{ marginBottom: 14 }}>
            Tracked creators
          </div>

          <div style={{ marginBottom: 22 }}>
            {sources.filter((s) => s.type === 'account').map((s) => (
              <SourceRow key={s.id} source={s} />
            ))}
          </div>

          <div className="atlas-divider" style={{ marginBottom: 18 }} />

          <div className="atlas-kicker" style={{ marginBottom: 14 }}>
            Tracked hashtags
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['BPC157','TB500','peptides','nootropics','biohacking','longevity',
              'peptidetherapy','GHKCu','semax','selank','PT141','ipamorelin'].map((tag) => (
              <span key={tag} className="atlas-chip" style={{ fontSize: 10 }}>
                #{tag}
              </span>
            ))}
          </div>

          <div className="atlas-divider" style={{ marginTop: 18, marginBottom: 18 }} />

          <div className="atlas-label" style={{ marginBottom: 8 }}>Next scrape</div>
          <p className="atlas-caption">Every 12 hours via Supabase Edge Function + Apify.</p>
          <p className="atlas-caption" style={{ marginTop: 8 }}>
            Connect APIFY_TOKEN and ANTHROPIC_API_KEY in Supabase Edge Function secrets to activate live data.
          </p>
        </aside>
      </div>
    </div>
  )
}
