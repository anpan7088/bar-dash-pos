ALTER TABLE public.time_entries
ADD COLUMN cash_revenue numeric DEFAULT NULL,
ADD COLUMN cash_handed numeric DEFAULT NULL;