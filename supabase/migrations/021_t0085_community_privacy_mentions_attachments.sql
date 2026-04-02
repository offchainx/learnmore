alter table if exists public.posts
  add column if not exists is_private boolean not null default false,
  add column if not exists attachments text[] not null default '{}'::text[],
  add column if not exists mentioned_user_ids text[] not null default '{}'::text[],
  add column if not exists mentioned_usernames text[] not null default '{}'::text[];

