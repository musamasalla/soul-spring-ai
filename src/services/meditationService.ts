import { MeditationData } from "@/types/meditation";

// Sample categories for meditations
export const MEDITATION_CATEGORIES = [
  "Mindfulness",
  "Sleep",
  "Stress Relief",
  "Anxiety",
  "Focus",
  "Gratitude",
  "Self-Compassion",
  "Body Scan",
  "Nature",
  "Breathing"
];

// Sample durations in minutes
export const MEDITATION_DURATIONS = [
  { label: "3 min", value: 3 * 60 },
  { label: "5 min", value: 5 * 60 },
  { label: "10 min", value: 10 * 60 },
  { label: "15 min", value: 15 * 60 },
  { label: "20 min", value: 20 * 60 },
  { label: "30 min", value: 30 * 60 }
];

// Generate a meditation script based on category, duration, and mood
export async function generateMeditationScript(category: string, duration: number, mood?: string): Promise<string> {
  // In a real implementation, this would call an API to generate the script
  // For now, return a sample script based on the category
  
  const samples: Record<string, string[]> = {
    "Mindfulness": [
      "Begin by finding a comfortable position...",
      "Take a deep breath in through your nose...",
      "Notice the sensations in your body without judgment..."
    ],
    "Sleep": [
      "As you prepare for sleep, let your body sink into the surface beneath you...",
      "Allow your thoughts to slow down, like clouds passing in the sky...",
      "With each breath, you're becoming more relaxed..."
    ],
    "Stress Relief": [
      "Notice any tension you're holding in your body...",
      "Breathe deeply into areas of tightness or discomfort...",
      "Imagine stress leaving your body with each exhale..."
    ],
    "Anxiety": [
      "Acknowledge any anxious thoughts without judgment...",
      "Return to the present moment by focusing on your breath...",
      "You are safe and supported in this moment..."
    ],
    "Focus": [
      "Direct your attention to a single point of focus...",
      "When your mind wanders, gently guide it back...",
      "Each time you return to focus, you strengthen your concentration..."
    ],
    "Gratitude": [
      "Bring to mind something you're grateful for in your life...",
      "Notice how gratitude feels in your body...",
      "Allow appreciation to expand with each breath..."
    ]
  };
  
  const defaultScripts = [
    "Begin by finding a comfortable position...",
    "Take a deep breath in... and slowly exhale...",
    "Notice the sensations in your body without judgment..."
  ];
  
  // Get scripts for the category or use default
  const categoryScripts = samples[category] || defaultScripts;
  
  // Create a script with appropriate length based on duration
  const scriptLength = Math.floor(duration / 60) * 2; // Roughly 2 guidance points per minute
  let script = `${category} Meditation\n\n`;
  
  // Add mood-specific intro if provided
  if (mood) {
    script += `This meditation is designed to help you cultivate a sense of ${mood.toLowerCase()}.\n\n`;
  }
  
  // Add random segments from the category scripts
  for (let i = 0; i < scriptLength; i++) {
    const randomIndex = Math.floor(Math.random() * categoryScripts.length);
    script += categoryScripts[randomIndex] + "\n\n";
  }
  
  // Add closing
  script += "As this meditation comes to a close, gently bring your awareness back to your surroundings...\n\n";
  script += "When you're ready, slowly open your eyes and carry this sense of calm with you into your day.";
  
  return script;
}

// Generate a new AI meditation
export async function generateAIMeditation(
  title: string,
  category: string,
  duration: number,
  mood?: string
): Promise<MeditationData> {
  // Generate a script
  const script = await generateMeditationScript(category, duration, mood);
  
  // In a real implementation, this would call a text-to-speech API to generate audio
  // For now, return a sample meditation with the generated script
  const meditation: MeditationData = {
    id: `ai-${Date.now()}`,
    title,
    description: `AI-generated ${category.toLowerCase()} meditation${mood ? ` for ${mood.toLowerCase()}` : ''}.`,
    category,
    coverImage: `/images/meditation-${category.toLowerCase().replace(/\s+/g, '-')}.jpg`,
    audioUrl: "/meditations/sample-meditation.mp3", // Would be generated in production
    audioSrc: "/meditations/sample-meditation.mp3", // Added for compatibility
    duration,
    isPremium: false,
    isFeatured: false,
    script,
    createdAt: new Date().toISOString(),
  };
  
  return meditation;
}

// Save meditation to localStorage (simulating a database)
export function saveMeditation(meditation: MeditationData): void {
  const savedMeditations = getSavedMeditations();
  savedMeditations.push(meditation);
  localStorage.setItem('savedMeditations', JSON.stringify(savedMeditations));
}

// Get all saved meditations
export function getSavedMeditations(): MeditationData[] {
  const savedMeditations = localStorage.getItem('savedMeditations');
  return savedMeditations ? JSON.parse(savedMeditations) : [];
}

// Delete a meditation
export function deleteMeditation(id: string): void {
  const savedMeditations = getSavedMeditations();
  const updatedMeditations = savedMeditations.filter(med => med.id !== id);
  localStorage.setItem('savedMeditations', JSON.stringify(updatedMeditations));
}

// Get sample meditations (for demo purposes)
export function getSampleMeditations(): MeditationData[] {
  return [
    {
      id: "sample-1",
      title: "Mindful Awareness",
      description: "A gentle meditation to bring awareness to the present moment.",
      category: "Mindfulness",
      coverImage: "/images/meditation-mindfulness.jpg",
      audioUrl: "/meditations/sample-meditation.mp3",
      audioSrc: "/meditations/sample-meditation.mp3", // Added for compatibility
      duration: 600, // 10 minutes
      isPremium: false,
      isFeatured: true,
      createdAt: "2023-09-15T10:30:00Z",
    },
    {
      id: "sample-2",
      title: "Deep Sleep Journey",
      description: "Prepare your mind and body for a restful night's sleep.",
      category: "Sleep",
      coverImage: "/images/meditation-sleep.jpg",
      audioUrl: "/meditations/sample-meditation.mp3",
      audioSrc: "/meditations/sample-meditation.mp3", // Added for compatibility
      duration: 1200, // 20 minutes
      isPremium: true,
      isFeatured: true,
      createdAt: "2023-09-10T20:15:00Z",
    },
    {
      id: "sample-3",
      title: "Anxiety Relief",
      description: "Release anxiety and find your center with this guided meditation.",
      category: "Anxiety",
      coverImage: "/images/meditation-anxiety.jpg",
      audioUrl: "/meditations/sample-meditation.mp3",
      audioSrc: "/meditations/sample-meditation.mp3", // Added for compatibility
      duration: 300, // 5 minutes
      isPremium: false,
      isFeatured: false,
      createdAt: "2023-09-05T15:45:00Z",
    },
    {
      id: "sample-4",
      title: "Gratitude Practice",
      description: "Cultivate gratitude and appreciation in your daily life.",
      category: "Gratitude",
      coverImage: "/images/meditation-gratitude.jpg",
      audioUrl: "/meditations/sample-meditation.mp3",
      audioSrc: "/meditations/sample-meditation.mp3", // Added for compatibility
      duration: 900, // 15 minutes
      isPremium: true,
      isFeatured: false,
      createdAt: "2023-09-01T08:20:00Z",
    }
  ];
} 