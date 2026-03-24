import { NavLink } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

const NAV_LINKS = [
  { to: '/app/library', label: 'Atlas' },
  { to: '/app/chat', label: 'Consult' },
  { to: '/app/log', label: 'Protocol' },
  { to: '/app/metrics', label: 'Vitals' },
]

export function TopNav() {
  const { session, signOut } = useAuth()

  return (
    <nav
      className="atlas-topnav"
      style={{
        position: 'fixed',
        top: 18,
        left: 18,
        right: 18,
        zIndex: 20,
      }}
    >
      <div
        className="atlas-panel atlas-panel--soft atlas-topnav__inner"
        style={{
          background: '#080A0C',
          borderColor: 'rgba(255,255,255,0.06)',
          minHeight: 'var(--nav-h)',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '18px',
        }}
      >
        <div className="atlas-topnav__brand" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: '1px solid rgba(125,240,200,0.18)',
              background:
                'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.88), transparent 22%), radial-gradient(circle at 50% 50%, rgba(125,240,200,0.7), transparent 62%), rgba(8,10,12,0.9)',
              // Reduced glow — teal on interactives only
              boxShadow: '0 0 24px rgba(125,240,200,0.12)',
              flexShrink: 0,
            }}
          />
          <div>
            <div
              style={{
                fontFamily: 'var(--display)',
                fontWeight: 600,
                fontSize: 13,
                letterSpacing: '-0.02em',
                color: 'var(--text)',
                marginBottom: 2,
              }}
            >
              PeptideMaxx.AI
            </div>
            <div className="atlas-label">Biolumen Atlas Interface</div>
          </div>
        </div>

        <div
          className="atlas-topnav__links"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              style={({ isActive }) => ({
                padding: '10px 14px',
                borderRadius: '999px',
                border: isActive
                  ? '1px solid rgba(125,240,200,0.26)'
                  : '1px solid transparent',
                background: isActive ? 'rgba(125,240,200,0.08)' : 'transparent',
                color: isActive ? 'var(--text)' : 'var(--text-dim)',
                textDecoration: 'none',
                fontFamily: 'var(--mono)',
                fontSize: 11,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                transition: 'all 160ms ease',
              })}
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="atlas-topnav__meta" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            className="atlas-topnav__session"
            style={{
              padding: '9px 12px',
              borderRadius: '999px',
              border: '1px solid rgba(125,240,200,0.12)',
              background: 'rgba(8,10,12,0.72)',
              minWidth: 160,
            }}
          >
            <div className="atlas-label" style={{ marginBottom: 4 }}>
              Session
            </div>
            <div
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 11,
                color: 'var(--text)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {session?.user?.email ?? 'Demo mode active'}
            </div>
          </div>

          {session ? (
            <button className="atlas-button-secondary" onClick={signOut}>
              Exit
            </button>
          ) : null}
        </div>
      </div>
    </nav>
  )
}
