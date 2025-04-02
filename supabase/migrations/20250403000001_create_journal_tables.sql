-- Create journal_entries table
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  mood TEXT,
  tags TEXT[],
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create journal_analytics table for storing analytics data
CREATE TABLE IF NOT EXISTS public.journal_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  entry_count INTEGER DEFAULT 0,
  mood_distribution JSONB, -- Store mood frequencies
  common_tags JSONB, -- Store most common tags
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on the tables
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for journal_entries
CREATE POLICY "Users can view their own journal entries"
  ON public.journal_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journal entries"
  ON public.journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal entries"
  ON public.journal_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal entries"
  ON public.journal_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for journal_analytics
CREATE POLICY "Users can view their own journal analytics"
  ON public.journal_analytics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journal analytics"
  ON public.journal_analytics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal analytics"
  ON public.journal_analytics FOR UPDATE
  USING (auth.uid() = user_id);

-- Create trigger function to update analytics on journal entry changes
CREATE OR REPLACE FUNCTION update_journal_analytics()
RETURNS TRIGGER AS $$
DECLARE
  entry_count INTEGER;
  mood_dist JSONB;
  tags_dist JSONB;
BEGIN
  -- Calculate entry count
  SELECT COUNT(*) INTO entry_count 
  FROM public.journal_entries 
  WHERE user_id = NEW.user_id;
  
  -- Calculate mood distribution
  SELECT jsonb_object_agg(mood, count)
  INTO mood_dist
  FROM (
    SELECT mood, COUNT(*) as count
    FROM public.journal_entries
    WHERE user_id = NEW.user_id AND mood IS NOT NULL
    GROUP BY mood
  ) moods;
  
  -- Calculate common tags
  SELECT jsonb_object_agg(tag, count)
  INTO tags_dist
  FROM (
    SELECT tag, COUNT(*) as count
    FROM public.journal_entries, unnest(tags) as tag
    WHERE user_id = NEW.user_id
    GROUP BY tag
    ORDER BY count DESC
    LIMIT 10
  ) top_tags;
  
  -- Insert or update analytics
  INSERT INTO public.journal_analytics (
    user_id, 
    entry_count, 
    mood_distribution, 
    common_tags, 
    last_updated
  )
  VALUES (
    NEW.user_id,
    entry_count,
    COALESCE(mood_dist, '{}'::jsonb),
    COALESCE(tags_dist, '{}'::jsonb),
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    entry_count = EXCLUDED.entry_count,
    mood_distribution = EXCLUDED.mood_distribution,
    common_tags = EXCLUDED.common_tags,
    last_updated = EXCLUDED.last_updated;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER journal_analytics_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.journal_entries
FOR EACH ROW EXECUTE FUNCTION update_journal_analytics();

-- Insert sample journal entries
INSERT INTO public.journal_entries (
  user_id,
  title,
  content,
  mood,
  tags,
  is_favorite
)
SELECT 
  auth.uid(),
  'My First Journal Entry',
  'Today I tried meditation for the first time. It was really challenging to calm my mind, but after about 5 minutes I started to feel more relaxed.',
  'calm',
  ARRAY['meditation', 'beginner', 'mindfulness'],
  true
FROM auth.users
WHERE email = 'test@example.com'
LIMIT 1;

INSERT INTO public.journal_entries (
  user_id,
  title,
  content,
  mood,
  tags
)
SELECT 
  auth.uid(),
  'Anxiety Management',
  'Had a stressful day at work, but used the breathing techniques I learned in the app. They really helped calm me down when I felt overwhelmed.',
  'anxious',
  ARRAY['anxiety', 'breathing', 'work']
FROM auth.users
WHERE email = 'test@example.com'
LIMIT 1; 