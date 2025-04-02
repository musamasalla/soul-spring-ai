/**
 * Formats seconds into MM:SS format (e.g., "05:30" for 5 minutes and 30 seconds)
 * If hours are present, formats as HH:MM:SS (e.g., "01:05:30" for 1 hour, 5 minutes and 30 seconds)
 * 
 * @param seconds The time in seconds to format
 * @returns Formatted time string in MM:SS or HH:MM:SS format
 */
export const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) {
    return '00:00';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  // Format with leading zeros
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  // Only include hours if they exist
  if (hours > 0) {
    const formattedHours = String(hours).padStart(2, '0');
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  }

  return `${formattedMinutes}:${formattedSeconds}`;
};

/**
 * Parses a time string in MM:SS or HH:MM:SS format into seconds
 * 
 * @param timeString The time string to parse
 * @returns Total time in seconds
 */
export const parseTimeString = (timeString: string): number => {
  if (!timeString) return 0;

  const parts = timeString.split(':').map(part => parseInt(part, 10));
  
  if (parts.length === 3) {
    // HH:MM:SS format
    const [hours, minutes, seconds] = parts;
    return hours * 3600 + minutes * 60 + seconds;
  } else if (parts.length === 2) {
    // MM:SS format
    const [minutes, seconds] = parts;
    return minutes * 60 + seconds;
  }
  
  return 0;
};

/**
 * Converts a duration in seconds to a human-readable string (e.g., "5 min" or "1 hr 5 min")
 * 
 * @param seconds The time in seconds to format
 * @returns Human-readable duration string
 */
export const formatDuration = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) {
    return '0 min';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours} hr${hours !== 1 ? 's' : ''} ${minutes > 0 ? `${minutes} min` : ''}`;
  }

  return `${minutes} min`;
}; 