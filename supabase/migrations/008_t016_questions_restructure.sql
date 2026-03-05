-- T-016: questions 表结构优化（新增字段、回填、索引、删除旧字段）

ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS curriculum text,
  ADD COLUMN IF NOT EXISTS grade integer,
  ADD COLUMN IF NOT EXISTS subject_id uuid,
  ADD COLUMN IF NOT EXISTS source_file_id uuid,
  ADD COLUMN IF NOT EXISTS asset_url text,
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS is_past_paper boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS paper_id text;

UPDATE public.questions
SET curriculum = 'UEC'
WHERE curriculum IS NULL;

ALTER TABLE public.questions
  ALTER COLUMN curriculum SET DEFAULT 'UEC',
  ALTER COLUMN curriculum SET NOT NULL;

UPDATE public.questions q
SET subject_id = c.subject_id
FROM public.chapters c
WHERE q.subject_id IS NULL
  AND q.chapter_id IS NOT NULL
  AND q.chapter_id = c.id;

UPDATE public.questions
SET tags = ARRAY[]::text[]
WHERE tags IS NULL;

ALTER TABLE public.questions
  ALTER COLUMN tags SET DEFAULT ARRAY[]::text[],
  ALTER COLUMN tags SET NOT NULL,
  ALTER COLUMN is_past_paper SET DEFAULT false,
  ALTER COLUMN is_past_paper SET NOT NULL;

ALTER TABLE public.questions
  DROP COLUMN IF EXISTS ocr_raw_text,
  DROP COLUMN IF EXISTS ocr_confidence,
  DROP COLUMN IF EXISTS original_question_id,
  DROP COLUMN IF EXISTS version;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'questions_subject_id_fkey'
  ) THEN
    ALTER TABLE public.questions
      ADD CONSTRAINT questions_subject_id_fkey
      FOREIGN KEY (subject_id) REFERENCES public.subjects(id)
      ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'questions_source_file_id_fkey'
  ) THEN
    ALTER TABLE public.questions
      ADD CONSTRAINT questions_source_file_id_fkey
      FOREIGN KEY (source_file_id) REFERENCES public.source_files(id)
      ON DELETE SET NULL;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_questions_subject_id
  ON public.questions(subject_id);

CREATE INDEX IF NOT EXISTS idx_questions_curriculum
  ON public.questions(curriculum);

CREATE INDEX IF NOT EXISTS idx_questions_grade
  ON public.questions(grade);

CREATE INDEX IF NOT EXISTS idx_questions_status
  ON public.questions(status);

CREATE INDEX IF NOT EXISTS idx_questions_is_past_paper
  ON public.questions(is_past_paper);

CREATE INDEX IF NOT EXISTS idx_questions_subject_curriculum_grade_status_past
  ON public.questions(subject_id, curriculum, grade, status, is_past_paper);
