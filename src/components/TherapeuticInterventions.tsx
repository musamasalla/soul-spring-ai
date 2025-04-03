import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Heart, Brain, FileText, MoveVertical, Timer, Lightbulb, ArrowRight, Info, GitBranch, Dices } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GuidedExercise } from './GuidedExercise';
import { TherapyTechniques, therapyTechniquesList, TechniqueData } from './TherapyTechniques';
import { useLocalStorage } from '@/hooks/useLocalStorage';

// Enhanced therapy approaches
export interface TherapeuticApproach {
  id: string;
  name: string;
  description: string;
  keyPrinciples: string[];
  techniques: string[]; // IDs of techniques from therapyTechniquesList
  emotionTargets: string[];
  resources?: {
    title: string;
    url: string;
  }[];
}

export const therapeuticApproaches: TherapeuticApproach[] = [
  {
    id: 'cbt',
    name: 'Cognitive Behavioral Therapy (CBT)',
    description: 'A psychotherapeutic approach that addresses negative patterns of thought to change unwanted behavior patterns or treat mood disorders.',
    keyPrinciples: [
      'Your thoughts influence your feelings and behaviors',
      'Identifying and changing negative thought patterns can improve emotional well-being',
      'New coping skills can be learned and practiced to change behaviors',
      'The focus is on current problems and practical solutions'
    ],
    techniques: ['cognitive-reframing', 'values-clarification', 'self-compassion'],
    emotionTargets: ['anxious', 'depressed', 'angry', 'frustrated', 'self-critical'],
    resources: [
      {
        title: 'Introduction to CBT',
        url: 'https://www.apa.org/ptsd-guideline/patients-and-families/cognitive-behavioral'
      }
    ]
  },
  {
    id: 'mindfulness',
    name: 'Mindfulness-Based Interventions',
    description: 'Practices that focus attention on the present moment, observing thoughts and feelings without judgment.',
    keyPrinciples: [
      'Present-moment awareness reduces rumination about past or future',
      'Observing thoughts without judgment creates emotional distance',
      'Regular practice builds capacity to respond rather than react',
      'Develops acceptance and self-compassion'
    ],
    techniques: ['mindfulness', 'deep-breathing', 'grounding'],
    emotionTargets: ['anxious', 'overwhelmed', 'stressed', 'ruminating', 'distracted'],
    resources: [
      {
        title: 'Getting Started with Mindfulness',
        url: 'https://www.mindful.org/meditation/mindfulness-getting-started/'
      }
    ]
  },
  {
    id: 'acceptance-commitment',
    name: 'Acceptance and Commitment Therapy (ACT)',
    description: 'Focuses on accepting uncomfortable thoughts and feelings rather than fighting them, and committing to actions that enrich life.',
    keyPrinciples: [
      'Accepting thoughts and feelings rather than struggling with them',
      'Making room for difficult emotions and sensations',
      'Connecting with the present moment',
      'Identifying values and committing to aligned actions'
    ],
    techniques: ['values-clarification', 'mindfulness', 'self-compassion'],
    emotionTargets: ['anxious', 'avoidant', 'stuck', 'conflicted', 'confused'],
    resources: [
      {
        title: 'ACT Made Simple',
        url: 'https://contextualscience.org/act'
      }
    ]
  },
  {
    id: 'positive-psychology',
    name: 'Positive Psychology',
    description: 'Focuses on character strengths, optimism, and factors that allow individuals to thrive rather than just addressing pathology.',
    keyPrinciples: [
      'Building positive emotions and strengths rather than just fixing problems',
      'Developing resilience through positive experiences',
      'Fostering gratitude and appreciation',
      'Cultivating meaningful engagement and relationships'
    ],
    techniques: ['gratitude', 'values-clarification', 'self-compassion'],
    emotionTargets: ['disconnected', 'unmotivated', 'depressed', 'negative', 'pessimistic'],
    resources: [
      {
        title: 'What is Positive Psychology?',
        url: 'https://positivepsychology.com/what-is-positive-psychology-definition/'
      }
    ]
  },
  {
    id: 'dbt',
    name: 'Dialectical Behavior Therapy (DBT)',
    description: 'Combines cognitive-behavioral techniques with mindfulness concepts to help regulate emotions and improve interpersonal effectiveness.',
    keyPrinciples: [
      'Balancing acceptance of reality with change strategies',
      'Developing mindfulness to stay present',
      'Learning to regulate intense emotions',
      'Improving interpersonal effectiveness and distress tolerance'
    ],
    techniques: ['deep-breathing', 'cognitive-reframing', 'grounding'],
    emotionTargets: ['emotional', 'impulsive', 'anxious', 'angry', 'overwhelmed'],
    resources: [
      {
        title: 'DBT Skills Training',
        url: 'https://behavioraltech.org/resources/faqs/dialectical-behavior-therapy-dbt/'
      }
    ]
  }
];

