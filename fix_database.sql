-- ===== DIAGNOSTIC INFORMATION =====
-- First, let's check what tables and functions actually exist
SELECT table_schema, table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

SELECT routines.routine_schema, routines.routine_name, parameters.data_type
FROM information_schema.routines
LEFT JOIN information_schema.parameters ON 
    routines.specific_name = parameters.specific_name
WHERE routines.routine_schema = 'public';

-- ===== STEP 1: CREATE MISSING TABLES WITH PROPER OWNERSHIP =====

-- Therapy Goals table
CREATE TABLE IF NOT EXISTS public.therapy_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'in_progress',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  completed_at TIMESTAMPTZ
);

-- Therapy Sessions table
CREATE TABLE IF NOT EXISTS public.therapy_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  notes TEXT,
  duration INTEGER,
  date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Session Goals join table
CREATE TABLE IF NOT EXISTS public.session_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.therapy_sessions(id) ON DELETE CASCADE NOT NULL,
  goal_id UUID REFERENCES public.therapy_goals(id) ON DELETE CASCADE NOT NULL,
  progress TEXT DEFAULT 'in_progress',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- TTS Usage table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.tts_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  characters INTEGER NOT NULL,
  model TEXT NOT NULL,
  voice TEXT,
  timestamp TIMESTAMPTZ DEFAULT now() NOT NULL,
  session_id TEXT,
  content_snippet TEXT
);

-- ===== STEP 2: ENSURE PROPER TABLE OWNERSHIP AND PERMISSIONS =====

-- Ensure tables have the correct owner (usually postgres)
ALTER TABLE IF EXISTS public.therapy_goals OWNER TO postgres;
ALTER TABLE IF EXISTS public.therapy_sessions OWNER TO postgres;
ALTER TABLE IF EXISTS public.session_goals OWNER TO postgres;
ALTER TABLE IF EXISTS public.tts_usage OWNER TO postgres;

-- Grant necessary permissions
GRANT ALL ON public.therapy_goals TO postgres, authenticator, anon, authenticated, service_role;
GRANT ALL ON public.therapy_sessions TO postgres, authenticator, anon, authenticated, service_role;
GRANT ALL ON public.session_goals TO postgres, authenticator, anon, authenticated, service_role;
GRANT ALL ON public.tts_usage TO postgres, authenticator, anon, authenticated, service_role;

-- ===== STEP 3: ENABLE ROW LEVEL SECURITY WITH PROPER POLICIES =====

-- Enable RLS on all tables
ALTER TABLE public.therapy_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapy_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tts_usage ENABLE ROW LEVEL SECURITY;

