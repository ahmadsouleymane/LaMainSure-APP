-- =========================================================================
-- La Main Sûre — schéma initial
-- Marketplace particuliers ↔ pros vérifiés (Afrique). Lancement public: 2026-06-11.
-- =========================================================================

-- Supabase place les extensions dans le schéma "extensions" :
-- on étend le search_path pour voir geography / st_* sans qualification.
set search_path = public, extensions;

-- ---------- Extensions ---------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "postgis" with schema extensions;

-- ---------- Types --------------------------------------------------------
create type user_role as enum ('client', 'pro', 'admin');
create type kyc_status as enum ('pending', 'submitted', 'approved', 'rejected');
create type booking_status as enum (
  'requested',     -- demande envoyée par client
  'quoted',        -- devis envoyé par pro
  'accepted',      -- client a accepté le devis
  'in_progress',   -- mission en cours
  'completed',     -- mission terminée
  'cancelled',     -- annulée
  'disputed'       -- litige
);
create type report_reason as enum ('spam', 'scam', 'inappropriate', 'harassment', 'other');
create type report_status as enum ('open', 'reviewing', 'resolved', 'dismissed');

-- ---------- Tables -------------------------------------------------------

-- 1) Profil utilisateur (1 ligne par auth.users)
create table public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  full_name       text,
  avatar_url      text,
  phone           text,
  role            user_role not null default 'client',
  country_code    text,                    -- ISO 3166-1 alpha-2 (CI, SN, CM…)
  city            text,
  location        geography(point, 4326),  -- recherche géo
  language        text default 'fr',
  is_pro_enabled  boolean not null default false,
  expo_push_token text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index profiles_location_idx on public.profiles using gist (location);
create index profiles_role_idx on public.profiles (role);

-- 2) Catégories de service (artisan, plombier, dev, beatmaker…)
create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name_fr     text not null,
  name_en     text,
  icon        text,
  parent_id   uuid references public.categories(id) on delete set null,
  sort_order  int not null default 0
);

-- 3) Fiche pro (étend profiles pour les utilisateurs avec role = 'pro')
create table public.pros (
  id                  uuid primary key references public.profiles(id) on delete cascade,
  display_name        text not null,
  bio                 text,
  years_experience    int check (years_experience >= 0),
  service_radius_km   int default 20 check (service_radius_km between 1 and 200),
  kyc_status          kyc_status not null default 'pending',
  kyc_submitted_at    timestamptz,
  kyc_reviewed_at     timestamptz,
  kyc_reviewed_by     uuid references auth.users(id) on delete set null,
  kyc_doc_urls        text[] default '{}',          -- chemins Storage privés
  is_visible          boolean not null default false, -- true seulement après approbation
  rating_avg          numeric(3,2) not null default 0,
  rating_count        int not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index pros_visible_idx on public.pros (is_visible) where is_visible = true;

-- 4) Pro ↔ catégories (un pro peut couvrir plusieurs catégories)
create table public.pro_categories (
  pro_id      uuid not null references public.pros(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  primary key (pro_id, category_id)
);

-- 5) Services proposés par un pro (offres tarifées)
create table public.services (
  id            uuid primary key default gen_random_uuid(),
  pro_id        uuid not null references public.pros(id) on delete cascade,
  category_id   uuid not null references public.categories(id) on delete restrict,
  title         text not null,
  description   text,
  price_xof     int check (price_xof >= 0),   -- prix indicatif en XOF (peut être null = sur devis)
  duration_min  int check (duration_min > 0),
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);
create index services_pro_idx on public.services (pro_id);
create index services_category_idx on public.services (category_id) where is_active = true;

-- 6) Portfolio (photos pro)
create table public.portfolio_items (
  id          uuid primary key default gen_random_uuid(),
  pro_id      uuid not null references public.pros(id) on delete cascade,
  image_url   text not null,
  caption     text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- 7) Bookings (demandes / missions)
create table public.bookings (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid not null references public.profiles(id) on delete restrict,
  pro_id          uuid not null references public.pros(id) on delete restrict,
  service_id      uuid references public.services(id) on delete set null,
  category_id     uuid references public.categories(id) on delete set null,
  status          booking_status not null default 'requested',
  description     text not null,
  photos          text[] default '{}',
  location        geography(point, 4326),
  address_text    text,
  scheduled_at    timestamptz,
  quoted_price_xof int check (quoted_price_xof >= 0),
  final_price_xof  int check (final_price_xof >= 0),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  completed_at    timestamptz
);
create index bookings_client_idx on public.bookings (client_id, created_at desc);
create index bookings_pro_idx on public.bookings (pro_id, created_at desc);
create index bookings_status_idx on public.bookings (status);

