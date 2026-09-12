create table if not exists public.digest_cron_token (
  id boolean primary key default true check (id),
  token text not null default encode(gen_random_bytes(32), 'hex'),
  created_at timestamptz not null default now()
);

comment on table public.digest_cron_token is
  'Shared token used by the in-database scheduler to call the daily digest endpoint. Server-only.';

insert into public.digest_cron_token (id) values (true)
on conflict (id) do nothing;

grant all on public.digest_cron_token to service_role;

alter table public.digest_cron_token enable row level security;

create policy "Deny all access to digest_cron_token"
  on public.digest_cron_token
  as restrictive
  for all
  to anon, authenticated
  using (false)
  with check (false);