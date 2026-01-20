-- 1. 验证 Trigger 启用状态
-- 预期结果: tgenabled = 'O' (Enabled)
SELECT tgname, tgenabled, relname 
FROM pg_trigger 
JOIN pg_class ON pg_trigger.tgrelid = pg_class.oid 
WHERE tgname = 'on_auth_user_created';

-- 2. 验证用户同步
-- 检查最近创建的 Public Users
SELECT id, email, role, created_at 
FROM public.users 
ORDER BY created_at DESC 
LIMIT 5;
