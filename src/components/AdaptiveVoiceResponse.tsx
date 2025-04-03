import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Volume2, VolumeX, RefreshCw } from 'lucide-react';
import { useHybridVoice } from '@/hooks/useHybridVoice';

interface VoiceSettings {
  pitch: number;
  rate: number;
  volume: number;
}

// Define emotion-based voice settings
const emotionVoiceSettings: Record<string, VoiceSettings> = {
  neutral: { pitch: 1.0, rate: 1.0, volume: 0.8 },
  happy: { pitch: 1.2, rate: 1.15, volume: 0.9 },
  sad: { pitch: 0.8, rate: 0.85, volume: 0.7 },
  angry: { pitch: 1.1, rate: 1.2, volume: 0.9 },
  anxious: { pitch: 1.15, rate: 1.3, volume: 0.75 },
  calm: { pitch: 0.9, rate: 0.9, volume: 0.7 }
};

// Define emotion-based response templates
const responseTemplates: Record<string, string[]> = {
  neutral: [
    "I notice you sound fairly neutral. How are you feeling today?",
    "Your tone seems balanced. Would you like to talk about anything specific?",
    "I'm here to listen. What's on your mind right now?"
  ],
  happy: [
    "I'm glad to hear you sounding positive! What's contributing to your good mood?",
    "Your upbeat tone is wonderful to hear. What's been going well for you?",
    "I notice you sound happy - that's great! Would you like to share what's bringing you joy?"
  ],
  sad: [
    "I sense some sadness in your voice. Would you like to talk about what's troubling you?",
    "I'm here for you if you're feeling down. Sometimes talking it through can help.",
    "Your tone suggests you might be feeling a bit low. Is there something specific on your mind?"
  ],
  angry: [
    "I notice some tension in your voice. Would it help to talk about what's frustrating you?",
    "It sounds like you might be feeling upset about something. I'm here to listen without judgment.",
    "When strong emotions arise, it can help to take a few deep breaths before continuing. Would you like to try that together?"
  ],
  anxious: [
    "I'm noticing what sounds like some anxiety in your voice. Would you like to discuss what's causing you worry?",
    "Sometimes when we feel anxious, grounding techniques can help. Would you like me to guide you through one?",
    "Your tone suggests you might be feeling a bit on edge. Is there something specific that's concerning you?"
  ],
  calm: [
    "You sound quite centered today. Is this a good time to explore some deeper topics?",
    "Your calm tone is wonderful to hear. This seems like a good opportunity for reflection.",
    "I notice a peaceful quality in your voice. Would you like to use this centered state to discuss any current challenges?"
  ]
};

interface AdaptiveVoiceResponseProps {
  detectedEmotion?: string;
  onRespond?: (text: string) => void;
}

export function AdaptiveVoiceResponse({ 
  detectedEmotion = 'neutral',
  onRespond
}: AdaptiveVoiceResponseProps) {
  const [currentSettings, setCurrentSettings] = useState<VoiceSettings>(emotionVoiceSettings.neutral);
  const [isMuted, setIsMuted] = useState(false);
  const [adaptationLevel, setAdaptationLevel] = useState(70); // 0-100 scale
  const [responseText, setResponseText] = useState<string>('');
  const { speakText, isLoading, stop } = useHybridVoice();
  
  // Update settings when emotion changes
  useEffect(() => {
    if (detectedEmotion && emotionVoiceSettings[detectedEmotion]) {
      // Blend between neutral and detected emotion based on adaptation level
      const targetSettings = emotionVoiceSettings[detectedEmotion];
      const neutralSettings = emotionVoiceSettings.neutral;
      
      const blendedSettings = {
        pitch: neutralSettings.pitch + ((targetSettings.pitch - neutralSettings.pitch) * (adaptationLevel / 100)),
        rate: neutralSettings.rate + ((targetSettings.rate - neutralSettings.rate) * (adaptationLevel / 100)),
        volume: neutralSettings.volume + ((targetSettings.volume - neutralSettings.volume) * (adaptationLevel / 100))
      };
      
      setCurrentSettings(blendedSettings);
      
      // Get a random response template for the emotion
      const templates = responseTemplates[detectedEmotion] || responseTemplates.neutral;
      const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
      setResponseText(randomTemplate);
    }
  }, [detectedEmotion, adaptationLevel]);
  
  const handleSpeak = () => {
    if (isMuted || !responseText) return;
    
    // Use voice settings
    speakText(responseText, {
      pitch: currentSettings.pitch,
      rate: currentSettings.rate,
      volume: currentSettings.volume
    });
    
    if (onRespond) {
      onRespond(responseText);
    }
  };
  
  const handleStop = () => {
    stop();
  };
  
  const toggleMute = () => {
    setIsMuted(prev => !prev);
    if (!isMuted) {
      handleStop();
    }
  };
  
  const generateNewResponse = () => {
    // Get a new random response template for the current emotion
    const templates = responseTemplates[detectedEmotion] || responseTemplates.neutral;
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    setResponseText(randomTemplate);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Adaptive Voice Response</CardTitle>
        <CardDescription>
          Voice tone adjusts to match your emotional state
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="bg-muted p-3 rounded-md min-h-[80px] relative">
            <p className="text-sm">{responseText}</p>
            <div className="absolute bottom-2 right-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0" 
                onClick={generateNewResponse}
              >
                <RefreshCw className="h-3 w-3" />
                <span className="sr-only">Generate new response</span>
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Emotional Adaptation</span>
              <span className="text-xs text-muted-foreground">{adaptationLevel}%</span>
            </div>
            <Slider
              value={[adaptationLevel]}
              min={0}
              max={100}
              step={5}
              onValueChange={(values) => setAdaptationLevel(values[0])}
            />
            <p className="text-xs text-muted-foreground">
              Adjusts how strongly the voice adapts to detected emotions
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Voice Settings</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="h-8 w-8 p-0"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
                <span className="sr-only">{isMuted ? 'Unmute' : 'Mute'}</span>
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <span className="text-xs">Pitch</span>
                <p className="text-sm font-medium">{currentSettings.pitch.toFixed(2)}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs">Rate</span>
                <p className="text-sm font-medium">{currentSettings.rate.toFixed(2)}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs">Volume</span>
                <p className="text-sm font-medium">{currentSettings.volume.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              onClick={handleSpeak} 
              className="flex-1"
              disabled={isMuted || isLoading}
            >
              Speak Response
            </Button>
            <Button 
              variant="outline" 
              onClick={handleStop}
              disabled={!isLoading}
            >
              Stop
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 