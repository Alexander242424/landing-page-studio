-- Dedup log for the 20:00 Warsaw daily analytics Telegram digest.

create table if not exists public.analytics_digest_log (
  day date primary key,
  sent_at timestamptz not null default now()
);

comment on table public.analytics_digest_log is
  'One row per Warsaw calendar day after the daily analytics Telegram digest is sent.';

alter table public.analytics_digest_log enable row level security;
