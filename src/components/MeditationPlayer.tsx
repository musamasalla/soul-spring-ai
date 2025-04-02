import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Share,
  Heart,
  Clock,
  RotateCcw,
  ChevronDown,
  Loader2
} from "lucide-react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatTime } from "@/utils/formatTime";
import { useAudioPlayer, AudioPlayerState, AudioPlayerControls } from "@/hooks/use-audio-player";
import { useWaveform } from "@/hooks/use-waveform";
import { useFavorites } from "@/contexts/FavoritesContext";
import { MeditationData } from "@/types/meditation";
import MoodTracker from "./MoodTracker";
import { useToast } from "@/hooks/use-toast";
import { saveMeditationSession, saveMoodRecord } from "@/services/sessionService";
import "./MeditationPlayer.css";

interface MeditationPlayerProps {
  meditation: MeditationData;
  onClose: () => void;
  onComplete?: () => void;
  autoPlay?: boolean;
}

// Default meditation if none provided
const defaultMeditation: MeditationData = {
  id: "default",
  title: "Mindful Breathing",
  description: "A simple practice to calm your mind and reset your nervous system.",
  audioSrc: "/meditations/mindful-breathing.mp3",
  duration: 300,
  instructor: "Default Guide",
  category: ["Mindfulness", "Breathing"],
};

