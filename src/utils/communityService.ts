import { supabase } from "@/integrations/supabase/client";
import { 
  EnhancedPost, 
  EnhancedComment, 
  CommunityCategory,
  CommentData,
  SubmitPostData,
  FetchPostsOptions,
  Author
} from "@/types/community";

// Fetch posts with author information
export const fetchPosts = async (options?: FetchPostsOptions): Promise<EnhancedPost[]> => {
  try {
    const {
      categoryId,
      searchQuery,
      page = 1,
      limit = 20
    } = options || {};

    // Start query building
    let query = supabase
      .from('community_posts')
      .select('*')  // Only select post data without trying to join profiles
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
      
    // Add category filter if provided
    if (categoryId) {
      const { data: categoryPosts } = await supabase
        .from('post_categories')
        .select('post_id')
        .eq('category_id', categoryId);
      
      if (categoryPosts && categoryPosts.length > 0) {
        const postIds = categoryPosts.map(cp => cp.post_id);
        query = query.in('id', postIds);
      } else {
        return []; // No posts in this category
      }
    }
    
    // Add search filter if provided
    if (searchQuery) {
      query = query.or(`content.ilike.%${searchQuery}%`);
    }
    
    const { data: posts, error } = await query;
    
    if (error) {
      throw error;
    }
    
    if (!posts || posts.length === 0) {
      return [];
    }
    
    // Get unique user IDs from posts
    const userIds = [...new Set(posts.map(post => post.user_id))];
    
    // Fetch profiles for these users in a separate query
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, avatar_url')
      .in('id', userIds);
      
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      // Continue anyway, we'll use fallback data for profiles
    }
    
    // Create a map of user IDs to profile data for quick lookup
    const profileMap = new Map();
    if (profiles) {
      profiles.forEach(profile => {
        profileMap.set(profile.id, profile);
      });
    }
    
    // Format the response with profile data
    const enhancedPosts: EnhancedPost[] = posts.map(post => {
      const profile = profileMap.get(post.user_id);
      
      const author: Author = {
        id: post.user_id,
        name: profile?.name || "Unknown User",
        avatar: profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.name || 'Unknown'}`
      };
      
      return {
        ...post,
        author,
        isLiked: undefined,
      } as EnhancedPost;
    });
    
    return enhancedPosts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

// Create a new post
export const createPost = async (postData: SubmitPostData): Promise<EnhancedPost | null> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    // Extract hashtags from content (e.g., #anxiety, #meditation)
    const tags = postData.content.match(/#(\w+)/g)?.map(tag => tag.substring(1)) || [];
    
    // Create the post
    const { data: newPost, error } = await supabase
      .from('community_posts')
      .insert({
        user_id: userId,
        content: postData.content,
        tags,
        is_premium_only: postData.is_premium_only || false
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    if (!newPost) {
      throw new Error('Failed to create post');
    }
    
    // If there are category IDs, add categories to the post
    if (postData.category_ids && postData.category_ids.length > 0) {
      const categoryPromises = postData.category_ids.map(categoryId => 
        supabase
          .from('post_categories')
          .insert({
            post_id: newPost.id,
            category_id: categoryId
          })
      );
      
      await Promise.all(categoryPromises);
    }
    
    // Get author details
    const { data: profileData } = await supabase
      .from('profiles')
      .select('name, avatar_url')
      .eq('id', userId)
      .single();
    
    // Format the response
    const enhancedPost: EnhancedPost = {
      ...newPost,
      author: {
        id: userId,
        name: profileData?.name,
        avatar: profileData?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileData?.name || 'Unknown'}`
      },
      likes_count: 0,
      comments_count: 0,
      isLiked: false
    };
    
    return enhancedPost;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

// Like or unlike a post
export const togglePostLike = async (postId: string, userId: string): Promise<{ liked: boolean }> => {
  try {
    // Check if the user has already liked the post
    const { data: existingLike, error: checkError } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (checkError) {
      throw checkError;
    }
    
    if (existingLike) {
      // Unlike the post
      const { error: unlikeError } = await supabase
        .from('post_likes')
        .delete()
        .eq('id', existingLike.id);
      
      if (unlikeError) {
        throw unlikeError;
      }
      
      return { liked: false };
    } else {
      // Like the post
      const { error: likeError } = await supabase
        .from('post_likes')
        .insert({
          post_id: postId,
          user_id: userId
        });
      
      if (likeError) {
        throw likeError;
      }
      
      return { liked: true };
    }
  } catch (error) {
    console.error('Error toggling post like:', error);
    throw error;
  }
};

// Check if a user has liked a post
export const checkPostLike = async (postId: string, userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      throw error;
    }
    
    return !!data;
  } catch (error) {
    console.error('Error checking post like:', error);
    throw error;
  }
};

