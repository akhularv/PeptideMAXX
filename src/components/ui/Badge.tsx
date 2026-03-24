type BadgeVariant =
  | 'teal'
  | 'amber'
  | 'danger'
  | 'muted'
  | 'clinical'
  | 'preclinical'
  | 'anecdotal'

interface BadgeProps {
  variant: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  teal: 'bg-brand-teal/10 text-brand-teal border border-brand-teal/20',
  amber: 'bg-amber-900/40 text-amber-400 border border-amber-700/40',
  danger: 'bg-red-900/40 text-red-400 border border-red-700/40',
  muted: 'bg-brand-subtle/20 text-brand-muted border border-brand-border',
  clinical: 'bg-emerald-900/40 text-emerald-400 border border-emerald-700/40',
  preclinical: 'bg-amber-900/40 text-amber-400 border border-amber-700/40',
  anecdotal: 'bg-brand-subtle/20 text-brand-muted border border-brand-border',
}

/**
 * Small label badge for evidence tiers, categories, and status indicators.
 *
 * Args:
 *   variant: color scheme key
 *   children: badge text content
 *   className: additional Tailwind classes
 * Returns:
 *   A styled inline span element
 */
export function Badge({ variant, children, className = '' }: BadgeProps) {
  const base =
    'font-mono text-[10px] tracking-[0.18em] uppercase px-2 py-0.5 rounded-sm inline-block'
  const classes = [base, variantClasses[variant], className].filter(Boolean).join(' ')

  return <span className={classes}>{children}</span>
}
