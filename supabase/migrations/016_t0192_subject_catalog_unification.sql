-- T-019.2: 统一 subjects 为 8 个核心科目，并补充稳定 key 字段

ALTER TABLE public.subjects
  ADD COLUMN IF NOT EXISTS key text;

WITH candidates AS (
  SELECT
    s.id,
    CASE
      WHEN regexp_replace(lower(coalesce(s.name, '')), '[\\s\\-_/\\.\\(\\)]', '', 'g')
        IN ('中文', '华文', 'chinese', 'mandarin', 'bahasacina') THEN 'chinese'
      WHEN regexp_replace(lower(coalesce(s.name, '')), '[\\s\\-_/\\.\\(\\)]', '', 'g')
        IN ('马来西亚文', '马来文', 'malay', 'bahasamelayu', 'melayu') THEN 'malay'
      WHEN regexp_replace(lower(coalesce(s.name, '')), '[\\s\\-_/\\.\\(\\)]', '', 'g')
        IN ('英文', '英语', 'english', 'bahasainggeris') THEN 'english'
      WHEN regexp_replace(lower(coalesce(s.name, '')), '[\\s\\-_/\\.\\(\\)]', '', 'g')
        IN ('数学', 'math', 'mathematics', 'matematik') THEN 'math'
      WHEN regexp_replace(lower(coalesce(s.name, '')), '[\\s\\-_/\\.\\(\\)]', '', 'g')
        IN ('科学', 'science', 'sains', 'physics', 'chemistry', 'biology') THEN 'science'
      WHEN regexp_replace(lower(coalesce(s.name, '')), '[\\s\\-_/\\.\\(\\)]', '', 'g')
        IN ('历史', 'history', 'sejarah') THEN 'history'
      WHEN regexp_replace(lower(coalesce(s.name, '')), '[\\s\\-_/\\.\\(\\)]', '', 'g')
        IN ('地理', 'geography', 'geografi') THEN 'geography'
      WHEN regexp_replace(lower(coalesce(s.name, '')), '[\\s\\-_/\\.\\(\\)]', '', 'g')
        IN ('其他', 'other', 'lainlain', 'general', 'misc', 'computerscience') THEN 'other'
      ELSE NULL
    END AS resolved_key,
    row_number() OVER (
      PARTITION BY
        CASE
          WHEN regexp_replace(lower(coalesce(s.name, '')), '[\\s\\-_/\\.\\(\\)]', '', 'g')
            IN ('中文', '华文', 'chinese', 'mandarin', 'bahasacina') THEN 'chinese'
          WHEN regexp_replace(lower(coalesce(s.name, '')), '[\\s\\-_/\\.\\(\\)]', '', 'g')
            IN ('马来西亚文', '马来文', 'malay', 'bahasamelayu', 'melayu') THEN 'malay'
          WHEN regexp_replace(lower(coalesce(s.name, '')), '[\\s\\-_/\\.\\(\\)]', '', 'g')
            IN ('英文', '英语', 'english', 'bahasainggeris') THEN 'english'
          WHEN regexp_replace(lower(coalesce(s.name, '')), '[\\s\\-_/\\.\\(\\)]', '', 'g')
            IN ('数学', 'math', 'mathematics', 'matematik') THEN 'math'
          WHEN regexp_replace(lower(coalesce(s.name, '')), '[\\s\\-_/\\.\\(\\)]', '', 'g')
            IN ('科学', 'science', 'sains', 'physics', 'chemistry', 'biology') THEN 'science'
          WHEN regexp_replace(lower(coalesce(s.name, '')), '[\\s\\-_/\\.\\(\\)]', '', 'g')
            IN ('历史', 'history', 'sejarah') THEN 'history'
          WHEN regexp_replace(lower(coalesce(s.name, '')), '[\\s\\-_/\\.\\(\\)]', '', 'g')
            IN ('地理', 'geography', 'geografi') THEN 'geography'
          WHEN regexp_replace(lower(coalesce(s.name, '')), '[\\s\\-_/\\.\\(\\)]', '', 'g')
            IN ('其他', 'other', 'lainlain', 'general', 'misc', 'computerscience') THEN 'other'
          ELSE NULL
        END
      ORDER BY s."order" ASC, s.id ASC
    ) AS rn
  FROM public.subjects s
  WHERE s.key IS NULL
),
winners AS (
  SELECT id, resolved_key
  FROM candidates
  WHERE resolved_key IS NOT NULL AND rn = 1
)
UPDATE public.subjects s
SET key = w.resolved_key
FROM winners w
WHERE s.id = w.id
  AND s.key IS NULL;

