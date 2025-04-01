
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('mindspring_user');
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('mindspring_user');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Mock login - replace with real API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock user data
      const userData: User = {
        id: `user_${Math.random().toString(36).substr(2, 9)}`,
        email,
        name: email.split('@')[0],
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${email}`
      };
      
      setUser(userData);
      localStorage.setItem('mindspring_user', JSON.stringify(userData));
      toast.success("Welcome back!");
    } catch (error) {
      console.error('Login error:', error);
      toast.error("Login failed. Please check your credentials.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    
    try {
      // Mock signup - replace with real API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock user data
      const userData: User = {
        id: `user_${Math.random().toString(36).substr(2, 9)}`,
        email,
        name,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${name}`
      };
      
      setUser(userData);
      localStorage.setItem('mindspring_user', JSON.stringify(userData));
      toast.success("Account created successfully!");
    } catch (error) {
      console.error('Signup error:', error);
      toast.error("Signup failed. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mindspring_user');
    toast.info("You have been logged out.");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout
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
