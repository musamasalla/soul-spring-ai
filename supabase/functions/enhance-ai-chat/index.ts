import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { enhanceResponse } from './enhance-response.ts';

// CORS headers for browser access
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Response templates with therapeutic context
const RESPONSE_TEMPLATES = [
  // Empathetic responses
  "I understand that you're feeling {emotion}. It's completely normal to experience these emotions when {situation}.",
  "It sounds like you're going through a difficult time with {situation}. How long have you been feeling this way?",
  "Thank you for sharing that with me. When you say you feel {emotion}, could you tell me more about what triggers these feelings?",
  
  // Validation responses
  "Your feelings are valid, and it takes courage to talk about {situation}. How have you been coping with these emotions?",
  "It's understandable to feel {emotion} in your situation. Many people experience similar feelings when facing {situation}.",
  "I'm hearing that {situation} has been impacting you significantly. Would you like to explore some strategies that might help?",
  
  // Reflection responses
  "From what you've shared, it seems like {situation} is causing you to feel {emotion}. Is that accurate?",
  "I'm noticing that when you talk about {situation}, you express feeling {emotion}. How does this affect your daily life?",
  "You mentioned {situation} several times. This seems to be important to you. Could we explore why this matters so much?",
  
  // Guidance responses
  "Some people find that mindfulness techniques help with {emotion}. Would you be interested in learning a quick exercise?",
  "Have you considered how your thoughts about {situation} might be influencing your feelings? We could explore this connection.",
  "Sometimes, {emotion} can be managed by adjusting our perspective on {situation}. Would you like to explore different ways of looking at this?",
  
  // Goal-oriented responses
  "What would feeling better about {situation} look like for you?",
  "If we were to work on addressing your {emotion}, what small step could you take this week?",
  "Imagine that {situation} was resolved. How would your life be different?",
  
  // Support responses
  "It's brave of you to share these feelings about {situation}. What kind of support do you have in your life right now?",
  "Taking care of your mental health while dealing with {situation} is important. Have you been able to practice any self-care?",
  "Remember that healing is not linear, and it's okay to have ups and downs as you work through {emotion}."
];

// Define emotion detection patterns
const EMOTION_PATTERNS: Record<string, RegExp[]> = {
  "anxiety": [
    /anxious/i, /nervous/i, /worry/i, /scared/i, /fear/i, /stress/i, /panic/i,
    /overwhelm/i, /afraid/i, /uneasy/i, /dread/i, /tense/i
  ],
  "sadness": [
    /sad/i, /depress/i, /down/i, /unhappy/i, /miserable/i, /hopeless/i,
    /despair/i, /grief/i, /heartbroken/i, /empty/i, /blue/i, /low/i
  ],
  "anger": [
    /angry/i, /mad/i, /furious/i, /irritat/i, /frustrat/i, /resent/i,
    /hate/i, /rage/i, /bitter/i, /annoy/i, /upset/i, /hostile/i
  ],
  "confusion": [
    /confus/i, /uncertain/i, /unsure/i, /lost/i, /don't understand/i,
    /unclear/i, /don't know/i, /perplex/i, /bewildered/i, /doubt/i
  ],
  "loneliness": [
    /lonely/i, /alone/i, /isolat/i, /abandon/i, /reject/i, /disconnected/i,
    /unwanted/i, /left out/i, /miss/i, /no friends/i, /solitary/i
  ],
  "worthlessness": [
    /worthless/i, /useless/i, /failure/i, /inadequate/i, /not good enough/i,
    /incompetent/i, /undeserving/i, /burden/i, /pathetic/i, /hopeless/i
  ],
  "exhaustion": [
    /tired/i, /exhaust/i, /fatigue/i, /drain/i, /burnout/i, /no energy/i,
    /worn out/i, /weary/i, /overwhelmed/i, /sleepy/i, /lethargic/i
  ],
  "hope": [
    /hope/i, /optimist/i, /better/i, /improve/i, /positive/i, /look forward/i,
    /excited/i, /anticipat/i, /progress/i, /encouraging/i, /optimism/i
  ]
};