INSERT INTO public.subjects (id, key, name, icon, "order")
SELECT gen_random_uuid(), 'chinese', '中文', 'BookOpen', 10
WHERE NOT EXISTS (SELECT 1 FROM public.subjects WHERE key = 'chinese');

INSERT INTO public.subjects (id, key, name, icon, "order")
SELECT gen_random_uuid(), 'malay', '马来西亚文', 'Languages', 20
WHERE NOT EXISTS (SELECT 1 FROM public.subjects WHERE key = 'malay');

INSERT INTO public.subjects (id, key, name, icon, "order")
SELECT gen_random_uuid(), 'english', '英文', 'Languages', 30
WHERE NOT EXISTS (SELECT 1 FROM public.subjects WHERE key = 'english');

INSERT INTO public.subjects (id, key, name, icon, "order")
SELECT gen_random_uuid(), 'math', '数学', 'Calculator', 40
WHERE NOT EXISTS (SELECT 1 FROM public.subjects WHERE key = 'math');

INSERT INTO public.subjects (id, key, name, icon, "order")
SELECT gen_random_uuid(), 'science', '科学', 'Atom', 50
WHERE NOT EXISTS (SELECT 1 FROM public.subjects WHERE key = 'science');

INSERT INTO public.subjects (id, key, name, icon, "order")
SELECT gen_random_uuid(), 'history', '历史', 'Landmark', 60
WHERE NOT EXISTS (SELECT 1 FROM public.subjects WHERE key = 'history');

INSERT INTO public.subjects (id, key, name, icon, "order")
SELECT gen_random_uuid(), 'geography', '地理', 'Globe', 70
WHERE NOT EXISTS (SELECT 1 FROM public.subjects WHERE key = 'geography');

INSERT INTO public.subjects (id, key, name, icon, "order")
SELECT gen_random_uuid(), 'other', '其他', 'Shapes', 80
WHERE NOT EXISTS (SELECT 1 FROM public.subjects WHERE key = 'other');

UPDATE public.subjects SET name = '中文', icon = coalesce(icon, 'BookOpen'), "order" = 10 WHERE key = 'chinese';
UPDATE public.subjects SET name = '马来西亚文', icon = coalesce(icon, 'Languages'), "order" = 20 WHERE key = 'malay';
UPDATE public.subjects SET name = '英文', icon = coalesce(icon, 'Languages'), "order" = 30 WHERE key = 'english';
UPDATE public.subjects SET name = '数学', icon = coalesce(icon, 'Calculator'), "order" = 40 WHERE key = 'math';
UPDATE public.subjects SET name = '科学', icon = coalesce(icon, 'Atom'), "order" = 50 WHERE key = 'science';
UPDATE public.subjects SET name = '历史', icon = coalesce(icon, 'Landmark'), "order" = 60 WHERE key = 'history';
UPDATE public.subjects SET name = '地理', icon = coalesce(icon, 'Globe'), "order" = 70 WHERE key = 'geography';
UPDATE public.subjects SET name = '其他', icon = coalesce(icon, 'Shapes'), "order" = 80 WHERE key = 'other';

UPDATE public.subjects
SET key = 'legacy_' || replace(id::text, '-', '')
WHERE key IS NULL;

WITH duplicated AS (
  SELECT
    id,
    key,
    row_number() OVER (PARTITION BY key ORDER BY "order" ASC, id ASC) AS rn
  FROM public.subjects
)
UPDATE public.subjects s
SET key = 'legacy_' || replace(s.id::text, '-', '')
FROM duplicated d
WHERE s.id = d.id
  AND d.rn > 1;

ALTER TABLE public.subjects
  ALTER COLUMN key SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'subjects_key_key'
  ) THEN
    ALTER TABLE public.subjects
      ADD CONSTRAINT subjects_key_key UNIQUE (key);
  END IF;
END $$;
