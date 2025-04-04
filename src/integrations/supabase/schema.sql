-- Create therapy_goals table
CREATE TABLE IF NOT EXISTS public.therapy_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create therapy_sessions table
CREATE TABLE IF NOT EXISTS public.therapy_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    summary TEXT,
    notes TEXT,
    duration INTEGER, -- in minutes
    date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create session_goals table to connect therapy sessions with goals
CREATE TABLE IF NOT EXISTS public.session_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.therapy_sessions(id) ON DELETE CASCADE,
    goal_id UUID NOT NULL REFERENCES public.therapy_goals(id) ON DELETE CASCADE,
    progress TEXT NOT NULL CHECK (progress IN ('not_started', 'in_progress', 'good', 'completed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add row-level security policies
ALTER TABLE public.therapy_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapy_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_goals ENABLE ROW LEVEL SECURITY;

-- Create policies for therapy_goals
CREATE POLICY "Users can view their own therapy goals" 
    ON public.therapy_goals FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own therapy goals" 
    ON public.therapy_goals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own therapy goals" 
    ON public.therapy_goals FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own therapy goals" 
    ON public.therapy_goals FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for therapy_sessions
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

-- Create policies for session_goals
-- For session_goals, we need to join with therapy_sessions to verify ownership
CREATE POLICY "Users can view their own session goals" 
    ON public.session_goals FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.therapy_sessions
            WHERE therapy_sessions.id = session_goals.session_id
            AND therapy_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert session goals for their therapy sessions" 
    ON public.session_goals FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.therapy_sessions
            WHERE therapy_sessions.id = session_goals.session_id
            AND therapy_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update session goals for their therapy sessions" 
    ON public.session_goals FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.therapy_sessions
            WHERE therapy_sessions.id = session_goals.session_id
            AND therapy_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete session goals for their therapy sessions" 
    ON public.session_goals FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.therapy_sessions
            WHERE therapy_sessions.id = session_goals.session_id
            AND therapy_sessions.user_id = auth.uid()
        )
    );

-- Create function to get monthly TTS usage
CREATE OR REPLACE FUNCTION public.get_monthly_tts_usage(user_id UUID)
RETURNS TABLE (
    month TEXT,
    character_count BIGINT
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
    SELECT 
        TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') as month,
        SUM(character_count) as character_count
    FROM 
        public.tts_usage
    WHERE 
        user_id = get_monthly_tts_usage.user_id
        AND created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '2 months')
    GROUP BY 
        DATE_TRUNC('month', created_at)
    ORDER BY 
        DATE_TRUNC('month', created_at) DESC;
$$;

-- Create TTS usage tracking table
CREATE TABLE IF NOT EXISTS public.tts_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    character_count INTEGER NOT NULL,
    text_snippet TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS for tts_usage
ALTER TABLE public.tts_usage ENABLE ROW LEVEL SECURITY;

-- Create policies for tts_usage
CREATE POLICY "Users can view their own TTS usage" 
    ON public.tts_usage FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own TTS usage" 
    ON public.tts_usage FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Grant permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated, anon, service_role;
GRANT ALL ON TABLE public.therapy_goals TO authenticated, anon, service_role;
GRANT ALL ON TABLE public.therapy_sessions TO authenticated, anon, service_role;
GRANT ALL ON TABLE public.session_goals TO authenticated, anon, service_role;
GRANT ALL ON TABLE public.tts_usage TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.get_monthly_tts_usage TO authenticated, anon, service_role;

-- Force cache refresh for schema
NOTIFY pgrst, 'reload schema'; 