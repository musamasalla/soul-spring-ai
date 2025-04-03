import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Calendar, Flag, ListTodo, Clock, ArrowRight, PlayCircle, PauseCircle, CheckCircle, Milestone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Message } from '@/types/chat';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export interface TherapyGoal {
  id: string;
  title: string;
  description?: string;
  progress: number; // 0-100
  created: Date;
  targetDate?: Date;
  isCompleted: boolean;
  sessionIds: string[]; // Sessions where this goal was addressed
}

export interface SessionMilestone {
  id: string;
  title: string;
  isCompleted: boolean;
  assignedDate?: Date;
  completedDate?: Date;
}

export interface SessionSummary {
  id: string;
  title: string;
  date: Date;
  durationMinutes: number;
  mainTopics: string[];
  insights: string[];
  emotionalState: {
    start?: string;
    end?: string;
  };
  techniques: string[];
  homework?: SessionMilestone[];
  nextSessionFocus?: string;
}

export interface TherapyProgress {
  goals: TherapyGoal[];
  sessions: SessionSummary[];
  currentStage: 'assessment' | 'understanding' | 'intervention' | 'maintenance';
  overallProgress: number; // 0-100
  startDate: Date;
}

interface TherapySessionTrackerProps {
  sessionId: string;
  messages: Message[];
  currentStage: string;
  emotionData?: any;
  className?: string;
  onGoalSelected?: (goalId: string) => void;
  onMilestoneToggle?: (milestoneId: string, isCompleted: boolean) => void;
}

const DEFAULT_THERAPY_PROGRESS: TherapyProgress = {
  goals: [],
  sessions: [],
  currentStage: 'assessment',
  overallProgress: 0,
  startDate: new Date()
};

