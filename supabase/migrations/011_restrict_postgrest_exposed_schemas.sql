-- T-014: Data API exposed schema 最小化（仅保留 public）
ALTER ROLE authenticator SET pgrst.db_schemas = 'public';

-- 让 PostgREST 重新加载配置
NOTIFY pgrst, 'reload config';
