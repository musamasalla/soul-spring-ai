// Advanced therapeutic micro-skills for enhancing AI responses

// Define the different types of therapeutic micro-skills
export type MicroSkillType = 
  | 'empathic_reflection' 
  | 'validation' 
  | 'open_questions' 
  | 'clarification' 
  | 'summary' 
  | 'reframing'
  | 'affirmation'
  | 'gentle_challenge'
  | 'normalization'
  | 'silence_space'
  | 'self_disclosure'
  | 'immediacy';

// Interface for therapeutic micro-skills
export interface TherapyMicroSkill {
  type: MicroSkillType;
  description: string;
  purpose: string;
  examples: string[];
  template: string;
  appropriateFor: {
    situations: string[];
    emotions: string[];
    stages: string[];
  };
}

// Collection of therapeutic micro-skills used in various therapy modalities
export const THERAPY_MICRO_SKILLS: TherapyMicroSkill[] = [
  {
    type: 'empathic_reflection',
    description: 'Reflect back the emotional content of what the client has shared',
    purpose: 'To demonstrate understanding and help clients feel heard',
    examples: [
      "It sounds like you're feeling overwhelmed by all these responsibilities.",
      "I hear that you're feeling a deep sadness about this loss.",
      "It seems like this situation has left you feeling angry and unappreciated."
    ],
    template: "It sounds like you're feeling {{emotion}} about {{situation}}.",
    appropriateFor: {
      situations: ['all'],
      emotions: ['all'],
      stages: ['opening', 'assessment', 'intervention', 'closing']
    }
  },
  {
    type: 'validation',
    description: "Acknowledge that the client's feelings and experiences are understandable",
    purpose: 'To normalize emotions and reduce shame or isolation',
    examples: [
      "It makes perfect sense that you'd feel anxious in that situation.",
      "Anyone would struggle with those kinds of pressures.",
      "Your reaction is a very natural response to what you've been through."
    ],
    template: "It's completely understandable that you would feel {{emotion}} given {{situation}}. Many people would respond similarly.",
    appropriateFor: {
      situations: ['all'],
      emotions: ['all'],
      stages: ['opening', 'assessment', 'intervention']
    }
  },
  {
    type: 'open_questions',
    description: 'Ask questions that cannot be answered with yes/no',
    purpose: 'To explore thoughts, feelings, and experiences in greater depth',
    examples: [
      "What was going through your mind when that happened?",
      "How did you feel about that decision?",
      "What aspects of this situation are most challenging for you?"
    ],
    template: "{{question_starter}} {{exploratory_focus}}?",
    appropriateFor: {
      situations: ['all'],
      emotions: ['all'],
      stages: ['assessment', 'intervention']
    }
  },
  {
    type: 'clarification',
    description: 'Ask for more information to better understand',
    purpose: 'To ensure accurate understanding and show attentiveness',
    examples: [
      "Could you tell me more about what happened after that?",
      "I'm not sure I fully understand – could you elaborate on that point?",
      "When you say you felt 'weird' – what did that feel like specifically?"
    ],
    template: "Could you tell me more about {{specific_aspect}}? I want to make sure I understand correctly.",
    appropriateFor: {
      situations: ['all'],
      emotions: ['all'],
      stages: ['assessment', 'intervention']
    }
  },
  {
    type: 'summary',
    description: 'Concisely recap key points from the conversation',
    purpose: 'To organize information, check understanding, and transition topics',
    examples: [
      "So far, we've talked about your conflict with your boss and how it's affecting your sleep.",
      "Let me make sure I understand - you're feeling anxious about the upcoming presentation, and you've noticed this is similar to patterns from your past.",
      "It sounds like there are three main concerns you're bringing today: your relationship, your career direction, and these panic symptoms."
    ],
    template: "So from what I understand, {{summary_points}}. Have I understood correctly?",
    appropriateFor: {
      situations: ['all'],
      emotions: ['all'],
      stages: ['assessment', 'intervention', 'closing']
    }
  },
  {
    type: 'reframing',
    description: 'Offer an alternative perspective on a situation',
    purpose: 'To help clients see situations in a new, potentially more helpful light',
    examples: [
      "While this setback feels like a failure, it could also be seen as valuable information about what approach doesn't work for you.",
      "I wonder if what you see as 'being weak' might actually be your capacity for emotional honesty?",
      "Perhaps these arguments aren't signs that the relationship is failing, but opportunities to learn how to communicate better?"
    ],
    template: "I wonder if we might look at this differently - {{alternative_perspective}}. What do you think about seeing it that way?",
    appropriateFor: {
      situations: ['all'],
      emotions: ['all'],
      stages: ['intervention']
    }
  },
  {
    type: 'affirmation',
    description: 'Recognize client strengths, efforts, or positive qualities',
    purpose: 'To build self-efficacy and highlight resources',
    examples: [
      "It takes a lot of courage to talk about these difficult experiences.",
      "I'm struck by how persistent you've been despite these obstacles.",
      "The care you show for others really comes through in how you describe this situation."
    ],
    template: "I notice {{positive_quality_or_action}}, which shows real {{strength}}.",
    appropriateFor: {
      situations: ['all'],
      emotions: ['all'],
      stages: ['opening', 'intervention', 'closing']
    }
  },
  {
    type: 'gentle_challenge',
    description: 'Respectfully question assumptions or patterns',
    purpose: 'To help clients examine unhelpful beliefs or behaviors',
    examples: [
      "I'm curious about the belief that you must always be perfect. Where did that standard come from?",
      "You mentioned that expressing needs is selfish, but I wonder if that's always true?",
      "I notice you often take responsibility for others' feelings. What would happen if you didn't?"
    ],
    template: "I notice that {{observation_about_pattern}}. I'm wondering {{gentle_question_about_pattern}}?",
    appropriateFor: {
      situations: ['relationship_conflict', 'work_stress', 'self_esteem', 'identity_purpose'],
      emotions: ['anxiety', 'shame', 'guilt', 'inadequacy'],
      stages: ['intervention']
    }
  },
  {
    type: 'normalization',
    description: 'Inform clients that their experiences or reactions are common',
    purpose: 'To reduce isolation and shame',
    examples: [
      "Many people find themselves replaying conversations and worrying about what they said.",
      "Grief often comes in waves, and it's very common to feel fine one moment and overwhelmed the next.",
      "It's actually quite normal to feel both love and anger toward family members."
    ],
    template: "Many people experience {{common_experience}}. It's a natural part of {{situation_or_context}}.",
    appropriateFor: {
      situations: ['anxiety_general', 'grief_loss', 'depression', 'trauma'],
      emotions: ['anxiety', 'sadness', 'shame', 'guilt', 'fear'],
      stages: ['assessment', 'intervention']
    }
  },
  {
    type: 'silence_space',
    description: 'Allow comfortable pauses for reflection',
    purpose: 'To give clients time to process emotions or insights',
    examples: [
      "Let's take a moment to sit with that realization.",
      "I'm here with you as you process this difficult emotion.",
      "Take whatever time you need before we continue."
    ],
    template: "{{acknowledgment_of_significance}}. Take the time you need to process this.",
    appropriateFor: {
      situations: ['grief_loss', 'trauma', 'identity_purpose'],
      emotions: ['sadness', 'grief', 'confusion', 'overwhelm'],
      stages: ['intervention']
    }
  },
  {
    type: 'self_disclosure',
    description: 'Share relevant professional insights (not personal details)',
    purpose: 'To normalize, build rapport, or provide perspective',
    examples: [
      "Many clients I've worked with have described similar feelings in these situations.",
      "This is a pattern I've seen before, where early experiences shape current reactions.",
      "From my perspective, what you're describing sounds like a common anxiety response."
    ],
    template: "{{professional_observation_about_common_patterns}}.",
    appropriateFor: {
      situations: ['anxiety_general', 'depression', 'relationship_conflict', 'self_esteem'],
      emotions: ['anxiety', 'sadness', 'shame', 'loneliness'],
      stages: ['intervention']
    }
  },
  {
    type: 'immediacy',
    description: "Comment on what's happening in the therapeutic relationship right now",
    purpose: 'To address dynamics in the therapeutic relationship or process',
    examples: [
      "I notice you seem hesitant to talk about this topic. I wonder if that's happening between us right now?",
      "I sense that you might be feeling uncomfortable with the direction of our conversation.",
      "It feels like something important just shifted in our conversation. Did you notice that too?"
    ],
    template: "I notice {{observation_about_current_interaction}}. What's your experience of this right now?",
    appropriateFor: {
      situations: ['relationship_conflict', 'self_esteem', 'trauma'],
      emotions: ['anger', 'anxiety', 'shame', 'disconnection'],
      stages: ['intervention']
    }
  }
];

