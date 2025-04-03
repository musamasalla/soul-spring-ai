import { useState, useCallback, useRef, useEffect } from 'react';
import { useEnhancedTextToSpeech } from '../utils/enhancedTextToSpeech';

interface UseVoiceEnabledAIOptions {
  emotionAware?: boolean;
  speakingRate?: number;
  chunkSize?: number;
  pauseBetweenChunks?: number;
  voiceGender?: 'male' | 'female' | 'neutral';
}

interface EmotionSettings {
  [key: string]: {
    rate: number;
    pitch: number;
    volume?: number;
  };
}

// Default settings for emotion-based voice modulation
const EMOTION_VOICE_SETTINGS: EmotionSettings = {
  happy: { rate: 1.1, pitch: 1.1 },
  excited: { rate: 1.2, pitch: 1.2 },
  sad: { rate: 0.9, pitch: 0.9 },
  depressed: { rate: 0.8, pitch: 0.85 },
  angry: { rate: 1.1, pitch: 0.8 },
  anxious: { rate: 1.15, pitch: 1.05 },
  calm: { rate: 0.95, pitch: 1.0 },
  neutral: { rate: 1.0, pitch: 1.0 },
  fear: { rate: 1.1, pitch: 1.1 },
  disgust: { rate: 0.95, pitch: 0.9 },
  surprise: { rate: 1.15, pitch: 1.15 },
  confused: { rate: 0.9, pitch: 1.05 },
  guilt: { rate: 0.9, pitch: 0.9 },
  shame: { rate: 0.85, pitch: 0.85 },
  hope: { rate: 1.05, pitch: 1.1 },
  love: { rate: 0.95, pitch: 1.05 },
  gratitude: { rate: 1.0, pitch: 1.1 }
};

// Regex patterns to identify natural pauses in text
const PAUSE_PATTERNS = [
  /[.!?]\s+/g,  // End of sentences
  /[,:;]\s+/g,  // Commas, colons, semicolons
  /\n+/g,       // Line breaks
  /\s-\s+/g,    // Dashes with spaces
  /\([^)]+\)/g, // Parenthetical phrases
];

