ALTER TABLE public.user_feedbacks
  ADD COLUMN IF NOT EXISTS source_type text,
  ADD COLUMN IF NOT EXISTS source_path text;
