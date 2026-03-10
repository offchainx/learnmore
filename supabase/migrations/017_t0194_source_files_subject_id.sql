-- T-019.4: source_files 增加 subject_id，保证导入任务在无题目/失败时也能展示科目

ALTER TABLE public.source_files
  ADD COLUMN IF NOT EXISTS subject_id uuid;

-- 历史回填：从该任务首个有 subject_id 的题目回填
WITH first_subject AS (
  SELECT DISTINCT ON (q.source_file_id)
    q.source_file_id,
    q.subject_id
  FROM public.questions q
  WHERE q.source_file_id IS NOT NULL
    AND q.subject_id IS NOT NULL
  ORDER BY q.source_file_id, q.created_at ASC
)
UPDATE public.source_files sf
SET subject_id = fs.subject_id
FROM first_subject fs
WHERE sf.id = fs.source_file_id
  AND sf.subject_id IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'source_files_subject_id_fkey'
  ) THEN
    ALTER TABLE public.source_files
      ADD CONSTRAINT source_files_subject_id_fkey
      FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_source_files_subject_id ON public.source_files(subject_id);
