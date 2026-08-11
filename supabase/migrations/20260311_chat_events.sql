-- UXLAB ask-bar chat events + transcripts
-- Apply in Supabase SQL editor or via `supabase db push`.

create extension if not exists "pgcrypto";

create table if not exists public.chat_events (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  event_type text not null,
  intent text,
  role text check (role is null or role in ('user', 'assistant')),
  content text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists chat_events_session_id_idx
  on public.chat_events (session_id);

create index if not exists chat_events_created_at_idx
  on public.chat_events (created_at desc);

create index if not exists chat_events_event_type_idx
  on public.chat_events (event_type);

comment on table public.chat_events is
  'Ask-bar intents, chip clicks, and full chat transcripts (user + assistant).';

-- Service role bypasses RLS; enable for anon inserts only if you accept public writes.
alter table public.chat_events enable row level security;

-- Optional: allow inserts with the anon key from the browser (prefer server + service role).
-- create policy "Allow anon insert chat_events"
--   on public.chat_events for insert
--   to anon
--   with check (true);
