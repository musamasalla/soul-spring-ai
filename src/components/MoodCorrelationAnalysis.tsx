import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts';
import { AlertCircle, TrendingUp, TrendingDown, Info, ArrowRight, ArrowDownUp, Dumbbell, Brain, SunMedium, Users, Droplet } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Mood values for mapping to numbers
const MOOD_VALUES: Record<string, number> = {
  'very_happy': 5,
  'happy': 4,
  'calm': 3,
  'refreshed': 3,
  'neutral': 2,
  'sleepy': 2,
  'anxious': 1,
  'sad': 0
};

// Mood emojis for display
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

// Activity types for correlation analysis
const ACTIVITY_TYPES = [
  { id: 'sleep_hours', name: 'Sleep Duration', icon: <AlertCircle className="h-4 w-4" /> },
  { id: 'sleep_quality', name: 'Sleep Quality', icon: <AlertCircle className="h-4 w-4" /> },
  { id: 'exercise_minutes', name: 'Exercise', icon: <Dumbbell className="h-4 w-4" /> },
  { id: 'meditation_minutes', name: 'Meditation', icon: <Brain className="h-4 w-4" /> },
  { id: 'outdoor_time_minutes', name: 'Time Outdoors', icon: <SunMedium className="h-4 w-4" /> },
  { id: 'social_interaction', name: 'Social Interaction', icon: <Users className="h-4 w-4" /> },
  { id: 'hydration', name: 'Hydration', icon: <Droplet className="h-4 w-4" /> },
];

// Correlation description thresholds
const CORRELATION_THRESHOLDS = {
  strong_positive: 0.7,
  moderate_positive: 0.4,
  weak_positive: 0.2,
  no_correlation: 0.2,
  weak_negative: -0.4,
  moderate_negative: -0.7,
  strong_negative: -0.7
};

interface MoodEntry {
  id: string;
  user_id: string;
  mood: string;
  notes?: string;
  created_at: string;
  date: string;
  factors?: {
    sleep_hours?: number;
    sleep_quality?: number;
    exercise_minutes?: number;
    meditation_minutes?: number;
    outdoor_time_minutes?: number;
    social_interaction?: number;
    hydration?: number;
    [key: string]: any;
  };
}

interface CorrelationResult {
  factor: string;
  factorName: string;
  correlation: number;
  description: string;
  strength: 'strong' | 'moderate' | 'weak' | 'none';
  direction: 'positive' | 'negative' | 'neutral';
  dataPoints: number;
}

interface MoodCorrelationAnalysisProps {
  userId?: string;
}

