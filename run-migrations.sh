#!/bin/bash

# Make the script exit on error
set -e

echo "Running Supabase migrations..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Supabase CLI is not installed. Please install it by following instructions at:"
    echo "https://supabase.com/docs/guides/cli/getting-started"
    exit 1
fi

# Initialize Supabase if needed
if [ ! -f "./supabase/config.toml" ]; then
    echo "Initializing Supabase project..."
    supabase init
fi

# Link to the existing Supabase project if not already linked
if [ ! -f "./supabase/.env" ]; then
    echo "You'll need to link to your Supabase project. Please enter your Supabase project ID:"
    read PROJECT_ID
    
    echo "Please enter your Supabase API key (can be found in your project dashboard under Settings > API):"
    read API_KEY
    
    echo "Linking to Supabase project..."
    supabase link --project-ref "$PROJECT_ID" --password "$API_KEY"
fi

# Run migrations
echo "Applying migrations..."
supabase db push

echo "Migrations completed successfully!"

# Generate TypeScript types (optional)
echo "Generating TypeScript types from database schema..."
supabase gen types typescript --local > src/types/supabase.ts

echo "All done! Your database has been set up." 