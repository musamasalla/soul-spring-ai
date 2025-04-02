import { useState } from "react";
import { MeditationData } from "@/types/meditation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MEDITATION_CATEGORIES, MEDITATION_DURATIONS, generateAIMeditation } from "@/services/meditationService";
import { formatDuration } from "@/utils/formatTime";
import { Wand2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import MeditationPlayer from "./MeditationPlayer";

interface AImeditationGeneratorProps {
  onMeditationGenerated?: (meditation: MeditationData) => void;
}

export default function AImeditationGenerator({ onMeditationGenerated }: AImeditationGeneratorProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMeditation, setGeneratedMeditation] = useState<MeditationData | null>(null);
  
  // Form states
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(MEDITATION_CATEGORIES[0]);
  const [duration, setDuration] = useState(MEDITATION_DURATIONS[2].value); // Default to 10 min
  const [mood, setMood] = useState("");
  
  // Get formatted duration
  const formatDurationValue = (value: number) => {
    return formatDuration(value);
  };
  
  // Mood suggestions
  const moodSuggestions = ["Calm", "Energized", "Focused", "Relaxed", "Grounded", "Peaceful"];
  
  // Handle form submission
  const handleGenerate = async () => {
    if (!title || !category) return;
    
    setIsGenerating(true);
    
    try {
      // Generate meditation
      const meditation = await generateAIMeditation(
        title,
        category,
        duration,
        mood
      );
      
      setGeneratedMeditation(meditation);
      
      // Notify parent component
      if (onMeditationGenerated) {
        onMeditationGenerated(meditation);
      }
    } catch (error) {
      console.error("Error generating meditation:", error);
      toast({
        title: "Error",
        description: "Failed to generate meditation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleStartOver = () => {
    setGeneratedMeditation(null);
  };
  
  // Show meditation player if meditation is generated
  if (generatedMeditation) {
    return (
      <div className="space-y-4">
        <MeditationPlayer 
          meditation={{
            ...generatedMeditation,
            audioSrc: generatedMeditation.audioUrl || "/meditations/sample-meditation.mp3",
          }}
          onClose={handleStartOver}
          autoPlay={true}
        />
        
        <div className="flex justify-center mt-4">
          <Button variant="outline" onClick={handleStartOver}>
            Create Another Meditation
          </Button>
        </div>
        
        <Card className="mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-md">About This Meditation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Title:</strong> {generatedMeditation.title}</p>
            <p><strong>Category:</strong> {generatedMeditation.category}</p>
            <p><strong>Duration:</strong> {formatDurationValue(generatedMeditation.duration)}</p>
            {generatedMeditation.script && (
              <div>
                <p><strong>Script Preview:</strong></p>
                <Textarea 
                  className="h-40 mt-2" 
                  value={generatedMeditation.script}
                  readOnly
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Create AI Meditation</CardTitle>
          <CardDescription>
            Customize your meditation and our AI will generate a unique guided session for you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Meditation Title</Label>
            <Input
              id="title"
              placeholder="e.g., Morning Mindfulness Journey"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {MEDITATION_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Duration */}
          <div className="space-y-4">
            <div className="flex justify-between">
              <Label>Duration</Label>
              <span className="text-sm text-muted-foreground">{formatDurationValue(duration)}</span>
            </div>
            <div className="px-1">
              <RadioGroup 
                className="flex justify-between gap-2" 
                value={duration.toString()}
                onValueChange={(value) => setDuration(parseInt(value))}
              >
                {MEDITATION_DURATIONS.map((option) => (
                  <div key={option.value} className="flex items-center">
                    <RadioGroupItem value={option.value.toString()} id={`duration-${option.value}`} />
                    <Label htmlFor={`duration-${option.value}`} className="ml-2 text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
          
          {/* Mood */}
          <div className="space-y-2">
            <Label htmlFor="mood">Desired Mood (Optional)</Label>
            <Input
              id="mood"
              placeholder="e.g., Calm, Energized, Peaceful"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {moodSuggestions.map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  onClick={() => setMood(suggestion)}
                  className={mood === suggestion ? "bg-primary/10" : ""}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleGenerate} 
            className="w-full"
            disabled={!title || !category || isGenerating}
          >
            {isGenerating ? (
              <div className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Generating...</span>
              </div>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Meditation
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 