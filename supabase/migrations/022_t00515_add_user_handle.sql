alter table public.users
add column if not exists handle text;

create unique index if not exists users_handle_key
on public.users (handle)
where handle is not null;
