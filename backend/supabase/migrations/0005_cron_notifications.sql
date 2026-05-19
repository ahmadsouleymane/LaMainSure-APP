-- =========================================================================
-- 0005 — Notifications + pg_cron (rappels, purge)
-- =========================================================================
set search_path = public, extensions;
-- ⚠️  pg_cron doit être activé via le dashboard Supabase :
--    Database → Extensions → "pg_cron" → Enable.
-- Si pas encore activé au moment du push, commente les blocs cron.schedule
-- ci-dessous, applique la migration, active pg_cron, puis ré-applique.

create extension if not exists pg_cron;

-- ---------- Table notifications ----------------------------------------
-- File d'attente lue par l'Edge Function notify-push qui appelle Expo Push.

create type notification_kind as enum (
  'new_message',
  'booking_requested',
  'booking_quoted',
  'booking_accepted',
  'booking_completed',
  'booking_reminder',
  'review_received'
);

create table public.notifications (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  kind          notification_kind not null,
  title         text not null,
  body          text,
  data          jsonb not null default '{}'::jsonb,
  read_at       timestamptz,
  sent_at       timestamptz,           -- rempli par l'Edge Function après push
  created_at    timestamptz not null default now()
);
create index notifications_user_unread_idx
  on public.notifications (user_id, created_at desc)
  where read_at is null;
create index notifications_pending_idx
  on public.notifications (created_at)
  where sent_at is null;

alter table public.notifications enable row level security;
create policy notif_read_self on public.notifications
  for select to authenticated using (user_id = auth.uid());
create policy notif_update_self on public.notifications
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
-- Insert : pas de policy → seuls les triggers/RPC en security definer peuvent insérer.

-- ---------- Trigger : notif sur new message ---------------------------
create or replace function public.notif_on_message()
returns trigger language plpgsql security definer set search_path = public, extensions as $$
declare
  v_other uuid;
  v_sender_name text;
begin
  -- Trouver l'autre partie du booking
  select case when b.client_id = new.sender_id then b.pro_id else b.client_id end
  into v_other
  from public.conversations c
  join public.bookings b on b.id = c.booking_id
  where c.id = new.conversation_id;

  select full_name into v_sender_name from public.profiles where id = new.sender_id;

  if v_other is not null then
    insert into public.notifications (user_id, kind, title, body, data)
    values (
      v_other,
      'new_message',
      coalesce(v_sender_name, 'Nouveau message'),
      coalesce(left(new.body, 140), '📎 pièce jointe'),
      jsonb_build_object('conversation_id', new.conversation_id, 'message_id', new.id)
    );
  end if;

  return new;
end;
$$;

create trigger trg_message_notify
  after insert on public.messages
  for each row execute function public.notif_on_message();

-- ---------- Trigger : notif sur changement de status booking ----------
create or replace function public.notif_on_booking_status()
returns trigger language plpgsql security definer set search_path = public, extensions as $$
declare
  v_target uuid;
  v_kind notification_kind;
  v_title text;
begin
  if tg_op = 'INSERT' then
    v_target := new.pro_id;
    v_kind := 'booking_requested';
    v_title := 'Nouvelle demande';
  elsif new.status = old.status then
    return new;
  elsif new.status = 'quoted' then
    v_target := new.client_id; v_kind := 'booking_quoted'; v_title := 'Devis reçu';
  elsif new.status = 'accepted' then
    v_target := new.pro_id; v_kind := 'booking_accepted'; v_title := 'Devis accepté';
  elsif new.status = 'completed' then
    v_target := new.client_id; v_kind := 'booking_completed'; v_title := 'Mission terminée';
  else
    return new;
  end if;

  insert into public.notifications (user_id, kind, title, body, data)
  values (v_target, v_kind, v_title, new.description, jsonb_build_object('booking_id', new.id));

  return new;
end;
$$;

create trigger trg_booking_notify_insert
  after insert on public.bookings
  for each row execute function public.notif_on_booking_status();
create trigger trg_booking_notify_update
  after update of status on public.bookings
  for each row execute function public.notif_on_booking_status();

-- ---------- Trigger : notif sur new review ----------------------------
create or replace function public.notif_on_review()
returns trigger language plpgsql security definer set search_path = public, extensions as $$
begin
  insert into public.notifications (user_id, kind, title, body, data)
  values (
    new.target_id,
    'review_received',
    'Nouvel avis ' || new.rating || '⭐',
    coalesce(left(new.comment, 140), null),
    jsonb_build_object('booking_id', new.booking_id, 'review_id', new.id)
  );
  return new;
end;
$$;

create trigger trg_review_notify
  after insert on public.reviews
  for each row execute function public.notif_on_review();

-- ---------- Cron : rappels de bookings J-1 ----------------------------
create or replace function public.enqueue_booking_reminders()
returns void language plpgsql security definer set search_path = public, extensions as $$
begin
  insert into public.notifications (user_id, kind, title, body, data)
  select
    unnest(array[b.client_id, b.pro_id]),
    'booking_reminder',
    'Rappel : mission demain',
    b.description,
    jsonb_build_object('booking_id', b.id, 'scheduled_at', b.scheduled_at)
  from public.bookings b
  where b.status in ('accepted', 'in_progress')
    and b.scheduled_at is not null
    and b.scheduled_at >= now() + interval '23 hours'
    and b.scheduled_at <  now() + interval '25 hours'
    and not exists (
      select 1 from public.notifications n
      where n.kind = 'booking_reminder'
        and (n.data->>'booking_id')::uuid = b.id
    );
end;
$$;

-- ---------- Cron : purge anciens reports résolus + notifs lues -------
create or replace function public.cron_purge_old()
returns void language plpgsql security definer set search_path = public, extensions as $$
begin
  delete from public.notifications
  where read_at is not null and read_at < now() - interval '60 days';

  delete from public.reports
  where status in ('resolved', 'dismissed') and reviewed_at < now() - interval '180 days';
end;
$$;

-- ---------- Schedule (commenter si pg_cron pas encore activé) ---------
select cron.schedule(
  'booking-reminders-hourly',
  '0 * * * *',
  $$select public.enqueue_booking_reminders();$$
);

select cron.schedule(
  'purge-old-daily',
  '15 3 * * *',
  $$select public.cron_purge_old();$$
);
