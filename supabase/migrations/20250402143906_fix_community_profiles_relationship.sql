-- Grant permissions to the view (if it exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_views WHERE viewname = 'community_posts_with_profiles'
  ) THEN
    EXECUTE 'GRANT SELECT ON public.community_posts_with_profiles TO anon, authenticated';
  END IF;
END $$;

-- Ensure that the JSONB type for community_settings is properly initialized for existing profiles
DO $$
BEGIN
  UPDATE public.profiles 
  SET community_settings = '{"disable_community": false, "hide_sensitive_content": true, "auto_moderation": true, "mute_notifications": false, "allow_direct_messages": true}'
  WHERE community_settings IS NULL;
END $$;