const MoodCorrelationAnalysis: React.FC<MoodCorrelationAnalysisProps> = ({ userId }) => {
  // State for mood entries and analysis
  const [isLoading, setIsLoading] = useState(true);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedActivity, setSelectedActivity] = useState<string>('sleep_hours');
  const [correlationResults, setCorrelationResults] = useState<CorrelationResult[]>([]);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [minEntries, setMinEntries] = useState(3);
  const [selectedFactors, setSelectedFactors] = useState<string[]>(ACTIVITY_TYPES.map(a => a.id));
  const chartRef = useRef<HTMLDivElement>(null);

  // Fetch mood entries from Supabase
  useEffect(() => {
    if (!userId) return;

    const fetchMoodEntries = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('mood_entries')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const entries = data as MoodEntry[] || [];
        setMoodEntries(entries);
        
        // Only analyze if we have enough entries
        if (entries.length >= minEntries) {
          calculateCorrelations(entries);
          prepareActivityData(entries, selectedActivity);
        }
      } catch (error) {
        console.error('Error fetching mood entries:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMoodEntries();
  }, [userId, minEntries]);

  // When selected activity changes, prepare data for visualization
  useEffect(() => {
    if (moodEntries.length > 0) {
      prepareActivityData(moodEntries, selectedActivity);
    }
  }, [selectedActivity, moodEntries]);
  
  // When selected factors change, recalculate correlations
  useEffect(() => {
    if (moodEntries.length >= minEntries) {
      calculateCorrelations(moodEntries);
    }
  }, [selectedFactors, moodEntries, minEntries]);

  // Calculate correlations between mood and factors
  const calculateCorrelations = (entries: MoodEntry[]) => {
    // Filter entries that have factors
    const entriesWithFactors = entries.filter(entry => entry.factors && Object.keys(entry.factors).length > 0);
    
    if (entriesWithFactors.length < minEntries) {
      setCorrelationResults([]);
      return;
    }

    const results: CorrelationResult[] = [];

    // Process only selected factors
    ACTIVITY_TYPES.filter(type => selectedFactors.includes(type.id)).forEach(activityType => {
      const factorId = activityType.id;
      const factorName = activityType.name;
      
      // Get entries that have this factor
      const relevantEntries = entriesWithFactors.filter(
        entry => entry.factors && entry.factors[factorId] !== undefined && entry.factors[factorId] !== null
      );
      
      if (relevantEntries.length < minEntries) {
        // Skip factors with too few data points
        return;
      }

      // Extract mood values and factor values
      const moodValues = relevantEntries.map(entry => MOOD_VALUES[entry.mood] || 0);
      const factorValues = relevantEntries.map(entry => entry.factors ? entry.factors[factorId] || 0 : 0);
      
      // Calculate Pearson correlation
      const correlation = calculatePearsonCorrelation(moodValues, factorValues);
      
      // Create description
      const { description, strength, direction } = generateCorrelationDescription(correlation, factorName);
      
      results.push({
        factor: factorId,
        factorName,
        correlation,
        description,
        strength,
        direction,
        dataPoints: relevantEntries.length
      });
    });
    
    // Sort by absolute correlation value (strongest first)
    results.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
    
    setCorrelationResults(results);
  };

  // Prepare data for visualization
  const prepareActivityData = (entries: MoodEntry[], activityKey: string) => {
    const relevantEntries = entries.filter(
      entry => entry.factors && entry.factors[activityKey] !== undefined && entry.factors[activityKey] !== null
    );
    
    if (relevantEntries.length < minEntries) {
      setActivityData([]);
      return;
    }

    // Create data for charts
    const data = relevantEntries.map(entry => ({
      date: new Date(entry.created_at).toISOString().split('T')[0],
      time: new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mood: MOOD_VALUES[entry.mood] || 0,
      moodLabel: MOOD_LABELS[entry.mood] || entry.mood,
      moodEmoji: MOOD_EMOJIS[entry.mood] || '',
      [activityKey]: entry.factors ? entry.factors[activityKey] || 0 : 0,
      notes: entry.notes || ''
    }));
    
    // Sort by date (oldest first for time series)
    data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    setActivityData(data);
  };

  // Calculate Pearson correlation coefficient
  const calculatePearsonCorrelation = (x: number[], y: number[]): number => {
    const n = x.length;
    if (n === 0) return 0;
    
    // Calculate means
    const meanX = x.reduce((sum, val) => sum + val, 0) / n;
    const meanY = y.reduce((sum, val) => sum + val, 0) / n;
    
    // Calculate covariance and standard deviations
    let covar = 0;
    let sdX = 0;
    let sdY = 0;
    
    for (let i = 0; i < n; i++) {
      const devX = x[i] - meanX;
      const devY = y[i] - meanY;
      covar += devX * devY;
      sdX += devX * devX;
      sdY += devY * devY;
    }
    
    // If no variance in either variable, correlation is undefined (return 0)
    if (sdX === 0 || sdY === 0) return 0;
    
    const correlation = covar / (Math.sqrt(sdX) * Math.sqrt(sdY));
    
    // Ensure the value is in the range [-1, 1]
    return Math.max(-1, Math.min(1, correlation));
  };

  // Generate user-friendly description of correlation
  const generateCorrelationDescription = (
    correlation: number, 
    factorName: string
  ): { description: string; strength: 'strong' | 'moderate' | 'weak' | 'none'; direction: 'positive' | 'negative' | 'neutral' } => {
    const absCorrelation = Math.abs(correlation);
    let description = '';
    let strength: 'strong' | 'moderate' | 'weak' | 'none' = 'none';
    let direction: 'positive' | 'negative' | 'neutral' = 'neutral';
    
    if (correlation >= CORRELATION_THRESHOLDS.strong_positive) {
      description = `Strong positive relationship: Higher ${factorName.toLowerCase()} is strongly associated with better mood.`;
      strength = 'strong';
      direction = 'positive';
    } else if (correlation >= CORRELATION_THRESHOLDS.moderate_positive) {
      description = `Moderate positive relationship: Higher ${factorName.toLowerCase()} tends to be associated with better mood.`;
      strength = 'moderate';
      direction = 'positive';
    } else if (correlation >= CORRELATION_THRESHOLDS.weak_positive) {
      description = `Weak positive relationship: Higher ${factorName.toLowerCase()} may be slightly associated with better mood.`;
      strength = 'weak';
      direction = 'positive';
    } else if (correlation <= CORRELATION_THRESHOLDS.strong_negative) {
      description = `Strong negative relationship: Higher ${factorName.toLowerCase()} is strongly associated with worse mood.`;
      strength = 'strong';
      direction = 'negative';
    } else if (correlation <= CORRELATION_THRESHOLDS.moderate_negative) {
      description = `Moderate negative relationship: Higher ${factorName.toLowerCase()} tends to be associated with worse mood.`;
      strength = 'moderate';
      direction = 'negative';
    } else if (correlation <= CORRELATION_THRESHOLDS.weak_negative) {
      description = `Weak negative relationship: Higher ${factorName.toLowerCase()} may be slightly associated with worse mood.`;
      strength = 'weak';
      direction = 'negative';
    } else {
      description = `No clear relationship between ${factorName.toLowerCase()} and your mood.`;
      strength = 'none';
      direction = 'neutral';
    }
    
    return { description, strength, direction };
  };

  // Custom tooltip for correlation charts
  const renderCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <Card className="p-2 bg-background border shadow-sm">
          <div className="text-sm font-medium">
            {data.date} {data.time}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span>{data.moodEmoji}</span>
            <span>{data.moodLabel}</span>
          </div>
          <div className="text-xs mt-1">
            {ACTIVITY_TYPES.find(a => a.id === selectedActivity)?.name}: {data[selectedActivity]}
          </div>
          {data.notes && (
            <div className="text-xs mt-1 max-w-[200px] text-muted-foreground">
              "{data.notes.substring(0, 50)}{data.notes.length > 50 ? "..." : ""}"
            </div>
          )}
        </Card>
      );
    }
    
    return null;
  };

  // Toggle a factor in the selected factors list
  const toggleFactor = (factorId: string) => {
    setSelectedFactors(prev => {
      if (prev.includes(factorId)) {
        return prev.filter(id => id !== factorId);
      } else {
        return [...prev, factorId];
      }
    });
  };

  const getBadgeColorForCorrelation = (correlation: number) => {
    const absCorrelation = Math.abs(correlation);
    if (absCorrelation >= 0.7) return "bg-primary text-primary-foreground";
    if (absCorrelation >= 0.4) return "bg-primary/60 text-primary-foreground";
    if (absCorrelation >= 0.2) return "bg-primary/30 text-foreground";
    return "bg-muted text-muted-foreground";
  };

  const getCorrelationIcon = (correlation: number) => {
    if (correlation >= 0.2) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (correlation <= -0.2) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <ArrowRight className="h-4 w-4 text-muted-foreground" />;
  };

  // Handle keyboard navigation for visualization
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>, index: number, results: CorrelationResult[]) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = Math.min(index + 1, results.length - 1);
      const nextCard = document.getElementById(`correlation-card-${results[nextIndex].factor}`);
      nextCard?.focus();
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = Math.max(index - 1, 0);
      const prevCard = document.getElementById(`correlation-card-${results[prevIndex].factor}`);
      prevCard?.focus();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Mood Correlation Analysis</CardTitle>
          <CardDescription>
            Discover how different activities and factors affect your mood over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-40 flex items-center justify-center" aria-live="polite" aria-busy="true">
              <div className="animate-pulse text-primary">Analyzing your mood data...</div>
            </div>
          ) : moodEntries.length < minEntries ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Not enough data for analysis</AlertTitle>
              <AlertDescription>
                Track your mood and activities for at least {minEntries} days to see correlations. Currently have {moodEntries.length} entries.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2" aria-label="Correlation analysis views">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="mt-4">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2" id="key-insights-heading">Key Insights</h3>
                      {correlationResults.length === 0 ? (
                        <p className="text-muted-foreground">
                          Not enough data with factors to analyze correlations. Try tracking more activities with your mood.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="region" aria-labelledby="key-insights-heading">
                          {correlationResults.slice(0, 6).map((result, index) => (
                            <Card 
                              key={result.factor} 
                              className="overflow-hidden"
                              id={`correlation-card-${result.factor}`}
                              tabIndex={0}
                              onKeyDown={(e) => handleKeyDown(e, index, correlationResults.slice(0, 6))}
                              role="article"
                              aria-label={`Correlation for ${result.factorName}: ${result.description}`}
                            >
                              <div 
                                className={`h-1 ${result.direction === 'positive' 
                                  ? 'bg-green-500' 
                                  : result.direction === 'negative' 
                                    ? 'bg-red-500' 
                                    : 'bg-gray-300'}`}
                                aria-hidden="true"
                              ></div>
                              <CardContent className="p-4">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <h4 className="font-medium">{result.factorName}</h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {result.dataPoints} data points
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {getCorrelationIcon(result.correlation)}
                                    <Badge className={getBadgeColorForCorrelation(result.correlation)} aria-label={`Correlation value: ${Math.abs(result.correlation).toFixed(2)}`}>
                                      {Math.abs(result.correlation).toFixed(2)}
                                    </Badge>
                                  </div>
                                </div>
                                <p className="text-sm mt-3">
                                  {result.description}
                                </p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {correlationResults.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium mb-4" id="correlation-strengths-heading">Correlation Strengths</h3>
                        <div ref={chartRef} aria-labelledby="correlation-strengths-heading" role="img" aria-label="Bar chart showing correlation strengths between different factors and mood">
                          <ResponsiveContainer width="100%" height={250}>
                            <BarChart
                              data={correlationResults.map(r => ({
                                name: r.factorName,
                                value: r.correlation,
                                fill: r.correlation > 0 ? '#4ade80' : '#f87171'
                              }))}
                              layout="vertical"
                              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis 
                                type="number" 
                                domain={[-1, 1]} 
                                ticks={[-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1]} 
                              />
                              <YAxis dataKey="name" type="category" width={90} />
                              <Tooltip />
                              <Bar dataKey="value" fill="#8884d8" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="detailed" className="mt-4">
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                      <div className="w-full md:w-1/3">
                        <Label htmlFor="factor-select" className="mb-2 block">Select factor to analyze:</Label>
                        <Select
                          value={selectedActivity}
                          onValueChange={(value) => setSelectedActivity(value)}
                          aria-label="Select a factor to analyze"
                        >
                          <SelectTrigger id="factor-select">
                            <SelectValue placeholder="Select a factor" />
                          </SelectTrigger>
                          <SelectContent>
                            {ACTIVITY_TYPES.map((activity) => (
                              <SelectItem key={activity.id} value={activity.id}>
                                <div className="flex items-center gap-2">
                                  {activity.icon}
                                  <span>{activity.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="w-full md:w-1/3">
                        <Label htmlFor="min-entries-slider" className="mb-2 block">Minimum entries for analysis:</Label>
                        <div className="flex items-center gap-2">
                          <Slider
                            id="min-entries-slider"
                            value={[minEntries]}
                            min={3}
                            max={20}
                            step={1}
                            onValueChange={(value) => setMinEntries(value[0])}
                            className="flex-1"
                            aria-valuemin={3}
                            aria-valuemax={20}
                            aria-valuenow={minEntries}
                            aria-valuetext={`${minEntries} entries minimum`}
                          />
                          <span className="w-8 text-center">{minEntries}</span>
                        </div>
                      </div>
                      
                      <div className="w-full md:w-1/3">
                        <div className="flex items-center justify-between">
                          <Label className="mb-2 block" id="factors-group-label">Factors to include:</Label>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setSelectedFactors(ACTIVITY_TYPES.map(a => a.id))}
                            aria-label="Select all factors"
                          >
                            Select All
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2" role="group" aria-labelledby="factors-group-label">
                          {ACTIVITY_TYPES.map((activity) => (
                            <div key={activity.id} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`factor-${activity.id}`} 
                                checked={selectedFactors.includes(activity.id)}
                                onCheckedChange={() => toggleFactor(activity.id)}
                                aria-label={`Include ${activity.name} in analysis`}
                              />
                              <Label htmlFor={`factor-${activity.id}`} className="text-sm">
                                {activity.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {activityData.length > 0 ? (
                      <>
                        <div>
                          <h3 className="text-lg font-medium mb-4" id="time-chart-heading">
                            {ACTIVITY_TYPES.find(a => a.id === selectedActivity)?.name} & Mood Over Time
                          </h3>
                          <div role="img" aria-labelledby="time-chart-heading">
                            <ResponsiveContainer width="100%" height={300}>
                              <LineChart data={activityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis yAxisId="left" orientation="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip content={renderCustomTooltip} />
                                <Legend />
                                <Line 
                                  yAxisId="left"
                                  type="monotone" 
                                  dataKey="mood" 
                                  name="Mood Level" 
                                  stroke="#8884d8" 
                                  activeDot={{ r: 8 }} 
                                />
                                <Line 
                                  yAxisId="right"
                                  type="monotone" 
                                  dataKey={selectedActivity} 
                                  name={ACTIVITY_TYPES.find(a => a.id === selectedActivity)?.name || selectedActivity} 
                                  stroke="#82ca9d" 
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-medium mb-4" id="scatter-plot-heading">Correlation Scatter Plot</h3>
                          <div role="img" aria-labelledby="scatter-plot-heading">
                            <ResponsiveContainer width="100%" height={300}>
                              <ScatterChart margin={{ top: 20, right: 20, bottom: 10, left: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                  dataKey={selectedActivity} 
                                  name={ACTIVITY_TYPES.find(a => a.id === selectedActivity)?.name || selectedActivity}
                                  type="number" 
                                />
                                <YAxis dataKey="mood" name="Mood Level" />
                                <ZAxis range={[60, 60]} />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={renderCustomTooltip} />
                                <Scatter
                                  name="Correlation" 
                                  data={activityData} 
                                  fill="#8884d8"
                                />
                              </ScatterChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                        
                        {correlationResults.find(r => r.factor === selectedActivity) && (
                          <Alert className={
                            correlationResults.find(r => r.factor === selectedActivity)?.direction === 'positive'
                              ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900'
                              : correlationResults.find(r => r.factor === selectedActivity)?.direction === 'negative'
                                ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900'
                                : ''
                          }>
                            <Info className="h-4 w-4" />
                            <AlertTitle className="flex items-center gap-2">
                              Analysis Result
                              <Badge className={getBadgeColorForCorrelation(
                                correlationResults.find(r => r.factor === selectedActivity)?.correlation || 0
                              )}>
                                Correlation: {
                                  correlationResults.find(r => r.factor === selectedActivity)?.correlation.toFixed(2) || 0
                                }
                              </Badge>
                            </AlertTitle>
                            <AlertDescription>
                              {correlationResults.find(r => r.factor === selectedActivity)?.description}
                            </AlertDescription>
                          </Alert>
                        )}
                      </>
                    ) : (
                      <div className="h-40 flex items-center justify-center" aria-live="polite">
                        <p className="text-muted-foreground">
                          Not enough data for {ACTIVITY_TYPES.find(a => a.id === selectedActivity)?.name.toLowerCase() || selectedActivity}.
                          Try tracking this factor with your mood.
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="mt-6 text-xs text-muted-foreground">
                <p className="flex items-center gap-1">
                  <Info className="h-3 w-3" aria-hidden="true" />
                  Correlation measures the statistical relationship between two variables (-1 to 1)
                </p>
                <p className="flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" aria-hidden="true" />
                  Remember that correlation does not imply causation
                </p>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {moodEntries.length} total mood entries analyzed
          </span>
          {correlationResults.length > 0 && (
            <Badge variant="outline" className="font-normal">
              {correlationResults.length} correlations found
            </Badge>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default MoodCorrelationAnalysis; 