-- T-019.6 批量导入修复：
-- 1) source_files 增加 source_note，确保任务列表可展示“来源备注”
-- 2) 回填历史记录（从 questions.source 抓取首条）

alter table if exists public.source_files
  add column if not exists source_note text;

update public.source_files sf
set source_note = q.source
from (
  select distinct on (source_file_id)
    source_file_id,
    source
  from public.questions
  where source_file_id is not null
    and source is not null
    and btrim(source) <> ''
  order by source_file_id, created_at asc
) q
where q.source_file_id = sf.id
  and (sf.source_note is null or btrim(sf.source_note) = '');
