-- T-018: 删除练习模块废弃表
-- 目标表：chapter_prerequisites / question_groups / question_tag_relations / knowledge_points / question_kp_relations

DROP TABLE IF EXISTS public.question_kp_relations;
DROP TABLE IF EXISTS public.question_tag_relations;
DROP TABLE IF EXISTS public.chapter_prerequisites;
DROP TABLE IF EXISTS public.knowledge_points;

-- 先拆除 question_groups 依赖（旧外键/旧中间表）
ALTER TABLE IF EXISTS public.questions
  DROP CONSTRAINT IF EXISTS questions_group_id_fkey;

ALTER TABLE IF EXISTS public.questions
  DROP COLUMN IF EXISTS group_id;

DROP TABLE IF EXISTS public."_SourceToGroup";

DROP TABLE IF EXISTS public.question_groups;
