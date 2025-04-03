import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Emotion types that can be detected
type Emotion = 'neutral' | 'happy' | 'sad' | 'angry' | 'anxious' | 'calm';

// Simulated emotion detection (in a real app this would use a proper ML model)
const detectEmotion = (audioInput: string): Emotion => {
  // This is a placeholder for actual emotion detection
  // In a real implementation, this would analyze audio features
  
  // For demonstration purposes, return a random emotion
  const emotions: Emotion[] = ['neutral', 'happy', 'sad', 'angry', 'anxious', 'calm'];
  return emotions[Math.floor(Math.random() * emotions.length)];
};

interface EmotionVoiceDetectorProps {
  onEmotionDetected?: (emotion: Emotion) => void;
}

export function EmotionVoiceDetector({ onEmotionDetected }: EmotionVoiceDetectorProps) {
  const [isListening, setIsListening] = useState(false);
  const [emotion, setEmotion] = useState<Emotion>('neutral');
  const [confidenceScores, setConfidenceScores] = useState<Record<Emotion, number>>({
    neutral: 25,
    happy: 15,
    sad: 10,
    angry: 5,
    anxious: 20,
    calm: 25
  });
  const [audioSample, setAudioSample] = useState<string>('');
  
  // Simulated audio capture
  useEffect(() => {
    if (isListening) {
      const interval = setInterval(() => {
        // Simulate increasing audio sample
        setAudioSample(prev => prev + ' sample');
        
        // Every few seconds, update emotion detection
        if (Math.random() > 0.7) {
          const detectedEmotion = detectEmotion(audioSample);
          setEmotion(detectedEmotion);
          
          // Generate random confidence scores
          const newScores: Record<Emotion, number> = {
            neutral: Math.floor(Math.random() * 30),
            happy: Math.floor(Math.random() * 30),
            sad: Math.floor(Math.random() * 30),
            angry: Math.floor(Math.random() * 30),
            anxious: Math.floor(Math.random() * 30),
            calm: Math.floor(Math.random() * 30)
          };
          
          // Ensure detected emotion has highest confidence
          const otherEmotionsSum = Object.entries(newScores)
            .filter(([key]) => key !== detectedEmotion)
            .reduce((sum, [_, value]) => sum + value, 0);
          
          newScores[detectedEmotion] = Math.min(100 - otherEmotionsSum, 70);
          
          setConfidenceScores(newScores);
          
          if (onEmotionDetected) {
            onEmotionDetected(detectedEmotion);
          }
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isListening, audioSample, onEmotionDetected]);
  
  const toggleListening = () => {
    setIsListening(prev => !prev);
  };
  
  // Helper to get color for emotion
  const getEmotionColor = (emotion: Emotion): string => {
    switch (emotion) {
      case 'happy': return 'bg-green-100 text-green-800 border-green-200';
      case 'sad': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'angry': return 'bg-red-100 text-red-800 border-red-200';
      case 'anxious': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'calm': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Voice Emotion Detection</span>
          <Badge variant="outline" className={getEmotionColor(emotion)}>
            {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
          </Badge>
        </CardTitle>
        <CardDescription>
          Analyzes your voice tone to detect emotional patterns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button
            onClick={toggleListening}
            variant={isListening ? "destructive" : "default"}
            className="w-full"
          >
            {isListening ? (
              <>
                <MicOff className="mr-2 h-4 w-4" />
                Stop Listening
              </>
            ) : (
              <>
                <Mic className="mr-2 h-4 w-4" />
                Start Voice Analysis
              </>
            )}
          </Button>
          
          {isListening && (
            <div className="flex items-center justify-center p-4">
              <Volume2 className="h-6 w-6 text-primary animate-pulse" />
            </div>
          )}
          
          <div className="space-y-3">
            <p className="text-sm font-medium">Emotion Confidence</p>
            
            {Object.entries(confidenceScores).map(([key, value]) => (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                  <span>{value}%</span>
                </div>
                <Progress value={value} className="h-1" />
              </div>
            ))}
          </div>
          
          <p className="text-xs text-muted-foreground mt-2">
            This demonstration uses simulated emotion detection. In a production environment, 
            it would use advanced voice analysis algorithms.
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 