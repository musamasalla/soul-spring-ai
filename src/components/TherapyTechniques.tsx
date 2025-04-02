import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Heart, Brain, MoveVertical, Timer, Lightbulb, Info, ExternalLink } from "lucide-react";
import { cn } from '@/lib/utils';
import { EmotionData } from './EmotionDetector';

interface TherapyTechniquesProps {
  recommendedTechniques?: string[];
  emotionData?: EmotionData;
  className?: string;
  onTechniqueSelected?: (technique: TechniqueData) => void;
}

export interface TechniqueData {
  id: string;
  name: string;
  description: string;
  duration: number;
  steps: string[];
  category: string;
  emotionTargets: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export const therapyTechniquesList: TechniqueData[] = [
  {
    id: 'grounding',
    name: '5-4-3-2-1 Grounding',
    description: 'A sensory awareness technique to help manage anxiety by connecting with your surroundings.',
    duration: 5,
    steps: [
      'Acknowledge 5 things you can see',
      'Acknowledge 4 things you can touch',
      'Acknowledge 3 things you can hear',
      'Acknowledge 2 things you can smell',
      'Acknowledge 1 thing you can taste'
    ],
    category: 'anxiety',
    emotionTargets: ['anxious', 'overwhelmed', 'panic'],
    difficulty: 'easy'
  },
  {
    id: 'deep-breathing',
    name: 'Deep Breathing',
    description: 'A breathing technique to reduce stress and promote relaxation through focused, deep breaths.',
    duration: 3,
    steps: [
      'Sit or lie down in a comfortable position',
      'Place one hand on your chest and the other on your abdomen',
      'Breathe in slowly through your nose for 4 seconds',
      'Hold your breath for 2 seconds',
      'Exhale slowly through your mouth for 6 seconds',
      'Repeat for at least 2 minutes'
    ],
    category: 'stress',
    emotionTargets: ['anxious', 'stressed', 'angry'],
    difficulty: 'easy'
  },
  {
    id: 'cognitive-reframing',
    name: 'Cognitive Reframing',
    description: 'Identify and challenge negative thought patterns to develop a more balanced perspective.',
    duration: 10,
    steps: [
      'Identify the negative thought',
      'Examine the evidence for and against this thought',
      'Consider alternative explanations or perspectives',
      'Develop a more balanced or realistic thought',
      'Notice how your feelings change with the new perspective'
    ],
    category: 'cognitive',
    emotionTargets: ['sad', 'anxious', 'frustrated'],
    difficulty: 'medium'
  },
  {
    id: 'self-compassion',
    name: 'Self-Compassion Practice',
    description: 'Treat yourself with the same kindness you would offer to a good friend during difficult times.',
    duration: 5,
    steps: [
      'Notice your suffering or discomfort',
      'Remind yourself that difficulty is part of the shared human experience',
      'Place your hands over your heart',
      'Offer yourself words of kindness and understanding',
      'Consider what you would say to a friend in this situation'
    ],
    category: 'emotional',
    emotionTargets: ['sad', 'self-critical', 'shame'],
    difficulty: 'medium'
  },
  {
    id: 'progressive-relaxation',
    name: 'Progressive Muscle Relaxation',
    description: 'Systematically tense and release muscle groups to reduce physical tension and anxiety.',
    duration: 15,
    steps: [
      'Find a comfortable position in a quiet place',
      'Take a few deep breaths',
      'Tense the muscles in your feet for 5 seconds, then release',
      'Work your way up through each muscle group: legs, abdomen, chest, arms, and face',
      'Notice the difference between tension and relaxation',
      'Take a few final deep breaths'
    ],
    category: 'physical',
    emotionTargets: ['anxious', 'tense', 'stressed'],
    difficulty: 'easy'
  },
  {
    id: 'gratitude',
    name: 'Gratitude Practice',
    description: "Shift focus to positive aspects of life by acknowledging things you're grateful for.",
    duration: 5,
    steps: [
      'Take a few moments to center yourself',
      'Identify 3-5 things you\'re grateful for today',
      'For each item, notice how it makes you feel in your body',
      'Consider writing these down in a gratitude journal',
      'Return to this practice regularly to build a habit'
    ],
    category: 'positive',
    emotionTargets: ['sad', 'disconnected', 'negative'],
    difficulty: 'easy'
  },
  {
    id: 'mindfulness',
    name: 'Mindfulness Meditation',
    description: 'Focus your attention on the present moment without judgment to reduce stress and anxiety.',
    duration: 10,
    steps: [
      'Find a comfortable sitting position',
      'Close your eyes or maintain a soft gaze',
      'Focus your attention on your breath',
      'When your mind wanders, gently bring it back to your breath',
      'Notice thoughts and feelings without judgment',
      'Continue for the desired length of time'
    ],
    category: 'meditation',
    emotionTargets: ['anxious', 'overwhelmed', 'distracted'],
    difficulty: 'medium'
  },
  {
    id: 'values-clarification',
    name: 'Values Clarification Exercise',
    description: 'Identify and connect with your core values to guide meaningful life decisions.',
    duration: 15,
    steps: [
      'Reflect on what matters most to you in life',
      'Consider different life domains: relationships, work, personal growth, etc.',
      'Identify 3-5 core values that resonate most strongly',
      'For each value, identify one small action that honors it',
      'Commit to taking one value-aligned action this week'
    ],
    category: 'existential',
    emotionTargets: ['confused', 'unmotivated', 'disconnected'],
    difficulty: 'hard'
  },
];

const techniqueCategoryIcons = {
  anxiety: <MoveVertical className="h-4 w-4" />,
  stress: <MoveVertical className="h-4 w-4" />,
  cognitive: <Brain className="h-4 w-4" />,
  emotional: <Heart className="h-4 w-4" />,
  physical: <MoveVertical className="h-4 w-4" />,
  positive: <Lightbulb className="h-4 w-4" />,
  meditation: <Brain className="h-4 w-4" />,
  existential: <Lightbulb className="h-4 w-4" />
};

const TherapyTechniques: React.FC<TherapyTechniquesProps> = ({
  recommendedTechniques = [],
  emotionData,
  className,
  onTechniqueSelected
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTechnique, setSelectedTechnique] = useState<TechniqueData | null>(null);
  const [showTechniqueDialog, setShowTechniqueDialog] = useState(false);

  // Filter techniques based on recommended ones, emotion data, and selected category
  const getFilteredTechniques = () => {
    let filtered = [...therapyTechniquesList];
    
    // If we have recommended techniques, prioritize them
    if (recommendedTechniques && recommendedTechniques.length > 0) {
      const lowerRecommended = recommendedTechniques.map(t => t.toLowerCase());
      filtered = filtered.sort((a, b) => {
        const aRecommended = lowerRecommended.some(r => a.name.toLowerCase().includes(r));
        const bRecommended = lowerRecommended.some(r => b.name.toLowerCase().includes(r));
        
        if (aRecommended && !bRecommended) return -1;
        if (!aRecommended && bRecommended) return 1;
        return 0;
      });
    }
    
    // Filter by selected category if not 'all'
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(technique => technique.category === selectedCategory);
    }
    
    // Further filter by emotion targets if we have emotion data
    if (emotionData?.primaryEmotion && emotionData.primaryEmotion !== 'neutral') {
      // Sort techniques by relevance to current emotion
      filtered = filtered.sort((a, b) => {
        const aTargets = a.emotionTargets.includes(emotionData.primaryEmotion);
        const bTargets = b.emotionTargets.includes(emotionData.primaryEmotion);
        
        if (aTargets && !bTargets) return -1;
        if (!aTargets && bTargets) return 1;
        return 0;
      });
    }
    
    return filtered;
  };

