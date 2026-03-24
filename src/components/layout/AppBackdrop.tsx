interface AppBackdropProps {
  variant?: 'landing' | 'app' | 'auth'
}

export function AppBackdrop({ variant = 'app' }: AppBackdropProps) {
  const style =
    variant === 'landing'
      ? {
          opacity: 1,
          transform: 'scale(1.06)',
        }
      : variant === 'auth'
        ? {
            opacity: 0.86,
            transform: 'scale(0.96)',
          }
        : {
            opacity: 0.72,
            transform: 'scale(1)',
          }

  return (
    <div className="pm-atmosphere" aria-hidden="true" style={style}>
      <div className="pm-atmosphere__orb pm-atmosphere__orb--teal" />
      <div className="pm-atmosphere__orb pm-atmosphere__orb--aqua" />
      <div className="pm-atmosphere__orb pm-atmosphere__orb--amber" />
      <div className="pm-atmosphere__halo pm-atmosphere__halo--one" />
      <div className="pm-atmosphere__halo pm-atmosphere__halo--two" />
    </div>
  )
}
