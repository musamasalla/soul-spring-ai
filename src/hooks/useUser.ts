import { useContext } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface UserData {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  isPremium: boolean;
}

export function useUser() {
  const { user, isLoading, isAuthenticated, isPremium } = useAuth();
  
  const userData: UserData | null = user ? {
    id: user.id,
    email: user.email || '',
    name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
    avatar: user.user_metadata?.avatar_url || undefined,
    isPremium: isPremium
  } : null;
  
  return {
    user: userData,
    isLoading,
    isAuthenticated,
    isPremium
  };
} 