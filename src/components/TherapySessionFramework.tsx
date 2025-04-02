import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";

// Define therapy session stages with detailed structure
export const therapySessionStages = [
  {
    id: 'opening',
    name: 'Opening & Rapport Building',
    description: 'Establishing connection and setting the tone for the session',
    tasks: [
      'Greeting and check-in',
      'Setting comfortable environment',
      'Establishing session goals',
      'Review of previous sessions (if applicable)'
    ],
    techniques: [
      'Active listening',
      'Open-ended questions',
      'Validation of emotions',
      'Establishing safety'
    ],
    completion: 0
  },
  {
    id: 'assessment',
    name: 'Assessment & Exploration',
    description: 'Understanding the current situation and emotions in depth',
    tasks: [
      'Exploring presenting concerns',
      'Understanding emotional responses',
      'Identifying patterns and triggers',
      'Exploring contextual factors'
    ],
    techniques: [
      'Clarifying questions',
      'Reflective listening',
      'Empathic responses',
      'Gentle probing'
    ],
    completion: 0
  },
  {
    id: 'intervention',
    name: 'Intervention & Skills Building',
    description: 'Working on strategies and techniques to address concerns',
    tasks: [
      'Providing therapeutic perspectives',
      'Exploring coping strategies',
      'Teaching relevant skills',
      'Practicing techniques'
    ],
    techniques: [
      'Cognitive reframing',
      'Mindfulness exercises',
      'Grounding techniques',
      'Behavioral strategies'
    ],
    completion: 0
  },
  {
    id: 'closing',
    name: 'Integration & Closing',
    description: 'Summarizing insights and preparing for session end',
    tasks: [
      'Reviewing insights gained',
      'Discussing next steps',
      'Setting intentions',
      'Providing closure'
    ],
    techniques: [
      'Summarization',
      'Positive reinforcement',
      'Setting realistic expectations',
      'Compassionate closure'
    ],
    completion: 0
  }
];

// Define therapy approaches for different situations
export const therapyApproaches = {
  anxiety: {
    name: 'Anxiety Management',
    description: 'Techniques to reduce anxiety and manage worry',
    techniques: [
      'Progressive muscle relaxation',
      'Worry time scheduling',
      'Cognitive restructuring',
      'Exposure therapy principles'
    ]
  },
  depression: {
    name: 'Depression Support',
    description: 'Approaches to address low mood and negative thinking',
    techniques: [
      'Behavioral activation',
      'Thought challenging',
      'Self-compassion practice',
      'Activity scheduling'
    ]
  },
  relationships: {
    name: 'Relationship Navigation',
    description: 'Strategies for healthier interpersonal interactions',
    techniques: [
      'Communication skills',
      'Boundary setting',
      'Emotion regulation',
      'Needs expression'
    ]
  },
  stress: {
    name: 'Stress Management',
    description: 'Tools to reduce stress and improve resilience',
    techniques: [
      'Mindfulness practice',
      'Time management strategies',
      'Self-care planning',
      'Stress response awareness'
    ]
  },
  trauma: {
    name: 'Trauma-Informed Support',
    description: 'Gentle approaches for trauma-related concerns',
    techniques: [
      'Grounding techniques',
      'Safety planning',
      'Resource building',
      'Compassionate witnessing'
    ]
  }
};

// Define therapy goals that can be suggested
export const therapyGoals = [
  'Reduce anxiety in specific situations',
  'Improve mood and energy levels',
  'Develop healthier relationship patterns',
  'Build stress management skills',
  'Process difficult emotions',
  'Improve sleep quality',
  'Increase self-compassion',
  'Develop coping strategies',
  'Clarify personal values',
  'Build confidence in specific areas'
];

interface TherapySessionFrameworkProps {
  currentStage: string;
  onStageUpdate: (stageName: string) => void;
  sessionTopics: string[];
  sessionLength: number; // in minutes
  completionPercentage: number;
}

