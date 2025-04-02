import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Info, Smile, ChevronLeft, ChevronRight, Calendar, TrendingUp, TrendingDown, HeartPulse, BarChart2 } from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from './ui/badge';

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

interface MoodEntry {
  id: string;
  mood: string;
  created_at: string;
  date: string;
  notes?: string;
  factors?: any;
}

interface MoodHistoryChartProps {
  userId: string;
  compact?: boolean;
  height?: number;
}

export default function MoodHistoryChart({ userId, compact = false, height = 300 }: MoodHistoryChartProps) {
  const [moodData, setMoodData] = useState<MoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedTab, setSelectedTab] = useState('line');
  const [trendInfo, setTrendInfo] = useState<{direction: 'up' | 'down' | 'stable', percentage: number} | null>(null);

  // Format data for charts
  const formatChartData = (entries: MoodEntry[]) => {
    // For daily view, create data points for each day
    if (timeRange === 'week') {
      const weekStart = currentWeekStart;
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
      
      return days.map(day => {
        const dayEntries = entries.filter(entry => {
          const entryDate = new Date(entry.created_at);
          return isSameDay(entryDate, day);
        });
        
        // Calculate average mood for the day if there are entries
        const avgMood = dayEntries.length 
          ? dayEntries.reduce((sum, entry) => sum + (MOOD_VALUES[entry.mood] || 0), 0) / dayEntries.length
          : null;
        
        return {
          date: format(day, 'EEE'),
          fullDate: format(day, 'yyyy-MM-dd'),
          value: avgMood,
          count: dayEntries.length
        };
      });
    }
    
    // For month view, aggregate by week
    if (timeRange === 'month') {
      // Group by week
      const now = new Date();
      const fourWeeksAgo = subDays(now, 28);
      const weeks = [3, 2, 1, 0].map(weeksAgo => {
        const weekStart = subDays(now, weeksAgo * 7 + 7);
        const weekEnd = subDays(now, weeksAgo * 7);
        
        const weekEntries = entries.filter(entry => {
          const entryDate = new Date(entry.created_at);
          return entryDate >= weekStart && entryDate <= weekEnd;
        });
        
        const avgMood = weekEntries.length
          ? weekEntries.reduce((sum, entry) => sum + (MOOD_VALUES[entry.mood] || 0), 0) / weekEntries.length
          : null;
          
        return {
          date: `Week ${4-weeksAgo}`,
          fullDate: `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`,
          value: avgMood,
          count: weekEntries.length
        };
      });
      
      return weeks;
    }
    
    return [];
  };
  
  // Load mood history data
  useEffect(() => {
    const loadMoodHistory = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      try {
        // Calculate date range based on selected time range
        let startDate;
        if (timeRange === 'week') {
          startDate = currentWeekStart;
        } else if (timeRange === 'month') {
          startDate = subDays(new Date(), 30);
        }
                
        const { data, error } = await supabase
          .from('mood_entries')
          .select('*')
          .eq('user_id', userId)
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        
        setMoodData(data || []);
        
        // Calculate trend
        if (data && data.length > 1) {
          // Split data into two halves
          const halfwayPoint = Math.floor(data.length / 2);
          const firstHalf = data.slice(0, halfwayPoint);
          const secondHalf = data.slice(halfwayPoint);
          
          // Calculate average mood for each half
          const firstHalfAvg = firstHalf.reduce((sum, entry) => sum + (MOOD_VALUES[entry.mood] || 0), 0) / firstHalf.length;
          const secondHalfAvg = secondHalf.reduce((sum, entry) => sum + (MOOD_VALUES[entry.mood] || 0), 0) / secondHalf.length;
          
          // Calculate percentage change
          const percentageChange = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
          
          if (Math.abs(percentageChange) < 5) {
            setTrendInfo({ direction: 'stable', percentage: Math.abs(percentageChange) });
          } else if (percentageChange > 0) {
            setTrendInfo({ direction: 'up', percentage: percentageChange });
          } else {
            setTrendInfo({ direction: 'down', percentage: Math.abs(percentageChange) });
          }
        }
      } catch (error) {
        console.error("Error loading mood history:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMoodHistory();
  }, [userId, timeRange, currentWeekStart]);
  
  // Navigate to previous/next week
  const navigatePrevious = () => {
    if (timeRange === 'week') {
      setCurrentWeekStart(prevState => subDays(prevState, 7));
    }
  };
  
  const navigateNext = () => {
    if (timeRange === 'week') {
      const nextWeek = new Date(currentWeekStart);
      nextWeek.setDate(nextWeek.getDate() + 7);
      // Don't navigate past current date
      if (nextWeek <= new Date()) {
        setCurrentWeekStart(nextWeek);
      }
    }
  };
  
  // Prepare chart data
  const chartData = formatChartData(moodData);
  
  // Custom chart tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-2 rounded-md shadow-md text-xs">
          <p className="font-medium">{payload[0]?.payload?.fullDate || label}</p>
          {payload[0]?.payload?.value !== null ? (
            <div className="flex flex-col gap-1 mt-1">
              <div className="flex items-center gap-1">
                <span className="text-primary">Mood Level:</span> 
                <span>{displayMoodFromValue(payload[0].payload.value)}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-primary">Entries:</span> 
                <span>{payload[0].payload.count}</span>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No mood data</p>
          )}
        </div>
      );
    }
    return null;
  };
  
  // Helper to display mood text based on numeric value
  const displayMoodFromValue = (value: number): string => {
    if (value === null) return 'No data';
    
    // Round to nearest 0.5
    const roundedValue = Math.round(value * 2) / 2;
    
    if (roundedValue >= 4.5) return '😊 Very Happy';
    if (roundedValue >= 3.5) return '🙂 Happy';
    if (roundedValue >= 2.5) return '😌 Calm';
    if (roundedValue >= 1.5) return '😐 Neutral';
    if (roundedValue >= 0.5) return '😟 Anxious';
    return '😢 Sad';
  };
  
  // Custom Y-axis tick formatter
  const formatYAxisTick = (value: number) => {
    if (value === 5) return '😊';
    if (value === 4) return '🙂';
    if (value === 3) return '😌';
    if (value === 2) return '😐';
    if (value === 1) return '😟';
    if (value === 0) return '😢';
    return '';
  };
  
  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <HeartPulse className="h-5 w-5 text-primary" />
            Mood Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="p-1">
          {isLoading ? (
            <div className="h-40 flex items-center justify-center">
              <div className="animate-pulse text-primary">Loading...</div>
            </div>
          ) : moodData.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-center text-muted-foreground text-sm">
              <p>No mood data available for this period</p>
            </div>
          ) : (
            <>
              {trendInfo && (
                <div className="mb-2 px-3 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm">
                    <span className="font-medium">Trend:</span>
                    <Badge variant={trendInfo.direction === 'up' ? 'success' : trendInfo.direction === 'down' ? 'destructive' : 'outline'} className="text-xs">
                      {trendInfo.direction === 'up' ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : trendInfo.direction === 'down' ? (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      ) : (
                        <HeartPulse className="h-3 w-3 mr-1" />
                      )}
                      {trendInfo.direction === 'up' 
                        ? 'Improving' 
                        : trendInfo.direction === 'down' 
                          ? 'Declining' 
                          : 'Stable'}
                    </Badge>
                  </div>
                </div>
              )}
              <ResponsiveContainer width="100%" height={100}>
                <LineChart data={chartData}>
                  <YAxis domain={[0, 5]} hide />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="var(--color-primary)" 
                    strokeWidth={2} 
                    dot={{ fill: "var(--color-primary)", r: 4 }}
                    activeDot={{ r: 6, fill: "var(--color-primary)" }}
                    isAnimationActive={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            </>
          )}
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <HeartPulse className="h-5 w-5 text-primary" />
            Mood History Analysis
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32 h-8">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">Last 4 Weeks</SelectItem>
              </SelectContent>
            </Select>
            
            {timeRange === 'week' && (
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={navigatePrevious}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={navigateNext}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
        <CardDescription className="flex items-center justify-between">
          <div>
            {timeRange === 'week' && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(currentWeekStart, 'MMM d')} - {format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'MMM d, yyyy')}
              </span>
            )}
            {timeRange === 'month' && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Last 4 weeks
              </span>
            )}
          </div>
          
          {trendInfo && (
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium">Trend:</span>
              <Badge variant={trendInfo.direction === 'up' ? 'success' : trendInfo.direction === 'down' ? 'destructive' : 'outline'}>
                {trendInfo.direction === 'up' ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : trendInfo.direction === 'down' ? (
                  <TrendingDown className="h-3 w-3 mr-1" />
                ) : (
                  <HeartPulse className="h-3 w-3 mr-1" />
                )}
                {trendInfo.direction === 'up' 
                  ? `Improving (${Math.round(trendInfo.percentage)}%)` 
                  : trendInfo.direction === 'down' 
                    ? `Declining (${Math.round(trendInfo.percentage)}%)` 
                    : 'Stable'}
              </Badge>
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-60 flex items-center justify-center">
            <div className="animate-pulse text-primary">Loading...</div>
          </div>
        ) : moodData.length === 0 ? (
          <div className="h-60 flex items-center justify-center text-center text-muted-foreground">
            <div>
              <p className="mb-2">No mood data available for this period</p>
              <p className="text-sm">Track your mood regularly to see patterns over time</p>
            </div>
          </div>
        ) : (
          <>
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="line" className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>Trend</span>
                </TabsTrigger>
                <TabsTrigger value="area" className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>Area</span>
                </TabsTrigger>
                <TabsTrigger value="bar" className="flex items-center gap-1">
                  <BarChart2 className="h-4 w-4" />
                  <span>Bar</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="line">
                <ResponsiveContainer width="100%" height={height}>
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" stroke="var(--muted-foreground)" />
                    <YAxis 
                      domain={[0, 5]} 
                      tickFormatter={formatYAxisTick} 
                      width={30}
                      stroke="var(--muted-foreground)"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      name="Mood Level" 
                      stroke="var(--color-primary)" 
                      strokeWidth={2} 
                      dot={{ fill: "var(--color-primary)", r: 4 }}
                      activeDot={{ r: 6, fill: "var(--color-primary)" }}
                      isAnimationActive={true}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
              
              <TabsContent value="area">
                <ResponsiveContainer width="100%" height={height}>
                  <AreaChart
                    data={chartData}
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" stroke="var(--muted-foreground)" />
                    <YAxis 
                      domain={[0, 5]} 
                      tickFormatter={formatYAxisTick} 
                      width={30}
                      stroke="var(--muted-foreground)"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      name="Mood Level" 
                      stroke="var(--color-primary)" 
                      fill="var(--color-primary-light)" 
                      fillOpacity={0.3}
                      isAnimationActive={true}
                      connectNulls
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </TabsContent>
              
              <TabsContent value="bar">
                <ResponsiveContainer width="100%" height={height}>
                  <BarChart
                    data={chartData}
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" stroke="var(--muted-foreground)" />
                    <YAxis 
                      domain={[0, 5]} 
                      tickFormatter={formatYAxisTick} 
                      width={30}
                      stroke="var(--muted-foreground)"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="value" 
                      name="Mood Level" 
                      fill="var(--color-primary)" 
                      radius={[4, 4, 0, 0]}
                      isAnimationActive={true}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
            
            <div className="mt-4 text-xs text-muted-foreground">
              <p className="flex items-center gap-1">
                <Info className="h-3 w-3" />
                Chart shows your average mood levels over time. Higher values indicate more positive moods.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
} 