export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
  id?: string;
  attachments?: {
    type: string;
    content: any;
  }[];
}

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  user_id: string;
  last_message?: string;
  last_interaction?: string;
  session_type?: 'therapy' | 'coaching' | 'general';
  is_complete?: boolean;
  metadata?: {
    topic?: string[];
    stage?: string;
    completion_percentage?: number;
    interventions_used?: string[];
  };
}

export interface SessionGoal {
  id: string;
  session_id: string;
  description: string;
  is_completed: boolean;
  created_at: string;
  updated_at?: string;
  priority?: 'low' | 'medium' | 'high';
  notes?: string;
}

export interface TherapySessionProps {
  sessionId?: string;
  currentStage?: 'opening' | 'assessment' | 'intervention' | 'closing';
  onStageUpdate?: (stage: string) => void;
  sessionTopics?: string[];
  completionPercentage?: number;
  onCompletionUpdate?: (percentage: number) => void;
  onNewMessage?: (message: Message) => void;
}

export interface AIModelConfig {
  name: string;
  id: string;
  maxTokens: number;
  temperature: number;
  description: string;
  capabilities: string[];
  contextWindow: number;
  isDefault?: boolean;
  provider: 'openai' | 'anthropic' | 'google' | 'local';
}

export interface ChatModels {
  [key: string]: AIModelConfig;
} 