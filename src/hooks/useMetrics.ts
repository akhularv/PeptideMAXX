import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/store/useUserStore'
import type { UserMetrics } from '@/types/user'

/**
 * Metrics hook — loads and saves user biometric/metrics data.
 * Uses upsert so both first-save and update work through the same call.
 *
 * Returns:
 *   metrics: UserMetrics | null (null until loaded)
 *   saveMetrics: (partial metrics) => Promise<void>
 *   loading: true while a request is in-flight
 */
export function useMetrics() {
  const { session, metrics, setMetrics } = useUserStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session?.user) return
    setLoading(true)
    supabase
      .from('user_metrics')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle()
      .then(({ data, error: err }) => {
        setLoading(false)
        if (err) { setError(err.message); return }
        if (data) setMetrics(data as UserMetrics)
      })
  }, [session?.user?.id])

  const saveMetrics = async (data: Partial<UserMetrics>) => {
    if (!session?.user) return
    setLoading(true)
    setError(null)
    try {
      const { data: upserted, error: err } = await supabase
        .from('user_metrics')
        .upsert({ ...data, user_id: session.user.id }, { onConflict: 'user_id' })
        .select()
        .single()
      if (err) throw err
      if (upserted) setMetrics(upserted as UserMetrics)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save metrics')
    } finally {
      setLoading(false)
    }
  }

  return { metrics, saveMetrics, loading, error }
}
