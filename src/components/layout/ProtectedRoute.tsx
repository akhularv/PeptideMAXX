import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/store/useUserStore'

// Demo mode: if Supabase is not configured, allow access without auth
const demoMode = !import.meta.env.VITE_SUPABASE_URL

/**
 * Route guard that redirects unauthenticated users to /auth.
 * Subscribes to onAuthStateChange so mid-session expiry triggers an
 * immediate redirect — not just the initial mount check.
 *
 * Args:
 *   children: protected page content
 * Returns:
 *   children if authenticated, blank div while checking, Navigate to /auth if unauthed
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // session is reactive — Zustand notifies on every setSession call
  const { session, setSession } = useUserStore()
  const [checking, setChecking] = useState(!demoMode)

  useEffect(() => {
    if (demoMode) return

    // Hydrate session and subscribe to future auth state changes in one place.
    // This ensures mid-session SIGNED_OUT events redirect immediately.
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setChecking(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => subscription.unsubscribe()
  }, [setSession])

  if (checking) return <div style={{ background: '#060B1A', minHeight: '100vh' }} />
  if (!session && !demoMode) return <Navigate to="/auth" replace />
  return <>{children}</>
}