// Define situation detection patterns
const SITUATION_PATTERNS: Record<string, RegExp[]> = {
  "relationships": [
    /relationship/i, /partner/i, /boyfriend/i, /girlfriend/i, /spouse/i,
    /husband/i, /wife/i, /divorce/i, /breakup/i, /dating/i, /married/i
  ],
  "work stress": [
    /work/i, /job/i, /career/i, /boss/i, /coworker/i, /office/i,
    /deadline/i, /fired/i, /unemployed/i, /workplace/i, /profession/i
  ],
  "family issues": [
    /family/i, /parent/i, /mother/i, /father/i, /sister/i, /brother/i,
    /child/i, /son/i, /daughter/i, /relative/i, /grandparent/i, /in-law/i
  ],
  "health concerns": [
    /health/i, /sick/i, /illness/i, /pain/i, /doctor/i, /hospital/i,
    /disease/i, /condition/i, /symptom/i, /diagnosis/i, /treatment/i
  ],
  "financial problems": [
    /money/i, /financial/i, /debt/i, /bill/i, /expense/i, /afford/i,
    /budget/i, /cost/i, /saving/i, /income/i, /payment/i, /loan/i
  ],
  "self-esteem": [
    /self-esteem/i, /confidence/i, /insecure/i, /unworthy/i, /ugly/i,
    /fat/i, /stupid/i, /hate myself/i, /not good enough/i, /body image/i
  ],
  "social difficulties": [
    /friend/i, /social/i, /talk to people/i, /awkward/i, /shy/i,
    /reject/i, /bullied/i, /left out/i, /fit in/i, /lonely/i
  ],
  "academic pressure": [
    /school/i, /college/i, /university/i, /class/i, /grade/i, /exam/i,
    /homework/i, /study/i, /education/i, /student/i, /assignment/i
  ],
  "grief and loss": [
    /loss/i, /grief/i, /died/i, /death/i, /passed away/i, /miss/i,
    /funeral/i, /mourn/i, /gone/i, /losing/i, /grieve/i
  ],
  "addiction": [
    /addict/i, /alcohol/i, /drink/i, /drug/i, /substance/i, /cigarette/i,
    /smoking/i, /sober/i, /relapse/i, /recovery/i, /habit/i
  ],
  "life transitions": [
    /change/i, /moving/i, /graduate/i, /retire/i, /new job/i, /new city/i,
    /adjust/i, /transition/i, /different/i, /starting/i, /life change/i
  ],
  "decision making": [
    /decision/i, /choice/i, /choose/i, /option/i, /not sure what to do/i,
    /path/i, /crossroad/i, /decide/i, /uncertain/i, /direction/i
  ]
};

const GENERIC_EMPATHETIC_RESPONSES = [
  "Thank you for sharing that with me. How are you feeling about this situation right now?",
  "I appreciate you opening up. Can you tell me more about how this is affecting you?",
  "That sounds challenging. What has been the hardest part of this experience for you?",
  "I'm here to listen and support you. How have you been coping with these feelings?",
  "Your experiences and feelings are valid. Would it help to explore some strategies that might make this easier?",
  "It takes courage to discuss these things. What would be most helpful for you right now?",
  "I'm listening and I care about what you're going through. What kind of support are you looking for today?",
  "Thank you for trusting me with your thoughts. Is there a specific aspect of this situation you'd like to focus on?"
];

// Function to detect emotions in text
function detectEmotion(text: string): string {
  for (const [emotion, patterns] of Object.entries(EMOTION_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        return emotion;
      }
    }
  }
  return "difficult emotions";
}

// Function to detect situations in text
function detectSituation(text: string): string {
  for (const [situation, patterns] of Object.entries(SITUATION_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        return situation;
      }
    }
  }
  return "this situation";
}

// Define context tracking interface
interface ConversationContext {
  recentTopics: string[];
  detectedEmotions: Record<string, number>;
  mentionedSituations: Record<string, number>;
  userConcerns: string[];
  sessionStage: 'opening' | 'exploration' | 'closing';
  personalDetails: Record<string, string>;
  sessionNumber: number;
}

// Create an empty context
function createEmptyContext(): ConversationContext {
  return {
    recentTopics: [],
    detectedEmotions: {},
    mentionedSituations: {},
    userConcerns: [],
    sessionStage: 'opening',
    personalDetails: {},
    sessionNumber: 1
  };
}

