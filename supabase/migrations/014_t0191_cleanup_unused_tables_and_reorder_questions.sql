-- T-019.1: 删除无用表 + questions 字段顺序重排（保留 subject_id，放在 chapter_id 后）

BEGIN;

-- 1) 删除不再使用的表
DROP TABLE IF EXISTS public.error_book;
DROP TABLE IF EXISTS public."_SourceToQuestion";

-- 2) 临时拆除当前 questions 的外键依赖（后续重建）
DO $$
DECLARE
  fk_record RECORD;
BEGIN
  FOR fk_record IN
    SELECT
      con.conname AS constraint_name,
      nsp.nspname AS schema_name,
      cls.relname AS table_name
    FROM pg_constraint con
    JOIN pg_class cls ON cls.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = cls.relnamespace
    WHERE con.contype = 'f'
      AND con.confrelid = 'public.questions'::regclass
  LOOP
    EXECUTE format(
      'ALTER TABLE %I.%I DROP CONSTRAINT IF EXISTS %I',
      fk_record.schema_name,
      fk_record.table_name,
      fk_record.constraint_name
    );
  END LOOP;
END
$$;

-- 3) 按目标顺序新建 questions 临时表
DROP TABLE IF EXISTS public.questions_new;

CREATE TABLE public.questions_new (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  curriculum text NOT NULL DEFAULT 'UEC',
  grade integer,
  chapter_id uuid,
  subject_id uuid,
  difficulty integer NOT NULL DEFAULT 3,
  type public."QuestionType" NOT NULL,
  content text NOT NULL,
  options jsonb,
  answer jsonb NOT NULL,
  explanation text,
  content_hash text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  reviewed_at timestamptz,
  reviewed_by uuid,
  published_at timestamptz,
  published_by uuid,
  quality_score double precision,
  report_count integer NOT NULL DEFAULT 0,
  status public."ContentStatus" NOT NULL DEFAULT 'DRAFT'::public."ContentStatus",
  updated_at timestamptz NOT NULL DEFAULT now(),
  source_file_id uuid,
  asset_url text,
  source text,
  tags text[] NOT NULL DEFAULT ARRAY[]::text[],
  is_past_paper boolean NOT NULL DEFAULT false,
  paper_id text
);

-- 4) 数据迁移到新表（列顺序对应）
INSERT INTO public.questions_new (
  id,
  curriculum,
  grade,
  chapter_id,
  subject_id,
  difficulty,
  type,
  content,
  options,
  answer,
  explanation,
  content_hash,
  created_at,
  created_by,
  reviewed_at,
  reviewed_by,
  published_at,
  published_by,
  quality_score,
  report_count,
  status,
  updated_at,
  source_file_id,
  asset_url,
  source,
  tags,
  is_past_paper,
  paper_id
)
SELECT
  id,
  curriculum,
  grade,
  chapter_id,
  subject_id,
  difficulty,
  type,
  content,
  options,
  answer,
  explanation,
  content_hash,
  created_at,
  created_by,
  reviewed_at,
  reviewed_by,
  published_at,
  published_by,
  quality_score,
  report_count,
  status,
  updated_at,
  source_file_id,
  asset_url,
  source,
  tags,
  is_past_paper,
  paper_id
FROM public.questions;

-- 5) 表替换
DROP TABLE public.questions;
ALTER TABLE public.questions_new RENAME TO questions;

-- 6) 约束恢复
ALTER TABLE public.questions
  ADD CONSTRAINT questions_pkey PRIMARY KEY (id),
  ADD CONSTRAINT questions_content_hash_key UNIQUE (content_hash),
  ADD CONSTRAINT questions_chapter_id_fkey FOREIGN KEY (chapter_id) REFERENCES public.chapters(id) ON DELETE SET NULL,
  ADD CONSTRAINT questions_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE SET NULL,
  ADD CONSTRAINT questions_source_file_id_fkey FOREIGN KEY (source_file_id) REFERENCES public.source_files(id) ON DELETE SET NULL;

-- 7) 索引恢复
CREATE INDEX IF NOT EXISTS questions_chapter_id_idx ON public.questions (chapter_id);
CREATE INDEX IF NOT EXISTS questions_subject_id_idx ON public.questions (subject_id);
CREATE INDEX IF NOT EXISTS questions_source_file_id_idx ON public.questions (source_file_id);
CREATE INDEX IF NOT EXISTS questions_curriculum_idx ON public.questions (curriculum);
CREATE INDEX IF NOT EXISTS questions_grade_idx ON public.questions (grade);
CREATE INDEX IF NOT EXISTS questions_difficulty_idx ON public.questions (difficulty);
CREATE INDEX IF NOT EXISTS questions_status_idx ON public.questions (status);
CREATE INDEX IF NOT EXISTS questions_content_hash_idx ON public.questions (content_hash);
CREATE INDEX IF NOT EXISTS questions_is_past_paper_idx ON public.questions (is_past_paper);
CREATE INDEX IF NOT EXISTS questions_paper_id_idx ON public.questions (paper_id);
CREATE INDEX IF NOT EXISTS idx_questions_subject_curriculum_grade_status_past
  ON public.questions (subject_id, curriculum, grade, status, is_past_paper);

-- 8) RLS 与策略恢复
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "questions_auth_read" ON public.questions;
CREATE POLICY "questions_auth_read"
ON public.questions
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "questions_admin_all" ON public.questions;
CREATE POLICY "questions_admin_all"
ON public.questions
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 9) 重建 user_attempts/question_reports 到 questions 的外键
ALTER TABLE IF EXISTS public.user_attempts
  DROP CONSTRAINT IF EXISTS user_attempts_question_id_fkey;
ALTER TABLE IF EXISTS public.user_attempts
  ADD CONSTRAINT user_attempts_question_id_fkey
  FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.question_reports
  DROP CONSTRAINT IF EXISTS question_reports_question_id_fkey;
ALTER TABLE IF EXISTS public.question_reports
  ADD CONSTRAINT question_reports_question_id_fkey
  FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;

COMMIT;
