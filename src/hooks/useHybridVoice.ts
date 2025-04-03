import { useState, useRef, useCallback, useEffect } from 'react';
import { useEnhancedTextToSpeech } from '../utils/enhancedTextToSpeech';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { generateMockMonthlyUsage, calculateUsagePercentage } from '@/utils/ttsHelpers';

interface EmotionData {
  dominant: string;
  intensity: number;
  secondary?: string;
}

interface HybridVoiceOptions {
  premium?: boolean;
  premiumThreshold?: number;
  fallbackTimeout?: number;
  defaultVoiceGender?: 'male' | 'female' | 'neutral';
  defaultModel?: 'tts-1' | 'tts-1-hd';
}

// Constants
const PREMIUM_MONTHLY_LIMIT = 1000000; // 1 million characters per month

// Add fallback data
const FALLBACK_TTS_USAGE = {
  month: 'Current Month',
  total_requests: 12,
  total_characters: 6000
};

// Voice mapping for different emotions
const EMOTION_VOICE_MAPPING = {
  // Default emotional voices
  happy: { voice: 'nova', speed: 1.1 },
  excited: { voice: 'shimmer', speed: 1.2 },
  sad: { voice: 'alloy', speed: 0.9 },
  angry: { voice: 'onyx', speed: 1.0 },
  anxious: { voice: 'echo', speed: 1.1 },
  calm: { voice: 'nova', speed: 0.95 },
  neutral: { voice: 'nova', speed: 1.0 },
  fear: { voice: 'echo', speed: 1.05 },
  empathetic: { voice: 'alloy', speed: 0.95 },
  confident: { voice: 'onyx', speed: 1.05 },
  curious: { voice: 'echo', speed: 1.0 },
  
  // Therapeutic voices (for specific therapy moments)
  supportive: { voice: 'nova', speed: 0.95 },
  instructive: { voice: 'onyx', speed: 0.9 },
  reflective: { voice: 'alloy', speed: 0.9 },
  challenging: { voice: 'fable', speed: 1.0 }
};

// Phrases that indicate high importance for premium voice
const HIGH_IMPORTANCE_PHRASES = [
  "I understand how you feel",
  "That's an important insight",
  "Let me guide you through",
  "I want you to remember",
  "This is a significant point",
  "Take a deep breath",
  "Let's reflect on",
  "I hear that you're feeling",
  "That must be really difficult",
  "You've made progress",
  "Let's practice together"
];

