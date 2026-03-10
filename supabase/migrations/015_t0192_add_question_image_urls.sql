-- T-019.2: questions 新增多图字段（用于题图存储与展示）

ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS image_urls text[] NOT NULL DEFAULT '{}';

-- 历史回填：若已有 asset_url，则写入 image_urls 首项
UPDATE public.questions
SET image_urls = ARRAY[asset_url]
WHERE asset_url IS NOT NULL
  AND (image_urls IS NULL OR cardinality(image_urls) = 0);
