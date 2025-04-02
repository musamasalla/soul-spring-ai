import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MeditationData } from "@/types/meditation";

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
  meditation: MeditationData;
  onSave: (mood: string, notes: string) => void;
  onSkip: () => void;
}

export default function MoodTracker({ meditation, onSave, onSkip }: MoodTrackerProps) {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const handleSave = () => {
    if (selectedMood) {
      onSave(selectedMood, notes);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>How do you feel now?</CardTitle>
        <CardDescription>
          Track your mood after completing "{meditation.title}"
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
        <Button variant="ghost" onClick={onSkip}>
          Skip
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={!selectedMood}
        >
          Save
        </Button>
      </CardFooter>
    </Card>
  );
} 