// Select appropriate therapeutic micro-skills based on context
export function selectTherapeuticSkills(
  stage: string,
  emotion: string,
  situation: string,
  count: number = 2
): TherapyMicroSkill[] {
  // Filter skills appropriate for this context
  const appropriateSkills = THERAPY_MICRO_SKILLS.filter(skill => {
    const emotionMatch = skill.appropriateFor.emotions.includes('all') || 
                         skill.appropriateFor.emotions.includes(emotion);
    
    const situationMatch = skill.appropriateFor.situations.includes('all') || 
                          skill.appropriateFor.situations.includes(situation);
    
    const stageMatch = skill.appropriateFor.stages.includes(stage);
    
    return emotionMatch && situationMatch && stageMatch;
  });
  
  // If no matches, return generic skills
  if (appropriateSkills.length === 0) {
    return [
      THERAPY_MICRO_SKILLS.find(skill => skill.type === 'empathic_reflection')!,
      THERAPY_MICRO_SKILLS.find(skill => skill.type === 'open_questions')!
    ].filter(Boolean);
  }
  
  // Shuffle array to get random selection
  const shuffled = [...appropriateSkills].sort(() => 0.5 - Math.random());
  
  // Return requested number of skills
  return shuffled.slice(0, count);
}

// Question starters for open-ended questions
export const QUESTION_STARTERS = [
  "What brings you to",
  "How would you describe",
  "What was it like when",
  "How did you feel about",
  "What do you think about",
  "How do you make sense of",
  "What stands out to you about",
  "When you think about",
  "How might you",
  "What would it mean if",
  "How do you imagine",
  "What's your experience of",
  "What do you notice about",
  "How does that impact",
  "What would be helpful for"
];

