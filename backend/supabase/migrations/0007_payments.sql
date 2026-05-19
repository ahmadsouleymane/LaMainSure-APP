-- =========================================================================
-- 0007 — Paiements (provider-agnostic)
-- =========================================================================
-- Compatible Stripe / CinetPay / Wave / Orange Money / Flutterwave.
-- L'Edge Function `payment-webhook` reçoit les notifications providers,
-- valide la signature, puis insère/met à jour cette table.
set search_path = public, extensions;

create type payment_provider as enum ('stripe', 'cinetpay', 'wave', 'orange_money', 'flutterwave', 'manual');
create type payment_status   as enum ('pending', 'succeeded', 'failed', 'refunded', 'cancelled');

create table public.payments (
  id              uuid primary key default gen_random_uuid(),
  booking_id      uuid not null references public.bookings(id) on delete cascade,
  payer_id        uuid not null references public.profiles(id) on delete restrict,
  payee_id        uuid not null references public.profiles(id) on delete restrict,
  provider        payment_provider not null,
  amount_xof      int not null check (amount_xof > 0),
  currency        text not null default 'XOF',
  status          payment_status not null default 'pending',
  external_ref    text,            -- id côté provider (ex : stripe charge id)
  external_payload jsonb,          -- payload brut du webhook pour debug
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  succeeded_at    timestamptz,
  unique (provider, external_ref)
);
create index payments_booking_idx on public.payments (booking_id);
create index payments_status_idx on public.payments (status);

create trigger trg_payments_updated before update on public.payments
  for each row execute function public.set_updated_at();

-- ---------- Sync vers bookings ------------------------------------------
-- Quand un paiement passe à 'succeeded', on flag le booking.
alter table public.bookings add column payment_status payment_status not null default 'pending';

create or replace function public.sync_booking_payment_status()
returns trigger language plpgsql security definer set search_path = public, extensions as $$
begin
  if new.status = 'succeeded' and (old.status is null or old.status <> 'succeeded') then
    update public.bookings set payment_status = 'succeeded' where id = new.booking_id;
  elsif new.status = 'refunded' then
    update public.bookings set payment_status = 'refunded' where id = new.booking_id;
  end if;
  return new;
end;
$$;

create trigger trg_payments_sync_booking
  after insert or update of status on public.payments
  for each row execute function public.sync_booking_payment_status();

-- ---------- RLS ---------------------------------------------------------
alter table public.payments enable row level security;

-- Lecture : le payer ou le payee (et admin)
create policy payments_read_parties on public.payments
  for select to authenticated using (payer_id = auth.uid() or payee_id = auth.uid());

create policy payments_admin_all on public.payments
  for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- Insert / update : uniquement service_role via Edge Function (pas de policy → bloqué pour user normal)
