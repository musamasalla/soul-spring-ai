// Advanced situation detection system for therapeutic responses

// Define different relationship types for more nuanced detection
export type RelationshipType = 'romantic' | 'family' | 'friendship' | 'workplace' | 'general';
export type SituationSeverity = 'mild' | 'moderate' | 'severe';

// More comprehensive situation model
export interface SituationPattern {
  name: string;
  category: string;
  patterns: RegExp[];
  relatedEmotions: string[];
  severityMarkers: Record<SituationSeverity, string[]>;
  contextualFactors: string[];
  therapeuticApproaches: {
    validation: string[];
    exploration: string[];
    reframing: string[];
    coping: string[];
  };
}

// Define an extensive set of situations with detailed patterns and approaches
export const SITUATION_PATTERNS: SituationPattern[] = [
  {
    name: 'relationship_conflict',
    category: 'interpersonal',
    patterns: [
      /argument/i, /fight/i, /conflict/i, /disagreement/i, /tension/i, /not getting along/i,
      /relationship problem/i, /broke up/i, /breaking up/i, /divorce/i, /separated/i,
      /not speaking/i, /silent treatment/i, /angry with (?:me|him|her|them)/i, 
      /(?:partner|spouse|boyfriend|girlfriend|husband|wife) and I/i
    ],
    relatedEmotions: ['anger', 'sadness', 'anxiety', 'frustration', 'betrayal', 'hurt'],
    severityMarkers: {
      mild: ['minor', 'small', 'little', 'slight', 'disagreement', 'misunderstanding'],
      moderate: ['significant', 'serious', 'ongoing', 'difficult', 'challenging', 'struggle'],
      severe: ['major', 'devastating', 'crisis', 'breaking up', 'divorce', 'separated', 'abusive']
    },
    contextualFactors: [
      'communication patterns', 'trust issues', 'compatibility', 'life transitions', 
      'external stressors', 'different expectations', 'past wounds', 'attachment styles'
    ],
    therapeuticApproaches: {
      validation: [
        "Relationship conflicts can be really painful. It makes sense that you're feeling this way.",
        "Navigating relationship difficulties can be so challenging. Thank you for sharing this.",
        "It sounds like this situation with your relationship is causing you significant distress, which is understandable."
      ],
      exploration: [
        "What do you see as the main source of the conflict in this relationship?",
        "How do conflicts typically unfold between you two? Is there a pattern you've noticed?",
        "What are your needs that aren't being met in this relationship right now?",
        "How have you tried to address these issues so far?"
      ],
      reframing: [
        "Sometimes conflict can actually be an opportunity to understand each other better, though it certainly doesn't feel that way in the moment.",
        "While painful, these moments can sometimes clarify what's truly important to each of you in the relationship.",
        "It sounds like you both have different needs here. That doesn't necessarily mean either of you is wrong."
      ],
      coping: [
        "Taking a temporary pause when conversations get heated can sometimes help - maybe agreeing on a time to return to the discussion.",
        "Finding ways to express your needs clearly without blame can sometimes open more productive conversations.",
        "Taking care of yourself during relationship stress is important - maintaining support systems and self-care practices."
      ]
    }
  },
  {
    name: 'work_stress',
    category: 'occupational',
    patterns: [
      /work stress/i, /job stress/i, /workplace/i, /boss/i, /coworker/i, /colleague/i, 
      /workload/i, /overwhelmed at work/i, /burnout/i, /work-life balance/i, /career/i,
      /fired/i, /laid off/i, /performance review/i, /promotion/i, /work pressure/i,
      /deadline/i, /overtime/i, /difficult client/i, /toxic workplace/i, /unemployment/i
    ],
    relatedEmotions: ['stress', 'anxiety', 'frustration', 'overwhelm', 'inadequacy', 'burnout'],
    severityMarkers: {
      mild: ['busy', 'hectic', 'challenging', 'tight deadline', 'some pressure'],
      moderate: ['significant', 'ongoing', 'difficult', 'affecting sleep', 'constant'],
      severe: ['burnout', 'crisis', 'can\'t function', 'breaking down', 'toxic', 'quitting']
    },
    contextualFactors: [
      'workload', 'management style', 'resources', 'work environment', 
      'work-life balance', 'job security', 'career development', 'workplace culture'
    ],
    therapeuticApproaches: {
      validation: [
        "Work stress can be so overwhelming, especially when it starts affecting other areas of life.",
        "It's completely understandable to feel this way with everything you're handling at work.",
        "The kind of pressure you're describing at work would be challenging for anyone to manage."
      ],
      exploration: [
        "What aspects of your work situation are most stressful for you right now?",
        "How is this work stress affecting other areas of your life?",
        "What would a healthier work situation look like for you?",
        "What resources or support might be available to help with this situation?"
      ],
      reframing: [
        "While you can't always control workplace factors, focusing on what aspects you can influence might help.",
        "This challenging period might be highlighting what's truly important to you in your career.",
        "Sometimes setting boundaries at work, while difficult, can actually improve both wellbeing and performance."
      ],
      coping: [
        "Creating small rituals to separate work from personal time can help maintain boundaries.",
        "Prioritizing tasks and identifying what truly needs your attention can sometimes make workloads more manageable.",
        "Finding moments for brief stress reduction techniques during the workday can help manage ongoing pressure."
      ]
    }
  },
  {
    name: 'anxiety_general',
    category: 'mental_health',
    patterns: [
      /anxious about everything/i, /constant worry/i, /always on edge/i, /anxiety disorder/i,
      /panic attack/i, /anxious thoughts/i, /racing mind/i, /can't relax/i, /restless/i,
      /nervous/i, /worrying too much/i, /health anxiety/i, /social anxiety/i, /phobia/i,
      /fear of/i, /worst-case scenario/i, /catastrophizing/i, /what if/i
    ],
    relatedEmotions: ['anxiety', 'fear', 'panic', 'worry', 'dread', 'nervousness'],
    severityMarkers: {
      mild: ['some', 'occasional', 'a bit', 'slight', 'manageable'],
      moderate: ['significant', 'regular', 'frequent', 'challenging', 'distressing'],
      severe: ['debilitating', 'constant', 'overwhelming', 'panic attacks', 'can\'t function']
    },
    contextualFactors: [
      'triggers', 'physical symptoms', 'avoidance', 'safety behaviors', 
      'thought patterns', 'family history', 'life stressors', 'uncertainty'
    ],
    therapeuticApproaches: {
      validation: [
        "Living with anxiety can be exhausting - it's like your mind is always on high alert.",
        "Anxiety can feel so overwhelming, especially when it affects multiple areas of your life.",
        "The physical and emotional experience of anxiety can be really intense. I hear how difficult this is for you."
      ],
      exploration: [
        "When did you first start noticing these anxiety symptoms?",
        "Are there particular situations that tend to trigger your anxiety?",
        "What happens in your body when you feel anxious?",
        "What strategies have you tried to manage anxiety so far?"
      ],
      reframing: [
        "While anxiety feels terrible, it actually starts as our body's way of trying to protect us from perceived threats.",
        "Anxious thoughts often focus on the worst-case scenarios, but these rarely reflect the most likely outcomes.",
        "Learning to observe anxious thoughts without automatically believing them can create some helpful distance."
      ],
      coping: [
        "Practicing grounding techniques can help bring you back to the present moment when anxiety takes you into future worries.",
        "Gentle physical movement can help release some of the physical tension that comes with anxiety.",
        "Gradually facing feared situations, with support, can help reduce anxiety over time."
      ]
    }
  },
  {
    name: 'grief_loss',
    category: 'life_transition',
    patterns: [
      /grief/i, /loss/i, /died/i, /death/i, /passed away/i, /bereavement/i,
      /funeral/i, /missing (?:him|her|them)/i, /lost my/i, /mourn/i, /anniversary of/i,
      /terminal illness/i, /end of life/i, /widowed/i, /killed/i, /suicide/i
    ],
    relatedEmotions: ['grief', 'sadness', 'shock', 'numbness', 'anger', 'loneliness'],
    severityMarkers: {
      mild: ['coming to terms', 'adjusting', 'healing', 'processing', 'accepting'],
      moderate: ['difficult', 'struggling', 'hard', 'painful', 'challenging'],
      severe: ['devastating', 'unbearable', 'overwhelming', 'traumatic', 'complicated grief']
    },
    contextualFactors: [
      'relationship to deceased', 'circumstances of death', 'support system', 
      'previous losses', 'cultural factors', 'secondary losses', 'meaning-making'
    ],
    therapeuticApproaches: {
      validation: [
        "Grief is such a profound experience. The pain you're feeling reflects the significance of your loss.",
        "Each person's grief journey is unique, and there's no right way to grieve. Your feelings are valid.",
        "Losing someone we love creates a wound that needs time and care to heal."
      ],
      exploration: [
        "What has your grief been like for you? People experience it in many different ways.",
        "Are there particular times or situations when the grief feels most intense?",
        "What memories or qualities of [the person] do you find yourself thinking about most?",
        "How have others responded to your grief? Have you felt supported?"
      ],
      reframing: [
        "While grief is incredibly painful, it's also a testament to your capacity for love and connection.",
        "Grief often comes in waves rather than as a linear process. The intensity will shift over time, even if it doesn't completely disappear.",
        "Finding ways to honor your relationship and carry it forward can be part of the healing journey."
      ],
      coping: [
        "Creating rituals or ways to remember and honor your loved one can sometimes provide comfort.",
        "Being gentle with yourself during grief is important - it takes tremendous energy to process loss.",
        "Finding safe spaces to express your grief, whether through talking, writing, or creative outlets, can be healing."
      ]
    }
  },
  {
    name: 'depression',
    category: 'mental_health',
    patterns: [
      /depress/i, /hopeless/i, /no interest/i, /no motivation/i, /nothing matters/i,
      /can't enjoy/i, /don't care/i, /worthless/i, /not worth/i, /pointless/i, 
      /tired all the time/i, /no energy/i, /don't want to be here/i, /suicidal/i,
      /empty/i, /numb/i, /lost interest/i, /can't feel/i, /darkness/i
    ],
    relatedEmotions: ['sadness', 'emptiness', 'numbness', 'hopelessness', 'worthlessness', 'guilt'],
    severityMarkers: {
      mild: ['feeling down', 'low mood', 'blue', 'sad', 'unmotivated'],
      moderate: ['significant', 'ongoing', 'affecting daily life', 'struggling', 'difficult'],
      severe: ['cannot function', 'suicidal', 'hopeless', 'given up', 'can\'t go on']
    },
    contextualFactors: [
      'duration', 'previous episodes', 'life circumstances', 'support system', 
      'physical health', 'sleep patterns', 'trauma history', 'self-care'
    ],
    therapeuticApproaches: {
      validation: [
        "Depression can be incredibly heavy to carry. I appreciate how much effort it takes just to talk about this.",
        "The way depression affects energy, motivation, and hope can make even simple tasks feel overwhelming.",
        "It makes sense that you're feeling this way, given everything you've described. Depression is a real and serious experience."
      ],
      exploration: [
        "How long have you been feeling this way?",
        "Have you experienced similar periods of depression before?",
        "What does a typical day look like for you right now?",
        "Are there any moments, even brief ones, when you feel slightly less depressed?"
      ],
      reframing: [
        "Depression often lies to us about our worth and future possibilities. These thoughts feel real but aren't necessarily accurate.",
        "Even though it might not feel like it, depression is not a permanent state, though it can certainly feel endless when you're in it.",
        "Taking small steps, even when they feel pointless, can gradually create momentum."
      ],
      coping: [
        "When depression is severe, focusing on very basic self-care - even just getting out of bed or having a glass of water - is an achievement.",
        "Maintaining some kind of routine, even a minimal one, can provide some structure during depressive periods.",
        "Physical movement, even gentle stretching or a short walk, can sometimes help with depressive symptoms."
      ]
    }
  },
  {
    name: 'self_esteem',
    category: 'self_concept',
    patterns: [
      /not good enough/i, /worthless/i, /hate myself/i, /failure/i, /inadequate/i,
      /unlovable/i, /ugly/i, /stupid/i, /incompetent/i, /insecure/i, /can't do anything right/i,
      /everyone else is better/i, /confidence/i, /self-esteem/i, /self-worth/i, /imposter/i,
      /body image/i, /ashamed of/i, /embarrassed by/i, /not measuring up/i
    ],
    relatedEmotions: ['shame', 'inadequacy', 'insecurity', 'disappointment', 'embarrassment'],
    severityMarkers: {
      mild: ['sometimes feel', 'insecure about', 'not confident in', 'doubt myself'],
      moderate: ['often feel', 'struggle with', 'significant issue', 'affecting my life'],
      severe: ['hate myself', 'completely worthless', 'can\'t stand myself', 'disgusting']
    },
    contextualFactors: [
      'early experiences', 'critical voices', 'comparison', 'perfectionism', 
      'achievements', 'feedback', 'social media', 'cultural standards'
    ],
    therapeuticApproaches: {
      validation: [
        "It's really painful to carry such negative feelings about yourself.",
        "Many people struggle with these kinds of thoughts, though it can feel very isolating.",
        "These feelings about yourself sound really distressing. I'm sorry you're experiencing this."
      ],
      exploration: [
        "When did you first start feeling this way about yourself?",
        "Are there particular situations that tend to trigger these negative thoughts?",
        "What would it mean to you if you were 'good enough'?",
        "Is there a different standard you apply to yourself versus others?"
      ],
      reframing: [
        "Our minds often focus on our perceived flaws and minimize our strengths or positive qualities.",
        "These critical thoughts are opinions rather than facts, even though they can feel absolutely true.",
        "Sometimes these harsh self-judgments develop as a way to protect ourselves, but end up causing more pain."
      ],
      coping: [
        "Practicing speaking to yourself with the same kindness you would offer a good friend can help shift self-critical patterns.",
        "Noticing and gently questioning negative self-talk when it arises can create some space from these thoughts.",
        "Focusing on your values rather than achievements can provide a different measure of worth."
      ]
    }
  },
  {
    name: 'trauma',
    category: 'mental_health',
    patterns: [
      /trauma/i, /ptsd/i, /flashback/i, /nightmare/i, /triggered/i, /assault/i,
      /abuse/i, /violence/i, /accident/i, /attack/i, /terrifying/i, /horrible experience/i,
      /can't get it out of my head/i, /intrusive thoughts/i, /hypervigilant/i, /on guard/i
    ],
    relatedEmotions: ['fear', 'anxiety', 'shame', 'numbness', 'anger', 'hyperarousal'],
    severityMarkers: {
      mild: ['bothersome', 'uncomfortable', 'processing', 'working through'],
      moderate: ['significant', 'distressing', 'affecting daily life', 'struggling'],
      severe: ['debilitating', 'overwhelming', 'cannot function', 'flashbacks', 'nightmares']
    },
    contextualFactors: [
      'type of trauma', 'duration', 'age at occurrence', 'support after trauma', 
      'previous trauma', 'current safety', 'triggers', 'coping mechanisms'
    ],
    therapeuticApproaches: {
      validation: [
        "What you experienced was genuinely traumatic, and your reactions are normal responses to an abnormal situation.",
        "Trauma can have profound effects on how we feel, think, and respond to the world around us.",
        "It takes immense courage to speak about traumatic experiences. Thank you for trusting me with this."
      ],
      exploration: [
        "How has this trauma been affecting your daily life?",
        "What helps you feel safe or grounded when you're feeling triggered?",
        "Have you worked with anyone professionally on processing this trauma?",
        "What resources or support do you currently have?"
      ],
      reframing: [
        "Trauma responses, while distressing, actually began as your body and mind's attempts to protect you.",
        "Healing from trauma isn't about erasing what happened, but about reducing its power over your present life.",
        "Many trauma survivors find that while they never forget what happened, the intensity of the reactions can lessen over time."
      ],
      coping: [
        "Grounding techniques can help when you're feeling triggered or experiencing flashbacks.",
        "Establishing safety and stability in your daily life is an important foundation for trauma healing.",
        "Having a clear plan for managing trauma symptoms, especially in triggering situations, can help you feel more in control."
      ]
    }
  },
  {
    name: 'identity_purpose',
    category: 'existential',
    patterns: [
      /who am I/i, /purpose/i, /meaning/i, /direction/i, /lost/i, /identity/i,
      /what's the point/i, /life purpose/i, /meaning of life/i, /existential/i,
      /don't know what I want/i, /searching/i, /authenticity/i, /true self/i,
      /midlife crisis/i, /crossroads/i, /transition/i, /reinvention/i
    ],
    relatedEmotions: ['confusion', 'emptiness', 'longing', 'disconnection', 'curiosity', 'unease'],
    severityMarkers: {
      mild: ['questioning', 'curious about', 'exploring', 'reflecting on'],
      moderate: ['struggling with', 'significantly impacts me', 'important issue', 'wrestle with'],
      severe: ['crisis', 'cannot move forward', 'paralyzed by', 'keeping me up at night']
    },
    contextualFactors: [
      'life stage', 'major transitions', 'cultural context', 'belief systems', 
      'relationships', 'values clarification', 'past roles', 'future aspirations'
    ],
    therapeuticApproaches: {
      validation: [
        "Questions about identity and purpose are deeply human concerns that many people grapple with.",
        "These existential questions can feel both unsettling and important to explore.",
        "It takes courage to examine your life and ask these deeper questions about meaning and purpose."
      ],
      exploration: [
        "What has prompted these questions of identity and purpose for you now?",
        "When you imagine a life with more meaning or purpose, what does that look like?",
        "What activities or experiences have felt most meaningful or authentic to you in the past?",
        "What values are most important to you, regardless of your specific role or circumstances?"
      ],
      reframing: [
        "These periods of questioning, while uncomfortable, can often lead to significant growth and clarity.",
        "Purpose and meaning can emerge gradually through engagement and reflection, rather than through a single revelation.",
        "Sometimes meaning comes not from grand purpose but from small, daily choices aligned with our values."
      ],
      coping: [
        "Exploring new activities or reconnecting with past interests can sometimes offer clues about what feels meaningful.",
        "Writing or reflecting on your values can help clarify what matters most to you beyond specific roles or achievements.",
        "Small experiments with different ways of being or living can provide information about what feels authentic."
      ]
    }
  }
];

