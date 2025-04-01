
import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeType = 'dark' | 'light';

interface ThemeContextType {
  theme: ThemeType;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check local storage or default to dark theme
  const [theme, setThemeState] = useState<ThemeType>(() => {
    // If running in browser, check local storage
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('mindspring-theme');
      return (savedTheme as ThemeType) || 'dark';
    }
    return 'dark';
  });

  // Apply theme class to document when theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const root = window.document.documentElement;
    
    // Remove both themes first
    root.classList.remove('light', 'dark');
    // Then add the current theme
    root.classList.add(theme);
    
    // Save to localStorage
    localStorage.setItem('mindspring-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };
  
  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
