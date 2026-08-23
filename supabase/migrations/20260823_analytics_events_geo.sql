-- Optional city on page/article events (edge geo / IP lookup).
-- Country + UTM already exist on analytics_events.

alter table public.analytics_events
  add column if not exists city text;

comment on column public.analytics_events.city is
  'Resolved server-side from CF / Vercel / CloudFront headers or IP lookup. Never from a client payload.';
