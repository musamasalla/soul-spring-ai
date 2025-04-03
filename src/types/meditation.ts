export interface MeditationData {
  id: string;
  title: string;
  description: string;
  audioSrc: string;
  duration: number; // in seconds
  instructor: string;
  category: string | string[];
  isPremium?: boolean;
  coverImage?: string;
  isAiGenerated?: boolean;
  dateCreated?: string;
}

// New types for multi-day programs and guided courses
export interface ProgramMeditationData extends MeditationData {
  day: number;
  order: number;
  completionRate?: number;
}

export interface MeditationProgramData {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  totalDays: number;
  category: string[];
  tags?: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
  isPremium?: boolean;
  meditations: ProgramMeditationData[];
  targetGoal: string;
  expectedOutcomes: string[];
  authorName: string;
  authorCredentials?: string;
  userProgress?: {
    currentDay: number;
    lastCompletedDay: number;
    startDate: string;
    completionRate: number;
  };
}

export interface EducationalResourceData {
  id: string;
  title: string;
  description: string;
  type: "article" | "guide" | "video" | "infographic" | "worksheet" | "podcast" | "audio";
  topic: string;
  tags: string[];
  contentUrl: string;
  imageUrl?: string;
  estimatedReadTime?: number;
  author?: string;
  datePublished?: string;
  featured?: boolean;
}

export type MeditationTheme = 
  | 'mindfulness'
  | 'anxiety-relief'
  | 'sleep'
  | 'self-love'
  | 'energy'
  | 'stress-relief'
  | 'focus'
  | 'gratitude'
  | 'compassion'
  | 'grief'
  | 'anger'
  | 'depression'
  | 'trauma';

export interface MeditationGenerationParams {
  duration: number;
  focus?: MeditationTheme;
  userPrompt?: string;
  voice?: string;
}

export interface MeditationReminderSettings {
  enabled: boolean;
  frequency: 'daily' | 'weekdays' | 'custom';
  customDays?: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[];
  time: string; // HH:MM format
  notification: {
    browser: boolean;
    email: boolean;
    mobile: boolean;
  };
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