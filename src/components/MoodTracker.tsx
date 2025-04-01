
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  SmilePlus, 
  Smile, 
  Meh, 
  Frown, 
  Skull, // Replacing FrownPlus with Skull for "Terrible" mood
  CalendarDays 
} from "lucide-react";

const moods = [
  { icon: SmilePlus, label: "Great", color: "text-green-400" },
  { icon: Smile, label: "Good", color: "text-emerald-400" },
  { icon: Meh, label: "Neutral", color: "text-yellow-400" },
  { icon: Frown, label: "Low", color: "text-orange-400" },
  { icon: Skull, label: "Terrible", color: "text-red-400" }, // Updated icon
];

const MoodTracker = () => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState("");

  const handleSave = () => {
    // In a real app, save the mood entry to a database
    console.log({ mood: selectedMood !== null ? moods[selectedMood].label : null, note });
    // Reset form
    setSelectedMood(null);
    setNote("");
    // Show success toast
  };

  return (
    <Card className="glass-card w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Mood Check-in</CardTitle>
          <CalendarDays className="h-5 w-5 text-muted-foreground" />
        </div>
        <CardDescription>How are you feeling today?</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-5 gap-2">
          {moods.map((mood, index) => {
            const MoodIcon = mood.icon;
            return (
              <Button
                key={index}
                type="button"
                variant="ghost"
                className={`flex flex-col items-center p-2 h-auto ${
                  selectedMood === index
                    ? "bg-primary/20 border border-primary/30"
                    : ""
                }`}
                onClick={() => setSelectedMood(index)}
              >
                <MoodIcon className={`h-8 w-8 mb-1 ${mood.color}`} />
                <span className="text-xs">{mood.label}</span>
              </Button>
            );
          })}
        </div>

        <Textarea
          placeholder="Add notes about how you're feeling (optional)"
          className="mt-4 bg-secondary/30 border-white/10"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={selectedMood === null}
          onClick={handleSave}
        >
          Save Mood
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MoodTracker;
