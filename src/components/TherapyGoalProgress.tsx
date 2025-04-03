import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle, Clock, Target } from 'lucide-react';
import { TherapyGoal } from '@/types/therapy';

interface GoalProgressProps {
  goal: TherapyGoal;
  sessionCount: number;
}

export function TherapyGoalProgress({ goal, sessionCount }: GoalProgressProps) {
  // Calculate days since goal creation
  const daysSinceCreation = Math.floor(
    (new Date().getTime() - new Date(goal.created_at).getTime()) / 
    (1000 * 60 * 60 * 24)
  );
  
  // Determine progress percentage (based on status or connected sessions)
  const getProgressPercentage = () => {
    if (goal.status === 'completed') return 100;
    if (sessionCount === 0) return 5; // Just started
    return Math.min(100, sessionCount * 15); // 15% per session, max 100%
  };
  
  // Get badge color based on status
  const getBadgeVariant = () => {
    switch (goal.status) {
      case 'completed': return 'success';
      case 'in_progress': return 'secondary';
      case 'not_started': return 'outline';
      default: return 'secondary';
    }
  };
  
  // Format status for display
  const formatStatus = (status: string) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Estimated completion date (rough estimate: 7 days per 20% progress)
  const estimatedCompletionDays = goal.status === 'completed' 
    ? 0 
    : Math.max(1, Math.ceil((100 - getProgressPercentage()) / 20) * 7);
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{goal.title}</CardTitle>
            <CardDescription className="mt-1">{goal.description}</CardDescription>
          </div>
          <Badge variant={getBadgeVariant() as any}>{formatStatus(goal.status)}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Progress value={getProgressPercentage()} className="h-2 w-full" />
          
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{daysSinceCreation} days ago</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              <span>{sessionCount} sessions</span>
            </div>
            
            {goal.status !== 'completed' && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>~{estimatedCompletionDays} days remaining</span>
              </div>
            )}
            
            {goal.status === 'completed' && (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Completed!</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 