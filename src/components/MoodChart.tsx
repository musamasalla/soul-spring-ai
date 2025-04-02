import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, BarChart2 } from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addDays } from 'date-fns';
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

// Mood names for display
const MOOD_NAMES: Record<string, string> = {
  'very_happy': 'Very Happy',
  'happy': 'Happy',
  'calm': 'Calm',
  'refreshed': 'Refreshed',
  'neutral': 'Neutral',
  'sleepy': 'Sleepy',
  'anxious': 'Anxious',
  'sad': 'Sad'
};

interface MoodEntry {
  id: string;
  mood: string;
  created_at: string;
  date: string;
  notes?: string;
  factors?: any;
}

interface MoodChartProps {
  moods: MoodEntry[];
  selectedMood?: string | null;
  compact?: boolean;
  height?: number;
  className?: string;
}

export default function MoodChart({ 
  moods, 
  selectedMood, 
  compact = false, 
  height = 300, 
  className = '' 
}: MoodChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [trendInfo, setTrendInfo] = useState<{direction: 'up' | 'down' | 'stable', percentage: number} | null>(null);
  const [selectedTab, setSelectedTab] = useState('line');

  // Format data for charts
  useEffect(() => {
    if (!moods || moods.length === 0) {
      setChartData([]);
      return;
    }

    // Filter moods if a specific mood is selected
    const filteredMoods = selectedMood 
      ? moods.filter(entry => entry.mood === selectedMood)
      : moods;

    if (filteredMoods.length === 0) {
      setChartData([]);
      return;
    }

    // Calculate trend
    if (filteredMoods.length > 1) {
      // Sort by date
      const sortedMoods = [...filteredMoods].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      // Split data into two halves
      const halfwayPoint = Math.floor(sortedMoods.length / 2);
      const firstHalf = sortedMoods.slice(0, halfwayPoint);
      const secondHalf = sortedMoods.slice(halfwayPoint);
      
      // Calculate average mood for each half
      const firstHalfAvg = firstHalf.reduce((sum, entry) => sum + (MOOD_VALUES[entry.mood] || 0), 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, entry) => sum + (MOOD_VALUES[entry.mood] || 0), 0) / secondHalf.length;
      
      // Calculate percentage change
      const percentageChange = firstHalfAvg !== 0 
        ? ((secondHalfAvg - firstHalfAvg) / Math.abs(firstHalfAvg)) * 100 
        : secondHalfAvg > 0 ? 100 : 0;
      
      if (Math.abs(percentageChange) < 5) {
        setTrendInfo({ direction: 'stable', percentage: Math.abs(percentageChange) });
      } else if (percentageChange > 0) {
        setTrendInfo({ direction: 'up', percentage: percentageChange });
      } else {
        setTrendInfo({ direction: 'down', percentage: Math.abs(percentageChange) });
      }
    }

    // Get date range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = subDays(today, 30);
    
    // Group entries by day
    const dayMap: Record<string, { count: number, sum: number, date: string }> = {};
    
    // Initialize all days in the range
    for (let i = 0; i < 30; i++) {
      const date = addDays(thirtyDaysAgo, i);
      const dateKey = format(date, 'yyyy-MM-dd');
      dayMap[dateKey] = { count: 0, sum: 0, date: format(date, 'MMM d') };
    }
    
    // Add mood data to respective days
    filteredMoods.forEach(entry => {
      const entryDate = entry.date || format(new Date(entry.created_at), 'yyyy-MM-dd');
      
      if (new Date(entryDate) >= thirtyDaysAgo && new Date(entryDate) <= today) {
        if (!dayMap[entryDate]) {
          dayMap[entryDate] = { count: 0, sum: 0, date: format(new Date(entryDate), 'MMM d') };
        }
        
        dayMap[entryDate].count += 1;
        dayMap[entryDate].sum += MOOD_VALUES[entry.mood] || 0;
      }
    });
    
    // Convert map to array and calculate averages
    const formattedData = Object.entries(dayMap).map(([dateKey, value]) => ({
      date: value.date,
      fullDate: dateKey,
      value: value.count > 0 ? value.sum / value.count : null,
      count: value.count
    }));
    
    // Sort by date
    formattedData.sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());
    
    setChartData(formattedData);
  }, [moods, selectedMood]);
  
  // Custom chart tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length && payload[0].payload.value !== null) {
      const data = payload[0].payload;
      const moodValue = data.value;
      const moodName = displayMoodFromValue(moodValue);
      
      return (
        <div className="bg-background p-3 border rounded shadow-sm">
          <p className="font-medium">{data.date}</p>
          <p className="text-sm text-muted-foreground">
            {data.count} {data.count === 1 ? 'entry' : 'entries'}
          </p>
          <p className="flex items-center gap-1.5">
            <span className="font-medium">Mood:</span> 
            {moodName}
          </p>
        </div>
      );
    }
    
    return null;
  };
  
  // Convert numerical mood value back to display string
  const displayMoodFromValue = (value: number): string => {
    // Find the closest mood
    let closestMood = 'neutral';
    let closestDistance = Infinity;
    
    Object.entries(MOOD_VALUES).forEach(([mood, moodValue]) => {
      const distance = Math.abs(moodValue - value);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestMood = mood;
      }
    });
    
    return `${MOOD_EMOJIS[closestMood]} ${MOOD_NAMES[closestMood]}`;
  };
  
  // Format Y-axis tick labels
  const formatYAxisTick = (value: number) => {
    return selectedMood 
      ? formatYAxisTickForSingleMood(value) 
      : formatYAxisTickForAllMoods(value);
  };
  
  const formatYAxisTickForSingleMood = (value: number) => {
    if (value === MOOD_VALUES[selectedMood as string]) {
      return MOOD_EMOJIS[selectedMood as string];
    }
    return '';
  };
  
  const formatYAxisTickForAllMoods = (value: number) => {
    switch (value) {
      case 5: return '😊'; // Very Happy
      case 4: return '🙂'; // Happy
      case 3: return '😌'; // Calm
      case 2: return '😐'; // Neutral
      case 1: return '😟'; // Anxious
      case 0: return '😢'; // Sad
      default: return '';
    }
  };
  
  if (!moods || moods.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Mood History</CardTitle>
          <CardDescription>
            No mood data available. Start tracking your moods to see your patterns.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <Card className={className}>
      <CardHeader className={compact ? 'pb-2' : ''}>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              Mood History
              {trendInfo && (
                <Badge variant={trendInfo.direction === 'up' ? 'success' : trendInfo.direction === 'down' ? 'destructive' : 'outline'}>
                  {trendInfo.direction === 'up' ? (
                    <TrendingUp className="h-3.5 w-3.5 mr-1" />
                  ) : trendInfo.direction === 'down' ? (
                    <TrendingDown className="h-3.5 w-3.5 mr-1" />
                  ) : null}
                  <span>{trendInfo.percentage.toFixed(0)}%</span>
                </Badge>
              )}
            </CardTitle>
            {!compact && (
              <CardDescription>
                {selectedMood 
                  ? `Tracking your ${MOOD_NAMES[selectedMood]} moods over time`
                  : 'Visualizing your mood patterns over the last 30 days'}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className={compact ? 'pt-0' : ''}>
        {compact ? (
          <div style={{ width: '100%', height }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                  tickMargin={5}
                />
                <YAxis 
                  domain={[0, 5]} 
                  tickFormatter={formatYAxisTick}
                  tick={{ fontSize: 12 }}
                  width={20}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="var(--primary)" 
                  strokeWidth={2}
                  dot={{ fill: 'var(--primary)', r: 3 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="line">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>Line Chart</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="bar">
                <div className="flex items-center gap-1">
                  <BarChart2 className="h-4 w-4" />
                  <span>Bar Chart</span>
                </div>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="line" className="pt-4">
              <div style={{ width: '100%', height }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, left: 5, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      interval="preserveStartEnd"
                      tickMargin={10}
                    />
                    <YAxis 
                      domain={[0, 5]} 
                      tickFormatter={formatYAxisTick}
                      width={30}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="var(--primary)" 
                      strokeWidth={2}
                      dot={{ fill: 'var(--primary)', r: 4 }}
                      activeDot={{ r: 6 }}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            <TabsContent value="bar" className="pt-4">
              <div style={{ width: '100%', height }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 20, left: 5, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      interval="preserveStartEnd"
                      tickMargin={10}
                    />
                    <YAxis 
                      domain={[0, 5]} 
                      tickFormatter={formatYAxisTick}
                      width={30}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="value" 
                      fill="var(--primary)" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
} 