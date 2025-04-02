import { MeditationData, MeditationSession } from "@/types/meditation";

// Interface for storing mood records
export interface MoodRecord {
  sessionId: string;
  meditationId: string;
  meditationTitle: string;
  date: string;
  mood: string;
  notes?: string;
}

// Save a completed meditation session
export function saveMeditationSession(meditation: MeditationData, completed: boolean = true): MeditationSession {
  const session: MeditationSession = {
    id: `session-${Date.now()}`,
    meditationId: meditation.id,
    title: meditation.title,
    category: Array.isArray(meditation.category) ? meditation.category[0] : meditation.category || "",
    date: new Date().toISOString(),
    duration: meditation.duration,
    completed
  };
  
  // Get existing sessions
  const sessions = getSessions();
  
  // Add new session
  sessions.push(session);
  
  // Save to localStorage
  localStorage.setItem('meditation_sessions', JSON.stringify(sessions));
  
  return session;
}

// Save a mood record for a meditation session
export function saveMoodRecord(sessionId: string, meditationId: string, meditationTitle: string, mood: string, notes?: string): MoodRecord {
  const moodRecord: MoodRecord = {
    sessionId,
    meditationId,
    meditationTitle,
    date: new Date().toISOString(),
    mood,
    notes
  };
  
  // Get existing mood records
  const moodRecords = getMoodRecords();
  
  // Add new record
  moodRecords.push(moodRecord);
  
  // Save to localStorage
  localStorage.setItem('meditation_moods', JSON.stringify(moodRecords));
  
  return moodRecord;
}

// Get all meditation sessions
export function getSessions(): MeditationSession[] {
  const sessions = localStorage.getItem('meditation_sessions');
  return sessions ? JSON.parse(sessions) : [];
}

// Get sessions for a specific userId (future-proofing for multi-user support)
export function getUserSessions(userId: string): MeditationSession[] {
  // In a real app, this would filter by user ID
  // For now, just return all sessions
  return getSessions();
}

// Get all mood records
export function getMoodRecords(): MoodRecord[] {
  const records = localStorage.getItem('meditation_moods');
  return records ? JSON.parse(records) : [];
}

// Get mood records for a specific user
export function getUserMoodRecords(userId: string): MoodRecord[] {
  // In a real app, this would filter by user ID
  // For now, just return all records
  return getMoodRecords();
}

// Get sessions with their associated mood records (if any)
export function getSessionsWithMood(): (MeditationSession & { mood?: string })[] {
  const sessions = getSessions();
  const moodRecords = getMoodRecords();
  
  return sessions.map(session => {
    const moodRecord = moodRecords.find(record => record.sessionId === session.id);
    return {
      ...session,
      mood: moodRecord?.mood
    };
  });
}

// Calculate streak (consecutive days with completed meditations)
export function calculateStreak(): number {
  const sessions = getSessions();
  
  if (sessions.length === 0) return 0;
  
  // Sort sessions by date (newest first)
  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Check if there's a session from today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const mostRecentSession = new Date(sortedSessions[0].date);
  mostRecentSession.setHours(0, 0, 0, 0);
  
  // If most recent session isn't from today, return 0
  if (mostRecentSession.getTime() < today.getTime()) {
    return 0;
  }
  
  let streak = 1; // Start at 1 for today
  let currentDate = today;
  
  // Look back through previous days
  for (let i = 1; i < sortedSessions.length; i++) {
    const previousDay = new Date(currentDate);
    previousDay.setDate(previousDay.getDate() - 1);
    
    // Check if there's a session from the previous day
    const sessionFromPreviousDay = sortedSessions.find(session => {
      const sessionDate = new Date(session.date);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === previousDay.getTime();
    });
    
    if (sessionFromPreviousDay) {
      streak++;
      currentDate = previousDay;
    } else {
      break; // Streak broken
    }
  }
  
  return streak;
}

// Get total meditation minutes
export function getTotalMeditationMinutes(): number {
  const sessions = getSessions().filter(session => session.completed);
  return sessions.reduce((total, session) => total + Math.floor(session.duration / 60), 0);
}

