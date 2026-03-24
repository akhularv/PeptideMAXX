import { lazy, Suspense } from 'react'
import { BrowserRouter, HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Landing } from '@/pages/Landing'
import { Auth } from '@/pages/Auth'
import { Dashboard } from '@/pages/Dashboard'
import { Library } from '@/pages/Library'
import { Chat } from '@/pages/Chat'
import { Log } from '@/pages/Log'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'

// D-03: Metrics is lazy-loaded because it imports recharts (~200kB gzip).
// No other route needs recharts, so splitting it reduces the initial bundle.
// Suspense fallback is null — Dashboard shell (TopNav, layout) remains visible
// while the Metrics chunk loads.
const Metrics = lazy(
  () => import('@/pages/Metrics').then((m) => ({ default: m.Metrics }))
)

export default function App() {
  const Router = import.meta.env.BASE_URL === '/PeptideMAXX/' ? HashRouter : BrowserRouter

  return (
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
          <Route index element={<Navigate to="library" replace />} />
          <Route path="library" element={<Library />} />
          <Route path="chat" element={<Chat />} />
          <Route path="log" element={<Log />} />
          <Route
            path="metrics"
            element={
              // Suspense wraps only the lazy Metrics chunk; Dashboard shell stays mounted
              <Suspense fallback={null}>
                <Metrics />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </Router>
  )
}