export const useVoiceEnabledAI = (options: UseVoiceEnabledAIOptions = {}) => {
  const {
    emotionAware = true,
    speakingRate = 1.0,
    chunkSize = 100,
    pauseBetweenChunks = 300, // milliseconds
    voiceGender = 'female'
  } = options;

  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentEmotion, setCurrentEmotion] = useState<string>('neutral');
  const [currentText, setCurrentText] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);

  // Track chunks being spoken
  const chunksRef = useRef<string[]>([]);
  const currentChunkIndexRef = useRef<number>(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  // Initialize text-to-speech
  const {
    isSpeaking: ttsIsSpeaking,
    isPaused: ttsIsPaused,
    isSupported,
    availableVoices,
    speak,
    speakNow,
    stop: stopSpeaking,
    pause: pauseSpeaking,
    resume: resumeSpeaking,
    selectVoice,
    setRate,
    setPitch,
    getVoicesByLang
  } = useEnhancedTextToSpeech();

  // Update component state based on TTS state
  useEffect(() => {
    setIsSpeaking(ttsIsSpeaking);
    setIsPaused(ttsIsPaused);
  }, [ttsIsSpeaking, ttsIsPaused]);

  // Set voice based on gender preference when voices are available
  useEffect(() => {
    if (availableVoices.length > 0) {
      const voices = getVoicesByLang('en', voiceGender);
      if (voices.length > 0) {
        selectVoice(voices[0].voiceURI);
      }
    }
  }, [availableVoices, voiceGender, getVoicesByLang, selectVoice]);

  // Clean up timers when component unmounts
  useEffect(() => {
    return () => {
      timersRef.current.forEach(timer => clearTimeout(timer));
      stopSpeaking();
    };
  }, [stopSpeaking]);

  // Chunk the text into natural segments for more natural speech
  const chunkText = useCallback((text: string): string[] => {
    // Clean text from markdown or HTML if present
    const cleanText = text
      .replace(/```[^`]*```/g, '') // Remove code blocks
      .replace(/`([^`]+)`/g, '$1') // Remove inline code
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold markdown
      .replace(/\*([^*]+)\*/g, '$1') // Remove italic markdown
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Replace links with just their text
      .replace(/#{1,6}\s+(.*)/g, '$1') // Remove heading markers
      .trim();

    // Find natural break points in the text
    let breakPoints: number[] = [];
    
    // Add break points at sentence endings and other natural pauses
    PAUSE_PATTERNS.forEach(pattern => {
      let match;
      while ((match = pattern.exec(cleanText)) !== null) {
        breakPoints.push(match.index + match[0].length);
      }
    });
    
    // Sort break points and remove duplicates
    breakPoints = [...new Set(breakPoints)].sort((a, b) => a - b);
    
    // If no natural break points found or text is short, use the whole text
    if (breakPoints.length === 0 || cleanText.length <= chunkSize) {
      return [cleanText];
    }
    
    // Create chunks based on break points and max chunk size
    const chunks: string[] = [];
    let lastBreak = 0;
    
    for (let i = 0; i < breakPoints.length; i++) {
      // If this chunk would be too long, find a suitable break point
      if (breakPoints[i] - lastBreak > chunkSize) {
        // Find the last space within the chunkSize limit
        const subtext = cleanText.substring(lastBreak, lastBreak + chunkSize);
        const lastSpace = subtext.lastIndexOf(' ');
        
        if (lastSpace > 0) {
          chunks.push(cleanText.substring(lastBreak, lastBreak + lastSpace).trim());
          lastBreak = lastBreak + lastSpace + 1;
        } else {
          // If no space found, just chunk at max size
          chunks.push(cleanText.substring(lastBreak, lastBreak + chunkSize).trim());
          lastBreak = lastBreak + chunkSize;
        }
        // Adjust i to process this break point again
        i--;
      } else if (i === breakPoints.length - 1) {
        // Last break point - add the remaining text
        chunks.push(cleanText.substring(lastBreak).trim());
        lastBreak = cleanText.length;
      } else if (i < breakPoints.length - 1 && 
                breakPoints[i+1] - lastBreak > chunkSize) {
        // Next break would create too large a chunk, so break here
        chunks.push(cleanText.substring(lastBreak, breakPoints[i]).trim());
        lastBreak = breakPoints[i];
      }
    }
    
    // If we didn't process all text, add the remainder
    if (lastBreak < cleanText.length) {
      chunks.push(cleanText.substring(lastBreak).trim());
    }
    
    // Filter out empty chunks
    return chunks.filter(chunk => chunk.trim().length > 0);
  }, [chunkSize]);

  // Adjust voice parameters based on emotion
  const adjustVoiceForEmotion = useCallback((emotion: string) => {
    if (!emotionAware) {
      setRate(speakingRate);
      setPitch(1.0);
      return;
    }

    const settings = EMOTION_VOICE_SETTINGS[emotion.toLowerCase()] || EMOTION_VOICE_SETTINGS.neutral;
    
    // Apply base speaking rate multiplied by emotion-specific rate
    setRate(speakingRate * settings.rate);
    setPitch(settings.pitch);
    
    setCurrentEmotion(emotion);
  }, [emotionAware, speakingRate, setRate, setPitch]);

  // Speak the text with emotion awareness and chunking
  const speakWithEmotion = useCallback((text: string, emotion: string = 'neutral') => {
    if (!isSupported || !text) return;

    // Clear any existing speech and timers
    stopSpeaking();
    timersRef.current.forEach(timer => clearTimeout(timer));
    timersRef.current = [];
    
    // Update state
    setCurrentText(text);
    setIsSpeaking(true);
    setIsPaused(false);
    setProgress(0);
    
    // Adjust voice for the specified emotion
    adjustVoiceForEmotion(emotion);
    
    // Chunk the text for more natural speech
    const chunks = chunkText(text);
    chunksRef.current = chunks;
    currentChunkIndexRef.current = 0;
    
    // Speak the first chunk immediately
    if (chunks.length > 0) {
      speak(chunks[0]);
      
      // Schedule the rest of the chunks with pauses
      let cumulativeDelay = 0;
      
      for (let i = 1; i < chunks.length; i++) {
        // Estimate time needed for previous chunk (100ms per character + pause)
        const previousChunk = chunks[i-1];
        const chunkDuration = previousChunk.length * 100 + pauseBetweenChunks;
        cumulativeDelay += chunkDuration;
        
        const timer = setTimeout(() => {
          if (!isPaused) {
            speak(chunks[i]);
            currentChunkIndexRef.current = i;
            setProgress(Math.round((i / chunks.length) * 100));
          }
        }, cumulativeDelay);
        
        timersRef.current.push(timer);
      }
      
      // Final timer to mark completion
      const finalDelay = cumulativeDelay + (chunks[chunks.length-1].length * 100);
      const finalTimer = setTimeout(() => {
        setIsSpeaking(false);
        setProgress(100);
      }, finalDelay);
      
      timersRef.current.push(finalTimer);
    }
  }, [isSupported, stopSpeaking, adjustVoiceForEmotion, chunkText, speak, pauseBetweenChunks, isPaused]);

  // Stop all speech
  const stop = useCallback(() => {
    stopSpeaking();
    timersRef.current.forEach(timer => clearTimeout(timer));
    timersRef.current = [];
    setIsSpeaking(false);
    setIsPaused(false);
    setProgress(0);
  }, [stopSpeaking]);

  // Pause speech
  const pause = useCallback(() => {
    pauseSpeaking();
    setIsPaused(true);
  }, [pauseSpeaking]);

  // Resume speech
  const resume = useCallback(() => {
    resumeSpeaking();
    setIsPaused(false);
    
    // Resume the scheduled chunks if paused
    if (isPaused) {
      const currentIndex = currentChunkIndexRef.current;
      const chunks = chunksRef.current;
      
      // Clear existing timers
      timersRef.current.forEach(timer => clearTimeout(timer));
      timersRef.current = [];
      
      // Reschedule remaining chunks
      let cumulativeDelay = 0;
      
      for (let i = currentIndex + 1; i < chunks.length; i++) {
        const previousChunk = chunks[i-1];
        const chunkDuration = previousChunk.length * 100 + pauseBetweenChunks;
        cumulativeDelay += chunkDuration;
        
        const timer = setTimeout(() => {
          if (!isPaused) {
            speak(chunks[i]);
            currentChunkIndexRef.current = i;
            setProgress(Math.round((i / chunks.length) * 100));
          }
        }, cumulativeDelay);
        
        timersRef.current.push(timer);
      }
      
      // Final timer to mark completion
      const finalDelay = cumulativeDelay + (chunks[chunks.length-1].length * 100);
      const finalTimer = setTimeout(() => {
        setIsSpeaking(false);
        setProgress(100);
      }, finalDelay);
      
      timersRef.current.push(finalTimer);
    }
  }, [resumeSpeaking, isPaused, pauseBetweenChunks, speak]);

  return {
    speakWithEmotion,
    stop,
    pause,
    resume,
    isSpeaking,
    isPaused,
    isSupported,
    currentText,
    currentEmotion,
    progress,
    setVoiceGender: (gender: 'male' | 'female' | 'neutral') => {
      const voices = getVoicesByLang('en', gender);
      if (voices.length > 0) {
        selectVoice(voices[0].voiceURI);
      }
    },
    setSpeakingRate: (rate: number) => {
      // Recalculate rate based on current emotion
      const emotion = currentEmotion.toLowerCase();
      const emotionRate = EMOTION_VOICE_SETTINGS[emotion]?.rate || 1.0;
      setRate(rate * emotionRate);
    }
  };
}; 