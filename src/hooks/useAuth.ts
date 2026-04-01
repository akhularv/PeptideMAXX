import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/store/useUserStore'

/**
 * Auth hook — manages Supabase session lifecycle, sign-in, sign-up, and sign-out.
 *
 * Returns:
 *   session: current Supabase session or null
 *   signIn: (email, password) => Promise<void> — throws on error
 *   signUp: (email, password) => Promise<void> — throws on error
 *   signOut: () => Promise<void>
 *   loading: true while an auth call is in-flight
 */
export function useAuth() {
  const { session, setSession } = useUserStore()
  const [loading, setLoading] = useState(false)
  const [confirmationPending, setConfirmationPending] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Hydrate session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Keep session in sync with Supabase auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [setSession])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      navigate('/app/metrics')
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string) => {
    setLoading(true)
    setConfirmationPending(false)
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      // When email confirmation is required, session is null even on success.
      // Do not navigate — show a "check your email" prompt instead.
      if (!data.session) {
        setConfirmationPending(true)
        return
      }
      navigate('/app/metrics')
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setSession(null)
    navigate('/')
  }

  return { session, signIn, signUp, signOut, loading, confirmationPending }
}
