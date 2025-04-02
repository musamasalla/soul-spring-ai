import React, { createContext, useContext, useState, useEffect } from 'react';
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
  user: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isPremium: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  enrollMFA: () => Promise<string>;
  verifyMFA: (code: string) => Promise<boolean>;
  checkUsageLimits: (type: 'ai_messages' | 'journal_entries') => {
    canUse: boolean;
    remaining: number;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  
  // Handle authentication state changes
  useEffect(() => {
    // First set up the auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          // Update session state
          setSession(session);
          
          // Fetch user profile data from profiles table
          try {
            // Use let instead of const for profileData since we need to reassign it
            let profileData = null;
            
            // First try to get existing profile
            const { data, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();
              
            profileData = data;
            
            if (profileError) {
              console.warn('Profile fetch error:', profileError.message);
            }
            
            // If profile doesn't exist, create a new profile
            if (!profileData) {
              console.log('Creating new profile for user:', session.user.id);
              
              try {
                // Create profile with normal user permissions
                // This will work if the RLS policy and triggers are set up correctly
                const { data: newProfile, error: createError } = await supabase
                  .from('profiles')
                  .insert({
                    id: session.user.id,
                    name: session.user.email?.split('@')[0] || '',
                    avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${session.user.email || ''}`,
                    is_premium: false,
                    ai_messages_limit: 10,
                    journal_entries_limit: 5
                  })
                  .select('*')
                  .maybeSingle();
                
                if (createError) {
                  console.error('Error creating user profile:', createError);
                  // Don't throw error - use fallback profile below
                } else {
                  console.log('New profile created successfully');
                  profileData = newProfile;
                }
              } catch (insertError) {
                console.error('Exception creating profile:', insertError);
                // Continue with fallback profile
              }
            }
            
            // Combine auth user data with profile data (or fallback data if profile creation failed)
            const userProfile: UserProfile = {
              id: session.user.id,
              email: session.user.email || '',
              name: (profileData?.name || session.user.email?.split('@')[0] || ''),
              avatar: profileData?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profileData?.name || session.user.email || ''}`,
              is_premium: !!profileData?.is_premium,
              usage_limits: {
                ai_messages: profileData?.ai_messages_limit || 10,
                journal_entries: profileData?.journal_entries_limit || 5,
              }
            };
            
            setUser(userProfile);
            setIsPremium(!!profileData?.is_premium);
          } catch (error) {
            console.error('Error in auth process:', error);
            // Fallback to basic user data if profile fetch fails
            const basicProfile: UserProfile = {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.email?.split('@')[0] || '',
              avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${session.user.email || ''}`,
              is_premium: false,
              usage_limits: {
                ai_messages: 10,
                journal_entries: 5,
              }
            };
            setUser(basicProfile);
            setIsPremium(false);
          }
        } else {
          // Clear user data on logout/session expiry
          setUser(null);
          setSession(null);
          setIsPremium(false);
        }
        setIsLoading(false);
      }
    );

    // Check for existing session on initial load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setIsLoading(false);
      }
      // The session will be handled by the onAuthStateChange listener
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast.success("Welcome back!");
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || "Login failed. Please check your credentials.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        }
      });
      
      if (error) throw error;
      
      toast.success("Account created successfully!");
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || "Signup failed. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      toast.info("You have been logged out.");
    } catch (error) {
      console.error('Logout error:', error);
      toast.error("Logout failed. Please try again.");
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

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAuthenticated: !!user,
        isPremium,
        login,
        signup,
        logout,
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