export default function MeditationPlayer({ 
  meditation = defaultMeditation, 
  onClose, 
  onComplete,
  autoPlay = false
}: MeditationPlayerProps) {
  const { toast } = useToast();
  // State for UI interactions
  const [sessionComplete, setSessionComplete] = useState(false);
  const [showMoodTracker, setShowMoodTracker] = useState(false);
  const [loop, setLoop] = useState(false);
  
  // Use favorites context
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const isMeditationFavorite = isFavorite(meditation.id);
  
  // References
  const waveformRef = useRef<HTMLDivElement>(null);
  
  // Use our audio player hook - handle both audioSrc and audioUrl
  const [audioState, audioControls] = useAudioPlayer({
    src: meditation.audioSrc || meditation.audioUrl || "",
    autoPlay,
    volume: 0.75,
  });
  
  // Use waveform hook for visualization
  const waveformBars = useWaveform({
    barCount: 40,
    minHeight: 15,
    maxHeight: 100,
    progress: audioState.duration ? (audioState.currentTime / audioState.duration) * 100 : 0,
    isPlaying: audioState.isPlaying
  });
  
  // Add state to track the saved session ID
  const [savedSessionId, setSavedSessionId] = useState<string | null>(null);
  
  // Handle completion
  useEffect(() => {
    if (!audioState.isPlaying && audioState.currentTime > 0 && audioState.currentTime >= audioState.duration - 0.5) {
      setSessionComplete(true);
      
      // Show mood tracker if not in loop mode
      if (!loop) {
        setShowMoodTracker(true);
        
        // Save the completed meditation session
        const session = saveMeditationSession(meditation, true);
        
        // Store the session ID for linking with mood data later
        setSavedSessionId(session.id);
      }
      
      if (onComplete) onComplete();
      
      // If loop is enabled, restart playback
      if (loop) {
        setTimeout(() => {
          audioControls.seekTo(0);
          audioControls.play();
        }, 500);
      }
    }
  }, [audioState.isPlaying, audioState.currentTime, audioState.duration, loop, onComplete, audioControls, meditation]);

  // Format time values
  const currentTimeFormatted = formatTime(audioState.currentTime);
  const durationFormatted = formatTime(audioState.duration);
  
  // Calculate progress percentage
  const progress = audioState.duration ? (audioState.currentTime / audioState.duration) * 100 : 0;

  // Utility function to change playback rate
  const handlePlaybackRateChange = (rate: number) => {
    audioControls.setPlaybackRate(rate);
  };

  const handleSaveMood = (mood: string, notes: string) => {
    if (savedSessionId) {
      // Save the mood record linked to the meditation session
      saveMoodRecord(savedSessionId, meditation.id, meditation.title, mood, notes);
      
      toast({
        title: "Mood tracked",
        description: "Your meditation experience has been saved."
      });
    } else {
      // If no saved session (unusual case), create one now
      const session = saveMeditationSession(meditation, true);
      saveMoodRecord(session.id, meditation.id, meditation.title, mood, notes);
      
      toast({
        title: "Meditation & mood saved",
        description: "Your session and mood have been recorded."
      });
    }
    
    // Hide mood tracker and reset session state
    setShowMoodTracker(false);
    setSessionComplete(false);
  };

  const handleSkipMoodTracking = () => {
    setShowMoodTracker(false);
    setSessionComplete(false);
  };

  // Render mood tracker if the session is complete and not in loop mode
  if (showMoodTracker) {
    return (
      <div className="space-y-6">
        <MoodTracker 
          meditation={meditation} 
          onSave={handleSaveMood} 
          onSkip={handleSkipMoodTracking} 
        />
      </div>
    );
  }

  return (
    <Card className="glass-card relative overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center">
              {meditation.title}
              {meditation.isPremium && (
                <Badge className="bg-primary text-primary-foreground ml-2 text-xs">Premium</Badge>
              )}
            </CardTitle>
            <CardDescription>{meditation.instructor || "Guided Meditation"}</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-2">
        {/* Cover image or waveform visualization */}
        {meditation.coverImage ? (
          <div className="relative aspect-[3/2] rounded-md overflow-hidden">
            <img 
              src={meditation.coverImage} 
              alt={meditation.title} 
              className="object-cover w-full h-full"
            />
            {audioState.isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="loading-spinner"></div>
              </div>
            )}
          </div>
        ) : (
          <div 
            ref={waveformRef} 
            className="audio-waveform h-20 w-full flex items-center justify-center"
          >
            {audioState.isLoading ? (
              <div className="loading-spinner"></div>
            ) : (
              <div className="waveform-container">
                {waveformBars.map((bar, index) => (
                  <div
                    key={index}
                    className={`waveform-bar ${bar.isActive ? 'active' : ''}`}
                    style={{ height: `${bar.height}%` }}
                  ></div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Description */}
        <div className="text-sm text-muted-foreground">
          {meditation.description}
        </div>
        
        {/* Progress slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>{currentTimeFormatted}</span>
            <span>{durationFormatted}</span>
          </div>
          <Slider
            value={[progress]}
            max={100}
            step={0.1}
            className="cursor-pointer meditation-slider"
            onValueChange={(values) => {
              audioControls.seekTo((values[0] / 100) * audioState.duration);
            }}
          />
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => audioControls.skipBackward(10)}
                  >
                    <SkipBack className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>10 seconds back</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Button 
              variant="outline" 
              size="icon" 
              className={`h-14 w-14 rounded-full ${audioState.isPlaying ? 'play-pause-pulse' : ''}`}
              onClick={audioControls.toggle}
              disabled={audioState.isLoading || audioState.isError}
            >
              {audioState.isLoading ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : audioState.isPlaying ? (
                <Pause className="h-8 w-8" />
              ) : (
                <Play className="h-8 w-8 ml-1" />
              )}
            </Button>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => audioControls.skipForward(10)}
                  >
                    <SkipForward className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>10 seconds forward</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="flex items-center space-x-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={loop ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => setLoop(!loop)}
                  >
                    <RotateCcw className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{loop ? "Disable loop" : "Enable loop"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                  {audioState.isMuted ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-3 volume-slider-popover">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Volume</h4>
                  <Slider
                    value={[audioState.volume * 100]}
                    max={100}
                    step={1}
                    onValueChange={(values) => {
                      const newVolume = values[0] / 100;
                      audioControls.setVolume(newVolume);
                      if (newVolume > 0 && audioState.isMuted) {
                        audioControls.unmute();
                      }
                    }}
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                  <div className="mt-2 pt-2 border-t">
                    <h4 className="text-sm font-medium mb-2">Playback Speed</h4>
                    <div className="flex gap-1">
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                        <Button
                          key={rate}
                          variant={audioState.playbackRate === rate ? "secondary" : "outline"}
                          size="sm"
                          className="h-7 text-xs flex-1"
                          onClick={() => handlePlaybackRateChange(rate)}
                        >
                          {rate}x
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            <Button
              variant={isMeditationFavorite ? "secondary" : "ghost"}
              size="icon"
              onClick={() => {
                if (isMeditationFavorite) {
                  removeFavorite(meditation.id);
                } else {
                  addFavorite(meditation);
                }
              }}
            >
              <Heart className={`h-5 w-5 ${isMeditationFavorite ? "fill-current" : ""}`} />
            </Button>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Share className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share meditation</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        {/* Session complete message - only show if not displaying mood tracker */}
        {sessionComplete && !showMoodTracker && !loop && (
          <div className="text-center text-primary font-medium animate-fade-in">
            <p>Session complete! How do you feel?</p>
            <div className="flex justify-center mt-2 space-x-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setShowMoodTracker(true)}
              >
                Track my mood
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setSessionComplete(false)}
              >
                Skip
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-2 pb-4 flex justify-between text-xs text-muted-foreground">
        <div className="flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          <span>{Math.ceil(audioState.duration / 60)} min</span>
        </div>
        <div className="flex flex-wrap gap-1 justify-end">
          {meditation.category && (
            Array.isArray(meditation.category) 
              ? meditation.category.map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                    {tag}
                  </span>
                ))
              : (
                <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                  {meditation.category}
                </span>
              )
          )}
        </div>
      </CardFooter>
    </Card>
  );
} 