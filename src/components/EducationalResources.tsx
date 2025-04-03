import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { EducationalResourceData } from '@/types/meditation';
import { Search, Clock, ExternalLink, Bookmark, BookmarkCheck, ThumbsUp, Download, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/useUser';

// Sample educational resources for different mental health topics
const SAMPLE_RESOURCES: EducationalResourceData[] = [
  {
    id: "anxiety-basics",
    title: "Understanding Anxiety: Causes and Symptoms",
    description: "An overview of what anxiety is, common causes, physical and emotional symptoms, and when to seek help.",
    type: "article",
    topic: "Anxiety",
    tags: ["anxiety", "mental health basics", "symptoms"],
    contentUrl: "/resources/anxiety-basics.pdf",
    imageUrl: "/images/resources/anxiety.jpg",
    estimatedReadTime: 8,
    author: "Dr. Sarah Chen",
    datePublished: "2023-04-15",
    featured: true
  },
  {
    id: "meditation-science",
    title: "The Science Behind Meditation",
    description: "Explore the research and science supporting meditation's positive effects on the brain and body.",
    type: "article",
    topic: "Meditation",
    tags: ["meditation", "research", "neuroscience", "stress reduction"],
    contentUrl: "/resources/meditation-science.pdf",
    imageUrl: "/images/resources/meditation-science.jpg",
    estimatedReadTime: 12,
    author: "Dr. Michael Kim",
    datePublished: "2023-02-22"
  },
  {
    id: "sleep-hygiene",
    title: "Improving Sleep Hygiene",
    description: "Practical tips and strategies to improve your sleep habits and get better rest.",
    type: "guide",
    topic: "Sleep",
    tags: ["sleep", "insomnia", "wellness", "habits"],
    contentUrl: "/resources/sleep-hygiene.pdf",
    imageUrl: "/images/resources/sleep.jpg",
    estimatedReadTime: 10,
    author: "Emma Wilson, Sleep Specialist",
    datePublished: "2023-05-30"
  },
  {
    id: "depression-overview",
    title: "Depression: Signs, Symptoms, and Support",
    description: "Learn about depression, its symptoms, causes, and treatment options. Includes self-care strategies and resources for seeking help.",
    type: "article",
    topic: "Depression",
    tags: ["depression", "mental health", "treatment", "self-care"],
    contentUrl: "/resources/depression-overview.pdf",
    imageUrl: "/images/resources/depression.jpg",
    estimatedReadTime: 15,
    author: "Dr. James Rodriguez",
    datePublished: "2023-01-18"
  },
  {
    id: "mindfulness-work",
    title: "Mindfulness Practices for the Workplace",
    description: "Simple mindfulness techniques you can integrate into your workday to reduce stress and increase focus.",
    type: "guide",
    topic: "Mindfulness",
    tags: ["mindfulness", "workplace", "stress", "productivity"],
    contentUrl: "/resources/mindfulness-work.pdf",
    imageUrl: "/images/resources/workplace-mindfulness.jpg",
    estimatedReadTime: 7,
    author: "Lisa Chen",
    datePublished: "2023-03-12"
  },
  {
    id: "stress-physiology",
    title: "The Physiology of Stress",
    description: "Understanding how stress affects your body and brain, and what you can do to manage its impact.",
    type: "article",
    topic: "Stress",
    tags: ["stress", "physiology", "health", "nervous system"],
    contentUrl: "/resources/stress-physiology.pdf",
    imageUrl: "/images/resources/stress.jpg",
    estimatedReadTime: 14,
    author: "Dr. Robert Johnson",
    datePublished: "2023-06-05"
  },
  {
    id: "cognitive-distortions",
    title: "Identifying Cognitive Distortions",
    description: "Learn to recognize common thinking patterns that contribute to anxiety and depression, and strategies to challenge them.",
    type: "guide",
    topic: "CBT",
    tags: ["cognitive behavioral therapy", "thinking patterns", "mental health"],
    contentUrl: "/resources/cognitive-distortions.pdf",
    imageUrl: "/images/resources/cognitive.jpg",
    estimatedReadTime: 11,
    author: "Dr. Sarah Chen",
    datePublished: "2023-07-20",
    featured: true
  },
  {
    id: "self-compassion-intro",
    title: "Introduction to Self-Compassion",
    description: "Discover the power of self-compassion and learn techniques to be kinder to yourself during difficult times.",
    type: "article",
    topic: "Self-Compassion",
    tags: ["self-compassion", "self-care", "mindfulness"],
    contentUrl: "/resources/self-compassion.pdf",
    imageUrl: "/images/resources/self-compassion.jpg",
    estimatedReadTime: 9,
    author: "Dr. Kristin Neff",
    datePublished: "2023-08-15"
  },
  {
    id: "grief-coping",
    title: "Coping with Grief and Loss",
    description: "Understanding the grief process and healthy ways to cope with loss and bereavement.",
    type: "guide",
    topic: "Grief",
    tags: ["grief", "loss", "coping", "emotions"],
    contentUrl: "/resources/grief.pdf",
    imageUrl: "/images/resources/grief.jpg",
    estimatedReadTime: 13,
    author: "Dr. Emily Thompson",
    datePublished: "2023-09-01"
  },
  {
    id: "trauma-healing",
    title: "Understanding Trauma and Paths to Healing",
    description: "An overview of trauma, its effects on the mind and body, and evidence-based approaches to healing.",
    type: "article",
    topic: "Trauma",
    tags: ["trauma", "PTSD", "healing", "therapy"],
    contentUrl: "/resources/trauma.pdf",
    imageUrl: "/images/resources/trauma.jpg",
    estimatedReadTime: 18,
    author: "Dr. Bessel van der Kolk",
    datePublished: "2023-05-12"
  }
];

// Filter options for resources
const TOPICS = ["All Topics", "Anxiety", "Depression", "Stress", "Mindfulness", "Sleep", "Trauma", "Self-Compassion", "CBT", "Grief", "Meditation"];
const RESOURCE_TYPES = ["All Types", "Article", "Guide", "Video", "Infographic", "Worksheet", "Podcast"];

interface EducationalResourcesProps {
  initialTopic?: string;
  featuredOnly?: boolean;
  compact?: boolean;
  maxItems?: number;
}

export default function EducationalResources({ 
  initialTopic = "All Topics", 
  featuredOnly = false, 
  compact = false,
  maxItems = 0
}: EducationalResourcesProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>(initialTopic);
  const [selectedType, setSelectedType] = useState<string>("All Types");
  const [resources, setResources] = useState<EducationalResourceData[]>([]);
  const [bookmarkedResources, setBookmarkedResources] = useState<string[]>([]);
  const { user } = useUser();
  const { toast } = useToast();

  // Fetch resources (simulated)
  useEffect(() => {
    // In a real app, this would fetch from an API or database
    let filteredResources = [...SAMPLE_RESOURCES];
    
    if (featuredOnly) {
      filteredResources = filteredResources.filter(resource => resource.featured);
    }
    
    if (selectedTopic !== "All Topics") {
      filteredResources = filteredResources.filter(resource => resource.topic === selectedTopic);
    }
    
    if (selectedType !== "All Types") {
      filteredResources = filteredResources.filter(
        resource => resource.type.toLowerCase() === selectedType.toLowerCase()
      );
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredResources = filteredResources.filter(
        resource => 
          resource.title.toLowerCase().includes(query) || 
          resource.description.toLowerCase().includes(query) ||
          resource.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // If maxItems is set, limit the number of resources returned
    if (maxItems > 0) {
      filteredResources = filteredResources.slice(0, maxItems);
    }
    
    setResources(filteredResources);
    
    // Simulate fetching user bookmarks
    if (user) {
      // In a real app, this would fetch from user's saved items
      setBookmarkedResources(["cognitive-distortions", "anxiety-basics"]);
    }
  }, [selectedTopic, selectedType, searchQuery, featuredOnly, maxItems, user]);

  const handleBookmark = (resourceId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to bookmark resources",
        variant: "destructive",
      });
      return;
    }
    
    // Toggle bookmark status
    setBookmarkedResources(prev => {
      if (prev.includes(resourceId)) {
        toast({
          title: "Removed from bookmarks",
          description: "Resource removed from your saved items",
        });
        return prev.filter(id => id !== resourceId);
      } else {
        toast({
          title: "Added to bookmarks",
          description: "Resource saved to your bookmarks",
        });
        return [...prev, resourceId];
      }
    });
    
    // In a real app, this would update the user's saved items in the database
  };

  if (compact) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Educational Resources</h2>
          <Button variant="outline" size="sm" asChild>
            <a href="/resources">View All</a>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.map(resource => (
            <ResourceCard 
              key={resource.id} 
              resource={resource} 
              isBookmarked={bookmarkedResources.includes(resource.id)} 
              onBookmark={handleBookmark} 
              compact
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Educational Resources</h1>
        <p className="text-muted-foreground">
          Explore our collection of resources on mental health topics to expand your knowledge
          and develop skills for wellbeing.
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search resources..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <select
          className="px-3 py-2 rounded-md border"
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
        >
          {TOPICS.map(topic => (
            <option key={topic} value={topic}>{topic}</option>
          ))}
        </select>
        
        <select
          className="px-3 py-2 rounded-md border"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          {RESOURCE_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
      
      {resources.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/50">
          <p className="text-lg font-medium">No resources found</p>
          <p className="text-muted-foreground mt-1">
            Try adjusting your search criteria or browse all resources.
          </p>
          <Button 
            className="mt-4" 
            onClick={() => {
              setSearchQuery("");
              setSelectedTopic("All Topics");
              setSelectedType("All Types");
            }}
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map(resource => (
            <ResourceCard 
              key={resource.id} 
              resource={resource} 
              isBookmarked={bookmarkedResources.includes(resource.id)}
              onBookmark={handleBookmark}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ResourceCardProps {
  resource: EducationalResourceData;
  isBookmarked: boolean;
  onBookmark: (id: string) => void;
  compact?: boolean;
}

function ResourceCard({ resource, isBookmarked, onBookmark, compact = false }: ResourceCardProps) {
  if (compact) {
    return (
      <Card className="overflow-hidden h-full hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium line-clamp-2">{resource.title}</h3>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <Badge variant="outline" className="mr-2">{resource.topic}</Badge>
                <Clock className="h-3 w-3 mr-1" />
                <span>{resource.estimatedReadTime} min read</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onBookmark(resource.id)}>
              {isBookmarked ? (
                <BookmarkCheck className="h-5 w-5 text-primary" />
              ) : (
                <Bookmark className="h-5 w-5" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
      <div 
        className="h-40 bg-center bg-cover"
        style={{ backgroundImage: `url(${resource.imageUrl || "/images/placeholder-resource.jpg"})` }}
      />
      
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="line-clamp-2">{resource.title}</CardTitle>
            <CardDescription>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="capitalize">{resource.type}</Badge>
                <span className="text-sm flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {resource.estimatedReadTime} min read
                </span>
              </div>
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onBookmark(resource.id)}>
            {isBookmarked ? (
              <BookmarkCheck className="h-5 w-5 text-primary" />
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <p className="text-sm line-clamp-3">{resource.description}</p>
        
        <div className="flex flex-wrap gap-1 mt-3">
          {resource.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {resource.tags.length > 3 && (
            <span className="text-xs text-muted-foreground">+{resource.tags.length - 3} more</span>
          )}
        </div>
        
        <div className="mt-3 text-sm text-muted-foreground">
          By {resource.author}
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-4">
        <div className="flex justify-between w-full">
          <Button variant="outline" size="sm" asChild>
            <a href={resource.contentUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4 mr-1" />
              Read
            </a>
          </Button>
          
          <div className="flex gap-1">
            <Button variant="ghost" size="icon">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <ThumbsUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
} 