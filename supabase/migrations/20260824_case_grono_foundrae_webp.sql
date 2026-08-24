-- Point Grono and Foundrae catalog stills at the new WebP frames.

update public.case_studies
set image = '/glance/grono.webp'
where slug = 'grono';

update public.case_studies
set image = '/glance/foundrae.webp'
where slug = 'foundrae';
