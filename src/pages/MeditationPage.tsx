
import { useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
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
  PlusCircle
} from "lucide-react";

const meditationTopics = [
  { icon: Brain, label: "Focus", color: "text-cyan-400" },
  { icon: Heart, label: "Self-Love", color: "text-pink-400" },
  { icon: CloudRain, label: "Calm", color: "text-blue-400" },
  { icon: Leaf, label: "Grounding", color: "text-green-400" },
  { icon: Moon, label: "Sleep", color: "text-indigo-400" },
  { icon: Sun, label: "Energy", color: "text-yellow-400" },
];

const MeditationCard = ({ title, duration, level, tags, onClick }: { 
  title: string; 
  duration: string; 
  level: string; 
  tags: string[];
  onClick: () => void;
}) => (
  <Card className="glass-card card-hover cursor-pointer" onClick={onClick}>
    <CardHeader className="pb-2">
      <CardTitle className="text-lg">{title}</CardTitle>
      <CardDescription className="flex justify-between">
        <span>{duration}</span>
        <span>{level}</span>
      </CardDescription>
    </CardHeader>
    <CardFooter className="pt-2">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, i) => (
          <span key={i} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
            {tag}
          </span>
        ))}
      </div>
    </CardFooter>
  </Card>
);

const MeditationPage = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedMeditation, setSelectedMeditation] = useState<string | null>(null);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const startMeditation = (title: string) => {
    setSelectedMeditation(title);
    setCurrentTime(0);
    setIsPlaying(true);
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
            <TabsList className="grid w-full grid-cols-3 bg-secondary/30 mb-6">
              <TabsTrigger value="recommended">Recommended</TabsTrigger>
              <TabsTrigger value="library">Library</TabsTrigger>
              <TabsTrigger value="create">Create New</TabsTrigger>
            </TabsList>
            
            <TabsContent value="recommended">
              {selectedMeditation ? (
                <Card className="glass-card mb-6">
                  <CardHeader>
                    <CardTitle>{selectedMeditation}</CardTitle>
                    <CardDescription>10:00 • Guided Meditation</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex justify-center">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-16 w-16 rounded-full border-primary"
                        onClick={togglePlayPause}
                      >
                        {isPlaying ? (
                          <Pause className="h-8 w-8 text-primary" />
                        ) : (
                          <Play className="h-8 w-8 text-primary ml-1" />
                        )}
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>0:00</span>
                        <span>10:00</span>
                      </div>
                      <Slider
                        value={[currentTime]}
                        max={100}
                        step={1}
                        className="cursor-pointer"
                        onValueChange={(value) => setCurrentTime(value[0])}
                      />
                    </div>
                    
                    <div className="text-center text-sm text-muted-foreground">
                      <p>Find a comfortable position and allow yourself to relax. This meditation will help you reconnect with your inner sense of calm and balance.</p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="ghost" size="sm">
                      Save
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedMeditation(null)}>
                      Back to Library
                    </Button>
                  </CardFooter>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <MeditationCard
                    title="Morning Mindfulness"
                    duration="10 min"
                    level="Beginner"
                    tags={["Mindfulness", "Morning"]}
                    onClick={() => startMeditation("Morning Mindfulness")}
                  />
                  <MeditationCard
                    title="Anxiety Relief"
                    duration="15 min"
                    level="All Levels"
                    tags={["Anxiety", "Breathing"]}
                    onClick={() => startMeditation("Anxiety Relief")}
                  />
                  <MeditationCard
                    title="Deep Sleep"
                    duration="20 min"
                    level="All Levels"
                    tags={["Sleep", "Relaxation"]}
                    onClick={() => startMeditation("Deep Sleep")}
                  />
                  <MeditationCard
                    title="Focus & Clarity"
                    duration="8 min"
                    level="Intermediate"
                    tags={["Focus", "Productivity"]}
                    onClick={() => startMeditation("Focus & Clarity")}
                  />
                  <MeditationCard
                    title="Loving-Kindness"
                    duration="12 min"
                    level="All Levels"
                    tags={["Compassion", "Emotional"]}
                    onClick={() => startMeditation("Loving-Kindness")}
                  />
                  <MeditationCard
                    title="Stress Relief"
                    duration="15 min"
                    level="Beginner"
                    tags={["Stress", "Calming"]}
                    onClick={() => startMeditation("Stress Relief")}
                  />
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="library">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <MeditationCard
                  title="Body Scan Relaxation"
                  duration="18 min"
                  level="All Levels"
                  tags={["Body Awareness", "Relaxation"]}
                  onClick={() => startMeditation("Body Scan Relaxation")}
                />
                <MeditationCard
                  title="Gratitude Practice"
                  duration="10 min"
                  level="Beginner"
                  tags={["Gratitude", "Positivity"]}
                  onClick={() => startMeditation("Gratitude Practice")}
                />
                <MeditationCard
                  title="Breath Awareness"
                  duration="5 min"
                  level="Beginner"
                  tags={["Breathing", "Quick"]}
                  onClick={() => startMeditation("Breath Awareness")}
                />
                <MeditationCard
                  title="Inner Calm"
                  duration="15 min"
                  level="Intermediate"
                  tags={["Peace", "Stillness"]}
                  onClick={() => startMeditation("Inner Calm")}
                />
                <MeditationCard
                  title="Emotional Balance"
                  duration="20 min"
                  level="Advanced"
                  tags={["Emotions", "Awareness"]}
                  onClick={() => startMeditation("Emotional Balance")}
                />
                <Button variant="outline" className="h-full min-h-[120px] text-muted-foreground">
                  <PlusCircle className="h-10 w-10 mb-2" />
                  <span>Explore More</span>
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="create">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Create Your Meditation</CardTitle>
                  <CardDescription>Craft a personalized meditation experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">How are you feeling today?</h3>
                    <Textarea 
                      placeholder="Share your current emotions, challenges, or state of mind..."
                      className="bg-secondary/30 border-white/10"
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Meditation Focus</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {meditationTopics.map((topic, i) => {
                        const TopicIcon = topic.icon;
                        return (
                          <Button key={i} variant="outline" className="flex flex-col h-auto py-3">
                            <TopicIcon className={`h-6 w-6 mb-1 ${topic.color}`} />
                            <span className="text-xs">{topic.label}</span>
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <h3 className="text-sm font-medium">Duration</h3>
                      <span className="text-sm text-primary">10 minutes</span>
                    </div>
                    <div className="px-1">
                      <Slider 
                        defaultValue={[10]} 
                        max={30} 
                        step={5} 
                        className="cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>5 min</span>
                        <span>30 min</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Background Sound</h3>
                    <div className="grid grid-cols-3 gap-2">
                      <Button variant="outline" className="border-primary">
                        <CloudRain className="mr-2 h-4 w-4 text-primary" />
                        Rain
                      </Button>
                      <Button variant="outline">
                        <Leaf className="mr-2 h-4 w-4" />
                        Nature
                      </Button>
                      <Button variant="outline">
                        <Moon className="mr-2 h-4 w-4" />
                        Ambient
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    <Brain className="mr-2 h-4 w-4" />
                    Generate Meditation
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default MeditationPage;
