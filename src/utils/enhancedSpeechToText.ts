import { useState, useEffect, useRef, useCallback } from 'react';

// Type definitions for Web Speech API that aren't fully available in TypeScript
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
  error?: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onstart: () => void;
  onend: () => void;
  start(): void;
  stop(): void;
  abort(): void;
}

// Make constructor available globally
interface SpeechRecognitionConstructor {
  new(): SpeechRecognition;
  prototype: SpeechRecognition;
}

// Define interfaces for the hook
interface SpeechToTextOptions {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
  autoStart?: boolean;
}

/**
 * Enhanced speech-to-text hook that uses the Web Speech API with
 * improved error handling and better management of different states
 */
export const useEnhancedSpeechToText = (options: SpeechToTextOptions = {}) => {
  const {
    continuous = false,
    interimResults = true,
    language = 'en-US',
    autoStart = false,
  } = options;

  // Track browser support
  const [isSupported, setIsSupported] = useState<boolean>(false);
  
  // State management
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [error, setError] = useState<Error | null>(null);
  
  // Refs for speech recognition instance
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  // Function to determine browser support
  useEffect(() => {
    // Check for browser support
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      setIsSupported(true);
    } else {
      setIsSupported(false);
      setError(new Error('Speech recognition is not supported in this browser.'));
    }
  }, []);

  // Initialize speech recognition
  const initRecognition = useCallback(() => {
    if (!isSupported) return;
    
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    
    recognitionRef.current = new SpeechRecognitionAPI();
    
    if (recognitionRef.current) {
      recognitionRef.current.continuous = continuous;
      recognitionRef.current.interimResults = interimResults;
      recognitionRef.current.lang = language;
      
      // Handle results
      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimText = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimText += transcript;
          }
        }
        
        if (finalTranscript) {
          setTranscript(prev => {
            // Add space if appending to existing text
            const space = prev && !prev.endsWith(' ') ? ' ' : '';
            return prev + space + finalTranscript;
          });
        }
        
        setInterimTranscript(interimText);
      };
      
      // Handle start event
      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setError(null);
      };
      
      // Handle end event
      recognitionRef.current.onend = () => {
        // If we're in continuous mode and not manually stopped, restart
        if (continuous && isListening) {
          try {
            recognitionRef.current?.start();
          } catch (err) {
            console.error('Error restarting continuous speech recognition:', err);
            setIsListening(false);
          }
        } else {
          setIsListening(false);
        }
        
        // Add interim results to final transcript when stopping
        if (interimTranscript && !continuous) {
          setTranscript(prev => {
            const space = prev && !prev.endsWith(' ') ? ' ' : '';
            return prev + space + interimTranscript;
          });
          setInterimTranscript('');
        }
      };
      
      // Handle error event
      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        // Don't treat "no-speech" as an error in continuous mode
        if (event.error === 'no-speech' && continuous) {
          return;
        }
        
        // Map error codes to more user-friendly messages
        let errorMessage = 'Unknown speech recognition error';
        
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech was detected.';
            break;
          case 'aborted':
            errorMessage = 'Speech recognition was aborted.';
            break;
          case 'audio-capture':
            errorMessage = 'No microphone was found or microphone is not working.';
            break;
          case 'network':
            errorMessage = 'Network error occurred during speech recognition.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone permission was denied.';
            break;
          case 'service-not-allowed':
            errorMessage = 'Speech recognition service is not allowed.';
            break;
          case 'bad-grammar':
            errorMessage = 'Speech grammar error.';
            break;
          case 'language-not-supported':
            errorMessage = `The language ${language} is not supported.`;
            break;
        }
        
        setError(new Error(errorMessage));
        setIsListening(false);
      };
    }
  }, [continuous, interimResults, language, isSupported, interimTranscript, isListening]);

  // Start listening
  const startListening = useCallback(() => {
    if (!isSupported) {
      setError(new Error('Speech recognition is not supported in this browser.'));
      return;
    }
    
    try {
      initRecognition();
      recognitionRef.current?.start();
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      setError(err instanceof Error ? err : new Error('Failed to start speech recognition'));
      setIsListening(false);
    }
  }, [isSupported, initRecognition]);

  // Stop listening
  const stopListening = useCallback(() => {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } catch (err) {
      console.error('Error stopping speech recognition:', err);
    }
    
    setIsListening(false);
  }, []);

  // Clear transcript
  const clearTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  // Auto-start on mount if specified
  useEffect(() => {
    if (autoStart && isSupported) {
      startListening();
    }
    
    // Cleanup on unmount
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Ignore abort errors
        }
      }
    };
  }, [autoStart, isSupported, startListening]);

  return {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    clearTranscript
  };
};

// Add type definitions for Web Speech API (not fully available in TypeScript)
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
} 