import { Database } from '@/integrations/supabase/types';

// Type for a community post from the database
export type CommunityPost = Database['public']['Tables']['community_posts']['Row'];

// Type for a post like from the database
export type PostLike = Database['public']['Tables']['post_likes']['Row'];

// Type for a post comment from the database
export type PostComment = Database['public']['Tables']['post_comments']['Row'];

// Type for a comment like from the database
export type CommentLike = Database['public']['Tables']['comment_likes']['Row'];

// Type for a community category from the database
export type CommunityCategory = Database['public']['Tables']['community_categories']['Row'];

// Type for a post category mapping from the database
export type PostCategory = Database['public']['Tables']['post_categories']['Row'];

// Type for creating a new post
export type NewPost = {
  content: string;
  tags?: string[];
  categoryIds?: string[];
  isPremiumOnly?: boolean;
};

// Type for creating a new comment
export type NewComment = {
  postId: string;
  content: string;
  parentCommentId?: string;
};

export interface Author {
  id: string;
  name: string | null;
  avatar: string | null;
}

// Type for a comment with additional information
export interface EnhancedComment extends PostComment {
  author?: Author;
  likes_count: number;
  isLiked?: boolean;
  replies?: EnhancedComment[];
}

// Type for a post with additional information
export interface EnhancedPost extends Omit<CommunityPost, 'tags'> {
  author?: Author;
  likes_count: number;
  comments_count: number;
  isLiked?: boolean;
  categories?: CommunityCategory[];
  tags?: string[] | null;
}

export interface SubmitPostData {
  title?: string;
  content: string;
  is_anonymous: boolean;
  is_premium_only: boolean;
  category_ids?: string[];
}

export interface CommentData {
  content: string;
  post_id: string;
  parent_id?: string | null;
  is_anonymous: boolean;
}

export interface FetchPostsOptions {
  categoryId?: string;
  searchQuery?: string;
  page?: number;
  limit?: number;
} 