create policy "Deny all access to chat_events"
  on public.chat_events
  as restrictive
  for all
  to anon, authenticated
  using (false)
  with check (false);