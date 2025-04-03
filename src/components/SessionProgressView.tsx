import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { InfoIcon, TrendingUp, TrendingDown, AlertCircle, Calendar, LineChart, BarChart4, PieChart, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, subDays } from 'date-fns';
import { ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, BarChart as RechartsBarChart, Bar, Cell, PieChart as RechartsPieChart, Pie } from 'recharts';
import { SessionSummary } from './TherapySessionTracker';

interface SessionProgressViewProps {
  userId: string;
  sessions: SessionSummary[];
  emotionData?: any;
  className?: string;
}

interface InsightItem {
  type: 'improvement' | 'concern' | 'neutral';
  text: string;
}

export const SessionProgressView: React.FC<SessionProgressViewProps> = ({
  userId,
  sessions,
  emotionData,
  className
}) => {
  const [activeTab, setActiveTab] = useState<string>('emotional');
  const [insights, setInsights] = useState<InsightItem[]>([]);
  
  // Generate emotional trend data from sessions
  const getEmotionalTrendData = () => {
    // Sort sessions by date
    const sortedSessions = [...sessions].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Map emotions to numeric values for visualization
    const emotionValues: Record<string, number> = {
      'happy': 90,
      'peaceful': 80, 
      'calm': 75,
      'content': 70,
      'neutral': 50,
      'worried': 40,
      'sad': 30,
      'anxious': 25,
      'stressed': 20,
      'angry': 15,
      'depressed': 10
    };
    
    // Default value for unknown emotions
    const defaultValue = 50;
    
    // Generate data points from session emotional states
    return sortedSessions.map(session => {
      const startEmotion = session.emotionalState?.start || 'neutral';
      const endEmotion = session.emotionalState?.end || startEmotion;
      
      // Calculate emotional values or use defaults
      const startValue = emotionValues[startEmotion.toLowerCase()] || defaultValue;
      const endValue = endEmotion === 'improved' ? Math.min(startValue + 20, 100) :
                       endEmotion === 'worsened' ? Math.max(startValue - 20, 0) :
                       endEmotion === 'stable' ? startValue :
                       emotionValues[endEmotion.toLowerCase()] || startValue;
      
      return {
        date: format(new Date(session.date), 'MMM d'),
        sessionId: session.id,
        title: session.title,
        start: startValue,
        end: endValue,
        improvement: endValue - startValue
      };
    });
  };
  
  // Generate technique usage data
  const getTechniqueUsageData = () => {
    // Count technique usage across sessions
    const techniqueCounts: Record<string, number> = {};
    
    sessions.forEach(session => {
      session.techniques.forEach(technique => {
        const normalizedName = technique.toLowerCase();
        techniqueCounts[normalizedName] = (techniqueCounts[normalizedName] || 0) + 1;
      });
    });
    
    // Convert to array for chart
    return Object.entries(techniqueCounts)
      .map(([name, count]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  };
  
  // Generate session duration data
  const getSessionDurationData = () => {
    // Sort sessions by date
    const sortedSessions = [...sessions].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    return sortedSessions.map(session => ({
      date: format(new Date(session.date), 'MMM d'),
      duration: session.durationMinutes
    }));
  };
  
  // Generate insights based on session data
  useEffect(() => {
    if (sessions.length < 1) {
      setInsights([]);
      return;
    }
    
    const newInsights: InsightItem[] = [];
    
    // Get sorted sessions
    const sortedSessions = [...sessions].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Check session frequency
    const currentDate = new Date();
    const lastSessionDate = new Date(sortedSessions[sortedSessions.length - 1].date);
    const daysSinceLastSession = Math.floor((currentDate.getTime() - lastSessionDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastSession > 14) {
      newInsights.push({
        type: 'concern',
        text: `It's been ${daysSinceLastSession} days since your last therapy session.`
      });
    } else if (sessions.length >= 3) {
      newInsights.push({
        type: 'improvement',
        text: 'You\'ve maintained consistent therapy sessions. Great job!'
      });
    }
    
    // Check emotional progress
    if (sessions.length >= 2) {
      const recentSessions = sortedSessions.slice(-3);
      const improvementCount = recentSessions.filter(
        session => session.emotionalState?.end === 'improved'
      ).length;
      
      if (improvementCount >= 2) {
        newInsights.push({
          type: 'improvement',
          text: 'Your emotional state has improved after recent sessions.'
        });
      } else if (recentSessions.every(session => session.emotionalState?.end === 'worsened')) {
        newInsights.push({
          type: 'concern',
          text: 'Your emotional state has decreased after recent sessions.'
        });
      }
    }
    
    // Check homework completion
    const homeworkSessions = sessions.filter(s => s.homework && s.homework.length > 0);
    if (homeworkSessions.length > 0) {
      const totalHomework = homeworkSessions.reduce(
        (sum, session) => sum + (session.homework?.length || 0), 
        0
      );
      
      const completedHomework = homeworkSessions.reduce(
        (sum, session) => sum + (session.homework?.filter(h => h.isCompleted)?.length || 0), 
        0
      );
      
      const completionRate = totalHomework > 0 ? (completedHomework / totalHomework) * 100 : 0;
      
      if (completionRate >= 70) {
        newInsights.push({
          type: 'improvement',
          text: `You've completed ${Math.round(completionRate)}% of your practice exercises. Great work!`
        });
      } else if (completionRate < 30 && totalHomework >= 3) {
        newInsights.push({
          type: 'concern',
          text: 'You might benefit from completing more of your practice exercises.'
        });
      }
    }
    
    // Check session duration trend
    if (sessions.length >= 3) {
      const recentDurations = sortedSessions.slice(-3).map(s => s.durationMinutes);
      const avgDuration = recentDurations.reduce((sum, duration) => sum + duration, 0) / recentDurations.length;
      
      if (avgDuration < 15) {
        newInsights.push({
          type: 'neutral',
          text: 'Your recent sessions have been quite short. Consider longer sessions for deeper exploration.'
        });
      } else if (avgDuration > 30) {
        newInsights.push({
          type: 'improvement',
          text: "You're engaging in substantial sessions, which allows for deeper therapeutic work."
        });
      }
    }
    
    // Check technique diversity
    const allTechniques = sessions.flatMap(s => s.techniques);
    const uniqueTechniques = new Set(allTechniques);
    
    if (uniqueTechniques.size >= 5) {
      newInsights.push({
        type: 'improvement',
        text: `You've explored ${uniqueTechniques.size} different therapy techniques, building a diverse toolkit.`
      });
    }
    
    // Check current emotional state
    if (emotionData?.primaryEmotion && emotionData?.intensityLevel) {
      const highIntensityNegativeEmotions = ['anxious', 'sad', 'angry', 'stressed', 'depressed'];
      if (highIntensityNegativeEmotions.includes(emotionData.primaryEmotion.toLowerCase()) && 
          (emotionData.intensityLevel === 'high' || emotionData.intensityLevel === 'very high')) {
        newInsights.push({
          type: 'concern',
          text: `You're experiencing high levels of ${emotionData.primaryEmotion}. Please prioritize self-care.`
        });
      }
    }
    
    // Limit to most relevant insights
    setInsights(newInsights.slice(0, 3));
  }, [sessions, emotionData]);

  // Get a trend icon based on value
  const getTrendIcon = (value: number) => {
    if (value > 0) {
      return <ArrowUpRight className="h-3.5 w-3.5 text-success" />;
    } else if (value < 0) {
      return <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />;
    }
    return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
  };
  
  // Get CSS class for trend
  const getTrendClass = (value: number, invert: boolean = false) => {
    if (value > 0) {
      return invert ? "text-destructive" : "text-success";
    } else if (value < 0) {
      return invert ? "text-success" : "text-destructive";
    }
    return "text-muted-foreground";
  };
  
  // Format data for line chart
  const emotionalTrendData = getEmotionalTrendData();
  const techniqueUsageData = getTechniqueUsageData();
  const sessionDurationData = getSessionDurationData();
  
  // Check if we have enough data for visualization
  const hasEnoughData = sessions.length >= 2;
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#8DD1E1'];
  
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <LineChart className="h-4 w-4 text-primary" />
          Session Progress
          <Badge variant="outline" className="ml-auto text-xs">
            {sessions.length} session{sessions.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
        <CardDescription>
          Track your therapy journey over time
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        {!hasEnoughData ? (
          <div className="text-center py-8 text-muted-foreground">
            <LineChart className="h-6 w-6 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Not enough session data</p>
            <p className="text-xs mt-1">
              Complete at least 2 sessions to see progress trends
            </p>
            <Badge variant="secondary" className="mt-3">
              <Calendar className="h-3.5 w-3.5 mr-1" />
              {sessions.length} session{sessions.length !== 1 ? 's' : ''} completed
            </Badge>
          </div>
        ) : (
          <>
            {/* Insights Section */}
            {insights.length > 0 && (
              <div className="mb-4 space-y-2">
                {insights.map((insight, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "flex items-start gap-2 text-xs p-2 rounded-md",
                      insight.type === 'improvement' ? "bg-success/10 text-success/90" :
                      insight.type === 'concern' ? "bg-destructive/10 text-destructive/90" :
                      "bg-muted/40"
                    )}
                  >
                    {insight.type === 'improvement' ? (
                      <TrendingUp className="h-4 w-4 shrink-0 mt-0.5" />
                    ) : insight.type === 'concern' ? (
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    ) : (
                      <InfoIcon className="h-4 w-4 shrink-0 mt-0.5" />
                    )}
                    <span>{insight.text}</span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Charts Section */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-3 mb-2">
                <TabsTrigger value="emotional">Emotional</TabsTrigger>
                <TabsTrigger value="techniques">Techniques</TabsTrigger>
                <TabsTrigger value="duration">Duration</TabsTrigger>
              </TabsList>
              
              <TabsContent value="emotional" className="h-[190px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart
                    data={emotionalTrendData}
                    margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ccc" strokeOpacity={0.3} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }} 
                      tickLine={false}
                      axisLine={{ stroke: '#ccc', strokeOpacity: 0.3 }}
                    />
                    <YAxis 
                      tick={false}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 100]}
                    />
                    <RechartsTooltip 
                      formatter={(value: number, name: string) => {
                        const emotionLabels: Record<string, string> = {
                          90: 'Very Happy',
                          80: 'Peaceful',
                          75: 'Calm',
                          70: 'Content',
                          50: 'Neutral',
                          40: 'Worried',
                          30: 'Sad',
                          25: 'Anxious',
                          20: 'Stressed',
                          15: 'Angry',
                          10: 'Distressed'
                        };
                        
                        // Find closest emotion
                        const emotions = Object.entries(emotionLabels);
                        let closestEmotion = emotions[0][1];
                        let closestDistance = Math.abs(parseInt(emotions[0][0]) - value);
                        
                        for (let i = 1; i < emotions.length; i++) {
                          const distance = Math.abs(parseInt(emotions[i][0]) - value);
                          if (distance < closestDistance) {
                            closestDistance = distance;
                            closestEmotion = emotions[i][1];
                          }
                        }
                        
                        const displayName = name === 'start' ? 'Beginning of session' : 
                                        name === 'end' ? 'End of session' : name;
                        return [`${closestEmotion} (${value})`, displayName];
                      }}
                      labelFormatter={(label) => {
                        const session = emotionalTrendData.find(s => s.date === label);
                        return session ? session.title : label;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="start"
                      stroke="#8884d8"
                      strokeWidth={2}
                      dot={{ r: 4, strokeWidth: 1 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="end"
                      stroke="#82ca9d"
                      strokeWidth={2}
                      dot={{ r: 4, strokeWidth: 1 }}
                      activeDot={{ r: 6 }}
                    />
                    <Legend />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </TabsContent>
              
              <TabsContent value="techniques" className="h-[190px]">
                {techniqueUsageData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={techniqueUsageData}
                      margin={{ top: 5, right: 10, left: 0, bottom: 30 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ccc" strokeOpacity={0.3} />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12 }} 
                        tickLine={false}
                        angle={-45}
                        textAnchor="end"
                        height={70}
                        axisLine={{ stroke: '#ccc', strokeOpacity: 0.3 }}
                      />
                      <YAxis 
                        allowDecimals={false}
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={{ stroke: '#ccc', strokeOpacity: 0.3 }}
                      />
                      <RechartsTooltip 
                        formatter={(value: number) => [`${value} session${value !== 1 ? 's' : ''}`, 'Usage']}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {techniqueUsageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </RechartsBarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <p className="text-sm">No technique data available</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="duration" className="h-[190px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart
                    data={sessionDurationData}
                    margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ccc" strokeOpacity={0.3} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }} 
                      tickLine={false}
                      axisLine={{ stroke: '#ccc', strokeOpacity: 0.3 }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={{ stroke: '#ccc', strokeOpacity: 0.3 }}
                      unit="min"
                    />
                    <RechartsTooltip 
                      formatter={(value: number) => [`${value} minutes`, 'Duration']}
                    />
                    <Line
                      type="monotone"
                      dataKey="duration"
                      stroke="#8884d8"
                      strokeWidth={2}
                      dot={{ r: 4, strokeWidth: 1 }}
                      activeDot={{ r: 6 }}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
      
      <CardFooter className="pt-2 justify-between">
        {hasEnoughData && (
          <>
            <div className="flex items-center gap-4">
              <div className="flex items-center text-xs">
                <div className="w-3 h-3 rounded-full bg-[#8884d8] mr-1"></div>
                <span>Start</span>
              </div>
              <div className="flex items-center text-xs">
                <div className="w-3 h-3 rounded-full bg-[#82ca9d] mr-1"></div>
                <span>End</span>
              </div>
            </div>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <InfoIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Track how your emotional state changes during sessions</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        )}
        
        {!hasEnoughData && sessions.length > 0 && (
          <div className="w-full text-center text-xs text-muted-foreground">
            {2 - sessions.length} more session{sessions.length === 1 ? '' : 's'} needed to view trends
          </div>
        )}
      </CardFooter>
    </Card>
  );
}; 