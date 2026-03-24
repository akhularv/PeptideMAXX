import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'
import type { UserMetrics, ChatMessage } from '../types/user'
import type { LogEntry } from '../types/log'

// ─────────────────────────────────────────────────────────────────────────────
// User-specific state store.
// Auth session, dose logs, biometrics, and Dr. Voss chat history.
// All server writes happen in components/hooks using the supabase client;
// this store holds the local mirror of that state.
// ─────────────────────────────────────────────────────────────────────────────

interface UserState {
  // ── Auth ─────────────────────────────────────────────────────────────────
  /** Supabase auth session — null when logged out. */
  session: Session | null
  setSession: (session: Session | null) => void

  /** Convenience derived value: true if session is active. */
  isAuthenticated: boolean

  // ── Dose log ──────────────────────────────────────────────────────────────
  /** All dose log entries for the current user (loaded from Supabase). */
  logs: LogEntry[]
  setLogs: (logs: LogEntry[]) => void
  /** Prepend a new log entry (optimistic insert). */
  addLog: (entry: LogEntry) => void
  /** Remove a log entry by ID (optimistic delete). */
  removeLog: (id: string) => void

  // ── User metrics / biometrics ────────────────────────────────────────────
  /** User biometric data, null until loaded from Supabase. */
  metrics: UserMetrics | null
  setMetrics: (metrics: UserMetrics | null) => void

  // ── Chat history (Dr. Voss) ───────────────────────────────────────────────
  /** Full chat history for the current session (persisted to Supabase). */
  chatHistory: ChatMessage[]
  setChatHistory: (messages: ChatMessage[]) => void
  /** Append a single message to local chat history. */
  appendChatMessage: (message: ChatMessage) => void
  /** Clear in-memory chat history (does NOT delete from Supabase). */
  clearChatHistory: () => void

  // ── Loading states ────────────────────────────────────────────────────────
  logsLoading: boolean
  setLogsLoading: (loading: boolean) => void

  metricsLoading: boolean
  setMetricsLoading: (loading: boolean) => void

  chatLoading: boolean
  setChatLoading: (loading: boolean) => void

  // ── Reset ─────────────────────────────────────────────────────────────────
  /** Full state reset on logout. */
  reset: () => void
}

const initialState = {
  session: null,
  isAuthenticated: false,
  logs: [],
  metrics: null,
  chatHistory: [],
  logsLoading: false,
  metricsLoading: false,
  chatLoading: false,
}

export const useUserStore = create<UserState>((set) => ({
  ...initialState,

  // ── Auth ─────────────────────────────────────────────────────────────────
  setSession: (session) =>
    set({ session, isAuthenticated: session !== null }),

  // ── Dose log ──────────────────────────────────────────────────────────────
  setLogs: (logs) => set({ logs }),
  addLog: (entry) =>
    set((state) => ({ logs: [entry, ...state.logs] })),
  removeLog: (id) =>
    set((state) => ({ logs: state.logs.filter((l) => l.id !== id) })),

  // ── User metrics ──────────────────────────────────────────────────────────
  setMetrics: (metrics) => set({ metrics }),

  // ── Chat history ──────────────────────────────────────────────────────────
  setChatHistory: (messages) => set({ chatHistory: messages }),
  appendChatMessage: (message) =>
    set((state) => ({ chatHistory: [...state.chatHistory, message] })),
  clearChatHistory: () => set({ chatHistory: [] }),

  // ── Loading states ────────────────────────────────────────────────────────
  setLogsLoading: (loading) => set({ logsLoading: loading }),
  setMetricsLoading: (loading) => set({ metricsLoading: loading }),
  setChatLoading: (loading) => set({ chatLoading: loading }),

  // ── Reset ─────────────────────────────────────────────────────────────────
  reset: () => set(initialState),
}))
