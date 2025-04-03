import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  is_premium?: boolean;
  usage_limits?: {
    ai_messages: number;
    journal_entries: number;
  };
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isPremium: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    data: Session | null;
  }>;
  signUp: (email: string, password: string, name?: string) => Promise<{
    error: Error | null;
    data: Session | null;
  }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{
    error: Error | null;
    data: any;
  }>;
  enrollMFA: () => Promise<string>;
  verifyMFA: (code: string) => Promise<boolean>;
  checkUsageLimits: (type: 'ai_messages' | 'journal_entries') => {
    canUse: boolean;
    remaining: number;
  };
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isPremium: false,
  signIn: async () => ({ error: null, data: null }),
  signUp: async () => ({ error: null, data: null }),
  signOut: async () => {},
  resetPassword: async () => ({ error: null, data: null }),
  enrollMFA: async () => '',
  verifyMFA: async () => false,
  checkUsageLimits: () => ({ canUse: true, remaining: 0 }),
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPremium, setIsPremium] = useState(false);
  
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      toast.success("Welcome back!");
      return { data: data.session, error };
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error instanceof Error ? error.message : "Login failed. Please check your credentials.");
      return { data: null, error: error as Error };
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || '',
          }
        }
      });
      toast.success("Account created successfully!");
      return { data: data.session, error };
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error instanceof Error ? error.message : "Signup failed. Please try again.");
      return { data: null, error: error as Error };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.info("You have been logged out.");
    } catch (error) {
      console.error('Logout error:', error);
      toast.error("Logout failed. Please try again.");
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  };

  const enrollMFA = async (): Promise<string> => {
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
      });
      
      if (error) throw error;
      return data.totp.qr_code || '';
    } catch (error: any) {
      console.error('MFA enrollment error:', error);
      toast.error(error.message || "Failed to enable two-factor authentication.");
      throw error;
    }
  };

  const verifyMFA = async (code: string): Promise<boolean> => {
    try {
      // First create a challenge
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: 'totp',
      });
      
      if (challengeError) throw challengeError;
      
      // Then verify the challenge with the code
      const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
        factorId: 'totp',
        challengeId: challengeData.id,
        code,
      });
      
      if (verifyError) throw verifyError;
      
      // Return success based on response
      return true; // If we got here without errors, verification was successful
    } catch (error: any) {
      console.error('MFA verification error:', error);
      toast.error(error.message || "Failed to verify authentication code.");
      return false;
    }
  };

  const checkUsageLimits = (type: 'ai_messages' | 'journal_entries') => {
    // Default limits for free users
    const defaultLimits = {
      ai_messages: 10,
      journal_entries: 5
    };

    // If premium user, return unlimited
    if (isPremium) {
      return { canUse: true, remaining: 999 }; // Unlimited for premium
    }

    // If user not loaded yet or no limits set
    if (!user?.usage_limits) {
      return { canUse: true, remaining: defaultLimits[type] };
    }

    const limit = user.usage_limits[type] || defaultLimits[type];
    // In a real app, you would track usage in the database
    // Here we're just returning the limit for demonstration
    return { canUse: true, remaining: limit };
  };

  useEffect(() => {
    if (user) {
      setIsPremium(!!user.is_premium);
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isLoading,
        isAuthenticated: !!user,
        isPremium,
        signIn,
        signUp,
        signOut,
        resetPassword,
        enrollMFA,
        verifyMFA,
        checkUsageLimits
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