const TherapySessionFramework = ({
  currentStage,
  onStageUpdate,
  sessionTopics,
  sessionLength = 30,
  completionPercentage = 0
}: TherapySessionFrameworkProps) => {
  const [stagesProgress, setStagesProgress] = useState(() => 
    therapySessionStages.map(stage => ({
      ...stage,
      completion: stage.id === currentStage ? Math.min(completionPercentage, 100) : 
                  therapySessionStages.findIndex(s => s.id === stage.id) < 
                  therapySessionStages.findIndex(s => s.id === currentStage) ? 100 : 0
    }))
  );
  
  const [selectedApproach, setSelectedApproach] = useState<string | null>(null);
  
  // Update approach based on session topics
  useEffect(() => {
    if (sessionTopics.length > 0) {
      // Map topics to approaches
      const topicToApproach: Record<string, string> = {
        'Anxiety': 'anxiety',
        'Stress': 'stress',
        'Depression': 'depression',
        'Relationships': 'relationships',
        'Family Issues': 'relationships',
        'Trauma': 'trauma',
        'PTSD': 'trauma',
        'Grief': 'trauma'
      };
      
      // Find the first matching approach
      for (const topic of sessionTopics) {
        const mappedApproach = topicToApproach[topic];
        if (mappedApproach && therapyApproaches[mappedApproach as keyof typeof therapyApproaches]) {
          setSelectedApproach(mappedApproach);
          break;
        }
      }
    }
  }, [sessionTopics]);
  
  // Update progress when current stage or completion percentage changes
  useEffect(() => {
    setStagesProgress(prevStages => 
      prevStages.map(stage => ({
        ...stage,
        completion: stage.id === currentStage ? completionPercentage : 
                    therapySessionStages.findIndex(s => s.id === stage.id) < 
                    therapySessionStages.findIndex(s => s.id === currentStage) ? 100 : 0
      }))
    );
  }, [currentStage, completionPercentage]);
  
  // Calculate estimated time for each stage
  const getStageTimeEstimate = (stageIndex: number) => {
    // Simple division of time based on stages
    const stageLength = Math.floor(sessionLength / therapySessionStages.length);
    const minutesPerStage = stageLength < 5 ? 5 : stageLength; // Minimum 5 minutes per stage
    
    // Calculate minutes based on stage index
    return `~${minutesPerStage} min`;
  };
  
  // Get the current active approach techniques
  const getApproachTechniques = () => {
    if (!selectedApproach || !therapyApproaches[selectedApproach as keyof typeof therapyApproaches]) {
      return [];
    }
    
    return therapyApproaches[selectedApproach as keyof typeof therapyApproaches].techniques;
  };
  
  // Get current stage techniques
  const getCurrentStageTechniques = () => {
    const currentStageObj = stagesProgress.find(stage => stage.id === currentStage);
    return currentStageObj?.techniques || [];
  };
  
  // Get recommended techniques for current context
  const getRecommendedTechniques = () => {
    const stageTechniques = getCurrentStageTechniques();
    const approachTechniques = getApproachTechniques();
    
    // Combine and remove duplicates
    return [...new Set([...stageTechniques, ...approachTechniques])];
  };
  
  // Handle manual stage transition
  const handleStageTransition = (stageId: string) => {
    if (stageId !== currentStage) {
      onStageUpdate(stageId);
    }
  };
  
  return (
    <div className="bg-card/50 backdrop-blur-sm border rounded-lg p-4 mb-4">
      <h3 className="text-base font-semibold mb-3 flex items-center">
        Therapy Session Framework
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 ml-1">
                <Info className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <p>This framework guides the therapy conversation through evidence-based stages to ensure a structured and effective session.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </h3>
      
      <div className="space-y-4">
        {/* Session progress */}
        <div className="flex items-center justify-between mb-1 text-xs text-muted-foreground">
          <span>Session Progress</span>
          <span>{Math.floor(completionPercentage)}%</span>
        </div>
        <Progress value={completionPercentage} className="h-1.5" />
        
        {/* Stages */}
        <div className="space-y-2 mt-4">
          {stagesProgress.map((stage, index) => (
            <div key={stage.id} className="relative">
              <div 
                className={`flex items-center p-2 rounded-md transition-all duration-200 ${
                  currentStage === stage.id 
                    ? 'bg-primary/10 border border-primary/30' 
                    : 'hover:bg-secondary/50'
                }`}
              >
                <div className="mr-3 flex flex-col items-center">
                  <div 
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      stage.completion === 100 
                        ? 'bg-primary/20 text-primary' 
                        : currentStage === stage.id
                          ? 'bg-primary/10 text-primary border border-primary'
                          : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    {stage.completion === 100 ? (
                      <CheckCircle className="h-4 w-4 text-primary" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  {index < stagesProgress.length - 1 && (
                    <div className="h-6 w-0.5 bg-border mt-1"></div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">{stage.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {getStageTimeEstimate(index)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{stage.description}</p>
                  
                  {currentStage === stage.id && (
                    <div className="mt-2 text-xs">
                      <div className="flex flex-wrap gap-1 mt-1">
                        {stage.tasks.map((task, i) => (
                          <Badge 
                            key={i} 
                            variant="secondary"
                            className="text-xs font-normal"
                          >
                            {task}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {stage.id !== currentStage && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="ml-2 h-6 w-6"
                    onClick={() => handleStageTransition(stage.id)}
                  >
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Approach and techniques */}
        {selectedApproach && therapyApproaches[selectedApproach as keyof typeof therapyApproaches] && (
          <div className="mt-4 p-3 bg-primary/5 rounded-md border border-primary/10">
            <h4 className="text-sm font-medium flex items-center">
              <AlertCircle className="h-4 w-4 mr-1 text-primary" />
              Recommended Approach: {therapyApproaches[selectedApproach as keyof typeof therapyApproaches].name}
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              {therapyApproaches[selectedApproach as keyof typeof therapyApproaches].description}
            </p>
            
            <div className="mt-2">
              <h5 className="text-xs font-medium">Recommended Techniques:</h5>
              <div className="flex flex-wrap gap-1 mt-1">
                {getRecommendedTechniques().map((technique, i) => (
                  <Badge 
                    key={i} 
                    variant="outline"
                    className="text-xs bg-background/50"
                  >
                    {technique}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TherapySessionFramework; 