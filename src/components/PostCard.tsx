import { useState } from "react";
import { Heart, MessageCircle, Share2, Loader2 } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CommentSection } from "./CommentSection";
import { EnhancedPost } from "@/types/community";
import { togglePostLike } from "@/utils/communityService";
import { useAuth } from "@/contexts/AuthContext";

interface PostCardProps {
  post: EnhancedPost;
  onLike?: (postId: string, liked: boolean) => void;
}

export function PostCard({ post, onLike }: PostCardProps) {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.comments_count);
  const [likes, setLikes] = useState(post.likes_count);
  const [liked, setLiked] = useState(post.isLiked || false);
  
  const handleLike = async () => {
    if (!user) {
      toast.error("Please log in to like posts");
      return;
    }
    
    setIsLiking(true);
    try {
      const { liked: newLikedState } = await togglePostLike(post.id, user.id);
      setLiked(newLikedState);
      setLikes(prev => newLikedState ? prev + 1 : prev - 1);
      
      if (onLike) {
        onLike(post.id, newLikedState);
      }
    } catch (error) {
      console.error("Error liking post:", error);
      toast.error("Failed to like post. Please try again.");
    } finally {
      setIsLiking(false);
    }
  };
  
  const handleShare = () => {
    // Create a shareable URL
    const url = `${window.location.origin}/community/post/${post.id}`;
    
    // Try to use the Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: `Post by ${post.author?.name}`,
        text: post.content.substring(0, 100) + (post.content.length > 100 ? "..." : ""),
        url
      }).catch(error => {
        console.error("Error sharing:", error);
        toast.error("Failed to share post");
      });
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(url).then(() => {
        toast.success("Link copied to clipboard!");
      }).catch(error => {
        console.error("Error copying link:", error);
        toast.error("Failed to copy link");
      });
    }
  };
  
  const handleCommentCountChange = (count: number) => {
    setCommentsCount(count);
  };
  
  // Format post content to handle long posts
  const formatContent = () => {
    if (post.content.length < 300 || isExpanded) {
      return post.content;
    }
    
    return post.content.substring(0, 300) + "...";
  };
  
  return (
    <Card className="overflow-hidden mb-6">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={post.author?.avatar} alt={post.author?.name} />
            <AvatarFallback>{post.author?.name?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{post.author?.name}</div>
            <div className="text-xs text-muted-foreground">
              {new Date(post.created_at).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
          {post.is_premium_only && (
            <Badge variant="secondary" className="ml-auto">Premium</Badge>
          )}
          {post.is_pinned && (
            <Badge variant="outline" className="ml-2">Pinned</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap">{formatContent()}</p>
        
        {post.content.length > 300 && !isExpanded && (
          <Button
            variant="link"
            className="p-0 h-auto mt-1 text-primary"
            onClick={() => setIsExpanded(true)}
          >
            Read more
          </Button>
        )}
        
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
          onClick={handleLike}
          className={liked ? "text-red-500" : ""}
          disabled={isLiking}
        >
          {isLiking ? (
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
          ) : (
            <Heart className={`mr-1 h-4 w-4 ${liked ? "fill-current" : ""}`} />
          )}
          {likes}
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle className="mr-1 h-4 w-4" /> {commentsCount}
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="ml-auto"
          onClick={handleShare}
        >
          <Share2 className="mr-1 h-4 w-4" /> Share
        </Button>
      </CardFooter>
      
      {showComments && (
        <div className="px-4 pb-4 border-t border-border pt-2">
          <CommentSection 
            postId={post.id} 
            initialCommentCount={commentsCount}
            onCommentCountChange={handleCommentCountChange}
          />
        </div>
      )}
    </Card>
  );
} 