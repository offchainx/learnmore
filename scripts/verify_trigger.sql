-- 1. 验证 Trigger 启用状态
-- 预期结果: tgenabled = 'O' (这意味着 Origin/Enabled)
SELECT tgname, tgenabled, relname 
FROM pg_trigger 
JOIN pg_class ON pg_trigger.tgrelid = pg_class.oid 
WHERE tgname = 'on_auth_user_created';

-- 2. 验证用户同步 (查看最近注册的 5 个用户)
-- 预期结果: 应该能看到你刚刚创建的用户
SELECT id, email, role, created_at 
FROM public.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. 验证关联数据初始化 (证明 Trigger 逻辑完整执行)
-- 预期结果: 应该有对应 user_id 的设置记录
SELECT * FROM public.user_settings 
WHERE user_id IN (SELECT id FROM public.users ORDER BY created_at DESC LIMIT 1);

-- 4. 验证 Onboarding 任务
-- 预期结果: 新用户应该有 3 个初始任务
SELECT user_id, type, title 
FROM public.daily_tasks 
WHERE user_id IN (SELECT id FROM public.users ORDER BY created_at DESC LIMIT 1);