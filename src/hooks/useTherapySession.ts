import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { supabase } from '@/integrations/supabase/client';
import { TherapyGoal, SessionMilestone, SessionSummary } from '@/components/TherapySessionTracker';

interface TherapyData {
  goals: TherapyGoal[];
  sessions: SessionSummary[];
  currentStage: 'assessment' | 'understanding' | 'intervention' | 'maintenance';
  overallProgress: number;
  startDate: Date;
}

const DEFAULT_THERAPY_DATA: TherapyData = {
  goals: [],
  sessions: [],
  currentStage: 'assessment',
  overallProgress: 0,
  startDate: new Date()
};

// Add fallback mock data
const MOCK_THERAPY_GOALS = [
  {
    id: 'goal-1',
    user_id: '',
    title: 'Manage Anxiety',
    description: 'Practice mindfulness techniques to reduce daily anxiety',
    status: 'in_progress',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'goal-2',
    user_id: '',
    title: 'Improve Sleep',
    description: 'Establish a consistent sleep routine and practice relaxation before bed',
    status: 'in_progress',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'goal-3',
    user_id: '',
    title: 'Build Resilience',
    description: 'Develop coping strategies for managing stress and setbacks',
    status: 'in_progress',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const MOCK_THERAPY_SESSIONS = [
  {
    id: 'session-1',
    user_id: '',
    title: 'Initial Assessment',
    notes: 'First session to identify key areas of focus',
    duration_minutes: 45,
    mood_before: 5,
    mood_after: 6,
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'session-2',
    user_id: '',
    title: 'Anxiety Management',
    notes: 'Focused on breathing techniques and grounding exercises',
    duration_minutes: 30,
    mood_before: 4,
    mood_after: 7,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'session-3',
    user_id: '',
    title: 'Progress Review',
    notes: 'Discussed improvements in daily anxiety management',
    duration_minutes: 40,
    mood_before: 6,
    mood_after: 8,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const useTherapySession = (userId: string | undefined) => {
  // Use local storage as a fallback when offline or if user is not authenticated
  const [localData, setLocalData] = useLocalStorage<TherapyData>(
    `therapy-data-${userId || 'anonymous'}`,
    DEFAULT_THERAPY_DATA
  );
  
  const [sessionData, setSessionData] = useState<TherapyData>(localData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  
  // Load session data from Supabase if user is authenticated
  useEffect(() => {
    const loadData = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      
      try {
        // Load therapy goals
        const { data: goalsData, error: goalsError } = await supabase
          .from('therapy_goals')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (goalsError) {
          console.warn('Using fallback goals data due to DB error:', goalsError.message);
          // Update mock data with current user ID
          const fallbackGoals = MOCK_THERAPY_GOALS.map(goal => ({
            ...goal,
            user_id: userId || ''
          }));
          
          setSessionData(prev => ({
            ...prev,
            goals: fallbackGoals
          }));
        } else {
          setSessionData(prev => ({
            ...prev,
            goals: goalsData || []
          }));
        }
        
        // Load therapy sessions
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('therapy_sessions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (sessionsError) {
          console.warn('Using fallback sessions data due to DB error:', sessionsError.message);
          // Update mock data with current user ID
          const fallbackSessions = MOCK_THERAPY_SESSIONS.map(session => ({
            ...session,
            user_id: userId || ''
          }));
          
          setSessionData(prev => ({
            ...prev,
            sessions: fallbackSessions
          }));
        } else {
          setSessionData(prev => ({
            ...prev,
            sessions: sessionsData || []
          }));
        }
        
        // Determine current therapy stage based on sessions
        const sessionsToUse = sessionsError ? MOCK_THERAPY_SESSIONS : (sessionsData || []);
        let currentStage: TherapyData['currentStage'] = 'assessment';
        
        if (sessionsToUse.length >= 10) {
          currentStage = 'maintenance';
        } else if (sessionsToUse.length >= 5) {
          currentStage = 'intervention';
        } else if (sessionsToUse.length >= 2) {
          currentStage = 'understanding';
        }
        
        // Calculate overall progress
        const overallProgress = Math.min(100, Math.round((sessionsToUse.length / 10) * 100));
        
        // Determine start date
        const startDate = sessionsToUse.length > 0 
          ? new Date(Math.min(...sessionsToUse.map(s => new Date(s.created_at).getTime())))
          : new Date();
        
        // Update session data
        setSessionData(prev => ({
          ...prev,
          currentStage,
          overallProgress,
          startDate
        }));
        
        // Update last synced time
        setLastSynced(new Date());
        
        // Also update local storage as a fallback
        setLocalData({
          goals: goalsData || [],
          sessions: sessionsData || [],
          currentStage,
          overallProgress,
          startDate
        });
      } catch (err) {
        console.error('Error loading therapy data:', err);
        
        // Use mock data as fallback
        const fallbackGoals = MOCK_THERAPY_GOALS.map(goal => ({
          ...goal,
          user_id: userId || ''
        }));
        
        const fallbackSessions = MOCK_THERAPY_SESSIONS.map(session => ({
          ...session,
          user_id: userId || ''
        }));
        
        setSessionData({
          goals: fallbackGoals,
          sessions: fallbackSessions,
          currentStage: 'assessment',
          overallProgress: 30,
          startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [userId]);
  
  // Save goal to database and local storage
  const saveGoal = async (goal: TherapyGoal): Promise<TherapyGoal> => {
    // Update local state immediately for responsive UI
    const updatedGoals = sessionData.goals.find(g => g.id === goal.id)
      ? sessionData.goals.map(g => g.id === goal.id ? goal : g)
      : [...sessionData.goals, goal];
    
    setSessionData(prev => ({
      ...prev,
      goals: updatedGoals
    }));
    
    // Update local storage
    setLocalData(prev => ({
      ...prev,
      goals: updatedGoals
    }));
    
    // Save to database if user is authenticated
    if (userId) {
      try {
        const { data, error } = await supabase
          .from('therapy_goals')
          .upsert({
            id: goal.id,
            user_id: userId,
            title: goal.title,
            description: goal.description,
            progress: goal.progress,
            created_at: goal.created.toISOString(),
            target_date: goal.targetDate?.toISOString(),
            is_completed: goal.isCompleted,
            session_ids: goal.sessionIds
          })
          .select()
          .single();
        
        if (error) throw error;
        
        // Update with data from server (includes any server-side changes)
        if (data) {
          const updatedGoal = {
            ...goal,
            id: data.id // Use server-generated ID if new
          };
          
          // Update in local state if ID changed
          if (data.id !== goal.id) {
            setSessionData(prev => ({
              ...prev,
              goals: prev.goals.map(g => g.id === goal.id ? updatedGoal : g)
            }));
            
            setLocalData(prev => ({
              ...prev,
              goals: prev.goals.map(g => g.id === goal.id ? updatedGoal : g)
            }));
          }
          
          return updatedGoal;
        }
      } catch (err) {
        console.error('Error saving goal:', err);
        // Continue with local updates even if server save fails
      }
    }
    
    return goal;
  };
  
  // Delete a goal
  const deleteGoal = async (goalId: string): Promise<boolean> => {
    // Update local state immediately
    const updatedGoals = sessionData.goals.filter(g => g.id !== goalId);
    
    setSessionData(prev => ({
      ...prev,
      goals: updatedGoals
    }));
    
    // Update local storage
    setLocalData(prev => ({
      ...prev,
      goals: updatedGoals
    }));
    
    // Delete from database if user is authenticated
    if (userId) {
      try {
        const { error } = await supabase
          .from('therapy_goals')
          .delete()
          .eq('id', goalId)
          .eq('user_id', userId);
        
        if (error) throw error;
      } catch (err) {
        console.error('Error deleting goal:', err);
        // Continue with local deletion even if server delete fails
      }
    }
    
    return true;
  };
  
  // Save session summary
  const saveSession = async (session: SessionSummary): Promise<SessionSummary> => {
    // Update local state immediately
    const sessionExists = sessionData.sessions.some(s => s.id === session.id);
    const updatedSessions = sessionExists
      ? sessionData.sessions.map(s => s.id === session.id ? session : s)
      : [...sessionData.sessions, session];
    
    // Recalculate progress and stage
    const overallProgress = Math.min(100, Math.round((updatedSessions.length / 10) * 100));
    
    let currentStage: TherapyData['currentStage'] = 'assessment';
    if (updatedSessions.length >= 10) {
      currentStage = 'maintenance';
    } else if (updatedSessions.length >= 5) {
      currentStage = 'intervention';
    } else if (updatedSessions.length >= 2) {
      currentStage = 'understanding';
    }
    
    setSessionData(prev => ({
      ...prev,
      sessions: updatedSessions,
      overallProgress,
      currentStage
    }));
    
    // Update local storage
    setLocalData(prev => ({
      ...prev,
      sessions: updatedSessions,
      overallProgress,
      currentStage
    }));
    
    // Save to database if user is authenticated
    if (userId) {
      try {
        // Save session
        const { data, error } = await supabase
          .from('therapy_sessions')
          .upsert({
            id: session.id,
            user_id: userId,
            title: session.title,
            date: session.date.toISOString(),
            duration_minutes: session.durationMinutes,
            main_topics: session.mainTopics,
            insights: session.insights,
            emotional_state_start: session.emotionalState.start,
            emotional_state_end: session.emotionalState.end,
            techniques: session.techniques,
            next_session_focus: session.nextSessionFocus
          })
          .select()
          .single();
        
        if (error) throw error;
        
        // Save milestones if available
        if (session.homework && session.homework.length > 0) {
          const milestones = session.homework.map(m => ({
            id: m.id,
            session_id: session.id,
            user_id: userId,
            title: m.title,
            is_completed: m.isCompleted,
            assigned_date: m.assignedDate?.toISOString() || new Date().toISOString(),
            completed_date: m.completedDate?.toISOString() || null
          }));
          
          const { error: milestoneError } = await supabase
            .from('therapy_session_milestones')
            .upsert(milestones);
            
          if (milestoneError) throw milestoneError;
        }
        
        // Use server-generated ID if new
        if (data && data.id !== session.id) {
          const updatedSession = {
            ...session,
            id: data.id
          };
          
          setSessionData(prev => ({
            ...prev,
            sessions: prev.sessions.map(s => s.id === session.id ? updatedSession : s)
          }));
          
          setLocalData(prev => ({
            ...prev,
            sessions: prev.sessions.map(s => s.id === session.id ? updatedSession : s)
          }));
          
          return updatedSession;
        }
      } catch (err) {
        console.error('Error saving session:', err);
        // Continue with local updates even if server save fails
      }
    }
    
    return session;
  };
  
  // Delete a session
  const deleteSession = async (sessionId: string): Promise<boolean> => {
    // Update local state immediately
    const updatedSessions = sessionData.sessions.filter(s => s.id !== sessionId);
    
    // Recalculate progress and stage
    const overallProgress = Math.min(100, Math.round((updatedSessions.length / 10) * 100));
    
    let currentStage: TherapyData['currentStage'] = 'assessment';
    if (updatedSessions.length >= 10) {
      currentStage = 'maintenance';
    } else if (updatedSessions.length >= 5) {
      currentStage = 'intervention';
    } else if (updatedSessions.length >= 2) {
      currentStage = 'understanding';
    }
    
    setSessionData(prev => ({
      ...prev,
      sessions: updatedSessions,
      overallProgress,
      currentStage
    }));
    
    // Update local storage
    setLocalData(prev => ({
      ...prev,
      sessions: updatedSessions,
      overallProgress,
      currentStage
    }));
    
    // Delete from database if user is authenticated
    if (userId) {
      try {
        // Delete milestones first (cascading delete may not be set up)
        const { error: milestoneError } = await supabase
          .from('therapy_session_milestones')
          .delete()
          .eq('session_id', sessionId)
          .eq('user_id', userId);
          
        if (milestoneError) throw milestoneError;
        
        // Then delete the session
        const { error } = await supabase
          .from('therapy_sessions')
          .delete()
          .eq('id', sessionId)
          .eq('user_id', userId);
          
        if (error) throw error;
      } catch (err) {
        console.error('Error deleting session:', err);
        // Continue with local deletion even if server delete fails
      }
    }
    
    return true;
  };
  
  // Toggle milestone completion
  const toggleMilestone = async (sessionId: string, milestoneId: string, isCompleted: boolean): Promise<boolean> => {
    // Find session and update milestone
    const session = sessionData.sessions.find(s => s.id === sessionId);
    if (!session || !session.homework) return false;
    
    const milestoneIndex = session.homework.findIndex(m => m.id === milestoneId);
    if (milestoneIndex === -1) return false;
    
    // Create updated session with toggled milestone
    const updatedHomework = [...session.homework];
    updatedHomework[milestoneIndex] = {
      ...updatedHomework[milestoneIndex],
      isCompleted,
      completedDate: isCompleted ? new Date() : undefined
    };
    
    const updatedSession = {
      ...session,
      homework: updatedHomework
    };
    
    // Update sessions array
    const updatedSessions = sessionData.sessions.map(s => 
      s.id === sessionId ? updatedSession : s
    );
    
    // Update local state
    setSessionData(prev => ({
      ...prev,
      sessions: updatedSessions
    }));
    
    // Update local storage
    setLocalData(prev => ({
      ...prev,
      sessions: updatedSessions
    }));
    
    // Update in database if user is authenticated
    if (userId) {
      try {
        const { error } = await supabase
          .from('therapy_session_milestones')
          .update({
            is_completed: isCompleted,
            completed_date: isCompleted ? new Date().toISOString() : null
          })
          .eq('id', milestoneId)
          .eq('session_id', sessionId)
          .eq('user_id', userId);
          
        if (error) throw error;
      } catch (err) {
        console.error('Error updating milestone:', err);
        // Continue with local update even if server update fails
      }
    }
    
    return true;
  };
  
  // Generate a session summary from messages
  const generateSessionSummary = (
    sessionId: string,
    messages: any[],
    emotionData: any,
    currentStage: string
  ): SessionSummary => {
    // Calculate session duration
    const calculateDuration = () => {
      if (messages.length < 2) return 15; // Default duration
      
      const firstMessage = messages[0].timestamp;
      const lastMessage = messages[messages.length - 1].timestamp;
      
      if (!firstMessage || !lastMessage) return 15;
      
      const durationMs = lastMessage.getTime() - firstMessage.getTime();
      return Math.round(durationMs / (1000 * 60));
    };
    
    // Extract topics from messages
    const extractTopics = (): string[] => {
      const topics = new Set<string>();
      const topicIndicators = [
        'struggling with', 'dealing with', 'experiencing', 'feeling', 
        'concerned about', 'worried about', 'anxious about', 'issue with'
      ];
      
      // Get user messages
      const userMessages = messages
        .filter((m: any) => m.role === 'user')
        .map((m: any) => m.content.toLowerCase());
      
      // Simple topic extraction
      userMessages.forEach(message => {
        topicIndicators.forEach(indicator => {
          const index = message.indexOf(indicator);
          if (index !== -1) {
            const afterIndicator = message.substring(index + indicator.length).trim();
            const words = afterIndicator.split(/\s+/);
            if (words.length >= 2) {
              const potentialTopic = words.slice(0, 3).join(' ');
              if (potentialTopic.length > 3) {
                topics.add(potentialTopic);
              }
            }
          }
        });
      });
      
      return Array.from(topics).slice(0, 3);
    };
    
    // Generate insights from assistant messages
    const generateInsights = (): string[] => {
      const insights: string[] = [];
      const insightIndicators = [
        'important to remember', 'key insight', 'worth noting',
        'significant that', 'notice that', 'pattern of', 'I observe'
      ];
      
      // Get assistant messages
      const assistantMessages = messages
        .filter((m: any) => m.role === 'assistant')
        .map((m: any) => m.content);
      
      // Simple insight extraction
      assistantMessages.forEach(message => {
        insightIndicators.forEach(indicator => {
          const index = message.toLowerCase().indexOf(indicator);
          if (index !== -1) {
            const startSentence = message.lastIndexOf('.', index);
            const endSentence = message.indexOf('.', index);
            
            if (startSentence !== -1 && endSentence !== -1) {
              const sentence = message.substring(startSentence + 1, endSentence + 1).trim();
              if (sentence.length > 10 && sentence.length < 150) {
                insights.push(sentence);
              }
            }
          }
        });
      });
      
      return insights.slice(0, 3);
    };
    
    // Extract therapy techniques
    const extractTechniques = (): string[] => {
      if (emotionData?.recommendedTechniques) {
        return emotionData.recommendedTechniques;
      }
      
      const techniques = new Set<string>();
      const techniqueIndicators = [
        'try', 'practice', 'technique called', 'method known as',
        'exercise', 'approach called', 'strategy called'
      ];
      
      // Get assistant messages
      const assistantMessages = messages
        .filter((m: any) => m.role === 'assistant')
        .map((m: any) => m.content.toLowerCase());
      
      // Extract techniques
      assistantMessages.forEach(message => {
        techniqueIndicators.forEach(indicator => {
          const index = message.indexOf(indicator);
          if (index !== -1) {
            const afterIndicator = message.substring(index + indicator.length).trim();
            const quote = afterIndicator.indexOf('"');
            const period = afterIndicator.indexOf('.');
            const endIndex = (quote !== -1 && quote < 30) ? quote : 
                            (period !== -1 && period < 30) ? period : 20;
            
            if (endIndex > 2) {
              const techniqueName = afterIndicator.substring(0, endIndex).trim();
              if (techniqueName.length > 2) {
                techniques.add(techniqueName);
              }
            }
          }
        });
      });
      
      return Array.from(techniques).slice(0, 3);
    };
    
    // Create homework milestones based on techniques
    const createHomework = (techniques: string[]): SessionMilestone[] => {
      if (techniques.length === 0) {
        return [{
          id: `milestone-${Date.now()}-1`,
          title: 'Practice mindfulness for 5 minutes daily',
          isCompleted: false,
          assignedDate: new Date()
        }];
      }
      
      return techniques.map((technique, index) => ({
        id: `milestone-${Date.now()}-${index + 1}`,
        title: `Practice ${technique.toLowerCase()} technique daily`,
        isCompleted: false,
        assignedDate: new Date()
      }));
    };
    
    // Generate a next session focus based on stage and topics
    const generateNextFocus = (stage: string, topics: string[]): string => {
      if (stage === 'opening' || stage === 'assessment') {
        return 'Continue exploring your feelings and situation in more depth';
      } else if (stage === 'intervention') {
        return topics.length > 0
          ? `Develop more coping strategies for dealing with ${topics[0]}`
          : 'Practice applying the therapeutic techniques we discussed';
      } else {
        return 'Reflect on progress and refine your ongoing practice';
      }
    };
    
    // Extract data for summary
    const duration = calculateDuration();
    const topics = extractTopics();
    const insights = generateInsights();
    const techniques = extractTechniques();
    const homework = createHomework(techniques);
    const nextFocus = generateNextFocus(currentStage, topics);
    
    // Create summary
    return {
      id: sessionId,
      title: `Session on ${new Date().toLocaleDateString()}`,
      date: new Date(),
      durationMinutes: duration,
      mainTopics: topics.length > 0 ? topics : ['General check-in'],
      insights: insights.length > 0 ? insights : ['Continuing to build awareness'],
      emotionalState: {
        start: emotionData?.primaryEmotion || 'undetermined',
        end: emotionData?.emotionalTrend === 'improving' ? 'improved' : 
              emotionData?.emotionalTrend === 'declining' ? 'worsened' : 'stable'
      },
      techniques: techniques.length > 0 ? techniques : [],
      homework,
      nextSessionFocus: nextFocus
    };
  };
  
  return {
    sessionData,
    isLoading,
    error,
    lastSynced,
    saveGoal,
    deleteGoal,
    saveSession,
    deleteSession,
    toggleMilestone,
    generateSessionSummary
  };
}; 