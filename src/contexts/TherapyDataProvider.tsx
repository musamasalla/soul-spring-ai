import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '@/utils/supabaseClient';
import { TherapyGoal, TherapySession, SessionGoal } from '@/types/therapy';

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

// ... existing code ...

export function TherapyDataProvider({ children }: { children: ReactNode }) {
  const [therapyGoals, setTherapyGoals] = useState<TherapyGoal[]>([]);
  const [therapySessions, setTherapySessions] = useState<TherapySession[]>([]);
  const [sessionGoals, setSessionGoals] = useState<SessionGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingFallbackData, setIsUsingFallbackData] = useState(false);
  const user = useUser();

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const loadTherapyData = async () => {
      setIsLoading(true);
      setError(null);
      setIsUsingFallbackData(false);
      
      try {
        // Fetch therapy goals
        const { data: goalsData, error: goalsError } = await supabase
          .from('therapy_goals')
          .select('*')
          .eq('user_id', user.id);

        // Fetch therapy sessions
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('therapy_sessions')
          .select('*')
          .eq('user_id', user.id);

        // Fetch session goals
        const { data: sessionGoalsData, error: sessionGoalsError } = await supabase
          .from('session_goals')
          .select('*');

        // Check for database connection errors
        if (goalsError || sessionsError || sessionGoalsError) {
          console.warn('Database connection issues detected, using fallback data:', { 
            goalsError, sessionsError, sessionGoalsError 
          });
          
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
          }));
          
          setTherapyGoals(fallbackGoals);
          setTherapySessions(fallbackSessions);
          setSessionGoals(fallbackSessionGoals);
          setIsUsingFallbackData(true);
        } else {
          // Use real data from database
          setTherapyGoals(goalsData || []);
          setTherapySessions(sessionsData || []);
          setSessionGoals(sessionGoalsData || []);
        }
      } catch (err) {
        console.error('Error loading therapy data:', err);
        setError('Failed to load therapy data. Please try again later.');
        
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

    loadTherapyData();
  }, [user]);

  // ... existing code ...

  return (
    <TherapyDataContext.Provider
      value={{
        therapyGoals,
        therapySessions,
        sessionGoals,
        isLoading,
        error,
        isUsingFallbackData,
        addTherapyGoal,
        updateTherapyGoal,
        deleteTherapyGoal,
        addTherapySession,
        updateTherapySession,
        deleteTherapySession,
        addSessionGoal,
        updateSessionGoal,
        deleteSessionGoal,
        refreshData
      }}
    >
      {children}
    </TherapyDataContext.Provider>
  );
} 