export const TherapySessionTracker: React.FC<TherapySessionTrackerProps> = ({
  sessionId,
  messages,
  currentStage,
  emotionData,
  className,
  onGoalSelected,
  onMilestoneToggle
}) => {
  // Load therapy progress from localStorage or use default
  const [therapyProgress, setTherapyProgress] = useLocalStorage<TherapyProgress>(
    'therapy-progress',
    DEFAULT_THERAPY_PROGRESS
  );
  
  const [activeTab, setActiveTab] = useState<string>('progress');
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState<boolean>(false);
  
  // Fetch current session if it exists
  useEffect(() => {
    const existingSession = therapyProgress.sessions.find(s => s.id === sessionId);
    if (existingSession) {
      setSessionSummary(existingSession);
    } else {
      setSessionSummary(null);
    }
  }, [sessionId, therapyProgress.sessions]);
  
  // Stage mapping to more user-friendly names
  const stageMapping = {
    'opening': 'Assessment',
    'assessment': 'Understanding',
    'intervention': 'Intervention',
    'closing': 'Reflection & Planning'
  };
  
  // Get mapped stage name
  const getMappedStage = (stage: string) => {
    return stageMapping[stage as keyof typeof stageMapping] || 'Assessment';
  };
  
  // Calculate session duration in minutes
  const calculateSessionDuration = () => {
    if (messages.length < 2) return 0;
    
    const firstMessage = messages[0].timestamp;
    const lastMessage = messages[messages.length - 1].timestamp;
    
    if (!firstMessage || !lastMessage) return 0;
    
    const durationMs = lastMessage.getTime() - firstMessage.getTime();
    return Math.round(durationMs / (1000 * 60));
  };
  
  // Extract main topics from messages
  const extractMainTopics = (): string[] => {
    const topics = new Set<string>();
    const topicIndicators = [
      'struggling with', 'dealing with', 'experiencing', 'feeling', 
      'concerned about', 'worried about', 'anxious about', 'issue with'
    ];
    
    // Get user messages
    const userMessages = messages.filter(m => m.role === 'user').map(m => m.content.toLowerCase());
    
    // Simple topic extraction (can be enhanced with NLP)
    userMessages.forEach(message => {
      topicIndicators.forEach(indicator => {
        const index = message.indexOf(indicator);
        if (index !== -1) {
          // Extract potential topic (next few words after the indicator)
          const afterIndicator = message.substring(index + indicator.length).trim();
          const words = afterIndicator.split(/\s+/);
          if (words.length >= 2) {
            const potentialTopic = words.slice(0, 3).join(' ');
            if (potentialTopic.length > 3) {
              topics.add(potentialTopic);
            }
          }
        }
      });
    });
    
    return Array.from(topics).slice(0, 3);
  };
  
  // Generate insights from assistant messages
  const generateInsights = (): string[] => {
    const insights: string[] = [];
    const insightIndicators = [
      'important to remember', 'key insight', 'worth noting',
      'significant that', 'notice that', 'pattern of', 'I observe'
    ];
    
    // Get assistant messages
    const assistantMessages = messages
      .filter(m => m.role === 'assistant')
      .map(m => m.content);
    
    // Simple insight extraction
    assistantMessages.forEach(message => {
      insightIndicators.forEach(indicator => {
        const index = message.toLowerCase().indexOf(indicator);
        if (index !== -1) {
          // Extract the sentence containing the indicator
          const startSentence = message.lastIndexOf('.', index);
          const endSentence = message.indexOf('.', index);
          
          if (startSentence !== -1 && endSentence !== -1) {
            const sentence = message.substring(startSentence + 1, endSentence + 1).trim();
            if (sentence.length > 10 && sentence.length < 150) {
              insights.push(sentence);
            }
          }
        }
      });
    });
    
    return insights.slice(0, 3);
  };
  
  // Generate therapy technique recommendations
  const extractTherapyTechniques = (): string[] => {
    if (emotionData?.recommendedTechniques) {
      return emotionData.recommendedTechniques;
    }
    
    // Fallback extraction if no emotion data
    const techniques = new Set<string>();
    const techniqueIndicators = [
      'try', 'practice', 'technique called', 'method known as',
      'exercise', 'approach called', 'strategy called'
    ];
    
    // Get assistant messages
    const assistantMessages = messages
      .filter(m => m.role === 'assistant')
      .map(m => m.content.toLowerCase());
    
    // Extract techniques
    assistantMessages.forEach(message => {
      techniqueIndicators.forEach(indicator => {
        const index = message.indexOf(indicator);
        if (index !== -1) {
          // Extract potential technique name
          const afterIndicator = message.substring(index + indicator.length).trim();
          const quote = afterIndicator.indexOf('"');
          const period = afterIndicator.indexOf('.');
          const endIndex = (quote !== -1 && quote < 30) ? quote : 
                           (period !== -1 && period < 30) ? period : 20;
          
          if (endIndex > 2) {
            const techniqueName = afterIndicator.substring(0, endIndex).trim();
            if (techniqueName.length > 2) {
              techniques.add(techniqueName);
            }
          }
        }
      });
    });
    
    return Array.from(techniques).slice(0, 3);
  };
  
  // Generate session summary
  const generateSessionSummary = () => {
    setIsGeneratingSummary(true);
    
    // Get or generate session data
    const duration = calculateSessionDuration();
    const topics = extractMainTopics();
    const insights = generateInsights();
    const techniques = extractTherapyTechniques();
    
    // Create new summary
    const newSummary: SessionSummary = {
      id: sessionId,
      title: `Session on ${new Date().toLocaleDateString()}`,
      date: new Date(),
      durationMinutes: duration,
      mainTopics: topics.length > 0 ? topics : ['General check-in'],
      insights: insights.length > 0 ? insights : ['Continuing progress'],
      emotionalState: {
        start: emotionData?.primaryEmotion || 'undetermined',
        end: emotionData?.emotionalTrend === 'improving' ? 'improved' : 
             emotionData?.emotionalTrend === 'declining' ? 'worsened' : 'stable'
      },
      techniques: techniques.length > 0 ? techniques : [],
      homework: [
        {
          id: `milestone-${Date.now()}`,
          title: 'Practice mindfulness for 5 minutes daily',
          isCompleted: false,
          assignedDate: new Date()
        }
      ],
      nextSessionFocus: 'Continue developing coping strategies'
    };
    
    setSessionSummary(newSummary);
    
    // Update therapy progress
    const updatedProgress = { ...therapyProgress };
    
    // Add or update session
    const existingSessionIndex = updatedProgress.sessions.findIndex(s => s.id === sessionId);
    if (existingSessionIndex !== -1) {
      updatedProgress.sessions[existingSessionIndex] = newSummary;
    } else {
      updatedProgress.sessions.push(newSummary);
    }
    
    // Update overall progress
    updatedProgress.overallProgress = Math.min(
      100, 
      Math.round((updatedProgress.sessions.length / 8) * 100)
    );
    
    setTherapyProgress(updatedProgress);
    setIsGeneratingSummary(false);
  };
  
  // Toggle homework milestone completion
  const toggleMilestone = (milestoneId: string) => {
    if (!sessionSummary) return;
    
    const updatedSummary = { ...sessionSummary };
    const milestone = updatedSummary.homework?.find(m => m.id === milestoneId);
    
    if (milestone) {
      milestone.isCompleted = !milestone.isCompleted;
      milestone.completedDate = milestone.isCompleted ? new Date() : undefined;
      
      setSessionSummary(updatedSummary);
      
      // Update in therapy progress
      const updatedProgress = { ...therapyProgress };
      const sessionIndex = updatedProgress.sessions.findIndex(s => s.id === sessionId);
      
      if (sessionIndex !== -1) {
        updatedProgress.sessions[sessionIndex] = updatedSummary;
        setTherapyProgress(updatedProgress);
      }
      
      // Call callback if provided
      if (onMilestoneToggle) {
        onMilestoneToggle(milestoneId, milestone.isCompleted);
      }
    }
  };
  
  // Select a therapy goal
  const handleGoalSelect = (goalId: string) => {
    if (onGoalSelected) {
      onGoalSelected(goalId);
    }
  };
  
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Milestone className="h-4 w-4 text-primary" />
          Therapy Progress
        </CardTitle>
        <CardDescription>
          Session stage: <span className="font-medium">{getMappedStage(currentStage)}</span>
          {sessionSummary?.durationMinutes && (
            <span className="ml-2">
              <Clock className="h-3 w-3 inline mr-1" />
              {sessionSummary.durationMinutes} min
            </span>
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-3">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-2">
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>
          
          <TabsContent value="progress" className="space-y-3">
            <div>
              <div className="flex justify-between mb-1 text-xs">
                <span>Overall therapy progress</span>
                <span className="font-medium">{therapyProgress.overallProgress}%</span>
              </div>
              <Progress value={therapyProgress.overallProgress} className="h-2" />
            </div>
            
            <div className="mt-3">
              <div className="text-xs font-medium mb-2">Journey timeline:</div>
              <div className="relative pt-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="z-10 flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs">
                    1
                  </div>
                  <div className={cn(
                    "z-10 flex items-center justify-center w-6 h-6 rounded-full text-xs",
                    therapyProgress.currentStage === 'understanding' || 
                    therapyProgress.currentStage === 'intervention' || 
                    therapyProgress.currentStage === 'maintenance'
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  )}>
                    2
                  </div>
                  <div className={cn(
                    "z-10 flex items-center justify-center w-6 h-6 rounded-full text-xs",
                    therapyProgress.currentStage === 'intervention' || 
                    therapyProgress.currentStage === 'maintenance'
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  )}>
                    3
                  </div>
                  <div className={cn(
                    "z-10 flex items-center justify-center w-6 h-6 rounded-full text-xs",
                    therapyProgress.currentStage === 'maintenance'
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  )}>
                    4
                  </div>
                </div>
                <div className="absolute left-0 top-4 w-full h-1 bg-secondary">
                  <div 
                    className="h-1 bg-primary" 
                    style={{ 
                      width: therapyProgress.currentStage === 'assessment' ? '0%' : 
                             therapyProgress.currentStage === 'understanding' ? '33%' :
                             therapyProgress.currentStage === 'intervention' ? '66%' : '100%'
                    }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-xs mt-2">
                  <div className="text-center w-12 -ml-3">Assessment</div>
                  <div className="text-center w-16">Understanding</div>
                  <div className="text-center w-16">Intervention</div>
                  <div className="text-center w-14 -mr-3">Maintenance</div>
                </div>
              </div>
            </div>
            
            <div className="mt-3">
              <div className="text-xs font-medium mb-2">
                Sessions completed: {therapyProgress.sessions.length}
              </div>
              <div className="flex flex-wrap gap-1">
                {therapyProgress.sessions.slice(-5).map(session => (
                  <Badge key={session.id} variant="outline" className="text-xs">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="goals" className="space-y-3">
            {therapyProgress.goals.length === 0 ? (
              <div className="text-center py-2 text-muted-foreground text-sm">
                <ListTodo className="h-5 w-5 mx-auto mb-1" />
                No therapy goals defined yet
              </div>
            ) : (
              <div className="space-y-2">
                {therapyProgress.goals.map(goal => (
                  <div 
                    key={goal.id} 
                    className="border rounded-md p-2 cursor-pointer hover:bg-accent/50"
                    onClick={() => handleGoalSelect(goal.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className={cn(
                        "font-medium text-sm", 
                        goal.isCompleted ? "line-through text-muted-foreground" : ""
                      )}>
                        {goal.title}
                      </div>
                      <Badge variant={goal.isCompleted ? "success" : "outline"} className="text-xs">
                        {goal.progress}%
                      </Badge>
                    </div>
                    <Progress 
                      value={goal.progress} 
                      className="h-1 mt-1" 
                      indicatorClassName={goal.isCompleted ? "bg-success" : undefined}
                    />
                  </div>
                ))}
              </div>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-xs"
            >
              <Flag className="h-3 w-3 mr-1" />
              Define new therapy goal
            </Button>
          </TabsContent>
          
          <TabsContent value="summary" className="space-y-3">
            {!sessionSummary ? (
              <div className="flex flex-col items-center justify-center py-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={isGeneratingSummary || messages.length < 3}
                  onClick={generateSessionSummary}
                  className="flex items-center gap-1"
                >
                  {isGeneratingSummary ? (
                    <>
                      <PauseCircle className="h-4 w-4 mr-1 animate-pulse" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="h-4 w-4 mr-1" />
                      Generate session summary
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Summarize insights and progress from this session
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <div className="text-xs font-medium mb-1">Main topics:</div>
                  <div className="flex flex-wrap gap-1">
                    {sessionSummary.mainTopics.map((topic, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs font-medium mb-1">Key insights:</div>
                  <ul className="text-xs space-y-1 list-disc list-inside">
                    {sessionSummary.insights.map((insight, i) => (
                      <li key={i}>{insight}</li>
                    ))}
                  </ul>
                </div>
                
                {sessionSummary.techniques.length > 0 && (
                  <div>
                    <div className="text-xs font-medium mb-1">Techniques discussed:</div>
                    <div className="flex flex-wrap gap-1">
                      {sessionSummary.techniques.map((technique, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {technique}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {sessionSummary.homework && sessionSummary.homework.length > 0 && (
                  <div>
                    <div className="text-xs font-medium mb-1">Practice between sessions:</div>
                    <div className="space-y-1">
                      {sessionSummary.homework.map((milestone) => (
                        <div key={milestone.id} className="flex items-start gap-2">
                          <Checkbox 
                            id={milestone.id} 
                            checked={milestone.isCompleted}
                            onCheckedChange={() => toggleMilestone(milestone.id)}
                          />
                          <label
                            htmlFor={milestone.id}
                            className={cn(
                              "text-xs leading-tight cursor-pointer",
                              milestone.isCompleted ? "line-through text-muted-foreground" : ""
                            )}
                          >
                            {milestone.title}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {sessionSummary.nextSessionFocus && (
                  <div>
                    <div className="text-xs font-medium mb-1">Focus for next session:</div>
                    <div className="text-xs border-l-2 border-primary pl-2 italic">
                      {sessionSummary.nextSessionFocus}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="pt-0 justify-between">
        <Button
          variant="link"
          size="sm"
          className="text-xs px-0"
        >
          View full progress history
        </Button>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={generateSessionSummary}
                disabled={isGeneratingSummary}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Generate session summary</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
}; 