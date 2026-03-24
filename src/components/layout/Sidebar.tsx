import { NavLink } from 'react-router-dom'
import { Grid3X3, MessageCircle, ClipboardList, Activity, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const navItems = [
  { to: '/app/library', icon: Grid3X3,      label: 'Library'   },
  { to: '/app/chat',    icon: MessageCircle, label: 'Dr. Voss'  },
  { to: '/app/log',     icon: ClipboardList, label: 'Log'       },
  { to: '/app/metrics', icon: Activity,      label: 'Metrics'   },
]

/**
 * Fixed left navigation sidebar — strangelabs aesthetic.
 * 220px wide, pure black, active route gets 2px teal left border.
 *
 * D-01 fix: all hardcoded old-palette values replaced with CSS custom properties
 * from the new design token system (index.css :root block).
 */
export function Sidebar() {
  const { session, signOut } = useAuth()

  // Truncate email to fit narrow sidebar
  const email = session?.user?.email ?? ''
  const emailDisplay = email.length > 22 ? email.slice(0, 20) + '…' : email

  return (
    <aside
      style={{
        width: '220px',
        minHeight: '100vh',
        // --bg: #080A0C  (pure near-black — new design token)
        background: 'var(--bg)',
        // --panel-edge: rgba(255,255,255,0.06)
        borderRight: '1px solid var(--panel-edge)',
        // Teal glow on right edge using new --accent token
        boxShadow: '2px 0 20px rgba(125,240,200,0.06), 1px 0 0 var(--panel-edge)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 50,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: '22px 18px',
          borderBottom: '1px solid var(--panel-edge)',
        }}
      >
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 800,
            fontSize: '11px',
            letterSpacing: '0.04em',  // very tight — premium feel
            // --text: #F4F6F4
            color: 'var(--text)',
            display: 'block',
          }}
        >
          {/* Diamond glyph as logo mark */}
          ◈ PEPTIDEMAXX
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 0' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 18px',
              // Active: --text for bright text, --muted for inactive
              color: isActive ? 'var(--text)' : 'var(--muted)',
              textDecoration: 'none',
              fontFamily: 'Inter, sans-serif',
              fontWeight: isActive ? 500 : 400,
              fontSize: '12px',
              letterSpacing: '0.02em',
              position: 'relative',
              // Active left border uses --accent token (#7DF0C8)
              borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
              transition: 'all 0.12s ease',
            })}
          >
            <item.icon size={14} strokeWidth={1.5} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User area */}
      <div
        style={{
          padding: '14px 18px',
          borderTop: '1px solid var(--panel-edge)',
        }}
      >
        {/* Truncated email in monospace — var(--mono): 'Fira Code', monospace */}
        <div
          style={{
            fontSize: '10px',
            // --muted: #7A8A87 (replaces old #3A4A6A dark-navy text)
            color: 'var(--muted)',
            fontFamily: 'var(--mono)',
            letterSpacing: '0.04em',
            marginBottom: '8px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {emailDisplay}
        </div>
        <button
          onClick={signOut}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            color: 'var(--muted)',
            fontFamily: 'var(--mono)',
            letterSpacing: '0.06em',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px 0',
            transition: 'color 0.12s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
        >
          <LogOut size={11} />
          LOGOUT
        </button>
      </div>
    </aside>
  )
}
