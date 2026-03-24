import { Outlet } from 'react-router-dom'
import { TopNav } from '@/components/layout/TopNav'

export function Dashboard() {
  return (
    <div className="atlas-page">
      <TopNav />

      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 1,
          background:
            'radial-gradient(circle at 18% 22%, rgba(147,246,216,0.06), transparent 24%), radial-gradient(circle at 78% 14%, rgba(140,196,255,0.05), transparent 18%), radial-gradient(circle at 54% 100%, rgba(242,191,116,0.04), transparent 26%)',
        }}
      />

      <div
        className="atlas-shell"
        style={{
          paddingTop: 'calc(var(--nav-h) + 34px)',
          paddingBottom: 40,
          minHeight: '100vh',
        }}
      >
        <div
          style={{
            width: 'min(1440px, calc(100% - 32px))',
            margin: '0 auto',
          }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  )
}
