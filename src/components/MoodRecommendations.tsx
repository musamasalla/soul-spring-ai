import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmotionData } from "./EmotionDetector";
import { MeditationData } from "@/types/meditation";
import { TherapyTechniqueType } from "./TherapyTechniques";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Brain, Sparkles, Play, Clock, Plus, ArrowRight, Lightbulb, Music } from "lucide-react";

// Map moods to recommended activities
const MOOD_ACTIVITY_MAP: Record<string, {
  meditations: string[];
  techniques: TherapyTechniqueType[];
  description: string;
}> = {
  "very_happy": {
    meditations: ["gratitude", "loving-kindness", "joy"],
    techniques: ["gratitude", "values", "mindfulness"],
    description: "Cultivate and savor your positive emotions"
  },
  "happy": {
    meditations: ["gratitude", "loving-kindness", "mindfulness"],
    techniques: ["gratitude", "values", "mindfulness"],
    description: "Enhance your positive mood with practices that build resilience"
  },
  "neutral": {
    meditations: ["mindfulness", "body-scan", "breathing"],
    techniques: ["mindfulness", "values", "behavioral_activation"],
    description: "Explore mindfulness practices to increase emotional awareness"
  },
  "calm": {
    meditations: ["breathing", "body-scan", "mindfulness"],
    techniques: ["mindfulness", "relaxation", "gratitude"],
    description: "Maintain your sense of calm and groundedness"
  },
  "refreshed": {
    meditations: ["mindfulness", "intention-setting", "loving-kindness"],
    techniques: ["goal_setting", "values", "behavioral_activation"],
    description: "Channel your energy into meaningful pursuits"
  },
  "sleepy": {
    meditations: ["energizing-breath", "body-scan", "quick-reset"],
    techniques: ["behavioral_activation", "self_care", "goal_setting"],
    description: "Gentle practices to bring balance to your energy"
  },
  "anxious": {
    meditations: ["calm-anxiety", "breathing", "body-scan"],
    techniques: ["relaxation", "grounding", "cognitive_restructuring"],
    description: "Soothing practices to reduce anxiety and worry"
  },
  "sad": {
    meditations: ["self-compassion", "loving-kindness", "joy"],
    techniques: ["behavioral_activation", "cognitive_restructuring", "acceptance"],
    description: "Compassionate practices for difficult emotions"
  }
};

// Map emotion keywords to meditation tags for more nuanced recommendations
const EMOTION_TO_MEDITATION_TAGS: Record<string, string[]> = {
  "happy": ["joy", "gratitude", "loving-kindness"],
  "sad": ["self-compassion", "acceptance", "loving-kindness"],
  "angry": ["calming", "self-compassion", "acceptance"],
  "anxious": ["anxiety-relief", "calm", "breathing"],
  "calm": ["mindfulness", "presence", "peace"],
  "neutral": ["mindfulness", "awareness", "breathing"],
  "tired": ["energizing", "gentle", "body-scan"],
  "content": ["gratitude", "joy", "mindfulness"],
  "excited": ["grounding", "focus", "mindfulness"],
  "hopeful": ["intention", "gratitude", "growth"],
  "confused": ["clarity", "focus", "grounding"],
  "worried": ["anxiety-relief", "calm", "grounding"],
  "frustrated": ["acceptance", "perspective", "patience"]
};

interface MoodRecommendationsProps {
  currentMood?: string | null;
  emotionData?: EmotionData | null;
  userId?: string;
  onSelectMeditation?: (meditation: MeditationData) => void;
  onSelectTechnique?: (technique: TherapyTechniqueType) => void;
  compact?: boolean;
}

