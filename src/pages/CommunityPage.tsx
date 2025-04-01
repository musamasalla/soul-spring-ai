
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { Heart, MessageCircle, Share2, Filter, Search, Users, Send, AlertTriangle } from "lucide-react";

interface Post {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  content: string;
  created_at: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
  tags?: string[];
}

const CommunityPage = () => {
  const { user, isPremium } = useAuth();
  const [posts, setPosts] = useState<Post[]>([
    {
      id: "1",
      author: {
        id: "user1",
        name: "Sarah J.",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
      },
      content: "Just completed a 30-day meditation challenge! It's been amazing for my anxiety and sleep quality. Has anyone else tried this?",
      created_at: "2023-10-15T10:30:00Z",
      likes: 24,
      comments: 8,
      isLiked: false,
      tags: ["meditation", "challenge", "anxiety"]
    },
    {
      id: "2",
      author: {
        id: "user2",
        name: "Michael T.",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael"
      },
      content: "Looking for recommendations on guided breathing exercises for panic attacks. The ones in the app have been helpful, but I'd love to hear what works for others!",
      created_at: "2023-10-14T15:45:00Z",
      likes: 18,
      comments: 12,
      isLiked: true,
      tags: ["anxiety", "panic", "breathing"]
    },
    {
      id: "3",
      author: {
        id: "user3",
        name: "Elena R.",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena"
      },
      content: "Today marks 6 months since I started therapy alongside using this app. The combination has been transformative for my mental health journey. Stay strong everyone!",
      created_at: "2023-10-10T09:15:00Z",
      likes: 45,
      comments: 15,
      isLiked: false,
      tags: ["therapy", "mentalhealth", "progress"]
    }
  ]);
  
  const [newPost, setNewPost] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const handleLikePost = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const newIsLiked = !post.isLiked;
        return {
          ...post,
          isLiked: newIsLiked,
          likes: post.likes + (newIsLiked ? 1 : -1)
        };
      }
      return post;
    }));
  };

  const handleSubmitPost = async () => {
    if (!newPost.trim()) return;

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newPostObj: Post = {
        id: Date.now().toString(),
        author: {
          id: user?.id || "unknown",
          name: user?.name || "Anonymous",
          avatar: user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || "Anonymous"}`
        },
        content: newPost,
        created_at: new Date().toISOString(),
        likes: 0,
        comments: 0,
        isLiked: false,
        tags: newPost.match(/#(\w+)/g)?.map(tag => tag.substring(1)) || []
      };
      
      setPosts([newPostObj, ...posts]);
      setNewPost("");
      toast.success("Post shared with the community!");
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to share your post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter posts based on selected filter and search term
  const filteredPosts = posts.filter(post => {
    // Search term filter
    const matchesSearch = searchTerm === "" || 
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Category filter
    if (filter === "all") return matchesSearch;
    if (filter === "liked") return matchesSearch && post.isLiked;
    if (filter === "meditation") return matchesSearch && post.tags?.includes("meditation");
    if (filter === "anxiety") return matchesSearch && post.tags?.includes("anxiety");
    
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto p-4 pt-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Community</h1>
            <p className="text-muted-foreground">Connect with others on their mental health journey</p>
          </div>
          <Button 
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => window.scrollTo({ top: document.getElementById('new-post')?.offsetTop, behavior: 'smooth' })}
          >
            <Users className="mr-2 h-4 w-4" /> New Post
          </Button>
        </div>
        
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
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="all">All Posts</option>
              <option value="liked">Liked</option>
              <option value="meditation">Meditation</option>
              <option value="anxiety">Anxiety</option>
            </select>
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
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button 
              onClick={handleSubmitPost}
              disabled={!newPost.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <>Posting...</>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" /> Share Post
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <div className="space-y-6">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-medium">No posts found</h3>
              <p className="text-muted-foreground">
                {searchTerm || filter !== "all" 
                  ? 'Try a different search term or filter' 
                  : 'Be the first to post in our community!'}
              </p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={post.author.avatar} alt={post.author.name} />
                      <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{post.author.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{post.content}</p>
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {post.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t border-border p-2 flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleLikePost(post.id)}
                    className={post.isLiked ? "text-red-500" : ""}
                  >
                    <Heart className={`mr-1 h-4 w-4 ${post.isLiked ? "fill-current" : ""}`} /> {post.likes}
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MessageCircle className="mr-1 h-4 w-4" /> {post.comments}
                  </Button>
                  <Button variant="ghost" size="sm" className="ml-auto">
                    <Share2 className="mr-1 h-4 w-4" /> Share
                  </Button>
                </CardFooter>
              </Card>
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
