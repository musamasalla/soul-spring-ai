-- Ensure mood_entries has proper RLS policies
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;

-- Create policies with conditional checks
DO $$
BEGIN
    -- Check if the "Users can view their own mood entries" policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'mood_entries' 
        AND policyname = 'Users can view their own mood entries'
    ) THEN
        CREATE POLICY "Users can view their own mood entries"
        ON public.mood_entries FOR SELECT
        USING (auth.uid() = user_id);
    END IF;
    
    -- Check if the "Users can insert their own mood entries" policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'mood_entries' 
        AND policyname = 'Users can insert their own mood entries'
    ) THEN
        CREATE POLICY "Users can insert their own mood entries"
        ON public.mood_entries FOR INSERT
        WITH CHECK (auth.uid() = user_id);
    END IF;
    
    -- Check if the "Users can update their own mood entries" policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'mood_entries' 
        AND policyname = 'Users can update their own mood entries'
    ) THEN
        CREATE POLICY "Users can update their own mood entries"
        ON public.mood_entries FOR UPDATE
        USING (auth.uid() = user_id);
    END IF;
    
    -- Check if the "Users can delete their own mood entries" policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'mood_entries' 
        AND policyname = 'Users can delete their own mood entries'
    ) THEN
        CREATE POLICY "Users can delete their own mood entries"
        ON public.mood_entries FOR DELETE
        USING (auth.uid() = user_id);
    END IF;
END
$$;

-- Enable the service role to bypass RLS
ALTER TABLE public.mood_entries FORCE ROW LEVEL SECURITY; 