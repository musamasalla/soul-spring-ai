import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MeditationData } from "@/types/meditation";
import { saveMoodRecord } from "@/services/sessionService";
import { toast } from "sonner";
import { 
  Loader2, 
  Brain, 
  HeartPulse, 
  MessageSquare, 
  BarChart2, 
  ExternalLink, 
  AlertTriangle,
  Smile,
  Heart,
  ThumbsUp,
  Meh,
  Frown,
  Zap,
  Wind,
  Moon,
  CloudFog
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EmotionData } from "./EmotionDetector";
import { supabase } from "@/integrations/supabase/client";
import MoodHistoryChart from "./MoodHistoryChart";
import { Link } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Calendar, ArrowRight, Sparkles } from "lucide-react";
import { useMoodStore } from "@/stores/moodStore";
import { useToast } from "@/components/ui/use-toast";

// Mood options with professional icons instead of emojis
const MOOD_OPTIONS = [
  { value: "very_happy", icon: ThumbsUp, label: "Very Happy", color: "text-green-500" },
  { value: "happy", icon: Smile, label: "Happy", color: "text-green-400" },
  { value: "neutral", icon: Meh, label: "Neutral", color: "text-gray-500" },
  { value: "calm", icon: Wind, label: "Calm", color: "text-blue-400" },
  { value: "refreshed", icon: Zap, label: "Refreshed", color: "text-purple-500" },
  { value: "sleepy", icon: Moon, label: "Sleepy", color: "text-indigo-400" },
  { value: "anxious", icon: CloudFog, label: "Anxious", color: "text-amber-500" },
  { value: "sad", icon: Frown, label: "Sad", color: "text-blue-500" }
];

// Map emotion categories to mood options for better suggestions
const EMOTION_TO_MOOD_MAP: Record<string, string[]> = {
  happy: ["happy", "very_happy"],
  sad: ["sad"],
  angry: ["sad", "anxious"],
  anxious: ["anxious"],
  calm: ["calm", "refreshed"],
  neutral: ["neutral", "sleepy"],
  content: ["calm", "happy"],
  excited: ["very_happy", "happy"],
  tired: ["sleepy", "neutral"],
  frustrated: ["anxious", "sad"],
  worried: ["anxious"],
  relaxed: ["refreshed", "calm"]
};

interface TherapySessionData {
  id: string;
  title: string;
  currentStage?: string;
  primaryTopic?: string;
}

interface MoodTrackerProps {
  meditation?: MeditationData;
  therapySession?: TherapySessionData;
  userId?: string;
  emotionData?: EmotionData | null;
  onSave?: (mood: string, notes: string) => void;
  onSkip?: () => void;
  compact?: boolean;
  className?: string;
}

