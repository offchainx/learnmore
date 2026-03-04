-- Sync auth.users login mirror fields into public.users
-- Goal: keep public.users.last_sign_in_at / sign_in_count aligned with auth.users

DROP TRIGGER IF EXISTS on_auth_user_signin_updated ON auth.users;
DROP FUNCTION IF EXISTS public.handle_auth_user_signin();

CREATE OR REPLACE FUNCTION public.handle_auth_user_signin()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.last_sign_in_at IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.users (
    id,
    email,
    created_at,
    updated_at,
    role,
    last_sign_in_at,
    sign_in_count
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.created_at, now()),
    now(),
    'STUDENT'::public."UserRole",
    NEW.last_sign_in_at,
    1
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    last_sign_in_at = CASE
      WHEN public.users.last_sign_in_at IS NULL
        OR EXCLUDED.last_sign_in_at > public.users.last_sign_in_at
      THEN EXCLUDED.last_sign_in_at
      ELSE public.users.last_sign_in_at
    END,
    sign_in_count = CASE
      WHEN public.users.last_sign_in_at IS NULL
        OR EXCLUDED.last_sign_in_at > public.users.last_sign_in_at
      THEN COALESCE(public.users.sign_in_count, 0) + 1
      ELSE COALESCE(public.users.sign_in_count, 0)
    END,
    updated_at = now();

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Keep auth flow non-blocking if mirror write fails.
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_signin_updated
AFTER UPDATE OF last_sign_in_at ON auth.users
FOR EACH ROW
WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
EXECUTE FUNCTION public.handle_auth_user_signin();

