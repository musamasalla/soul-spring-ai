import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { cn } from '@/lib/utils';
import { Clock, CheckCircle2, Play, Pause, Skip, Volume2, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react';
import { TechniqueData } from './TherapyTechniques';
import { useBreathAnimation } from '@/hooks/useBreathAnimation';
import { useHybridVoice } from '@/hooks/useHybridVoice';

interface GuidedExerciseProps {
  technique: TechniqueData;
  open: boolean;
  setOpen: (open: boolean) => void;
  onComplete?: (techniqueId: string, duration: number) => void;
}

export const GuidedExercise: React.FC<GuidedExerciseProps> = ({
  technique,
  open,
  setOpen,
  onComplete
}) => {
  // States
  const [currentStep, setCurrentStep] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [stepTimeElapsed, setStepTimeElapsed] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  
  // References
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const stepStartTimeRef = useRef<number | null>(null);
  
  // Calculate estimated duration in seconds based on steps
  const estimatedDuration = technique.steps.reduce((total, step) => {
    return total + (step.duration || 10);
  }, 0);
  
  // Get current step data
  const currentStepData = technique.steps[currentStep];
  const stepDuration = currentStepData?.duration || 10; // Default to 10 seconds
  
  // Use custom hooks
  const { breathAnimation, animationState, setAnimationState } = useBreathAnimation();
  const { speak, stopSpeaking, isSpeaking } = useHybridVoice ? useHybridVoice() : { speak: () => {}, stopSpeaking: () => {}, isSpeaking: false };
  
  // Start the exercise
  const handleStart = () => {
    setIsStarted(true);
    setIsPaused(false);
    startTimeRef.current = Date.now();
    stepStartTimeRef.current = Date.now();
    
    if (voiceEnabled) {
      // Read the first step instruction
      speak(currentStepData.instruction, { 
        voice: 'alloy',
        rate: 0.9
      });
    }
    
    // Start the appropriate animation if needed
    if (currentStepData.animation === 'breath') {
      setAnimationState(currentStepData.animationConfig || 'inhale');
    }
    
    // Start the timer
    timerRef.current = window.setInterval(() => {
      const now = Date.now();
      if (startTimeRef.current) {
        setTimeElapsed(Math.floor((now - startTimeRef.current) / 1000));
      }
      if (stepStartTimeRef.current) {
        setStepTimeElapsed(Math.floor((now - stepStartTimeRef.current) / 1000));
      }
    }, 1000);
  };
  
  // Pause the exercise
  const handlePause = () => {
    setIsPaused(true);
    clearInterval(timerRef.current!);
    timerRef.current = null;
    stopSpeaking();
  };
  
  // Resume the exercise
  const handleResume = () => {
    setIsPaused(false);
    // Adjust start times to account for the pause
    if (startTimeRef.current) {
      startTimeRef.current = Date.now() - (timeElapsed * 1000);
    }
    if (stepStartTimeRef.current) {
      stepStartTimeRef.current = Date.now() - (stepTimeElapsed * 1000);
    }
    
    // Restart the timer
    timerRef.current = window.setInterval(() => {
      const now = Date.now();
      if (startTimeRef.current) {
        setTimeElapsed(Math.floor((now - startTimeRef.current) / 1000));
      }
      if (stepStartTimeRef.current) {
        setStepTimeElapsed(Math.floor((now - stepStartTimeRef.current) / 1000));
      }
    }, 1000);
  };
  
  // Go to the next step
  const goToNextStep = () => {
    stopSpeaking();
    
    if (currentStep < technique.steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setStepTimeElapsed(0);
      stepStartTimeRef.current = Date.now();
      
      if (voiceEnabled && !isPaused) {
        speak(technique.steps[currentStep + 1].instruction, { 
          voice: 'alloy',
          rate: 0.9
        });
      }
      
      // Update animation state if needed
      const nextStepData = technique.steps[currentStep + 1];
      if (nextStepData.animation === 'breath') {
        setAnimationState(nextStepData.animationConfig || 'inhale');
      }
    } else {
      // Complete the exercise
      completeExercise();
    }
  };
  
  // Go to the previous step
  const goToPrevStep = () => {
    if (currentStep > 0) {
      stopSpeaking();
      setCurrentStep(currentStep - 1);
      setStepTimeElapsed(0);
      stepStartTimeRef.current = Date.now();
      
      if (voiceEnabled && !isPaused) {
        speak(technique.steps[currentStep - 1].instruction, { 
          voice: 'alloy',
          rate: 0.9
        });
      }
      
      // Update animation state if needed
      const prevStepData = technique.steps[currentStep - 1];
      if (prevStepData.animation === 'breath') {
        setAnimationState(prevStepData.animationConfig || 'inhale');
      }
    }
  };
  
  // Complete the exercise
  const completeExercise = () => {
    clearInterval(timerRef.current!);
    timerRef.current = null;
    setIsCompleted(true);
    
    if (voiceEnabled) {
      speak('Exercise complete. Great job!', { 
        voice: 'alloy',
        rate: 0.9
      });
    }
    
    if (onComplete) {
      onComplete(technique.id, timeElapsed);
    }
  };
  
  // Handle voice toggle
  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    if (voiceEnabled) {
      stopSpeaking();
    } else if (isStarted && !isPaused) {
      speak(currentStepData.instruction, { 
        voice: 'alloy',
        rate: 0.9
      });
    }
  };
  
  // Clean up when the component unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      stopSpeaking();
    };
  }, []);
  
  // Check if the current step duration has elapsed
  useEffect(() => {
    if (isStarted && !isPaused && stepTimeElapsed >= stepDuration && !isCompleted) {
      goToNextStep();
    }
  }, [stepTimeElapsed, stepDuration, isStarted, isPaused, isCompleted]);
  
  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate overall progress
  const calculateProgress = () => {
    if (!isStarted) return 0;
    if (isCompleted) return 100;
    
    const totalDuration = estimatedDuration;
    const previousStepsDuration = technique.steps
      .slice(0, currentStep)
      .reduce((acc, step) => acc + (step.duration || 10), 0);
    
    const currentProgress = ((previousStepsDuration + stepTimeElapsed) / totalDuration) * 100;
    return Math.min(Math.max(currentProgress, 0), 100);
  };
  
  // Clean up when dialog closes
  useEffect(() => {
    if (!open) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      stopSpeaking();
      // Reset states for next time
      if (isCompleted) {
        setTimeout(() => {
          setCurrentStep(0);
          setIsStarted(false);
          setIsPaused(false);
          setTimeElapsed(0);
          setStepTimeElapsed(0);
          setIsCompleted(false);
        }, 300);
      }
    }
  }, [open]);
  
  // Render the breath animation
  const renderBreathAnimation = () => {
    if (currentStepData.animation !== 'breath') return null;
    
    return (
      <div className="flex justify-center items-center my-4">
        <div className={cn(
          "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-4000",
          breathAnimation
        )}>
          <div className="text-xs text-center">
            {animationState === 'inhale' && 'Breathe In'}
            {animationState === 'hold' && 'Hold'}
            {animationState === 'exhale' && 'Breathe Out'}
            {animationState === 'rest' && 'Rest'}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{technique.name}</span>
            <Badge variant="outline" className="ml-2">
              {formatTime(timeElapsed)} / ~{formatTime(estimatedDuration)}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {technique.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Progress bar */}
          <Progress value={calculateProgress()} className="h-2" />
          
          {/* Main content */}
          <div className="space-y-4">
            {/* Step indicator */}
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Step {currentStep + 1} of {technique.steps.length}</span>
              <span>{formatTime(stepTimeElapsed)} / {formatTime(stepDuration)}</span>
            </div>
            
            {/* Instruction card */}
            <Card className={cn(
              "p-4 border-2",
              isCompleted ? "border-green-500" : "border-primary/50"
            )}>
              {isCompleted ? (
                <div className="text-center space-y-2">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-green-500" />
                  <h3 className="text-lg font-medium">Exercise Completed!</h3>
                  <p className="text-sm text-muted-foreground">
                    Great job! You've completed this exercise in {formatTime(timeElapsed)}.
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="font-medium text-base mb-2">
                    {currentStepData.title || `Step ${currentStep + 1}`}
                  </h3>
                  <p className="text-sm">
                    {currentStepData.instruction}
                  </p>
                  
                  {/* Animation container */}
                  {renderBreathAnimation()}
                </>
              )}
            </Card>
          </div>
          
          {/* Controls */}
          <div className="flex justify-between items-center">
            {/* Previous step button */}
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrevStep}
              disabled={currentStep === 0 || !isStarted || isCompleted}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {/* Main control buttons */}
            <div className="flex space-x-2">
              {!isStarted ? (
                <Button onClick={handleStart} className="space-x-1">
                  <Play className="h-4 w-4" />
                  <span>Start</span>
                </Button>
              ) : isPaused ? (
                <Button onClick={handleResume} className="space-x-1">
                  <Play className="h-4 w-4" />
                  <span>Resume</span>
                </Button>
              ) : (
                <Button onClick={handlePause} className="space-x-1" variant="outline">
                  <Pause className="h-4 w-4" />
                  <span>Pause</span>
                </Button>
              )}
              
              {isStarted && !isCompleted && (
                <Button onClick={goToNextStep} variant="outline" className="space-x-1">
                  <Skip className="h-4 w-4" />
                  <span>Next</span>
                </Button>
              )}
            </div>
            
            {/* Voice toggle button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleVoice}
              className={!voiceEnabled ? "text-muted-foreground" : ""}
            >
              {voiceEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Duration: ~{technique.duration} minutes</span>
          </div>
          
          <Button onClick={() => setOpen(false)}>
            {isCompleted ? "Close" : "Exit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 