/**
 * AI Meditation Generator Service
 * Generates meditation scripts and audio using AI
 */

import { nanoid } from 'nanoid';
import { MeditationData } from '@/components/MeditationPlayer';

// Types for meditation generation parameters
export interface MeditationGenerationParams {
  duration: number; // in seconds
  focus?: string; // e.g., "anxiety", "sleep", "mindfulness"
  userPrompt?: string; // User's input about their current state or needs
  voice?: string; // Voice type for TTS
  backgroundSound?: string; // e.g., "rain", "nature", "ambient"
}

// Sample meditation themes with descriptions and prompts
export const meditationThemes = [
  {
    id: 'mindfulness',
    name: 'Mindfulness',
    description: 'Present moment awareness and acceptance',
    promptSnippets: [
      'Notice the sensations in your body without judgment',
      'Bring your attention to the present moment',
      'Observe your thoughts like clouds passing in the sky',
      'Focus on the rhythm of your breath'
    ]
  },
  {
    id: 'anxiety-relief',
    name: 'Anxiety Relief',
    description: 'Calm your nervous system and find peace',
    promptSnippets: [
      'With each exhale, release the tension you are holding',
      'Imagine your worries dissolving with each breath',
      'Feel your body becoming heavier and more relaxed',
      'Your anxiety is like a wave that will naturally subside'
    ]
  },
  {
    id: 'sleep',
    name: 'Deep Sleep',
    description: 'Prepare for restful and rejuvenating sleep',
    promptSnippets: [
      'Allow your body to sink deeper into relaxation',
      'With each breath, you drift further into peaceful sleep',
      'Release all thoughts about tomorrow',
      'Feel a wave of sleepiness wash over you'
    ]
  },
  {
    id: 'self-love',
    name: 'Self-Love',
    description: 'Cultivate compassion and acceptance for yourself',
    promptSnippets: [
      'Place a hand over your heart and send yourself warmth',
      'You are worthy of love and compassion just as you are',
      'Acknowledge your strengths and your struggles with kindness',
      'Embrace all parts of yourself with acceptance'
    ]
  },
  {
    id: 'energy',
    name: 'Energy & Vitality',
    description: 'Revitalize your body and mind',
    promptSnippets: [
      'Visualize vibrant energy filling your body',
      'With each breath, feel yourself becoming more alert and alive',
      'Imagine light and warmth spreading through your limbs',
      'Feel your energy centers awakening and brightening'
    ]
  }
];

// AI-generated meditation script sections
const introductions = [
  "Find a comfortable position and allow your body to relax. Take a deep breath in... and exhale fully.",
  "Welcome to this moment of peace. Settle into a position that feels good for your body, and let's begin with a deep breath.",
  "As you begin this meditation, give yourself permission to fully arrive in this moment. Adjust your posture to feel both alert and comfortable.",
  "Allow yourself to be fully present for this meditation. Take a moment to find a comfortable seat or position where you can be both relaxed and alert.",
  "Thank you for taking this time for yourself. Begin by finding a comfortable position where your spine can be tall but relaxed."
];

const breathingExercises = [
  "Breathe in slowly for a count of four... hold briefly... and exhale for a count of six. Feel your body relaxing with each breath.",
  "Take a deep breath in through your nose... filling your lungs completely... and exhale slowly through your mouth, releasing any tension.",
  "Breathe naturally and begin to notice the rhythm of your breath. There's no need to change it, simply observe the natural flow.",
  "Inhale deeply, allowing your abdomen to expand... then exhale completely, drawing your navel toward your spine.",
  "Begin a soothing breath pattern: inhale for four counts, hold for two, exhale for six. Feel the calming effect this has on your nervous system."
];

const bodyScans = [
  "Bring your awareness to your feet... your legs... your hips... your abdomen... your chest... your shoulders... your arms... your hands... your neck... and finally your head. Notice any sensations without judgment.",
  "Starting from the top of your head, slowly scan down through your body, releasing tension in each area as you go. Face, jaw, neck, shoulders, and downward.",
  "Notice where your body makes contact with the floor or chair. Feel the support beneath you as you scan from your toes to the crown of your head.",
  "Bring gentle awareness to any areas of tightness or discomfort in your body. As you breathe, imagine sending your breath to those areas, inviting them to soften.",
  "Feel the weight of your body being supported. Scan from your toes to your head, noticing sensations of heaviness, lightness, warmth, or coolness."
];

const guidedVisualizations = [
  "Imagine yourself in a peaceful garden. Notice the colors, the flowers, the gentle breeze. This is your safe place where you can always return.",
  "Visualize a warm, healing light surrounding your body. With each breath, this light grows stronger, filling you with peace and well-being.",
  "Picture yourself standing by a calm lake. The water reflects the sky perfectly. Feel the tranquility of this scene become part of you.",
  "Imagine a gentle stream of water washing away your stress and worry, leaving you feeling clean, refreshed, and renewed.",
  "Visualize yourself on a mountain top, looking out over a vast landscape. Feel the expansiveness and perspective this view gives you."
];

const closings = [
  "Gradually bring your awareness back to your surroundings. Wiggle your fingers and toes. When you're ready, gently open your eyes, carrying this sense of peace with you.",
  "Begin to deepen your breath, bringing gentle movement back to your body. As you transition back to your day, take this calmness with you.",
  "Slowly return your awareness to the room around you. Notice how you feel now compared to when you began. Carry this awareness forward as you continue with your day.",
  "Take a final deep breath, filling yourself with renewed energy. As you exhale, open your eyes if they've been closed, ready to move forward with clarity.",
  "Before we end, take a moment to appreciate yourself for taking this time for your wellbeing. Gradually reorient to your surroundings, carrying this peaceful feeling with you."
];

