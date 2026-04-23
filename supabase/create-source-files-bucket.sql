-- ==========================================
-- 创建 source-files Storage Bucket
-- 用于存储题目源文件（PDF、图片）
-- ==========================================

-- 1. 创建 bucket（如果不存在）
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'source-files',
  'source-files',
  true,  -- 公开访问
  52428800,  -- 50MB = 50 * 1024 * 1024
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 2. 设置 RLS 策略：允许管理员和教师上传
CREATE POLICY "Allow admin and teacher upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'source-files' AND
  (
    SELECT role FROM public.users WHERE id = auth.uid()
  ) IN ('ADMIN', 'TEACHER')
);

-- 3. 设置 RLS 策略：允许公开读取
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'source-files');

-- 4. 设置 RLS 策略：允许管理员删除
CREATE POLICY "Allow admin delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'source-files' AND
  (
    SELECT role FROM public.users WHERE id = auth.uid()
  ) = 'ADMIN'
);

-- ==========================================
-- 验证 bucket 创建成功
-- ==========================================
SELECT
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE id = 'source-files';
