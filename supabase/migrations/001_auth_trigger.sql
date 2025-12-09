-- 创建触发器函数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NEW.created_at, NEW.updated_at);
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- 如果用户已存在,忽略错误
    RETURN NEW;
END;
$$;

-- 绑定触发器到 auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 验证触发器
SELECT tgname, tgenabled FROM pg_trigger WHERE tgname = 'on_auth_user_created';