import { useRef, useEffect, useState } from 'react';

interface WaveformPoint {
  height: number;
  isActive: boolean;
}

interface UseWaveformProps {
  barCount?: number;
  minHeight?: number;
  maxHeight?: number;
  smoothness?: number;
  progress?: number;
  isPlaying?: boolean;
}

/**
 * Custom hook for generating and animating audio waveforms
 */
export function useWaveform({
  barCount = 40,
  minHeight = 20,
  maxHeight = 100,
  smoothness = 0.3,
  progress = 0,
  isPlaying = false
}: UseWaveformProps = {}) {
  const [bars, setBars] = useState<WaveformPoint[]>([]);
  const prevHeights = useRef<number[]>([]);
  const animationRef = useRef<number | null>(null);

  // Generate initial waveform data
  useEffect(() => {
    // Create initial random heights for smoothing
    if (prevHeights.current.length === 0) {
      prevHeights.current = Array.from({ length: barCount }, () => 
        minHeight + Math.random() * (maxHeight - minHeight)
      );
    }

    // Function to generate a smooth waveform
    const generateBars = () => {
      const newHeights = Array.from({ length: barCount }, (_, i) => {
        // Get previous height or generate new if first time
        const prevHeight = prevHeights.current[i];
        
        // Target is a new random height
        const targetHeight = minHeight + Math.random() * (maxHeight - minHeight);
        
        // Smoothly interpolate between previous and target height
        const newHeight = prevHeight + (targetHeight - prevHeight) * smoothness;
        
        // Update previous heights for next animation frame
        prevHeights.current[i] = newHeight;
        
        return { 
          height: newHeight, 
          isActive: (i / barCount) * 100 <= progress 
        };
      });
      
      setBars(newHeights);
      
      // Continue animation if playing
      if (isPlaying) {
        animationRef.current = requestAnimationFrame(generateBars);
      }
    };

    // Start animation if playing
    if (isPlaying) {
      generateBars();
    } else {
      // If not playing, just update active state based on progress
      setBars(prevHeights.current.map((height, i) => ({
        height,
        isActive: (i / barCount) * 100 <= progress
      })));
    }

    // Cleanup animation on unmount or when parameters change
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [barCount, minHeight, maxHeight, smoothness, progress, isPlaying]);

  return bars;
} 