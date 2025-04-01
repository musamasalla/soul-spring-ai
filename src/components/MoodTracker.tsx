
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { 
  SmilePlus, 
  Smile, 
  Meh, 
  Frown, 
  Skull, // For "Terrible" mood
  CalendarDays,
  ChevronDown,
  Sparkles,
  Heart,
  Sun,
  Moon,
  CloudRain
} from "lucide-react";

const moods = [
  { icon: SmilePlus, label: "Great", color: "text-green-400", description: "Feeling fantastic today!" },
  { icon: Smile, label: "Good", color: "text-emerald-400", description: "Having a good day" },
  { icon: Meh, label: "Neutral", color: "text-yellow-400", description: "Just okay" },
  { icon: Frown, label: "Low", color: "text-orange-400", description: "Not feeling great" },
  { icon: Skull, label: "Terrible", color: "text-red-400", description: "Having a really tough time" },
];

const factors = [
  { label: "Work stress", icon: Sun },
  { label: "Family", icon: Heart },
  { label: "Relationship", icon: Heart },
  { label: "Health", icon: Heart },
  { label: "Sleep", icon: Moon },
  { label: "Weather", icon: CloudRain },
];

const MoodTracker = () => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);

  const handleSave = () => {
    // In a real app, save the mood entry to a database
    console.log({ 
      mood: selectedMood !== null ? moods[selectedMood].label : null, 
      note,
      factors: selectedFactors
    });
    // Reset form
    setSelectedMood(null);
    setNote("");
    setSelectedFactors([]);
    // Show success toast in a real app
  };

  const toggleFactor = (factor: string) => {
    setSelectedFactors(prev => 
      prev.includes(factor) 
        ? prev.filter(f => f !== factor) 
        : [...prev, factor]
    );
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Card className="neo-card w-full max-w-xl mx-auto overflow-hidden animate-float group">
          <CardHeader className="relative bg-gradient-to-r from-violet-800/30 to-fuchsia-800/30">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            <div className="flex items-center justify-between z-10 relative">
              <div>
                <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
                  How are you feeling?
                </CardTitle>
                <CardDescription className="text-white/70">
                  {selectedMood !== null ? moods[selectedMood].description : "Track your emotional wellbeing"}
                </CardDescription>
              </div>
              <CalendarDays className="h-5 w-5 text-primary animate-pulse" />
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-6 px-4">
            <div className="grid grid-cols-5 gap-2">
              {moods.map((mood, index) => {
                const MoodIcon = mood.icon;
                const isSelected = selectedMood === index;
                
                return (
                  <Button
                    key={index}
                    type="button"
                    variant={isSelected ? "default" : "ghost"}
                    className={`
                      flex flex-col items-center p-2 h-auto transition-all duration-300
                      ${isSelected ? "bg-primary border-none shadow-lg shadow-primary/20" : "hover:bg-primary/10"}
                    `}
                    onClick={() => setSelectedMood(index)}
                  >
                    <div className={`
                      relative rounded-full p-2
                      ${isSelected ? 'bg-primary/20' : ''}
                    `}>
                      <MoodIcon className={`
                        h-8 w-8 transition-transform duration-300
                        ${mood.color} 
                        ${isSelected ? 'scale-110' : 'scale-100'}
                      `} />
                      {isSelected && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                        </span>
                      )}
                    </div>
                    <span className={`text-xs mt-2 font-medium ${isSelected ? 'text-primary' : ''}`}>{mood.label}</span>
                  </Button>
                );
              })}
            </div>

            <Collapsible 
              open={isAdvancedOpen} 
              onOpenChange={setIsAdvancedOpen}
              className="border border-white/10 rounded-lg overflow-hidden"
            >
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between text-sm text-muted-foreground hover:bg-primary/10 hover:text-primary-foreground"
                >
                  <div className="flex items-center">
                    <Sparkles className="h-4 w-4 mr-2 text-primary" />
                    <span>What factors affected your mood?</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isAdvancedOpen ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 space-y-3 bg-black/20">
                <div className="grid grid-cols-2 gap-2">
                  {factors.map((factor, index) => {
                    const FactorIcon = factor.icon;
                    const isSelected = selectedFactors.includes(factor.label);
                    
                    return (
                      <div 
                        key={index} 
                        className={`
                          flex items-center space-x-2 rounded-lg p-2 cursor-pointer
                          ${isSelected ? 'bg-primary/20 text-primary' : 'hover:bg-white/5'}
                        `}
                        onClick={() => toggleFactor(factor.label)}
                      >
                        <Checkbox 
                          id={`factor-${index}`}
                          checked={isSelected}
                          className={isSelected ? 'text-primary border-primary' : ''}
                        />
                        <div className="flex items-center">
                          <FactorIcon className="h-4 w-4 mr-2" />
                          <label htmlFor={`factor-${index}`} className="text-sm cursor-pointer">
                            {factor.label}
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Textarea
              placeholder="Add notes about how you're feeling... (optional)"
              className="bg-secondary/20 border-white/10 focus:border-primary/50 transition-all duration-300 min-h-[100px]"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
            />
            {note && <p className="text-xs text-right text-muted-foreground">{note.length}/500</p>}
          </CardContent>
          <CardFooter className="px-4 pb-4">
            <Button 
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400 text-primary-foreground transition-all duration-300"
              disabled={selectedMood === null}
              onClick={handleSave}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Save Mood Entry
            </Button>
          </CardFooter>
        </Card>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>View Mood History</ContextMenuItem>
        <ContextMenuItem>View Trends</ContextMenuItem>
        <ContextMenuItem>Set Reminder</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default MoodTracker;
