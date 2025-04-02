-- Create therapy_sessions table
CREATE TABLE IF NOT EXISTS public.therapy_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  primary_topic TEXT,
  session_goal TEXT,
  duration INTEGER DEFAULT 30,
  current_stage TEXT DEFAULT 'opening',
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create secure RLS policies
ALTER TABLE public.therapy_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own therapy sessions"
  ON public.therapy_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own therapy sessions"
  ON public.therapy_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own therapy sessions"
  ON public.therapy_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own therapy sessions"
  ON public.therapy_sessions FOR DELETE
  USING (auth.uid() = user_id); 