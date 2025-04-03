import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Brain, ArrowRight, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TherapeuticInterventions, therapeuticApproaches, TherapeuticApproach } from './TherapeuticInterventions';
import { TechniqueData } from './TherapyTechniques';
import { Message } from '@/types/chat';
import { useLocalStorage } from '@/hooks/useLocalStorage';

// Emotional theme detection patterns
const EMOTIONAL_THEMES = {
  anxiety: [
    'worry', 'anxious', 'nervous', 'stress', 'tense', 'panic', 'fear', 'scared', 'restless',
    'overthinking', 'what if', 'uncertain', 'scary', 'afraid', 'uneasy', 'apprehensive',
    'can\'t relax', 'on edge', 'racing thoughts', 'heart racing'
  ],
  depression: [
    'sad', 'depressed', 'hopeless', 'empty', 'tired', 'exhausted', 'unmotivated', 
    'worthless', 'no energy', 'no interest', 'no motivation', 'despair', 'alone', 'lonely',
    'dark', 'giving up', 'pointless', 'no purpose', 'can\'t enjoy', 'numb'
  ],
  anger: [
    'angry', 'frustrated', 'mad', 'irritated', 'annoyed', 'rage', 'furious', 'hate',
    'resent', 'bitter', 'resentful', 'hostile', 'agitated', 'upset', 'outburst',
    'snap', 'fed up', 'had enough', 'explode', 'short-tempered'
  ],
  grief: [
    'grief', 'loss', 'miss', 'missing', 'gone', 'passed away', 'death', 'died', 
    'mourning', 'bereavement', 'lost', 'no longer have', 'taken from me', 
    'never see again', 'heartbreak', 'heartbroken', 'devastating', 'void'
  ],
  shame: [
    'shame', 'guilty', 'embarrassed', 'humiliated', 'ashamed', 'failure', 'inadequate',
    'not good enough', 'stupid', 'weak', 'pathetic', 'worthless', 'disgusted',
    'disappointed in myself', 'let down', 'shouldn\'t have', 'regret', 'made a mistake'
  ],
  relationship: [
    'relationship', 'partner', 'spouse', 'boyfriend', 'girlfriend', 'husband', 'wife',
    'dating', 'broke up', 'divorce', 'separated', 'fighting', 'argument', 'conflict',
    'misunderstood', 'rejected', 'cheating', 'trust', 'communication', 'disconnected'
  ],
  trauma: [
    'trauma', 'traumatic', 'flashback', 'nightmare', 'abuse', 'abused', 'assault',
    'attacked', 'violence', 'accident', 'disaster', 'emergency', 'crisis', 'ptsd',
    'triggered', 'unsafe', 'danger', 'threatened', 'helpless', 'control', 'trapped'
  ],
  selfEsteem: [
    'confidence', 'self-esteem', 'insecure', 'not good enough', 'compare', 'inferior',
    'ugly', 'fat', 'unattractive', 'rejected', 'unwanted', 'unloved', 'unworthy',
    'undeserving', 'criticized', 'judged', 'embarrassed', 'self-conscious', 'approval'
  ]
};

// Key therapeutic techniques by theme
const THEME_TO_TECHNIQUES: Record<string, string[]> = {
  anxiety: ['deep-breathing', 'grounding', 'mindfulness', 'cognitive-reframing'],
  depression: ['behavioral-activation', 'values-clarification', 'self-compassion', 'gratitude'],
  anger: ['cognitive-reframing', 'deep-breathing', 'mindfulness', 'self-compassion'],
  grief: ['self-compassion', 'mindfulness', 'values-clarification', 'gratitude'],
  shame: ['self-compassion', 'cognitive-reframing', 'values-clarification', 'mindfulness'],
  relationship: ['values-clarification', 'cognitive-reframing', 'self-compassion', 'mindfulness'],
  trauma: ['grounding', 'deep-breathing', 'mindfulness', 'self-compassion'],
  selfEsteem: ['self-compassion', 'cognitive-reframing', 'values-clarification', 'gratitude']
};

// Key therapeutic approaches by theme
const THEME_TO_APPROACHES: Record<string, string[]> = {
  anxiety: ['cbt', 'mindfulness', 'acceptance-commitment'],
  depression: ['cbt', 'positive-psychology', 'behavioral-activation'],
  anger: ['cbt', 'dbt', 'mindfulness'],
  grief: ['acceptance-commitment', 'mindfulness', 'positive-psychology'],
  shame: ['cbt', 'acceptance-commitment', 'self-compassion'],
  relationship: ['dbt', 'acceptance-commitment', 'cbt'],
  trauma: ['trauma-focused', 'mindfulness', 'dbt'],
  selfEsteem: ['cbt', 'positive-psychology', 'acceptance-commitment']
};

interface InterventionRecommenderProps {
  messages: Message[];
  userId: string;
  className?: string;
  onTechniqueSelected?: (technique: TechniqueData) => void;
  onApproachSelected?: (approach: TherapeuticApproach) => void;
}