// Detect primary situation in text
export function detectSituation(text: string): { 
  situation: string,
  severity: SituationSeverity,
  relatedEmotions: string[],
  category: string
} {
  // Default response
  const defaultResponse = {
    situation: "general life situation",
    severity: "moderate" as SituationSeverity,
    relatedEmotions: ["mixed"],
    category: "general"
  };
  
  if (!text || typeof text !== 'string') {
    return defaultResponse;
  }
  
  const textLower = text.toLowerCase();
  
  // Try to find matching situation
  for (const situation of SITUATION_PATTERNS) {
    for (const pattern of situation.patterns) {
      if (pattern.test(textLower)) {
        // Determine severity
        let severity: SituationSeverity = 'moderate';
        
        // Check for severity markers
        for (const [level, markers] of Object.entries(situation.severityMarkers) as [SituationSeverity, string[]][]) {
          if (markers.some(marker => textLower.includes(marker))) {
            severity = level;
            break;
          }
        }
        
        return {
          situation: situation.name,
          severity: severity,
          relatedEmotions: situation.relatedEmotions,
          category: situation.category
        };
      }
    }
  }
  
  return defaultResponse;
}

// Get therapeutic responses for a situation
export function getSituationResponses(
  situation: string, 
  approachType: 'validation' | 'exploration' | 'reframing' | 'coping' = 'validation'
): string[] {
  const situationPattern = SITUATION_PATTERNS.find(s => s.name === situation);
  
  if (!situationPattern) {
    // Default general responses
    return [
      "That sounds like a challenging situation. Could you tell me more about what you're experiencing?",
      "I appreciate you sharing this with me. How has this situation been affecting you?",
      "Thank you for opening up about this. What aspects of this situation feel most difficult right now?"
    ];
  }
  
  return situationPattern.therapeuticApproaches[approachType];
}

// Generate a response based on detected situation and approach type
export function generateSituationalResponse(
  text: string, 
  approachType: 'validation' | 'exploration' | 'reframing' | 'coping' = 'validation'
): string {
  const detectedSituation = detectSituation(text);
  const responses = getSituationResponses(detectedSituation.situation, approachType);
  
  // Select a random response from the appropriate category
  return responses[Math.floor(Math.random() * responses.length)];
} 