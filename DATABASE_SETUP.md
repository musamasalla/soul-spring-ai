# Database Setup for Tranquil Mind Web App

This document explains how to set up the required database tables for the Tranquil Mind Web App.

## Database Error Explanation

The errors you're seeing are due to the application trying to access Supabase tables that don't exist. Specifically, it's looking for:

1. `profiles` - To store user profile information
2. `therapy_sessions` - To store therapy session data
3. `chat_sessions` - To store chat conversation history
4. `meditations` - To store meditation content
5. Various other related tables for mood tracking, meditation history, etc.

## Setting Up the Database

### Option 1: Using the Migration Script (Recommended)

We've created migration scripts in the `supabase/migrations` folder and a helper script to run them:

1. Make sure you have the [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started) installed:
   ```bash
   npm install -g supabase
   ```

2. Run the migration script:
   ```bash
   ./run-migrations.sh
   ```

3. Follow the prompts to link to your Supabase project.

### Option 2: Manual SQL Execution

If you prefer to run the SQL scripts manually, you can do so from the Supabase dashboard:

1. Go to your Supabase project dashboard
2. Go to "SQL Editor"
3. Copy the contents of each migration file in the `supabase/migrations` folder
4. Paste into the SQL Editor and run them in order (they're numbered)

## Database Schema Overview

The database consists of the following tables:

### `profiles`
Stores user profile information including premium status and usage limits.

### `therapy_sessions`
Stores metadata about therapy sessions (title, topic, goals, etc.).

### `chat_sessions` and `chat_messages`
Store the AI chat conversations and their messages.

### `meditations`
Stores meditation content including audio files and metadata.

### `user_favorites`
Tracks which meditations a user has favorited.

### `meditation_history`
Records which meditations a user has completed.

### `mood_entries`
Stores mood tracking data from the MoodTracker component.

## Troubleshooting

If you continue to see database errors after running the migrations:

1. Check the Supabase console to make sure the tables were created
2. Verify that Row Level Security (RLS) policies are in place
3. Ensure your application environment variables for Supabase URL and anon key are correct
4. Check the browser console for more specific error messages

## Questions or Issues?

If you encounter any problems setting up the database, please reach out to the development team.

## Current Issue
The application is encountering a database error: `Could not find the function public.check_permissions without parameters in the schema cache (Code: PGRST202)`.

This happens because the Supabase database is missing a function that the app tries to call for diagnostic purposes.

## Solution Steps

### Option 1: Run the SQL Migration (Recommended)

1. Log in to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to the SQL Editor
4. Copy and paste the following SQL and run it:

```sql
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
```

5. After running the SQL, restart your app and refresh the page

### Option 2: Use the Fallback Implementation

The app has been updated with a fallback implementation that will diagnose database issues even when the `check_permissions` function is unavailable. The app will continue to work, but will display more detailed error messages to help identify the root cause.

## Verifying the Fix

1. After applying the fix, restart your app
2. Navigate to the dashboard page
3. Click the "Check Database Permissions" button in the debug section
4. The diagnostic result should show permissions working correctly

## If Problems Persist

If you continue experiencing issues after applying these fixes:

1. Check browser console for errors
2. Verify that Row Level Security (RLS) policies are set up correctly in Supabase
3. Ensure your authentication is working properly
4. Make sure all database tables exist with the correct schemas

If you need additional assistance, please file an issue in the GitHub repository with the exact error messages you're seeing. 