import { useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause, 
  Brain, 
  Heart, 
  CloudRain, 
  Moon, 
  Sun, 
  Leaf, 
  Clock,
  PlusCircle,
  Filter,
  X
} from "lucide-react";
import MeditationPlayer from "@/components/MeditationPlayer";
import { MeditationData } from "@/types/meditation";
import { useToast } from "@/hooks/use-toast";
import AImeditationGenerator from "@/components/AImeditationGenerator";
import MeditationHistory from "@/components/MeditationHistory";
import MeditationFavorites from "@/components/MeditationFavorites";
import { MEDITATION_CATEGORIES } from "@/services/meditationService";

// Sample meditation data
const SAMPLE_MEDITATIONS: MeditationData[] = [
  {
    id: "morning-mindfulness",
    title: "Morning Mindfulness",
    description: "Start your day with clarity and purpose. This meditation helps you set a positive tone for the day ahead, focusing on gratitude and intention-setting.",
    audioSrc: "/meditations/morning-mindfulness.mp3",
    duration: 600, // 10 minutes
    instructor: "Sarah Chen",
    category: ["Mindfulness", "Morning"],
  },
  {
    id: "anxiety-relief",
    title: "Anxiety Relief",
    description: "A guided practice to help calm your nervous system and find relief from anxiety. Focus on breath and body awareness to restore a sense of peace.",
    audioSrc: "/meditations/anxiety-relief.mp3",
    duration: 900, // 15 minutes
    instructor: "Dr. Michael Kim",
    category: ["Anxiety", "Breathing"],
  },
  {
    id: "deep-sleep",
    title: "Deep Sleep",
    description: "Prepare your mind and body for restorative sleep. This meditation uses gentle visualizations and relaxation techniques to guide you into deep sleep.",
    audioSrc: "/meditations/deep-sleep.mp3",
    duration: 1200, // 20 minutes
    instructor: "Emma Wilson",
    category: ["Sleep", "Relaxation"],
    isPremium: true
  },
  {
    id: "focus-clarity",
    title: "Focus & Clarity",
    description: "Sharpen your mind and improve concentration. Ideal before work or study sessions requiring sustained attention.",
    audioSrc: "/meditations/focus-clarity.mp3",
    duration: 480, // 8 minutes
    instructor: "David Park",
    category: ["Focus", "Productivity"],
  },
  {
    id: "loving-kindness",
    title: "Loving-Kindness",
    description: "Cultivate compassion for yourself and others. This heart-centered practice helps develop empathy and emotional resilience.",
    audioSrc: "/meditations/loving-kindness.mp3",
    duration: 720, // 12 minutes
    instructor: "Sarah Chen",
    category: ["Compassion", "Emotional"],
  },
  {
    id: "stress-relief",
    title: "Stress Relief",
    description: "Release tension and find calm in the midst of stress. This meditation focuses on body scanning and tension release.",
    audioSrc: "/meditations/stress-relief.mp3",
    duration: 900, // 15 minutes
    instructor: "Dr. Michael Kim",
    category: ["Stress", "Calming"],
  },
];

