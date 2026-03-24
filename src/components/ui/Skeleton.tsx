import { motion } from 'framer-motion'

interface SkeletonProps {
  className?: string
}

/**
 * Animated loading skeleton placeholder.
 *
 * Args:
 *   className: Tailwind classes for sizing (e.g. 'h-4 w-32')
 * Returns:
 *   A pulsing framer-motion div styled as a skeleton loader
 */
export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <motion.div
      className={['bg-brand-elevated rounded', className].filter(Boolean).join(' ')}
      animate={{ opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}
