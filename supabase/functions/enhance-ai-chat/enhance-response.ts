import { detectEmotion } from './emotions';
import { detectSituation, generateSituationalResponse } from './situations';
import { generateTherapeuticResponse, selectTherapeuticSkills, TherapyMicroSkill } from './therapy-skills';

// Define the therapy stages
export type TherapyStage = 'opening' | 'assessment' | 'intervention' | 'closing';

// Interface for situation analysis results based on what detectSituation returns
export interface SituationAnalysis {
  situation: string;
  severity: string;
  relatedEmotions: string[];
  category: string;
}

// Interface for emotion analysis results
export interface EmotionAnalysis {
  primaryEmotion: string;
  intensity: string;
  emotionScores: Record<string, number>;
}

// Interface for the enhanced response
export interface EnhancedResponse {
  originalMessage: string;
  enhancedMessage: string;
  emotionAnalysis: EmotionAnalysis;
  situationAnalysis: SituationAnalysis;
  therapeuticApproach: {
    stage: TherapyStage;
    skillsUsed: TherapyMicroSkill[];
  };
  sessionContext?: Record<string, any>;
}

// Determine the current therapy stage based on conversation history
function determineTherapyStage(
  messageIndex: number, 
  totalMessages: number, 
  situationSeverity: string
): TherapyStage {
  // First few messages are opening
  if (messageIndex < 2) {
    return 'opening';
  }
  
  // Last message is closing
  if (messageIndex === totalMessages - 1) {
    return 'closing';
  }
  
  // First third of the conversation (after opening) is assessment
  const firstThird = Math.floor(totalMessages * 0.3);
  if (messageIndex < firstThird) {
    return 'assessment';
  }
  
  // The rest is intervention
  return 'intervention';
}

// Core function to enhance an AI response
export async function enhanceResponse(
  userMessage: string,
  conversationHistory: string[],
  aiResponse: string,
  sessionContext: Record<string, any> = {}
): Promise<EnhancedResponse> {
  // Detect emotions in the user's message
  const emotionAnalysis = detectEmotion(userMessage);
  const primaryEmotion = emotionAnalysis.emotion;
  
  // Detect situation in the user's message
  const situationAnalysis = detectSituation(userMessage);
  const primarySituation = situationAnalysis.situation;
  const situationSeverity = situationAnalysis.severity;
  
  // Determine the current therapy stage
  const messageIndex = conversationHistory.length;
  const totalMessages = conversationHistory.length + 2; // Adding 2 for current exchange
  const stage = determineTherapyStage(messageIndex, totalMessages, situationSeverity);
  
  // Select appropriate therapeutic skills
  const selectedSkills = selectTherapeuticSkills(
    stage,
    primaryEmotion,
    primarySituation,
    2
  );
  
  // Generate situation-specific response components
  const situationalResponse = generateSituationalResponse(
    userMessage
  );
  
  // Generate a therapeutic response using micro-skills
  const therapeuticResponse = generateTherapeuticResponse(
    userMessage,
    stage,
    primaryEmotion,
    primarySituation
  );
  
  // Enhance the AI's response by integrating therapeutic elements
  const enhancedResponse = integrateTherapeuticElements(
    aiResponse,
    therapeuticResponse,
    situationalResponse,
    stage
  );
  
  // Return the enhanced response with analysis data
  return {
    originalMessage: aiResponse,
    enhancedMessage: enhancedResponse,
    emotionAnalysis: {
      primaryEmotion: emotionAnalysis.emotion,
      intensity: emotionAnalysis.intensity,
      emotionScores: {}  // We'll need to implement this or adapt it based on the actual return type
    },
    situationAnalysis,
    therapeuticApproach: {
      stage,
      skillsUsed: selectedSkills
    },
    sessionContext
  };
}

// Helper function to intelligently integrate therapeutic elements into an AI response
function integrateTherapeuticElements(
  originalResponse: string,
  therapeuticResponse: string,
  situationalResponse: string,
  stage: TherapyStage
): string {
  let enhancedResponse = '';
  
  // Opening stage: Lead with therapeutic elements
  if (stage === 'opening') {
    enhancedResponse = `${therapeuticResponse} ${situationalResponse} ${originalResponse}`;
  }
  // Assessment stage: Use therapeutic elements to introduce points
  else if (stage === 'assessment') {
    // Split the original response into sentences
    const sentences = originalResponse.split(/(?<=[.!?])\s+/);
    
    if (sentences.length < 2) {
      enhancedResponse = `${therapeuticResponse} ${originalResponse}`;
    } else {
      // Insert therapeutic elements after the first sentence
      enhancedResponse = `${sentences[0]} ${therapeuticResponse} ${sentences.slice(1).join(' ')}`;
    }
  }
  // Intervention stage: Integrate situation-specific responses
  else if (stage === 'intervention') {
    // Split the original response
    const responseSegments = originalResponse.split(/(?<=[.!?])\s+/);
    
    if (responseSegments.length < 3) {
      enhancedResponse = `${therapeuticResponse} ${originalResponse} ${situationalResponse}`;
    } else {
      // Divide the response into thirds
      const oneThird = Math.floor(responseSegments.length / 3);
      
      // Insert therapeutic and situational elements at strategic points
      enhancedResponse = 
        responseSegments.slice(0, oneThird).join(' ') + ' ' +
        therapeuticResponse + ' ' +
        responseSegments.slice(oneThird, oneThird * 2).join(' ') + ' ' +
        situationalResponse + ' ' +
        responseSegments.slice(oneThird * 2).join(' ');
    }
  }
  // Closing stage: End with therapeutic validation
  else if (stage === 'closing') {
    enhancedResponse = `${originalResponse} ${therapeuticResponse}`;
  }
  
  return enhancedResponse.trim();
}

// Export the enhancement module functions
export default {
  enhanceResponse,
  determineTherapyStage,
  integrateTherapeuticElements
}; 