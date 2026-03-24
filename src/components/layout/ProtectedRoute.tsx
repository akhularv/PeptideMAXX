import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/store/useUserStore'

/**
 * Route guard that redirects unauthenticated users to /auth.
 * Shows a blank dark screen while the initial session check is in-flight
 * so users with valid sessions don't see a flash redirect.
 *
 * Args:
 *   children: protected page content
 * Returns:
 *   children if authenticated, blank div while checking, Navigate to /auth if unauthed
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, setSession } = useUserStore()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setChecking(false)
    })
  }, [])

  // Demo mode: if Supabase is not configured, allow access without auth
  const demoMode = !import.meta.env.VITE_SUPABASE_URL

  if (checking && !demoMode) return <div style={{ background: '#060B1A', minHeight: '100vh' }} />
  if (!session && !demoMode) return <Navigate to="/auth" replace />
  return <>{children}</>
}
