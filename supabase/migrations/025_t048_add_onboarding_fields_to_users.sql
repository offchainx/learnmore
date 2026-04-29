-- Add onboarding fields for Novu-inspired auth flow
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS legal_consent_accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS legal_consent_version TEXT,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS onboarding_step TEXT;
