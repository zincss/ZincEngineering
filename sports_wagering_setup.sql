-- SPORTS WAGERING SYSTEM - DATABASE SETUP
-- RUN THIS IN YOUR SUPABASE SQL EDITOR

-- 1. Create Wagers Table
CREATE TABLE IF NOT EXISTS public.sports_wagers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  amount decimal NOT NULL,
  odds decimal NOT NULL,
  status text DEFAULT 'pending' NOT NULL,
  payout decimal,
  is_parlay boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Wager Legs (for Parlays/Multis)
CREATE TABLE IF NOT EXISTS public.wager_legs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  wager_id uuid REFERENCES public.sports_wagers(id) ON DELETE CASCADE NOT NULL,
  match_id text NOT NULL,
  league text NOT NULL,
  match_name text NOT NULL,
  type text NOT NULL,
  selection text NOT NULL,
  odds decimal NOT NULL,
  status text DEFAULT 'pending' NOT NULL
);

-- 3. Enable Row Level Security
ALTER TABLE public.sports_wagers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wager_legs ENABLE ROW LEVEL SECURITY;

-- 4. Create Access Policies

-- Policy for sports_wagers: View
DROP POLICY IF EXISTS "Users can view their own wagers" ON public.sports_wagers;
CREATE POLICY "Users can view their own wagers" 
ON public.sports_wagers 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy for sports_wagers: Insert
DROP POLICY IF EXISTS "Users can insert their own wagers" ON public.sports_wagers;
CREATE POLICY "Users can insert their own wagers" 
ON public.sports_wagers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy for wager_legs: View
DROP POLICY IF EXISTS "Users can view their own legs" ON public.wager_legs;
CREATE POLICY "Users can view their own legs" 
ON public.wager_legs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.sports_wagers 
    WHERE id = wager_legs.wager_id 
    AND user_id = auth.uid()
  )
);

-- Policy for wager_legs: Insert
DROP POLICY IF EXISTS "Users can insert their own legs" ON public.wager_legs;
CREATE POLICY "Users can insert their own legs" 
ON public.wager_legs 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.sports_wagers 
    WHERE id = wager_legs.wager_id 
    AND user_id = auth.uid()
  )
);
