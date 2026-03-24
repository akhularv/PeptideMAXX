export interface LogEntry {
  id: string
  user_id: string
  created_at: string
  date: string
  compound: string
  dose?: string
  route?: string
  note?: string
  mood?: number
  tags?: string[]
}
