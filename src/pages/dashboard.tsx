import { useTherapyData } from '@/contexts/TherapyDataProvider';
import { OfflineIndicator } from '@/components/ui/OfflineIndicator';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Brain, Activity, Calendar, CheckCircle2, BarChart, Sun, Moon, Cloud } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function Dashboard() {
  const { user } = useAuth();
  const therapyData = useTherapyData();
  const { isUsingFallbackData, therapyGoals, therapySessions, isLoading, error } = therapyData;
  const [currentMood, setCurrentMood] = useState<string | null>(null);
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <div className="ml-4 text-lg">Loading dashboard data...</div>
        </div>
      </div>
    );
  }
  
  const suggestedMeditations = [
    { title: "Morning Calm", duration: "5 min", icon: Sun },
    { title: "Evening Relaxation", duration: "10 min", icon: Moon },
    { title: "Stress Relief", duration: "7 min", icon: Cloud }
  ];
  
  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <OfflineIndicator isUsingFallback={isUsingFallbackData} />
      
      {/* Welcome section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome, {user?.email?.split('@')[0] || 'User'}</h1>
        <p className="text-muted-foreground mt-1">Your mental wellness journey at a glance</p>
      </div>
      
      {/* Quick Mood Check */}
      <div className="mb-8 p-4 border rounded-lg bg-card">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <BarChart className="mr-2 h-5 w-5 text-primary" />
          How are you feeling today?
        </h2>
        
        <div className="flex flex-wrap gap-2">
          {["Happy", "Calm", "Anxious", "Sad", "Energetic", "Tired"].map(mood => (
            <Button 
              key={mood}
              variant={currentMood === mood ? "default" : "outline"}
              onClick={() => {
                setCurrentMood(mood);
                toast.success(`Mood recorded: ${mood}`);
              }}
              className="min-w-24"
            >
              {mood}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Goals summary card */}
        <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <CheckCircle2 className="mr-2 h-5 w-5 text-primary" />
            Therapy Goals
          </h2>
          {therapyGoals && therapyGoals.length > 0 ? (
            <ul className="space-y-2">
              {therapyGoals.slice(0, 3).map(goal => (
                <li key={goal.id} className="p-3 rounded-md bg-secondary/50">
                  <p className="font-medium">{goal.title}</p>
                  <p className="text-sm text-muted-foreground">{goal.description}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No therapy goals found</p>
          )}
          
          <Button variant="outline" className="w-full mt-4" asChild>
            <Link to="/therapy">Manage Therapy Goals</Link>
          </Button>
        </div>
        
        {/* Sessions summary card */}
        <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-primary" />
            Recent Sessions
          </h2>
          {therapySessions && therapySessions.length > 0 ? (
            <ul className="space-y-2">
              {therapySessions.slice(0, 3).map(session => (
                <li key={session.id} className="p-3 rounded-md bg-secondary/50">
                  <p className="font-medium">{session.title}</p>
                  <p className="text-sm text-muted-foreground">{session.summary}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No therapy sessions found</p>
          )}
          
          <Button variant="outline" className="w-full mt-4" asChild>
            <Link to="/ai-therapy">Start AI Therapy Session</Link>
          </Button>
        </div>
        
        {/* Meditation suggestions */}
        <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Brain className="mr-2 h-5 w-5 text-primary" />
            Suggested Meditations
          </h2>
          
          <ul className="space-y-3">
            {suggestedMeditations.map((med, idx) => (
              <li key={idx} className="flex items-center p-3 rounded-md bg-secondary/50">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <med.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{med.title}</p>
                  <p className="text-xs text-muted-foreground">{med.duration}</p>
                </div>
              </li>
            ))}
          </ul>
          
          <Button variant="outline" className="w-full mt-4" disabled>
            Explore Meditations
          </Button>
        </div>
        
        {/* Mood History Preview */}
        <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm md:col-span-2 lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Activity className="mr-2 h-5 w-5 text-primary" />
            Mood History
          </h2>
          
          <div className="h-40 flex items-center justify-center bg-secondary/20 rounded-md">
            <p className="text-muted-foreground">Mood history visualization coming soon</p>
          </div>
          
          <Button variant="outline" className="w-full mt-4" asChild>
            <Link to="/mood-history">View History</Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 