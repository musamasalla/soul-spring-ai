-- Create a function to check permissions
CREATE OR REPLACE FUNCTION public.check_permissions()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
  user_id TEXT;
BEGIN
  -- Get the current user ID
  user_id := auth.uid()::TEXT;
  
  -- Check if user is authenticated
  IF user_id IS NULL THEN
    RETURN jsonb_build_object(
      'authenticated', false,
      'message', 'No authenticated user found.'
    );
  END IF;
  
  -- Create a JSON response with permission checks
  result := jsonb_build_object(
    'authenticated', true,
    'user_id', user_id,
    'permissions', jsonb_build_object(
      'therapy_goals', (SELECT count(*) FROM pg_policies 
                        WHERE tablename = 'therapy_goals' 
                        AND cmd IN ('SELECT', 'INSERT', 'UPDATE', 'DELETE')) > 0,
      'therapy_sessions', (SELECT count(*) FROM pg_policies 
                          WHERE tablename = 'therapy_sessions' 
                          AND cmd IN ('SELECT', 'INSERT', 'UPDATE', 'DELETE')) > 0,
      'session_goals', (SELECT count(*) FROM pg_policies 
                        WHERE tablename = 'session_goals' 
                        AND cmd IN ('SELECT', 'INSERT', 'UPDATE', 'DELETE')) > 0,
      'tts_usage', (SELECT count(*) FROM pg_policies 
                  WHERE tablename = 'tts_usage' 
                  AND cmd IN ('SELECT', 'INSERT', 'UPDATE', 'DELETE')) > 0
    ),
    'rls_enabled', jsonb_build_object(
      'therapy_goals', (SELECT rls_enabled FROM pg_tables WHERE tablename = 'therapy_goals'),
      'therapy_sessions', (SELECT rls_enabled FROM pg_tables WHERE tablename = 'therapy_sessions'),
      'session_goals', (SELECT rls_enabled FROM pg_tables WHERE tablename = 'session_goals'),
      'tts_usage', (SELECT rls_enabled FROM pg_tables WHERE tablename = 'tts_usage')
    )
  );
  
  -- Try to do a test insert and select to verify actual permissions
  BEGIN
    -- Test therapy_goals access
    DECLARE
      can_insert BOOLEAN;
      can_select BOOLEAN;
      test_id UUID;
    BEGIN
      -- Insert a test record
      INSERT INTO therapy_goals (user_id, title, description, status)
      VALUES (auth.uid(), 'TEST PERMISSION RECORD', 'This record tests permissions and will be deleted', 'not_started')
      RETURNING id INTO test_id;
      
      can_insert := test_id IS NOT NULL;
      
      -- Try to select it back
      PERFORM id FROM therapy_goals WHERE id = test_id;
      can_select := FOUND;
      
      -- Clean up the test record
      IF can_insert THEN
        DELETE FROM therapy_goals WHERE id = test_id;
      END IF;
      
      -- Add real-world access test results
      result := result || jsonb_build_object(
        'actual_access', jsonb_build_object(
          'therapy_goals_insert', can_insert,
          'therapy_goals_select', can_select
        )
      );
      
    EXCEPTION WHEN others THEN
      -- If an error occurred, we can't access the table properly
      result := result || jsonb_build_object(
        'actual_access', jsonb_build_object(
          'therapy_goals_insert', false,
          'therapy_goals_select', false,
          'error', SQLERRM
        )
      );
    END;
  END;
  
  RETURN result;
END;
$$;

-- Set proper ownership and permissions
ALTER FUNCTION public.check_permissions() OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.check_permissions() TO postgres, authenticator, anon, authenticated, service_role;

-- Force schema refresh
NOTIFY pgrst, 'reload schema'; 