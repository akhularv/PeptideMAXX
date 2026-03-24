import type { CSSProperties } from 'react'

interface BioSpecimenProps {
  size?: 'sm' | 'md' | 'lg'
  label?: string
  accent?: string
  cool?: string
  style?: CSSProperties
}

// Simplified per council mandate: orbit ring+dots and halo glow removed.
// Remaining: __core (sphere) + __ring (single static ring) + __label.
export function BioSpecimen({
  size = 'md',
  label,
  accent,
  cool,
  style,
}: BioSpecimenProps) {
  const specimenVars = {
    ...(accent ? { ['--specimen-accent' as const]: accent } : {}),
    ...(cool ? { ['--specimen-cool' as const]: cool } : {}),
  } as CSSProperties

  return (
    <div
      className={`atlas-specimen atlas-specimen--${size}`}
      style={{ ...specimenVars, ...style }}
    >
      {/* Single static ring — no orbit animation, no dot satellites */}
      <div className="atlas-specimen__ring" />
      {/* Core sphere with reduced glow (0.12 opacity) */}
      <div className="atlas-specimen__core" />
      {label ? <div className="atlas-specimen__label">{label}</div> : null}
    </div>
  )
}
