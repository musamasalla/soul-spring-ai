import { v4 as uuidv4 } from 'uuid';

/**
 * Creates a mock TTS usage entry that can be used when the database is unavailable
 */
export const createMockTTSUsage = (userId: string, characters: number, model = 'elevenlabs', voice = 'default') => {
  return {
    id: uuidv4(),
    user_id: userId,
    characters,
    model,
    voice,
    timestamp: new Date().toISOString(),
    session_id: uuidv4(),
    content_snippet: 'Fallback content for offline mode'
  };
};

/**
 * Generates mock monthly TTS usage data for UI display when the database is unavailable
 */
export const generateMockMonthlyUsage = () => {
  const currentDate = new Date();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const month = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  
  return [{
    month,
    total_requests: Math.floor(Math.random() * 20) + 5, // Between 5-25
    total_characters: Math.floor(Math.random() * 5000) + 1000 // Between 1000-6000
  }];
};

/**
 * Calculates the premium usage percentage based on character count
 * @param characters The number of characters used
 * @param limit The monthly character limit (default: 1,000,000)
 * @returns The percentage of the limit used (0-100)
 */
export const calculateUsagePercentage = (characters: number, limit = 1000000) => {
  return Math.min(100, Math.round((characters / limit) * 100));
}; 