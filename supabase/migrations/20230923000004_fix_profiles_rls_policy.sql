-- Add the missing INSERT policy for profiles table
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Enable the service role to bypass RLS
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- Make sure the auto-trigger function works properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
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