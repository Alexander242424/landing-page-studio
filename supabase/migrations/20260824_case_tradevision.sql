-- Add TradeVision to the work catalog (listing).
-- Full case body lives in src/lib/cases.ts.

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
