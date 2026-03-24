import { create } from 'zustand'
import type { Compound } from '../types/compound'

// ─────────────────────────────────────────────────────────────────────────────
// App-level UI state store (no persistence — resets on reload).
// User-specific and server-side state lives in useUserStore.
// ─────────────────────────────────────────────────────────────────────────────

export type AppView = 'library' | 'compound' | 'log' | 'chat' | 'profile'

interface AppState {
  // ── Navigation ──────────────────────────────────────────────────────────
  /** Currently active top-level view. */
  activeView: AppView
  setActiveView: (view: AppView) => void

  // ── Compound focus ───────────────────────────────────────────────────────
  /** Compound currently open in the detail panel / chat context. */
  focusedCompound: Compound | null
  setFocusedCompound: (compound: Compound | null) => void

  // ── Search / filter ──────────────────────────────────────────────────────
  /** Current library search query string. */
  searchQuery: string
  setSearchQuery: (query: string) => void

  /** Active category filter tag (null = show all). */
  activeTag: string | null
  setActiveTag: (tag: string | null) => void

  // ── Sidebar ──────────────────────────────────────────────────────────────
  /** Whether the left navigation sidebar is expanded (desktop). */
  sidebarExpanded: boolean
  setSidebarExpanded: (expanded: boolean) => void
  toggleSidebar: () => void

  // ── Chat panel ───────────────────────────────────────────────────────────
  /** Whether the Dr. Voss chat panel is open. */
  chatOpen: boolean
  setChatOpen: (open: boolean) => void
  toggleChat: () => void

  // ── Global loading / error ───────────────────────────────────────────────
  /** Global loading indicator (e.g. during auth checks). */
  isLoading: boolean
  setIsLoading: (loading: boolean) => void

  /** Global error message (shown in toast / banner). */
  globalError: string | null
  setGlobalError: (error: string | null) => void
  clearGlobalError: () => void
}

export const useAppStore = create<AppState>((set) => ({
  // ── Navigation ──────────────────────────────────────────────────────────
  activeView: 'library',
  setActiveView: (view) => set({ activeView: view }),

  // ── Compound focus ───────────────────────────────────────────────────────
  focusedCompound: null,
  setFocusedCompound: (compound) => set({ focusedCompound: compound }),

  // ── Search / filter ──────────────────────────────────────────────────────
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  activeTag: null,
  setActiveTag: (tag) => set({ activeTag: tag }),

  // ── Sidebar ──────────────────────────────────────────────────────────────
  sidebarExpanded: true,
  setSidebarExpanded: (expanded) => set({ sidebarExpanded: expanded }),
  toggleSidebar: () =>
    set((state) => ({ sidebarExpanded: !state.sidebarExpanded })),

  // ── Chat panel ───────────────────────────────────────────────────────────
  chatOpen: false,
  setChatOpen: (open) => set({ chatOpen: open }),
  toggleChat: () => set((state) => ({ chatOpen: !state.chatOpen })),

  // ── Global loading / error ───────────────────────────────────────────────
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  globalError: null,
  setGlobalError: (error) => set({ globalError: error }),
  clearGlobalError: () => set({ globalError: null }),
}))
