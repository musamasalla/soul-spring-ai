// Advanced emotion detection system for therapeutic responses

// Different levels of emotional intensity
export type EmotionIntensity = 'mild' | 'moderate' | 'strong';

// Comprehensive emotion model with categories, patterns, and responses
export interface EmotionPattern {
  name: string;
  category: string;
  patterns: RegExp[];
  intensityMarkers: Record<EmotionIntensity, string[]>;
  somaticExperiences: string[];
  therapeuticResponses: {
    validation: string[];
    exploration: string[];
    support: string[];
  };
}

// Define a robust set of emotions with detailed patterns and responses
export const EMOTION_PATTERNS: EmotionPattern[] = [
  {
    name: 'anxiety',
    category: 'fear-based',
    patterns: [
      /anxious/i, /nervous/i, /worry/i, /scared/i, /fear/i, /stress/i, /panic/i,
      /overwhelm/i, /afraid/i, /uneasy/i, /dread/i, /tense/i, /apprehensive/i,
      /on edge/i, /restless/i, /agitated/i, /worried/i, /freaking out/i
    ],
    intensityMarkers: {
      mild: ['a bit', 'slightly', 'somewhat', 'a little', 'mild'],
      moderate: ['quite', 'rather', 'pretty', 'moderately', 'fairly'],
      strong: ['extremely', 'severely', 'intensely', 'overwhelmingly', 'unbearably', 'terrified']
    },
    somaticExperiences: [
      'racing heart', 'chest tightness', 'difficulty breathing', 'sweating', 
      'trembling', 'nausea', 'dizziness', 'muscle tension', 'restlessness'
    ],
    therapeuticResponses: {
      validation: [
        "I hear that you're feeling anxious right now. That's a really normal response when facing uncertainty.",
        "Anxiety can be really uncomfortable, and I appreciate you sharing these feelings with me.",
        "It makes sense that you'd feel anxious in this situation - our bodies respond to perceived threats this way."
      ],
      exploration: [
        "When you feel anxious, where do you notice it most in your body?",
        "What thoughts tend to come up when you're feeling this anxiety?",
        "On a scale of 1-10, how would you rate your anxiety right now?",
        "Have you noticed any patterns about when this anxiety tends to show up?"
      ],
      support: [
        "Taking some slow, deep breaths might help in this moment. Would you like to try that together?",
        "Many people find grounding exercises helpful for anxiety. Would it be useful to explore some of those?",
        "It can help to remind yourself that anxiety, while uncomfortable, is temporary and will pass."
      ]
    }
  },
  {
    name: 'sadness',
    category: 'depressive',
    patterns: [
      /sad/i, /depress/i, /down/i, /unhappy/i, /miserable/i, /hopeless/i,
      /despair/i, /grief/i, /heartbroken/i, /empty/i, /blue/i, /low/i,
      /lonely/i, /melanchol/i, /gloomy/i, /somber/i, /despondent/i, /discouraged/i
    ],
    intensityMarkers: {
      mild: ['a bit', 'slightly', 'somewhat', 'a little', 'mild'],
      moderate: ['quite', 'rather', 'pretty', 'moderately', 'fairly'],
      strong: ['extremely', 'severely', 'intensely', 'overwhelmingly', 'unbearably', 'devastated']
    },
    somaticExperiences: [
      'heaviness', 'fatigue', 'lack of energy', 'aches', 'tearfulness', 
      'difficulty getting out of bed', 'loss of appetite', 'sleeping too much'
    ],
    therapeuticResponses: {
      validation: [
        "I can hear the sadness in what you're sharing. It's really hard to carry that heaviness.",
        "Feeling sad after what you've described makes complete sense. Your feelings are valid.",
        "Sadness can be so difficult to sit with. Thank you for trusting me with these feelings."
      ],
      exploration: [
        "How long have you been feeling this sadness?",
        "What does your sadness feel like in your body?",
        "Are there moments when the sadness feels lighter or heavier?",
        "What tends to bring on these feelings of sadness for you?"
      ],
      support: [
        "Being gentle with yourself when feeling sad is important. What small act of self-care might feel possible today?",
        "Sometimes expressing sadness - through talking, writing, art, or tears - can provide some relief.",
        "While it might not feel like it now, emotions do shift and change. This sadness won't feel this intense forever."
      ]
    }
  },
  {
    name: 'anger',
    category: 'frustration',
    patterns: [
      /angry/i, /mad/i, /furious/i, /irritat/i, /frustrat/i, /resent/i,
      /hate/i, /rage/i, /bitter/i, /annoy/i, /upset/i, /hostile/i,
      /outrage/i, /irate/i, /livid/i, /enraged/i, /incensed/i, /exasperated/i
    ],
    intensityMarkers: {
      mild: ['a bit', 'slightly', 'somewhat', 'a little', 'mild'],
      moderate: ['quite', 'rather', 'pretty', 'moderately', 'fairly'],
      strong: ['extremely', 'severely', 'intensely', 'overwhelmingly', 'unbearably', 'furious']
    },
    somaticExperiences: [
      'heat', 'tension', 'clenched jaw', 'headache', 'raised voice', 
      'racing heart', 'clenched fists', 'tightness in chest or stomach'
    ],
    therapeuticResponses: {
      validation: [
        "I can understand why you'd feel angry in this situation. Your reaction makes sense.",
        "Anger is often a signal that something important to us has been threatened or violated.",
        "It's completely natural to feel anger when we've been treated unfairly or disrespected."
      ],
      exploration: [
        "What does your anger feel like in your body right now?",
        "If your anger could speak, what would it be saying?",
        "Is there something beneath the anger - perhaps hurt or fear - that you're also feeling?",
        "What would feel like a satisfying way to express this anger?"
      ],
      support: [
        "Anger carries important information about our needs and boundaries. What might your anger be trying to protect?",
        "Finding safe ways to express anger, like physical activity or creative outlets, can sometimes help.",
        "Taking a moment to breathe deeply can help create some space between feeling anger and acting on it."
      ]
    }
  },
  {
    name: 'fear',
    category: 'fear-based',
    patterns: [
      /terrified/i, /horrified/i, /petrified/i, /frightened/i, /scared/i, /afraid/i,
      /fearful/i, /spooked/i, /alarmed/i, /dread/i, /terror/i, /phobia/i
    ],
    intensityMarkers: {
      mild: ['a bit', 'slightly', 'somewhat', 'a little', 'mild'],
      moderate: ['quite', 'rather', 'pretty', 'moderately', 'fairly'],
      strong: ['extremely', 'severely', 'intensely', 'overwhelmingly', 'unbearably', 'petrified']
    },
    somaticExperiences: [
      'freezing', 'inability to move', 'racing heart', 'shallow breathing', 
      'tunnel vision', 'feeling cold', 'shaking', 'wanting to hide'
    ],
    therapeuticResponses: {
      validation: [
        "It makes sense that you feel afraid, given what you've described. Fear is our body's way of trying to keep us safe.",
        "Fear can be such an overwhelming emotion. I appreciate you sharing this with me.",
        "When we perceive a threat, fear is a natural and protective response."
      ],
      exploration: [
        "What feels most frightening about this situation?",
        "When you feel this fear, what happens in your body?",
        "What would help you feel safer right now?",
        "Has there been a time when you've faced fear and moved through it?"
      ],
      support: [
        "Sometimes reminding ourselves that we're physically safe in this moment can help with fear.",
        "Grounding techniques - like noticing five things you can see right now - can help when fear feels overwhelming.",
        "It's okay to take things one small step at a time when facing something frightening."
      ]
    }
  },
  {
    name: 'shame',
    category: 'self-conscious',
    patterns: [
      /shame/i, /embarrass/i, /humiliat/i, /mortif/i, /disgrace/i, /guilt/i,
      /regret/i, /remorse/i, /ashamed/i, /self-conscious/i, /exposed/i, /judged/i
    ],
    intensityMarkers: {
      mild: ['a bit', 'slightly', 'somewhat', 'a little', 'mild'],
      moderate: ['quite', 'rather', 'pretty', 'moderately', 'fairly'],
      strong: ['extremely', 'severely', 'intensely', 'overwhelmingly', 'unbearably', 'mortified']
    },
    somaticExperiences: [
      'hot face', 'wanting to hide', 'looking down', 'feeling small', 
      'heaviness', 'hollowness', 'tightness in throat', 'nausea'
    ],
    therapeuticResponses: {
      validation: [
        "Shame can feel so isolating, but it's something we all experience at times.",
        "It takes courage to talk about feelings of shame. I appreciate your openness.",
        "These feelings of shame are real and painful, but they don't define who you are."
      ],
      exploration: [
        "Where do you feel this shame in your body?",
        "What messages or beliefs about yourself come with this shame?",
        "When did you first start feeling this way?",
        "How would you respond to a friend who shared they were feeling this same shame?"
      ],
      support: [
        "Shame often diminishes when we share it with someone who responds with empathy. You're not alone in this.",
        "Self-compassion can be an antidote to shame. What might a kind response to yourself look like here?",
        "Shame often tells us we are fundamentally flawed, but making mistakes is part of being human."
      ]
    }
  },
  {
    name: 'joy',
    category: 'positive',
    patterns: [
      /joy/i, /happy/i, /delight/i, /excite/i, /thrill/i, /ecsta/i,
      /elat/i, /glad/i, /cheer/i, /content/i, /bliss/i, /pleased/i
    ],
    intensityMarkers: {
      mild: ['a bit', 'slightly', 'somewhat', 'a little', 'mild'],
      moderate: ['quite', 'rather', 'pretty', 'moderately', 'fairly'],
      strong: ['extremely', 'truly', 'incredibly', 'absolutely', 'completely', 'ecstatic']
    },
    somaticExperiences: [
      'lightness', 'energy', 'smiling', 'laughing', 'warmth', 
      'openness', 'brightness', 'relaxed muscles'
    ],
    therapeuticResponses: {
      validation: [
        "I can hear the joy in what you're sharing. That sounds like a really positive experience.",
        "It's wonderful to hear you feeling happy about this. Those positive feelings are so important.",
        "That sounds like a genuinely joyful moment. It's great that you're recognizing and savoring it."
      ],
      exploration: [
        "What does this happiness feel like in your body?",
        "What contributes most to this feeling of joy?",
        "How might you hold onto or revisit this feeling in more difficult moments?",
        "Are there ways you could create more opportunities for this kind of joy?"
      ],
      support: [
        "Savoring positive emotions by really noticing and appreciating them can actually extend them.",
        "It can be helpful to create a mental snapshot of this feeling to return to during harder times.",
        "Sharing joy with others can often amplify it. Is there someone you might share this experience with?"
      ]
    }
  },
  {
    name: 'loneliness',
    category: 'depressive',
    patterns: [
      /lonely/i, /alone/i, /isolat/i, /abandon/i, /reject/i, /disconnected/i,
      /unwanted/i, /left out/i, /miss/i, /no friends/i, /solitary/i,
      /companionship/i, /detached/i, /separated/i, /estranged/i
    ],
    intensityMarkers: {
      mild: ['a bit', 'slightly', 'somewhat', 'a little', 'mild'],
      moderate: ['quite', 'rather', 'pretty', 'moderately', 'fairly'],
      strong: ['extremely', 'severely', 'intensely', 'overwhelmingly', 'unbearably', 'completely']
    },
    somaticExperiences: [
      'emptiness', 'heaviness', 'hollowness', 'ache', 'coldness', 
      'numbness', 'tightness in chest', 'lump in throat'
    ],
    therapeuticResponses: {
      validation: [
        "Loneliness can be such a painful feeling. It's a difficult emotion to sit with.",
        "Many people experience loneliness, even when surrounded by others. It's about a sense of connection.",
        "Feeling lonely is a sign that connection is important to you, which is a very human need."
      ],
      exploration: [
        "How long have you been feeling this loneliness?",
        "Are there particular situations when the loneliness feels strongest?",
        "What kinds of connections would feel most meaningful to you right now?",
        "Have there been times when you've felt more connected? What was different?"
      ],
      support: [
        "Small steps toward connection can sometimes help with loneliness - even brief interactions or reaching out to one person.",
        "Sometimes connecting through shared activities or interests can feel less vulnerable than direct socializing.",
        "Being kind to yourself when feeling lonely is important - this is a hard feeling that many people struggle with."
      ]
    }
  },
  {
    name: 'overwhelmed',
    category: 'stress',
    patterns: [
      /overwhelm/i, /too much/i, /can't cope/i, /can't handle/i, /drowning/i, /buried/i,
      /swamped/i, /overload/i, /stretched thin/i, /at my limit/i, /breaking point/i,
      /can't keep up/i, /burning out/i, /maxed out/i, /spread too thin/i
    ],
    intensityMarkers: {
      mild: ['a bit', 'slightly', 'somewhat', 'a little', 'mild'],
      moderate: ['quite', 'rather', 'pretty', 'moderately', 'fairly'],
      strong: ['extremely', 'severely', 'intensely', 'totally', 'completely', 'utterly']
    },
    somaticExperiences: [
      'tension', 'headache', 'racing thoughts', 'inability to focus', 
      'fatigue', 'shallow breathing', 'tight shoulders', 'digestive issues'
    ],
    therapeuticResponses: {
      validation: [
        "It sounds like you're carrying a really heavy load right now. That feeling of being overwhelmed is exhausting.",
        "When we have too many demands and not enough resources, feeling overwhelmed is a natural response.",
        "It makes sense that you're feeling overwhelmed with everything you've described. Anyone would feel that way."
      ],
      exploration: [
        "What's contributing most to this feeling of being overwhelmed?",
        "What does being overwhelmed feel like in your body?",
        "What would help you feel even slightly more manageable right now?",
        "Are there any small things you could let go of, even temporarily?"
      ],
      support: [
        "Sometimes breaking things down into very small, manageable steps can help when we're feeling overwhelmed.",
        "Taking even a brief pause - just a few mindful breaths - can create a moment of space when everything feels too much.",
        "It's okay to prioritize what's truly essential right now and let some other things slide."
      ]
    }
  }
];