// Exploratory focuses for open-ended questions
export const EXPLORATORY_FOCUSES = [
  "your thoughts on this situation",
  "the feelings that come up for you",
  "your reaction to that event",
  "what you need right now",
  "the most challenging part of this",
  "how this relates to patterns in your life",
  "your hopes for the future",
  "what you value most",
  "how this has affected your relationships",
  "what support might be helpful",
  "how you've coped with similar situations",
  "what steps you might take next",
  "your strengths in handling this",
  "how your perspective has changed",
  "what you've learned about yourself"
];

// Function to generate a therapeutic open question
export function generateOpenQuestion(): string {
  const starter = QUESTION_STARTERS[Math.floor(Math.random() * QUESTION_STARTERS.length)];
  const focus = EXPLORATORY_FOCUSES[Math.floor(Math.random() * EXPLORATORY_FOCUSES.length)];
  
  return `${starter} ${focus}?`;
}

// Function to generate responses with therapeutic micro-skills
export function generateTherapeuticResponse(
  userMessage: string,
  stage: string,
  emotion: string,
  situation: string
): string {
  // Select appropriate skills based on context
  const selectedSkills = selectTherapeuticSkills(stage, emotion, situation, 2);
  
  let response = "";
  
  // Apply each selected skill in sequence
  selectedSkills.forEach(skill => {
    switch (skill.type) {
      case 'empathic_reflection':
        response += skill.examples[Math.floor(Math.random() * skill.examples.length)] + " ";
        break;
        
      case 'validation':
        response += skill.examples[Math.floor(Math.random() * skill.examples.length)] + " ";
        break;
        
      case 'open_questions':
        response += generateOpenQuestion() + " ";
        break;
        
      case 'normalization':
        response += skill.examples[Math.floor(Math.random() * skill.examples.length)] + " ";
        break;
        
      default:
        response += skill.examples[Math.floor(Math.random() * skill.examples.length)] + " ";
    }
  });
  
  return response.trim();
} 