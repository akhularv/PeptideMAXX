import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/store/useUserStore'
import type { LogEntry } from '@/types/log'
import { logger } from '@/lib/logger'

/**
 * Log hook — loads, creates, and deletes dose log entries with optimistic updates.
 * Fetches all entries for the current user on mount; writes go through Supabase.
 *
 * Returns:
 *   entries: LogEntry[] sorted newest-first
 *   addEntry: (entry without server fields) => Promise<void>
 *   deleteEntry: (id: string) => Promise<void>
 *   loading: true while initial fetch is in-flight
 *   error: error message string or null
 */
export function useLog() {
  // Store uses `logs` / `addLog` / `removeLog` — not logEntries
  const { session, logs, setLogs, addLog, removeLog } = useUserStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session?.user) return
    setLoading(true)
    supabase
      .from('logs')
      .select('*')
      .eq('user_id', session.user.id)
      .order('date', { ascending: false })
      .then(({ data, error: err }) => {
        setLoading(false)
        if (err) {
          setError(err.message)
          return
        }
        if (data) {
          setLogs(data as LogEntry[])
        }
      })
  }, [session?.user?.id])

  const addEntry = async (entry: Omit<LogEntry, 'id' | 'user_id' | 'created_at'>) => {
    if (!session?.user) return

    // Optimistic insert — replaced by server record on success
    const optimistic: LogEntry = {
      ...entry,
      id: `temp-${Date.now()}`,
      user_id: session.user.id,
      created_at: new Date().toISOString(),
    }
    addLog(optimistic)

    try {
      const { data, error: err } = await supabase
        .from('logs')
        .insert({ ...entry, user_id: session.user.id })
        .select()
        .single()
      if (err) throw err
      // Swap optimistic record for the persisted one
      removeLog(optimistic.id)
      if (data) addLog(data as LogEntry)
    } catch (err) {
      // Roll back optimistic insert on failure
      removeLog(optimistic.id)
      logger.error('Failed to add log entry', err)
      setError('Failed to save log entry')
    }
  }

  const deleteEntry = async (id: string) => {
    // Optimistic removal — no rollback needed for delete failures in MVP
    removeLog(id)
    try {
      const { error: err } = await supabase.from('logs').delete().eq('id', id)
      if (err) throw err
    } catch (err) {
      logger.error('Failed to delete entry', err)
      setError('Failed to delete entry')
    }
  }

  return { entries: logs, addEntry, deleteEntry, loading, error }
}