-- 8) Conversations (1 par booking)
create table public.conversations (
  id          uuid primary key default gen_random_uuid(),
  booking_id  uuid unique not null references public.bookings(id) on delete cascade,
  created_at  timestamptz not null default now()
);

-- 9) Messages (texte / image / vocal)
create table public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id       uuid not null references public.profiles(id) on delete restrict,
  body            text,
  attachment_url  text,
  attachment_type text check (attachment_type in ('image', 'audio')),
  created_at      timestamptz not null default now(),
  read_at         timestamptz
);
create index messages_conv_idx on public.messages (conversation_id, created_at);

-- 10) Avis (1 client → 1 pro après booking completed; et inverse)
create table public.reviews (
  id          uuid primary key default gen_random_uuid(),
  booking_id  uuid not null references public.bookings(id) on delete cascade,
  author_id   uuid not null references public.profiles(id) on delete restrict,
  target_id   uuid not null references public.profiles(id) on delete restrict,
  rating      int not null check (rating between 1 and 5),
  comment     text,
  created_at  timestamptz not null default now(),
  unique (booking_id, author_id)
);
create index reviews_target_idx on public.reviews (target_id);

-- 11) Signalements (modération)
create table public.reports (
  id            uuid primary key default gen_random_uuid(),
  reporter_id   uuid not null references public.profiles(id) on delete set null,
  target_user_id uuid references public.profiles(id) on delete cascade,
  target_message_id uuid references public.messages(id) on delete cascade,
  reason        report_reason not null,
  details       text,
  status        report_status not null default 'open',
  created_at    timestamptz not null default now(),
  reviewed_at   timestamptz,
  reviewed_by   uuid references auth.users(id) on delete set null
);
create index reports_status_idx on public.reports (status);

-- 12) Disponibilités pro (agenda hebdo)
create table public.availability (
  id          uuid primary key default gen_random_uuid(),
  pro_id      uuid not null references public.pros(id) on delete cascade,
  weekday     int not null check (weekday between 0 and 6),  -- 0 = dimanche
  start_time  time not null,
  end_time    time not null,
  check (end_time > start_time)
);
create index availability_pro_idx on public.availability (pro_id);

-- ---------- Triggers d'updated_at ----------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger trg_pros_updated before update on public.pros
  for each row execute function public.set_updated_at();
create trigger trg_bookings_updated before update on public.bookings
  for each row execute function public.set_updated_at();

-- ---------- Auto-create profile à l'inscription --------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public, extensions as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Recalcul du rating moyen pro --------------------------------
create or replace function public.recompute_pro_rating()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_pro uuid;
begin
  v_pro := coalesce(new.target_id, old.target_id);
  update public.pros p
  set
    rating_avg = coalesce((
      select round(avg(r.rating)::numeric, 2)
      from public.reviews r
      where r.target_id = v_pro
    ), 0),
    rating_count = (
      select count(*) from public.reviews r where r.target_id = v_pro
    )
  where p.id = v_pro;
  return null;
end;
$$;

create trigger trg_reviews_rating
  after insert or update or delete on public.reviews
  for each row execute function public.recompute_pro_rating();

-- ---------- Helpers RLS --------------------------------------------------
create or replace function public.is_admin(uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles where id = uid and role = 'admin'
  );
$$;

-- =========================================================================
-- Row Level Security
-- =========================================================================

alter table public.profiles         enable row level security;
alter table public.categories       enable row level security;
alter table public.pros             enable row level security;
alter table public.pro_categories   enable row level security;
alter table public.services         enable row level security;
alter table public.portfolio_items  enable row level security;
alter table public.bookings         enable row level security;
alter table public.conversations    enable row level security;
alter table public.messages         enable row level security;
alter table public.reviews          enable row level security;
alter table public.reports          enable row level security;
alter table public.availability     enable row level security;

-- ----- profiles : visible à tous (auth), modifiable par soi-même --------
create policy profiles_select on public.profiles
  for select to authenticated using (true);
create policy profiles_update_self on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy profiles_admin_all on public.profiles
  for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- ----- categories : lecture publique (anon + auth), write admin ---------
create policy categories_read on public.categories
  for select to anon, authenticated using (true);
create policy categories_admin_write on public.categories
  for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- ----- pros : visibles si is_visible (sinon owner ou admin) -------------
create policy pros_select_public on public.pros
  for select to anon, authenticated using (is_visible = true);
create policy pros_select_self on public.pros
  for select to authenticated using (id = auth.uid());
create policy pros_insert_self on public.pros
  for insert to authenticated with check (id = auth.uid());
