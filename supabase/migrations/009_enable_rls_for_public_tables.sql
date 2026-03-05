-- T-012: Enable RLS for all public schema tables to close Advisor "RLS Disabled in Public" findings.
-- Scope: public tables only; no policy widening in this migration.
-- Note: This migration is intentionally conservative. It enables RLS, then policies can be added table-by-table.

DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.tablename);
  END LOOP;
END
$$;

