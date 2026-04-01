do $$
begin
  if not exists (
    select 1
    from pg_type
    where typnamespace = 'public'::regnamespace
      and typname = 'FeedbackEventType'
  ) then
    create type public."FeedbackEventType" as enum (
      'SUBMITTED',
      'STATUS_CHANGED',
      'REPLIED',
      'CLOSED'
    );
  end if;
end
$$;

create table if not exists public.user_feedback_events (
  id uuid primary key default gen_random_uuid(),
  feedback_id uuid not null references public.user_feedbacks(id) on delete cascade,
  actor_id uuid references public.users(id) on delete set null,
  event_type public."FeedbackEventType" not null,
  from_status public."FeedbackStatus",
  to_status public."FeedbackStatus",
  message text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_user_feedback_events_feedback_created_at
  on public.user_feedback_events (feedback_id, created_at);

create index if not exists idx_user_feedback_events_actor_id
  on public.user_feedback_events (actor_id);
