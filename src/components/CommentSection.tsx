import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { Heart, Reply, Loader2, AlertTriangle } from "lucide-react";
import { EnhancedComment, CommentData } from "@/types/community";
import { fetchComments, createComment, toggleCommentLike } from "@/utils/communityService";
import { supabase } from "@/integrations/supabase/client";

interface CommentSectionProps {
  postId: string;
  initialCommentCount?: number;
  onCommentCountChange?: (count: number) => void;
}

interface CommunitySettings {
  disable_community: boolean;
  hide_sensitive_content: boolean;
  auto_moderation: boolean;
  mute_notifications: boolean;
  allow_direct_messages: boolean;
}

export function CommentSection({ 
  postId, 
  initialCommentCount = 0,
  onCommentCountChange
}: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<EnhancedComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedComment, setSelectedComment] = useState<string | null>(null);
  const [communitySettings, setCommunitySettings] = useState<CommunitySettings>({
    disable_community: false,
    hide_sensitive_content: true,
    auto_moderation: true,
    mute_notifications: false,
    allow_direct_messages: true,
  });
  
  // Load user's community settings
  useEffect(() => {
    const loadCommunitySettings = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('community_settings')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error("Error loading community settings:", error);
          return;
        }
        
        if (data && data.community_settings) {
          setCommunitySettings(data.community_settings as CommunitySettings);
        }
      } catch (error) {
        console.error("Error loading community settings:", error);
      }
    };
    
    loadCommunitySettings();
  }, [user]);
  
  // Fetch comments on component mount
  useEffect(() => {
    loadComments();
  }, [postId]);
  
  const loadComments = async () => {
    setIsLoading(true);
    try {
      const commentsData = await fetchComments(postId);
      setComments(commentsData);
      if (onCommentCountChange) {
        onCommentCountChange(commentsData.length);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("Failed to load comments. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;
    
    // Check for potentially sensitive content if auto moderation is enabled
    if (communitySettings.auto_moderation) {
      const sensitiveTerms = ['kill', 'die', 'suicide', 'harm', 'hurt myself', 'end it all'];
      const containsSensitiveContent = sensitiveTerms.some(term => 
        newComment.toLowerCase().includes(term.toLowerCase())
      );
      
      if (containsSensitiveContent) {
        toast.error("Your comment may contain sensitive content that goes against our community guidelines. Please revise it or contact support for help.");
        return;
      }
    }
    
    setIsSubmitting(true);
    try {
      const commentData: CommentData = {
        content: newComment,
        post_id: postId,
        parent_id: replyTo,
        is_anonymous: false
      };
      
      const newCommentData = await createComment(commentData);
      
      if (!newCommentData) {
        throw new Error("Failed to create comment");
      }
      
      // Update local state
      if (replyTo) {
        // If it's a reply, add it to the parent comment
        setComments(comments.map(comment => {
          if (comment.id === replyTo) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newCommentData]
            };
          }
          return comment;
        }));
      } else {
        // If it's a top-level comment, add to the list
        setComments([...comments, newCommentData]);
        if (onCommentCountChange) {
          onCommentCountChange(comments.length + 1);
        }
      }
      
      // Reset state
      setNewComment("");
      setReplyTo(null);
      toast.success("Comment posted successfully!");
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast.error("Failed to post comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleLikeComment = async (commentId: string) => {
    if (!user) {
      toast.error("Please log in to like comments");
      return;
    }
    
    try {
      setSelectedComment(commentId);
      const { liked } = await toggleCommentLike(commentId, user.id);
      
      // Update local state with simplified logic to avoid deep type instantiation
      setComments(prevComments => {
        // Create a deep copy to avoid mutating state directly
        return prevComments.map(comment => {
          // Check if this is the comment we're updating
          if (comment.id === commentId) {
            return {
              ...comment,
              likes_count: liked ? comment.likes_count + 1 : comment.likes_count - 1,
              isLiked: liked
            };
          }
          
          // If this comment has replies, check them
          if (comment.replies && comment.replies.length > 0) {
            // Find if the comment to update is in the replies
            const replyIndex = comment.replies.findIndex(r => r.id === commentId);
            
            // If we found the reply, update it
            if (replyIndex >= 0) {
              const updatedReplies = [...comment.replies];
              updatedReplies[replyIndex] = {
                ...updatedReplies[replyIndex],
                likes_count: liked ? updatedReplies[replyIndex].likes_count + 1 : updatedReplies[replyIndex].likes_count - 1,
                isLiked: liked
              };
              
              return {
                ...comment,
                replies: updatedReplies
              };
            }
          }
          
          // Not the comment we're looking for
          return comment;
        });
      });
      
      toast.success(liked ? "Comment liked" : "Comment unliked");
    } catch (error) {
      console.error("Error liking comment:", error);
      toast.error("Failed to like comment. Please try again.");
    } finally {
      setSelectedComment(null);
    }
  };
  
  const renderComment = (comment: EnhancedComment, isReply = false) => (
    <Card 
      key={comment.id} 
      className={`mb-3 ${isReply ? 'ml-8 border-l-4 border-l-primary/20' : ''}`}
    >
      <CardContent className="p-3 pb-2">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.author?.avatar} alt={comment.author?.name} />
            <AvatarFallback>{comment.author?.name?.[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-sm">{comment.author?.name}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(comment.created_at).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
            <p className="mt-1 text-sm">{comment.content}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-2 flex gap-2">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => handleLikeComment(comment.id)}
          className={`text-xs ${comment.isLiked ? "text-red-500" : ""}`}
          disabled={selectedComment === comment.id}
        >
          {selectedComment === comment.id ? (
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          ) : (
            <Heart className={`h-3 w-3 mr-1 ${comment.isLiked ? "fill-current" : ""}`} />
          )}
          {comment.likes_count}
        </Button>
        {!isReply && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs"
            onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
          >
            <Reply className="h-3 w-3 mr-1" /> Reply
          </Button>
        )}
      </CardFooter>
      
      {/* Show reply form if this comment is selected for reply */}
      {replyTo === comment.id && (
        <div className="px-3 pb-3">
          <div className="flex gap-2 items-start">
            <Avatar className="h-6 w-6">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Write a reply..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px] text-sm"
              />
              {communitySettings.auto_moderation && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  <AlertTriangle className="inline-block h-3 w-3 mr-1" /> 
                  Content moderation is enabled
                </p>
              )}
              <div className="flex justify-end gap-2 mt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setReplyTo(null);
                    setNewComment("");
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm"
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" /> Posting...
                    </>
                  ) : (
                    "Post Reply"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="px-3 pb-3">
          {comment.replies.map(reply => renderComment(reply, true))}
        </div>
      )}
    </Card>
  );
  
  return (
    <div className="mt-4">
      <h3 className="font-medium mb-4">Comments ({comments.length})</h3>
      
      {/* New comment form */}
      {user && !replyTo && (
        <div className="mb-6">
          <div className="flex gap-3 items-start">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[100px]"
              />
              {communitySettings.auto_moderation && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  <AlertTriangle className="inline-block h-3 w-3 mr-1" /> 
                  Content moderation is enabled. Posts with harmful content may be automatically filtered.
                </p>
              )}
              <div className="flex justify-end mt-2">
                <Button 
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Posting...
                    </>
                  ) : (
                    "Post Comment"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Comments list */}
      <div>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map(comment => renderComment(comment))
        )}
      </div>
    </div>
  );
} 