// CBT thought record entry
interface ThoughtRecord {
  id: string;
  situation: string;
  automaticThoughts: string;
  emotions: {
    name: string;
    intensity: number;
  }[];
  evidence: {
    supporting: string;
    against: string;
  };
  balancedThought: string;
  outcome: {
    newEmotions: {
      name: string;
      intensity: number;
    }[];
    reflection: string;
  };
  date: Date;
}

interface TherapeuticInterventionsProps {
  emotionData?: any;
  userId: string;
  className?: string;
  onTechniqueSelected?: (technique: TechniqueData) => void;
  onApproachSelected?: (approach: TherapeuticApproach) => void;
}

export const TherapeuticInterventions: React.FC<TherapeuticInterventionsProps> = ({
  emotionData,
  userId,
  className,
  onTechniqueSelected,
  onApproachSelected
}) => {
  // State
  const [activeTab, setActiveTab] = useState<string>('techniques');
  const [selectedTechnique, setSelectedTechnique] = useState<TechniqueData | null>(null);
  const [selectedApproach, setSelectedApproach] = useState<TherapeuticApproach | null>(null);
  const [isExerciseOpen, setIsExerciseOpen] = useState<boolean>(false);
  const [isApproachDialogOpen, setIsApproachDialogOpen] = useState<boolean>(false);
  const [thoughtRecordDialogOpen, setThoughtRecordDialogOpen] = useState<boolean>(false);
  const [recommendedApproaches, setRecommendedApproaches] = useState<TherapeuticApproach[]>([]);
  const [exerciseHistory, setExerciseHistory] = useLocalStorage<{
    id: string;
    techniqueId: string;
    date: string;
    duration: number;
  }[]>(`exercise-history-${userId}`, []);
  
  // Get recommended approaches based on emotion data
  useEffect(() => {
    if (!emotionData?.primaryEmotion) return;
    
    const emotion = emotionData.primaryEmotion.toLowerCase();
    const intensity = emotionData.intensityLevel || 'moderate';
    
    // Filter approaches that target the primary emotion
    let approaches = therapeuticApproaches.filter(approach => 
      approach.emotionTargets.some(target => 
        target.toLowerCase() === emotion || 
        target.toLowerCase().includes(emotion) ||
        emotion.includes(target.toLowerCase())
      )
    );
    
    // If no direct matches, include general approaches
    if (approaches.length === 0) {
      approaches = therapeuticApproaches.filter(approach => 
        approach.id === 'mindfulness' || approach.id === 'positive-psychology'
      );
    }
    
    // Sort by relevance
    approaches.sort((a, b) => {
      const aMatch = a.emotionTargets.some(target => target.toLowerCase() === emotion);
      const bMatch = b.emotionTargets.some(target => target.toLowerCase() === emotion);
      
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return 0;
    });
    
    // Add personalization based on intensity
    if (intensity === 'high' || intensity === 'very high') {
      // For high intensity, put DBT and mindfulness first
      const dbt = approaches.find(a => a.id === 'dbt');
      const mindfulness = approaches.find(a => a.id === 'mindfulness');
      
      if (dbt) {
        approaches = [dbt, ...approaches.filter(a => a.id !== 'dbt')];
      }
      
      if (mindfulness && !dbt) {
        approaches = [mindfulness, ...approaches.filter(a => a.id !== 'mindfulness')];
      }
    }
    
    // Take top 3 approaches
    setRecommendedApproaches(approaches.slice(0, 3));
  }, [emotionData]);
  
  // Handle technique selection
  const handleTechniqueSelected = (technique: TechniqueData) => {
    setSelectedTechnique(technique);
    setIsExerciseOpen(true);
    
    if (onTechniqueSelected) {
      onTechniqueSelected(technique);
    }
  };
  
  // Handle approach selection
  const handleApproachSelected = (approach: TherapeuticApproach) => {
    setSelectedApproach(approach);
    setIsApproachDialogOpen(true);
    
    if (onApproachSelected) {
      onApproachSelected(approach);
    }
  };
  
  // Handle exercise completion
  const handleExerciseComplete = (techniqueId: string, duration: number) => {
    // Add to exercise history
    const newHistoryEntry = {
      id: `exercise-${Date.now()}`,
      techniqueId,
      date: new Date().toISOString(),
      duration
    };
    
    setExerciseHistory(prev => [newHistoryEntry, ...prev]);
  };
  
  // Open thought record dialog
  const handleOpenThoughtRecord = () => {
    setThoughtRecordDialogOpen(true);
  };
  
  // Get techniques for an approach
  const getTechniquesForApproach = (approach: TherapeuticApproach): TechniqueData[] => {
    return therapyTechniquesList.filter(technique => 
      approach.techniques.includes(technique.id)
    );
  };
  
  // Get recently practiced techniques
  const getRecentlyPracticedTechniques = (): TechniqueData[] => {
    const recentIds = exerciseHistory
      .slice(0, 3)
      .map(entry => entry.techniqueId);
    
    return therapyTechniquesList.filter(technique => 
      recentIds.includes(technique.id)
    );
  };
  
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            Therapeutic Tools
          </div>
          {emotionData?.primaryEmotion && (
            <Badge variant="outline" className="capitalize">
              For {emotionData.primaryEmotion} feelings
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Evidence-based approaches to improve your wellbeing
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        <Tabs defaultValue="techniques" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="techniques" className="text-xs">Techniques</TabsTrigger>
            <TabsTrigger value="approaches" className="text-xs">Approaches</TabsTrigger>
            <TabsTrigger value="tools" className="text-xs">Tools</TabsTrigger>
          </TabsList>
          
          <TabsContent value="techniques">
            <TherapyTechniques
              recommendedTechniques={emotionData?.recommendedTechniques}
              emotionData={emotionData}
              onTechniqueSelected={handleTechniqueSelected}
            />
          </TabsContent>
          
          <TabsContent value="approaches">
            <div className="space-y-4">
              {recommendedApproaches.length > 0 ? (
                <>
                  <div className="text-sm font-medium mb-1">Recommended for you:</div>
                  <div className="grid gap-3">
                    {recommendedApproaches.map(approach => (
                      <button
                        key={approach.id}
                        className="text-left p-3 rounded-md border border-border hover:border-primary hover:bg-accent transition-colors"
                        onClick={() => handleApproachSelected(approach)}
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-sm">{approach.name}</h4>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {approach.description}
                        </p>
                        <div className="flex mt-2 gap-1">
                          <Badge variant="secondary" className="text-xs">
                            {approach.techniques.length} techniques
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="grid gap-3">
                  {therapeuticApproaches.slice(0, 3).map(approach => (
                    <button
                      key={approach.id}
                      className="text-left p-3 rounded-md border border-border hover:border-primary hover:bg-accent transition-colors"
                      onClick={() => handleApproachSelected(approach)}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm">{approach.name}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {approach.description}
                      </p>
                      <div className="flex mt-2 gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {approach.techniques.length} techniques
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              <Button 
                variant="outline" 
                className="w-full text-xs" 
                onClick={() => setActiveTab('techniques')}
              >
                View all techniques
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="tools">
            <div className="space-y-4">
              <div className="text-sm font-medium mb-1">Interactive tools:</div>
              
              <div className="grid gap-3">
                <button
                  className="text-left p-3 rounded-md border border-border hover:border-primary hover:bg-accent transition-colors"
                  onClick={handleOpenThoughtRecord}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-sm flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      Thought Record
                    </h4>
                    <Badge variant="outline" className="text-xs">CBT</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Identify and reframe negative thought patterns.
                  </p>
                </button>
                
                <button
                  className="text-left p-3 rounded-md border border-border hover:border-primary hover:bg-accent transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-sm flex items-center gap-1">
                      <GitBranch className="h-4 w-4" />
                      Decision Tree
                    </h4>
                    <Badge variant="outline" className="text-xs">ACT</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Map out decisions aligned with your values.
                  </p>
                </button>
                
                <button
                  className="text-left p-3 rounded-md border border-border hover:border-primary hover:bg-accent transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-sm flex items-center gap-1">
                      <Dices className="h-4 w-4" />
                      Behavioral Activation
                    </h4>
                    <Badge variant="outline" className="text-xs">CBT</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Plan enjoyable activities to improve mood.
                  </p>
                </button>
              </div>
              
              {exerciseHistory.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-medium mb-2">Recently practiced:</div>
                  <div className="flex flex-wrap gap-1">
                    {getRecentlyPracticedTechniques().map(technique => (
                      <Badge 
                        key={technique.id} 
                        variant="secondary" 
                        className="cursor-pointer"
                        onClick={() => handleTechniqueSelected(technique)}
                      >
                        {technique.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="pt-0 justify-between">
        <Button
          variant="link"
          size="sm"
          className="text-xs px-0"
        >
          Learn more about therapy approaches
        </Button>
      </CardFooter>
      
      {/* Guided Exercise Dialog */}
      {selectedTechnique && (
        <GuidedExercise
          technique={selectedTechnique}
          open={isExerciseOpen}
          setOpen={setIsExerciseOpen}
          onComplete={handleExerciseComplete}
        />
      )}
      
      {/* Approach Details Dialog */}
      <Dialog open={isApproachDialogOpen} onOpenChange={setIsApproachDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedApproach && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedApproach.name}</DialogTitle>
                <DialogDescription>
                  {selectedApproach.description}
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                <h3 className="text-sm font-medium mb-2">Key principles:</h3>
                <ul className="space-y-2 list-disc pl-5">
                  {selectedApproach.keyPrinciples.map((principle, index) => (
                    <li key={index} className="text-sm">{principle}</li>
                  ))}
                </ul>
                
                <h3 className="text-sm font-medium mt-4 mb-2">Techniques:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {getTechniquesForApproach(selectedApproach).map(technique => (
                    <Button
                      key={technique.id}
                      variant="outline"
                      className="justify-start h-auto py-2 text-xs"
                      onClick={() => {
                        setSelectedTechnique(technique);
                        setIsApproachDialogOpen(false);
                        setIsExerciseOpen(true);
                      }}
                    >
                      <ArrowRight className="h-3 w-3 mr-1 flex-shrink-0" />
                      {technique.name}
                    </Button>
                  ))}
                </div>
                
                {selectedApproach.resources && selectedApproach.resources.length > 0 && (
                  <>
                    <h3 className="text-sm font-medium mt-4 mb-2">Learn more:</h3>
                    <div className="space-y-1">
                      {selectedApproach.resources.map((resource, index) => (
                        <div key={index} className="flex items-center text-xs">
                          <Info className="h-3 w-3 mr-1 text-muted-foreground" />
                          <a 
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {resource.title}
                          </a>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsApproachDialogOpen(false)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    if (selectedApproach.techniques.length > 0) {
                      const technique = therapyTechniquesList.find(
                        t => t.id === selectedApproach.techniques[0]
                      );
                      if (technique) {
                        setSelectedTechnique(technique);
                        setIsApproachDialogOpen(false);
                        setIsExerciseOpen(true);
                      }
                    }
                  }}
                >
                  Try key technique
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Thought Record Dialog */}
      <Dialog open={thoughtRecordDialogOpen} onOpenChange={setThoughtRecordDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Thought Record</DialogTitle>
            <DialogDescription>
              Identify and challenge negative thoughts to develop more balanced perspectives
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="text-center p-4">
              <Brain className="h-12 w-12 mx-auto mb-2 text-primary opacity-40" />
              <h3 className="text-lg font-medium">Coming Soon</h3>
              <p className="text-sm text-muted-foreground mt-1">
                The interactive thought record tool is under development and will be available soon.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setThoughtRecordDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}; 