export const useHybridVoice = (options: HybridVoiceOptions = {}) => {
  const {
    premium = true,
    premiumThreshold = 0.7, // Importance threshold for using premium voice
    fallbackTimeout = 3000, // ms to wait before falling back to browser TTS
    defaultVoiceGender = 'female',
    defaultModel = 'tts-1'
  } = options;
  
  // Get user from auth context
  const { user } = useAuth();
  
  // Browser TTS
  const browserTTS = useEnhancedTextToSpeech({
    rate: 1.0,
    pitch: 1.0,
    lang: 'en-US'
  });
  
  // Premium TTS state
  const [isLoadingPremiumVoice, setIsLoadingPremiumVoice] = useState<boolean>(false);
  const [premiumVoiceQuota, setPremiumVoiceQuota] = useState<number>(100); // Default monthly quota
  const [premiumVoiceUsed, setPremiumVoiceUsed] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentText, setCurrentText] = useState<string>('');
  const [currentEmotion, setCurrentEmotion] = useState<string>('neutral');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  
  // Refs for audio element and timers
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Create audio element on mount
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.addEventListener('ended', () => {
      setIsSpeaking(false);
    });
    
    // Check premium voice usage on mount
    const checkPremiumUsage = async () => {
      if (!user?.id) return;
      
      try {
        // First try to fetch data from API
        const { data, error } = await supabase.rpc('get_monthly_tts_usage', {
          user_uuid: user.id
        });
        
        if (error) {
          console.warn('Using fallback TTS usage data due to API error:', error.message);
          
          // Use fallback data from our helper
          const mockData = generateMockMonthlyUsage()[0];
          const usagePercentage = calculateUsagePercentage(mockData.total_characters);
          
          setPremiumVoiceUsed(mockData.total_requests);
          setPremiumVoiceQuota(usagePercentage);
          return;
        }
        
        if (data && data.length > 0) {
          const currentMonthData = data[0];
          const totalCharacters = currentMonthData?.total_characters || 0;
          const totalRequests = currentMonthData?.total_requests || 0;
          
          // Calculate percentage using our helper
          const usagePercentage = calculateUsagePercentage(totalCharacters);
          
          setPremiumVoiceUsed(totalRequests);
          setPremiumVoiceQuota(usagePercentage);
        } else {
          // No data - assume first time user
          setPremiumVoiceUsed(0);
          setPremiumVoiceQuota(0);
        }
      } catch (e) {
        console.error('Error fetching premium voice usage:', e);
        // Use mock data on error
        const mockData = generateMockMonthlyUsage()[0];
        setPremiumVoiceUsed(mockData.total_requests);
        setPremiumVoiceQuota(calculateUsagePercentage(mockData.total_characters));
      }
    };
    
    checkPremiumUsage();
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('ended', () => {
          setIsSpeaking(false);
        });
      }
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Also cleanup browser TTS
      browserTTS.stop();
    };
  }, [user?.id]);
  
  // Determine if a response is important enough for premium voice
  const getResponseImportance = useCallback((text: string, emotionData?: EmotionData): number => {
    if (!text) return 0;
    
    let importanceScore = 0;
    
    // Check for therapeutic importance phrases
    for (const phrase of HIGH_IMPORTANCE_PHRASES) {
      if (text.toLowerCase().includes(phrase.toLowerCase())) {
        importanceScore += 0.3;
      }
    }
    
    // Length-based importance (longer responses are more likely to be important)
    if (text.length > 200) importanceScore += 0.2;
    if (text.length > 500) importanceScore += 0.3;
    
    // Emotional intensity based importance
    if (emotionData?.intensity) {
      importanceScore += emotionData.intensity * 0.4;
    }
    
    // Important emotional content
    const emotionalWords = [
      'anxiety', 'depression', 'trauma', 'grief', 'stress', 'crisis',
      'suicidal', 'hopeless', 'overwhelmed', 'healing', 'recovery', 'progress'
    ];
    
    for (const word of emotionalWords) {
      if (text.toLowerCase().includes(word)) {
        importanceScore += 0.15;
      }
    }
    
    // Cap at 1.0
    return Math.min(importanceScore, 1.0);
  }, []);
  
  // Select appropriate voice based on emotion
  const selectVoiceForEmotion = useCallback((emotion: string): { voice: string; speed: number } => {
    return EMOTION_VOICE_MAPPING[emotion.toLowerCase()] || EMOTION_VOICE_MAPPING.neutral;
  }, []);
  
  // Speak with the appropriate voice based on importance and emotion
  const speak = useCallback(async (text: string, emotion: string = 'neutral', emotionData?: EmotionData) => {
    if (!text) return;
    
    // Clear any previous speech and timers
    stop();
    
    setCurrentText(text);
    setCurrentEmotion(emotion);
    setIsSpeaking(true);
    
    // Determine importance of this response
    const importance = getResponseImportance(text, emotionData);
    
    // Check if we should use premium voice
    const shouldUsePremium = premium && 
                            importance >= premiumThreshold && 
                            navigator.onLine && 
                            premiumVoiceUsed < premiumVoiceQuota &&
                            user?.id;
    
    if (shouldUsePremium) {
      setIsLoadingPremiumVoice(true);
      setErrorMessage(null);
      
      // Set a fallback timeout
      timeoutRef.current = setTimeout(() => {
        console.log('Premium voice timeout - falling back to browser TTS');
        browserTTS.speakWithEmotion(text, emotion);
        setIsLoadingPremiumVoice(false);
        setErrorMessage('Premium voice timed out, using browser voice instead');
      }, fallbackTimeout);
      
      try {
        // Get voice and speed based on emotion
        const { voice, speed } = selectVoiceForEmotion(emotion);
        
        // Call the edge function
        const response = await fetch('/api/openai-tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            voice,
            model: defaultModel,
            speed,
            userId: user?.id
          })
        });
        
        // Clear timeout since we got a response
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error generating premium voice');
        }
        
        // Process successful response
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.play();
          
          // Update usage
          setPremiumVoiceUsed(prev => prev + 1);
        }
      } catch (error) {
        console.error('Premium voice error, falling back to browser TTS:', error);
        browserTTS.speakWithEmotion(text, emotion);
        setErrorMessage(error instanceof Error ? error.message : 'Error with premium voice');
      } finally {
        setIsLoadingPremiumVoice(false);
        
        // Clear timeout if it's still running
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }
    } else {
      // Reasons for not using premium voice
      if (premium && !navigator.onLine) {
        setErrorMessage('Offline - using browser voice');
      } else if (premium && premiumVoiceUsed >= premiumVoiceQuota) {
        setErrorMessage('Monthly premium voice quota reached');
      } else if (premium && importance < premiumThreshold) {
        // No error, just using browser voice for less important text
      }
      
      // Use browser TTS
      browserTTS.speakWithEmotion(text, emotion);
    }
  }, [
    premium, 
    premiumThreshold, 
    premiumVoiceUsed, 
    premiumVoiceQuota, 
    user?.id, 
    browserTTS, 
    fallbackTimeout, 
    getResponseImportance, 
    selectVoiceForEmotion,
    defaultModel
  ]);
  
  // Stop all speech
  const stop = useCallback(() => {
    // Stop browser TTS
    browserTTS.stop();
    
    // Stop premium audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    // Clear any timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    setIsSpeaking(false);
    setIsLoadingPremiumVoice(false);
  }, [browserTTS]);
  
  // Pause speech
  const pause = useCallback(() => {
    // Pause browser TTS
    browserTTS.pause();
    
    // Pause premium audio
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    }
  }, [browserTTS]);
  
  // Resume speech
  const resume = useCallback(() => {
    // Resume browser TTS
    browserTTS.resume();
    
    // Resume premium audio
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play();
    }
  }, [browserTTS]);
  
  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isLoading: isLoadingPremiumVoice,
    error: errorMessage,
    currentText,
    currentEmotion,
    premiumVoiceUsed,
    premiumVoiceQuota,
    isPremium: premium,
    setBrowserVoice: browserTTS.setVoiceGender,
    setRate: browserTTS.setSpeakingRate
  };
}; 