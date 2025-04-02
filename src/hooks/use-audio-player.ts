import { useState, useEffect, useRef, useCallback } from 'react';

export interface AudioPlayerState {
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  volume: number;
  isLoading: boolean;
  isError: boolean;
  playbackRate: number;
  isMuted: boolean;
}

export interface AudioPlayerControls {
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
  mute: () => void;
  unmute: () => void;
  toggleMute: () => void;
  replay: () => void;
  skipForward: (seconds?: number) => void;
  skipBackward: (seconds?: number) => void;
}

export interface AudioTrack {
  id: string;
  title: string;
  src: string;
  duration?: number;
  artist?: string;
  thumbnail?: string;
}

interface UseAudioPlayerProps {
  src?: string;
  autoPlay?: boolean;
  startTime?: number;
  volume?: number;
  playbackRate?: number;
}

export const useAudioPlayer = ({
  src,
  autoPlay = false,
  startTime = 0,
  volume = 1,
  playbackRate = 1,
}: UseAudioPlayerProps): [AudioPlayerState, AudioPlayerControls] => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioState, setAudioState] = useState<AudioPlayerState>({
    isPlaying: false,
    duration: 0,
    currentTime: 0,
    volume,
    isLoading: true,
    isError: false,
    playbackRate,
    isMuted: false,
  });

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    
    // Set initial properties
    audio.volume = volume;
    audio.playbackRate = playbackRate;
    
    // Cleanup on unmount
    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, []);

  // Set up event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlers = {
      loadstart: () => setAudioState(prev => ({ ...prev, isLoading: true })),
      loadedmetadata: () => {
        setAudioState(prev => ({
          ...prev,
          duration: audio.duration,
          isLoading: false,
        }));
        
        // Set start time if provided
        if (startTime > 0 && startTime < audio.duration) {
          audio.currentTime = startTime;
        }
        
        // Autoplay if enabled
        if (autoPlay) {
          audio.play().catch(error => {
            console.error('Autoplay failed:', error);
            setAudioState(prev => ({ ...prev, isPlaying: false }));
          });
        }
      },
      play: () => setAudioState(prev => ({ ...prev, isPlaying: true })),
      pause: () => setAudioState(prev => ({ ...prev, isPlaying: false })),
      timeupdate: () => 
        setAudioState(prev => ({ ...prev, currentTime: audio.currentTime })),
      volumechange: () => 
        setAudioState(prev => ({ 
          ...prev, 
          volume: audio.volume,
          isMuted: audio.muted 
        })),
      ratechange: () => 
        setAudioState(prev => ({ ...prev, playbackRate: audio.playbackRate })),
      waiting: () => setAudioState(prev => ({ ...prev, isLoading: true })),
      canplay: () => setAudioState(prev => ({ ...prev, isLoading: false })),
      ended: () => setAudioState(prev => ({ ...prev, isPlaying: false, currentTime: 0 })),
      error: () => setAudioState(prev => ({ ...prev, isError: true, isLoading: false })),
    };

    // Add event listeners
    Object.entries(handlers).forEach(([event, handler]) => {
      audio.addEventListener(event, handler);
    });

    // Cleanup event listeners
    return () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        audio.removeEventListener(event, handler);
      });
    };
  }, [autoPlay, startTime]);

  // Update audio source when src changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !src) return;

    // Reset state before loading new source
    setAudioState(prev => ({
      ...prev,
      isLoading: true,
      isError: false,
      currentTime: 0,
      duration: 0,
      isPlaying: false,
    }));

    audio.src = src;
    audio.load();

    // Autoplay if enabled
    if (autoPlay) {
      audio.play().catch(error => {
        console.error('Autoplay failed:', error);
        setAudioState(prev => ({ ...prev, isPlaying: false }));
      });
    }
  }, [src, autoPlay]);

  const controls: AudioPlayerControls = {
    play: useCallback(() => {
      const audio = audioRef.current;
      if (!audio) return;

      // If ended, start from beginning
      if (audio.ended) {
        audio.currentTime = 0;
      }

      audio.play().catch(error => {
        console.error('Play failed:', error);
        setAudioState(prev => ({ ...prev, isPlaying: false }));
      });
    }, []),
    
    pause: useCallback(() => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.pause();
    }, []),
    
    toggle: useCallback(() => {
      const audio = audioRef.current;
      if (!audio) return;
      
      if (audio.paused || audio.ended) {
        controls.play();
      } else {
        controls.pause();
      }
    }, []),
    
    seekTo: useCallback((time: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      
      // Ensure time is within valid range
      const clampedTime = Math.max(0, Math.min(time, audio.duration || 0));
      audio.currentTime = clampedTime;
      
      // Update state immediately for a more responsive UI
      setAudioState(prev => ({ ...prev, currentTime: clampedTime }));
    }, []),
    
    setVolume: useCallback((volume: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      
      // Ensure volume is within valid range (0-1)
      const clampedVolume = Math.max(0, Math.min(volume, 1));
      audio.volume = clampedVolume;
    }, []),
    
    setPlaybackRate: useCallback((rate: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      
      // Common rates: 0.5, 0.75, 1, 1.25, 1.5, 2
      const validRates = [0.5, 0.75, 1, 1.25, 1.5, 2];
      const closestRate = validRates.reduce((prev, curr) => 
        Math.abs(curr - rate) < Math.abs(prev - rate) ? curr : prev
      );
      
      audio.playbackRate = closestRate;
    }, []),
    
    mute: useCallback(() => {
      const audio = audioRef.current;
      if (!audio) return;
      
      audio.muted = true;
    }, []),
    
    unmute: useCallback(() => {
      const audio = audioRef.current;
      if (!audio) return;
      
      audio.muted = false;
    }, []),
    
    toggleMute: useCallback(() => {
      const audio = audioRef.current;
      if (!audio) return;
      
      audio.muted = !audio.muted;
    }, []),
    
    replay: useCallback(() => {
      const audio = audioRef.current;
      if (!audio) return;
      
      audio.currentTime = 0;
      audio.play().catch(error => {
        console.error('Replay failed:', error);
      });
    }, []),
    
    skipForward: useCallback((seconds = 10) => {
      const audio = audioRef.current;
      if (!audio) return;
      
      const newTime = Math.min(audio.currentTime + seconds, audio.duration || 0);
      audio.currentTime = newTime;
      
      // Update state immediately for a more responsive UI
      setAudioState(prev => ({ ...prev, currentTime: newTime }));
    }, []),
    
    skipBackward: useCallback((seconds = 10) => {
      const audio = audioRef.current;
      if (!audio) return;
      
      const newTime = Math.max(audio.currentTime - seconds, 0);
      audio.currentTime = newTime;
      
      // Update state immediately for a more responsive UI
      setAudioState(prev => ({ ...prev, currentTime: newTime }));
    }, []),
  };

  return [audioState, controls];
}; 