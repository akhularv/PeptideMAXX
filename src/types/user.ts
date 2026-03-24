export interface UserMetrics {
  id: string
  user_id: string
  updated_at: string
  weight_kg?: number
  height_cm?: number
  bloodwork_notes?: string
  custom_fields?: Record<string, unknown>
}

export interface ChatMessage {
  id?: string
  role: 'user' | 'assistant'
  content: string
  created_at?: string
}
