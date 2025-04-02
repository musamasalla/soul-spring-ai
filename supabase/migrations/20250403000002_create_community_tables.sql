-- Create community_posts table
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_premium_only BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active', -- active, deleted, flagged, hidden
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create post_likes table
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create post_comments table
CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  parent_comment_id UUID REFERENCES public.post_comments(id),
  status TEXT DEFAULT 'active', -- active, deleted, flagged, hidden
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create comment_likes table
CREATE TABLE IF NOT EXISTS public.comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- Create community_categories table
CREATE TABLE IF NOT EXISTS public.community_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT,
  is_premium_only BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active', -- active, hidden, deleted
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create post_categories table (for many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.post_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.community_categories(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(post_id, category_id)
);

-- Enable RLS on all tables
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_categories ENABLE ROW LEVEL SECURITY;

-- RLS for community_posts
-- Anyone can view active posts that aren't premium-only
CREATE POLICY "Anyone can view active non-premium posts"
  ON public.community_posts FOR SELECT
  USING (status = 'active' AND (NOT is_premium_only OR is_premium_only = false));
  
-- Premium users can view all active posts including premium-only ones
CREATE POLICY "Premium users can view all active posts"
  ON public.community_posts FOR SELECT
  USING (status = 'active' AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.is_premium = true
  ));

-- Users can create posts
CREATE POLICY "Users can create posts"
  ON public.community_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own posts
CREATE POLICY "Users can update their own posts"
  ON public.community_posts FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete their own posts"
  ON public.community_posts FOR DELETE
  USING (auth.uid() = user_id);

-- RLS for post_likes
-- Users can view post likes
CREATE POLICY "Anyone can view post likes"
  ON public.post_likes FOR SELECT
  USING (true);

-- Users can like posts
CREATE POLICY "Users can like posts"
  ON public.post_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can remove their own likes
CREATE POLICY "Users can remove their own likes"
  ON public.post_likes FOR DELETE
  USING (auth.uid() = user_id);

-- RLS for post_comments
-- Anyone can view comments on active posts
CREATE POLICY "Anyone can view comments on active posts"
  ON public.post_comments FOR SELECT
  USING (status = 'active' AND EXISTS (
    SELECT 1 FROM public.community_posts
    WHERE post_comments.post_id = community_posts.id
    AND community_posts.status = 'active'
    AND (NOT community_posts.is_premium_only OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_premium = true
    ))
  ));

-- Users can add comments
CREATE POLICY "Users can add comments"
  ON public.post_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "Users can update their own comments"
  ON public.post_comments FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
  ON public.post_comments FOR DELETE
  USING (auth.uid() = user_id);

-- RLS for comment_likes
-- Anyone can view comment likes
CREATE POLICY "Anyone can view comment likes"
  ON public.comment_likes FOR SELECT
  USING (true);

-- Users can like comments
CREATE POLICY "Users can like comments"
  ON public.comment_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can remove their own comment likes
CREATE POLICY "Users can remove their own comment likes"
  ON public.comment_likes FOR DELETE
  USING (auth.uid() = user_id);

-- RLS for community_categories
-- Anyone can view active categories
CREATE POLICY "Anyone can view active categories"
  ON public.community_categories FOR SELECT
  USING (status = 'active');

-- RLS for post_categories
-- Anyone can view post categories
CREATE POLICY "Anyone can view post categories"
  ON public.post_categories FOR SELECT
  USING (true);

-- Users can categorize their own posts
CREATE POLICY "Users can categorize their own posts"
  ON public.post_categories FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.community_posts
    WHERE post_categories.post_id = community_posts.id
    AND community_posts.user_id = auth.uid()
  ));

-- Users can update categories of their own posts
CREATE POLICY "Users can update categories of their own posts"
  ON public.post_categories FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.community_posts
    WHERE post_categories.post_id = community_posts.id
    AND community_posts.user_id = auth.uid()
  ));

-- Users can remove categories from their own posts
CREATE POLICY "Users can remove categories from their own posts"
  ON public.post_categories FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.community_posts
    WHERE post_categories.post_id = community_posts.id
    AND community_posts.user_id = auth.uid()
  ));

-- Create functions and triggers to update likes and comments counts
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts
    SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts
    SET likes_count = likes_count - 1
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_post_likes_count_trigger
AFTER INSERT OR DELETE ON public.post_likes
FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.parent_comment_id IS NULL THEN
    UPDATE public.community_posts
    SET comments_count = comments_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' AND OLD.parent_comment_id IS NULL THEN
    UPDATE public.community_posts
    SET comments_count = comments_count - 1
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_post_comments_count_trigger
AFTER INSERT OR DELETE ON public.post_comments
FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.post_comments
    SET likes_count = likes_count + 1
    WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.post_comments
    SET likes_count = likes_count - 1
    WHERE id = OLD.comment_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_comment_likes_count_trigger
AFTER INSERT OR DELETE ON public.comment_likes
FOR EACH ROW EXECUTE FUNCTION update_comment_likes_count();

-- Insert initial categories
INSERT INTO public.community_categories (name, description, icon, color, sort_order)
VALUES 
  ('General', 'General discussion about mental health and wellbeing', 'MessageSquare', '#6366F1', 1),
  ('Meditation', 'Discussions about meditation practices and experiences', 'Lotus', '#8B5CF6', 2),
  ('Anxiety', 'Support and discussions related to anxiety', 'Wind', '#EC4899', 3),
  ('Depression', 'Support and discussions related to depression', 'Cloud', '#3B82F6', 4),
  ('Sleep', 'Sleep issues and improvement strategies', 'Moon', '#14B8A6', 5),
  ('Mindfulness', 'Mindfulness practices and discussions', 'Leaf', '#10B981', 6),
  ('Success Stories', 'Share your mental health journey successes', 'Trophy', '#F59E0B', 7);

-- Insert sample posts (if test user exists)
INSERT INTO public.community_posts (user_id, content, tags)
SELECT 
  auth.uid(),
  'Just completed a 30-day meditation challenge! It''s been amazing for my anxiety and sleep quality. Has anyone else tried this?',
  ARRAY['meditation', 'challenge', 'anxiety']
FROM auth.users
WHERE email = 'test@example.com'
LIMIT 1;

INSERT INTO public.community_posts (user_id, content, tags)
SELECT 
  auth.uid(),
  'Looking for recommendations on guided breathing exercises for panic attacks. The ones in the app have been helpful, but I''d love to hear what works for others!',
  ARRAY['anxiety', 'panic', 'breathing']
FROM auth.users
WHERE email = 'test@example.com'
LIMIT 1;

INSERT INTO public.community_posts (user_id, content, tags, is_featured)
SELECT 
  auth.uid(),
  'Today marks 6 months since I started therapy alongside using this app. The combination has been transformative for my mental health journey. Stay strong everyone!',
  ARRAY['therapy', 'mentalhealth', 'progress'],
  true
FROM auth.users
WHERE email = 'test@example.com'
LIMIT 1; 