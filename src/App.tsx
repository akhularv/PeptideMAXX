import { lazy, Suspense } from 'react'
import { BrowserRouter, HashRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import { Landing } from '@/pages/Landing'
import { Auth } from '@/pages/Auth'
import { Dashboard } from '@/pages/Dashboard'
import { Library } from '@/pages/Library'
import { Chat } from '@/pages/Chat'
import { Log } from '@/pages/Log'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'

const hasSupabaseEnv = !!import.meta.env.VITE_SUPABASE_URL

function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="atlas-kicker" style={{ marginBottom: 12 }}>404</div>
        <h1 style={{ fontSize: 48, marginBottom: 16 }}>Page not found</h1>
        <Link to="/" className="atlas-button-primary" style={{ display: 'inline-flex' }}>Go home</Link>
      </div>
    </div>
  )
}

function DemoModeBanner() {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
      background: 'rgba(232,201,122,0.12)', borderBottom: '1px solid rgba(232,201,122,0.3)',
      padding: '8px 16px', textAlign: 'center',
    }}>
      <span className="atlas-label" style={{ color: 'var(--accent-warm)' }}>
        Demo mode — auth and data persistence disabled (Supabase env vars not configured)
      </span>
    </div>
  )
}

// D-03: Metrics is lazy-loaded because it imports recharts (~200kB gzip).
// No other route needs recharts, so splitting it reduces the initial bundle.
// Suspense fallback is null — Dashboard shell (TopNav, layout) remains visible
// while the Metrics chunk loads.
const Metrics = lazy(
  () => import('@/pages/Metrics').then((m) => ({ default: m.Metrics }))
)
const Trends = lazy(
  () => import('@/pages/Trends').then((m) => ({ default: m.Trends }))
)

export default function App() {
  const Router = import.meta.env.BASE_URL === '/PeptideMAXX/' ? HashRouter : BrowserRouter

  return (
    <>
      {!hasSupabaseEnv && <DemoModeBanner />}
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="metrics" replace />} />
            <Route path="library" element={<Library />} />
            <Route path="chat" element={<Chat />} />
            <Route path="log" element={<Log />} />
            <Route
              path="metrics"
              element={
                <Suspense fallback={null}>
                  <Metrics />
                </Suspense>
              }
            />
            <Route
              path="trends"
              element={
                <Suspense fallback={null}>
                  <Trends />
                </Suspense>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  )
}
