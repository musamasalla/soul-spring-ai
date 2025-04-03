import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TherapySession } from '@/types/therapy';
import { MoodEntry } from '@/types/mood';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface TherapyMoodCorrelationProps {
  sessions: TherapySession[];
  moods: MoodEntry[];
}

export function TherapyMoodCorrelation({ sessions, moods }: TherapyMoodCorrelationProps) {
  // Generate correlation data by combining sessions and moods
  const correlationData = useMemo(() => {
    if (!sessions.length || !moods.length) return [];
    
    // Create a timeline of all events (sessions and moods)
    const timeline = [
      ...sessions.map(session => ({
        date: new Date(session.date || session.created_at),
        type: 'session',
        title: session.title,
        value: null, // No mood value for sessions
        sessionData: session
      })),
      ...moods.map(mood => ({
        date: new Date(mood.date),
        type: 'mood',
        title: null,
        value: mood.value,
        moodData: mood
      }))
    ].sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Format for chart display
    const chartData = timeline.map((event, index) => {
      // Format date for display
      const formattedDate = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric'
      }).format(event.date);
      
      return {
        name: formattedDate,
        mood: event.type === 'mood' ? event.value : null,
        session: event.type === 'session' ? 10 : null, // Fixed value for session markers
        sessionTitle: event.type === 'session' ? event.title : null,
        tooltipDate: event.date.toLocaleDateString(),
        tooltipTime: event.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    });
    
    return chartData;
  }, [sessions, moods]);
  
  // Calculate overall correlation
  const calculateImpact = () => {
    if (!sessions.length || moods.length < 3) {
      return { trend: 'neutral', message: 'Need more data to analyze impact' };
    }
    
    // Get average mood before and after therapy sessions
    const preSessionMoods: number[] = [];
    const postSessionMoods: number[] = [];
    
    sessions.forEach(session => {
      const sessionDate = new Date(session.date || session.created_at);
      
      // Find moods within 48 hours before the session
      const moodsBefore = moods.filter(mood => {
        const moodDate = new Date(mood.date);
        const hoursDiff = (sessionDate.getTime() - moodDate.getTime()) / (1000 * 60 * 60);
        return hoursDiff > 0 && hoursDiff <= 48;
      });
      
      // Find moods within 48 hours after the session
      const moodsAfter = moods.filter(mood => {
        const moodDate = new Date(mood.date);
        const hoursDiff = (moodDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60);
        return hoursDiff > 0 && hoursDiff <= 48;
      });
      
      if (moodsBefore.length) {
        preSessionMoods.push(...moodsBefore.map(m => m.value));
      }
      
      if (moodsAfter.length) {
        postSessionMoods.push(...moodsAfter.map(m => m.value));
      }
    });
    
    // Calculate averages if we have enough data
    if (preSessionMoods.length > 0 && postSessionMoods.length > 0) {
      const avgBefore = preSessionMoods.reduce((acc, val) => acc + val, 0) / preSessionMoods.length;
      const avgAfter = postSessionMoods.reduce((acc, val) => acc + val, 0) / postSessionMoods.length;
      const difference = avgAfter - avgBefore;
      
      if (difference > 1) {
        return { 
          trend: 'positive', 
          message: 'Sessions appear to significantly improve your mood',
          before: avgBefore.toFixed(1),
          after: avgAfter.toFixed(1)
        };
      } else if (difference > 0.2) {
        return { 
          trend: 'positive', 
          message: 'Sessions appear to improve your mood',
          before: avgBefore.toFixed(1),
          after: avgAfter.toFixed(1)
        };
      } else if (difference < -0.2) {
        return { 
          trend: 'negative', 
          message: 'Your mood tends to decrease after sessions',
          before: avgBefore.toFixed(1),
          after: avgAfter.toFixed(1)
        };
      } else {
        return { 
          trend: 'neutral', 
          message: 'Sessions don\'t appear to have an immediate impact on mood',
          before: avgBefore.toFixed(1),
          after: avgAfter.toFixed(1)
        };
      }
    }
    
    return { trend: 'neutral', message: 'Not enough mood data around session times' };
  };
  
  const impact = calculateImpact();
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Therapy & Mood Correlation</CardTitle>
        <CardDescription>
          Analyzing how therapy sessions correlate with your mood
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {correlationData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={correlationData}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  yAxisId="left"
                  domain={[0, 10]} 
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Mood', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  domain={[0, 10]}
                  hide
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-background border rounded p-2 shadow-md text-sm">
                          <p className="font-medium">{data.tooltipDate}</p>
                          {data.sessionTitle && (
                            <p className="text-primary">Session: {data.sessionTitle}</p>
                          )}
                          {data.mood !== null && (
                            <p>Mood: {data.mood}/10</p>
                          )}
                          <p className="text-xs text-muted-foreground">{data.tooltipTime}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="mood"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  connectNulls
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="session"
                  stroke="#82ca9d"
                  strokeWidth={0}
                  dot={{ r: 6, strokeWidth: 2, fill: "#fff", stroke: "#82ca9d" }}
                  activeDot={{ r: 8 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Not enough data to display correlations
            </div>
          )}
        </div>
        
        <div className={`mt-4 p-3 rounded-md ${
          impact.trend === 'positive' ? 'bg-green-50 text-green-800' : 
          impact.trend === 'negative' ? 'bg-red-50 text-red-800' : 
          'bg-gray-50 text-gray-800'
        }`}>
          <h4 className="font-medium">Analysis:</h4>
          <p>{impact.message}</p>
          {impact.before && impact.after && (
            <p className="mt-1 text-sm">
              Average mood before sessions: <span className="font-medium">{impact.before}/10</span> → 
              After sessions: <span className="font-medium">{impact.after}/10</span>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 