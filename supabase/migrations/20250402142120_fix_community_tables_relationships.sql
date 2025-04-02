-- Fix community_posts foreign key relationship with profiles
ALTER TABLE IF EXISTS public.community_posts
DROP CONSTRAINT IF EXISTS community_posts_user_id_fkey;

-- Re-create the proper foreign key relationship
ALTER TABLE IF EXISTS public.community_posts
ADD CONSTRAINT community_posts_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Create a view to join community_posts with profiles for easier queries
CREATE OR REPLACE VIEW public.community_posts_with_profiles AS
SELECT
  cp.*,
  p.name,
  p.avatar_url
FROM public.community_posts cp
JOIN public.profiles p ON cp.user_id = p.id;

-- Ensure community_settings exists in profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'community_settings'
  ) THEN
    ALTER TABLE public.profiles
    ADD COLUMN community_settings JSONB DEFAULT '{"disable_community": false, "hide_sensitive_content": true, "auto_moderation": true, "mute_notifications": false, "allow_direct_messages": true}' NOT NULL;
    
    COMMENT ON COLUMN profiles.community_settings IS 
    'JSON object containing user community preferences:
    - disable_community: If true, user opts out of all community features
    - hide_sensitive_content: If true, filter potentially triggering content
    - auto_moderation: If true, enable automatic content filtering
    - mute_notifications: If true, suppress community notifications
    - allow_direct_messages: If true, allow other users to send DMs';
  END IF;
END $$;