// Sample library meditations
const LIBRARY_MEDITATIONS: MeditationData[] = [
  {
    id: "body-scan",
    title: "Body Scan Relaxation",
    description: "A systematic scan of your body to release tension and increase body awareness. This practice helps reconnect mind and body.",
    audioSrc: "/meditations/body-scan.mp3",
    duration: 1080, // 18 minutes
    instructor: "Emma Wilson",
    category: ["Body Awareness", "Relaxation"],
  },
  {
    id: "gratitude",
    title: "Gratitude Practice",
    description: "Cultivate an attitude of gratitude to boost your mood and outlook. This practice focuses on appreciating the positives in your life.",
    audioSrc: "/meditations/gratitude.mp3",
    duration: 600, // 10 minutes
    instructor: "Sarah Chen",
    category: ["Gratitude", "Positivity"],
  },
  {
    id: "breath-awareness",
    title: "Breath Awareness",
    description: "A short practice focused solely on breath. Perfect for quick breaks or as an introduction to meditation.",
    audioSrc: "/meditations/breath-awareness.mp3",
    duration: 300, // 5 minutes
    instructor: "David Park",
    category: ["Breathing", "Quick"],
  },
  {
    id: "inner-calm",
    title: "Inner Calm",
    description: "Find the peaceful center within yourself. This meditation uses visualization to help you discover your internal sanctuary.",
    audioSrc: "/meditations/inner-calm.mp3",
    duration: 900, // 15 minutes
    instructor: "Dr. Michael Kim",
    category: ["Peace", "Stillness"],
    isPremium: true
  },
  {
    id: "emotional-balance",
    title: "Emotional Balance",
    description: "Work with difficult emotions and find equilibrium. Learn techniques to navigate emotional ups and downs with equanimity.",
    audioSrc: "/meditations/emotional-balance.mp3",
    duration: 1200, // 20 minutes
    instructor: "Emma Wilson",
    category: ["Emotions", "Awareness"],
    isPremium: true
  },
];

const meditationTopics = [
  { icon: Brain, label: "Focus", color: "text-cyan-400" },
  { icon: Heart, label: "Self-Love", color: "text-pink-400" },
  { icon: CloudRain, label: "Calm", color: "text-blue-400" },
  { icon: Leaf, label: "Grounding", color: "text-green-400" },
  { icon: Moon, label: "Sleep", color: "text-indigo-400" },
  { icon: Sun, label: "Energy", color: "text-yellow-400" },
];

const MeditationCard = ({ meditation, onClick }: { 
  meditation: MeditationData; 
  onClick: () => void;
}) => (
  <Card className="glass-card card-hover cursor-pointer" onClick={onClick}>
    <CardHeader className="pb-2">
      <CardTitle className="text-lg flex items-center gap-1">
        {meditation.title}
        {meditation.isPremium && (
          <Badge className="bg-primary text-primary-foreground ml-1 text-xs">Premium</Badge>
        )}
      </CardTitle>
      <CardDescription className="flex justify-between">
        <span>{meditation.duration ? `${Math.floor(meditation.duration / 60)} min` : "10 min"}</span>
        <span>{meditation.instructor || "Guided"}</span>
      </CardDescription>
    </CardHeader>
    <CardFooter className="pt-2">
      <div className="flex flex-wrap gap-2">
        {meditation.category && (
          Array.isArray(meditation.category) 
            ? meditation.category.map((tag, i) => (
          <span key={i} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
            {tag}
          </span>
              ))
            : (
              <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                {meditation.category}
              </span>
            )
        )}
      </div>
    </CardFooter>
  </Card>
);

