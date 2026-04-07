
-- Time tracking table
CREATE TABLE public.time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  clock_in timestamptz NOT NULL DEFAULT now(),
  clock_out timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view all time entries (managers need this)
CREATE POLICY "Authenticated users can view time entries"
  ON public.time_entries FOR SELECT TO authenticated USING (true);

-- Users can insert their own entries
CREATE POLICY "Users can insert own time entries"
  ON public.time_entries FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own entries (for clock_out)
CREATE POLICY "Users can update own time entries"
  ON public.time_entries FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Allow anon to insert/update (PIN login doesn't use supabase auth session)
CREATE POLICY "Anon can insert time entries"
  ON public.time_entries FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can update time entries"
  ON public.time_entries FOR UPDATE TO anon
  USING (true);

CREATE POLICY "Anon can select time entries"
  ON public.time_entries FOR SELECT TO anon
  USING (true);
