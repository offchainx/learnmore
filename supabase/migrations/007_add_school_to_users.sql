-- Add school field for admin user list real-data migration
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS school TEXT;