const MeditationPage = () => {
  const { toast } = useToast();
  const [selectedMeditation, setSelectedMeditation] = useState<MeditationData | null>(null);
  const [customDuration, setCustomDuration] = useState(10);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [selectedBackground, setSelectedBackground] = useState<string | null>("rain");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [activeDurationFilter, setActiveDurationFilter] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Duration filter options
  const durationFilters = [
    { id: "quick", label: "Quick", range: "< 5 min", min: 0, max: 300 },
    { id: "medium", label: "Medium", range: "5-15 min", min: 300, max: 900 },
    { id: "long", label: "Long", range: "> 15 min", min: 900, max: Infinity }
  ];

  // Extract all unique categories from library meditations
  const getAllCategories = () => {
    const categories = new Set<string>();
    
    LIBRARY_MEDITATIONS.forEach(meditation => {
      if (meditation.category) {
        if (Array.isArray(meditation.category)) {
          meditation.category.forEach(cat => categories.add(cat));
        } else {
          categories.add(meditation.category);
        }
      }
    });
    
    return Array.from(categories).sort();
  };
  
  const libraryCategories = getAllCategories();
  
  // Filter meditations by category and duration
  const getFilteredMeditations = () => {
    return LIBRARY_MEDITATIONS.filter(meditation => {
      // Category filter
      if (activeFilter) {
        if (!meditation.category) return false;
        
        const categoryMatch = Array.isArray(meditation.category)
          ? meditation.category.includes(activeFilter)
          : meditation.category === activeFilter;
          
        if (!categoryMatch) return false;
      }
      
      // Duration filter
      if (activeDurationFilter) {
        const durationFilter = durationFilters.find(f => f.id === activeDurationFilter);
        if (durationFilter) {
          return meditation.duration >= durationFilter.min && meditation.duration < durationFilter.max;
        }
      }
      
      return true;
    });
  };
  
  const filteredMeditations = getFilteredMeditations();
  
  // Reset all filters
  const clearFilters = () => {
    setActiveFilter(null);
    setActiveDurationFilter(null);
  };

  const handleDurationFilter = (filterId: string) => {
    if (activeDurationFilter === filterId) {
      setActiveDurationFilter(null); // Toggle off if already active
    } else {
      setActiveDurationFilter(filterId);
    }
    setIsFilterOpen(false); // Close the filter dropdown
  };

  const handleMeditationSelect = (meditation: MeditationData) => {
    setSelectedMeditation(meditation);
  };

  const handleCustomMeditationGenerate = () => {
    setIsGenerating(true);
    
    // Simulate generation delay
    setTimeout(() => {
      const newMeditation: MeditationData = {
        id: `custom-${Date.now()}`,
        title: selectedTopic 
          ? `Custom ${selectedTopic} Meditation` 
          : "Personalized Meditation",
        description: customPrompt || "A meditation created just for you based on your preferences.",
        audioSrc: "/meditations/custom-meditation.mp3", // This would be generated in a real app
        duration: customDuration * 60,
        category: selectedTopic ? [selectedTopic] : ["Custom"],
        instructor: "AI Guide"
      };
      
      setSelectedMeditation(newMeditation);
      setIsGenerating(false);
      
      toast({
        title: "Meditation created",
        description: "Your personalized meditation has been generated.",
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      
      <main className="flex-1 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Guided Meditation</h1>
          <p className="text-muted-foreground mb-6">
            Explore AI-generated meditations to help reduce anxiety and improve mindfulness
          </p>
          
          <Tabs defaultValue="recommended">
            <TabsList className="grid w-full grid-cols-5 bg-secondary/30 mb-6">
              <TabsTrigger value="recommended">Recommended</TabsTrigger>
              <TabsTrigger value="library">Library</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
              <TabsTrigger value="create">Create New</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
            </TabsList>
            
            <TabsContent value="recommended">
              {selectedMeditation ? (
                <div className="mb-6">
                  <MeditationPlayer 
                    meditation={selectedMeditation}
                    onClose={() => setSelectedMeditation(null)}
                    onComplete={() => {
                      toast({
                        title: "Practice completed",
                        description: "Great job completing your meditation session!",
                      });
                    }}
                      />
                    </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {SAMPLE_MEDITATIONS.map((meditation) => (
                  <MeditationCard
                      key={meditation.id}
                      meditation={meditation}
                      onClick={() => handleMeditationSelect(meditation)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="library">
              {selectedMeditation ? (
                <div className="mb-6">
                  <MeditationPlayer 
                    meditation={selectedMeditation}
                    onClose={() => setSelectedMeditation(null)}
                  />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Meditation Library</h2>
                    
                    <div className="flex flex-wrap gap-2 items-center">
                      {/* Active filters display */}
                      {(activeFilter || activeDurationFilter) && (
                        <div className="flex gap-2 items-center mr-2">
                          {activeFilter && (
                            <Badge 
                              variant="outline" 
                              className="flex items-center gap-1 bg-primary/10"
                            >
                              <span>{activeFilter}</span>
                              <X 
                                className="h-3 w-3 cursor-pointer" 
                                onClick={() => setActiveFilter(null)}
                              />
                            </Badge>
                          )}
                          
                          {activeDurationFilter && (
                            <Badge 
                              variant="outline" 
                              className="flex items-center gap-1 bg-primary/10"
                            >
                              <span>
                                {durationFilters.find(f => f.id === activeDurationFilter)?.label || activeDurationFilter}
                              </span>
                              <X 
                                className="h-3 w-3 cursor-pointer" 
                                onClick={() => setActiveDurationFilter(null)}
                              />
                            </Badge>
                          )}
                          
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={clearFilters}
                            className="h-7 text-xs"
                          >
                            Clear all
                          </Button>
                        </div>
                      )}
                      
                      <div className="relative">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setIsFilterOpen(!isFilterOpen)}
                          className={isFilterOpen ? "bg-secondary" : ""}
                        >
                          <Filter className="h-4 w-4 mr-2" />
                          Filter
                        </Button>
                        
                        {isFilterOpen && (
                          <div className="absolute z-10 top-full right-0 mt-1 w-64 p-3 rounded-md border bg-card shadow-md">
                            <div className="mb-4">
                              <h3 className="text-sm font-medium mb-2">Categories</h3>
                              <div className="flex flex-wrap gap-2">
                                {libraryCategories.map(category => (
                                  <Badge 
                                    key={category}
                                    variant={activeFilter === category ? "default" : "outline"}
                                    className="cursor-pointer hover:bg-primary/30"
                                    onClick={() => {
                                      setActiveFilter(activeFilter === category ? null : category);
                                    }}
                                  >
                                    {category}
                                  </Badge>
                                ))}
                    </div>
                  </div>
                  
                            <div>
                              <h3 className="text-sm font-medium mb-2">Duration</h3>
                              <div className="space-y-1">
                                {durationFilters.map(filter => (
                                  <Button 
                                    key={filter.id}
                                    variant={activeDurationFilter === filter.id ? "secondary" : "ghost"} 
                                    className="w-full justify-start text-sm h-8"
                                    onClick={() => handleDurationFilter(filter.id)}
                                  >
                                    <Badge 
                                      variant="outline" 
                                      className={`mr-2 ${activeDurationFilter === filter.id ? 'bg-primary/20' : ''}`}
                                    >
                                      {filter.range}
                                    </Badge>
                                    {filter.label}
                                  </Button>
                                ))}
                              </div>
                            </div>
                    </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMeditations.length > 0 ? (
                      <>
                        {filteredMeditations.map((meditation) => (
                          <MeditationCard
                            key={meditation.id}
                            meditation={meditation}
                            onClick={() => handleMeditationSelect(meditation)}
                          />
                        ))}
                        <Button variant="outline" className="h-full min-h-[120px] text-muted-foreground">
                          <PlusCircle className="h-10 w-10 mb-2" />
                          <span>Explore More</span>
                      </Button>
                      </>
                    ) : (
                      <div className="col-span-3 py-8 text-center">
                        <div className="mb-4 text-muted-foreground">
                          <Filter className="h-16 w-16 mx-auto mb-4 opacity-30" />
                          <h3 className="text-xl font-medium">No meditations match your filters</h3>
                        </div>
                        <Button variant="outline" onClick={clearFilters}>Clear all filters</Button>
                    </div>
                    )}
                  </div>
                </>
              )}
            </TabsContent>
            
            <TabsContent value="favorites">
              <MeditationFavorites />
            </TabsContent>
            
            <TabsContent value="create">
              {selectedMeditation ? (
                <div className="mb-6">
                  <MeditationPlayer 
                    meditation={selectedMeditation}
                    onClose={() => setSelectedMeditation(null)}
                    autoPlay={true}
                  />
                </div>
              ) : (
                <AImeditationGenerator 
                  onMeditationGenerated={(meditation) => {
                    setSelectedMeditation(meditation);
                    
                    toast({
                      title: "Meditation created",
                      description: "Your personalized meditation has been generated.",
                    });
                  }}
                />
              )}
            </TabsContent>
            
            <TabsContent value="progress">
              <MeditationHistory userId="demo-user" />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default MeditationPage;
