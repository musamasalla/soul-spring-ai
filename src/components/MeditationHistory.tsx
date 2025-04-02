import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  Clock, 
  BarChart2, 
  PieChart as PieChartIcon, 
  ListTodo, 
  Flame,
  Calendar, 
  Medal,
  Check,
  X
} from "lucide-react";
import { formatDuration } from "@/utils/formatTime";
import { Badge } from "./ui/badge";
import { MeditationSession } from "@/types/meditation";
import { 
  getSessions, 
  getSessionsWithMood, 
  calculateStreak, 
  getTotalMeditationMinutes,
  getCategoryBreakdown,
  initializeSampleData
} from "@/services/sessionService";

// Colors for the pie chart
const COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57', '#ffc658'];

interface MeditationHistoryProps {
  userId?: string;
}

export default function MeditationHistory({ userId = "default-user" }: MeditationHistoryProps) {
  const [sessions, setSessions] = useState<MeditationSession[]>([]);
  const [sessionsWithMood, setSessionsWithMood] = useState<(MeditationSession & { mood?: string })[]>([]);
  const [streak, setStreak] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [categoryBreakdown, setCategoryBreakdown] = useState<{ name: string; value: number }[]>([]);
  const [weeklyActivity, setWeeklyActivity] = useState<{ day: string; minutes: number }[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Make sure sample data is initialized
        await initializeSampleData();
        
        // Get all sessions
        const allSessions = getSessions();
        setSessions(allSessions);
        
        // Get sessions with mood data
        const allSessionsWithMood = await getSessionsWithMood();
        setSessionsWithMood(allSessionsWithMood);
        
        // Calculate streak
        const currentStreak = calculateStreak();
        setStreak(currentStreak);
        
        // Calculate total minutes
        const minutes = getTotalMeditationMinutes();
        setTotalMinutes(minutes);
        
        // Get category breakdown
        const categories = getCategoryBreakdown();
        const categoryData = Object.entries(categories).map(([name, value]) => ({ name, value }));
        setCategoryBreakdown(categoryData);
        
        // Calculate weekly activity (last 7 days)
        const weeklyData = calculateWeeklyActivity(allSessions);
        setWeeklyActivity(weeklyData);
      } catch (error) {
        console.error("Error loading meditation history data:", error);
      }
    };
    
    loadData();
  }, []);

  // Calculate minutes meditated per day for the last 7 days
  const calculateWeeklyActivity = (sessions: MeditationSession[]) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyData = days.map(day => ({ day, minutes: 0 }));
    
    // Get the last 7 days
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(today.getDate() - i);
      return date;
    });
    
    // Group sessions by day
    sessions.forEach(session => {
      if (!session.completed) return;
      
      const sessionDate = new Date(session.date);
      const dayOfWeek = sessionDate.getDay(); // 0 = Sunday, 6 = Saturday
      
      // Check if session is within the last 7 days
      const isWithinLast7Days = last7Days.some(date => 
        date.getDate() === sessionDate.getDate() && 
        date.getMonth() === sessionDate.getMonth() && 
        date.getFullYear() === sessionDate.getFullYear()
      );
      
      if (isWithinLast7Days) {
        weeklyData[dayOfWeek].minutes += Math.floor(session.duration / 60);
      }
    });
    
    // Reorder so the current day is last
    const todayIndex = today.getDay();
    const reorderedData = [
      ...weeklyData.slice(todayIndex + 1),
      ...weeklyData.slice(0, todayIndex + 1)
    ];
    
    return reorderedData;
  };

  // Calculate the mood emoji for a given mood value
  const getMoodEmoji = (mood?: string) => {
    if (!mood) return '';
    
    const moodEmojis: { [key: string]: string } = {
      'very_happy': '😊',
      'happy': '🙂',
      'neutral': '😐',
      'calm': '😌',
      'refreshed': '🧘',
      'sleepy': '😴',
      'anxious': '😟',
      'sad': '😢'
    };
    
    return moodEmojis[mood] || '';
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Current Streak</CardTitle>
            <div className="flex items-center">
              <Flame className="h-6 w-6 mr-2 text-primary" />
              <span className="text-3xl font-bold">{streak}</span>
              <span className="ml-2 text-muted-foreground">days</span>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Time</CardTitle>
            <div className="flex items-center">
              <Clock className="h-6 w-6 mr-2 text-primary" />
              <span className="text-3xl font-bold">{totalMinutes}</span>
              <span className="ml-2 text-muted-foreground">minutes</span>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Sessions Completed</CardTitle>
            <div className="flex items-center">
              <Medal className="h-6 w-6 mr-2 text-primary" />
              <span className="text-3xl font-bold">{sessions.filter(s => s.completed).length}</span>
              <span className="ml-2 text-muted-foreground">sessions</span>
            </div>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="activity">
        <TabsList>
          <TabsTrigger value="activity">
            <BarChart2 className="h-4 w-4 mr-2" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="categories">
            <PieChartIcon className="h-4 w-4 mr-2" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="history">
            <ListTodo className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Activity</CardTitle>
              <CardDescription>
                Your meditation minutes over the last 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={weeklyActivity}
                    margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                  >
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value} minutes`, 'Duration']}
                      labelFormatter={(label) => `${label}`}
                    />
                    <Bar 
                      dataKey="minutes" 
                      fill="#8884d8" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 text-center text-sm text-muted-foreground">
                Total this week: {weeklyActivity.reduce((sum, day) => sum + day.minutes, 0)} minutes
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Meditation Categories</CardTitle>
              <CardDescription>
                Distribution of your meditation sessions by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex">
                <div className="h-[300px] flex-1">
                  {categoryBreakdown.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {categoryBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} sessions`, 'Count']} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      No category data available
                    </div>
                  )}
                </div>
                <div className="ml-4 flex flex-col justify-center">
                  {categoryBreakdown.map((category, index) => (
                    <div key={category.name} className="flex items-center mb-2">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <Badge variant="outline">{category.name}</Badge>
                      <span className="ml-2 text-sm">{category.value} sessions</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Meditation History</CardTitle>
              <CardDescription>
                Your recent meditation sessions
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2">
              <div className="max-h-[400px] overflow-y-auto pr-2">
                {sessionsWithMood.length > 0 ? (
                  <div className="space-y-4">
                    {sessionsWithMood
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((session) => (
                        <div key={session.id} className="flex items-start p-3 border rounded-lg">
                          <div className="mr-3 mt-1">
                            {session.completed ? (
                              <Check className="h-5 w-5 text-green-500" />
                            ) : (
                              <X className="h-5 w-5 text-red-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h4 className="font-medium">{session.title}</h4>
                              <span className="text-sm text-muted-foreground">
                                {new Date(session.date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center mt-1">
                              <Badge variant="outline" className="mr-2">
                                {session.category}
                              </Badge>
                              <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {formatDuration(session.duration)}
                              </span>
                              {session.mood && (
                                <span className="ml-2 text-lg" title={session.mood}>
                                  {getMoodEmoji(session.mood)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No meditation history available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 