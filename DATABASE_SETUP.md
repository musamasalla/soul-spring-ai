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