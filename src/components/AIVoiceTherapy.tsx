import React, { useState, useCallback, useEffect } from 'react';
import { Box } from '@mui/material';
import { useEnhancedSpeechToText } from '../utils/enhancedSpeechToText';
import { useHybridVoice } from '../hooks/useHybridVoice';
import { HybridVoiceControl } from './HybridVoiceControl';
import { useAuth } from '../contexts/AuthContext';

interface AIVoiceTherapyProps {
  onUserSpeech: (text: string) => void;
  onAIResponse: (text: string) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

export const AIVoiceTherapy: React.FC<AIVoiceTherapyProps> = ({
  onUserSpeech,
  onAIResponse,
  disabled = false,
  className
}) => {
  // Settings state
  const [voiceType, setVoiceType] = useState<'male' | 'female' | 'neutral'>('female');
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  
  // Get user from auth context
  const { user } = useAuth();
  
  // Enhanced speech to text
  const {
    isListening,
    isSupported: isSTTSupported,
    transcript,
    interimTranscript,
    error: sttError,
    startListening,
    stopListening,
    clearTranscript
  } = useEnhancedSpeechToText({
    continuous: true,
    interimResults: true,
    language: 'en-US'
  });

  // Hybrid voice system
  const hybridVoice = useHybridVoice({
    premium: true,
    premiumThreshold: 0.7,
    defaultVoiceGender: voiceType,
    defaultModel: 'tts-1'
  });
  
  // Browser support check
  const isBrowserSupported = isSTTSupported && !!window.speechSynthesis;

  // Effect to handle sending transcript to onUserSpeech when user stops speaking
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (transcript && !isListening && !disabled) {
      timer = setTimeout(() => {
        onUserSpeech(transcript);
        clearTranscript();
      }, 800);
    }
    return () => clearTimeout(timer);
  }, [transcript, isListening, onUserSpeech, clearTranscript, disabled]);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (disabled) return;
    
    if (isListening) {
      stopListening();
    } else {
      clearTranscript();
      startListening();
    }
  }, [isListening, startListening, stopListening, clearTranscript, disabled]);

  // Handle voice type change
  const handleVoiceTypeChange = useCallback((type: 'male' | 'female' | 'neutral') => {
    setVoiceType(type);
    hybridVoice.setBrowserVoice(type);
  }, [hybridVoice]);

  // Handle speech rate change
  const handleRateChange = useCallback((rate: number) => {
    setSpeechRate(rate);
    hybridVoice.setRate(rate);
  }, [hybridVoice]);

  // Speak AI response
  const speakResponse = useCallback(async (text: string) => {
    if (!text || disabled) return;
    
    // Simple emotion detection based on content
    let emotion = 'neutral';
    
    if (text.includes('sorry') || text.includes('understand your frustration')) {
      emotion = 'empathetic';
    } else if (text.includes('great') || text.includes('excellent') || text.includes('wonderful')) {
      emotion = 'happy';
    } else if (text.includes('let\'s explore') || text.includes('consider')) {
      emotion = 'curious';
    } else if (text.includes('breathe') || text.includes('relax')) {
      emotion = 'calm';
    } else if (text.includes('important to remember') || text.includes('I want you to know')) {
      emotion = 'supportive';
    }
    
    // Estimate emotional intensity
    const emotionData = {
      dominant: emotion,
      intensity: emotion === 'neutral' ? 0.3 : 0.8
    };
    
    // Speak using the hybrid voice system
    hybridVoice.speak(text, emotion, emotionData);
  }, [hybridVoice, disabled]);

  // Provide method to speak AI responses
  useEffect(() => {
    const handleAIResponseWrapped = async (text: string) => {
      await onAIResponse(text);
      if (!disabled) {
        speakResponse(text);
      }
    };

    // This effect exports the wrapped handler via the onAIResponse prop
    onAIResponse = handleAIResponseWrapped;
  }, [speakResponse, onAIResponse, disabled]);

  // Error handling and support checking
  if (!isBrowserSupported) {
    return (
      <Box className={className} sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText', borderRadius: 1 }}>
        Voice capabilities are not supported in your browser. Please try using Chrome, Edge, or Safari.
      </Box>
    );
  }

  return (
    <Box className={className} sx={{ width: '100%' }}>
      <HybridVoiceControl
        onUserSpeech={onUserSpeech}
        onToggleListen={toggleListening}
        isListening={isListening}
        isSpeaking={hybridVoice.isSpeaking}
        isPremiumActive={hybridVoice.isPremium}
        isLoading={hybridVoice.isLoading}
        error={hybridVoice.error || sttError?.message}
        premiumVoiceUsed={hybridVoice.premiumVoiceUsed}
        premiumVoiceQuota={hybridVoice.premiumVoiceQuota}
        onVoiceTypeChange={handleVoiceTypeChange}
        onRateChange={handleRateChange}
        voiceType={voiceType}
        speechRate={speechRate}
        onStop={hybridVoice.stop}
        transcript={transcript}
        interimTranscript={interimTranscript}
      />
    </Box>
  );
}; 