// Import Supabase client
import { createClient } from '@supabase/supabase-js';

// Supabase connection details
const SUPABASE_URL = "https://ryjawoplxfttnsuznssi.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5amF3b3BseGZ0dG5zdXpuc3NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MTE4NzIsImV4cCI6MjA1OTA4Nzg3Mn0.qvvjbZKo05FWnTJ89dRyl9Z2ob6_AZeQlixHZXUiYRE";

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Sample meditation data
const sampleMeditations = [
  {
    title: "Calming Breath Work",
    description: "A gentle breathing meditation to calm anxiety and stress",
    audio_url: "https://example.com/audio/calm-breath.mp3",
    cover_image: "https://example.com/images/calm-breath.jpg",
    duration: 300, // 5 minutes in seconds
    instructor: "Sarah Johnson",
    category: "anxiety",
    tags: ["breathing", "anxiety", "beginner"],
    is_premium: false
  },
  {
    title: "Body Scan Relaxation",
    description: "Progressive relaxation technique for deep relaxation",
    audio_url: "https://example.com/audio/body-scan.mp3",
    cover_image: "https://example.com/images/body-scan.jpg",
    duration: 600, // 10 minutes
    instructor: "Michael Chen",
    category: "sleep",
    tags: ["relaxation", "sleep", "body-scan"],
    is_premium: false
  },
  {
    title: "Morning Energy Meditation",
    description: "Start your day with energy and positivity",
    audio_url: "https://example.com/audio/morning-energy.mp3",
    cover_image: "https://example.com/images/morning-energy.jpg",
    duration: 420, // 7 minutes
    instructor: "Emma Roberts",
    category: "energizing",
    tags: ["morning", "energy", "positivity"],
    is_premium: false
  },
  {
    title: "Loving-Kindness Practice",
    description: "Cultivate compassion for yourself and others",
    audio_url: "https://example.com/audio/loving-kindness.mp3",
    cover_image: "https://example.com/images/loving-kindness.jpg",
    duration: 480, // 8 minutes
    instructor: "David Wong",
    category: "self-compassion",
    tags: ["compassion", "loving-kindness", "emotional"],
    is_premium: false
  },
  {
    title: "Stress Relief Focus",
    description: "Quick meditation for immediate stress relief",
    audio_url: "https://example.com/audio/stress-relief.mp3",
    cover_image: "https://example.com/images/stress-relief.jpg",
    duration: 240, // 4 minutes
    instructor: "Alex Thompson",
    category: "stress",
    tags: ["stress", "quick", "focus"],
    is_premium: false
  },
  {
    title: "Deep Sleep Journey",
    description: "Guided meditation to help you fall asleep naturally",
    audio_url: "https://example.com/audio/deep-sleep.mp3",
    cover_image: "https://example.com/images/deep-sleep.jpg",
    duration: 1200, // 20 minutes
    instructor: "Sophia Martinez",
    category: "sleep",
    tags: ["sleep", "relaxation", "night"],
    is_premium: true
  }
];

// Function to insert sample data
async function insertSampleData() {
  try {
    const { data, error } = await supabase
      .from('meditations')
      .insert(sampleMeditations)
      .select();
    
    if (error) {
      console.error('Error inserting sample data:', error);
    } else {
      console.log('Successfully inserted sample data:', data);
    }
  } catch (error) {
    console.error('Exception when inserting sample data:', error);
  }
}

// Run the insert function
insertSampleData(); 