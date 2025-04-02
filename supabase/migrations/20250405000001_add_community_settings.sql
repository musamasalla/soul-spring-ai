-- Add community_settings to profiles table
ALTER TABLE profiles 
ADD COLUMN community_settings JSONB DEFAULT '{"disable_community": false, "hide_sensitive_content": true, "auto_moderation": true, "mute_notifications": false, "allow_direct_messages": true}' NOT NULL;

-- Add a comment to explain the structure
COMMENT ON COLUMN profiles.community_settings IS 
'JSON object containing user community preferences:
- disable_community: If true, user opts out of all community features
- hide_sensitive_content: If true, filter potentially triggering content
- auto_moderation: If true, enable automatic content filtering
- mute_notifications: If true, suppress community notifications
- allow_direct_messages: If true, allow other users to send DMs'; 