-- Create policies that allow users to access their own data
DO $$
BEGIN
    -- Therapy Goals policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'therapy_goals' AND policyname = 'therapy_goals_select_policy') THEN
        CREATE POLICY therapy_goals_select_policy ON public.therapy_goals 
        FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'therapy_goals' AND policyname = 'therapy_goals_insert_policy') THEN
        CREATE POLICY therapy_goals_insert_policy ON public.therapy_goals 
        FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'therapy_goals' AND policyname = 'therapy_goals_update_policy') THEN
        CREATE POLICY therapy_goals_update_policy ON public.therapy_goals 
        FOR UPDATE USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'therapy_goals' AND policyname = 'therapy_goals_delete_policy') THEN
        CREATE POLICY therapy_goals_delete_policy ON public.therapy_goals 
        FOR DELETE USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');
    END IF;
    
    -- Therapy Sessions policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'therapy_sessions' AND policyname = 'therapy_sessions_select_policy') THEN
        CREATE POLICY therapy_sessions_select_policy ON public.therapy_sessions 
        FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'therapy_sessions' AND policyname = 'therapy_sessions_insert_policy') THEN
        CREATE POLICY therapy_sessions_insert_policy ON public.therapy_sessions 
        FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'therapy_sessions' AND policyname = 'therapy_sessions_update_policy') THEN
        CREATE POLICY therapy_sessions_update_policy ON public.therapy_sessions 
        FOR UPDATE USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'therapy_sessions' AND policyname = 'therapy_sessions_delete_policy') THEN
        CREATE POLICY therapy_sessions_delete_policy ON public.therapy_sessions 
        FOR DELETE USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');
    END IF;
    
    -- Session Goals policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'session_goals' AND policyname = 'session_goals_select_policy') THEN
        CREATE POLICY session_goals_select_policy ON public.session_goals 
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM public.therapy_sessions 
                WHERE public.therapy_sessions.id = session_id AND 
                (public.therapy_sessions.user_id = auth.uid() OR auth.jwt() ->> 'role' = 'service_role')
            )
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'session_goals' AND policyname = 'session_goals_insert_policy') THEN
        CREATE POLICY session_goals_insert_policy ON public.session_goals 
        FOR INSERT WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.therapy_sessions 
                WHERE public.therapy_sessions.id = session_id AND 
                (public.therapy_sessions.user_id = auth.uid() OR auth.jwt() ->> 'role' = 'service_role')
            )
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'session_goals' AND policyname = 'session_goals_update_policy') THEN
        CREATE POLICY session_goals_update_policy ON public.session_goals 
        FOR UPDATE USING (
            EXISTS (
                SELECT 1 FROM public.therapy_sessions 
                WHERE public.therapy_sessions.id = session_id AND 
                (public.therapy_sessions.user_id = auth.uid() OR auth.jwt() ->> 'role' = 'service_role')
            )
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'session_goals' AND policyname = 'session_goals_delete_policy') THEN
        CREATE POLICY session_goals_delete_policy ON public.session_goals 
        FOR DELETE USING (
            EXISTS (
                SELECT 1 FROM public.therapy_sessions 
                WHERE public.therapy_sessions.id = session_id AND 
                (public.therapy_sessions.user_id = auth.uid() OR auth.jwt() ->> 'role' = 'service_role')
            )
        );
    END IF;
    
    -- TTS Usage policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tts_usage' AND policyname = 'tts_usage_select_policy') THEN
        CREATE POLICY tts_usage_select_policy ON public.tts_usage 
        FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tts_usage' AND policyname = 'tts_usage_insert_policy') THEN
        CREATE POLICY tts_usage_insert_policy ON public.tts_usage 
        FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tts_usage' AND policyname = 'tts_usage_update_policy') THEN
        CREATE POLICY tts_usage_update_policy ON public.tts_usage 
        FOR UPDATE USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tts_usage' AND policyname = 'tts_usage_delete_policy') THEN
        CREATE POLICY tts_usage_delete_policy ON public.tts_usage 
        FOR DELETE USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');
    END IF;
END $$;

-- ===== STEP 4: CREATE OR RECREATE THE TTS USAGE FUNCTION =====

-- First, drop the function if it exists
DROP FUNCTION IF EXISTS public.get_monthly_tts_usage(user_uuid UUID);

-- Recreate the function with proper ownership and grants
CREATE OR REPLACE FUNCTION public.get_monthly_tts_usage(user_uuid UUID)
RETURNS TABLE (
  month TEXT,
  total_requests BIGINT,
  total_characters BIGINT
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    to_char(timestamp, 'Month YYYY') AS month,
    COUNT(*) AS total_requests,
    SUM(characters) AS total_characters
  FROM public.tts_usage
  WHERE user_id = user_uuid
  GROUP BY month
  ORDER BY MIN(timestamp) DESC;
$$;

-- Set proper ownership and permissions
ALTER FUNCTION public.get_monthly_tts_usage(UUID) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.get_monthly_tts_usage(UUID) TO postgres, authenticator, anon, authenticated, service_role;

-- ===== STEP 5: FORCE SCHEMA REFRESH =====

-- This forces PostgREST to reload the schema
NOTIFY pgrst, 'reload schema';

-- ===== STEP 6: DIAGNOSTIC VERIFICATION =====
-- Check if tables now exist
SELECT table_schema, table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN ('therapy_goals', 'therapy_sessions', 'session_goals', 'tts_usage');

-- Check if function now exists
SELECT routines.routine_schema, routines.routine_name
FROM information_schema.routines
WHERE routines.routine_schema = 'public'
AND routines.routine_name = 'get_monthly_tts_usage';

-- Check row policies
SELECT * FROM pg_policies
WHERE tablename IN ('therapy_goals', 'therapy_sessions', 'session_goals', 'tts_usage'); 