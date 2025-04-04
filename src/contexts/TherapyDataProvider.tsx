import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase, safeQuery, extractErrorMessage } from '@/integrations/supabase/client';
import { TherapyGoal, TherapySession, SessionGoal } from '@/types/therapy';
import { toast } from 'sonner';

// Create the context
interface TherapyDataContextType {
  therapyGoals: TherapyGoal[];
  therapySessions: TherapySession[];
  sessionGoals: SessionGoal[];
  isLoading: boolean;
  error: string | null;
  isUsingFallbackData: boolean;
  addTherapyGoal: (goal: Omit<TherapyGoal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTherapyGoal: (goal: TherapyGoal) => Promise<void>;
  deleteTherapyGoal: (goalId: string) => Promise<void>;
  addTherapySession: (session: Omit<TherapySession, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTherapySession: (session: TherapySession) => Promise<void>;
  deleteTherapySession: (sessionId: string) => Promise<void>;
  addSessionGoal: (sessionGoal: Omit<SessionGoal, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateSessionGoal: (sessionGoal: SessionGoal) => Promise<void>;
  deleteSessionGoal: (sessionGoalId: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

// Rename the context to avoid HMR issues
const TherapyDataContextInternal = createContext<TherapyDataContextType | undefined>(undefined);

// Create a custom hook to use the TherapyData context
// Use function declaration instead of arrow function for better HMR compatibility
export function useTherapyData() {
  const context = useContext(TherapyDataContextInternal);
  if (context === undefined) {
    throw new Error('useTherapyData must be used within a TherapyDataProvider');
  }
  return context;
}

// Fallback mock data for when database connection fails
const MOCK_THERAPY_GOALS: TherapyGoal[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    user_id: '',
    title: 'Reduce anxiety',
    description: 'Practice mindfulness techniques to manage daily anxiety',
    status: 'in_progress',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    completed_at: null
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    user_id: '',
    title: 'Improve sleep habits',
    description: 'Develop a consistent sleep schedule',
    status: 'in_progress',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    completed_at: null
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    user_id: '',
    title: 'Practice self-compassion',
    description: 'Reduce negative self-talk and develop kinder inner dialogue',
    status: 'in_progress',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    completed_at: null
  }
];

const MOCK_THERAPY_SESSIONS: TherapySession[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    user_id: '',
    title: 'Initial Assessment',
    summary: 'First session to understand your needs',
    notes: 'Discussed main concerns and goals for therapy',
    duration: 30,
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    user_id: '',
    title: 'Anxiety Management',
    summary: 'Exploring techniques to manage anxiety',
    notes: 'Introduced breathing exercises and mindfulness practices',
    duration: 45,
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    user_id: '',
    title: 'Progress Check-in',
    summary: 'Reviewing progress on therapeutic goals',
    notes: 'Discussed improvements in sleep quality and continued challenges with work stress',
    duration: 30,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export function TherapyDataProvider({ children }: { children: ReactNode }) {
  const [therapyGoals, setTherapyGoals] = useState<TherapyGoal[]>([]);
  const [therapySessions, setTherapySessions] = useState<TherapySession[]>([]);
  const [sessionGoals, setSessionGoals] = useState<SessionGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingFallbackData, setIsUsingFallbackData] = useState(false);
  const user = useUser();

  const loadData = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setIsUsingFallbackData(false);
    
    try {
      // Fetch therapy goals with enhanced error handling
      const { data: goalsData, error: goalsError } = await safeQuery(() => 
        supabase
          .from('therapy_goals')
          .select('*')
          .eq('user_id', user.id)
      );

      // Fetch therapy sessions
      const { data: sessionsData, error: sessionsError } = await safeQuery(() => 
        supabase
          .from('therapy_sessions')
          .select('*')
          .eq('user_id', user.id)
      );

      // Fetch session goals
      const { data: sessionGoalsData, error: sessionGoalsError } = await safeQuery(() => 
        supabase
          .from('session_goals')
          .select('*')
      );

      // Check for database connection errors
      if (goalsError || sessionsError || sessionGoalsError) {
        // Toast notification for user
        toast.error('Unable to connect to database. Using offline data.');
        
        // Use fallback data with current user ID
        const fallbackGoals = MOCK_THERAPY_GOALS.map(goal => ({
          ...goal,
          user_id: user.id
        }));
        
        const fallbackSessions = MOCK_THERAPY_SESSIONS.map(session => ({
          ...session,
          user_id: user.id
        }));
        
        // Create mock session goals connections (simple 1:1 matching)
        const fallbackSessionGoals = fallbackSessions.map((session, index) => ({
          id: `00000000-0000-0000-0000-00000000000${index + 1}`,
          session_id: session.id,
          goal_id: fallbackGoals[index % fallbackGoals.length].id,
          progress: Math.random() > 0.5 ? 'good' : 'in_progress',
          notes: 'Auto-generated fallback data',
          created_at: session.created_at,
          updated_at: session.updated_at
        })) as SessionGoal[];
        
        setTherapyGoals(fallbackGoals);
        setTherapySessions(fallbackSessions);
        setSessionGoals(fallbackSessionGoals);
        setIsUsingFallbackData(true);
        
        // Set error message for display
        setError('Using offline data due to database connectivity issues');
      } else {
        // If no goals exist but database connection works, initialize with default goals
        if (goalsData && goalsData.length === 0) {
          // Create default goals for new users
          const defaultGoals = MOCK_THERAPY_GOALS.map(goal => ({
            user_id: user.id,
            title: goal.title,
            description: goal.description,
            status: goal.status
          }));
          
          // Insert default goals
          const { data: createdGoals, error: createError } = await safeQuery(() => 
            supabase
              .from('therapy_goals')
              .insert(defaultGoals)
              .select()
          );
          
          if (createError) {
            toast.error('Failed to initialize default therapy goals');
          } else if (createdGoals) {
            toast.success('Initialized your therapy dashboard with starter goals');
            setTherapyGoals(createdGoals);
          }
        } else {
          // Use real data from database
          setTherapyGoals(goalsData || []);
        }
        
        setTherapySessions(sessionsData || []);
        setSessionGoals(sessionGoalsData || []);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to load therapy data: ${errorMessage}`);
      toast.error('Error loading therapy data. Using offline data instead.');
      
      // Fallback to mock data on any unexpected error
      const fallbackGoals = MOCK_THERAPY_GOALS.map(goal => ({
        ...goal,
        user_id: user.id
      }));
      
      const fallbackSessions = MOCK_THERAPY_SESSIONS.map(session => ({
        ...session,
        user_id: user.id
      }));
      
      setTherapyGoals(fallbackGoals);
      setTherapySessions(fallbackSessions);
      setSessionGoals([]);
      setIsUsingFallbackData(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Add necessary functions for data manipulation
  const refreshData = async () => {
    await loadData();
    toast.success('Data refreshed');
  };
  
  const addTherapyGoal = async (goalData: Omit<TherapyGoal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;
    
    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const newGoal: TherapyGoal = {
      id: tempId,
      user_id: user.id,
      ...goalData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed_at: null
    };
    
    setTherapyGoals(prev => [...prev, newGoal]);
    
    try {
      // Save to database
      const { data, error } = await safeQuery(() => 
        supabase
          .from('therapy_goals')
          .insert([{
            user_id: user.id,
            ...goalData,
          }])
          .select()
      );
      
      if (error) {
        // Revert optimistic update
        setTherapyGoals(prev => prev.filter(g => g.id !== tempId));
        toast.error(`Error adding goal: ${error}`);
        return;
      }
      
      // Update with real database data
      if (data && data.length > 0) {
        setTherapyGoals(prev => prev.map(g => g.id === tempId ? data[0] : g));
        toast.success('Goal added successfully');
      }
    } catch (err) {
      // Revert optimistic update
      setTherapyGoals(prev => prev.filter(g => g.id !== tempId));
      toast.error('Failed to add goal');
      console.error('Error adding therapy goal:', err);
    }
  };
  
  const updateTherapyGoal = async (goal: TherapyGoal) => {
    // Implementation
  };
  
  const deleteTherapyGoal = async (goalId: string) => {
    // Implementation
  };
  
  const addTherapySession = async (session: Omit<TherapySession, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    // Implementation
  };
  
  const updateTherapySession = async (session: TherapySession) => {
    // Implementation
  };
  
  const deleteTherapySession = async (sessionId: string) => {
    // Implementation
  };
  
  const addSessionGoal = async (sessionGoal: Omit<SessionGoal, 'id' | 'created_at' | 'updated_at'>) => {
    // Implementation
  };
  
  const updateSessionGoal = async (sessionGoal: SessionGoal) => {
    // Implementation
  };
  
  const deleteSessionGoal = async (sessionGoalId: string) => {
    // Implementation
  };

  return (
    <TherapyDataContextInternal.Provider
      value={{
        therapyGoals,
        therapySessions,
        sessionGoals,
        isLoading,
        error,
        isUsingFallbackData,
        refreshData,
        addTherapyGoal,
        updateTherapyGoal,
        deleteTherapyGoal,
        addTherapySession,
        updateTherapySession,
        deleteTherapySession,
        addSessionGoal,
        updateSessionGoal,
        deleteSessionGoal
      }}
    >
      {children}
    </TherapyDataContextInternal.Provider>
  );
} 