export default function MoodTracker({ 
  meditation, 
  therapySession,
  userId,
  emotionData,
  onSave, 
  onSkip,
  compact = false,
  className = ""
}: MoodTrackerProps) {
  const navigate = useNavigate();
  const { addMood, currentMood, setCurrentMood } = useMoodStore();
  const { toast } = useToast();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [moodHistory, setMoodHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [moodSuggestions, setMoodSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [suggestedActivities, setSuggestedActivities] = useState<string[]>([]);
  
  // Get mood suggestions based on detected emotions
  const getMoodSuggestions = (emotionData: EmotionData): string[] => {
    const { primaryEmotion, emotionScores } = emotionData;
    
    // First, get suggestions based on primary emotion
    let suggestions: string[] = [];
    
    // Map the primary emotion to corresponding mood options
    if (primaryEmotion in EMOTION_TO_MOOD_MAP) {
      suggestions = [...EMOTION_TO_MOOD_MAP[primaryEmotion]];
    }
    
    // If we have emotion scores, check top 2 emotions for additional suggestions
    if (emotionScores && emotionScores.length > 0) {
      // Sort emotion scores by value (high to low)
      const sortedScores = [...emotionScores].sort((a, b) => b.value - a.value);
      
      // Add suggestions based on secondary emotions (if not already included)
      for (let i = 0; i < Math.min(2, sortedScores.length); i++) {
        const emotion = sortedScores[i].name.toLowerCase();
        if (emotion in EMOTION_TO_MOOD_MAP) {
          EMOTION_TO_MOOD_MAP[emotion].forEach(mood => {
            if (!suggestions.includes(mood)) {
              suggestions.push(mood);
            }
          });
        }
      }
    }
    
    // If there are no suggestions yet, add neutral as a default
    if (suggestions.length === 0) {
      suggestions = ["neutral"];
    }
    
    // Limit to top 3 suggestions
    return suggestions.slice(0, 3);
  };

  // When emotion data changes, update mood suggestions and potentially select a mood
  useEffect(() => {
    if (emotionData) {
      // Get mood suggestions based on emotions
      const suggestions = getMoodSuggestions(emotionData);
      setMoodSuggestions(suggestions);
      
      // If no mood is selected, select the top suggestion
      if (!selectedMood && suggestions.length > 0) {
        setSelectedMood(suggestions[0]);
      }
      
      // Generate suggested notes based on emotions and context
      if (!notes) {
        let emotionLevel = emotionData.sentiment > 70 ? 'high' : 
                          emotionData.sentiment > 50 ? 'moderate' : 
                          emotionData.sentiment > 30 ? 'low' : 'very low';
        
        let emotionTrend = emotionData.emotionalTrend === 'improving' ? 'improving' :
                          emotionData.emotionalTrend === 'declining' ? 'declining' : 'staying stable';
                          
        let suggestedNotes = `I'm currently feeling ${emotionData.primaryEmotion} with ${emotionLevel} emotional intensity. My overall mood appears to be ${emotionTrend}.`;

        // Add context based on therapy session if available
        if (therapySession) {
          suggestedNotes += `\n\nThis mood is recorded during my therapy session "${therapySession.title}"${
            therapySession.primaryTopic ? ` focusing on ${therapySession.primaryTopic}` : ''
          }.`;
          
          if (therapySession.currentStage) {
            suggestedNotes += ` We're currently in the ${therapySession.currentStage} stage.`;
          }
        }
        
        // Add recommended techniques if available
        if (emotionData.recommendedTechniques && emotionData.recommendedTechniques.length > 0) {
          suggestedNotes += `\n\nTechniques that might help: ${emotionData.recommendedTechniques.join(', ')}.`;
        }
        
        setNotes(suggestedNotes);
      }
    }
  }, [emotionData, therapySession]);
  
  // Load mood history for the user
  useEffect(() => {
    if (userId) {
      loadMoodHistory();
    }
  }, [userId]);
  
  const loadMoodHistory = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      setMoodHistory(data || []);
    } catch (error) {
      console.error("Error loading mood history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedMood) return;
    
    setIsSaving(true);
    
    try {
      // If we have a meditation, save that with the mood
      if (meditation) {
        // Create a session ID if not provided
        const sessionId = `manual-${Date.now()}`;
        await saveMoodRecord(
          sessionId,
          meditation.id,
          meditation.title,
          selectedMood,
          notes
        );
      } else if (userId) {
        // Prepare factors data
        const factors: Record<string, any> = {};
        
        // Add emotional data if available
        if (emotionData) {
          factors.primaryEmotion = emotionData.primaryEmotion;
          factors.sentiment = emotionData.sentiment;
          factors.emotionalTrend = emotionData.emotionalTrend;
          
          // Add top emotion scores for better analysis
          if (emotionData.emotionScores && emotionData.emotionScores.length > 0) {
            const topEmotions = emotionData.emotionScores
              .sort((a, b) => b.value - a.value)
              .slice(0, 3)
              .map(e => ({ name: e.name, value: e.value }));
            
            factors.topEmotions = topEmotions;
          }
          
          // Add recommended techniques
          if (emotionData.recommendedTechniques) {
            factors.recommendedTechniques = emotionData.recommendedTechniques;
          }
        }
        
        // Add therapy session data if available
        if (therapySession) {
          factors.therapy_session_id = therapySession.id;
          factors.therapy_session_title = therapySession.title;
          factors.therapy_session_stage = therapySession.currentStage;
          factors.therapy_session_topic = therapySession.primaryTopic;
        }
        
        // Save mood directly to the database
        await supabase
          .from('mood_entries')
          .insert({
            user_id: userId,
            mood: selectedMood,
            notes: notes,
            date: new Date().toISOString().split('T')[0],
            factors: Object.keys(factors).length > 0 ? factors : null
          });
      }
      
      toast.success("Mood tracked successfully");
      
      // Call the parent component's onSave function if provided
      if (onSave) {
        onSave(selectedMood, notes);
      }
      
      // Reset the form
    setSelectedMood(null);
      setNotes("");
      setMoodSuggestions([]);
      
      // Reload mood history
      loadMoodHistory();
    } catch (error) {
      console.error("Error saving mood:", error);
      toast.error("Error saving mood. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const getMoodIcon = (mood: string) => {
    const option = MOOD_OPTIONS.find(o => o.value === mood);
    if (!option) return <Meh className="h-5 w-5 text-gray-500" />;
    const Icon = option.icon;
    return <Icon className={`h-5 w-5 ${option.color}`} />;
  };
  
  // Calculate if mood selection matches detected emotion
  const moodMatchesEmotion = (moodValue: string): boolean => {
    if (!emotionData || !moodSuggestions.length) return false;
    return moodSuggestions.includes(moodValue);
  };
  
  // Check if a mood is in the suggested moods list
  const isMoodSuggested = (mood: string): boolean => {
    return moodSuggestions.includes(mood);
  };
  
  // Determine if there's a significant mismatch between selected mood and detected emotion
  const hasMoodEmotionMismatch = (): boolean => {
    if (!selectedMood || !emotionData || !emotionData.primaryEmotion) return false;
    
    // Check if selected mood is in suggestions
    if (moodSuggestions.includes(selectedMood)) return false;
    
    // Check for significant mismatches (e.g., very happy mood when sad emotion detected)
    const positiveEmotions = ['happy', 'calm', 'content'];
    const negativeEmotions = ['sad', 'angry', 'anxious', 'frustrated', 'worried'];
    
    const positiveMoods = ['very_happy', 'happy', 'refreshed', 'calm'];
    const negativeMoods = ['sad', 'anxious'];
    
    const isPrimaryEmotionPositive = positiveEmotions.includes(emotionData.primaryEmotion);
    const isPrimaryEmotionNegative = negativeEmotions.includes(emotionData.primaryEmotion);
    
    const isSelectedMoodPositive = positiveMoods.includes(selectedMood);
    const isSelectedMoodNegative = negativeMoods.includes(selectedMood);
    
    // Return true if there's a significant mismatch
    return (isPrimaryEmotionPositive && isSelectedMoodNegative) || 
           (isPrimaryEmotionNegative && isSelectedMoodPositive);
  };

  // Generate activity suggestions when mood is selected
  useEffect(() => {
    if (selectedMood) {
      generateActivitySuggestions(selectedMood);
    } else {
      setSuggestedActivities([]);
    }
  }, [selectedMood]);
  
  const generateActivitySuggestions = (mood: string) => {
    // This would ideally be a more sophisticated algorithm based on user preferences,
    // past behaviors, and the specific mood, but for now we'll use a simple mapping
    switch (mood) {
      case "very_happy":
        setSuggestedActivities([
          "Gratitude meditation",
          "Journal about this positive experience",
          "Share your joy with someone"
        ]);
        break;
      case "happy":
        setSuggestedActivities([
          "Mindfulness practice",
          "Light physical activity",
          "Creative expression"
        ]);
        break;
      case "neutral":
        setSuggestedActivities([
          "Mindfulness meditation",
          "Gentle yoga",
          "Self-reflection exercise"
        ]);
        break;
      case "calm":
        setSuggestedActivities([
          "Deep breathing exercise",
          "Body scan meditation",
          "Gentle stretching"
        ]);
        break;
      case "refreshed":
        setSuggestedActivities([
          "Goal setting exercise",
          "Productivity session",
          "Learning something new"
        ]);
        break;
      case "sleepy":
        setSuggestedActivities([
          "Short energizing meditation",
          "Brief walk outside",
          "Light stretching"
        ]);
        break;
      case "anxious":
        setSuggestedActivities([
          "Calming breathing exercise",
          "Grounding techniques",
          "Progressive muscle relaxation"
        ]);
        break;
      case "sad":
        setSuggestedActivities([
          "Self-compassion meditation",
          "Gentle movement",
          "Connect with a supportive person"
        ]);
        break;
      default:
        setSuggestedActivities([]);
    }
  };
  
  // Generate suggested notes based on emotion data
  const generateSuggestedNotes = (): string => {
    if (!emotionData) return '';
    
    let emotionLevel = emotionData.sentiment > 70 ? 'high' : 
                      emotionData.sentiment > 50 ? 'moderate' : 
                      emotionData.sentiment > 30 ? 'low' : 'very low';
    
    let emotionTrend = emotionData.emotionalTrend === 'improving' ? 'improving' :
                      emotionData.emotionalTrend === 'declining' ? 'declining' : 'stable';
                      
    let suggestedNotes = `I'm currently feeling ${emotionData.primaryEmotion} with ${emotionLevel} emotional intensity. My overall mood appears to be ${emotionTrend}.`;

    // Add context based on therapy session if available
    if (therapySession) {
      suggestedNotes += `\n\nThis mood is recorded during my therapy session "${therapySession.title}"${
        therapySession.primaryTopic ? ` focusing on ${therapySession.primaryTopic}` : ''
      }.`;
      
      if (therapySession.currentStage) {
        suggestedNotes += ` We're currently in the ${therapySession.currentStage} stage.`;
      }
    }
    
    // Add recommended techniques if available
    if (emotionData.recommendedTechniques && emotionData.recommendedTechniques.length > 0) {
      suggestedNotes += `\n\nTechniques that might help: ${emotionData.recommendedTechniques.join(', ')}.`;
    }
    
    return suggestedNotes;
  };
  
  // Handle selecting a mood
  const handleSelectMood = (mood: string) => {
    setSelectedMood(mood);
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedMood) {
      toast({
        title: "Please select a mood",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create new mood entry
      const newMoodData = {
        user_id: userId || 'anonymous',
        mood: selectedMood,
        notes: notes,
        date: new Date().toISOString().split('T')[0],
        factors: emotionData ? {
          primaryEmotion: emotionData.primaryEmotion,
          sentiment: emotionData.sentiment,
          emotionalTrend: emotionData.emotionalTrend
        } : null
      };
      
      // Add to local store
      addMood(newMoodData);
      
      // Set current mood (just the string value for now)
      setCurrentMood(selectedMood);
      
      // Save to database if user is logged in
      if (userId) {
        const { error } = await supabase
          .from('mood_entries')
          .insert([newMoodData]);
          
        if (error) throw error;
      }
      
      // Call onMoodSaved callback if provided
      if (onSave) {
        onSave(selectedMood, notes);
      }
      
      // Success toast
      toast({
        title: "Mood saved",
        description: "Your mood has been recorded successfully."
      });
      
      // Reset form if not in compact mode
      if (!compact) {
        setNotes("");
      }
      
      // Show recommendations
      setShowSuggestions(true);
      
    } catch (error) {
      console.error("Error saving mood:", error);
      toast({
        title: "Failed to save mood",
        description: "There was an error saving your mood. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // If compact mode, show a simplified version
  if (compact) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center">
            <Smile className="h-4 w-4 text-primary mr-2" />
            <span>Mood Tracker</span>
          </CardTitle>
          <CardDescription>How are you feeling right now?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {MOOD_OPTIONS.map((option) => (
              <TooltipProvider key={option.value}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={selectedMood === option.value ? "default" : "outline"}
                      className={`h-12 p-0 w-full ${
                        isMoodSuggested(option.value) ? "ring-1 ring-primary/30 hover:ring-primary" : ""
                      }`}
                      onClick={() => handleSelectMood(option.value)}
                    >
                      <div className="flex flex-col items-center">
                        <div className="flex justify-center items-center h-10">
                          {getMoodIcon(option.value)}
                        </div>
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{option.label}</p>
                    {isMoodSuggested(option.value) && (
                      <p className="text-xs text-primary">Suggested based on your messages</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
          
          <div className="space-y-3">
            <Textarea
              placeholder="Add notes about how you're feeling..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none h-20"
            />
            
            <div className="flex justify-between gap-2">
              <Button 
                className="flex-1" 
                onClick={handleSubmit} 
                disabled={!selectedMood || isLoading}
              >
                Save Mood
              </Button>
              
              <Button 
                variant="outline" 
                className="flex gap-1"
                onClick={() => navigate('/mood-history')}
              >
                <BarChart2 className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only">History</span>
              </Button>
            </div>
          </div>
        </CardContent>
        
        {selectedMood && showSuggestions && (
          <CardFooter className="flex-col items-start pt-0">
            <div className="flex items-center justify-between w-full mb-2">
              <h4 className="text-sm font-medium flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>Recommended for You</span>
              </h4>
              <Button 
                variant="link" 
                className="p-0 h-auto text-xs"
                onClick={() => navigate(`/recommendations?mood=${selectedMood}`)}
              >
                <span>View All</span>
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-1">
              {suggestedActivities.slice(0, 2).map((activity, index) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => navigate(`/recommendations?mood=${selectedMood}`)}
                >
                  {activity}
                </Badge>
              ))}
            </div>
          </CardFooter>
        )}
      </Card>
    );
  }
  
  // Full version
  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Smile className="h-5 w-5 text-primary mr-2" />
          <span>Mood Tracker</span>
                </CardTitle>
        <CardDescription>
          Track your mood and emotions over time to identify patterns and improve self-awareness
                </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="mood" className="mb-6">
          <TabsList>
            <TabsTrigger value="mood">Mood Selection</TabsTrigger>
            <TabsTrigger value="history">Mood History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="mood">
            <div className="grid grid-cols-4 gap-3">
              {MOOD_OPTIONS.map((option) => (
                <TooltipProvider key={option.value}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={selectedMood === option.value ? "default" : "outline"}
                        className={`h-24 p-0 ${
                          isMoodSuggested(option.value) ? "ring-2 ring-primary/30" : ""
                        }`}
                        onClick={() => handleSelectMood(option.value)}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex justify-center items-center h-10">
                            {getMoodIcon(option.value)}
                          </div>
                          <span className="text-xs">{option.label}</span>
                          {isMoodSuggested(option.value) && (
                            <Badge variant="outline" className="text-[10px] px-1 py-0">Suggested</Badge>
                          )}
              </div>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isMoodSuggested(option.value) && emotionData?.primaryEmotion && (
                        <p className="text-xs">
                          Suggested based on detected emotion: <span className="font-medium capitalize">{emotionData.primaryEmotion}</span>
                        </p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            {/* History content */}
          </TabsContent>
        </Tabs>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Add Notes</h3>
            <Textarea
              placeholder="How are you feeling? What's on your mind?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none h-24"
            />
            {emotionData && !notes && (
                <Button 
                  variant="ghost" 
                size="sm" 
                className="mt-2 text-xs"
                onClick={() => setNotes(generateSuggestedNotes())}
              >
                Generate suggestion based on detected emotions
              </Button>
            )}
                  </div>
          
          <div className="flex justify-between gap-2">
            <Button 
              className="flex-1" 
              onClick={handleSubmit} 
              disabled={!selectedMood || isLoading}
            >
              Save Mood
                </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/mood-history')}
            >
              View History
            </Button>
                        </div>
                      </div>
      </CardContent>
      
      {selectedMood && showSuggestions && (
        <CardFooter className="flex-col items-start pt-0 border-t">
          <div className="flex items-center justify-between w-full mb-3">
            <h4 className="font-medium flex items-center gap-1">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Recommended for You</span>
            </h4>
            <Button 
              variant="outline" 
              size="sm"
              className="gap-1"
              onClick={() => navigate(`/recommendations?mood=${selectedMood}`)}
            >
              <span>View All</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-2">
            {suggestedActivities.map((activity, index) => (
              <Button 
                key={index} 
                variant="secondary" 
                className="justify-start"
                onClick={() => navigate(`/recommendations?mood=${selectedMood}`)}
              >
                {activity}
              </Button>
            ))}
          </div>
          </CardFooter>
      )}
        </Card>
  );
} 