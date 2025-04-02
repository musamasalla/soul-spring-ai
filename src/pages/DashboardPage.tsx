import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { BarChart, CalendarDays, MessageSquare, Brain, User, Settings, LogOut, Sparkles } from "lucide-react";
import EnhancedAIChat from "@/components/EnhancedAIChat";
import MoodTracker from "@/components/MoodTracker";
import MoodRecommendations from "@/components/MoodRecommendations";
import { Button } from "@/components/ui/button";
import { useMoodStore } from "@/stores/moodStore";

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const { currentMood, moods, fetchMoods } = useMoodStore();

  // Fetch user moods if needed
  useEffect(() => {
    if (user && moods.length === 0) {
      fetchMoods(user.id);
    }
  }, [user, moods.length, fetchMoods]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      
      <main className="flex-1 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">
                Welcome, {user?.name || 'User'}
              </h1>
              <p className="text-muted-foreground">
                Your wellness journey dashboard
              </p>
            </div>
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <Button variant="outline" onClick={() => navigate('/settings')}>
                <Settings className="h-4 w-4 mr-2" /> Settings
              </Button>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-4 md:w-[400px] bg-secondary/30">
              <TabsTrigger value="overview">
                <BarChart className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="therapy">
                <MessageSquare className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Therapy</span>
              </TabsTrigger>
              <TabsTrigger value="meditation">
                <Brain className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Meditation</span>
              </TabsTrigger>
              <TabsTrigger value="profile">
                <User className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Profile</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="glass-card card-hover">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart className="h-5 w-5 text-primary mr-2" />
                      Mood Tracker
                    </CardTitle>
                    <CardDescription>How are you feeling today?</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MoodTracker 
                      userId={user?.id}
                      compact={true}
                    />
                  </CardContent>
                </Card>
                
                <Card className="glass-card card-hover">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Sparkles className="h-5 w-5 text-primary mr-2" />
                      Recommended For You
                    </CardTitle>
                    <CardDescription>Personalized activities based on your mood</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MoodRecommendations
                      currentMood={currentMood}
                      userId={user?.id}
                      compact={true}
                    />
                  </CardContent>
                </Card>
                
                <Card className="glass-card card-hover">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MessageSquare className="h-5 w-5 text-primary mr-2" />
                      Recent Sessions
                    </CardTitle>
                    <CardDescription>Your recent therapy sessions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex justify-between items-center">
                        <span>Anxiety management</span>
                        <span className="text-xs text-muted-foreground">2 days ago</span>
                      </li>
                      <li className="flex justify-between items-center">
                        <span>Sleep troubles</span>
                        <span className="text-xs text-muted-foreground">1 week ago</span>
                      </li>
                    </ul>
                    <Button 
                      className="w-full mt-4" 
                      variant="outline"
                      onClick={() => setActiveTab("therapy")}
                    >
                      Start New Session
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="glass-card card-hover md:col-span-3 lg:col-span-3">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CalendarDays className="h-5 w-5 text-primary mr-2" />
                      Upcoming Activities
                    </CardTitle>
                    <CardDescription>Scheduled sessions and recommended practices</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h3 className="text-sm font-medium mb-2">Today</h3>
                        <ul className="space-y-2">
                          <li className="flex justify-between items-center p-2 border rounded-md">
                            <span>Guided Meditation</span>
                            <span className="text-xs text-muted-foreground">8:00 PM</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium mb-2">Tomorrow</h3>
                        <ul className="space-y-2">
                          <li className="flex justify-between items-center p-2 border rounded-md">
                            <span>Weekly Reflection</span>
                            <span className="text-xs text-muted-foreground">10:00 AM</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium mb-2">Suggested</h3>
                        <Button 
                          className="w-full mb-2" 
                          variant="outline"
                          onClick={() => navigate('/meditation')}
                        >
                          Browse Meditations
                        </Button>
                        <Button 
                          className="w-full" 
                          variant="outline"
                          onClick={() => navigate('/recommendations')}
                        >
                          View All Recommendations
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="therapy">
              <Card className="glass-card h-[600px] overflow-hidden">
                <EnhancedAIChat />
              </Card>
            </TabsContent>
            
            <TabsContent value="meditation">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Meditation Library</CardTitle>
                  <CardDescription>Explore guided meditations for different needs</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center py-10">
                    Visit the full meditation page to access all features
                  </p>
                  <Button 
                    className="w-full" 
                    onClick={() => navigate('/meditation')}
                  >
                    Go to Meditation Page
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="profile">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Your Profile</CardTitle>
                  <CardDescription>Manage your account information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold">
                      {user?.name?.substring(0, 2) || 'U'}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{user?.name}</h3>
                      <p className="text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <Button variant="outline">Edit Profile</Button>
                    <Button variant="outline" onClick={() => navigate('/settings')}>Account Settings</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
