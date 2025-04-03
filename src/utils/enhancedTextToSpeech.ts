import { useState, useEffect, useRef, useCallback } from 'react';

// Types for text-to-speech
interface EnhancedTextToSpeechOptions {
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
  onPause?: () => void;
  onResume?: () => void;
  onMark?: (name: string) => void;
  onBoundary?: (event: any) => void;
}

interface VoiceInfo {
  voiceURI: string;
  name: string;
  lang: string;
  localService: boolean;
  default: boolean;
  gender?: 'male' | 'female' | 'neutral';
}

export const useEnhancedTextToSpeech = (options: EnhancedTextToSpeechOptions = {}) => {
  // Default options
  const defaultOptions: EnhancedTextToSpeechOptions = {
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    lang: 'en-US',
    onStart: () => {},
    onEnd: () => {},
    onError: () => {},
    onPause: () => {},
    onResume: () => {},
    onMark: () => {},
    onBoundary: () => {}
  };

  const mergedOptions = { ...defaultOptions, ...options };
  
  // State management
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [availableVoices, setAvailableVoices] = useState<VoiceInfo[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<VoiceInfo | null>(null);
  const [error, setError] = useState<any>(null);
  const [currentText, setCurrentText] = useState<string>('');
  const [speakingProgress, setSpeakingProgress] = useState<{ word: number; sentence: number; character: number }>({
    word: 0,
    sentence: 0,
    character: 0
  });

  // Refs
  const synthesis = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const voicesLoadedRef = useRef<boolean>(false);
  const optionsRef = useRef(mergedOptions);
  const queueRef = useRef<string[]>([]);
  const processingRef = useRef<boolean>(false);
  
  // Update options ref when options change
  useEffect(() => {
    optionsRef.current = { ...optionsRef.current, ...options };
  }, [options]);

  // Initialize speech synthesis
  useEffect(() => {
    // Check if browser supports speech synthesis
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      synthesis.current = window.speechSynthesis;
      
      // Load available voices
      const loadVoices = () => {
        const synth = synthesis.current;
        if (!synth) return [];
        
        const voices = synth.getVoices();
        
        if (voices.length > 0) {
          voicesLoadedRef.current = true;
          
          // Map voices to VoiceInfo objects
          const voiceInfos: VoiceInfo[] = voices.map(voice => ({
            voiceURI: voice.voiceURI,
            name: voice.name,
            lang: voice.lang,
            localService: voice.localService,
            default: voice.default,
            gender: getGenderFromVoiceName(voice.name)
          }));
          
          setAvailableVoices(voiceInfos);
          
          // Select default voice based on language preference
          if (!selectedVoice) {
            const preferredLang = optionsRef.current.lang || 'en-US';
            const preferredVoice = voices.find(v => v.lang === preferredLang && v.default) || 
                                  voices.find(v => v.lang === preferredLang) ||
                                  voices.find(v => v.default) ||
                                  voices[0];
            
            if (preferredVoice) {
              const preferredVoiceInfo: VoiceInfo = {
                voiceURI: preferredVoice.voiceURI,
                name: preferredVoice.name,
                lang: preferredVoice.lang,
                localService: preferredVoice.localService,
                default: preferredVoice.default,
                gender: getGenderFromVoiceName(preferredVoice.name)
              };
              
              setSelectedVoice(preferredVoiceInfo);
            }
          }
        }
        
        return voices;
      };
      
      // Initialize voices
      const voices = loadVoices();
      
      // Chrome loads voices asynchronously
      if ('onvoiceschanged' in synthesis.current) {
        synthesis.current.onvoiceschanged = () => {
          const updatedVoices = loadVoices();
          if (updatedVoices.length > 0) {
            voicesLoadedRef.current = true;
          }
        };
      }
      
      // Set a timeout as a fallback for browsers that don't trigger onvoiceschanged
      if (!voicesLoadedRef.current) {
        setTimeout(() => {
          if (!voicesLoadedRef.current) {
            loadVoices();
          }
        }, 1000);
      }
    } else {
      setIsSupported(false);
      setError({
        message: 'Speech synthesis is not supported in this browser.'
      });
    }
    
    // Cleanup on unmount
    return () => {
      if (synthesis.current) {
        synthesis.current.cancel();
      }
    };
  }, []);

  // Helper function to estimate gender from voice name (heuristic approach)
  const getGenderFromVoiceName = (name: string): 'male' | 'female' | 'neutral' => {
    name = name.toLowerCase();
    
    // Common patterns for female voices
    if (
      name.includes('female') ||
      name.includes('woman') ||
      name.includes('girl') ||
      name.includes('fiona') ||
      name.includes('samantha') ||
      name.includes('victoria') ||
      name.includes('karen') ||
      name.includes('moira') ||
      name.includes('tessa') ||
      name.includes('veena') ||
      name.includes('allison')
    ) {
      return 'female';
    }
    
    // Common patterns for male voices
    if (
      name.includes('male') ||
      name.includes('man') ||
      name.includes('boy') ||
      name.includes('guy') ||
      name.includes('daniel') ||
      name.includes('david') ||
      name.includes('thomas') ||
      name.includes('alex') ||
      name.includes('fred') ||
      name.includes('lee')
    ) {
      return 'male';
    }
    
    // Default to neutral if can't determine
    return 'neutral';
  };

  // Process the speech queue
  const processQueue = useCallback(async () => {
    if (processingRef.current || queueRef.current.length === 0 || !synthesis.current || !isSupported) {
      return;
    }
    
    processingRef.current = true;
    
    const text = queueRef.current[0];
    setCurrentText(text);
    
    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;
    
    // Set utterance properties
    utterance.rate = optionsRef.current.rate || 1;
    utterance.pitch = optionsRef.current.pitch || 1;
    utterance.volume = optionsRef.current.volume || 1;
    
    // Set language from options or selected voice
    utterance.lang = optionsRef.current.lang || (selectedVoice ? selectedVoice.lang : 'en-US');
    
    // Set voice if available
    if (selectedVoice) {
      const synth = synthesis.current;
      const voices = synth.getVoices();
      const matchedVoice = voices.find(v => v.voiceURI === selectedVoice.voiceURI);
      
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
    }
    
    // Set event handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      optionsRef.current.onStart && optionsRef.current.onStart();
    };
    
    utterance.onend = () => {
      // Remove the spoken text from the queue
      queueRef.current.shift();
      
      setIsSpeaking(false);
      setIsPaused(false);
      optionsRef.current.onEnd && optionsRef.current.onEnd();
      
      processingRef.current = false;
      
      // Process next item in queue
      if (queueRef.current.length > 0) {
        processQueue();
      }
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setError(event);
      optionsRef.current.onError && optionsRef.current.onError(event);
      
      // Continue with the next item even if there was an error
      queueRef.current.shift();
      setIsSpeaking(false);
      processingRef.current = false;
      
      // Process next item in queue
      if (queueRef.current.length > 0) {
        processQueue();
      }
    };
    
    utterance.onpause = () => {
      setIsPaused(true);
      optionsRef.current.onPause && optionsRef.current.onPause();
    };
    
    utterance.onresume = () => {
      setIsPaused(false);
      optionsRef.current.onResume && optionsRef.current.onResume();
    };
    
    utterance.onmark = (event) => {
      optionsRef.current.onMark && optionsRef.current.onMark(event.name);
    };
    
    utterance.onboundary = (event) => {
      // Update progress information
      setSpeakingProgress({
        word: event.charIndex,
        sentence: 0, // Not provided by browser API
        character: event.charIndex
      });
      
      optionsRef.current.onBoundary && optionsRef.current.onBoundary(event);
    };
    
    // Speak the utterance
    try {
      synthesis.current.speak(utterance);
    } catch (err) {
      console.error('Error in speech synthesis:', err);
      setError(err);
      processingRef.current = false;
    }
  }, [isSupported, selectedVoice]);

  // Function to speak text
  const speak = useCallback((text: string) => {
    if (!isSupported) return;
    
    // Add text to the queue
    queueRef.current.push(text);
    
    // Process the queue if not already processing
    if (!processingRef.current) {
      processQueue();
    }
  }, [isSupported, processQueue]);

  // Function to speak text immediately (cancel any ongoing speech)
  const speakNow = useCallback((text: string) => {
    if (!isSupported || !synthesis.current) return;
    
    // Cancel any ongoing speech
    synthesis.current.cancel();
    
    // Clear the queue and add new text
    queueRef.current = [text];
    processingRef.current = false;
    
    // Process the queue
    processQueue();
  }, [isSupported, processQueue]);

  // Function to stop speaking
  const stop = useCallback(() => {
    if (!isSupported || !synthesis.current) return;
    
    synthesis.current.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    processingRef.current = false;
    
    // Clear the queue
    queueRef.current = [];
  }, [isSupported]);

  // Function to pause speaking
  const pause = useCallback(() => {
    if (!isSupported || !synthesis.current) return;
    
    if (isSpeaking && !isPaused) {
      synthesis.current.pause();
      setIsPaused(true);
    }
  }, [isSupported, isSpeaking, isPaused]);

  // Function to resume speaking
  const resume = useCallback(() => {
    if (!isSupported || !synthesis.current) return;
    
    if (isPaused) {
      synthesis.current.resume();
      setIsPaused(false);
    }
  }, [isSupported, isPaused]);

  // Function to select a voice
  const selectVoice = useCallback((voiceURI: string) => {
    const voice = availableVoices.find(v => v.voiceURI === voiceURI);
    if (voice) {
      setSelectedVoice(voice);
    }
  }, [availableVoices]);

  // Function to change speech rate
  const setRate = useCallback((rate: number) => {
    optionsRef.current.rate = Math.max(0.1, Math.min(10, rate));
  }, []);

  // Function to change speech pitch
  const setPitch = useCallback((pitch: number) => {
    optionsRef.current.pitch = Math.max(0, Math.min(2, pitch));
  }, []);

  // Function to change speech volume
  const setVolume = useCallback((volume: number) => {
    optionsRef.current.volume = Math.max(0, Math.min(1, volume));
  }, []);

  // Function to change speech language
  const setLanguage = useCallback((lang: string) => {
    optionsRef.current.lang = lang;
    
    // Optionally select a voice from the new language
    const voiceWithLang = availableVoices.find(v => v.lang === lang && v.default) || 
                         availableVoices.find(v => v.lang === lang);
    
    if (voiceWithLang) {
      setSelectedVoice(voiceWithLang);
    }
  }, [availableVoices]);

  // Function to get voices filtered by criteria
  const getVoicesByLang = useCallback((lang?: string, gender?: 'male' | 'female' | 'neutral') => {
    let filtered = [...availableVoices];
    
    if (lang) {
      filtered = filtered.filter(v => v.lang.startsWith(lang));
    }
    
    if (gender) {
      filtered = filtered.filter(v => v.gender === gender);
    }
    
    return filtered;
  }, [availableVoices]);

  // Function to speak text with emotion
  const speakWithEmotion = useCallback((text: string, emotion: string = 'neutral') => {
    if (!isSupported || !text) return;
    
    // Adjust voice parameters based on emotion
    const emotionSettings: {[key: string]: {rate: number, pitch: number}} = {
      happy: { rate: 1.1, pitch: 1.1 },
      excited: { rate: 1.2, pitch: 1.2 },
      sad: { rate: 0.9, pitch: 0.9 },
      depressed: { rate: 0.8, pitch: 0.85 },
      angry: { rate: 1.1, pitch: 0.8 },
      anxious: { rate: 1.15, pitch: 1.05 },
      calm: { rate: 0.95, pitch: 1.0 },
      neutral: { rate: 1.0, pitch: 1.0 },
      fear: { rate: 1.1, pitch: 1.1 },
      empathetic: { rate: 0.95, pitch: 1.05 },
      confident: { rate: 1.05, pitch: 1.0 },
      curious: { rate: 1.0, pitch: 1.1 }
    };

    const settings = emotionSettings[emotion.toLowerCase()] || emotionSettings.neutral;
    
    // Set voice parameters
    setRate(settings.rate);
    setPitch(settings.pitch);
    
    // Speak the text
    speakNow(text);
  }, [isSupported, speakNow, setRate, setPitch]);

  // Function to set voice gender
  const setVoiceGender = useCallback((gender: 'male' | 'female' | 'neutral') => {
    const voices = getVoicesByLang('en', gender);
    if (voices.length > 0) {
      selectVoice(voices[0].voiceURI);
    }
  }, [getVoicesByLang, selectVoice]);

  // Function to set speaking rate
  const setSpeakingRate = useCallback((rate: number) => {
    setRate(Math.max(0.1, Math.min(10, rate)));
  }, [setRate]);

  // Return the text-to-speech state and functions
  return {
    isSpeaking,
    isPaused,
    isSupported,
    availableVoices,
    selectedVoice,
    error,
    currentText,
    speakingProgress,
    speak,
    speakNow,
    speakWithEmotion,
    stop,
    pause,
    resume,
    selectVoice,
    setRate,
    setPitch,
    setVolume,
    setLanguage,
    getVoicesByLang,
    setVoiceGender,
    setSpeakingRate
  };
}; 