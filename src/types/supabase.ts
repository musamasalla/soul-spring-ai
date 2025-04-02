export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_ai: boolean | null
          session_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_ai?: boolean | null
          session_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_ai?: boolean | null
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string | null
          id: string
          therapy_session_id: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          therapy_session_id?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          therapy_session_id?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_therapy_session_id_fkey"
            columns: ["therapy_session_id"]
            isOneToOne: false
            referencedRelation: "therapy_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      meditation_history: {
        Row: {
          completed: boolean | null
          date: string | null
          duration_seconds: number | null
          id: string
          meditation_id: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          date?: string | null
          duration_seconds?: number | null
          id?: string
          meditation_id: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          date?: string | null
          duration_seconds?: number | null
          id?: string
          meditation_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meditation_history_meditation_id_fkey"
            columns: ["meditation_id"]
            isOneToOne: false
            referencedRelation: "meditations"
            referencedColumns: ["id"]
          },
        ]
      }
      meditations: {
        Row: {
          audio_url: string
          category: string | null
          cover_image: string | null
          created_at: string | null
          description: string | null
          duration: number | null
          id: string
          instructor: string | null
          is_premium: boolean | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          audio_url: string
          category?: string | null
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          instructor?: string | null
          is_premium?: boolean | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          audio_url?: string
          category?: string | null
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          instructor?: string | null
          is_premium?: boolean | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
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
      therapy_sessions: {
        Row: {
          completed: boolean | null
          created_at: string | null
          current_stage: string | null
          duration: number | null
          id: string
          primary_topic: string | null
          session_goal: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          current_stage?: string | null
          duration?: number | null
          id?: string
          primary_topic?: string | null
          session_goal?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          current_stage?: string | null
          duration?: number | null
          id?: string
          primary_topic?: string | null
          session_goal?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          created_at: string | null
          id: string
          meditation_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          meditation_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          meditation_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_meditation_id_fkey"
            columns: ["meditation_id"]
            isOneToOne: false
            referencedRelation: "meditations"
            referencedColumns: ["id"]
          },
        ]
      }
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
