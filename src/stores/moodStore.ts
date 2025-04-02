import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

interface MoodData {
  id: string;
  user_id: string;
  mood: string;
  notes: string | null;
  date: string;
  factors?: Json | null;
  created_at: string;
  updated_at?: string | null;
}

interface MoodState {
  moods: MoodData[];
  currentMood: string | MoodData | null;
  isLoading: boolean;
  error: string | null;
  fetchUserMoods: (userId: string) => Promise<void>;
  fetchMoods: (userId: string) => Promise<void>;
  getMoodById: (id: string) => MoodData | undefined;
  getMoodsByDateRange: (userId: string, startDate: string, endDate: string) => Promise<MoodData[]>;
  addMood: (newMood: Omit<MoodData, 'id' | 'created_at' | 'updated_at'>) => Promise<MoodData | null>;
  updateMood: (id: string, updates: Partial<MoodData>) => Promise<boolean>;
  deleteMood: (id: string) => Promise<boolean>;
  setCurrentMood: (mood: string | MoodData | null) => void;
  getRecentMoods: (userId: string, limit?: number) => Promise<MoodData[]>;
  getMoodStatistics: (userId: string) => Promise<any>;
  batchAddMoods: (newMoods: Array<Omit<MoodData, 'id' | 'created_at' | 'updated_at'>>) => Promise<MoodData[]>;
  clearMoodStore: () => void;
}

