// Type definitions for therapy features

/**
 * Represents a therapy goal for a user
 */
export interface TherapyGoal {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

/**
 * Represents a therapy session
 */
export interface TherapySession {
  id: string;
  user_id: string;
  title: string;
  summary: string;
  notes: string;
  duration: number; // in minutes
  date: string;
  created_at: string;
  updated_at: string;
}

/**
 * Represents a connection between a therapy session and a goal
 */
export interface SessionGoal {
  id: string;
  session_id: string;
  goal_id: string;
  progress: 'not_started' | 'in_progress' | 'good' | 'completed';
  notes: string;
  created_at: string;
  updated_at: string;
}

/**
 * Therapy stage in the therapy process
 */
export enum TherapyStage {
  ASSESSMENT = 'assessment',
  GOAL_SETTING = 'goal_setting',
  TREATMENT = 'treatment',
  PROGRESS_REVIEW = 'progress_review',
  MAINTENANCE = 'maintenance'
}

/**
 * Represents a recommendation for therapeutic intervention
 */
export interface TherapyRecommendation {
  id: string;
  title: string;
  description: string;
  type: 'exercise' | 'resource' | 'practice' | 'referral';
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  tags: string[];
} 