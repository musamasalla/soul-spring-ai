export interface MeditationData {
  id: string;
  title: string;
  description: string;
  category?: string | string[];
  coverImage?: string;
  audioUrl?: string;
  audioSrc?: string;
  duration: number; // in seconds
  isPremium?: boolean;
  isFeatured?: boolean;
  instructor?: string;
  script?: string;
  createdAt?: string;
  updatedAt?: string;
}

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