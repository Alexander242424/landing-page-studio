-- Add Forbes to the work catalog (listing + mega menu).
-- Full case body lives in src/lib/cases.ts.

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
