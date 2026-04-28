export type Database = {
  public: {
    Tables: {
      users: {
        Row: { id: string; email: string; name: string | null; avatar_url: string | null; created_at: string }
        Insert: { id: string; email: string; name?: string | null; avatar_url?: string | null }
        Update: { name?: string | null; avatar_url?: string | null }
        Relationships: []
      }
      article_views: {
        Row: { id: string; user_id: string; article_date: string; viewed_at: string }
        Insert: { user_id: string; article_date: string }
        Update: never
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