// Get category breakdown
export function getCategoryBreakdown(): Record<string, number> {
  const sessions = getSessions().filter(session => session.completed);
  const categories: Record<string, number> = {};
  
  sessions.forEach(session => {
    const category = session.category || "Uncategorized";
    if (categories[category]) {
      categories[category]++;
    } else {
      categories[category] = 1;
    }
  });
  
  return categories;
}

// Generate sample session data for demo purposes
export function generateSampleSessionData(days: number = 30): MeditationSession[] {
  const sampleSessions: MeditationSession[] = [];
  const categories = [
    "Mindfulness", "Sleep", "Stress Relief", "Anxiety", 
    "Focus", "Gratitude", "Self-Compassion", "Body Scan"
  ];
  const titles = [
    "Morning Meditation", "Deep Sleep Journey", "Stress Relief", 
    "Anxiety Release", "Focus & Clarity", "Gratitude Practice", 
    "Self-Compassion", "Body Scan Relaxation", "Breath Awareness"
  ];
  
  // Generate between 15-25 random sessions over the last 30 days
  const sessionCount = Math.floor(Math.random() * 11) + 15; // 15-25 sessions
  
  for (let i = 0; i < sessionCount; i++) {
    // Random date within the last 'days' days
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * days));
    
    // Random category and duration
    const category = categories[Math.floor(Math.random() * categories.length)];
    const title = titles[Math.floor(Math.random() * titles.length)];
    const duration = [300, 600, 900, 1200][Math.floor(Math.random() * 4)]; // 5, 10, 15, or 20 minutes
    
    sampleSessions.push({
      id: `sample-session-${i}`,
      meditationId: `sample-meditation-${i}`,
      title,
      category,
      date: date.toISOString(),
      duration,
      completed: Math.random() > 0.1, // 90% chance of being completed
    });
  }
  
  // Make sure there's a session for today to show a streak
  const today = new Date();
  sampleSessions.push({
    id: `sample-session-today`,
    meditationId: `sample-meditation-today`,
    title: "Today's Meditation",
    category: "Mindfulness",
    date: today.toISOString(),
    duration: 600,
    completed: true,
  });
  
  // Make sure there's a session for yesterday to increase streak
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  sampleSessions.push({
    id: `sample-session-yesterday`,
    meditationId: `sample-meditation-yesterday`,
    title: "Yesterday's Meditation",
    category: "Sleep",
    date: yesterday.toISOString(),
    duration: 900,
    completed: true,
  });
  
  return sampleSessions;
}

// Generate sample mood data
export function generateSampleMoodData(sessions: MeditationSession[]): MoodRecord[] {
  const moods = ["very_happy", "happy", "neutral", "calm", "refreshed", "sleepy"];
  const moodRecords: MoodRecord[] = [];
  
  // Only generate moods for ~70% of completed sessions
  const sessionsWithMood = sessions
    .filter(session => session.completed && Math.random() > 0.3);
  
  sessionsWithMood.forEach(session => {
    moodRecords.push({
      sessionId: session.id,
      meditationId: session.meditationId,
      meditationTitle: session.title,
      date: new Date(session.date).toISOString(),
      mood: moods[Math.floor(Math.random() * moods.length)],
      notes: Math.random() > 0.7 ? "Sample mood notes for this session." : undefined
    });
  });
  
  return moodRecords;
}

// Initialize with sample data if no real data exists
export function initializeSampleData(): void {
  const existingSessions = getSessions();
  const existingMoods = getMoodRecords();
  
  if (existingSessions.length === 0) {
    const sampleSessions = generateSampleSessionData();
    localStorage.setItem('meditation_sessions', JSON.stringify(sampleSessions));
    
    if (existingMoods.length === 0) {
      const sampleMoods = generateSampleMoodData(sampleSessions);
      localStorage.setItem('meditation_moods', JSON.stringify(sampleMoods));
    }
  }
}

// Initialize sample data if none exists
initializeSampleData(); 