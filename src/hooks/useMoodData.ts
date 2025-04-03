import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Adjust the MoodEntry type to match the database schema
export interface MoodEntry {
  id: string;
  user_id: string;
  mood: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
  date?: string;
  factors?: any; // Use any to avoid JSON type issues
  source?: string;
}

// Fetch mood entries for a user
const fetchMoodEntries = async (userId: string): Promise<MoodEntry[]> => {
  if (!userId) {
    return [];
  }
  
  const { data, error } = await supabase
    .from('mood_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching mood entries:', error);
    throw new Error(error.message);
  }
  
  return data || [];
};

// Add a new mood entry
const addMoodEntry = async (entry: { 
  user_id: string;
  mood: string;
  notes?: string;
  factors?: any;
  date?: string;
  source?: string;
}): Promise<MoodEntry> => {
  const { data, error } = await supabase
    .from('mood_entries')
    .insert(entry)
    .select()
    .single();
  
  if (error) {
    console.error('Error adding mood entry:', error);
    throw new Error(error.message);
  }
  
  return data;
};

// Delete a mood entry
const deleteMoodEntry = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('mood_entries')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting mood entry:', error);
    throw new Error(error.message);
  }
};

// Update a mood entry
const updateMoodEntry = async (id: string, updates: Partial<{
  mood: string;
  notes?: string;
  factors?: any;
  date?: string;
  source?: string;
}>): Promise<MoodEntry> => {
  const { data, error } = await supabase
    .from('mood_entries')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating mood entry:', error);
    throw new Error(error.message);
  }
  
  return data;
};

// Calculate mood statistics
const calculateMoodStats = async (userId: string): Promise<{
  mostFrequentMood: string;
  moodCounts: Record<string, number>;
  averageMoodPerDay: Record<string, any>;
  trendData: any[];
}> => {
  const entries = await fetchMoodEntries(userId);
  
  // Most frequent mood
  const moodCounts: Record<string, number> = {};
  entries.forEach(entry => {
    moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
  });
  
  const mostFrequentMood = Object.entries(moodCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([mood]) => mood)[0] || '';
  
  // Average mood per day
  const moodsByDay: Record<string, any> = {};
  entries.forEach(entry => {
    const date = new Date(entry.created_at).toISOString().split('T')[0];
    if (!moodsByDay[date]) {
      moodsByDay[date] = { moods: [], count: 0 };
    }
    moodsByDay[date].moods.push(entry.mood);
    moodsByDay[date].count++;
  });
  
  // Calculate trend data
  const trendData = Object.entries(moodsByDay)
    .map(([date, data]) => ({
      date,
      mood: (data as any).moods[0],
      count: (data as any).count
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
  
  return {
    mostFrequentMood,
    moodCounts,
    averageMoodPerDay: moodsByDay,
    trendData
  };
};

// Hook for fetching mood entries with React Query
export function useMoodEntries(userId?: string) {
  return useQuery({
    queryKey: ['moodEntries', userId],
    queryFn: () => userId ? fetchMoodEntries(userId) : Promise.resolve([]),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for adding a mood entry
export function useAddMoodEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: addMoodEntry,
    onSuccess: (data) => {
      toast.success('Mood recorded successfully');
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['moodEntries'] });
      queryClient.invalidateQueries({ queryKey: ['moodStats'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to record mood: ${error.message}`);
    }
  });
}

// Hook for deleting a mood entry
export function useDeleteMoodEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteMoodEntry,
    onSuccess: () => {
      toast.success('Mood entry deleted');
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['moodEntries'] });
      queryClient.invalidateQueries({ queryKey: ['moodStats'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete entry: ${error.message}`);
    }
  });
}

// Hook for updating a mood entry
export function useUpdateMoodEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { 
      id: string, 
      updates: Partial<{
        mood: string;
        notes?: string;
        factors?: any;
        date?: string;
        source?: string;
      }>
    }) => updateMoodEntry(id, updates),
    onSuccess: () => {
      toast.success('Mood entry updated');
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['moodEntries'] });
      queryClient.invalidateQueries({ queryKey: ['moodStats'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update entry: ${error.message}`);
    }
  });
}

// Hook for fetching mood statistics
export function useMoodStats(userId?: string) {
  return useQuery({
    queryKey: ['moodStats', userId],
    queryFn: () => userId ? calculateMoodStats(userId) : Promise.resolve({
      mostFrequentMood: '',
      moodCounts: {},
      averageMoodPerDay: {},
      trendData: []
    }),
    enabled: !!userId,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
} 