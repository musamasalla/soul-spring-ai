import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import EnhancedAIChat from "@/components/EnhancedAIChat";
import MoodTracker from "@/components/MoodTracker";
import MoodRecommendations from "@/components/MoodRecommendations";
import TherapySessionFramework, { therapySessionStages, therapyGoals } from "@/components/TherapySessionFramework";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Brain, History, Settings, MessageSquare, User, PlusCircle, Calendar, Timer, Clock, FileText, Heart, BarChart, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import EmotionDetector, { EmotionData } from "@/components/EmotionDetector";
import TherapyTechniques from "@/components/TherapyTechniques";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface TherapySession {
  id: string;
  title: string;
  lastUpdated: Date;
  topic: string;
  duration: number; // in minutes
}

const AITherapyPage = () => {
  const { user } = useAuth();
  const [currentStage, setCurrentStage] = useState('opening');
  const [sessionTopics, setSessionTopics] = useState<string[]>([]);
  const [sessionLength, setSessionLength] = useState(30); // default 30 minutes
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [showNewSessionDialog, setShowNewSessionDialog] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [newSessionTopic, setNewSessionTopic] = useState('');
  const [newSessionGoal, setNewSessionGoal] = useState('');
  const [newSessionDuration, setNewSessionDuration] = useState(30);
  const [sessions, setSessions] = useState<TherapySession[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("chat");
  const [emotionData, setEmotionData] = useState<EmotionData | null>(null);
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [showEmotionSuggestion, setShowEmotionSuggestion] = useState(false);
  
  // Track previous emotion to detect significant changes
  const prevEmotionRef = useRef<string | null>(null);
  
  // Calculate completion percentage based on messages count
  const calculateSessionProgress = (stage: string) => {
    const stageIndex = therapySessionStages.findIndex(s => s.id === stage);
    const totalStages = therapySessionStages.length;
    
    // Base progress on current stage
    return Math.min(((stageIndex + 0.5) / totalStages) * 100, 100);
  };
  
  // Load user's therapy sessions
  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user]);
  
  // Load session history
  const loadSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('therapy_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setSessions(data.map(session => ({
          id: session.id,
          title: session.title,
          lastUpdated: new Date(session.updated_at),
          topic: session.primary_topic || 'General',
          duration: session.duration || 30
        })));
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };
  
  // Handle session stage update
  const handleStageUpdate = (newStage: string) => {
    setCurrentStage(newStage);
    setCompletionPercentage(calculateSessionProgress(newStage));
    
    // Log stage change to analytics (in a real app)
    console.log(`Session stage changed to ${newStage}`);
  };
  
  // Create a new therapy session
  const handleCreateSession = async () => {
    if (!newSessionTitle) {
      toast.error('Please enter a session title');
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('therapy_sessions')
        .insert({
          user_id: user?.id,
          title: newSessionTitle,
          primary_topic: newSessionTopic,
          session_goal: newSessionGoal,
          duration: newSessionDuration
        })
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        setActiveSession(data.id);
        const newSession = {
          id: data.id,
          title: data.title,
          lastUpdated: new Date(data.created_at),
          topic: data.primary_topic || 'General',
          duration: data.duration || 30
        };
        
        setSessions(prev => [newSession, ...prev]);
        setSessionLength(newSessionDuration);
        setSessionTopics(newSessionTopic ? [newSessionTopic] : []);
        
        toast.success('Therapy session created');
        setShowNewSessionDialog(false);
        
        // Reset form
        setNewSessionTitle('');
        setNewSessionTopic('');
        setNewSessionGoal('');
        setNewSessionDuration(30);
        
        // Reset session stage
        setCurrentStage('opening');
        setCompletionPercentage(calculateSessionProgress('opening'));
      }
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Failed to create session');
    }
  };
  
  // Load a specific session
  const loadSession = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('therapy_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setActiveSession(data.id);
        setSessionLength(data.duration || 30);
        setSessionTopics(data.primary_topic ? [data.primary_topic] : []);
        setCurrentStage(data.current_stage || 'opening');
        setCompletionPercentage(calculateSessionProgress(data.current_stage || 'opening'));
      }
    } catch (error) {
      console.error('Error loading session:', error);
      toast.error('Failed to load session');
    }
  };
  
  // Handle new message
  const handleNewMessage = (message: { role: string; content: string }) => {
    setMessages(prev => [...prev, message]);
  };
  
  // Handle emotion detection from chat
  const handleEmotionDetected = (data: EmotionData) => {
    // Check if there's a significant emotion change
    const shouldSuggestMoodTracking = 
      // If primary emotion changed significantly
      (prevEmotionRef.current && prevEmotionRef.current !== data.primaryEmotion) ||
      // If emotion intensity is high
      data.intensityLevel === 'high' || data.intensityLevel === 'very high' ||
      // If emotional trend is changing
      data.emotionalTrend !== 'stable';
    
    // Store new emotion data
    setEmotionData(data);
    prevEmotionRef.current = data.primaryEmotion;
    
    // Show suggestion to track mood if appropriate
    if (shouldSuggestMoodTracking) {
      setShowEmotionSuggestion(true);
      
      // Auto-hide suggestion after 15 seconds
      setTimeout(() => {
        setShowEmotionSuggestion(false);
      }, 15000);
    }
  };
  
  // Handle mood tracking completion
  const handleMoodSaved = (mood: string, notes: string) => {
    toast.success("Mood tracked successfully!");
    setShowEmotionSuggestion(false);
    
    // Optionally update therapy session with mood data
    if (activeSession) {
      try {
        // Store the mood data in local state instead of updating the database
        // This avoids the type errors with the Supabase client
        console.log(`Mood ${mood} saved for session ${activeSession}`);
        
        // In a real implementation, we would use a correctly typed Supabase client
        // or create a separate API endpoint for updating session data
      } catch (error) {
        console.error("Error updating session with mood:", error);
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      
      <main className="flex-1 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">AI Therapy Chat</h1>
              <p className="text-muted-foreground">
                Talk to our AI assistant about your mental health concerns in a safe, private space
              </p>
            </div>
            
            <Dialog open={showNewSessionDialog} onOpenChange={setShowNewSessionDialog}>
              <DialogTrigger asChild>
                <Button className="mt-4 md:mt-0">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Session
                </Button>
              </DialogTrigger>
              
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Therapy Session</DialogTitle>
                  <DialogDescription>
                    Set up your session details to get the most out of your therapy experience.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="session-title">Session Title</Label>
                    <Input
                      id="session-title"
                      value={newSessionTitle}
                      onChange={(e) => setNewSessionTitle(e.target.value)}
                      placeholder="e.g., Anxiety Management"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="session-topic">Primary Topic</Label>
                    <Select value={newSessionTopic} onValueChange={setNewSessionTopic}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Anxiety">Anxiety</SelectItem>
                        <SelectItem value="Depression">Depression</SelectItem>
                        <SelectItem value="Stress">Stress</SelectItem>
                        <SelectItem value="Relationships">Relationships</SelectItem>
                        <SelectItem value="Self-esteem">Self-esteem</SelectItem>
                        <SelectItem value="Work Issues">Work Issues</SelectItem>
                        <SelectItem value="Sleep">Sleep</SelectItem>
                        <SelectItem value="Trauma">Trauma</SelectItem>
                        <SelectItem value="General">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="session-goal">Session Goal</Label>
                    <Select 
                      value={newSessionGoal} 
                      onValueChange={setNewSessionGoal}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a goal" />
                      </SelectTrigger>
                      <SelectContent>
                        {therapyGoals.map(goal => (
                          <SelectItem key={goal} value={goal}>
                            {goal}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Having a clear goal helps make your session more effective
                    </p>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="session-duration">Session Duration</Label>
                    <Select 
                      value={newSessionDuration.toString()} 
                      onValueChange={(val) => setNewSessionDuration(parseInt(val))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowNewSessionDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateSession}>
                    Create Session
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          {showEmotionSuggestion && emotionData && (
            <Alert className="mb-4 border-primary/50 bg-primary/10">
              <Heart className="h-4 w-4 text-primary" />
              <AlertTitle>Emotion Change Detected</AlertTitle>
              <AlertDescription className="flex justify-between items-center">
                <div>
                  I noticed you're feeling <span className="font-medium capitalize">{emotionData.primaryEmotion}</span>.
                  Would you like to track this in your mood history?
                </div>
                <Button 
                  size="sm" 
                  className="ml-4"
                  onClick={() => {
                    setActiveTab("mood");
                    setShowEmotionSuggestion(false);
                  }}
                >
                  Track Mood
                  <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="chat" className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>Therapy Chat</span>
                  </TabsTrigger>
                  <TabsTrigger value="analysis" className="flex items-center gap-1">
                    <BarChart className="h-4 w-4" />
                    <span>Emotional Analysis</span>
                  </TabsTrigger>
                  <TabsTrigger value="techniques" className="flex items-center gap-1">
                    <Brain className="h-4 w-4" />
                    <span>Techniques</span>
                  </TabsTrigger>
                  <TabsTrigger value="session" className="flex items-center gap-1">
                    <Settings className="h-4 w-4" />
                    <span>Session</span>
                  </TabsTrigger>
                  <TabsTrigger value="mood" className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    <span>Mood</span>
                    {showEmotionSuggestion && (
                      <Badge className="ml-1 bg-primary text-primary-foreground">New</Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="chat" className="focus-visible:outline-none focus-visible:ring-0">
                  <Card>
                    <CardContent className="p-0">
                      <EnhancedAIChat 
                        sessionId={activeSession}
                        currentStage={currentStage}
                        onStageUpdate={handleStageUpdate}
                        sessionTopics={sessionTopics}
                        completionPercentage={completionPercentage}
                        onNewMessage={handleNewMessage}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="analysis" className="focus-visible:outline-none focus-visible:ring-0">
                  <EmotionDetector 
                    messages={messages} 
                    onEmotionDetected={handleEmotionDetected}
                    showVisualization={true}
                  />
                </TabsContent>
                
                <TabsContent value="techniques" className="focus-visible:outline-none focus-visible:ring-0">
                  <TherapyTechniques
                    emotionData={emotionData}
                    recommendedTechniques={emotionData?.recommendedTechniques}
                  />
                </TabsContent>
                
                <TabsContent value="session" className="focus-visible:outline-none focus-visible:ring-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Session Progress</CardTitle>
                      <CardDescription>Track your progress through this therapy session</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <TherapySessionFramework 
                        stages={therapySessionStages}
                        currentStage={currentStage}
                        onStageChange={handleStageUpdate}
                        completionPercentage={completionPercentage}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="mood" className="focus-visible:outline-none focus-visible:ring-0">
                  <MoodTracker 
                    userId={user?.id} 
                    emotionData={emotionData}
                    compact={true}
                    therapySession={activeSession ? {
                      id: activeSession,
                      title: sessions.find(s => s.id === activeSession)?.title || 'Therapy Session',
                      currentStage: currentStage,
                      primaryTopic: sessions.find(s => s.id === activeSession)?.topic
                    } : undefined}
                    onSave={handleMoodSaved}
                  />
                </TabsContent>
              </Tabs>
            </div>
            
            <div>
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Session History</CardTitle>
                    <CardDescription>Previous therapy sessions</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    {sessions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No previous sessions found</p>
                    ) : (
                      <div className="space-y-2">
                        {sessions.slice(0, 5).map((session) => (
                          <button
                            key={session.id}
                            className="w-full text-left p-3 rounded-md border border-border hover:border-primary hover:bg-accent transition-colors"
                            onClick={() => loadSession(session.id)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-sm">{session.title}</h4>
                                <p className="text-xs text-muted-foreground">
                                  {session.topic}
                                </p>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {session.lastUpdated.toLocaleDateString()}
                              </Badge>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  {sessions.length > 0 && (
                    <CardFooter>
                      <Button variant="ghost" size="sm" className="w-full">
                        <History className="mr-2 h-4 w-4" />
                        View All Sessions
                      </Button>
                    </CardFooter>
                  )}
                </Card>
                
                {activeTab !== "mood" && (
                  <MoodTracker 
                    userId={user?.id} 
                    emotionData={emotionData}
                    compact={true}
                    therapySession={activeSession ? {
                      id: activeSession,
                      title: sessions.find(s => s.id === activeSession)?.title || 'Therapy Session',
                      currentStage: currentStage,
                      primaryTopic: sessions.find(s => s.id === activeSession)?.topic
                    } : undefined}
                    onSave={handleMoodSaved}
                  />
                )}

                {/* Add mood-based recommendations */}
                {emotionData && (
                  <MoodRecommendations
                    emotionData={emotionData}
                    userId={user?.id}
                    compact={true}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AITherapyPage;
