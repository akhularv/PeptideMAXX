import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/Badge'
import type { Compound } from '@/types/compound'

interface CompoundCardProps {
  compound: Compound
  onClick: () => void
}

// Map evidence tier to Badge variant
const tierVariant: Record<Compound['evidenceTier'], 'clinical' | 'preclinical' | 'anecdotal'> = {
  clinical:    'clinical',
  preclinical: 'preclinical',
  anecdotal:   'anecdotal',
}

/**
 * Single compound card for the library grid.
 * Displays top accent bar, category badge, name, tags, mechanism excerpt,
 * evidence tier, and a VIEW link.
 *
 * D-01 fix: all hardcoded old-palette values (#0C1428, #1A2B4A, #243A60,
 * #00E5C8, #E8EDF5, #6B7FA3, #101D38, JetBrains Mono) replaced with
 * CSS custom properties from the new design token system.
 *
 * Args:
 *   compound: full Compound object to display
 *   onClick:  called when the card is activated
 */
export function CompoundCard({ compound, onClick }: CompoundCardProps) {
  return (
    <motion.div
      whileHover={{
        y: -6,
        // --panel-line: rgba(255,255,255,0.10) — replaces old dark-navy #243A60 hover border
        borderColor: 'var(--panel-line)',
        // Teal glow uses new --accent rgba equivalent
        boxShadow: '0 8px 40px rgba(125,240,200,0.08)',
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        // --panel: rgba(13,16,21,0.96) — replaces old dark-navy #0C1428
        background: 'var(--panel)',
        // --panel-edge: rgba(255,255,255,0.06) — replaces old #1A2B4A
        border: '1px solid var(--panel-edge)',
        borderRadius: '10px',
        overflow: 'hidden',
        cursor: 'pointer',
      }}
    >
      {/* Colored accent bar — compound.accentColor is now a new-system value per D-04 */}
      <div style={{ height: '2px', background: compound.accentColor }} />

      <div style={{ padding: '18px 18px 16px' }}>
        {/* Category badge */}
        <div style={{ marginBottom: '10px' }}>
          <Badge variant="muted">{compound.category}</Badge>
        </div>

        {/* Compound name */}
        <div
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 800,
            fontSize: '20px',
            // --text: #F4F6F4 — replaces old #E8EDF5
            color: 'var(--text)',
            marginBottom: '12px',
            lineHeight: 1.2,
          }}
        >
          {compound.name}
        </div>

        {/* Tag pills — up to first 3 */}
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '12px' }}>
          {compound.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              style={{
                // var(--mono): 'Fira Code', monospace — replaces hardcoded 'JetBrains Mono, monospace'
                fontFamily: 'var(--mono)',
                fontSize: '10px',
                // --muted: #7A8A87 — replaces old #6B7FA3
                color: 'var(--muted)',
                // --bg-soft: #0E1116 — replaces old dark-navy #101D38
                background: 'var(--bg-soft)',
                borderRadius: '2px',
                padding: '2px 7px',
                letterSpacing: '0.05em',
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Mechanism excerpt — 2-line clamp via WebkitLineClamp */}
        <div
          style={{
            fontSize: '12px',
            // --muted: #7A8A87
            color: 'var(--muted)',
            lineHeight: 1.55,
            marginBottom: '16px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {compound.mechanism}
        </div>

        {/* Footer row: evidence tier + view link */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Badge variant={tierVariant[compound.evidenceTier]}>
            {compound.evidenceTier}
          </Badge>
          <span
            style={{
              fontFamily: 'var(--mono)',
              fontSize: '11px',
              // --accent: #7DF0C8 — replaces old #00E5C8
              color: 'var(--accent)',
              letterSpacing: '0.1em',
            }}
          >
            VIEW →
          </span>
        </div>
      </div>
    </motion.div>
  )
}