export const InterventionRecommender: React.FC<InterventionRecommenderProps> = ({
  messages,
  userId,
  className,
  onTechniqueSelected,
  onApproachSelected
}) => {
  // State for detected emotions and themes
  const [emotionData, setEmotionData] = useState<{
    primaryEmotion: string;
    secondaryEmotion: string;
    intensityLevel: string;
    emotionalThemes: string[];
    recommendedTechniques: string[];
  } | null>(null);
  
  // State for intervention visibility
  const [showInterventions, setShowInterventions] = useState(false);
  
  // State for user dismissed interventions
  const [dismissedInterventions, setDismissedInterventions] = useLocalStorage<string[]>(
    `dismissed-interventions-${userId}`,
    []
  );
  
  // Last analysis timestamp to prevent too frequent updates
  const [lastAnalysisTime, setLastAnalysisTime] = useState<number>(0);
  
  // Analyze messages for emotional themes
  useEffect(() => {
    // Skip if no messages or analysis was done recently (within 30 seconds)
    if (!messages.length || Date.now() - lastAnalysisTime < 30000) return;
    
    // Only analyze user messages from the last 10 exchanges
    const recentUserMessages = messages
      .filter(msg => msg.role === 'user')
      .slice(-10)
      .map(msg => msg.content.toLowerCase());
    
    if (!recentUserMessages.length) return;
    
    // Combine all recent messages into a single text for analysis
    const combinedText = recentUserMessages.join(' ');
    
    // Detect emotional themes
    const themeScores: Record<string, number> = {};
    Object.entries(EMOTIONAL_THEMES).forEach(([theme, keywords]) => {
      let score = 0;
      keywords.forEach(keyword => {
        // Count keyword occurrences with word boundary check
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = combinedText.match(regex);
        if (matches) {
          // Increase score based on frequency and recency
          score += matches.length;
        }
      });
      themeScores[theme] = score;
    });
    
    // Sort themes by score
    const sortedThemes = Object.entries(themeScores)
      .filter(([_, score]) => score > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([theme]) => theme);
    
    // Only proceed if we have detected themes
    if (sortedThemes.length === 0) return;
    
    // Map top themes to primary and secondary emotions
    const primaryTheme = sortedThemes[0];
    const secondaryTheme = sortedThemes[1] || primaryTheme;
    
    // Simple mapping from theme to emotion label
    const themeToEmotion: Record<string, string> = {
      anxiety: 'anxious',
      depression: 'depressed',
      anger: 'angry',
      grief: 'grieving',
      shame: 'ashamed',
      relationship: 'conflicted',
      trauma: 'traumatized',
      selfEsteem: 'insecure'
    };
    
    // Determine intensity based on score and message count
    const primaryScore = themeScores[primaryTheme];
    let intensityLevel = 'mild';
    if (primaryScore > 15) intensityLevel = 'very high';
    else if (primaryScore > 10) intensityLevel = 'high';
    else if (primaryScore > 5) intensityLevel = 'moderate';
    
    // Get recommended techniques for primary theme
    const recommendedTechniques = THEME_TO_TECHNIQUES[primaryTheme] || [];
    
    // Update emotion data
    setEmotionData({
      primaryEmotion: themeToEmotion[primaryTheme] || primaryTheme,
      secondaryEmotion: themeToEmotion[secondaryTheme] || secondaryTheme,
      intensityLevel,
      emotionalThemes: sortedThemes,
      recommendedTechniques
    });
    
    // Show interventions if intensity is moderate or higher
    if (['moderate', 'high', 'very high'].includes(intensityLevel)) {
      setShowInterventions(true);
    }
    
    // Update last analysis time
    setLastAnalysisTime(Date.now());
  }, [messages, lastAnalysisTime]);
  
  // Handle dismissing the intervention
  const handleDismiss = () => {
    if (emotionData) {
      setDismissedInterventions(prev => 
        [...prev, `${emotionData.primaryEmotion}-${Date.now()}`]
      );
    }
    setShowInterventions(false);
  };
  
  // Handle intervention completion
  const handleInterventionComplete = () => {
    setShowInterventions(false);
  };
  
  if (!showInterventions || !emotionData) {
    return null;
  }
  
  // Check if recently dismissed (within last hour)
  const recentlyDismissed = dismissedInterventions.some(item => {
    const [emotion, timestamp] = item.split('-');
    return emotion === emotionData.primaryEmotion && 
           Date.now() - parseInt(timestamp) < 3600000; // 1 hour
  });
  
  if (recentlyDismissed) {
    return null;
  }
  
  return (
    <div className={cn("w-full my-4", className)}>
      <Card className="border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              Suggested Therapeutic Support
            </div>
            <Badge variant={emotionData.intensityLevel === 'high' || emotionData.intensityLevel === 'very high' ? "destructive" : "outline"}>
              {emotionData.intensityLevel.charAt(0).toUpperCase() + emotionData.intensityLevel.slice(1)} intensity
            </Badge>
          </CardTitle>
          <CardDescription>
            I notice you may be feeling <span className="font-medium">{emotionData.primaryEmotion}</span>
            {emotionData.secondaryEmotion && emotionData.secondaryEmotion !== emotionData.primaryEmotion 
              ? ` and possibly ${emotionData.secondaryEmotion}` 
              : ''
            }. Would you like to try some evidence-based techniques?
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <TherapeuticInterventions
            emotionData={emotionData}
            userId={userId}
            onTechniqueSelected={onTechniqueSelected}
            onApproachSelected={onApproachSelected}
          />
        </CardContent>
        
        <CardFooter className="justify-end gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleDismiss}
          >
            Dismiss
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleInterventionComplete}
          >
            I'll try these later
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}; 