import { useState, useEffect } from 'react';

type BreathAnimationState = 'inhale' | 'hold' | 'exhale' | 'rest';

export function useBreathAnimation() {
  const [animationState, setAnimationState] = useState<BreathAnimationState>('inhale');
  const [breathAnimation, setBreathAnimation] = useState<string>('scale-100 opacity-40');

  // Update animation based on state
  useEffect(() => {
    switch (animationState) {
      case 'inhale':
        setBreathAnimation('scale-150 opacity-90 bg-primary/20 duration-4000');
        
        // Transition to hold state after 4 seconds
        const inhaleTimer = setTimeout(() => {
          setAnimationState('hold');
        }, 4000);
        
        return () => clearTimeout(inhaleTimer);
        
      case 'hold':
        setBreathAnimation('scale-150 opacity-90 bg-primary/30 duration-2000');
        
        // Transition to exhale state after 2 seconds
        const holdTimer = setTimeout(() => {
          setAnimationState('exhale');
        }, 2000);
        
        return () => clearTimeout(holdTimer);
        
      case 'exhale':
        setBreathAnimation('scale-100 opacity-40 bg-primary/20 duration-6000');
        
        // Transition to rest state after 6 seconds
        const exhaleTimer = setTimeout(() => {
          setAnimationState('rest');
        }, 6000);
        
        return () => clearTimeout(exhaleTimer);
        
      case 'rest':
        setBreathAnimation('scale-100 opacity-30 bg-primary/10 duration-1000');
        
        // Transition back to inhale after 1 second of rest
        const restTimer = setTimeout(() => {
          setAnimationState('inhale');
        }, 1000);
        
        return () => clearTimeout(restTimer);
    }
  }, [animationState]);

  return {
    breathAnimation,
    animationState,
    setAnimationState,
  };
} 