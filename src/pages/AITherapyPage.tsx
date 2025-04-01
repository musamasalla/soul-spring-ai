
import Header from "@/components/Header";
import AIChat from "@/components/AIChat";
import MoodTracker from "@/components/MoodTracker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Brain, History, Settings, MessageSquare, User, PlusCircle } from "lucide-react";

const AITherapyPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      
      <main className="flex-1 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">AI Therapy Chat</h1>
          <p className="text-muted-foreground mb-6">
            Talk to our AI assistant about your mental health concerns in a safe, private space
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <MoodTracker />
              
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Chat Sessions</CardTitle>
                  <CardDescription>Previous conversations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="ghost" className="w-full justify-start">
                    <History className="mr-2 h-4 w-4 text-primary" />
                    <div className="flex flex-col items-start">
                      <span className="text-sm">Anxiety management</span>
                      <span className="text-xs text-muted-foreground">Yesterday</span>
                    </div>
                  </Button>
                  
                  <Button variant="ghost" className="w-full justify-start">
                    <History className="mr-2 h-4 w-4 text-primary" />
                    <div className="flex flex-col items-start">
                      <span className="text-sm">Sleep troubles</span>
                      <span className="text-xs text-muted-foreground">3 days ago</span>
                    </div>
                  </Button>
                  
                  <Button variant="ghost" className="w-full justify-start">
                    <History className="mr-2 h-4 w-4 text-primary" />
                    <div className="flex flex-col items-start">
                      <span className="text-sm">Work stress</span>
                      <span className="text-xs text-muted-foreground">1 week ago</span>
                    </div>
                  </Button>
                  
                  <Button className="w-full mt-2" variant="outline">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Session
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            {/* Main Chat Area */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="chat">
                <TabsList className="grid w-full grid-cols-2 bg-secondary/30 mb-6">
                  <TabsTrigger value="chat">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Chat
                  </TabsTrigger>
                  <TabsTrigger value="settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Preferences
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="chat" className="h-[600px] glass-card overflow-hidden rounded-lg">
                  <AIChat />
                </TabsContent>
                
                <TabsContent value="settings">
                  <Card className="glass-card">
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
                        <h3 className="text-sm font-medium">Topics</h3>
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm" className="border-primary">Anxiety</Button>
                          <Button variant="outline" size="sm" className="border-primary">Depression</Button>
                          <Button variant="outline" size="sm">Stress</Button>
                          <Button variant="outline" size="sm">Relationships</Button>
                          <Button variant="outline" size="sm">Sleep</Button>
                          <Button variant="outline" size="sm">Work-life Balance</Button>
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
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