create policy pros_update_self on public.pros
  for update to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    -- un pro ne peut PAS s'auto-rendre visible ni changer son kyc_status
    and is_visible = (select is_visible from public.pros where id = auth.uid())
    and kyc_status = (select kyc_status from public.pros where id = auth.uid())
  );
create policy pros_admin_all on public.pros
  for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- ----- pro_categories ---------------------------------------------------
create policy pro_categories_read on public.pro_categories
  for select to anon, authenticated using (true);
create policy pro_categories_write_self on public.pro_categories
  for all to authenticated using (pro_id = auth.uid()) with check (pro_id = auth.uid());

-- ----- services : lecture publique des services actifs ------------------
create policy services_read_active on public.services
  for select to anon, authenticated using (is_active = true);
create policy services_owner_all on public.services
  for all to authenticated using (pro_id = auth.uid()) with check (pro_id = auth.uid());

-- ----- portfolio --------------------------------------------------------
create policy portfolio_read on public.portfolio_items
  for select to anon, authenticated using (true);
create policy portfolio_owner_all on public.portfolio_items
  for all to authenticated using (pro_id = auth.uid()) with check (pro_id = auth.uid());

-- ----- bookings : visibles aux 2 parties + admin -----------------------
create policy bookings_select_parties on public.bookings
  for select to authenticated using (client_id = auth.uid() or pro_id = auth.uid());
create policy bookings_insert_client on public.bookings
  for insert to authenticated with check (client_id = auth.uid());
create policy bookings_update_parties on public.bookings
  for update to authenticated using (client_id = auth.uid() or pro_id = auth.uid());
create policy bookings_admin_all on public.bookings
  for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- ----- conversations : lisibles si l'on est partie du booking -----------
create policy conversations_select on public.conversations
  for select to authenticated using (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id and (b.client_id = auth.uid() or b.pro_id = auth.uid())
    )
  );
create policy conversations_insert on public.conversations
  for insert to authenticated with check (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id and (b.client_id = auth.uid() or b.pro_id = auth.uid())
    )
  );

-- ----- messages : lecture/écriture par parties du booking ---------------
create policy messages_select on public.messages
  for select to authenticated using (
    exists (
      select 1
      from public.conversations c
      join public.bookings b on b.id = c.booking_id
      where c.id = conversation_id
        and (b.client_id = auth.uid() or b.pro_id = auth.uid())
    )
  );
create policy messages_insert on public.messages
  for insert to authenticated with check (
    sender_id = auth.uid()
    and exists (
      select 1
      from public.conversations c
      join public.bookings b on b.id = c.booking_id
      where c.id = conversation_id
        and (b.client_id = auth.uid() or b.pro_id = auth.uid())
    )
  );

-- ----- reviews : on note seulement après une mission completed ----------
create policy reviews_read on public.reviews
  for select to anon, authenticated using (true);
create policy reviews_insert on public.reviews
  for insert to authenticated with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.bookings b
      where b.id = booking_id
        and b.status = 'completed'
        and (
          (b.client_id = auth.uid() and b.pro_id = target_id) or
          (b.pro_id = auth.uid() and b.client_id = target_id)
        )
    )
  );
create policy reviews_update_self on public.reviews
  for update to authenticated using (author_id = auth.uid()) with check (author_id = auth.uid());

-- ----- reports : tout user auth peut signaler, seul admin lit/agit ------
create policy reports_insert on public.reports
  for insert to authenticated with check (reporter_id = auth.uid());
create policy reports_select_self on public.reports
  for select to authenticated using (reporter_id = auth.uid());
create policy reports_admin_all on public.reports
  for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- ----- availability -----------------------------------------------------
create policy availability_read on public.availability
  for select to anon, authenticated using (true);
create policy availability_owner_all on public.availability
  for all to authenticated using (pro_id = auth.uid()) with check (pro_id = auth.uid());

-- =========================================================================
-- Seed minimal : catégories de base
-- =========================================================================
insert into public.categories (slug, name_fr, name_en, sort_order) values
  ('plomberie',     'Plomberie',     'Plumbing',     10),
  ('electricite',   'Électricité',   'Electrical',   20),
  ('menuiserie',    'Menuiserie',    'Carpentry',    30),
  ('peinture',      'Peinture',      'Painting',     40),
  ('couture',       'Couture',       'Tailoring',    50),
  ('coiffure',      'Coiffure',      'Hair styling', 60),
  ('design',        'Design',        'Design',       70),
  ('dev-web',       'Développement', 'Development',  80),
  ('beatmaking',    'Beatmaking',    'Beatmaking',   90),
  ('photographie',  'Photographie',  'Photography', 100)
on conflict (slug) do nothing;
