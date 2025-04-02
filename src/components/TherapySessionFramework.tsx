import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Check, Clock } from "lucide-react";

// Define session stages
export const therapySessionStages = [
  {
    id: 'opening',
    name: 'Opening',
    description: 'Establish rapport and identify the main concerns',
    prompts: [
      'How are you feeling today?',
      'What brings you here?',
      'What would you like to focus on today?'
    ]
  },
  {
    id: 'assessment',
    name: 'Assessment',
    description: 'Explore the challenges in more depth',
    prompts: [
      'When did you first notice this issue?',
      'How has this been affecting your daily life?',
      'What patterns have you noticed around this issue?'
    ]
  },
  {
    id: 'intervention',
    name: 'Intervention',
    description: 'Work through strategies and solutions',
    prompts: [
      'What have you tried so far?',
      'What small step could you take this week?',
      'How might we reframe this challenge?'
    ]
  },
  {
    id: 'closing',
    name: 'Closing',
    description: 'Summarize insights and plan next steps',
    prompts: [
      'What are your key takeaways from today?',
      'What specific action will you take?',
      'How are you feeling now compared to when we started?'
    ]
  }
];

// Define therapy goals
export const therapyGoals = [
  'Manage anxiety symptoms',
  'Improve mood and energy levels',
  'Develop better coping strategies',
  'Improve relationships',
  'Process difficult emotions',
  'Enhance self-awareness',
  'Build confidence and self-esteem',
  'Improve sleep quality',
  'Reduce stress',
  'Work through grief or loss',
  'Clarify personal values and goals',
  'General emotional support'
];

interface TherapySessionFrameworkProps {
  stages?: typeof therapySessionStages;
  currentStage: string;
  onStageChange?: (stageId: string) => void;
  completionPercentage?: number;
  sessionLength?: number;
}

const TherapySessionFramework: React.FC<TherapySessionFrameworkProps> = ({
  stages = therapySessionStages,
  currentStage,
  onStageChange,
  completionPercentage = 0,
  sessionLength = 30
}) => {
  // Find current stage index
  const currentStageIndex = stages.findIndex(stage => stage.id === currentStage);
  
  // Calculate time spent per stage (simplified)
  const timePerStage = sessionLength / stages.length;
  
  const handleStageClick = (stageId: string) => {
    if (onStageChange) {
      onStageChange(stageId);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{sessionLength} min session</span>
          </Badge>
          <Badge variant="outline">{Math.round(completionPercentage)}% complete</Badge>
        </div>
      </div>
      
      <Progress value={completionPercentage} className="h-2 mb-6" />
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        {stages.map((stage, index) => {
          const isCurrentStage = stage.id === currentStage;
          const isCompleted = index < currentStageIndex;
          const isActive = isCurrentStage || isCompleted;
          
          return (
            <Card
              key={stage.id}
              className={`relative border ${isCurrentStage ? 'border-primary' : isCompleted ? 'border-primary/50' : ''}`}
            >
              {isCurrentStage && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                  Current
                </div>
              )}
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`flex items-center justify-center h-6 w-6 rounded-full text-xs ${
                    isCompleted 
                      ? 'bg-primary text-primary-foreground' 
                      : isCurrentStage 
                        ? 'border-2 border-primary text-primary' 
                        : 'border border-muted-foreground text-muted-foreground'
                  }`}>
                    {isCompleted ? <Check className="h-3 w-3" /> : index + 1}
                  </div>
                  <h3 className={`font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {stage.name}
                  </h3>
                </div>
                
                <p className={`text-xs mb-3 ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {stage.description}
                </p>
                
                {onStageChange && index > currentStageIndex && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs"
                    onClick={() => handleStageClick(stage.id)}
                    disabled={index > currentStageIndex + 1}
                  >
                    {index === currentStageIndex + 1 ? (
                      <>
                        Move to {stage.name}
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </>
                    ) : (
                      'Not yet available'
                    )}
                  </Button>
                )}
                
                {isCurrentStage && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>~{timePerStage} min</span>
                    </div>
                  </div>
                )}
                
                {isCompleted && (
                  <div className="mt-2 bg-primary/10 text-primary text-xs px-2 py-1 rounded-sm text-center">
                    Stage completed
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default TherapySessionFramework; 