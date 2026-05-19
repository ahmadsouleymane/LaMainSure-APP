-- =========================================================================
-- 0002 — Supabase Storage : buckets + policies
-- =========================================================================
-- Convention de chemin : <userId>/<filename>  (ou pour chat : <conversationId>/<senderId>/<filename>)
-- Cela permet aux policies RLS de vérifier la propriété via storage.foldername(name)[1].

-- ---------- Buckets ------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars',          'avatars',          true,  5  * 1024 * 1024, array['image/jpeg','image/png','image/webp']),
  ('portfolio',        'portfolio',        true,  10 * 1024 * 1024, array['image/jpeg','image/png','image/webp']),
  ('kyc-docs',         'kyc-docs',         false, 10 * 1024 * 1024, array['image/jpeg','image/png','image/webp','application/pdf']),
  ('chat-attachments', 'chat-attachments', false, 15 * 1024 * 1024, array['image/jpeg','image/png','image/webp','audio/m4a','audio/aac','audio/mpeg'])
on conflict (id) do nothing;

-- ---------- Policies : avatars (public, owner-writable) -----------------

create policy "avatars_read_public" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'avatars');

create policy "avatars_write_own" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "avatars_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- ---------- Policies : portfolio (public read, pro-only write) ----------

create policy "portfolio_read_public" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'portfolio');

create policy "portfolio_write_own_pro" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'portfolio'
    and auth.uid()::text = (storage.foldername(name))[1]
    and exists (select 1 from public.pros where id = auth.uid())
  );

create policy "portfolio_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'portfolio' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "portfolio_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'portfolio' and auth.uid()::text = (storage.foldername(name))[1]);

-- ---------- Policies : kyc-docs (private, owner + admin only) -----------

create policy "kyc_read_own_or_admin" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'kyc-docs'
    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or public.is_admin(auth.uid())
    )
  );

create policy "kyc_write_own" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'kyc-docs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "kyc_delete_own_or_admin" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'kyc-docs'
    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or public.is_admin(auth.uid())
    )
  );

-- ---------- Policies : chat-attachments (parties du booking) ------------
-- Chemin attendu : <conversationId>/<senderId>/<filename>

create policy "chat_read_parties" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'chat-attachments'
    and exists (
      select 1
      from public.conversations c
      join public.bookings b on b.id = c.booking_id
      where c.id::text = (storage.foldername(name))[1]
        and (b.client_id = auth.uid() or b.pro_id = auth.uid())
    )
  );

create policy "chat_write_parties" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'chat-attachments'
    and auth.uid()::text = (storage.foldername(name))[2]
    and exists (
      select 1
      from public.conversations c
      join public.bookings b on b.id = c.booking_id
      where c.id::text = (storage.foldername(name))[1]
        and (b.client_id = auth.uid() or b.pro_id = auth.uid())
    )
  );
