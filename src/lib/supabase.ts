// Supabase Schema (run in Supabase SQL editor):
// See /Users/akhularvind/peptidemaxx/supabase/schema.sql

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? 'https://placeholder.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'placeholder-anon-key'
export const hasSupabaseEnv =
  Boolean(import.meta.env.VITE_SUPABASE_URL) && Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY)

if (!hasSupabaseEnv) {
  console.warn('[PeptideMaxx] Supabase env vars not set — auth and data features disabled. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
