import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Filter, Search, Users, Send, AlertTriangle, Loader2, Shield, Settings } from "lucide-react";
import { PostCard } from "@/components/PostCard";
import { EnhancedPost, CommunityCategory } from "@/types/community";
import { fetchPosts, createPost, fetchCategories } from "@/utils/communityService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface CommunitySettings {
  disable_community: boolean;
  hide_sensitive_content: boolean;
  auto_moderation: boolean;
  mute_notifications: boolean;
  allow_direct_messages: boolean;
}

const CommunityPage = () => {
  const { user, isPremium } = useAuth();
  const [posts, setPosts] = useState<EnhancedPost[]>([]);
  const [categories, setCategories] = useState<CommunityCategory[]>([]);
  const [newPost, setNewPost] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [communitySettings, setCommunitySettings] = useState<CommunitySettings>({
    disable_community: false,
    hide_sensitive_content: true,
    auto_moderation: true,
    mute_notifications: false,
    allow_direct_messages: true,
  });
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  // Load user's community settings
  useEffect(() => {
    const loadCommunitySettings = async () => {
      if (!user?.id) {
        setIsLoadingSettings(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('community_settings')
          .eq('id', user.id)
          .single();
          
        if (error) {
          throw error;
        }
        
        if (data && data.community_settings) {
          setCommunitySettings(data.community_settings as CommunitySettings);
        }
      } catch (error) {
        console.error("Error loading community settings:", error);
      } finally {
        setIsLoadingSettings(false);
      }
    };
    
    loadCommunitySettings();
  }, [user]);

  // Function to load posts
  const loadPosts = async (categoryId?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedPosts = await fetchPosts({
        categoryId: categoryId === "all" ? undefined : categoryId,
        searchQuery: searchTerm || undefined
      });
      
      // If hide_sensitive_content is enabled, filter out posts with sensitive tags
      let filteredPosts = fetchedPosts;
      if (communitySettings.hide_sensitive_content) {
        const sensitiveTags = ['depression', 'suicide', 'self-harm', 'trauma', 'abuse', 'violence', 'anxiety'];
        filteredPosts = fetchedPosts.filter(post => {
          // Check if post has no tags or none of the sensitive tags
          if (!post.tags || post.tags.length === 0) return true;
          
          return !post.tags.some(tag => 
            sensitiveTags.includes(tag.toLowerCase())
          );
        });
      }
      
      setPosts(filteredPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError("Failed to load posts. Please try again later.");
      toast.error("Failed to load posts. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const fetchedCategories = await fetchCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories");
      }
    };
    
    loadCategories();
  }, []);

  // Load posts when component mounts or when filter or search changes
  useEffect(() => {
    // Only load posts if community access is not disabled or settings are still loading
    if (!isLoadingSettings && !communitySettings.disable_community) {
      const timer = setTimeout(() => {
        loadPosts(filter !== "all" ? filter : undefined);
      }, 300); // Add debounce for search

      return () => clearTimeout(timer);
    }
  }, [filter, searchTerm, communitySettings.disable_community, isLoadingSettings]);

  const handlePostLike = (postId: string, liked: boolean) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: liked,
          likes_count: liked ? post.likes_count + 1 : post.likes_count - 1
        };
      }
      return post;
    }));
  };

  const handleSubmitPost = async () => {
    if (!newPost.trim()) return;
    if (!user) {
      toast.error("Please log in to create a post");
      return;
    }

    // Check for potentially sensitive content if auto moderation is enabled
    if (communitySettings.auto_moderation) {
      const sensitiveTerms = ['kill', 'die', 'suicide', 'harm', 'hurt myself', 'end it all'];
      const containsSensitiveContent = sensitiveTerms.some(term => 
        newPost.toLowerCase().includes(term.toLowerCase())
      );
      
      if (containsSensitiveContent) {
        toast.error("Your post may contain sensitive content that goes against our community guidelines. Please revise your post or contact support for help.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // Extract hashtags from content
      const hashtags = newPost.match(/#(\w+)/g)?.map(tag => tag.substring(1)) || [];
      
      // Create post in database
      const createdPost = await createPost({
        content: newPost,
        is_anonymous: false,
        is_premium_only: false
      });
      
      if (createdPost) {
        // Add post to state
        setPosts([createdPost, ...posts]);
        setNewPost("");
        toast.success("Post shared with the community!");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to share your post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // If community is disabled or settings are still loading, show appropriate UI
  if (isLoadingSettings) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto p-4 pt-6">
          <div className="flex justify-center items-center min-h-[60vh]">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  if (communitySettings.disable_community) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto p-4 pt-6">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-md mx-auto">
            <Shield className="h-16 w-16 text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Community Features Disabled</h1>
            <p className="text-muted-foreground mb-6">
              You've chosen to disable community features. This helps create a more controlled environment for your mental health journey.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              You can re-enable community access in your privacy settings at any time.
            </p>
            <Button 
              onClick={() => window.location.href = '/settings'}
              variant="outline"
            >
              <Settings className="mr-2 h-4 w-4" /> Manage Privacy Settings
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-1 p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Community</h1>
            <p className="text-muted-foreground">Connect with others on their mental health journey</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/settings?tab=privacy'}
              className="hidden sm:flex"
            >
              <Shield className="mr-2 h-4 w-4" /> Privacy Settings
            </Button>
            <Button 
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => window.scrollTo({ top: document.getElementById('new-post')?.offsetTop, behavior: 'smooth' })}
            >
              <Users className="mr-2 h-4 w-4" /> New Post
            </Button>
          </div>
        </div>
        
        {communitySettings.hide_sensitive_content && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800/50 mb-6">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-500">Content Filtering Enabled</p>
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Some posts may be hidden to protect your mental wellbeing. You can adjust this in your privacy settings.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Search and Filter */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Posts</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* New Post Form */}
        <Card className="mb-8" id="new-post">
          <CardHeader>
            <CardTitle className="text-xl">Create a Post</CardTitle>
            <CardDescription>Share your experiences, ask questions, or offer support</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <Avatar>
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="What's on your mind? Use #tags to categorize your post"
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Be respectful and supportive. Use #tags like #meditation or #anxiety to categorize.
                </p>
                {communitySettings.auto_moderation && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    <AlertTriangle className="inline-block h-3 w-3 mr-1" /> 
                    Content moderation is enabled. Posts with harmful content may be automatically filtered.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button 
              onClick={handleSubmitPost}
              disabled={!newPost.trim() || isSubmitting || !user}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Posting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" /> Share Post
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
              <p className="mt-4 text-muted-foreground">Loading posts...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertTriangle className="mx-auto h-12 w-12 text-destructive opacity-50" />
              <h3 className="mt-4 text-lg font-medium">Error loading posts</h3>
              <p className="text-muted-foreground">{error}</p>
              <Button 
                variant="outline" 
                onClick={() => loadPosts(filter !== "all" ? filter : undefined)}
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-medium">No posts found</h3>
              <p className="text-muted-foreground">
                {searchTerm || filter !== "all" 
                  ? 'Try a different search term or filter' 
                  : communitySettings.hide_sensitive_content 
                    ? 'No posts match your current privacy filter settings' 
                    : 'Be the first to post in our community!'}
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                onLike={handlePostLike} 
              />
            ))
          )}
        </div>
        
        {!isPremium && (
          <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Upgrade to Premium</h3>
                <p className="text-sm text-muted-foreground">Join exclusive community groups and expert-led discussions</p>
              </div>
              <Button 
                onClick={() => window.location.href = '/premium'} 
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Upgrade
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CommunityPage;
