export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      analytics_digest_log: {
        Row: {
          day: string
          sent_at: string
        }
        Insert: {
          day: string
          sent_at?: string
        }
        Update: {
          day?: string
          sent_at?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          article_slug: string | null
          city: string | null
          country: string | null
          country_code: string | null
          created_at: string
          device: string | null
          duration_ms: number | null
          event: string
          id: string
          path: string
          referrer: string | null
          scroll_pct: number | null
          session_id: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          viewport_w: number | null
        }
        Insert: {
          article_slug?: string | null
          city?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          device?: string | null
          duration_ms?: number | null
          event: string
          id?: string
          path: string
          referrer?: string | null
          scroll_pct?: number | null
          session_id: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          viewport_w?: number | null
        }
        Update: {
          article_slug?: string | null
          city?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          device?: string | null
          duration_ms?: number | null
          event?: string
          id?: string
          path?: string
          referrer?: string | null
          scroll_pct?: number | null
          session_id?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          viewport_w?: number | null
        }
        Relationships: []
      }
      articles: {
        Row: {
          answer_capsule: string
          author: Json
          category: string
          created_at: string
          date: string
          date_modified: string
          date_published: string
          description: string
          entities: Json
          faq: Json
          id: string
          image: string
          image_alt: string
          keywords: Json
          read_time: string
          sections: Json
          slug: string
          sort_order: number
          status: string
          takeaways: Json
          title: string
          updated_at: string
        }
        Insert: {
          answer_capsule?: string
          author?: Json
          category: string
          created_at?: string
          date?: string
          date_modified?: string
          date_published?: string
          description?: string
          entities?: Json
          faq?: Json
          id?: string
          image?: string
          image_alt?: string
          keywords?: Json
          read_time?: string
          sections?: Json
          slug: string
          sort_order?: number
          status?: string
          takeaways?: Json
          title: string
          updated_at?: string
        }
        Update: {
          answer_capsule?: string
          author?: Json
          category?: string
          created_at?: string
          date?: string
          date_modified?: string
          date_published?: string
          description?: string
          entities?: Json
          faq?: Json
          id?: string
          image?: string
          image_alt?: string
          keywords?: Json
          read_time?: string
          sections?: Json
          slug?: string
          sort_order?: number
          status?: string
          takeaways?: Json
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      case_studies: {
        Row: {
          client: string
          created_at: string
          description: string
          filters: string[]
          has_page: boolean
          headline_emphasis: string
          headline_line: string
          href: string
          image: string
          logo: string
          services: string[]
          slug: string
          sort_order: number
          title: string
          updated_at: string
          year: string
        }
        Insert: {
          client: string
          created_at?: string
          description?: string
          filters?: string[]
          has_page?: boolean
          headline_emphasis: string
          headline_line: string
          href: string
          image?: string
          logo?: string
          services?: string[]
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
          year?: string
        }
        Update: {
          client?: string
          created_at?: string
          description?: string
          filters?: string[]
          has_page?: boolean
          headline_emphasis?: string
          headline_line?: string
          href?: string
          image?: string
          logo?: string
          services?: string[]
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
          year?: string
        }
        Relationships: []
      }
      chat_events: {
        Row: {
          content: string | null
          created_at: string
          event_type: string
          id: string
          intent: string | null
          metadata: Json
          role: string | null
          session_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          event_type: string
          id?: string
          intent?: string | null
          metadata?: Json
          role?: string | null
          session_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          event_type?: string
          id?: string
          intent?: string | null
          metadata?: Json
          role?: string | null
          session_id?: string
        }
        Relationships: []
      }
      digest_cron_token: {
        Row: {
          created_at: string
          id: boolean
          token: string
        }
        Insert: {
          created_at?: string
          id?: boolean
          token?: string
        }
        Update: {
          created_at?: string
          id?: boolean
          token?: string
        }
        Relationships: []
      }
    }
    Views: {
      article_analytics_daily: {
        Row: {
          article_slug: string | null
          avg_duration_ms: number | null
          avg_scroll_pct: number | null
          day: string | null
          unique_sessions: number | null
          views: number | null
        }
        Relationships: []
      }
      article_analytics_totals: {
        Row: {
          article_slug: string | null
          avg_duration_ms: number | null
          avg_scroll_pct: number | null
          unique_sessions: number | null
          views: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
