export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      meditations: {
        Row: {
          id: string
          title: string
          description: string | null
          audio_url: string
          cover_image: string | null
          duration: number | null
          instructor: string | null
          category: string | null
          tags: string[] | null
          is_premium: boolean | null
          play_count: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          audio_url: string
          cover_image?: string | null
          duration?: number | null
          instructor?: string | null
          category?: string | null
          tags?: string[] | null
          is_premium?: boolean | null
          play_count?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          audio_url?: string
          cover_image?: string | null
          duration?: number | null
          instructor?: string | null
          category?: string | null
          tags?: string[] | null
          is_premium?: boolean | null
          play_count?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          mood: string | null
          tags: string[] | null
          is_favorite: boolean | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string
          title: string
          content: string
          mood?: string | null
          tags?: string[] | null
          is_favorite?: boolean | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          mood?: string | null
          tags?: string[] | null
          is_favorite?: boolean | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      journal_analytics: {
        Row: {
          id: string
          user_id: string
          entry_count: number
          mood_distribution: Json | null
          common_tags: Json | null
          last_updated: string
        }
        Insert: {
          id?: string
          user_id: string
          entry_count?: number
          mood_distribution?: Json | null
          common_tags?: Json | null
          last_updated?: string
        }
        Update: {
          id?: string
          user_id?: string
          entry_count?: number
          mood_distribution?: Json | null
          common_tags?: Json | null
          last_updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      community_posts: {
        Row: {
          id: string
          user_id: string
          content: string
          tags: string[] | null
          likes_count: number
          comments_count: number
          is_premium_only: boolean
          is_pinned: boolean
          is_featured: boolean
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          tags?: string[] | null
          likes_count?: number
          comments_count?: number
          is_premium_only?: boolean
          is_pinned?: boolean
          is_featured?: boolean
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          tags?: string[] | null
          likes_count?: number
          comments_count?: number
          is_premium_only?: boolean
          is_pinned?: boolean
          is_featured?: boolean
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      post_likes: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      post_comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          likes_count: number
          parent_comment_id: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          content: string
          likes_count?: number
          parent_comment_id?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          content?: string
          likes_count?: number
          parent_comment_id?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          }
        ]
      }
      comment_likes: {
        Row: {
          id: string
          comment_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          comment_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          comment_id?: string
          user_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      community_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          color: string | null
          is_premium_only: boolean
          sort_order: number
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon?: string | null
          color?: string | null
          is_premium_only?: boolean
          sort_order?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string | null
          color?: string | null
          is_premium_only?: boolean
          sort_order?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      post_categories: {
        Row: {
          id: string
          post_id: string
          category_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          category_id: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          category_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_categories_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "community_categories"
            referencedColumns: ["id"]
          }
        ]
      }
      mood_entries: {
        Row: {
          created_at: string
          date: string
          factors: Json | null
          id: string
          mood: string
          notes: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          factors?: Json | null
          id?: string
          mood: string
          notes?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          factors?: Json | null
          id?: string
          mood?: string
          notes?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          ai_messages_limit: number | null
          avatar_url: string | null
          created_at: string | null
          id: string
          is_premium: boolean | null
          journal_entries_limit: number | null
          name: string | null
          updated_at: string | null
        }
        Insert: {
          ai_messages_limit?: number | null
          avatar_url?: string | null
          created_at?: string | null
          id: string
          is_premium?: boolean | null
          journal_entries_limit?: number | null
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          ai_messages_limit?: number | null
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          is_premium?: boolean | null
          journal_entries_limit?: number | null
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          id: string
          user_id: string
          meditation_id: string
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          meditation_id: string
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          meditation_id?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_meditation_id_fkey"
            columns: ["meditation_id"]
            isOneToOne: false
            referencedRelation: "meditations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      meditation_history: {
        Row: {
          id: string
          user_id: string
          meditation_id: string
          completed: boolean | null
          date: string | null
          duration_seconds: number | null
        }
        Insert: {
          id?: string
          user_id: string
          meditation_id: string
          completed?: boolean | null
          date?: string | null
          duration_seconds?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          meditation_id?: string
          completed?: boolean | null
          date?: string | null
          duration_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "meditation_history_meditation_id_fkey"
            columns: ["meditation_id"]
            isOneToOne: false
            referencedRelation: "meditations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meditation_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      therapy_goals: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          status: 'not_started' | 'in_progress' | 'completed'
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          status?: 'not_started' | 'in_progress' | 'completed'
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          status?: 'not_started' | 'in_progress' | 'completed'
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "therapy_goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      },
      therapy_sessions: {
        Row: {
          id: string
          user_id: string
          title: string
          summary: string | null
          notes: string | null
          duration: number | null
          date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          summary?: string | null
          notes?: string | null
          duration?: number | null
          date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          summary?: string | null
          notes?: string | null
          duration?: number | null
          date?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapy_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      },
      session_goals: {
        Row: {
          id: string
          session_id: string
          goal_id: string
          progress: 'not_started' | 'in_progress' | 'completed' | 'good'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          goal_id: string
          progress?: 'not_started' | 'in_progress' | 'completed' | 'good'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          goal_id?: string
          progress?: 'not_started' | 'in_progress' | 'completed' | 'good'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_goals_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "therapy_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_goals_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "therapy_goals"
            referencedColumns: ["id"]
          }
        ]
      },
      tts_usage: {
        Row: {
          id: string
          user_id: string
          characters: number
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          characters: number
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          characters?: number
          date?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tts_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      },
    }
    Views: {
      mood_statistics: {
        Row: {
          good_count: number | null
          good_percentage: number | null
          great_count: number | null
          great_percentage: number | null
          low_count: number | null
          low_percentage: number | null
          neutral_count: number | null
          neutral_percentage: number | null
          terrible_count: number | null
          terrible_percentage: number | null
          total_entries: number | null
          user_id: string | null
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