export const useMoodStore = create<MoodState>()(
  persist(
    (set, get) => ({
      moods: [],
      currentMood: null,
      isLoading: false,
      error: null,

      fetchUserMoods: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
          // Check if userId is undefined or empty
          if (!userId) {
            console.warn('Attempted to fetch moods with invalid userId');
            set({ moods: [], isLoading: false });
            return;
          }
          
          // Use RLS policy to filter by user_id for better security
          const { data, error } = await supabase
            .from('mood_entries')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

          if (error) {
            throw error;
          }

          set({ moods: data || [], isLoading: false });
        } catch (error: any) {
          console.error('Error fetching moods:', error);
          set({ 
            error: error.message || 'Failed to fetch mood data', 
            isLoading: false 
          });
        }
      },

      fetchMoods: async (userId: string) => {
        return get().fetchUserMoods(userId);
      },

      getMoodById: (id: string) => {
        // First check local cache
        const cachedMood = get().moods.find(mood => mood.id === id);
        if (cachedMood) return cachedMood;

        // If not in cache, could fetch from DB but this is a sync function
        // Add async version if needed
        return undefined;
      },

      getMoodsByDateRange: async (userId: string, startDate: string, endDate: string) => {
        set({ isLoading: true, error: null });
        try {
          // Efficient query using date indexes
          const { data, error } = await supabase
            .from('mood_entries')
            .select('*')
            .eq('user_id', userId)
            .gte('date', startDate)
            .lte('date', endDate)
            .order('date', { ascending: true });

          if (error) {
            throw error;
          }

          return data || [];
        } catch (error: any) {
          console.error('Error fetching moods by date range:', error);
          set({ 
            error: error.message || 'Failed to fetch mood data by date range', 
            isLoading: false 
          });
          return [];
        } finally {
          set({ isLoading: false });
        }
      },

      addMood: async (newMood) => {
        set({ isLoading: true, error: null });
        try {
          // Format the date in ISO format
          const now = new Date().toISOString();
          
          const { data, error } = await supabase
            .from('mood_entries')
            .insert([
              {
                user_id: newMood.user_id,
                mood: newMood.mood,
                notes: newMood.notes || '',
                date: newMood.date || now.split('T')[0],
                factors: newMood.factors || {},
                created_at: now,
              }
            ])
            .select()
            .single();

          if (error) {
            throw error;
          }

          // Update the local store with the new mood
          const updatedMoods = [data, ...get().moods];
          set({ 
            moods: updatedMoods, 
            currentMood: data,
            isLoading: false 
          });
          
          return data;
        } catch (error: any) {
          console.error('Error adding mood:', error);
          set({ 
            error: error.message || 'Failed to add mood', 
            isLoading: false 
          });
          return null;
        }
      },

      batchAddMoods: async (newMoods) => {
        if (newMoods.length === 0) return [];
        
        set({ isLoading: true, error: null });
        try {
          // Format moods for batch insert
          const now = new Date().toISOString();
          const moodsToInsert = newMoods.map(mood => ({
            user_id: mood.user_id,
            mood: mood.mood,
            notes: mood.notes || '',
            date: mood.date || now.split('T')[0],
            factors: mood.factors || {},
            created_at: now,
          }));
          
          const { data, error } = await supabase
            .from('mood_entries')
            .insert(moodsToInsert)
            .select();

          if (error) {
            throw error;
          }

          // Update the local store with the new moods
          const updatedMoods = [...data, ...get().moods];
          set({ 
            moods: updatedMoods,
            isLoading: false 
          });
          
          return data || [];
        } catch (error: any) {
          console.error('Error batch adding moods:', error);
          set({ 
            error: error.message || 'Failed to batch add moods', 
            isLoading: false 
          });
          return [];
        }
      },

      updateMood: async (id: string, updates: Partial<MoodData>) => {
        set({ isLoading: true, error: null });
        try {
          // Don't allow changing the id or created_at
          const { id: _, created_at: __, ...validUpdates } = updates;
          
          // Add updated_at timestamp
          const updatedData = {
            ...validUpdates,
            updated_at: new Date().toISOString(),
          };
          
          const { error } = await supabase
            .from('mood_entries')
            .update(updatedData)
            .eq('id', id);

          if (error) {
            throw error;
          }

          // Update the local store
          const updatedMoods = get().moods.map(mood => 
            mood.id === id ? { ...mood, ...updatedData } : mood
          );
          
          // Update current mood if it's the one being edited
          const currentMood = get().currentMood;
          if (currentMood && typeof currentMood === 'object' && currentMood.id === id) {
            set({ currentMood: { ...currentMood, ...updatedData } });
          }
          
          set({ moods: updatedMoods, isLoading: false });
          return true;
        } catch (error: any) {
          console.error('Error updating mood:', error);
          set({ 
            error: error.message || 'Failed to update mood', 
            isLoading: false 
          });
          return false;
        }
      },

      deleteMood: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase
            .from('mood_entries')
            .delete()
            .eq('id', id);

          if (error) {
            throw error;
          }

          // Update the local store
          const updatedMoods = get().moods.filter(mood => mood.id !== id);
          
          // Clear current mood if it's the one being deleted
          const currentMood = get().currentMood;
          if (currentMood && typeof currentMood === 'object' && currentMood.id === id) {
            set({ currentMood: null });
          }
          
          set({ moods: updatedMoods, isLoading: false });
          return true;
        } catch (error: any) {
          console.error('Error deleting mood:', error);
          set({ 
            error: error.message || 'Failed to delete mood', 
            isLoading: false 
          });
          return false;
        }
      },

      setCurrentMood: (mood) => {
        // Can accept either a string mood value or a full MoodData object
        set({ currentMood: mood });
      },

      getRecentMoods: async (userId: string, limit = 5) => {
        set({ isLoading: true, error: null });
        try {
          // Check if we have the moods cached and they're fresh (last hour)
          const cachedMoods = get().moods;
          const now = new Date();
          const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
          
          // If we have recent moods in cache, use them
          if (cachedMoods.length >= limit && 
              cachedMoods[0].user_id === userId && 
              new Date(cachedMoods[0].created_at) > oneHourAgo) {
            set({ isLoading: false });
            return cachedMoods.slice(0, limit);
          }
          
          // Otherwise fetch from DB
          const { data, error } = await supabase
            .from('mood_entries')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

          if (error) {
            throw error;
          }

          return data || [];
        } catch (error: any) {
          console.error('Error fetching recent moods:', error);
          set({ 
            error: error.message || 'Failed to fetch recent moods', 
            isLoading: false 
          });
          return [];
        } finally {
          set({ isLoading: false });
        }
      },

      getMoodStatistics: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
          // Use DB view for statistics calculation (much more efficient)
          const { data, error } = await supabase
            .from('mood_statistics')
            .select('*')
            .eq('user_id', userId)
            .single();

          if (error) {
            throw error;
          }

          return data || {};
        } catch (error: any) {
          console.error('Error fetching mood statistics:', error);
          set({ 
            error: error.message || 'Failed to fetch mood statistics', 
            isLoading: false 
          });
          return {};
        } finally {
          set({ isLoading: false });
        }
      },

      clearMoodStore: () => {
        set({ moods: [], currentMood: null, error: null });
      }
    }),
    {
      name: 'mood-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist specific parts of the state
      partialize: (state) => ({ 
        moods: state.moods,
        currentMood: state.currentMood
      }),
    }
  )
); 