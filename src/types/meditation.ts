export interface MeditationData {
  id: string;
  title: string;
  description: string;
  audio_url?: string;
  image_url?: string;
  category: string;
  tags: string[];
  duration: number;
  play_count: number;
  created_at: string;
  updated_at?: string;
  author?: string;
  is_premium?: boolean;
}

export interface MeditationStats {
  total_sessions: number;
  total_minutes: number;
  streak_days: number;
  favorites: string[]; // IDs of favorite meditations
}

export interface MeditationCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
  meditation_count?: number;
}

export interface TherapyTechniqueType {
  id: string;
  title: string;
  description: string;
  category: string;
  steps: string[];
  duration: number; // estimated duration in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  benefits: string[];
  icon?: string;
}

export type MeditationCategoryType = 
  | 'sleep'
  | 'anxiety'
  | 'focus'
  | 'stress'
  | 'calm'
  | 'energizing'
  | 'gratitude'
  | 'self-compassion'
  | 'loving-kindness'
  | 'body-scan'
  | 'breathing';

export interface MeditationSession {
  id: string;
  meditationId: string;
  title: string;
  category: string;
  date: string;
  duration: number; // in seconds
  completed: boolean;
  mood?: string;
} 