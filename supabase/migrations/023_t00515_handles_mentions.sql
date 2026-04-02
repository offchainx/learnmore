create table if not exists public.reserved_handles (
  id uuid primary key default gen_random_uuid(),
  handle text not null unique,
  reason text,
  created_at timestamptz not null default now()
);

insert into public.reserved_handles (handle, reason)
values
  ('admin', 'system'),
  ('administrator', 'system'),
  ('apple', 'brand'),
  ('api', 'system'),
  ('community', 'system'),
  ('dashboard', 'system'),
  ('elonmusk', 'public_figure'),
  ('help', 'system'),
  ('instagram', 'brand'),
  ('learnmore', 'official'),
  ('login', 'system'),
  ('logout', 'system'),
  ('moderator', 'system'),
  ('official', 'official'),
  ('root', 'system'),
  ('settings', 'system'),
  ('staff', 'official'),
  ('support', 'official'),
  ('system', 'system'),
  ('teacher', 'official'),
  ('team', 'official'),
  ('vercel', 'brand')
on conflict (handle) do nothing;

alter table public.posts
add column if not exists mentioned_handles text[] not null default '{}';

update public.posts
set mentioned_handles = coalesce(mentioned_usernames, '{}')
where coalesce(array_length(mentioned_handles, 1), 0) = 0;

alter table public.comments
add column if not exists mentioned_user_ids text[] not null default '{}';

alter table public.comments
add column if not exists mentioned_handles text[] not null default '{}';
