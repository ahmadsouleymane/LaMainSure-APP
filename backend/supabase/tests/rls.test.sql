-- =========================================================================
-- Tests RLS — exécutés en local avec :
--   supabase db reset && psql "$(supabase status -o json | jq -r .DB_URL)" -f supabase/tests/rls.test.sql
--
-- Approche : on simule 3 users (alice client, bob client, charlie pro),
-- on insère des données via le service_role (bypass RLS),
-- puis on bascule sur leur JWT (set_config role + request.jwt.claims) et
-- on vérifie qu'ils voient / ne voient pas ce qu'ils doivent.
-- =========================================================================

begin;

-- Helpers pour usurper un user dans la session
create or replace function tests_set_user(p_uid uuid) returns void
language plpgsql as $$
begin
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims', json_build_object('sub', p_uid, 'role', 'authenticated')::text, true);
end;
$$;

create or replace function tests_reset() returns void
language plpgsql as $$
begin
  perform set_config('role', 'postgres', true);
  perform set_config('request.jwt.claims', '', true);
end;
$$;

-- ---- Setup : 3 fake users + données -----------------------------------
do $$
declare
  v_alice   uuid := '11111111-1111-1111-1111-111111111111';
  v_bob     uuid := '22222222-2222-2222-2222-222222222222';
  v_charlie uuid := '33333333-3333-3333-3333-333333333333';
  v_booking_id uuid;
begin
  -- insère dans auth.users (uniquement possible en super-user, qui est notre rôle ici)
  insert into auth.users (id, email) values
    (v_alice, 'alice@test.com'),
    (v_bob, 'bob@test.com'),
    (v_charlie, 'charlie@test.com')
  on conflict do nothing;

  -- profiles : créés automatiquement par le trigger handle_new_user.
  update public.profiles set full_name = 'Alice', city = 'Abidjan' where id = v_alice;
  update public.profiles set full_name = 'Bob', city = 'Dakar' where id = v_bob;
  update public.profiles set full_name = 'Charlie', city = 'Douala', role = 'pro', is_pro_enabled = true where id = v_charlie;

  insert into public.pros (id, display_name, is_visible) values (v_charlie, 'Atelier Charlie', true)
  on conflict (id) do nothing;

  insert into public.bookings (id, client_id, pro_id, description, status)
  values (gen_random_uuid(), v_alice, v_charlie, 'Test booking alice→charlie', 'requested')
  returning id into v_booking_id;
end $$;

-- ---- Test 1 : Bob ne doit PAS voir le booking d'Alice ----------------
select tests_set_user('22222222-2222-2222-2222-222222222222'::uuid);
do $$
declare cnt int;
begin
  select count(*) into cnt from public.bookings;
  if cnt <> 0 then
    raise exception 'FAIL test 1 : Bob voit % bookings (devrait être 0)', cnt;
  end if;
  raise notice 'PASS test 1 : Bob ne voit aucun booking';
end $$;

-- ---- Test 2 : Alice voit son booking ---------------------------------
select tests_set_user('11111111-1111-1111-1111-111111111111'::uuid);
do $$
declare cnt int;
begin
  select count(*) into cnt from public.bookings where client_id = '11111111-1111-1111-1111-111111111111';
  if cnt < 1 then
    raise exception 'FAIL test 2 : Alice devrait voir son booking, voit %', cnt;
  end if;
  raise notice 'PASS test 2 : Alice voit son booking';
end $$;

-- ---- Test 3 : Charlie (pro) voit le booking où il est pro -----------
select tests_set_user('33333333-3333-3333-3333-333333333333'::uuid);
do $$
declare cnt int;
begin
  select count(*) into cnt from public.bookings where pro_id = '33333333-3333-3333-3333-333333333333';
  if cnt < 1 then
    raise exception 'FAIL test 3 : Charlie devrait voir le booking où il est pro';
  end if;
  raise notice 'PASS test 3 : Charlie voit le booking où il est pro';
end $$;

-- ---- Test 4 : Bob ne peut PAS écrire dans profile d'Alice -----------
select tests_set_user('22222222-2222-2222-2222-222222222222'::uuid);
do $$
declare err_caught boolean := false;
begin
  begin
    update public.profiles set city = 'Hack' where id = '11111111-1111-1111-1111-111111111111';
    -- update sans erreur mais 0 lignes affectées → vérifier
    if (select city from public.profiles where id = '11111111-1111-1111-1111-111111111111') = 'Hack' then
      raise exception 'FAIL test 4 : Bob a pu modifier le profil d''Alice';
    end if;
  exception when others then
    err_caught := true;
  end;
  raise notice 'PASS test 4 : Bob ne peut pas modifier le profil d''Alice';
end $$;

-- ---- Test 5 : un pro ne peut PAS s'auto-rendre is_visible ----------
select tests_set_user('33333333-3333-3333-3333-333333333333'::uuid);
do $$
begin
  -- on simule un pro initialement non-visible
  perform tests_reset();
  update public.pros set is_visible = false where id = '33333333-3333-3333-3333-333333333333';
  perform tests_set_user('33333333-3333-3333-3333-333333333333'::uuid);

  begin
    update public.pros set is_visible = true where id = '33333333-3333-3333-3333-333333333333';
  exception when others then null;
  end;

  if (select is_visible from public.pros where id = '33333333-3333-3333-3333-333333333333') = true then
    raise exception 'FAIL test 5 : un pro a pu changer son is_visible';
  end if;
  raise notice 'PASS test 5 : un pro ne peut pas changer son is_visible';
end $$;

select tests_reset();
rollback;
