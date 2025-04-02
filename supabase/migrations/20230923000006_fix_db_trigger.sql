-- Fix trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Make sure the auto-trigger function works properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Use SECURITY DEFINER to bypass RLS policies for this function
  INSERT INTO public.profiles (id, name, avatar_url, is_premium, ai_messages_limit, journal_entries_limit)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'https://api.dicebear.com/7.x/initials/svg?seed=' || COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    false,
    10,
    5
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create trigger to ensure it works
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 