  const handleTechniqueClick = (technique: TechniqueData) => {
    setSelectedTechnique(technique);
    setShowTechniqueDialog(true);
    
    if (onTechniqueSelected) {
      onTechniqueSelected(technique);
    }
  };

  const filteredTechniques = getFilteredTechniques();
  
  // Get unique categories for tabs
  const categories = ['all', ...new Set(therapyTechniquesList.map(t => t.category))];

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Therapy Techniques</span>
          {emotionData?.primaryEmotion && emotionData.primaryEmotion !== 'neutral' && (
            <Badge variant="outline" className="ml-2">
              For {emotionData.primaryEmotion} feelings
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Evidence-based techniques to improve your mental wellbeing
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <Tabs defaultValue="all" value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="mb-4 w-full overflow-x-auto flex no-scrollbar">
            {categories.map(category => (
              <TabsTrigger 
                key={category} 
                value={category}
                className="flex items-center gap-1"
              >
                {category !== 'all' && techniqueCategoryIcons[category as keyof typeof techniqueCategoryIcons]}
                <span className="capitalize">{category}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredTechniques.map((technique) => (
              <button
                key={technique.id}
                className="text-left p-3 rounded-md border border-border hover:border-primary hover:bg-accent transition-colors"
                onClick={() => handleTechniqueClick(technique)}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-medium text-sm">{technique.name}</h4>
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <Timer className="h-3 w-3" />
                    {technique.duration}m
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {technique.description}
                </p>
                <div className="flex mt-2 gap-1">
                  <Badge 
                    variant="secondary" 
                    className="text-xs capitalize"
                  >
                    {technique.category}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs",
                      technique.difficulty === 'easy' ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" :
                      technique.difficulty === 'medium' ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" :
                      "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                    )}
                  >
                    {technique.difficulty}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        </Tabs>
      </CardContent>
      
      <Dialog open={showTechniqueDialog} onOpenChange={setShowTechniqueDialog}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedTechnique && (
            <>
              <DialogHeader>
                <DialogTitle className="flex justify-between items-center">
                  <span>{selectedTechnique.name}</span>
                  <div className="flex gap-1">
                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                      <Timer className="h-3 w-3" />
                      {selectedTechnique.duration}m
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs",
                        selectedTechnique.difficulty === 'easy' ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" :
                        selectedTechnique.difficulty === 'medium' ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" :
                        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                      )}
                    >
                      {selectedTechnique.difficulty}
                    </Badge>
                  </div>
                </DialogTitle>
                <DialogDescription>
                  {selectedTechnique.description}
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-2">
                <h4 className="text-sm font-medium mb-2">Steps:</h4>
                <ol className="list-decimal pl-5 space-y-2">
                  {selectedTechnique.steps.map((step, index) => (
                    <li key={index} className="text-sm">{step}</li>
                  ))}
                </ol>
              </div>
              
              <div className="py-2">
                <h4 className="text-sm font-medium mb-2">Helpful for:</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedTechnique.emotionTargets.map((emotion) => (
                    <Badge key={emotion} variant="secondary" className="capitalize">
                      {emotion}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end mt-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowTechniqueDialog(false)}>
                  Close
                </Button>
                <Button size="sm" className="gap-1">
                  <ExternalLink className="h-4 w-4" />
                  Learn More
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TherapyTechniques; 