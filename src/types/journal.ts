import { Database } from "@/integrations/supabase/types";

// Type for a journal entry from the database
export type JournalEntry = Database['public']['Tables']['journal_entries']['Row'];

// Type for journal analytics from the database
export type JournalAnalytics = Database['public']['Tables']['journal_analytics']['Row'];

// Type for creating a new journal entry
export type NewJournalEntry = Omit<JournalEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

// Type for journal mood analytics
export interface MoodDistribution {
  [mood: string]: number;
}

// Type for tag analytics
export interface TagDistribution {
  [tag: string]: number;
}

// Type for journal insights
export interface JournalInsight {
  title: string;
  description: string;
  type: 'mood' | 'frequency' | 'tags' | 'improvement';
  value?: string | number;
} 