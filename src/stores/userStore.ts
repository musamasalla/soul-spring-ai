import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  name: string | null;
  avatar_url: string | null;
  is_premium: boolean | null;
  ai_messages_limit: number | null;
  journal_entries_limit: number | null;
  created_at: string | null;
  updated_at: string | null;
}

interface UserState {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  fetchUserProfile: (userId: string, forceRefresh?: boolean) => Promise<UserProfile | null>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  setUser: (user: UserProfile | null) => void;
  getUserLimits: () => { aiMessagesLimit: number; journalEntriesLimit: number };
  clearUserStore: () => void;
}

// Set default limits for users
const DEFAULT_AI_MESSAGES_LIMIT = 20;
const DEFAULT_JOURNAL_ENTRIES_LIMIT = 10;
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,
      lastFetched: null,

      fetchUserProfile: async (userId: string, forceRefresh = false) => {
        const { user, lastFetched } = get();
        const now = Date.now();
        
        // Use cached data if available and not forcing refresh
        if (
          !forceRefresh && 
          user && 
          user.id === userId && 
          lastFetched && 
          now - lastFetched < CACHE_EXPIRY_MS
        ) {
          return user;
        }
        
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

          if (error) {
            throw error;
          }
          
          set({ 
            user: data, 
            lastFetched: Date.now(),
            isLoading: false 
          });
          
          return data;
        } catch (error: any) {
          console.error('Error fetching user profile:', error);
          set({ 
            error: error.message || 'Failed to fetch user profile', 
            isLoading: false 
          });
          return null;
        }
      },

      updateUserProfile: async (updates: Partial<UserProfile>) => {
        set({ isLoading: true, error: null });
        const currentUser = get().user;
        
        if (!currentUser) {
          set({ 
            error: 'No user is currently logged in', 
            isLoading: false 
          });
          return false;
        }
        
        try {
          // Don't allow changing sensitive fields
          const { id: _, created_at: __, ...validUpdates } = updates;
          
          // Add updated_at timestamp
          const updatedData = {
            ...validUpdates,
            updated_at: new Date().toISOString(),
          };
          
          const { error } = await supabase
            .from('profiles')
            .update(updatedData)
            .eq('id', currentUser.id);

          if (error) {
            throw error;
          }

          // Update local state
          const updatedUser = { ...currentUser, ...updatedData };
          set({ 
            user: updatedUser,
            lastFetched: Date.now(),
            isLoading: false 
          });
          
          return true;
        } catch (error: any) {
          console.error('Error updating user profile:', error);
          set({ 
            error: error.message || 'Failed to update user profile', 
            isLoading: false 
          });
          return false;
        }
      },

      setUser: (user) => {
        set({ 
          user,
          lastFetched: user ? Date.now() : null
        });
      },
      
      getUserLimits: () => {
        const user = get().user;
        return {
          aiMessagesLimit: user?.ai_messages_limit || DEFAULT_AI_MESSAGES_LIMIT,
          journalEntriesLimit: user?.journal_entries_limit || DEFAULT_JOURNAL_ENTRIES_LIMIT
        };
      },

      clearUserStore: () => {
        set({ 
          user: null, 
          error: null,
          lastFetched: null
        });
      }
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user,
        lastFetched: state.lastFetched 
      }),
    }
  )
); 