export default function MoodRecommendations({
  currentMood,
  emotionData,
  userId,
  onSelectMeditation,
  onSelectTechnique,
  compact = false
}: MoodRecommendationsProps) {
  const [recommendedMeditations, setRecommendedMeditations] = useState<MeditationData[]>([]);
  const [recommendedTechniques, setRecommendedTechniques] = useState<TherapyTechniqueType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("meditations");
  const navigate = useNavigate();
  
  // Get recommendations based on mood and emotion data
  useEffect(() => {
    if (currentMood || emotionData) {
      generateRecommendations();
    }
  }, [currentMood, emotionData]);
  
  // Generate recommendations based on mood and emotion data
  const generateRecommendations = async () => {
    setIsLoading(true);
    
    try {
      // Get meditation recommendations
      await fetchRecommendedMeditations();
      
      // Get technique recommendations
      generateTechniqueRecommendations();
      
    } catch (error) {
      console.error("Error generating recommendations:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch recommended meditations from the database
  const fetchRecommendedMeditations = async () => {
    try {
      // Collect meditation tags to search for
      let searchTags: string[] = [];
      
      // Add tags based on current mood
      if (currentMood && currentMood in MOOD_ACTIVITY_MAP) {
        searchTags = [...searchTags, ...MOOD_ACTIVITY_MAP[currentMood].meditations];
      }
      
      // Add tags based on emotion data
      if (emotionData) {
        const { primaryEmotion, emotionScores } = emotionData;
        
        // Add tags for primary emotion
        if (primaryEmotion in EMOTION_TO_MEDITATION_TAGS) {
          searchTags = [...searchTags, ...EMOTION_TO_MEDITATION_TAGS[primaryEmotion]];
        }
        
        // Add tags for secondary emotions
        if (emotionScores && emotionScores.length > 1) {
          const secondaryEmotion = emotionScores[1].name;
          if (secondaryEmotion in EMOTION_TO_MEDITATION_TAGS) {
            const secondaryTags = EMOTION_TO_MEDITATION_TAGS[secondaryEmotion];
            searchTags = [...searchTags, ...secondaryTags];
          }
        }
        
        // Adjust based on emotional trend
        if (emotionData.emotionalTrend === 'improving') {
          searchTags.push('gratitude', 'joy');
        } else if (emotionData.emotionalTrend === 'declining') {
          searchTags.push('self-compassion', 'acceptance');
        }
      }
      
      // Remove duplicates
      searchTags = [...new Set(searchTags)];
      
      // Fetch meditations from database based on tags
      const { data, error } = await supabase
        .from('meditations')
        .select('*')
        .containedBy('tags', searchTags)
        .limit(6);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setRecommendedMeditations(data as MeditationData[]);
      } else {
        // If no specific recommendations, fetch the most popular meditations
        const { data: popularData, error: popularError } = await supabase
          .from('meditations')
          .select('*')
          .order('play_count', { ascending: false })
          .limit(6);
          
        if (popularError) throw popularError;
        
        if (popularData) {
          setRecommendedMeditations(popularData as MeditationData[]);
        }
      }
    } catch (error) {
      console.error("Error fetching recommended meditations:", error);
      setRecommendedMeditations([]);
    }
  };
  
  // Generate technique recommendations based on mood and emotion data
  const generateTechniqueRecommendations = () => {
    let techniques: TherapyTechniqueType[] = [];
    
    // Add techniques based on current mood
    if (currentMood && currentMood in MOOD_ACTIVITY_MAP) {
      techniques = [...techniques, ...MOOD_ACTIVITY_MAP[currentMood].techniques];
    }
    
    // Add techniques based on emotion data
    if (emotionData && emotionData.recommendedTechniques) {
      const mappedTechniques: TherapyTechniqueType[] = emotionData.recommendedTechniques
        .map(technique => {
          // Map technique name back to TherapyTechniqueType
          switch (technique) {
            case "Cognitive Restructuring": return "cognitive_restructuring";
            case "Behavioral Activation": return "behavioral_activation";
            case "Mindfulness": return "mindfulness";
            case "Relaxation Techniques": return "relaxation";
            case "Grounding Exercises": return "grounding";
            case "Values Exploration": return "values";
            case "Gradual Exposure": return "exposure";
            case "Problem Solving": return "problem_solving";
            case "Acceptance Practice": return "acceptance";
            case "Gratitude Practice": return "gratitude";
            case "Emotional Regulation": return "emotional_regulation";
            case "Goal Setting": return "goal_setting";
            case "Self-Care Activities": return "self_care";
            default: return "mindfulness";
          }
        });
      
      techniques = [...techniques, ...mappedTechniques];
    }
    
    // Remove duplicates
    techniques = [...new Set(techniques)];
    
    // Limit to top 6
    setRecommendedTechniques(techniques.slice(0, 6));
  };
  
  // Handle selecting a meditation
  const handleSelectMeditation = (meditation: MeditationData) => {
    if (onSelectMeditation) {
      onSelectMeditation(meditation);
    } else {
      navigate(`/meditations/${meditation.id}`);
    }
  };
  
  // Handle selecting a technique
  const handleSelectTechnique = (technique: TherapyTechniqueType) => {
    if (onSelectTechnique) {
      onSelectTechnique(technique);
    } else {
      navigate('/therapy?technique=' + technique);
    }
  };
  
  // Get descriptive text based on current mood or primary emotion
  const getRecommendationText = (): string => {
    if (currentMood && currentMood in MOOD_ACTIVITY_MAP) {
      return MOOD_ACTIVITY_MAP[currentMood].description;
    }
    
    if (emotionData && emotionData.primaryEmotion) {
      const emotion = emotionData.primaryEmotion;
      switch (emotion) {
        case "happy":
        case "content":
        case "excited":
          return "Activities to help you savor and maintain positive emotions";
        case "sad":
        case "frustrated":
          return "Supportive practices to help with difficult emotions";
        case "anxious":
        case "worried":
          return "Calming techniques to reduce anxiety and stress";
        case "calm":
          return "Practices to maintain your sense of peace and balance";
        case "neutral":
          return "Mindfulness practices to enhance emotional awareness";
        case "tired":
          return "Gentle, energizing activities for when you're low on energy";
        default:
          return "Personalized recommendations based on your current state";
      }
    }
    
    return "Explore activities tailored to your needs";
  };
  
  // Format time in minutes and seconds
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Get display name for technique
  const getTechniqueName = (technique: TherapyTechniqueType): string => {
    switch (technique) {
      case "cognitive_restructuring": return "Cognitive Restructuring";
      case "behavioral_activation": return "Behavioral Activation";
      case "mindfulness": return "Mindfulness";
      case "relaxation": return "Relaxation Techniques";
      case "grounding": return "Grounding Exercises";
      case "values": return "Values Exploration";
      case "exposure": return "Gradual Exposure";
      case "problem_solving": return "Problem Solving";
      case "acceptance": return "Acceptance Practice";
      case "gratitude": return "Gratitude Practice";
      case "emotional_regulation": return "Emotional Regulation";
      case "goal_setting": return "Goal Setting";
      case "self_care": return "Self-Care Activities";
      default: return technique;
    }
  };
  
  // If compact mode, show a simpler version
  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center">
            <Sparkles className="h-4 w-4 text-primary mr-2" />
            Recommended for You
          </CardTitle>
          <CardDescription>{getRecommendationText()}</CardDescription>
        </CardHeader>
        <CardContent className="pb-3">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-20 w-full rounded-md" />
              <Skeleton className="h-20 w-full rounded-md" />
            </div>
          ) : (
            <div className="space-y-3">
              {recommendedMeditations.slice(0, 2).map(meditation => (
                <Button 
                  key={meditation.id}
                  variant="outline" 
                  className="w-full justify-between h-auto py-2 px-3"
                  onClick={() => handleSelectMeditation(meditation)}
                >
                  <div className="flex items-center">
                    <Music className="h-4 w-4 text-primary mr-2" />
                    <div className="text-left">
                      <div className="font-medium">{meditation.title}</div>
                      <div className="text-xs text-muted-foreground">{meditation.category}</div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="ml-2 text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatTime(meditation.duration)}
                  </Badge>
                </Button>
              ))}
              
              {recommendedTechniques.slice(0, 2).map(technique => (
                <Button 
                  key={technique}
                  variant="outline" 
                  className="w-full justify-between h-auto py-2 px-3"
                  onClick={() => handleSelectTechnique(technique)}
                >
                  <div className="flex items-center">
                    <Lightbulb className="h-4 w-4 text-primary mr-2" />
                    <div className="text-left">
                      <div className="font-medium">{getTechniqueName(technique)}</div>
                      <div className="text-xs text-muted-foreground">Therapy Technique</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Button>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-0">
          <Button variant="ghost" size="sm" className="w-full" onClick={() => navigate('/recommendations')}>
            View All Recommendations
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  // Full version with tabs
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center">
          <Sparkles className="h-5 w-5 text-primary mr-2" />
          <span>Recommendations</span>
          {(currentMood || emotionData) && (
            <Badge className="ml-2" variant="outline">
              {currentMood 
                ? MOOD_OPTIONS.find(m => m.value === currentMood)?.label
                : emotionData?.primaryEmotion ? (
                  <span className="capitalize">{emotionData.primaryEmotion}</span>
                ) : null}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>{getRecommendationText()}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="meditations" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="meditations" className="flex items-center gap-1">
              <Music className="h-4 w-4" />
              <span>Meditations</span>
            </TabsTrigger>
            <TabsTrigger value="techniques" className="flex items-center gap-1">
              <Brain className="h-4 w-4" />
              <span>Techniques</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="meditations" className="focus-visible:outline-none focus-visible:ring-0">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-24 w-full rounded-md" />
                ))}
              </div>
            ) : recommendedMeditations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recommendedMeditations.map(meditation => (
                  <Button 
                    key={meditation.id}
                    variant="outline" 
                    className="h-auto py-3 px-4 flex flex-col items-start text-left"
                    onClick={() => handleSelectMeditation(meditation)}
                  >
                    <div className="flex w-full justify-between items-center mb-2">
                      <span className="font-medium">{meditation.title}</span>
                      <Badge variant="secondary" className="ml-2 text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTime(meditation.duration)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                      {meditation.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {meditation.tags && meditation.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">No recommended meditations found</p>
                <Button onClick={() => navigate('/meditations')}>
                  Browse Meditations
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="techniques" className="focus-visible:outline-none focus-visible:ring-0">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-24 w-full rounded-md" />
                ))}
              </div>
            ) : recommendedTechniques.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recommendedTechniques.map(technique => (
                  <Button 
                    key={technique}
                    variant="outline" 
                    className="h-auto py-3 px-4 flex flex-col items-start text-left"
                    onClick={() => handleSelectTechnique(technique)}
                  >
                    <div className="flex w-full justify-between items-center mb-2">
                      <span className="font-medium">{getTechniqueName(technique)}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Evidence-based therapy technique
                    </p>
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">No recommended techniques found</p>
                <Button onClick={() => navigate('/therapy')}>
                  Explore Therapy Techniques
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

const MOOD_OPTIONS = [
  { value: "very_happy", emoji: "😊", label: "Very Happy" },
  { value: "happy", emoji: "🙂", label: "Happy" },
  { value: "neutral", emoji: "😐", label: "Neutral" },
  { value: "calm", emoji: "😌", label: "Calm" },
  { value: "refreshed", emoji: "🧘", label: "Refreshed" },
  { value: "sleepy", emoji: "😴", label: "Sleepy" },
  { value: "anxious", emoji: "😟", label: "Anxious" },
  { value: "sad", emoji: "😢", label: "Sad" }
]; 