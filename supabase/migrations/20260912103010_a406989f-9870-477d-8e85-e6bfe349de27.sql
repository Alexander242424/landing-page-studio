create extension if not exists "pgcrypto";

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  path text not null,
  article_slug text,
  event text not null
    check (event in ('view', 'heartbeat', 'scroll', 'hide')),
  session_id text not null,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  device text
    check (device is null or device in ('mobile', 'tablet', 'desktop')),
  viewport_w integer,
  scroll_pct integer
    check (scroll_pct is null or (scroll_pct >= 0 and scroll_pct <= 100)),
  duration_ms integer,
  country text,
  country_code text
);

create index if not exists analytics_events_created_at_idx
  on public.analytics_events (created_at desc);

create index if not exists analytics_events_article_slug_idx
  on public.analytics_events (article_slug, created_at desc);

create index if not exists analytics_events_session_id_idx
  on public.analytics_events (session_id);

create index if not exists analytics_events_event_idx
  on public.analytics_events (event, created_at desc);

comment on table public.analytics_events is
  'Anonymous read analytics. session_id is a first-party cookie UUID, not PII. No IP column.';

alter table public.analytics_events enable row level security;

create policy "Allow authenticated read analytics_events"
  on public.analytics_events for select
  to authenticated
  using (true);

grant select on public.analytics_events to authenticated;
grant all on public.analytics_events to service_role;

create or replace view public.article_analytics_daily
  with (security_invoker = true)
as
select
  (created_at at time zone 'utc')::date as day,
  article_slug,
  count(*) filter (where event = 'view') as views,
  count(distinct session_id) as unique_sessions,
  round(
    avg(duration_ms) filter (
      where event in ('heartbeat', 'hide') and duration_ms is not null
    )
  )::integer as avg_duration_ms,
  round(
    avg(scroll_pct) filter (where scroll_pct is not null)
  )::integer as avg_scroll_pct
from public.analytics_events
where article_slug is not null
group by 1, 2;

create or replace view public.article_analytics_totals
  with (security_invoker = true)
as
select
  article_slug,
  count(*) filter (where event = 'view') as views,
  count(distinct session_id) as unique_sessions,
  round(
    avg(duration_ms) filter (
      where event in ('heartbeat', 'hide') and duration_ms is not null
    )
  )::integer as avg_duration_ms,
  round(
    avg(scroll_pct) filter (where scroll_pct is not null)
  )::integer as avg_scroll_pct
from public.analytics_events
where article_slug is not null
group by 1;

grant select on public.article_analytics_daily to authenticated;
grant select on public.article_analytics_totals to authenticated;
grant select on public.article_analytics_daily to service_role;
grant select on public.article_analytics_totals to service_role;