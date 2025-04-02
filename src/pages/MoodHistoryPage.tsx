import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import MoodHistoryChart from "@/components/MoodHistoryChart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { HeartPulse, Download, Filter, Calendar, Clock, BarChart2, List } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface MoodEntry {
  id: string;
  mood: string;
  created_at: string;
  date: string;
  notes?: string;
  factors?: any;
}

// Mood emoji map
const MOOD_EMOJIS: Record<string, string> = {
  'very_happy': '😊',
  'happy': '🙂',
  'calm': '😌',
  'refreshed': '🧘',
  'neutral': '😐',
  'sleepy': '😴',
  'anxious': '😟',
  'sad': '😢'
};

// Mood label map
const MOOD_LABELS: Record<string, string> = {
  'very_happy': 'Very Happy',
  'happy': 'Happy',
  'calm': 'Calm',
  'refreshed': 'Refreshed',
  'neutral': 'Neutral',
  'sleepy': 'Sleepy',
  'anxious': 'Anxious',
  'sad': 'Sad'
};

const MoodHistoryPage = () => {
  const { user } = useAuth();
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMoodEntry, setSelectedMoodEntry] = useState<MoodEntry | null>(null);
  const [showMoodDetails, setShowMoodDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("chart");
  
  useEffect(() => {
    if (user) {
      loadMoodEntries();
    }
  }, [user]);
  
  const loadMoodEntries = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      
      setMoodEntries(data || []);
    } catch (error) {
      console.error("Error loading mood entries:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMoodEntryClick = (entry: MoodEntry) => {
    setSelectedMoodEntry(entry);
    setShowMoodDetails(true);
  };

  const exportMoodData = () => {
    if (!moodEntries.length) return;
    
    // Format data for CSV
    const headers = ["Date", "Time", "Mood", "Notes", "Therapy Session", "Topic"];
    const csvData = moodEntries.map(entry => {
      const date = new Date(entry.created_at);
      return [
        format(date, 'yyyy-MM-dd'),
        format(date, 'HH:mm:ss'),
        MOOD_LABELS[entry.mood] || entry.mood,
        entry.notes || '',
        entry.factors?.therapy_session_title || '',
        entry.factors?.therapy_session_topic || ''
      ].join(',');
    });
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...csvData
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mood_history_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      
      <main className="flex-1 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Mood History</h1>
              <p className="text-muted-foreground">
                Track and visualize your mood patterns over time
              </p>
            </div>
            
            <Button onClick={exportMoodData} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
          </div>
          
          <div className="grid gap-6">
            <MoodHistoryChart userId={user?.id || ''} height={400} />
            
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <HeartPulse className="h-5 w-5 text-primary" />
                    Mood Entries
                  </CardTitle>
                  
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                    <TabsList>
                      <TabsTrigger value="chart" className="flex items-center gap-1">
                        <BarChart2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Distribution</span>
                      </TabsTrigger>
                      <TabsTrigger value="list" className="flex items-center gap-1">
                        <List className="h-4 w-4" />
                        <span className="hidden sm:inline">List View</span>
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <CardDescription>
                  Your recent mood entries and their details
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <TabsContent value="chart" className="mt-0">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(MOOD_EMOJIS).map(([mood, emoji]) => {
                      const count = moodEntries.filter(entry => entry.mood === mood).length;
                      const percentage = moodEntries.length ? Math.round((count / moodEntries.length) * 100) : 0;
                      
                      return (
                        <Card key={mood} className="overflow-hidden">
                          <div className={`h-1 bg-primary ${percentage > 50 ? 'w-full' : `w-[${percentage}%]`}`}></div>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                              <div className="flex flex-col">
                                <span className="text-3xl">{emoji}</span>
                                <span className="text-sm font-medium mt-1">{MOOD_LABELS[mood]}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-2xl font-semibold">{count}</span>
                                <span className="text-xs text-muted-foreground block">
                                  {percentage}%
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-sm font-medium mb-3">Related Factors</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Therapy Sessions</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          {moodEntries.filter(entry => entry.factors?.therapy_session_id).length} entries linked to therapy
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Time of Day</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="text-xs space-y-1">
                            <div className="flex justify-between">
                              <span>Morning (6am-12pm):</span>
                              <span>{moodEntries.filter(entry => {
                                const hour = new Date(entry.created_at).getHours();
                                return hour >= 6 && hour < 12;
                              }).length} entries</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Afternoon (12pm-6pm):</span>
                              <span>{moodEntries.filter(entry => {
                                const hour = new Date(entry.created_at).getHours();
                                return hour >= 12 && hour < 18;
                              }).length} entries</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Evening (6pm-12am):</span>
                              <span>{moodEntries.filter(entry => {
                                const hour = new Date(entry.created_at).getHours();
                                return hour >= 18 && hour < 24;
                              }).length} entries</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Night (12am-6am):</span>
                              <span>{moodEntries.filter(entry => {
                                const hour = new Date(entry.created_at).getHours();
                                return hour >= 0 && hour < 6;
                              }).length} entries</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Most Recent</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          {moodEntries.length > 0 ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{MOOD_EMOJIS[moodEntries[0].mood]}</span>
                              <span>{format(new Date(moodEntries[0].created_at), 'MMM d, yyyy HH:mm')}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No entries</span>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="list" className="mt-0">
                  {isLoading ? (
                    <div className="h-60 flex items-center justify-center">
                      <div className="animate-pulse text-primary">Loading entries...</div>
                    </div>
                  ) : moodEntries.length === 0 ? (
                    <div className="h-60 flex items-center justify-center text-center">
                      <div>
                        <p className="text-muted-foreground mb-2">No mood entries recorded yet</p>
                        <p className="text-sm text-muted-foreground">Use the Mood Tracker to begin recording your moods</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {moodEntries.slice(0, 20).map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-start gap-3 p-3 border rounded-lg hover:border-primary hover:bg-accent/50 transition-colors cursor-pointer"
                          onClick={() => handleMoodEntryClick(entry)}
                        >
                          <div className="text-2xl">{MOOD_EMOJIS[entry.mood]}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                              <h4 className="font-medium">
                                {MOOD_LABELS[entry.mood] || entry.mood}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {format(new Date(entry.created_at), 'MMM d, yyyy')}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {format(new Date(entry.created_at), 'HH:mm')}
                                </span>
                              </div>
                            </div>
                            {entry.notes && (
                              <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                                {entry.notes}
                              </p>
                            )}
                            {entry.factors?.therapy_session_id && (
                              <Badge variant="outline" className="mt-2 text-xs">
                                Therapy: {entry.factors.therapy_session_title}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {moodEntries.length > 20 && (
                        <Button variant="ghost" className="w-full" onClick={() => {}}>
                          Load more entries
                        </Button>
                      )}
                    </div>
                  )}
                </TabsContent>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Dialog open={showMoodDetails} onOpenChange={setShowMoodDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedMoodEntry && (
                <>
                  <span className="text-xl">{MOOD_EMOJIS[selectedMoodEntry.mood]}</span>
                  <span>{MOOD_LABELS[selectedMoodEntry.mood] || selectedMoodEntry.mood}</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedMoodEntry && format(new Date(selectedMoodEntry.created_at), 'MMMM d, yyyy HH:mm')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedMoodEntry && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Notes</h4>
                <Textarea 
                  value={selectedMoodEntry.notes || "No notes recorded"} 
                  readOnly 
                  className="h-24 resize-none"
                />
              </div>
              
              {selectedMoodEntry.factors && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Related Context</h4>
                  <div className="text-sm space-y-2 p-3 bg-muted rounded-md">
                    {selectedMoodEntry.factors.therapy_session_id && (
                      <div>
                        <span className="font-medium">Therapy Session:</span>
                        <span className="ml-2">{selectedMoodEntry.factors.therapy_session_title}</span>
                        {selectedMoodEntry.factors.therapy_session_stage && (
                          <Badge variant="outline" className="ml-2">
                            {selectedMoodEntry.factors.therapy_session_stage}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    {selectedMoodEntry.factors.primaryEmotion && (
                      <div>
                        <span className="font-medium">Detected Emotion:</span>
                        <span className="ml-2">{selectedMoodEntry.factors.primaryEmotion}</span>
                        {selectedMoodEntry.factors.sentiment && (
                          <Badge variant="outline" className="ml-2">
                            {selectedMoodEntry.factors.sentiment > 70 
                              ? 'Very Positive' 
                              : selectedMoodEntry.factors.sentiment > 50 
                                ? 'Positive'
                                : selectedMoodEntry.factors.sentiment > 30
                                  ? 'Neutral'
                                  : 'Negative'}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MoodHistoryPage; 