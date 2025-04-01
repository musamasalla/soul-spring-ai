
import { useState, useEffect } from 'react';

interface TextToSpeechProps {
  rate?: number;
  pitch?: number;
  volume?: number;
}

export const useTextToSpeech = (options: TextToSpeechProps = {}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    // Initialize available voices
    const initVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        
        // Try to find a good default English voice
        const defaultVoice = availableVoices.find(
          voice => voice.lang.includes('en') && voice.name.includes('Google') && !voice.name.includes('Male')
        ) || availableVoices[0];
        
        setSelectedVoice(defaultVoice);
      }
    };

    // Handle voice list changes
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      // Get initial voices - needed for Chrome
      initVoices();
      
      // Chrome loads voices asynchronously
      window.speechSynthesis.onvoiceschanged = initVoices;
      
      // Clean up
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }
      };
    }
  }, []);

  const speakText = (text: string) => {
    if (!text || typeof window === 'undefined' || !window.speechSynthesis) return;
    
    // Cancel any ongoing speech
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Apply voice if selected
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    // Apply options
    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;
    
    // Event handlers
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return {
    isSpeaking,
    speakText,
    stopSpeaking,
    voices,
    selectedVoice,
    setSelectedVoice
  };
};
