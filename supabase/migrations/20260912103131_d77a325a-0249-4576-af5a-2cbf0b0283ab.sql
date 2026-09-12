insert into public.case_studies (
  slug, client, title, headline_line, headline_emphasis, description,
  logo, image, services, href, sort_order, has_page, year, filters
) values
(
  'forbes',
  'Forbes',
  '+3.1x suite inquiries by leading with the destination.',
  '+3.1x suite inquiries',
  'by leading with the destination.',
  $d$+3.1x suite inquiries after we led Forbes hospitality with destination first — then opened a clear path to book.$d$,
  '/logos/forbes.svg',
  '/glance/forbes.jpg',
  array['Product design', 'Brand systems', 'Ecommerce'],
  '/work/forbes',
  7,
  true,
  '2024',
  array['Product design', 'Brand systems', 'Ecommerce']
)
on conflict (slug) do nothing;

create table if not exists public.analytics_digest_log (
  day date primary key,
  sent_at timestamptz not null default now()
);

comment on table public.analytics_digest_log is
  'One row per Warsaw calendar day after the daily analytics Telegram digest is sent.';

grant all on public.analytics_digest_log to service_role;

alter table public.analytics_digest_log enable row level security;

create policy "Deny all access to analytics_digest_log"
  on public.analytics_digest_log
  as restrictive
  for all
  to anon, authenticated
  using (false)
  with check (false);

alter table public.analytics_events
  add column if not exists city text;

comment on column public.analytics_events.city is
  'Resolved server-side from CF / Vercel / CloudFront headers or IP lookup. Never from a client payload.';

update public.case_studies
set image = '/glance/grono.webp'
where slug = 'grono';

update public.case_studies
set image = '/glance/foundrae.webp'
where slug = 'foundrae';

insert into public.case_studies (
  slug, client, title, headline_line, headline_emphasis, description,
  logo, image, services, href, sort_order, has_page, year, filters
) values
(
  'tradevision',
  'TradeVision',
  '+2.4x daily sessions by making options flow readable.',
  '+2.4x daily sessions',
  'by making options flow readable.',
  $d$+2.4x daily sessions after we turned TradeVision options flow into a surface traders can read before the close.$d$,
  '/logos/tradevision.svg',
  '/glance/tradevision.jpg',
  array['Product design', 'CRO', 'Activation'],
  '/work/tradevision',
  8,
  true,
  '2025',
  array['Product design', 'CRO', 'Activation']
)
on conflict (slug) do nothing;

update public.case_studies
set image = '/glance/stan.webp'
where slug = 'stan';