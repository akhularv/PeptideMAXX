import { motion } from 'framer-motion'
import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  className?: string
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-brand-teal text-brand-bg font-mono text-xs tracking-widest uppercase hover:brightness-110',
  ghost:
    'border border-brand-border text-brand-text font-mono text-xs tracking-widest uppercase hover:border-brand-teal hover:text-brand-teal',
  danger:
    'bg-brand-danger text-white font-mono text-xs tracking-widest uppercase hover:brightness-110',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5',
  md: 'px-4 py-2',
  lg: 'px-6 py-3',
}

/**
 * Branded button component with primary, ghost, and danger variants.
 *
 * Args:
 *   variant: visual style — 'primary' | 'ghost' | 'danger' (default: 'primary')
 *   size: padding scale — 'sm' | 'md' | 'lg' (default: 'md')
 *   className: additional Tailwind classes
 *   ...props: all standard HTML button attributes
 * Returns:
 *   A framer-motion animated button element
 */
export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const base = 'rounded-sm transition-all duration-200 cursor-pointer'
  const classes = [base, variantClasses[variant], sizeClasses[size], className]
    .filter(Boolean)
    .join(' ')

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={classes}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {children}
    </motion.button>
  )
}
