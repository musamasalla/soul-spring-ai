import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MeditationData } from '@/types/meditation';

interface FavoritesContextType {
  favorites: MeditationData[];
  addFavorite: (meditation: MeditationData) => void;
  removeFavorite: (meditationId: string) => void;
  isFavorite: (meditationId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

interface FavoritesProviderProps {
  children: ReactNode;
}

export function FavoritesProvider({ children }: FavoritesProviderProps) {
  const [favorites, setFavorites] = useState<MeditationData[]>([]);

  // Load favorites from localStorage on initial mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('meditation_favorites');
    if (savedFavorites) {
      try {
        const parsedFavorites = JSON.parse(savedFavorites);
        setFavorites(parsedFavorites);
      } catch (error) {
        console.error('Failed to parse favorites from localStorage:', error);
      }
    }
  }, []);

  // Save favorites to localStorage when they change
  useEffect(() => {
    localStorage.setItem('meditation_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = (meditation: MeditationData) => {
    setFavorites(prev => {
      // Check if already in favorites
      if (prev.some(fav => fav.id === meditation.id)) {
        return prev;
      }
      return [...prev, meditation];
    });
  };

  const removeFavorite = (meditationId: string) => {
    setFavorites(prev => prev.filter(meditation => meditation.id !== meditationId));
  };

  const isFavorite = (meditationId: string) => {
    return favorites.some(meditation => meditation.id === meditationId);
  };

  const value = {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
} 