-- 更新触发器函数以支持 UTM 追踪和初始化 Onboarding 任务
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
  -- Extract UTM params from metadata
  -- 注意: jsonb取值用 ->>
  utm_source_val := NEW.raw_user_metadata->>'utm_source';
  utm_medium_val := NEW.raw_user_metadata->>'utm_medium';
  utm_campaign_val := NEW.raw_user_metadata->>'utm_campaign';

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
    'STUDENT', 
    0, 
    0, 
    utm_source_val, 
    utm_medium_val, 
    utm_campaign_val
  );

  -- 2. Insert Default Settings
  -- 注意: Prisma @default 只在 Prisma 层面生效，这里我们需要手动指定默认值
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
    'ENCOURAGING', 
    50
  );

  -- 3. Insert Onboarding Tasks (Daily Missions)
  -- Task 1: Complete Profile
  INSERT INTO public.daily_tasks (
    id, user_id, type, title, target_count, current_count, xp_reward, is_claimed, date
  )
  VALUES (
    gen_random_uuid(), NEW.id, 'ONBOARDING_PROFILE', 'Complete your profile', 1, 0, 100, false, CURRENT_DATE
  );

  -- Task 2: Set Goals
  INSERT INTO public.daily_tasks (
    id, user_id, type, title, target_count, current_count, xp_reward, is_claimed, date
  )
  VALUES (
    gen_random_uuid(), NEW.id, 'ONBOARDING_GOALS', 'Set your study goals', 1, 0, 50, false, CURRENT_DATE
  );

  -- Task 3: Assessment
  INSERT INTO public.daily_tasks (
    id, user_id, type, title, target_count, current_count, xp_reward, is_claimed, date
  )
  VALUES (
    gen_random_uuid(), NEW.id, 'ONBOARDING_ASSESSMENT', 'Take skill assessment', 1, 0, 200, false, CURRENT_DATE
  );

  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- 如果用户已存在,忽略错误
    RETURN NEW;
  WHEN OTHERS THEN
    -- 记录错误但不阻断
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;
