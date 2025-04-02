-- Create meditations table
CREATE TABLE IF NOT EXISTS public.meditations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  audio_url TEXT NOT NULL,
  cover_image TEXT,
  duration INTEGER, -- duration in seconds
  instructor TEXT,
  category TEXT,
  tags TEXT[],
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_favorites for storing favorite meditations
CREATE TABLE IF NOT EXISTS public.user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  meditation_id UUID REFERENCES public.meditations(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, meditation_id)
);

-- Create meditation_history for tracking user meditation sessions
CREATE TABLE IF NOT EXISTS public.meditation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  meditation_id UUID REFERENCES public.meditations(id) NOT NULL,
  completed BOOLEAN DEFAULT false,
  date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  duration_seconds INTEGER
);

-- Create mood_entries table for mood tracking
CREATE TABLE IF NOT EXISTS public.mood_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  mood TEXT NOT NULL,
  notes TEXT,
  factors JSONB,
  date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.meditations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meditation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for meditations (viewable by all users)
CREATE POLICY "Meditations are viewable by all users"
  ON public.meditations FOR SELECT
  USING (true);

-- Create policies for user_favorites
CREATE POLICY "Users can view their own favorites"
  ON public.user_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
  ON public.user_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON public.user_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for meditation_history
CREATE POLICY "Users can view their own meditation history"
  ON public.meditation_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meditation history"
  ON public.meditation_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meditation history"
  ON public.meditation_history FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policies for mood_entries
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own mood entries'
    ) THEN
        CREATE POLICY "Users can view their own mood entries"
        ON public.mood_entries FOR SELECT
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own mood entries'
    ) THEN
        CREATE POLICY "Users can insert their own mood entries"
        ON public.mood_entries FOR INSERT
        WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own mood entries'
    ) THEN
        CREATE POLICY "Users can update their own mood entries"
        ON public.mood_entries FOR UPDATE
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own mood entries'
    ) THEN
        CREATE POLICY "Users can delete their own mood entries"
        ON public.mood_entries FOR DELETE
        USING (auth.uid() = user_id);
    END IF;
END
$$; 