import React, { useState, useRef, KeyboardEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Moon, Dumbbell, Brain, SunMedium, Users, Droplet, Bed, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SleepActivityTrackerProps {
  userId?: string;
  onTrackingComplete?: () => void;
  compact?: boolean;
}

export default function SleepActivityTracker({ userId, onTrackingComplete, compact = false }: SleepActivityTrackerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const activeUserId = userId || user?.id;
  
  // Sleep tracking state
  const [activeTab, setActiveTab] = useState('sleep');
  const [sleepHours, setSleepHours] = useState(7);
  const [sleepQuality, setSleepQuality] = useState(3);
  const [isSleepSubmitting, setIsSleepSubmitting] = useState(false);
  
  // Activity tracking state
  const [exerciseMinutes, setExerciseMinutes] = useState(30);
  const [meditationMinutes, setMeditationMinutes] = useState(15);
  const [outdoorTimeMinutes, setOutdoorTimeMinutes] = useState(30);
  const [socialInteraction, setSocialInteraction] = useState(3);
  const [hydration, setHydration] = useState(3);
  const [isActivitySubmitting, setIsActivitySubmitting] = useState(false);
  
  // Refs for focus management
  const sleepSubmitRef = useRef<HTMLButtonElement>(null);
  const activitySubmitRef = useRef<HTMLButtonElement>(null);
  
  // Handle keyboard navigation for slider inputs
  const handleSliderKeyDown = (e: KeyboardEvent<HTMLDivElement>, currentValue: number, min: number, max: number, step: number, setValue: (value: number) => void) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      const newValue = Math.min(currentValue + step, max);
      setValue(newValue);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      const newValue = Math.max(currentValue - step, min);
      setValue(newValue);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setValue(min);
    } else if (e.key === 'End') {
      e.preventDefault();
      setValue(max);
    }
  };
  
  // Handle sleep tracking submission
  const handleSleepSubmit = async () => {
    if (!activeUserId) {
      toast({
        title: "Authentication Required",
        description: "Please log in to track sleep data.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSleepSubmitting(true);
    
    try {
      // Get the user's latest mood entry to add sleep data
      const { data: latestMoodEntries, error: fetchError } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', activeUserId)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (fetchError) throw fetchError;
      
      if (!latestMoodEntries || latestMoodEntries.length === 0) {
        toast({
          title: "No mood entries found",
          description: "Please record your mood first before adding sleep data.",
          variant: "destructive"
        });
        return;
      }
      
      const latestMood = latestMoodEntries[0];
      
      // Prepare the factors object with sleep data
      let factors: Record<string, any> = {};
      
      // Handle the case where factors is already an object, a JSON string, or undefined
      if (latestMood.factors) {
        if (typeof latestMood.factors === 'string') {
          try {
            factors = JSON.parse(latestMood.factors);
          } catch (e) {
            factors = {};
          }
        } else {
          factors = latestMood.factors as Record<string, any>;
        }
      }
      
      // Add sleep data to factors
      factors.sleep_hours = sleepHours;
      factors.sleep_quality = sleepQuality;
      
      // Update the mood entry with sleep data
      const { error: updateError } = await supabase
        .from('mood_entries')
        .update({ factors })
        .eq('id', latestMood.id);
      
      if (updateError) throw updateError;
      
      toast({
        title: "Sleep data tracked",
        description: `Recorded ${sleepHours} hours of sleep with a quality rating of ${sleepQuality}/5.`,
      });
      
      // Reset form if not in compact mode
      if (!compact) {
        setSleepHours(7);
        setSleepQuality(3);
      }
      
      // Notify parent component
      if (onTrackingComplete) {
        onTrackingComplete();
      }
      
    } catch (error) {
      console.error('Error tracking sleep:', error);
      toast({
        title: "Error tracking sleep",
        description: "There was an error saving your sleep data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSleepSubmitting(false);
    }
  };
  
  // Handle activity tracking submission
  const handleActivitySubmit = async () => {
    if (!activeUserId) {
      toast({
        title: "Authentication Required",
        description: "Please log in to track activity data.",
        variant: "destructive"
      });
      return;
    }
    
    setIsActivitySubmitting(true);
    
    try {
      // Get the user's latest mood entry to add activity data
      const { data: latestMoodEntries, error: fetchError } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', activeUserId)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (fetchError) throw fetchError;
      
      if (!latestMoodEntries || latestMoodEntries.length === 0) {
        toast({
          title: "No mood entries found",
          description: "Please record your mood first before adding activity data.",
          variant: "destructive"
        });
        return;
      }
      
      const latestMood = latestMoodEntries[0];
      
      // Prepare the factors object with activity data
      let factors: Record<string, any> = {};
      
      // Handle the case where factors is already an object, a JSON string, or undefined
      if (latestMood.factors) {
        if (typeof latestMood.factors === 'string') {
          try {
            factors = JSON.parse(latestMood.factors);
          } catch (e) {
            factors = {};
          }
        } else {
          factors = latestMood.factors as Record<string, any>;
        }
      }
      
      // Add activity data to factors
      factors.exercise_minutes = exerciseMinutes;
      factors.meditation_minutes = meditationMinutes;
      factors.outdoor_time_minutes = outdoorTimeMinutes;
      factors.social_interaction = socialInteraction;
      factors.hydration = hydration;
      
      // Update the mood entry with activity data
      const { error: updateError } = await supabase
        .from('mood_entries')
        .update({ factors })
        .eq('id', latestMood.id);
      
      if (updateError) throw updateError;
      
      toast({
        title: "Activity data tracked",
        description: `Recorded exercise (${exerciseMinutes} min), meditation (${meditationMinutes} min), and other activities.`,
      });
      
      // Reset form if not in compact mode
      if (!compact) {
        setExerciseMinutes(30);
        setMeditationMinutes(15);
        setOutdoorTimeMinutes(30);
        setSocialInteraction(3);
        setHydration(3);
      }
      
      // Notify parent component
      if (onTrackingComplete) {
        onTrackingComplete();
      }
      
    } catch (error) {
      console.error('Error tracking activity:', error);
      toast({
        title: "Error tracking activity",
        description: "There was an error saving your activity data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsActivitySubmitting(false);
    }
  };
  
  // Format sleep quality for display
  const formatSleepQuality = (quality: number) => {
    switch (quality) {
      case 1: return "Poor";
      case 2: return "Fair";
      case 3: return "Average";
      case 4: return "Good";
      case 5: return "Excellent";
      default: return "Average";
    }
  };
  
  // Format social interaction for display
  const formatSocialInteraction = (level: number) => {
    switch (level) {
      case 1: return "Minimal";
      case 2: return "Low";
      case 3: return "Moderate";
      case 4: return "High";
      case 5: return "Very High";
      default: return "Moderate";
    }
  };
  
  // Format hydration level for display
  const formatHydration = (level: number) => {
    switch (level) {
      case 1: return "Dehydrated";
      case 2: return "Slightly Dehydrated";
      case 3: return "Adequately Hydrated";
      case 4: return "Well Hydrated";
      case 5: return "Optimally Hydrated";
      default: return "Adequately Hydrated";
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          {activeTab === 'sleep' ? (
            <Moon className="h-5 w-5 text-primary" aria-hidden="true" />
          ) : (
            <Dumbbell className="h-5 w-5 text-primary" aria-hidden="true" />
          )}
          Track Lifestyle Factors
        </CardTitle>
        <CardDescription>
          Record your sleep and activities to identify patterns affecting your mood
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} aria-label="Lifestyle tracking options">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sleep" className="flex items-center gap-2">
              <Bed className="h-4 w-4" aria-hidden="true" />
              <span>Sleep</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4" aria-hidden="true" />
              <span>Activities</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="sleep" className="mt-4 space-y-4">
            <div className="space-y-4" role="form" aria-label="Sleep tracking form">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="sleep-hours-slider">Sleep Duration (hours)</Label>
                  <Badge variant="outline" className="font-normal">
                    {sleepHours} hours
                  </Badge>
                </div>
                <div 
                  role="slider" 
                  tabIndex={0} 
                  aria-label="Sleep hours" 
                  aria-valuemin={0} 
                  aria-valuemax={12} 
                  aria-valuenow={sleepHours} 
                  aria-valuetext={`${sleepHours} hours of sleep`}
                  onKeyDown={(e) => handleSliderKeyDown(e, sleepHours, 0, 12, 0.5, setSleepHours)}
                >
                  <Slider
                    id="sleep-hours-slider"
                    min={0}
                    max={12}
                    step={0.5}
                    value={[sleepHours]}
                    onValueChange={(value) => setSleepHours(value[0])}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="sleep-quality-slider">Sleep Quality</Label>
                  <Badge variant="outline" className="font-normal">
                    {formatSleepQuality(sleepQuality)}
                  </Badge>
                </div>
                <div 
                  role="slider" 
                  tabIndex={0} 
                  aria-label="Sleep quality" 
                  aria-valuemin={1} 
                  aria-valuemax={5} 
                  aria-valuenow={sleepQuality} 
                  aria-valuetext={formatSleepQuality(sleepQuality)}
                  onKeyDown={(e) => handleSliderKeyDown(e, sleepQuality, 1, 5, 1, setSleepQuality)}
                >
                  <Slider
                    id="sleep-quality-slider"
                    min={1}
                    max={5}
                    step={1}
                    value={[sleepQuality]}
                    onValueChange={(value) => setSleepQuality(value[0])}
                  />
                </div>
              </div>
            </div>
            
            <Button 
              ref={sleepSubmitRef}
              onClick={handleSleepSubmit} 
              disabled={isSleepSubmitting || !activeUserId}
              className="w-full mt-4"
              aria-busy={isSleepSubmitting}
            >
              {isSleepSubmitting ? 'Saving...' : 'Track Sleep'}
            </Button>
          </TabsContent>
          
          <TabsContent value="activity" className="mt-4 space-y-4">
            <div className="space-y-4" role="form" aria-label="Activity tracking form">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="exercise-minutes-slider">Exercise (minutes)</Label>
                  <Badge variant="outline" className="font-normal">
                    {exerciseMinutes} min
                  </Badge>
                </div>
                <div 
                  role="slider" 
                  tabIndex={0} 
                  aria-label="Exercise minutes" 
                  aria-valuemin={0} 
                  aria-valuemax={120} 
                  aria-valuenow={exerciseMinutes} 
                  aria-valuetext={`${exerciseMinutes} minutes of exercise`}
                  onKeyDown={(e) => handleSliderKeyDown(e, exerciseMinutes, 0, 120, 5, setExerciseMinutes)}
                >
                  <Slider
                    id="exercise-minutes-slider"
                    min={0}
                    max={120}
                    step={5}
                    value={[exerciseMinutes]}
                    onValueChange={(value) => setExerciseMinutes(value[0])}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="meditation-minutes-slider">Meditation (minutes)</Label>
                  <Badge variant="outline" className="font-normal">
                    {meditationMinutes} min
                  </Badge>
                </div>
                <div 
                  role="slider" 
                  tabIndex={0} 
                  aria-label="Meditation minutes" 
                  aria-valuemin={0} 
                  aria-valuemax={60} 
                  aria-valuenow={meditationMinutes} 
                  aria-valuetext={`${meditationMinutes} minutes of meditation`}
                  onKeyDown={(e) => handleSliderKeyDown(e, meditationMinutes, 0, 60, 5, setMeditationMinutes)}
                >
                  <Slider
                    id="meditation-minutes-slider"
                    min={0}
                    max={60}
                    step={5}
                    value={[meditationMinutes]}
                    onValueChange={(value) => setMeditationMinutes(value[0])}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="outdoor-time-slider">Time Outdoors (minutes)</Label>
                  <Badge variant="outline" className="font-normal">
                    {outdoorTimeMinutes} min
                  </Badge>
                </div>
                <div 
                  role="slider" 
                  tabIndex={0} 
                  aria-label="Outdoor time minutes" 
                  aria-valuemin={0} 
                  aria-valuemax={180} 
                  aria-valuenow={outdoorTimeMinutes} 
                  aria-valuetext={`${outdoorTimeMinutes} minutes of outdoor time`}
                  onKeyDown={(e) => handleSliderKeyDown(e, outdoorTimeMinutes, 0, 180, 10, setOutdoorTimeMinutes)}
                >
                  <Slider
                    id="outdoor-time-slider"
                    min={0}
                    max={180}
                    step={10}
                    value={[outdoorTimeMinutes]}
                    onValueChange={(value) => setOutdoorTimeMinutes(value[0])}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="social-interaction-slider">Social Interaction</Label>
                  <Badge variant="outline" className="font-normal">
                    {formatSocialInteraction(socialInteraction)}
                  </Badge>
                </div>
                <div 
                  role="slider" 
                  tabIndex={0} 
                  aria-label="Social interaction level" 
                  aria-valuemin={1} 
                  aria-valuemax={5} 
                  aria-valuenow={socialInteraction} 
                  aria-valuetext={formatSocialInteraction(socialInteraction)}
                  onKeyDown={(e) => handleSliderKeyDown(e, socialInteraction, 1, 5, 1, setSocialInteraction)}
                >
                  <Slider
                    id="social-interaction-slider"
                    min={1}
                    max={5}
                    step={1}
                    value={[socialInteraction]}
                    onValueChange={(value) => setSocialInteraction(value[0])}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="hydration-level-slider">Hydration Level</Label>
                  <Badge variant="outline" className="font-normal">
                    {formatHydration(hydration)}
                  </Badge>
                </div>
                <div 
                  role="slider" 
                  tabIndex={0} 
                  aria-label="Hydration level" 
                  aria-valuemin={1} 
                  aria-valuemax={5} 
                  aria-valuenow={hydration} 
                  aria-valuetext={formatHydration(hydration)}
                  onKeyDown={(e) => handleSliderKeyDown(e, hydration, 1, 5, 1, setHydration)}
                >
                  <Slider
                    id="hydration-level-slider"
                    min={1}
                    max={5}
                    step={1}
                    value={[hydration]}
                    onValueChange={(value) => setHydration(value[0])}
                  />
                </div>
              </div>
            </div>
            
            <Button 
              ref={activitySubmitRef}
              onClick={handleActivitySubmit} 
              disabled={isActivitySubmitting || !activeUserId}
              className="w-full mt-4"
              aria-busy={isActivitySubmitting}
            >
              {isActivitySubmitting ? 'Saving...' : 'Track Activities'}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" aria-hidden="true" />
          <span>Data is saved to your most recent mood entry</span>
        </div>
      </CardFooter>
    </Card>
  );
} 