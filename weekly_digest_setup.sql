-- WEEKLY DIGEST SYSTEM SETUP
-- RUN THIS IN YOUR SUPABASE SQL EDITOR

-- 1. Add opt-in column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS weekly_digest_opt_in boolean DEFAULT false;

-- 2. Add email column to profiles (if not already synced from auth.users)
-- This is often useful for easier querying in scripts
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email text;

-- 3. (Optional) Create a function to sync email from auth.users to profiles
-- This trigger ensures that when a user is created/updated, their email is in the public profiles table
CREATE OR REPLACE FUNCTION public.handle_user_email_sync() 
RETURNS trigger AS $$
BEGIN
  UPDATE public.profiles 
  SET email = new.email
  WHERE id = new.id;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
-- Note: This requires superuser or specific permissions, you might need to run it as postgres
-- DROP TRIGGER IF EXISTS on_auth_user_email_update ON auth.users;
-- CREATE TRIGGER on_auth_user_email_update
--   AFTER INSERT OR UPDATE OF email ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_user_email_sync();

-- 4. Create Favorite Players Table
CREATE TABLE IF NOT EXISTS public.favorite_players (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  player_id text NOT NULL,
  league text NOT NULL, -- 'nba' or 'nfl'
  player_name text,
  headshot_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, player_id)
);

ALTER TABLE public.favorite_players ENABLE ROW LEVEL SECURITY;

-- Policy for viewing own favorites
CREATE POLICY "Users can view their own favorite players"
ON public.favorite_players FOR SELECT
USING (auth.uid() = user_id);

-- Policy for adding favorites
CREATE POLICY "Users can add their own favorite players"
ON public.favorite_players FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy for removing favorites
CREATE POLICY "Users can remove their own favorite players"
ON public.favorite_players FOR DELETE
USING (auth.uid() = user_id);
