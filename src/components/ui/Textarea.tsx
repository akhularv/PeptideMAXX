import type { TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string
  rows?: number
}

/**
 * Branded textarea with teal focus ring. Same visual style as Input.
 *
 * Args:
 *   className: additional Tailwind classes
 *   rows: number of visible text rows (default: browser default)
 *   ...props: all standard HTML textarea attributes
 * Returns:
 *   A styled textarea element
 */
export function Textarea({ className = '', rows, ...props }: TextareaProps) {
  return (
    <textarea
      rows={rows}
      className={[
        'bg-brand-bg border border-brand-border rounded-sm px-3 py-2',
        'text-brand-text placeholder:text-brand-subtle',
        'focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/20',
        'font-mono text-sm w-full resize-none',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  )
}