// Fetch comments for a post
export const fetchComments = async (postId: string): Promise<EnhancedComment[]> => {
  try {
    // Fetch comments
    const { data: comments, error } = await supabase
      .from('post_comments')
      .select('*')
      .eq('post_id', postId)
      .eq('status', 'active')
      .order('created_at', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    if (!comments || comments.length === 0) {
      return [];
    }
    
    // Get unique user IDs from comments
    const userIds = [...new Set(comments.map(comment => comment.user_id))];
    
    // Fetch profiles for these users in a separate query
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, avatar_url')
      .in('id', userIds);
      
    if (profilesError) {
      console.error('Error fetching profiles for comments:', profilesError);
      // Continue anyway, we'll use fallback data for profiles
    }
    
    // Create a map of user IDs to profile data for quick lookup
    const profileMap = new Map();
    if (profiles) {
      profiles.forEach(profile => {
        profileMap.set(profile.id, profile);
      });
    }
    
    // Format the response with profile data
    const enhancedComments: EnhancedComment[] = comments.map(comment => {
      const profile = profileMap.get(comment.user_id);
      
      return {
        ...comment,
        author: {
          id: comment.user_id,
          name: profile?.name || "Unknown User",
          avatar: profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.name || 'Unknown'}`
        }
      } as EnhancedComment;
    });
    
    // Organize comments into a tree structure for replies
    const commentMap = new Map<string, EnhancedComment>();
    const rootComments: EnhancedComment[] = [];
    
    // First pass: create a map of all comments
    enhancedComments.forEach(comment => {
      comment.replies = [];
      commentMap.set(comment.id, comment);
    });
    
    // Second pass: organize them into a tree
    enhancedComments.forEach(comment => {
      if (comment.parent_comment_id) {
        const parentComment = commentMap.get(comment.parent_comment_id);
        if (parentComment) {
          parentComment.replies?.push(comment);
        } else {
          rootComments.push(comment);
        }
      } else {
        rootComments.push(comment);
      }
    });
    
    return rootComments;
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

// Create a new comment
export const createComment = async (commentData: CommentData): Promise<EnhancedComment | null> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    // Create the comment
    const { data: newComment, error } = await supabase
      .from('post_comments')
      .insert({
        post_id: commentData.post_id,
        user_id: userId,
        content: commentData.content,
        parent_comment_id: commentData.parent_id || null
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    if (!newComment) {
      throw new Error('Failed to create comment');
    }
    
    // Get author profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('name, avatar_url')
      .eq('id', userId)
      .single();
      
    if (profileError) {
      console.error('Error fetching profile for comment author:', profileError);
      // Continue anyway, we'll use fallback data
    }
    
    // Format the response
    const enhancedComment: EnhancedComment = {
      ...newComment,
      author: {
        id: userId,
        name: profile?.name || "Unknown User",
        avatar: profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.name || 'Unknown'}`
      },
      replies: []
    };
    
    return enhancedComment;
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
};

// Like or unlike a comment
export const toggleCommentLike = async (commentId: string, userId: string): Promise<{ liked: boolean }> => {
  try {
    // Check if the user has already liked the comment
    const { data: existingLike, error: checkError } = await supabase
      .from('comment_likes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (checkError) {
      throw checkError;
    }
    
    if (existingLike) {
      // Unlike the comment
      const { error: unlikeError } = await supabase
        .from('comment_likes')
        .delete()
        .eq('id', existingLike.id);
      
      if (unlikeError) {
        throw unlikeError;
      }
      
      return { liked: false };
    } else {
      // Like the comment
      const { error: likeError } = await supabase
        .from('comment_likes')
        .insert({
          comment_id: commentId,
          user_id: userId
        });
      
      if (likeError) {
        throw likeError;
      }
      
      return { liked: true };
    }
  } catch (error) {
    console.error('Error toggling comment like:', error);
    throw error;
  }
};

// Fetch categories
export const fetchCategories = async (): Promise<CommunityCategory[]> => {
  try {
    const { data, error } = await supabase
      .from('community_categories')
      .select('*')
      .eq('status', 'active')
      .order('sort_order', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}; 