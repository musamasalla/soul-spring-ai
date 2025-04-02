import { useState, useEffect } from "react";
import Header from "@/components/Header";
import EnhancedAIChat from "@/components/EnhancedAIChat";
import MoodTracker from "@/components/MoodTracker";
import TherapySessionFramework, { therapySessionStages, therapyGoals } from "@/components/TherapySessionFramework";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Brain, History, Settings, MessageSquare, User, PlusCircle, Calendar, Timer, Clock, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <MoodTracker />
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Session History</CardTitle>
                  <CardDescription>Previous therapy conversations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 max-h-[300px] overflow-y-auto">
                  {sessions.length === 0 ? (
                    <div className="text-center text-muted-foreground text-sm py-4">
                      No previous sessions
                    </div>
                  ) : (
                    sessions.map(session => (
                      <Button 
                        key={session.id}
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={() => loadSession(session.id)}
                      >
                        <div className="mr-2 relative">
                          <FileText className="h-4 w-4 text-primary" />
                          {session.id === activeSession && (
                            <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                          )}
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="text-sm">{session.title}</span>
                          <div className="flex items-center">
                            <span className="text-xs text-muted-foreground">
                              {session.lastUpdated.toLocaleDateString()}
                            </span>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {session.topic}
                            </Badge>
                          </div>
                        </div>
                      </Button>
                    ))
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => setShowNewSessionDialog(true)}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Session
                  </Button>
                </CardFooter>
              </Card>
              
              {user && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold">Your Profile</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div className="bg-secondary/50 rounded p-2 text-center">
                        <p className="text-xs text-muted-foreground">Sessions</p>
                        <p className="font-semibold">{sessions.length}</p>
                      </div>
                      <div className="bg-secondary/50 rounded p-2 text-center">
                        <p className="text-xs text-muted-foreground">Time Spent</p>
                        <p className="font-semibold">
                          {sessions.reduce((acc, session) => acc + session.duration, 0)} min
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-3">
                      Manage Profile
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
            
            {/* Main Chat Area */}
            <div className="lg:col-span-3">
              <div className="mb-6">
                <TherapySessionFramework
                  currentStage={currentStage}
                  onStageUpdate={handleStageUpdate}
                  sessionTopics={sessionTopics}
                  sessionLength={sessionLength}
                  completionPercentage={completionPercentage}
                />
              </div>
              
              <Tabs defaultValue="chat">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="chat">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Chat
                  </TabsTrigger>
                  <TabsTrigger value="settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Preferences
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="chat" className="h-[600px] rounded-lg overflow-hidden border">
                  <EnhancedAIChat 
                    sessionId={activeSession}
                    currentStage={currentStage}
                    onStageUpdate={handleStageUpdate}
                    sessionTopics={sessionTopics}
                    completionPercentage={completionPercentage}
                    onCompletionUpdate={setCompletionPercentage}
                  />
                </TabsContent>
                
                <TabsContent value="settings">
                  <Card>
                    <CardHeader>
                      <CardTitle>Chat Preferences</CardTitle>
                      <CardDescription>Customize your AI therapy experience</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">AI Therapy Style</h3>
                        <div className="grid grid-cols-3 gap-2">
                          <Button variant="outline" className="border-primary">
                            <Brain className="mr-2 h-4 w-4 text-primary" />
                            Balanced
                          </Button>
                          <Button variant="outline">
                            <User className="mr-2 h-4 w-4" />
                            Empathetic
                          </Button>
                          <Button variant="outline">
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Solution-focused
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Session Structure</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <Button variant="outline" className="border-primary justify-start">
                            <Clock className="mr-2 h-4 w-4 text-primary" />
                            <div className="text-left">
                              <p className="text-sm">Structured</p>
                              <p className="text-xs text-muted-foreground">Guided therapy stages</p>
                            </div>
                          </Button>
                          <Button variant="outline" className="justify-start">
                            <MessageSquare className="mr-2 h-4 w-4" />
                            <div className="text-left">
                              <p className="text-sm">Free-form</p>
                              <p className="text-xs text-muted-foreground">Natural conversation</p>
                            </div>
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Focus Topics</h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="border-primary cursor-pointer">Anxiety</Badge>
                          <Badge variant="outline" className="border-primary cursor-pointer">Depression</Badge>
                          <Badge variant="outline" className="cursor-pointer">Stress</Badge>
                          <Badge variant="outline" className="cursor-pointer">Relationships</Badge>
                          <Badge variant="outline" className="cursor-pointer">Sleep</Badge>
                          <Badge variant="outline" className="cursor-pointer">Work-life Balance</Badge>
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <Button className="w-full">
                          Save Preferences
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AITherapyPage;
