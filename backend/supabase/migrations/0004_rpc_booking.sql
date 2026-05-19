-- =========================================================================
-- 0004 — RPC : workflow booking (transactions sûres)
-- =========================================================================
-- Toutes les fonctions tournent en SECURITY INVOKER : la RLS du booking
-- s'applique normalement. La transaction garantit cohérence booking ↔ conversation.
set search_path = public, extensions;

-- ---------- create_booking ---------------------------------------------
-- Client crée une demande + la conversation associée en une transaction.
create or replace function public.create_booking(
  p_pro_id        uuid,
  p_description   text,
  p_service_id    uuid default null,
  p_category_id   uuid default null,
  p_photos        text[] default '{}',
  p_lat           double precision default null,
  p_lng           double precision default null,
  p_address       text default null,
  p_scheduled_at  timestamptz default null
)
returns table (booking_id uuid, conversation_id uuid)
language plpgsql security invoker set search_path = public, extensions as $$
declare
  v_booking_id uuid;
  v_conv_id    uuid;
  v_loc        geography(point, 4326);
begin
  if p_lat is not null and p_lng is not null then
    v_loc := st_makepoint(p_lng, p_lat)::geography;
  end if;

  insert into public.bookings (
    client_id, pro_id, service_id, category_id,
    description, photos, location, address_text, scheduled_at, status
  ) values (
    auth.uid(), p_pro_id, p_service_id, p_category_id,
    p_description, coalesce(p_photos, '{}'), v_loc, p_address, p_scheduled_at, 'requested'
  )
  returning id into v_booking_id;

  insert into public.conversations (booking_id) values (v_booking_id)
  returning id into v_conv_id;

  return query select v_booking_id, v_conv_id;
end;
$$;

grant execute on function public.create_booking(uuid, text, uuid, uuid, text[], double precision, double precision, text, timestamptz) to authenticated;

-- ---------- send_quote (pro → client) ----------------------------------
create or replace function public.send_quote(
  p_booking_id uuid,
  p_price_xof  int
)
returns void
language plpgsql security invoker set search_path = public as $$
begin
  if p_price_xof < 0 then
    raise exception 'price must be >= 0';
  end if;

  update public.bookings
  set quoted_price_xof = p_price_xof,
      status = 'quoted'
  where id = p_booking_id
    and pro_id = auth.uid()
    and status in ('requested', 'quoted');

  if not found then
    raise exception 'booking not found or not allowed';
  end if;
end;
$$;

grant execute on function public.send_quote(uuid, int) to authenticated;

-- ---------- accept_quote (client) --------------------------------------
create or replace function public.accept_quote(p_booking_id uuid)
returns void
language plpgsql security invoker set search_path = public as $$
begin
  update public.bookings
  set status = 'accepted'
  where id = p_booking_id
    and client_id = auth.uid()
    and status = 'quoted';
  if not found then
    raise exception 'booking not found, not yours, or not in quoted state';
  end if;
end;
$$;

grant execute on function public.accept_quote(uuid) to authenticated;

-- ---------- start_work (pro) -------------------------------------------
create or replace function public.start_work(p_booking_id uuid)
returns void
language plpgsql security invoker set search_path = public as $$
begin
  update public.bookings
  set status = 'in_progress'
  where id = p_booking_id
    and pro_id = auth.uid()
    and status = 'accepted';
  if not found then
    raise exception 'booking not in accepted state or not yours';
  end if;
end;
$$;

grant execute on function public.start_work(uuid) to authenticated;

-- ---------- complete_booking (pro) -------------------------------------
create or replace function public.complete_booking(
  p_booking_id    uuid,
  p_final_price_xof int default null
)
returns void
language plpgsql security invoker set search_path = public as $$
begin
  update public.bookings
  set status = 'completed',
      final_price_xof = coalesce(p_final_price_xof, quoted_price_xof),
      completed_at = now()
  where id = p_booking_id
    and pro_id = auth.uid()
    and status in ('accepted', 'in_progress');
  if not found then
    raise exception 'booking not eligible for completion';
  end if;
end;
$$;

grant execute on function public.complete_booking(uuid, int) to authenticated;

-- ---------- cancel_booking (l'une ou l'autre partie) -------------------
create or replace function public.cancel_booking(p_booking_id uuid, p_reason text default null)
returns void
language plpgsql security invoker set search_path = public as $$
begin
  update public.bookings
  set status = 'cancelled'
  where id = p_booking_id
    and (client_id = auth.uid() or pro_id = auth.uid())
    and status in ('requested', 'quoted', 'accepted');
  if not found then
    raise exception 'cannot cancel this booking';
  end if;
end;
$$;

grant execute on function public.cancel_booking(uuid, text) to authenticated;