/**
 * Generates a meditation script based on the provided parameters
 */
export const generateMeditationScript = async (params: MeditationGenerationParams): Promise<string> => {
  const { duration, focus = 'mindfulness', userPrompt = '' } = params;
  
  // Determine the appropriate length based on duration
  const minutes = Math.floor(duration / 60);
  const repetitions = Math.max(1, Math.floor(minutes / 5));
  
  // Find the theme that matches the focus
  const theme = meditationThemes.find(t => t.id === focus) || meditationThemes[0];
  
  // Select sections based on duration and theme
  const introduction = introductions[Math.floor(Math.random() * introductions.length)];
  const breathingExercise = breathingExercises[Math.floor(Math.random() * breathingExercises.length)];
  
  // For longer meditations, include more content
  let bodyAwareness = '';
  let visualization = '';
  let themeSpecificContent = '';
  
  if (minutes >= 3) {
    bodyAwareness = bodyScans[Math.floor(Math.random() * bodyScans.length)];
  }
  
  if (minutes >= 5) {
    visualization = guidedVisualizations[Math.floor(Math.random() * guidedVisualizations.length)];
    
    // Add theme-specific prompts
    const selectedPrompts = [...theme.promptSnippets]
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.min(repetitions, theme.promptSnippets.length));
    
    themeSpecificContent = selectedPrompts.join("\n\n");
  }
  
  const closing = closings[Math.floor(Math.random() * closings.length)];
  
  // Incorporate user prompt if provided
  let personalizedContent = '';
  if (userPrompt) {
    personalizedContent = `\nAs you continue this meditation, bring to mind your intention: "${userPrompt}". Allow this to guide your practice today.\n\n`;
  }
  
  // Assemble the script with appropriate spacing and pacing
  const script = `
${introduction}

${breathingExercise}

${bodyAwareness}

${personalizedContent}

${themeSpecificContent}

${visualization}

${repetitions > 1 ? 'Continue to breathe mindfully, staying present with each moment...\n\n' : ''}

${closing}
`.trim();

  return script;
};

/**
 * Simulates text-to-speech conversion (in a real app, this would use a TTS service)
 */
export const textToSpeechSimulation = async (text: string, voice: string = 'default'): Promise<string> => {
  // In a real implementation, this would call a TTS service
  // For now we'll return a simulated audio URL
  console.log(`Converting to speech with voice: ${voice}, text length: ${text.length} chars`);
  return Promise.resolve(`/meditations/generated-${nanoid(6)}.mp3`);
};

/**
 * Generates a complete meditation based on parameters
 */
export const generateMeditation = async (params: MeditationGenerationParams): Promise<MeditationData> => {
  // Generate the meditation script
  const script = await generateMeditationScript(params);
  
  // Convert script to audio (simulation)
  const audioSrc = await textToSpeechSimulation(script, params.voice);
  
  // Find theme details
  const theme = meditationThemes.find(t => t.id === params.focus) || meditationThemes[0];
  
  // Create a title based on focus and user input
  let title = `${theme.name} Meditation`;
  if (params.userPrompt) {
    // Extract keywords from user prompt to make a more specific title
    const keywords = params.userPrompt
      .toLowerCase()
      .split(' ')
      .filter(word => word.length > 3 && !['this', 'that', 'with', 'from', 'just'].includes(word))
      .slice(0, 2);
    
    if (keywords.length > 0) {
      // Capitalize first letter of each keyword
      const formattedKeywords = keywords
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      title = `${theme.name} for ${formattedKeywords}`;
    }
  }
  
  // Create meditation data object
  const meditation: MeditationData = {
    id: `ai-generated-${nanoid(8)}`,
    title,
    description: theme.description,
    audioSrc,
    duration: params.duration,
    instructor: "AI Guide",
    category: [theme.name, "AI Generated"],
    coverImage: getCoverImageForTheme(params.focus || 'mindfulness')
  };
  
  return meditation;
};

/**
 * Returns a themed cover image URL based on meditation type
 */
function getCoverImageForTheme(themeId: string): string {
  const images = {
    'mindfulness': 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800&auto=format&fit=crop',
    'anxiety-relief': 'https://images.unsplash.com/photo-1528938102132-4a9276b8e320?w=800&auto=format&fit=crop',
    'sleep': 'https://images.unsplash.com/photo-1611174797137-3cebecb385b3?w=800&auto=format&fit=crop',
    'self-love': 'https://images.unsplash.com/photo-1529693662653-9d480530a697?w=800&auto=format&fit=crop',
    'energy': 'https://images.unsplash.com/photo-1611693769319-931a9d89be28?w=800&auto=format&fit=crop',
    'default': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop'
  };
  
  return images[themeId as keyof typeof images] || images.default;
}

/**
 * Returns a background sound URL based on the selected sound type
 */
export function getBackgroundSoundUrl(soundType: string): string {
  const sounds = {
    'rain': 'https://assets.mixkit.co/music/preview/mixkit-rain-and-thunder-1262.mp3',
    'nature': 'https://assets.mixkit.co/music/preview/mixkit-forest-stream-1186.mp3',
    'ambient': 'https://assets.mixkit.co/music/preview/mixkit-ethereal-fairy-tale-story-852.mp3',
    'default': 'https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3'
  };
  
  return sounds[soundType as keyof typeof sounds] || sounds.default;
} 