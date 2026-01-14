-- SYSTEM UPDATES TABLE SETUP
-- Stores the global broadcast message shown on the dashboard

CREATE TABLE IF NOT EXISTS public.system_updates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  message text NOT NULL,
  link text DEFAULT '/collections/astro',
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.system_updates ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies to avoid "already exists" errors
DROP POLICY IF EXISTS "Public read access" ON public.system_updates;
DROP POLICY IF EXISTS "Admins can update messages" ON public.system_updates;
DROP POLICY IF EXISTS "Admins can insert messages" ON public.system_updates;

-- 1. Allow anyone to READ active updates
CREATE POLICY "Public read access"
ON public.system_updates FOR SELECT
USING (true);

-- 2. Allow Admins/Owners to UPDATE existing messages
CREATE POLICY "Admins can update messages"
ON public.system_updates FOR UPDATE
USING (
  exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role in ('admin', 'owner')
  )
);

-- 3. Allow Admins/Owners to INSERT new messages
CREATE POLICY "Admins can insert messages"
ON public.system_updates FOR INSERT
WITH CHECK (
  exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role in ('admin', 'owner')
  )
);

-- Insert default row if empty
INSERT INTO public.system_updates (message, link, active)
SELECT 'SYSTEM UPDATES // ONLINE', '/collections/astro', true
WHERE NOT EXISTS (SELECT 1 FROM public.system_updates);
