
import { useState, useEffect } from 'react';

// Text-to-speech utility using Web Speech API
export const speak = (text: string, voice?: SpeechSynthesisVoice, rate = 1, pitch = 1) => {
  if (!window.speechSynthesis) {
    console.error('Text-to-speech is not supported in this browser.');
    return false;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  if (voice) {
    utterance.voice = voice;
  }
  
  utterance.rate = rate;
  utterance.pitch = pitch;
  
  window.speechSynthesis.speak(utterance);
  return true;
};

export const getAvailableVoices = (): Promise<SpeechSynthesisVoice[]> => {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) {
      resolve([]);
      return;
    }

    let voices = window.speechSynthesis.getVoices();
    
    if (voices.length) {
      resolve(voices);
      return;
    }

    // Chrome needs a bit of time to load voices
    window.speechSynthesis.onvoiceschanged = () => {
      voices = window.speechSynthesis.getVoices();
      resolve(voices);
    };
  });
};

// Custom hook for text-to-speech
export const useTextToSpeech = () => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  useEffect(() => {
    const loadVoices = async () => {
      const availableVoices = await getAvailableVoices();
      setVoices(availableVoices);
      
      // Select a default voice (preferably English)
      const englishVoice = availableVoices.find(voice => voice.lang.includes('en-'));
      if (englishVoice) {
        setSelectedVoice(englishVoice);
      } else if (availableVoices.length > 0) {
        setSelectedVoice(availableVoices[0]);
      }
    };
    
    loadVoices();
    
    const handleSpeakingChange = () => {
      setIsSpeaking(window.speechSynthesis.speaking);
    };
    
    // Check speaking status periodically
    const interval = setInterval(handleSpeakingChange, 100);
    
    return () => {
      clearInterval(interval);
      window.speechSynthesis.cancel();
    };
  }, []);
  
  const speakText = (text: string, rate = 1, pitch = 1) => {
    return speak(text, selectedVoice || undefined, rate, pitch);
  };
  
  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };
  
  return {
    voices,
    selectedVoice,
    setSelectedVoice,
    isSpeaking,
    speakText,
    stopSpeaking
  };
};
