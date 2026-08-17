-- Work / case-study catalog (list + mega menu).
-- Apply in Supabase SQL editor or via `supabase db push`.
-- Full case bodies remain in src/lib/cases.ts; this table is the shared listing source.

create table if not exists public.case_studies (
  slug text primary key,
  client text not null,
  title text not null,
  headline_line text not null,
  headline_emphasis text not null,
  description text not null default '',
  logo text not null default '',
  image text not null default '',
  services text[] not null default '{}',
  href text not null,
  sort_order integer not null default 0,
  has_page boolean not null default true,
  year text not null default '',
  filters text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists case_studies_sort_order_idx
  on public.case_studies (sort_order);

comment on table public.case_studies is
  'Work catalog: mega titles, list rows, and case-study cards. Seeded from src/lib/cases.ts.';

comment on column public.case_studies.title is
  'Short mega/list title (headline_line + headline_emphasis).';

alter table public.case_studies enable row level security;

drop policy if exists "Allow public read case_studies" on public.case_studies;
create policy "Allow public read case_studies"
  on public.case_studies for select
  to anon, authenticated
  using (true);

insert into public.case_studies (
  slug, client, title, headline_line, headline_emphasis, description,
  logo, image, services, href, sort_order, has_page, year, filters
) values
(
  'oura',
  'Oura',
  'Category-defining wearables brand & product experience.',
  'Category-defining wearables',
  'brand & product experience.',
  $d$How UXLAB shaped a wearable brand and product experience around readiness, recovery, and rituals people keep — not dashboards they abandon.$d$,
  '/logos/oura.svg',
  '/glance/oura.jpg',
  array['Product design', 'Brand systems', 'CRO', 'Activation'],
  '/work/oura',
  0,
  true,
  '2024',
  array['Product design', 'Brand systems', 'CRO', 'Activation']
),
(
  'bankrollu',
  'Bankroll U',
  'Sports markets, clear at the next play.',
  'Sports markets, clear',
  'at the next play.',
  $d$How UXLAB clarified sports-market moments so the next play reads instantly — product surfaces that keep conviction high when the clock is moving.$d$,
  '/logos/bankrollu.svg',
  '/glance/bankrollu.jpg',
  array['Product design', 'CRO', 'Activation'],
  '/work/bankrollu',
  1,
  true,
  '2024',
  array['Product design', 'CRO', 'Activation']
),
(
  'grono',
  'Grono',
  'A week of content from one calm surface.',
  'A week of content',
  'from one calm surface.',
  $d$How UXLAB turned Grono’s content engine into one calm surface — planning a week of output without the chaos of a crowded dashboard.$d$,
  '/logos/grono.svg',
  '/glance/grono.jpg',
  array['Product design', 'Brand systems', 'Activation'],
  '/work/grono',
  2,
  true,
  '2024',
  array['Product design', 'Brand systems', 'Activation']
),
(
  'nespresso',
  'Nespresso',
  'Premium coffee commerce designed for mobile.',
  'Premium coffee commerce',
  'designed for mobile.',
  $d$How UXLAB shaped premium coffee commerce for mobile — ritual, assortment, and checkout that feel as considered as the cup.$d$,
  '/logos/nespresso.svg',
  '/glance/nespresso.jpg',
  array['Product design', 'CRO', 'Ecommerce'],
  '/work/nespresso',
  3,
  true,
  '2024',
  array['Product design', 'CRO', 'Ecommerce']
),
(
  'foundrae',
  'Foundrae',
  'Jewelry storytelling that invites the shop.',
  'Jewelry storytelling',
  'that invites the shop.',
  $d$How UXLAB built jewelry storytelling that invites the shop — narrative surfaces that lead with meaning, then make purchase feel inevitable.$d$,
  '/logos/foundrae.svg',
  '/glance/foundrae.jpg',
  array['Product design', 'Brand systems', 'Ecommerce'],
  '/work/foundrae',
  4,
  true,
  '2024',
  array['Product design', 'Brand systems', 'Ecommerce']
),
(
  'boostra',
  'Boostra',
  'Conversion analysis teams can act on.',
  'Conversion analysis',
  'teams can act on.',
  $d$How UXLAB turned conversion analysis into something teams can act on — clear signal, prioritized friction, and interventions meant to ship.$d$,
  '/logos/boostra.svg',
  '/glance/boostra.jpg',
  array['CRO', 'Product design', 'Experimentation'],
  '/work/boostra',
  5,
  true,
  '2024',
  array['CRO', 'Product design', 'Experimentation']
),
(
  'stan',
  'Stan',
  'Creator profiles built for exclusive access.',
  'Creator profiles',
  'built for exclusive access.',
  $d$How UXLAB shaped creator profiles for exclusive access — identity, membership, and gated moments that feel premium without friction.$d$,
  '/logos/stan.svg',
  '/glance/stan.jpg',
  array['Product design', 'Brand systems', 'Activation'],
  '/work/stan',
  6,
  true,
  '2024',
  array['Product design', 'Brand systems', 'Activation']
)
on conflict (slug) do nothing;
