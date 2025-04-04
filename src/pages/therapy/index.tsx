import { useTherapyData } from '@/contexts/TherapyDataProvider';
import { OfflineIndicator } from '@/components/ui/OfflineIndicator';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { Plus, Calendar, CheckCircle2, BookOpen } from 'lucide-react';

export default function TherapyDashboard() {
  const therapyData = useTherapyData();
  const { isUsingFallbackData, therapyGoals, therapySessions, isLoading, error, addTherapyGoal, addTherapySession } = therapyData;
  
  // State for modal dialogs
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
  
  // State for form inputs
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionSummary, setSessionSummary] = useState('');
  const [sessionDuration, setSessionDuration] = useState('30');
  
  const handleAddGoal = async () => {
    if (!goalTitle.trim()) {
      toast.error('Please enter a goal title');
      return;
    }
    
    try {
      await addTherapyGoal({
        title: goalTitle,
        description: goalDescription,
        status: 'in_progress',
        completed_at: null
      });
      
      toast.success('Therapy goal added successfully');
      setGoalTitle('');
      setGoalDescription('');
      setIsGoalDialogOpen(false);
    } catch (err) {
      console.error('Failed to add goal:', err);
      toast.error('Failed to add goal. Please try again.');
    }
  };
  
  const handleAddSession = async () => {
    if (!sessionTitle.trim()) {
      toast.error('Please enter a session title');
      return;
    }
    
    try {
      await addTherapySession({
        title: sessionTitle,
        summary: sessionSummary,
        notes: '',
        duration: parseInt(sessionDuration) || 30,
        date: new Date().toISOString()
      });
      
      toast.success('Therapy session added successfully');
      setSessionTitle('');
      setSessionSummary('');
      setSessionDuration('30');
      setIsSessionDialogOpen(false);
    } catch (err) {
      console.error('Failed to add session:', err);
      toast.error('Failed to add session. Please try again.');
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <div className="ml-4 text-lg">Loading therapy data...</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <OfflineIndicator isUsingFallback={isUsingFallbackData} />
      
      <h1 className="text-3xl font-bold mb-6">Therapy Goals & Sessions</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Therapy goals */}
        <div className="lg:col-span-1">
          <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
              <span className="flex items-center">
                <CheckCircle2 className="mr-2 h-5 w-5 text-primary" />
                Your Therapy Goals
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary hover:text-primary/80"
                onClick={() => setIsGoalDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Goal
              </Button>
            </h2>
            {therapyGoals && therapyGoals.length > 0 ? (
              <ul className="space-y-3">
                {therapyGoals.map(goal => (
                  <li key={goal.id} className="p-3 rounded-md bg-secondary/50">
                    <p className="font-medium">{goal.title}</p>
                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                    <div className="mt-2 flex items-center">
                      <div className="flex-1 bg-secondary h-2 rounded-full">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: goal.status === 'completed' ? '100%' : '50%' }} 
                        />
                      </div>
                      <span className="ml-2 text-xs font-medium">
                        {goal.status === 'completed' ? 'Completed' : 'In progress'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No therapy goals found</p>
            )}
          </div>
        </div>
        
        {/* Middle and right columns: Sessions and resources */}
        <div className="lg:col-span-2">
          <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
              <span className="flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-primary" />
                Recent Sessions
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary hover:text-primary/80"
                onClick={() => setIsSessionDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                New Session
              </Button>
            </h2>
            {therapySessions && therapySessions.length > 0 ? (
              <div className="space-y-4">
                {therapySessions.map(session => (
                  <div key={session.id} className="p-4 rounded-md bg-secondary/50">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{session.title}</h3>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(session.date), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="mt-1 text-sm">{session.summary}</p>
                    <div className="mt-2 flex items-center">
                      <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                        {session.duration} minutes
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No therapy sessions found</p>
            )}
          </div>
          
          <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <BookOpen className="mr-2 h-5 w-5 text-primary" />
              Recommended Resources
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-md bg-secondary/50">
                <h3 className="font-medium">Mindfulness Practice</h3>
                <p className="text-sm text-muted-foreground">Daily meditation exercises to reduce anxiety</p>
              </div>
              <div className="p-4 rounded-md bg-secondary/50">
                <h3 className="font-medium">Sleep Improvement</h3>
                <p className="text-sm text-muted-foreground">Techniques for better sleep quality</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add Goal Dialog */}
      <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Therapy Goal</DialogTitle>
            <DialogDescription>
              Create a new therapy goal to track your progress
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="goalTitle">Goal Title</Label>
              <Input 
                id="goalTitle" 
                placeholder="e.g., Reduce Anxiety"
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="goalDescription">Description</Label>
              <Textarea 
                id="goalDescription" 
                placeholder="Describe your goal in more detail..."
                value={goalDescription}
                onChange={(e) => setGoalDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGoalDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddGoal}>
              Add Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Session Dialog */}
      <Dialog open={isSessionDialogOpen} onOpenChange={setIsSessionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Therapy Session</DialogTitle>
            <DialogDescription>
              Record your therapy session
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="sessionTitle">Session Title</Label>
              <Input 
                id="sessionTitle" 
                placeholder="e.g., Anxiety Management"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sessionSummary">Summary</Label>
              <Textarea 
                id="sessionSummary" 
                placeholder="How did this session go?"
                value={sessionSummary}
                onChange={(e) => setSessionSummary(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sessionDuration">Duration (minutes)</Label>
              <Input 
                id="sessionDuration" 
                type="number"
                value={sessionDuration}
                onChange={(e) => setSessionDuration(e.target.value)}
                min={5}
                max={180}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSessionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSession}>
              Add Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 