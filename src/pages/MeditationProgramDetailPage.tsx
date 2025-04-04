import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, CheckCircle, Lock, ArrowLeft, Users, Calendar, Clock, Star, Info, BookOpen, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useUser } from "@/hooks/useUser";

// Define program data structure
interface Session {
  id: string;
  title: string;
  description: string;
  duration: number;
  completed: boolean;
  locked: boolean;
}

interface ProgramData {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  image: string;
  duration: string;
  totalSessions: number;
  completedSessions: number;
  category: string;
  level: string;
  rating: number;
  users: number;
  goals: string[];
  benefits: string[];
  instructorName: string;
  instructorImage: string;
  instructorBio: string;
  premium: boolean;
  progress: number;
  sessions: Session[];
}

// Mock program data
const programData: ProgramData = {
  id: "1",
  title: "Anxiety Relief Program",
  description: "A 7-day program to help reduce anxiety and stress through guided meditation.",
  longDescription: "This comprehensive anxiety relief program guides you through a series of meditations designed to reduce anxiety, calm your nervous system, and build resilience to stress. Over the course of 7 days, you'll learn techniques to manage anxious thoughts, release tension from your body, and cultivate a greater sense of inner peace.",
  image: "/images/programs/anxiety-relief.jpg",
  duration: "7 days",
  totalSessions: 14,
  completedSessions: 3,
  category: "Anxiety",
  level: "Beginner",
  rating: 4.7,
  users: 1243,
  premium: false,
  progress: 30,
  goals: [
    "Reduce anxiety and stress levels",
    "Learn to recognize and interrupt anxious thought patterns",
    "Develop daily mindfulness habits for long-term anxiety management",
    "Build resilience to stressful situations"
  ],
  benefits: [
    "Decreased physical symptoms of anxiety",
    "Improved sleep quality",
    "Greater sense of calm and emotional balance",
    "Enhanced focus and concentration",
    "Reduced rumination and worry"
  ],
  instructorName: "Dr. Sarah Johnson",
  instructorImage: "/images/instructor-sarah.jpg",
  instructorBio: "Dr. Sarah Johnson is a clinical psychologist specializing in mindfulness-based therapies for anxiety and stress management. With over 15 years of experience and a regular meditation practice of her own, she brings both professional expertise and personal insight to her guided meditations.",
  sessions: [
    {
      id: "s1",
      title: "Introduction to Anxiety Relief",
      description: "Learn the basics of mindfulness for anxiety and set your intentions for the program.",
      duration: 10,
      completed: true,
      locked: false
    },
    {
      id: "s2",
      title: "Morning Anxiety Release",
      description: "Start your day with this calming practice to release anxious thoughts and set a peaceful tone.",
      duration: 12,
      completed: true,
      locked: false
    },
    {
      id: "s3",
      title: "Body Scan for Physical Tension",
      description: "Release physical manifestations of anxiety through this guided body scan meditation.",
      duration: 15,
      completed: true,
      locked: false
    },
    {
      id: "s4",
      title: "Breath Awareness for Calm",
      description: "Learn breathing techniques specifically designed to activate your parasympathetic nervous system.",
      duration: 10,
      completed: false,
      locked: false
    },
    {
      id: "s5",
      title: "Anxious Thoughts Observatory",
      description: "Observe anxious thoughts without judgment and learn to create distance from them.",
      duration: 18,
      completed: false,
      locked: false
    },
    {
      id: "s6",
      title: "Evening Relaxation",
      description: "Wind down with this evening practice to release the day's stress and prepare for restful sleep.",
      duration: 20,
      completed: false,
      locked: false
    },
    {
      id: "s7",
      title: "Self-Compassion for Anxiety",
      description: "Cultivate kindness toward yourself while experiencing anxiety.",
      duration: 15,
      completed: false,
      locked: true
    },
    // More sessions would be listed here
  ]
};

// Animation variants
const pageVariants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: { opacity: 0 }
};

const MeditationProgramDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userData, isLoading, isPremium } = useUser();
  const [program, setProgram] = useState<ProgramData | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Fetch program data
  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setProgram(programData);
      setIsPageLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [id]);

  // Handle session click
  const handleSessionClick = (sessionId: string) => {
    if (program) {
      const session = program.sessions.find(s => s.id === sessionId);
      if (session && !session.locked) {
        // In a real app, navigate to the meditation session
        console.log(`Starting session: ${sessionId}`);
      } else if (session && session.locked && program.premium && !isPremium) {
        // Show premium upgrade prompt
        console.log("Premium session locked");
      }
    }
  };

  if (isLoading || isPageLoading || !program) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div 
      className="container mx-auto max-w-full"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      {/* Back button */}
      <Button 
        variant="ghost" 
        className="mb-4" 
        onClick={() => navigate('/programs')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Programs
      </Button>

      {/* Program header */}
      <div className="relative mb-6 overflow-hidden rounded-lg">
        <div className="h-[200px] md:h-[300px] w-full relative overflow-hidden">
          <img 
            src={program.image || "/images/programs/default.jpg"} 
            alt={program.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="font-normal">
              {program.category}
            </Badge>
            <Badge variant="outline" className="font-normal">
              {program.level}
            </Badge>
            {program.premium && (
              <Badge className="bg-amber-500 text-white">
                Premium
              </Badge>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{program.title}</h1>
          <p className="text-sm md:text-base text-white/80 max-w-3xl">{program.description}</p>
          
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center text-white/90">
              <Calendar className="mr-1 h-4 w-4" />
              <span className="text-sm">{program.duration}</span>
            </div>
            <div className="flex items-center text-white/90">
              <BookOpen className="mr-1 h-4 w-4" />
              <span className="text-sm">{program.totalSessions} sessions</span>
            </div>
            <div className="flex items-center text-white/90">
              <Users className="mr-1 h-4 w-4" />
              <span className="text-sm">{program.users.toLocaleString()} users</span>
            </div>
            <div className="flex items-center text-white/90">
              <Star className="mr-1 h-4 w-4 fill-current text-amber-400" />
              <span className="text-sm">{program.rating} rating</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">Your Progress</div>
            <div className="text-sm text-muted-foreground">
              {program.completedSessions} of {program.totalSessions} sessions completed
            </div>
          </div>
          <Progress value={program.progress} className="h-2" />
          
          <div className="mt-4 flex flex-wrap gap-2">
            <Button className="flex-1 sm:flex-none">
              Continue Program
            </Button>
            {program.progress > 0 && (
              <Button variant="outline" className="flex-1 sm:flex-none">
                Restart Program
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <div className="scrollable-tabs mb-4">
          <TabsList className="tabs-container">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="instructor">Instructor</TabsTrigger>
            <TabsTrigger value="benefits">Benefits</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>About This Program</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-6">{program.longDescription}</p>
              
              <h3 className="text-lg font-medium mb-3">Program Goals</h3>
              <ul className="space-y-2 mb-6">
                {program.goals.map((goal, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="mr-2 h-5 w-5 text-primary shrink-0" />
                    <span>{goal}</span>
                  </li>
                ))}
              </ul>
              
              <Separator className="my-6" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Program Structure</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <BarChart className="mr-2 h-5 w-5 text-muted-foreground" />
                      <span>{program.duration} program</span>
                    </li>
                    <li className="flex items-center">
                      <BookOpen className="mr-2 h-5 w-5 text-muted-foreground" />
                      <span>{program.totalSessions} guided meditation sessions</span>
                    </li>
                    <li className="flex items-center">
                      <Clock className="mr-2 h-5 w-5 text-muted-foreground" />
                      <span>10-20 minutes per session</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Recommended For</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <Info className="mr-2 h-5 w-5 text-muted-foreground" />
                      <span>People experiencing anxiety or stress</span>
                    </li>
                    <li className="flex items-center">
                      <Info className="mr-2 h-5 w-5 text-muted-foreground" />
                      <span>Those who want to build daily mindfulness habits</span>
                    </li>
                    <li className="flex items-center">
                      <Info className="mr-2 h-5 w-5 text-muted-foreground" />
                      <span>Beginners to meditation</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="mt-0 space-y-4">
          {program.sessions.map((session, index) => (
            <Card key={session.id} className={session.completed ? "border-primary/30 bg-primary/5" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-muted-foreground">Session {index + 1}</span>
                      {session.completed && (
                        <Badge variant="outline" className="text-primary border-primary">
                          Completed
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-lg font-medium mb-1">{session.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{session.description}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-4 w-4" />
                      <span>{session.duration} minutes</span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <Button 
                      size="sm"
                      variant={session.completed ? "outline" : "default"}
                      onClick={() => handleSessionClick(session.id)}
                      disabled={session.locked && program.premium && !isPremium}
                      className="h-10 w-10 rounded-full p-0"
                    >
                      {session.locked && program.premium && !isPremium ? (
                        <Lock className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="instructor" className="mt-0">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="shrink-0">
                  <div className="overflow-hidden rounded-full h-24 w-24 md:h-32 md:w-32 border">
                    <img 
                      src={program.instructorImage || "/images/default-avatar.jpg"} 
                      alt={program.instructorName}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">{program.instructorName}</h3>
                  <p className="text-muted-foreground mb-4">Program Creator & Instructor</p>
                  <p>{program.instructorBio}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benefits" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Program Benefits</CardTitle>
              <CardDescription>
                What you'll gain from completing this program
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {program.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="mr-3 h-5 w-5 text-primary shrink-0" />
                    <div>
                      <p className="font-medium">{benefit}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default MeditationProgramDetailPage; 