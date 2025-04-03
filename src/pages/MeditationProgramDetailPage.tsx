import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@/hooks/useUser";
import { getProgramById, enrollInProgram, updateProgramProgress } from "@/services/programService";
import { MeditationProgramData, ProgramMeditationData } from "@/types/meditation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import {
  ChevronLeft,
  Play,
  Calendar,
  Clock,
  CheckCircle2,
  Award,
  BookOpen,
  AlarmClock,
  Loader2,
  Lock,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function MeditationProgramDetailPage() {
  const { programId } = useParams<{ programId: string }>();
  const [program, setProgram] = useState<MeditationProgramData | null>(null);
  const [activeDay, setActiveDay] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEnrolling, setIsEnrolling] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const { user } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadProgram() {
      if (!programId) return;
      
      setIsLoading(true);
      try {
        const programData = await getProgramById(programId);
        setProgram(programData);
        
        // If user is enrolled and has progress, set active day to current day
        if (programData?.userProgress) {
          setActiveDay(programData.userProgress.currentDay);
        }
      } catch (error) {
        console.error("Error loading program:", error);
        toast({
          title: "Error loading program",
          description: "Failed to load the meditation program. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadProgram();
  }, [programId, toast]);

  const handleEnroll = async () => {
    if (!user || !program) return;
    
    setIsEnrolling(true);
    try {
      const success = await enrollInProgram(user.id, program.id);
      if (success) {
        toast({
          title: "Successfully enrolled",
          description: `You've enrolled in ${program.title}. Your journey begins today!`,
        });
        
        // Refresh program data to show enrollment status
        const updatedProgram = await getProgramById(program.id);
        setProgram(updatedProgram);
      } else {
        throw new Error("Failed to enroll");
      }
    } catch (error) {
      console.error("Error enrolling in program:", error);
      toast({
        title: "Enrollment failed",
        description: "There was an error enrolling you in this program. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  const handlePlayMeditation = (meditationId: string) => {
    // In a real app, this would play the meditation audio
    setIsPlaying(meditationId);
    
    // For demo purposes, let's simulate completing the meditation after 3 seconds
    setTimeout(() => {
      setIsPlaying(null);
      if (program?.userProgress) {
        handleCompleteMeditation();
      }
    }, 3000);
  };

  const handleCompleteMeditation = async () => {
    if (!user || !program || !program.userProgress) return;
    
    try {
      // Update the user's progress
      const currentDay = program.userProgress.currentDay;
      const success = await updateProgramProgress(user.id, program.id, currentDay);
      
      if (success) {
        toast({
          title: "Day completed",
          description: `You've completed day ${currentDay} of ${program.title}. Great job!`,
        });
        
        // Refresh program data to show updated progress
        const updatedProgram = await getProgramById(program.id);
        setProgram(updatedProgram);
        
        if (updatedProgram?.userProgress) {
          setActiveDay(updatedProgram.userProgress.currentDay);
        }
      } else {
        throw new Error("Failed to update progress");
      }
    } catch (error) {
      console.error("Error updating progress:", error);
      toast({
        title: "Error",
        description: "There was an error updating your progress. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!program) {
    return (
      <div className="container px-4 py-8 mx-auto text-center">
        <h1 className="text-2xl font-bold">Program not found</h1>
        <p className="text-muted-foreground mt-2">The meditation program you're looking for doesn't exist.</p>
        <Button onClick={() => navigate("/meditation-programs")} className="mt-4">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Programs
        </Button>
      </div>
    );
  }

  const isEnrolled = !!program.userProgress;
  const { currentDay = 1, completionRate = 0 } = program.userProgress || {};
  const dayMeditations = program.meditations?.filter(m => m.day === activeDay) || [];
  const isCurrentDayCompleted = isEnrolled && program.userProgress && program.userProgress.lastCompletedDay >= activeDay;
  const isCurrentDayLocked = isEnrolled && activeDay > currentDay;

  return (
    <div className="container px-4 py-8 mx-auto">
      <Button variant="ghost" onClick={() => navigate("/meditation-programs")} className="mb-4">
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to Programs
      </Button>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Program Info Section */}
        <div className="lg:col-span-2">
          <div className="relative h-64 w-full rounded-lg overflow-hidden mb-6">
            <Image
              src={program.coverImage || "/placeholder-program.jpg"}
              alt={program.title}
              fill
              priority
              className="object-cover"
            />
            {program.isPremium && (
              <Badge variant="secondary" className="absolute top-4 right-4 bg-amber-500 text-white hover:bg-amber-600">
                Premium
              </Badge>
            )}
          </div>
          
          <h1 className="text-3xl font-bold mb-2">{program.title}</h1>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {program.category.map((cat) => (
              <Badge key={cat} variant="outline">
                {cat}
              </Badge>
            ))}
            <div className="flex items-center text-sm text-muted-foreground ml-2">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{program.totalDays} days</span>
              <span className="mx-2">•</span>
              <span className="capitalize">{program.level} level</span>
            </div>
          </div>
          
          <p className="text-muted-foreground mb-6">{program.description}</p>
          
          {isEnrolled && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium">Your Progress</span>
                <span>{Math.round(completionRate)}% Complete</span>
              </div>
              <Progress value={completionRate} className="h-2 mb-2" />
              <div className="text-sm text-muted-foreground">
                Day {currentDay} of {program.totalDays}
              </div>
            </div>
          )}
          
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
              <TabsTrigger value="author">About the Author</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold mb-3">Program Goal</h2>
                <p>{program.targetGoal}</p>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-3">Expected Outcomes</h2>
                <ul className="space-y-2">
                  {program.expectedOutcomes.map((outcome, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 text-green-500" />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-3">Who This Program Is For</h2>
                <p>This {program.totalDays}-day program is designed for {program.level} practitioners who want to focus on {program.category.join(", ")}.</p>
                {program.isPremium && (
                  <div className="mt-4 flex items-center">
                    <Award className="h-5 w-5 mr-2 text-amber-500" />
                    <span className="font-medium">This is a premium program and requires a subscription.</span>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="curriculum">
              <h2 className="text-xl font-semibold mb-4">Program Curriculum</h2>
              
              <div className="space-y-4">
                {Array.from({length: program.totalDays}, (_, i) => i + 1).map(day => {
                  const dayMeds = program.meditations?.filter(m => m.day === day) || [];
                  const isCompleted = isEnrolled && program.userProgress && program.userProgress.lastCompletedDay >= day;
                  const isLocked = isEnrolled && day > currentDay;
                  
                  return (
                    <Card key={day} className={cn("cursor-pointer hover:shadow-md transition-shadow", 
                      activeDay === day ? "border-primary" : "",
                      isLocked ? "opacity-60" : ""
                    )}
                    onClick={() => !isLocked && setActiveDay(day)}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            {isCompleted ? (
                              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                              </div>
                            ) : isLocked ? (
                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center mr-3">
                                <Lock className="h-4 w-4 text-muted-foreground" />
                              </div>
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                                <span className="font-medium text-primary">{day}</span>
                              </div>
                            )}
                            <div>
                              <h3 className="font-medium">Day {day}</h3>
                              {dayMeds.length > 0 && (
                                <p className="text-sm text-muted-foreground line-clamp-1">{dayMeds[0].title}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{dayMeds.reduce((acc, med) => acc + Math.floor(med.duration / 60), 0)} min</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
            
            <TabsContent value="author">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
                  <BookOpen className="h-12 w-12 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold">{program.authorName}</h2>
                <p className="text-muted-foreground">{program.authorCredentials}</p>
              </div>
              
              <p className="text-center mx-auto max-w-2xl">
                {program.authorName} is an experienced instructor specializing in {program.category.join(", ")}. 
                With expertise in helping people achieve their mental health goals, 
                they have designed this program to guide you through a transformative journey.
              </p>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Day Details & Actions Section */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                Day {activeDay}: {dayMeditations[0]?.title || "Overview"}
              </h2>
              
              {isCurrentDayLocked ? (
                <div className="text-center py-8">
                  <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">This day is locked</h3>
                  <p className="text-muted-foreground mb-4">Complete the previous days to unlock this content.</p>
                  <Button onClick={() => setActiveDay(currentDay)}>
                    Go to Current Day
                  </Button>
                </div>
              ) : (
                <>
                  {dayMeditations.length > 0 ? (
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-4">
                        {dayMeditations.map((meditation) => (
                          <div key={meditation.id} className="border rounded-lg p-4">
                            <h3 className="font-medium mb-1">{meditation.title}</h3>
                            <p className="text-sm text-muted-foreground mb-3">{meditation.description}</p>
                            
                            <div className="flex items-center text-sm text-muted-foreground mb-4">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>{Math.floor(meditation.duration / 60)} minutes</span>
                              <span className="mx-2">•</span>
                              <span>{meditation.instructor}</span>
                            </div>
                            
                            <Button 
                              onClick={() => handlePlayMeditation(meditation.id)}
                              disabled={isPlaying === meditation.id}
                              className="w-full"
                            >
                              {isPlaying === meditation.id ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Playing...
                                </>
                              ) : (
                                <>
                                  <Play className="mr-2 h-4 w-4" />
                                  Play Meditation
                                </>
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-8">
                      <AlarmClock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No meditations found for this day.</p>
                    </div>
                  )}
                </>
              )}
              
              <Separator className="my-6" />
              
              {isEnrolled ? (
                <div className="space-y-4">
                  {isCurrentDayCompleted ? (
                    <div className="text-center bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <CheckCircle2 className="h-8 w-8 mx-auto text-green-600 mb-2" />
                      <p className="font-medium text-green-600">Day {activeDay} completed!</p>
                    </div>
                  ) : !isCurrentDayLocked && (
                    <Button 
                      onClick={handleCompleteMeditation} 
                      className="w-full" 
                      disabled={isCurrentDayLocked || isPlaying !== null}
                    >
                      Mark Day {activeDay} as Complete
                    </Button>
                  )}
                  
                  {activeDay < program.totalDays && !isCurrentDayLocked && isCurrentDayCompleted && (
                    <Button 
                      onClick={() => setActiveDay(activeDay + 1)}
                      variant="outline" 
                      className="w-full"
                    >
                      Continue to Day {activeDay + 1}
                    </Button>
                  )}
                </div>
              ) : (
                <Button 
                  onClick={handleEnroll} 
                  className="w-full" 
                  disabled={isEnrolling}
                >
                  {isEnrolling ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enrolling...
                    </>
                  ) : (
                    <>Enroll in Program</>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 