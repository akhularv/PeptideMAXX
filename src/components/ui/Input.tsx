import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string
}

/**
 * Branded text input with teal focus ring.
 *
 * Args:
 *   className: additional Tailwind classes
 *   ...props: all standard HTML input attributes
 * Returns:
 *   A styled input element
 */
export function Input({ className = '', ...props }: InputProps) {
  return (
    <input
      className={[
        'bg-brand-bg border border-brand-border rounded-sm px-3 py-2',
        'text-brand-text placeholder:text-brand-subtle',
        'focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/20',
        'font-mono text-sm w-full',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  )
}
