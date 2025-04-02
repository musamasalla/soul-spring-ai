import { useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MeditationPlayer, { MeditationData } from "@/components/MeditationPlayer";
import { useToast } from "@/hooks/use-toast";

// Demo meditation data with placeholder audio
const DEMO_MEDITATIONS: MeditationData[] = [
  {
    id: "morning-mindfulness",
    title: "Morning Mindfulness",
    description: "Start your day with clarity and purpose. This meditation helps you set a positive tone for the day ahead, focusing on gratitude and intention-setting.",
    audioSrc: "https://assets.mixkit.co/music/preview/mixkit-meditation-flute-347.mp3", // Demo audio
    duration: 183, // 3:03 minutes
    instructor: "Sarah Chen",
    category: ["Mindfulness", "Morning"],
    coverImage: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?q=80&w=2574&auto=format&fit=crop"
  },
  {
    id: "anxiety-relief",
    title: "Anxiety Relief",
    description: "A guided practice to help calm your nervous system and find relief from anxiety. Focus on breath and body awareness to restore a sense of peace.",
    audioSrc: "https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3", // Demo audio
    duration: 178, // 2:58 minutes
    instructor: "Dr. Michael Kim",
    category: ["Anxiety", "Breathing"],
  },
  {
    id: "deep-sleep",
    title: "Deep Sleep",
    description: "Prepare your mind and body for restorative sleep. This meditation uses gentle visualizations and relaxation techniques to guide you into deep sleep.",
    audioSrc: "https://assets.mixkit.co/music/preview/mixkit-quiet-moon-868.mp3", // Demo audio
    duration: 192, // 3:12 minutes
    instructor: "Emma Wilson",
    category: ["Sleep", "Relaxation"],
    isPremium: true,
    coverImage: "https://images.unsplash.com/photo-1611174797137-3cebecb385b3?q=80&w=2670&auto=format&fit=crop"
  },
];

export default function DemoMeditationPage() {
  const { toast } = useToast();
  const [selectedMeditation, setSelectedMeditation] = useState<MeditationData | null>(null);
  const [demoType, setDemoType] = useState("standard");

  const handleMeditationSelect = (meditation: MeditationData) => {
    setSelectedMeditation(meditation);
  };

  const renderDemoContent = () => {
    if (demoType === "standard" && selectedMeditation) {
      return (
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
      );
    } else if (demoType === "autoplay") {
      return (
        <MeditationPlayer 
          meditation={DEMO_MEDITATIONS[0]}
          onClose={() => setDemoType("standard")}
          autoPlay={true}
        />
      );
    } else if (demoType === "different-states") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Standard Player</h3>
            <MeditationPlayer 
              meditation={DEMO_MEDITATIONS[0]}
              onClose={() => {}}
            />
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Premium Meditation</h3>
            <MeditationPlayer 
              meditation={DEMO_MEDITATIONS[2]}
              onClose={() => {}}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DEMO_MEDITATIONS.map((meditation) => (
          <Card key={meditation.id} className="glass-card card-hover cursor-pointer" onClick={() => handleMeditationSelect(meditation)}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-1">
                {meditation.title}
                {meditation.isPremium && (
                  <span className="bg-primary text-primary-foreground ml-1 text-xs px-2 py-0.5 rounded-full">
                    Premium
                  </span>
                )}
              </CardTitle>
              <CardDescription className="flex justify-between">
                <span>{Math.floor(meditation.duration / 60)}:{(meditation.duration % 60).toString().padStart(2, '0')}</span>
                <span>{meditation.instructor}</span>
              </CardDescription>
            </CardHeader>
            {meditation.coverImage && (
              <CardContent className="px-4 pb-2 pt-0">
                <div className="rounded-md overflow-hidden h-28">
                  <img 
                    src={meditation.coverImage} 
                    alt={meditation.title}
                    className="object-cover w-full h-full"
                  />
                </div>
              </CardContent>
            )}
            <CardFooter className="pt-2">
              <div className="flex flex-wrap gap-2">
                {meditation.category?.map((tag, i) => (
                  <span key={i} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      
      <main className="flex-1 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Meditation Player Demo</h1>
          <p className="text-muted-foreground mb-6">
            Experience the meditation player in different states and configurations
          </p>

          <Tabs defaultValue="standard" onValueChange={value => {
            setDemoType(value);
            setSelectedMeditation(null);
          }}>
            <TabsList className="grid w-full grid-cols-3 bg-secondary/30 mb-6">
              <TabsTrigger value="standard">Standard Demo</TabsTrigger>
              <TabsTrigger value="autoplay">Autoplay Demo</TabsTrigger>
              <TabsTrigger value="different-states">Different States</TabsTrigger>
            </TabsList>
            
            <TabsContent value="standard">
              {renderDemoContent()}
            </TabsContent>
            
            <TabsContent value="autoplay">
              {renderDemoContent()}
            </TabsContent>
            
            <TabsContent value="different-states">
              {renderDemoContent()}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
} 