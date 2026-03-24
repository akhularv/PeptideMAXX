import { motion } from 'framer-motion'

interface CardProps {
  children: React.ReactNode
  className?: string
  /** Optional hex color string for a 2px top accent border. */
  accentColor?: string
  onClick?: () => void
}

/**
 * Surface card with optional colored top accent and hover border animation.
 *
 * D-01 fix: whileHover borderColor changed from hardcoded '#243A60' (old dark-navy)
 * to 'var(--panel-line)' (rgba(255,255,255,0.10) — new design token).
 *
 * Args:
 *   children: card body content
 *   className: additional Tailwind classes
 *   accentColor: optional hex color for a 2px top accent strip
 *   onClick: optional click handler (adds pointer cursor when set)
 * Returns:
 *   A framer-motion div styled as a dark surface card
 */
export function Card({ children, className = '', accentColor, onClick }: CardProps) {
  return (
    <motion.div
      // --panel-line: rgba(255,255,255,0.10) — replaces old dark-navy #243A60
      whileHover={{ borderColor: 'var(--panel-line)' }}
      onClick={onClick}
      className={[
        'bg-brand-surface border border-brand-border rounded-lg overflow-hidden',
        'transition-colors duration-200',
        onClick ? 'cursor-pointer' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Top accent strip — only rendered when accentColor is provided */}
      {accentColor && (
        <div style={{ height: '2px', background: accentColor }} />
      )}
      {children}
    </motion.div>
  )
}