// Update context based on new message
function updateContext(
  context: ConversationContext, 
  message: string, 
  conversationHistory: string[]
): ConversationContext {
  const updatedContext = { ...context };
  
  // Detect emotion and track frequency
  const emotion = detectEmotion(message);
  if (emotion !== "difficult emotions") {
    updatedContext.detectedEmotions[emotion] = (updatedContext.detectedEmotions[emotion] || 0) + 1;
  }
  
  // Detect situation and track frequency
  const situation = detectSituation(message);
  if (situation !== "this situation") {
    updatedContext.mentionedSituations[situation] = (updatedContext.mentionedSituations[situation] || 0) + 1;
  }
  
  // Extract potential topics (simplified approach)
  const words = message.toLowerCase().split(/\s+/);
  const significantWords = words.filter(word => 
    word.length > 4 && 
    !["about", "would", "could", "should", "there", "their", "thing"].includes(word)
  );
  
  // Only add unique significant words as topics
  significantWords.forEach(word => {
    if (!updatedContext.recentTopics.includes(word)) {
      updatedContext.recentTopics.unshift(word);
    }
  });
  
  // Keep only the 10 most recent topics
  updatedContext.recentTopics = updatedContext.recentTopics.slice(0, 10);
  
  // Extract potential concerns using regex patterns (simplified)
  const concernPatterns = [
    /I(?:'m| am) worried about ([^.?!]+)/i,
    /I(?:'m| am) concerned (?:about|that) ([^.?!]+)/i,
    /(?:bothers|troubles) me ([^.?!]+)/i,
    /I can'?t stop thinking about ([^.?!]+)/i,
    /I(?:'m| am) struggling with ([^.?!]+)/i,
    /I need help with ([^.?!]+)/i,
  ];
  
  concernPatterns.forEach(pattern => {
    const match = message.match(pattern);
    if (match && match[1]) {
      const concern = match[1].trim();
      if (!updatedContext.userConcerns.includes(concern)) {
        updatedContext.userConcerns.push(concern);
      }
    }
  });
  
  // Extract personal details
  const nameMatch = message.match(/my name is ([A-Z][a-z]+)/i);
  if (nameMatch && nameMatch[1]) {
    updatedContext.personalDetails['name'] = nameMatch[1];
  }
  
  const ageMatch = message.match(/I(?:'m| am) (\d+) years old/i);
  if (ageMatch && ageMatch[1]) {
    updatedContext.personalDetails['age'] = ageMatch[1];
  }
  
  // Update session stage based on conversation length
  if (conversationHistory.length < 4) {
    updatedContext.sessionStage = 'opening';
  } else if (conversationHistory.length > 15) {
    updatedContext.sessionStage = 'closing';
  } else {
    updatedContext.sessionStage = 'exploration';
  }
  
  return updatedContext;
}

// Generate response using context
function generateTherapeuticResponse(
  message: string, 
  conversationHistory: string[] = [],
  context: ConversationContext = createEmptyContext()
): string {
  // Update context with current message
  const updatedContext = updateContext(context, message, conversationHistory);
  
  // Different response templates based on session stage
  if (updatedContext.sessionStage === 'opening') {
    return generateOpeningResponse(message, updatedContext);
  } else if (updatedContext.sessionStage === 'closing') {
    return generateClosingResponse(message, updatedContext);
  }
  
  // Main exploration phase - personalized responses
  
  // Reference previous topics occasionally
  if (updatedContext.recentTopics.length > 3 && Math.random() > 0.7) {
    const randomPastTopic = updatedContext.recentTopics[Math.floor(Math.random() * 3) + 1];
    return `Coming back to what you mentioned earlier about "${randomPastTopic}" - how does that relate to what you're sharing now?`;
  }
  
  // Reference emotional patterns
  const emotionEntries = Object.entries(updatedContext.detectedEmotions);
  if (emotionEntries.length > 1 && Math.random() > 0.7) {
    // Sort emotions by frequency
    emotionEntries.sort((a, b) => b[1] - a[1]);
    const [primaryEmotion] = emotionEntries[0];
    const [secondaryEmotion] = emotionEntries[1];
    
    return `I've noticed that you've mentioned feeling both ${primaryEmotion} and ${secondaryEmotion}. How do these emotions interact for you?`;
  }
  
  // Use personal details when available
  if (updatedContext.personalDetails['name'] && Math.random() > 0.8) {
    return `${updatedContext.personalDetails['name']}, I'm curious about something. ${generateThoughtfulQuestion(message, updatedContext)}`;
  }
  
  // Reference user concerns
  if (updatedContext.userConcerns.length > 0 && Math.random() > 0.7) {
    const randomConcern = updatedContext.userConcerns[Math.floor(Math.random() * updatedContext.userConcerns.length)];
    return `Earlier, you mentioned being concerned about "${randomConcern}". Has anything changed about that situation?`;
  }
  
  // Default to enhanced basic response
  const emotion = Object.keys(updatedContext.detectedEmotions).length > 0 
    ? Object.entries(updatedContext.detectedEmotions).sort((a, b) => b[1] - a[1])[0][0]
    : detectEmotion(message);
    
  const situation = Object.keys(updatedContext.mentionedSituations).length > 0
    ? Object.entries(updatedContext.mentionedSituations).sort((a, b) => b[1] - a[1])[0][0]
    : detectSituation(message);
  
  // Select a random response template
  const template = RESPONSE_TEMPLATES[Math.floor(Math.random() * RESPONSE_TEMPLATES.length)];
  
  // Replace placeholders with detected emotion and situation
  return template
    .replace(/{emotion}/g, emotion)
    .replace(/{situation}/g, situation);
}

// Generate opening phase responses
function generateOpeningResponse(message: string, context: ConversationContext): string {
  const openingResponses = [
    "I appreciate you sharing that with me. To help me understand better, could you tell me a bit more about what brings you here today?",
    "Thank you for opening up. I'm here to listen. What would be most helpful for us to focus on in our conversation?",
    "I'm glad you've reached out. To start, could you share what's been on your mind recently?",
    "It takes courage to talk about these things. What are you hoping to get from our conversation today?"
  ];
  
  // If this isn't the first message, use more personalized opening responses
  if (context.recentTopics.length > 0) {
    return `I appreciate you sharing about ${context.recentTopics[0]}. To understand better, could you tell me how long you've been experiencing this?`;
  }
  
  return openingResponses[Math.floor(Math.random() * openingResponses.length)];
}

// Generate closing phase responses
function generateClosingResponse(message: string, context: ConversationContext): string {
  // Get most discussed emotion and situation
  const topEmotion = Object.entries(context.detectedEmotions)
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0])[0] || "these feelings";
    
  const topSituation = Object.entries(context.mentionedSituations)
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0])[0] || "this situation";
  
  const closingResponses = [
    `We've covered quite a bit about ${topSituation}. As we start to wrap up, what's one small step you might take to address ${topEmotion} this week?`,
    `I've appreciated you sharing about ${topSituation}. Before we conclude, is there anything else about ${topEmotion} that you'd like to explore?`,
    `We've discussed several aspects of ${topSituation}. What's one insight from our conversation that resonates with you?`,
    `Thank you for trusting me with your thoughts on ${topSituation}. What support do you need to help manage ${topEmotion} moving forward?`
  ];
  
  return closingResponses[Math.floor(Math.random() * closingResponses.length)];
}

// Generate thoughtful follow-up questions
function generateThoughtfulQuestion(message: string, context: ConversationContext): string {
  const thoughtfulQuestions = [
    "What do you think might be underlying these feelings?",
    "How has this been affecting your day-to-day life?",
    "What strategies have you tried so far to address this?",
    "When did you first notice this pattern?",
    "How would you like things to be different?",
    "What would it mean for you if this situation changed?",
    "How does this connect to other areas of your life?",
    "What does your support network look like right now?",
    "How have your thoughts about this evolved over time?",
    "What strengths do you have that might help in this situation?"
  ];
  
  return thoughtfulQuestions[Math.floor(Math.random() * thoughtfulQuestions.length)];
}

// Function to persist context in memory (or database in a production environment)
const contextCache: Record<string, ConversationContext> = {};

function getMockPremiumResponse(message: string, userId: string, conversationHistory: string[] = []): string {
  // Get existing context or create new one
  let context = contextCache[userId] || createEmptyContext();
  
  // Generate response using context
  const response = generateTherapeuticResponse(message, conversationHistory, context);
  
  // Update context with current interaction
  context = updateContext(context, message, conversationHistory);
  
  // Save updated context
  contextCache[userId] = context;
  
  return response;
}

function getMockFreeResponse(message: string): string {
  // For free users, provide more generic responses
  const genericResponse = GENERIC_EMPATHETIC_RESPONSES[Math.floor(Math.random() * GENERIC_EMPATHETIC_RESPONSES.length)];
  return genericResponse;
}

// Define request body interface
interface EnhanceRequest {
  userMessage: string;
  aiResponse: string;
  conversationHistory: string[];
  sessionContext?: Record<string, any>;
}

// Validate request function
function validateRequest(req: EnhanceRequest): string | null {
  if (!req.userMessage || typeof req.userMessage !== 'string') {
    return 'Missing or invalid userMessage';
  }
  
  if (!req.aiResponse || typeof req.aiResponse !== 'string') {
    return 'Missing or invalid aiResponse';
  }
  
  if (!Array.isArray(req.conversationHistory)) {
    return 'Missing or invalid conversationHistory array';
  }
  
  if (req.sessionContext && typeof req.sessionContext !== 'object') {
    return 'Invalid sessionContext object';
  }
  
  return null;
}

// Main handler function
serve(async (req) => {
  // CORS support
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
  
  try {
    // Parse JSON request body
    const requestData: EnhanceRequest = await req.json();
    
    // Validate request data
    const validationError = validateRequest(requestData);
    if (validationError) {
      return new Response(JSON.stringify({ error: validationError }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // Process the therapeutic enhancement
    const enhancedResponse = await enhanceResponse(
      requestData.userMessage,
      requestData.conversationHistory,
      requestData.aiResponse,
      requestData.sessionContext || {}
    );
    
    // Return the enhanced response
    return new Response(JSON.stringify(enhancedResponse), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    // Handle errors
    console.error('Error processing request:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to process request',
      details: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
});
