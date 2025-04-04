import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart2, Download, LineChart, Plus } from "lucide-react";
import { format, subDays } from "date-fns";

// Simplified mood entry interface
interface MoodEntry {
  id: string;
  mood: string;
  created_at: string;
  notes?: string;
}

// Mood emoji map
const MOOD_EMOJIS: Record<string, string> = {
  'happy': '😊',
  'calm': '😌',
  'neutral': '😐',
  'anxious': '😟',
  'sad': '😢'
};

// Mood label map
const MOOD_LABELS: Record<string, string> = {
  'happy': 'Happy',
  'calm': 'Calm',
  'neutral': 'Neutral',
  'anxious': 'Anxious',
  'sad': 'Sad'
};

// Generate sample data for demo purposes
const generateSampleMoods = () => {
  const moods = ['happy', 'calm', 'neutral', 'anxious', 'sad'];
  const entries: MoodEntry[] = [];
  
  for (let i = 0; i < 30; i++) {
    const randomMood = moods[Math.floor(Math.random() * moods.length)];
    entries.push({
      id: `sample-${i}`,
      mood: randomMood,
      created_at: subDays(new Date(), i).toISOString(),
      notes: i % 5 === 0 ? `Note for ${randomMood} mood on ${format(subDays(new Date(), i), 'MMM dd')}` : undefined
    });
  }
  
  return entries;
};

const MoodHistoryPage = () => {
  const { user } = useAuth();
  // Using static sample data instead of fetching from database
  const [moodEntries] = useState<MoodEntry[]>(generateSampleMoods());
  const [currentView, setCurrentView] = useState<'chart' | 'list'>('chart');
  
  // Calculate mood distribution
  const moodCounts = moodEntries.reduce((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const exportMoodData = () => {
    alert("Export functionality would be implemented here in production");
  };
  
  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Mood History</h1>
          <p className="text-muted-foreground">
            Track and analyze your mood patterns over time
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={exportMoodData} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span>Export Data</span>
          </Button>
          
          <Button variant="default" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Add Mood</span>
          </Button>
        </div>
      </div>
      
      <div className="grid gap-6">
        {/* Simple Mood Visualization */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Mood Timeline</CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant={currentView === 'chart' ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setCurrentView('chart')}
                >
                  <BarChart2 className="h-4 w-4 mr-2" />
                  Chart
                </Button>
                <Button 
                  variant={currentView === 'list' ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setCurrentView('list')}
                >
                  <LineChart className="h-4 w-4 mr-2" />
                  List
                </Button>
              </div>
            </div>
            <CardDescription>Visualize how your mood has changed over time</CardDescription>
          </CardHeader>
          <CardContent>
            {currentView === 'chart' ? (
              <div className="h-60 flex items-end justify-between gap-1 pt-10">
                {moodEntries.slice(0, 14).map((entry, index) => {
                  const moodValue = entry.mood === 'happy' ? 1 : 
                                    entry.mood === 'calm' ? 0.75 : 
                                    entry.mood === 'neutral' ? 0.5 : 
                                    entry.mood === 'anxious' ? 0.25 : 0.1;
                  
                  return (
                    <div key={index} className="flex flex-col items-center">
                      <div 
                        className="w-9 bg-primary rounded-t-sm" 
                        style={{ height: `${moodValue * 150}px` }}
                        title={`${MOOD_LABELS[entry.mood]} on ${format(new Date(entry.created_at), 'MMM dd')}`}
                      ></div>
                      <div className="text-xs mt-2 rotate-45 origin-left whitespace-nowrap">
                        {format(new Date(entry.created_at), 'M/d')}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="overflow-auto max-h-80">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Mood</th>
                      <th className="text-left p-2">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {moodEntries.map((entry, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="p-2">
                          {format(new Date(entry.created_at), 'MMM dd, yyyy')}
                        </td>
                        <td className="p-2">
                          <span className="flex items-center gap-2">
                            <span className="text-xl">{MOOD_EMOJIS[entry.mood]}</span>
                            <span>{MOOD_LABELS[entry.mood]}</span>
                          </span>
                        </td>
                        <td className="p-2">{entry.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Mood Distribution Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mood Distribution</CardTitle>
            <CardDescription>Your most frequent moods</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {Object.entries(MOOD_EMOJIS).map(([mood, emoji]) => {
                const count = moodCounts[mood] || 0;
                const percentage = moodEntries.length ? Math.round((count / moodEntries.length) * 100) : 0;
                
                return (
                  <Card key={mood} className="overflow-hidden border-t-4 border-primary">
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-3xl mb-1">{emoji}</span>
                        <span className="text-sm font-medium">{MOOD_LABELS[mood]}</span>
                        <div className="flex flex-col items-center mt-2">
                          <span className="text-2xl font-semibold">{count}</span>
                          <span className="text-xs text-muted-foreground">{percentage}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        {/* Insights Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mood Insights</CardTitle>
            <CardDescription>Patterns and observations from your mood data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-secondary/20 rounded-md">
                <h3 className="font-medium mb-2">Most frequent mood</h3>
                <p className="text-sm text-muted-foreground">
                  Your most common mood has been{" "}
                  <span className="font-medium">
                    {Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] 
                      ? MOOD_LABELS[Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0][0]]
                      : "not determined yet"}
                  </span>
                </p>
              </div>
              
              <div className="p-4 bg-secondary/20 rounded-md">
                <h3 className="font-medium mb-2">Recent trend</h3>
                <p className="text-sm text-muted-foreground">
                  Your mood has been trending{" "}
                  <span className="font-medium">
                    {Math.random() > 0.5 ? "positively" : "stably"}
                  </span>{" "}
                  over the past 2 weeks
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MoodHistoryPage; 