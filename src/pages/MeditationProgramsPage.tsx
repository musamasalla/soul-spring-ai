import React, { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { getAllPrograms, getRecommendedPrograms, getUserEnrolledPrograms } from "@/services/programService";
import { MeditationProgramData } from "@/types/meditation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Play, Calendar, CheckCircle2, Clock, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";

export default function MeditationProgramsPage() {
  const [activeTab, setActiveTab] = useState<string>("recommended");
  const [programs, setPrograms] = useState<MeditationProgramData[]>([]);
  const [enrolledPrograms, setEnrolledPrograms] = useState<MeditationProgramData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    async function loadPrograms() {
      setIsLoading(true);
      try {
        if (activeTab === "all") {
          const allPrograms = await getAllPrograms();
          setPrograms(allPrograms);
        } else if (activeTab === "enrolled" && user) {
          const userPrograms = await getUserEnrolledPrograms(user.id);
          setEnrolledPrograms(userPrograms);
        } else if (activeTab === "recommended" && user) {
          const recommendedPrograms = await getRecommendedPrograms(user.id);
          setPrograms(recommendedPrograms);
        } else {
          // Fallback to all programs if no user or other issue
          const allPrograms = await getAllPrograms();
          setPrograms(allPrograms);
        }
      } catch (error) {
        console.error("Error loading programs:", error);
        toast({
          title: "Error loading programs",
          description: "Failed to load meditation programs. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadPrograms();
  }, [activeTab, user, toast]);

  const handleProgramClick = (program: MeditationProgramData) => {
    router.push(`/meditation-programs/${program.id}`);
  };

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col space-y-2 text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Meditation Programs</h1>
        <p className="text-muted-foreground max-w-[42rem] mx-auto">
          Guided multi-day programs to help you achieve specific mental health goals through consistent practice.
        </p>
      </div>

      <Tabs defaultValue="recommended" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
          <TabsTrigger value="enrolled">My Programs</TabsTrigger>
          <TabsTrigger value="all">Browse All</TabsTrigger>
        </TabsList>

        <TabsContent value="recommended" className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Recommended For You</h2>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.map((program) => (
                <ProgramCard key={program.id} program={program} onClick={() => handleProgramClick(program)} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="enrolled" className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">My Programs</h2>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : enrolledPrograms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledPrograms.map((program) => (
                <EnrolledProgramCard 
                  key={program.id} 
                  program={program} 
                  onClick={() => handleProgramClick(program)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-muted/50">
              <Info className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No programs enrolled</h3>
              <p className="text-muted-foreground mb-4">
                You haven't enrolled in any programs yet. Browse our collection and find one that matches your goals.
              </p>
              <Button onClick={() => setActiveTab("all")}>Browse Programs</Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">All Programs</h2>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.map((program) => (
                <ProgramCard key={program.id} program={program} onClick={() => handleProgramClick(program)} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface ProgramCardProps {
  program: MeditationProgramData;
  onClick: () => void;
}

function ProgramCard({ program, onClick }: ProgramCardProps) {
  return (
    <Card className="overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
      <div className="relative h-48 w-full">
        <Image
          src={program.coverImage || "/placeholder-program.jpg"}
          alt={program.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {program.isPremium && (
          <Badge variant="secondary" className="absolute top-2 right-2 bg-amber-500 text-white hover:bg-amber-600">
            Premium
          </Badge>
        )}
      </div>
      <CardHeader className="flex-1">
        <div className="flex justify-between items-start">
          <CardTitle className="line-clamp-2">{program.title}</CardTitle>
        </div>
        <CardDescription className="flex flex-wrap gap-1 mt-1">
          {program.category.slice(0, 3).map((cat) => (
            <Badge key={cat} variant="outline" className="bg-muted">
              {cat}
            </Badge>
          ))}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <Calendar className="h-4 w-4 mr-1" />
          <span>{program.totalDays} days</span>
          <span className="mx-2">•</span>
          <span>{program.level}</span>
        </div>
        <p className="text-sm line-clamp-2">{program.description}</p>
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-1">Expected Outcomes:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {program.expectedOutcomes.slice(0, 2).map((outcome, index) => (
              <li key={index} className="flex items-start">
                <CheckCircle2 className="h-4 w-4 mr-1 mt-0.5 text-green-500" />
                <span className="line-clamp-1">{outcome}</span>
              </li>
            ))}
            {program.expectedOutcomes.length > 2 && (
              <li className="text-sm text-muted-foreground">
                +{program.expectedOutcomes.length - 2} more outcomes
              </li>
            )}
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onClick} className="w-full">
          <Play className="h-4 w-4 mr-2" />
          View Program
        </Button>
      </CardFooter>
    </Card>
  );
}

function EnrolledProgramCard({ program, onClick }: ProgramCardProps) {
  if (!program.userProgress) {
    return <ProgramCard program={program} onClick={onClick} />;
  }

  const { currentDay, completionRate } = program.userProgress;
  
  return (
    <Card className="overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
      <div className="relative h-40 w-full">
        <Image
          src={program.coverImage || "/placeholder-program.jpg"}
          alt={program.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
          <h3 className="text-white font-bold">{program.title}</h3>
          <div className="flex items-center text-white/80 text-sm">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Day {currentDay} of {program.totalDays}</span>
          </div>
        </div>
      </div>
      <CardContent className="pt-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">Your Progress</span>
          <span className="text-sm">{Math.round(completionRate)}%</span>
        </div>
        <Progress value={completionRate} className="h-2" />
        
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Today's Session:</h4>
          {program.meditations && program.meditations.length > 0 && (
            <div className="bg-muted p-3 rounded-md">
              {program.meditations
                .filter(m => m.day === currentDay)
                .map(meditation => (
                  <div key={meditation.id} className="flex justify-between items-center">
                    <div>
                      <h5 className="font-medium text-sm">{meditation.title}</h5>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{Math.floor(meditation.duration / 60)} min</span>
                      </div>
                    </div>
                    <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onClick} className="w-full">
          Continue Program
        </Button>
      </CardFooter>
    </Card>
  );
} 