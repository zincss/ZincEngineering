-- GOLF SNAPSHOTS TABLE
-- RUN THIS IN YOUR SUPABASE SQL EDITOR

CREATE TABLE IF NOT EXISTS public.golf_snapshots (
  key text PRIMARY KEY,
  data jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.golf_snapshots ENABLE ROW LEVEL SECURITY;

-- Allow public read access (or restrict to authenticated if preferred)
CREATE POLICY "Allow public read on golf_snapshots" ON public.golf_snapshots
  FOR SELECT USING (true);

-- Allow service role to manage
CREATE POLICY "Allow service role all on golf_snapshots" ON public.golf_snapshots
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