// Detect primary emotion in text
export function detectEmotion(text: string): { 
  emotion: string,
  intensity: EmotionIntensity,
  somaticExperiences: string[],
  category: string
} {
  // Default response
  const defaultResponse = {
    emotion: "mixed emotions",
    intensity: "moderate" as EmotionIntensity,
    somaticExperiences: [],
    category: "general"
  };
  
  if (!text || typeof text !== 'string') {
    return defaultResponse;
  }
  
  const textLower = text.toLowerCase();
  
  // Try to find matching emotions
  for (const emotion of EMOTION_PATTERNS) {
    for (const pattern of emotion.patterns) {
      if (pattern.test(textLower)) {
        // Determine intensity
        let intensity: EmotionIntensity = 'moderate';
        
        // Check for intensity markers
        for (const [level, markers] of Object.entries(emotion.intensityMarkers) as [EmotionIntensity, string[]][]) {
          if (markers.some(marker => textLower.includes(marker))) {
            intensity = level;
            break;
          }
        }
        
        // Check for somatic experiences
        const experiencesFound = emotion.somaticExperiences.filter(exp => 
          textLower.includes(exp)
        );
        
        return {
          emotion: emotion.name,
          intensity: intensity,
          somaticExperiences: experiencesFound,
          category: emotion.category
        };
      }
    }
  }
  
  return defaultResponse;
}

// Get therapeutic responses for an emotion
export function getTherapeuticResponses(
  emotion: string, 
  responseType: 'validation' | 'exploration' | 'support' = 'validation'
): string[] {
  const emotionPattern = EMOTION_PATTERNS.find(e => e.name === emotion);
  
  if (!emotionPattern) {
    // Default general responses
    return [
      "I'm here to listen. Could you tell me more about what you're experiencing?",
      "Thank you for sharing that with me. How are you feeling about this situation?",
      "I appreciate you opening up. What would be most helpful for us to focus on?"
    ];
  }
  
  return emotionPattern.therapeuticResponses[responseType];
}

// Generate a response based on detected emotion and type
export function generateEmotionalResponse(
  text: string, 
  responseType: 'validation' | 'exploration' | 'support' = 'validation'
): string {
  const detectedEmotion = detectEmotion(text);
  const responses = getTherapeuticResponses(detectedEmotion.emotion, responseType);
  
  // Select a random response from the appropriate category
  return responses[Math.floor(Math.random() * responses.length)];
} 