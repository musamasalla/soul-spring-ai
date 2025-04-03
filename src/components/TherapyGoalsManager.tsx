import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Flag, CalendarDays, Trash2, Edit, CheckCircle2, Plus, Calendar, ArrowUpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { TherapyGoal } from './TherapySessionTracker';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface TherapyGoalsManagerProps {
  userId: string;
  selectedGoalId?: string;
  onGoalUpdate?: (goals: TherapyGoal[]) => void;
  className?: string;
}

export const TherapyGoalsManager: React.FC<TherapyGoalsManagerProps> = ({
  userId,
  selectedGoalId,
  onGoalUpdate,
  className
}) => {
  // Goals state from local storage
  const [goals, setGoals] = useLocalStorage<TherapyGoal[]>(`therapy-goals-${userId}`, []);
  
  // UI state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeGoal, setActiveGoal] = useState<TherapyGoal | null>(null);
  
  // Form state
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDescription, setNewGoalDescription] = useState('');
  const [newGoalProgress, setNewGoalProgress] = useState(0);
  
  // Handle selection of goal from other components
  useEffect(() => {
    if (selectedGoalId) {
      const goal = goals.find(g => g.id === selectedGoalId);
      if (goal) {
        setActiveGoal(goal);
        setIsEditDialogOpen(true);
      }
    }
  }, [selectedGoalId, goals]);
  
  // Create new goal
  const handleCreateGoal = () => {
    if (!newGoalTitle.trim()) return;
    
    const newGoal: TherapyGoal = {
      id: `goal-${Date.now()}`,
      title: newGoalTitle,
      description: newGoalDescription,
      progress: newGoalProgress,
      created: new Date(),
      isCompleted: false,
      sessionIds: []
    };
    
    const updatedGoals = [...goals, newGoal];
    setGoals(updatedGoals);
    
    // Reset form
    setNewGoalTitle('');
    setNewGoalDescription('');
    setNewGoalProgress(0);
    setIsAddDialogOpen(false);
    
    // Notify parent
    if (onGoalUpdate) {
      onGoalUpdate(updatedGoals);
    }
  };
  
  // Update existing goal
  const handleUpdateGoal = () => {
    if (!activeGoal || !newGoalTitle.trim()) return;
    
    const updatedGoal: TherapyGoal = {
      ...activeGoal,
      title: newGoalTitle,
      description: newGoalDescription,
      progress: newGoalProgress,
      isCompleted: newGoalProgress === 100
    };
    
    const updatedGoals = goals.map(g => 
      g.id === activeGoal.id ? updatedGoal : g
    );
    
    setGoals(updatedGoals);
    setIsEditDialogOpen(false);
    setActiveGoal(null);
    
    // Notify parent
    if (onGoalUpdate) {
      onGoalUpdate(updatedGoals);
    }
  };
  
  // Delete a goal
  const handleDeleteGoal = (goalId: string) => {
    const updatedGoals = goals.filter(g => g.id !== goalId);
    setGoals(updatedGoals);
    
    if (activeGoal?.id === goalId) {
      setActiveGoal(null);
      setIsEditDialogOpen(false);
    }
    
    // Notify parent
    if (onGoalUpdate) {
      onGoalUpdate(updatedGoals);
    }
  };
  
  // Set a goal as completed
  const toggleGoalCompletion = (goalId: string) => {
    const updatedGoals = goals.map(g => {
      if (g.id === goalId) {
        const isCompleted = !g.isCompleted;
        return {
          ...g,
          isCompleted,
          progress: isCompleted ? 100 : g.progress
        };
      }
      return g;
    });
    
    setGoals(updatedGoals);
    
    // Update active goal if needed
    if (activeGoal?.id === goalId) {
      const updatedGoal = updatedGoals.find(g => g.id === goalId);
      if (updatedGoal) {
        setActiveGoal(updatedGoal);
      }
    }
    
    // Notify parent
    if (onGoalUpdate) {
      onGoalUpdate(updatedGoals);
    }
  };
  
  // Edit goal
  const handleEditGoal = (goal: TherapyGoal) => {
    setActiveGoal(goal);
    setNewGoalTitle(goal.title);
    setNewGoalDescription(goal.description || '');
    setNewGoalProgress(goal.progress);
    setIsEditDialogOpen(true);
  };
  
  // Prepare to add new goal
  const handleOpenAddDialog = () => {
    setNewGoalTitle('');
    setNewGoalDescription('');
    setNewGoalProgress(0);
    setIsAddDialogOpen(true);
  };
  
  // Sort goals by completion status and creation date
  const sortedGoals = [...goals].sort((a, b) => {
    // Completed goals at the bottom
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1;
    }
    // Higher progress next
    if (a.progress !== b.progress) {
      return b.progress - a.progress;
    }
    // Newest first
    return new Date(b.created).getTime() - new Date(a.created).getTime();
  });
  
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flag className="h-4 w-4 text-primary" />
            Therapy Goals
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleOpenAddDialog}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </CardTitle>
        <CardDescription>
          Track progress toward your mental health objectives
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        {goals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Flag className="h-6 w-6 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No therapy goals defined yet</p>
            <p className="text-xs mt-1">
              Define goals to track your progress
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={handleOpenAddDialog}
            >
              <Plus className="h-4 w-4 mr-1" />
              Create first goal
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-[320px] pr-4">
            <div className="space-y-3">
              {sortedGoals.map(goal => (
                <div 
                  key={goal.id}
                  className={cn(
                    "border rounded-md p-3 transition-all",
                    goal.isCompleted 
                      ? "bg-muted/40 border-muted" 
                      : "hover:border-primary/50"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={cn(
                        "font-medium text-sm flex items-center gap-1",
                        goal.isCompleted && "text-muted-foreground"
                      )}>
                        {goal.title}
                        {goal.isCompleted && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-success ml-1" />
                        )}
                      </h4>
                      
                      {goal.description && (
                        <p className={cn(
                          "text-xs mt-1",
                          goal.isCompleted ? "text-muted-foreground" : "text-foreground/80"
                        )}>
                          {goal.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleEditGoal(goal)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive/70 hover:text-destructive"
                        onClick={() => handleDeleteGoal(goal.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className={goal.isCompleted ? "text-muted-foreground" : ""}>
                          Progress
                        </span>
                        <span className={cn(
                          "font-medium",
                          goal.isCompleted ? "text-success" : ""
                        )}>
                          {goal.progress}%
                        </span>
                      </div>
                      <Progress 
                        value={goal.progress} 
                        className="h-1.5"
                        indicatorClassName={
                          goal.isCompleted ? "bg-success" : 
                          goal.progress > 70 ? "bg-success/80" :
                          goal.progress > 30 ? "bg-primary" : ""
                        }
                      />
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "h-6 px-2 text-xs",
                        goal.isCompleted && "bg-success/10 border-success/20 text-success hover:text-success"
                      )}
                      onClick={() => toggleGoalCompletion(goal.id)}
                    >
                      {goal.isCompleted ? 'Completed' : 'Mark Complete'}
                    </Button>
                  </div>
                  
                  <div className="flex items-center mt-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>Created {format(new Date(goal.created), 'MMM d, yyyy')}</span>
                    
                    {goal.sessionIds.length > 0 && (
                      <Badge variant="outline" className="ml-auto text-xs">
                        {goal.sessionIds.length} session{goal.sessionIds.length !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
      
      <CardFooter className="pt-2 justify-between">
        <div className="text-xs text-muted-foreground">
          {goals.filter(g => g.isCompleted).length}/{goals.length} goals completed
        </div>
        
        {goals.length > 0 && (
          <Button
            variant="link"
            size="sm"
            className="text-xs p-0"
            onClick={handleOpenAddDialog}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add goal
          </Button>
        )}
      </CardFooter>
      
      {/* Add Goal Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create new therapy goal</DialogTitle>
            <DialogDescription>
              Define a new goal to track your progress in therapy
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium">
                Goal title
              </label>
              <Input
                id="title"
                placeholder="e.g., Reduce anxiety in social situations"
                value={newGoalTitle}
                onChange={(e) => setNewGoalTitle(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description (optional)
              </label>
              <Textarea
                id="description"
                placeholder="Describe your goal in more detail"
                value={newGoalDescription}
                onChange={(e) => setNewGoalDescription(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium flex justify-between">
                <span>Initial progress</span>
                <span className="text-muted-foreground">{newGoalProgress}%</span>
              </label>
              <Slider
                value={[newGoalProgress]}
                min={0}
                max={100}
                step={5}
                onValueChange={(value) => setNewGoalProgress(value[0])}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateGoal}>Create goal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Goal Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit therapy goal</DialogTitle>
            <DialogDescription>
              Update your goal details and progress
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="edit-title" className="text-sm font-medium">
                Goal title
              </label>
              <Input
                id="edit-title"
                placeholder="e.g., Reduce anxiety in social situations"
                value={newGoalTitle}
                onChange={(e) => setNewGoalTitle(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="edit-description" className="text-sm font-medium">
                Description (optional)
              </label>
              <Textarea
                id="edit-description"
                placeholder="Describe your goal in more detail"
                value={newGoalDescription}
                onChange={(e) => setNewGoalDescription(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium flex justify-between">
                <span>Current progress</span>
                <span className="text-muted-foreground">{newGoalProgress}%</span>
              </label>
              <Slider
                value={[newGoalProgress]}
                min={0}
                max={100}
                step={5}
                onValueChange={(value) => setNewGoalProgress(value[0])}
              />
            </div>
            
            {activeGoal && (
              <div className="text-xs text-muted-foreground pt-2">
                <Separator className="mb-2" />
                
                <div className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  <span>Created {format(new Date(activeGoal.created), 'MMM d, yyyy')}</span>
                </div>
                
                {activeGoal.sessionIds.length > 0 && (
                  <div className="mt-1">
                    This goal has been addressed in {activeGoal.sessionIds.length} therapy session{activeGoal.sessionIds.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              className="mr-auto"
              onClick={() => activeGoal && handleDeleteGoal(activeGoal.id)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            
            <Button onClick={handleUpdateGoal}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}; 