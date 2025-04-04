import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Heart, Clock, Calendar, Star, BookOpen } from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { motion } from "framer-motion";
import { useUser } from "@/hooks/useUser";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for meditation programs
const programsData = [
  {
    id: "1",
    title: "Anxiety Relief Program",
    description: "A 7-day program to help reduce anxiety and stress through guided meditation.",
    image: "/images/programs/anxiety-relief.jpg",
    duration: "7 days",
    sessions: 14,
    category: "Anxiety",
    level: "Beginner",
    rating: 4.7,
    users: 1243,
    premium: false,
    tags: ["Anxiety", "Stress Relief", "Beginner"],
    progress: 30,
  },
  {
    id: "2",
    title: "Deep Sleep Journey",
    description: "Improve your sleep quality with this 5-day program focused on relaxation before bedtime.",
    image: "/images/programs/deep-sleep.jpg",
    duration: "5 days",
    sessions: 10,
    category: "Sleep",
    level: "All Levels",
    rating: 4.9,
    users: 2105,
    premium: true,
    tags: ["Sleep", "Relaxation", "Evening"],
    progress: 0,
  },
  {
    id: "3",
    title: "Mindfulness Basics",
    description: "Learn the fundamentals of mindfulness meditation with this comprehensive program.",
    image: "/images/programs/mindfulness.jpg",
    duration: "10 days",
    sessions: 20,
    category: "Mindfulness",
    level: "Beginner",
    rating: 4.5,
    users: 1872,
    premium: false,
    tags: ["Mindfulness", "Awareness", "Focus"],
    progress: 70,
  },
  {
    id: "4",
    title: "Self-Compassion Journey",
    description: "Develop greater self-compassion and kindness towards yourself through guided practices.",
    image: "/images/programs/self-compassion.jpg",
    duration: "14 days",
    sessions: 28,
    category: "Self-Compassion",
    level: "Intermediate",
    rating: 4.8,
    users: 956,
    premium: true,
    tags: ["Self-Care", "Compassion", "Healing"],
    progress: 0,
  },
  {
    id: "5",
    title: "Focus and Concentration",
    description: "Enhance your ability to focus and concentrate with targeted meditation exercises.",
    image: "/images/programs/focus.jpg",
    duration: "7 days",
    sessions: 14,
    category: "Focus",
    level: "All Levels",
    rating: 4.6,
    users: 1450,
    premium: false,
    tags: ["Focus", "Productivity", "Attention"],
    progress: 50,
  },
  {
    id: "6",
    title: "Emotional Balance",
    description: "Learn techniques to regulate emotions and develop greater emotional resilience.",
    image: "/images/programs/emotions.jpg",
    duration: "10 days",
    sessions: 20,
    category: "Emotional Wellbeing",
    level: "Intermediate",
    rating: 4.7,
    users: 1102,
    premium: true,
    tags: ["Emotions", "Balance", "Resilience"],
    progress: 0,
  },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

export default function MeditationProgramsPage() {
  const navigate = useNavigate();
  const { userData, isLoading, isPremium } = useUser();
  const [activeTab, setActiveTab] = useState("all");
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Filter programs based on active tab
  const filteredPrograms = programsData.filter(program => {
    if (activeTab === "all") return true;
    if (activeTab === "inProgress") return program.progress > 0;
    if (activeTab === "premium") return program.premium;
    if (activeTab === activeTab) return program.category.toLowerCase() === activeTab;
    return true;
  });

  if (isLoading || isPageLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Meditation Programs</h1>
        <p className="text-muted-foreground">
          Structured meditation journeys to help you develop consistent practice and address specific needs.
        </p>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="mb-4 flex flex-wrap gap-2">
          <TabsTrigger value="all">All Programs</TabsTrigger>
          <TabsTrigger value="inProgress">In Progress</TabsTrigger>
          <TabsTrigger value="premium">Premium</TabsTrigger>
          <TabsTrigger value="anxiety">Anxiety</TabsTrigger>
          <TabsTrigger value="sleep">Sleep</TabsTrigger>
          <TabsTrigger value="mindfulness">Mindfulness</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          <motion.div 
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredPrograms.map((program) => (
              <motion.div key={program.id} variants={cardVariants}>
                <Card className="h-full overflow-hidden transition-all hover:shadow-md">
                  <div className="relative aspect-video w-full overflow-hidden">
                    <img
                      src={program.image || "https://via.placeholder.com/400x225?text=Program+Image"}
                      alt={program.title}
                      className="h-full w-full object-cover transition-transform hover:scale-105"
                    />
                    {program.premium && (
                      <Badge className="absolute right-2 top-2 bg-amber-500 text-white">
                        Premium
                      </Badge>
                    )}
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="font-normal">
                        {program.category}
                      </Badge>
                      <div className="flex items-center text-amber-500">
                        <Star className="mr-1 h-4 w-4 fill-current" />
                        <span className="text-sm">{program.rating}</span>
                      </div>
                    </div>
                    <CardTitle className="mt-2 line-clamp-1">{program.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{program.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="mb-3 flex flex-wrap gap-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-1 h-4 w-4" />
                        {program.duration}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <BookOpen className="mr-1 h-4 w-4" />
                        {program.sessions} sessions
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Heart className="mr-1 h-4 w-4" />
                        {program.users.toLocaleString()} users
                      </div>
                    </div>
                    {program.progress > 0 && (
                      <div className="mb-2">
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span>Progress</span>
                          <span>{program.progress}%</span>
                        </div>
                        <Progress value={program.progress} className="h-2" />
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button
                      className="w-full"
                      variant={program.progress > 0 ? "default" : "outline"}
                      onClick={() => navigate(`/programs/${program.id}`)}
                      disabled={program.premium && !isPremium}
                    >
                      {program.progress > 0 ? "Continue" : "Start Program"}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 