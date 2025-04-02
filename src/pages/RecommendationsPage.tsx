import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUserStore } from "@/stores/userStore";
import { useMoodStore } from "@/stores/moodStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import MoodRecommendations from "@/components/MoodRecommendations";
import MoodChart from "@/components/MoodChart";
import PageTitle from "@/components/PageTitle";
import { ArrowLeft, Filter, TrendingUp, Calendar, Sparkles, Dices } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MeditationData } from "@/types/meditation";

// Mood options with emojis - copied from MoodTracker component for consistency
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

// Helper function to format meditation duration
const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  if (minutes < 1) return "< 1 min";
  return `${minutes} min`;
};

export default function RecommendationsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUserStore();
  const { moods, currentMood, fetchMoods } = useMoodStore();
  
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [recentMeditations, setRecentMeditations] = useState<MeditationData[]>([]);
  const [popularMeditations, setPopularMeditations] = useState<MeditationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Parse query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const moodParam = params.get('mood');
    if (moodParam) {
      setSelectedMood(moodParam);
    } else if (currentMood) {
      setSelectedMood(currentMood.mood);
    }
  }, [location.search, currentMood]);
  
  // Fetch user moods if not already loaded
  useEffect(() => {
    if (user && (!moods || moods.length === 0)) {
      fetchMoods(user.id);
    }
  }, [user, moods, fetchMoods]);
  
  // Fetch featured and popular meditations
  useEffect(() => {
    const fetchMeditations = async () => {
      setIsLoading(true);
      
      try {
        // Fetch recently added meditations
        const { data: recentData, error: recentError } = await supabase
          .from('meditations')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(6);
          
        if (recentError) throw recentError;
        
        // Fetch popular meditations
        const { data: popularData, error: popularError } = await supabase
          .from('meditations')
          .select('*')
          .order('play_count', { ascending: false })
          .limit(6);
          
        if (popularError) throw popularError;
        
        if (recentData) setRecentMeditations(recentData as MeditationData[]);
        if (popularData) setPopularMeditations(popularData as MeditationData[]);
        
      } catch (error) {
        console.error('Error fetching meditations:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMeditations();
  }, []);
  
  // Handle mood selection change
  const handleMoodChange = (value: string) => {
    setSelectedMood(value);
    // Update URL with selected mood
    const params = new URLSearchParams(location.search);
    params.set('mood', value);
    navigate(`${location.pathname}?${params.toString()}`);
  };
  
  // Get latest mood data for the selected mood
  const getLatestMoodData = () => {
    if (!selectedMood || !moods || moods.length === 0) return null;
    
    // Find the most recent mood entry that matches the selected mood
    return moods
      .filter(mood => mood.mood === selectedMood)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
  };
  
  // Get mood trend over time for the selected mood
  const getMoodTrend = () => {
    if (!selectedMood || !moods || moods.length === 0) return null;
    
    const moodEntries = moods
      .filter(mood => mood.mood === selectedMood)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      
    if (moodEntries.length < 2) return null;
    
    // Simple trend analysis (more sophisticated analysis could be implemented)
    const first = moodEntries[0];
    const last = moodEntries[moodEntries.length - 1];
    const daysDiff = Math.floor(
      (new Date(last.created_at).getTime() - new Date(first.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysDiff < 1) return null;
    
    return {
      days: daysDiff,
      count: moodEntries.length,
      frequency: (moodEntries.length / daysDiff).toFixed(1)
    };
  };
  
  // Get emotional context from mood entries
  const getEmotionalContext = () => {
    if (!selectedMood || !moods || moods.length === 0) return [];
    
    const moodEntries = moods.filter(mood => mood.mood === selectedMood);
    if (moodEntries.length === 0) return [];
    
    // Collect all notes from the mood entries
    const allNotes = moodEntries.map(entry => entry.notes || '').filter(Boolean);
    
    // Extract common themes or keywords from notes
    // This is a simplified implementation - in a real app, you'd use NLP or more sophisticated analysis
    const keywords: Record<string, number> = {};
    
    allNotes.forEach(note => {
      const words = note.toLowerCase().split(/\s+/);
      words.forEach(word => {
        // Filter out common words and short words
        if (word.length > 3 && !['when', 'what', 'this', 'that', 'with', 'from', 'have', 'been'].includes(word)) {
          keywords[word] = (keywords[word] || 0) + 1;
        }
      });
    });
    
    // Convert to array and sort by frequency
    return Object.entries(keywords)
      .filter(([_, count]) => count > 1) // Only include words that appear more than once
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5) // Top 5 keywords
      .map(([word]) => word);
  };
  
  // Get current mood display
  const getMoodDisplay = () => {
    if (!selectedMood) return null;
    
    const moodOption = MOOD_OPTIONS.find(option => option.value === selectedMood);
    if (!moodOption) return selectedMood;
    
    return (
      <div className="flex items-center gap-2">
        <span className="text-2xl">{moodOption.emoji}</span>
        <span>{moodOption.label}</span>
      </div>
    );
  };
  
  return (
    <div className="container max-w-6xl py-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
      </div>
      
      <PageTitle 
        title="Personalized Recommendations" 
        description="Activities and practices tailored to your emotional needs"
        icon={<Sparkles className="h-6 w-6 text-primary" />}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Mood Selector and Info */}
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Mood</CardTitle>
              <CardDescription>Select a mood to see tailored recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select 
                value={selectedMood || ""} 
                onValueChange={handleMoodChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a mood" />
                </SelectTrigger>
                <SelectContent>
                  {MOOD_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <span>{option.emoji}</span>
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedMood && (
                <div className="pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Current Mood:</h3>
                    {getMoodDisplay()}
                  </div>
                  
                  {getLatestMoodData() && (
                    <div className="text-sm text-muted-foreground">
                      Last tracked: {new Date(getLatestMoodData()!.created_at).toLocaleDateString()}
                    </div>
                  )}
                  
                  {getMoodTrend() && (
                    <div className="mt-4 p-3 bg-secondary/50 rounded-md">
                      <h4 className="font-medium flex items-center gap-1 mb-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span>Mood Trend</span>
                      </h4>
                      <div className="text-sm space-y-1">
                        <p>Tracked {getMoodTrend()!.count} times over {getMoodTrend()!.days} days</p>
                        <p>Average frequency: {getMoodTrend()!.frequency} times per day</p>
                      </div>
                    </div>
                  )}
                  
                  {getEmotionalContext().length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Common Themes:</h4>
                      <div className="flex flex-wrap gap-2">
                        {getEmotionalContext().map((keyword, index) => (
                          <Badge key={index} variant="secondary">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          {moods && moods.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Mood History</CardTitle>
              </CardHeader>
              <CardContent>
                <MoodChart 
                  moods={moods.slice(-14)} 
                  height={200}
                  compact
                />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full mt-3" 
                  onClick={() => navigate('/mood-history')}
                >
                  View Full History
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Recommendations Section */}
        <div className="md:col-span-2">
          <MoodRecommendations 
            currentMood={selectedMood} 
            emotionData={null}
            userId={user?.id}
          />
          
          {/* Additional Meditation Suggestions */}
          <div className="mt-6">
            <Tabs defaultValue="popular">
              <TabsList className="mb-4">
                <TabsTrigger value="popular">Popular</TabsTrigger>
                <TabsTrigger value="recent">Recently Added</TabsTrigger>
              </TabsList>
              
              <TabsContent value="popular">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {popularMeditations.length > 0 ? (
                    popularMeditations.map(meditation => (
                      <Button 
                        key={meditation.id}
                        variant="outline" 
                        className="h-auto py-3 px-4 flex flex-col items-start text-left"
                        onClick={() => navigate(`/meditations/${meditation.id}`)}
                      >
                        <div className="font-medium mb-1">{meditation.title}</div>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                          {meditation.description}
                        </p>
                        <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                          <span>{meditation.category}</span>
                          <span>{formatDuration(meditation.duration)}</span>
                        </div>
                      </Button>
                    ))
                  ) : (
                    <div className="col-span-2 p-6 text-center">
                      <div className="mb-3 flex justify-center">
                        <Dices className="h-12 w-12 text-muted-foreground opacity-50" />
                      </div>
                      <h3 className="text-lg font-medium mb-1">No meditations available</h3>
                      <p className="text-sm text-muted-foreground">
                        We're still adding content to our library. Check back soon for meditation recommendations.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="recent">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recentMeditations.length > 0 ? (
                    recentMeditations.map(meditation => (
                      <Button 
                        key={meditation.id}
                        variant="outline" 
                        className="h-auto py-3 px-4 flex flex-col items-start text-left"
                        onClick={() => navigate(`/meditations/${meditation.id}`)}
                      >
                        <div className="font-medium mb-1">{meditation.title}</div>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                          {meditation.description}
                        </p>
                        <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                          <span>{meditation.category}</span>
                          <span>{formatDuration(meditation.duration)}</span>
                        </div>
                      </Button>
                    ))
                  ) : (
                    <div className="col-span-2 p-6 text-center">
                      <div className="mb-3 flex justify-center">
                        <Dices className="h-12 w-12 text-muted-foreground opacity-50" />
                      </div>
                      <h3 className="text-lg font-medium mb-1">No meditations available</h3>
                      <p className="text-sm text-muted-foreground">
                        We're still adding content to our library. Check back soon for meditation recommendations.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="mt-4 text-center">
              <Button onClick={() => navigate('/meditations')}>
                Browse All Meditations
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 