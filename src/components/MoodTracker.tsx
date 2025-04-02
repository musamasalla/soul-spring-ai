import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MeditationData } from "@/types/meditation";
import { saveMoodRecord } from "@/services/sessionService";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// Mood options with emojis
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

interface MoodTrackerProps {
  meditation?: MeditationData;  // Make meditation optional
  onSave: (mood: string, notes: string) => void;
  onSkip: () => void;
}

export default function MoodTracker({ meditation, onSave, onSkip }: MoodTrackerProps) {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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
        toast.success("Mood tracked successfully");
      }
      
      // Call the parent component's onSave function
      onSave(selectedMood, notes);
    } catch (error) {
      console.error("Error saving mood:", error);
      toast.error("Error saving mood. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>How do you feel now?</CardTitle>
        <CardDescription>
          {meditation ? `Track your mood after completing "${meditation.title}"` : "Track your mood after your session"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-2">
          {MOOD_OPTIONS.map((mood) => (
            <Button
              key={mood.value}
              variant={selectedMood === mood.value ? "default" : "outline"}
              className={`flex flex-col h-20 ${selectedMood === mood.value ? "bg-primary" : ""}`}
              onClick={() => setSelectedMood(mood.value)}
            >
              <span className="text-2xl mb-1">{mood.emoji}</span>
              <span className="text-xs">{mood.label}</span>
            </Button>
          ))}
        </div>
        
        <div className="space-y-2">
          <label htmlFor="notes" className="text-sm font-medium">
            Notes (optional)
          </label>
          <Textarea
            id="notes"
            placeholder="Any thoughts or insights from this session?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="h-24"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="ghost" onClick={onSkip} disabled={isSaving}>
          Skip
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={!selectedMood || isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
} 