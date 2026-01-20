-- Fix: Ensure the auth trigger is enabled and working (Final Version)
-- Description: Drops existing trigger/function and recreates them with correct column names and type casting.
-- NOTE: If applying via migration fails due to permissions, run this content in Supabase Dashboard > SQL Editor.

-- 1. Drop the trigger if it exists to reset state
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Ensure the function is up-to-date
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  utm_source_val text;
  utm_medium_val text;
  utm_campaign_val text;
BEGIN
  -- Extract UTM params from metadata (Fixed field name: raw_user_meta_data)
  utm_source_val := NEW.raw_user_meta_data->>'utm_source';
  utm_medium_val := NEW.raw_user_meta_data->>'utm_medium';
  utm_campaign_val := NEW.raw_user_meta_data->>'utm_campaign';

  -- 1. Insert User
  INSERT INTO public.users (
    id, 
    email, 
    created_at, 
    updated_at, 
    role, 
    xp, 
    streak, 
    utm_source, 
    utm_medium, 
    utm_campaign
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.created_at, 
    NEW.updated_at, 
    'STUDENT'::public."UserRole", -- Explicit cast to Enum
    0, 
    0, 
    utm_source_val, 
    utm_medium_val, 
    utm_campaign_val
  );

  -- 2. Insert Default Settings
  INSERT INTO public.user_settings (
    id, 
    user_id, 
    theme, 
    language, 
    notification_daily, 
    notification_weekly, 
    email_marketing, 
    email_activity,
    ai_personality,
    difficulty_calibration
  )
  VALUES (
    gen_random_uuid(), 
    NEW.id, 
    'light', 
    'en', 
    true, 
    true, 
    true, 
    true, 
    'ENCOURAGING'::public."AiPersonality", -- Explicit cast to Enum
    50
  );

  -- 3. Insert Onboarding Tasks (Daily Missions)
  -- Task 1: Complete Profile
  INSERT INTO public.daily_tasks (
    id, user_id, type, title, target_count, current_count, xp_reward, is_claimed, date
  )
  VALUES (
    gen_random_uuid(), NEW.id, 'ONBOARDING_PROFILE'::public."DailyTaskType", 'Complete your profile', 1, 0, 100, false, CURRENT_DATE
  );

  -- Task 2: Set Goals
  INSERT INTO public.daily_tasks (
    id, user_id, type, title, target_count, current_count, xp_reward, is_claimed, date
  )
  VALUES (
    gen_random_uuid(), NEW.id, 'ONBOARDING_GOALS'::public."DailyTaskType", 'Set your study goals', 1, 0, 50, false, CURRENT_DATE
  );

  -- Task 3: Assessment
  INSERT INTO public.daily_tasks (
    id, user_id, type, title, target_count, current_count, xp_reward, is_claimed, date
  )
  VALUES (
    gen_random_uuid(), NEW.id, 'ONBOARDING_ASSESSMENT'::public."DailyTaskType", 'Take skill assessment', 1, 0, 200, false, CURRENT_DATE
  );

  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Ignore if user already exists
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log error to debug table if it exists, otherwise ignore safely
    BEGIN
        INSERT INTO public._debug_logs (message, details) 
        VALUES ('Trigger Error', 'Error: ' || SQLERRM);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    RETURN NEW;
END;
$$;

-- 3. Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Verify status
SELECT tgname, tgenabled 
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';