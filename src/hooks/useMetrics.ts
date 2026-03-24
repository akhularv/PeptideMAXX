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

  useEffect(() => {
    if (!session?.user) return
    setLoading(true)
    supabase
      .from('user_metrics')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        setLoading(false)
        if (data) setMetrics(data as UserMetrics)
      })
  }, [session?.user?.id])

  const saveMetrics = async (data: Partial<UserMetrics>) => {
    if (!session?.user) return
    setLoading(true)
    const { data: upserted } = await supabase
      .from('user_metrics')
      .upsert({ ...data, user_id: session.user.id }, { onConflict: 'user_id' })
      .select()
      .single()
    setLoading(false)
    if (upserted) setMetrics(upserted as UserMetrics)
  }

  return { metrics, saveMetrics, loading }
}
