-- =========================================================================
-- Seed de développement
-- Chargé automatiquement par `supabase db reset` (Supabase local).
-- NE PAS exécuter en production.
-- =========================================================================
-- 5 utilisateurs fictifs (3 clients, 2 pros déjà KYC approved).

-- Désactive temporairement le trigger pour ne pas dupliquer profiles
alter table auth.users disable trigger on_auth_user_created;

-- Users
insert into auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '00000000-0000-0000-0000-000000000000', 'aminata@dev.test', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Aminata Touré"}', 'authenticated', 'authenticated'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '00000000-0000-0000-0000-000000000000', 'kouadio@dev.test', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Kouadio Yao"}',     'authenticated', 'authenticated'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '00000000-0000-0000-0000-000000000000', 'fatou@dev.test',   crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Fatou Sow"}',       'authenticated', 'authenticated'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', '00000000-0000-0000-0000-000000000000', 'moussa.pro@dev.test', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Moussa Diallo"}', 'authenticated', 'authenticated'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', '00000000-0000-0000-0000-000000000000', 'nadia.pro@dev.test',  crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Nadia Mbaye"}',   'authenticated', 'authenticated')
on conflict do nothing;

alter table auth.users enable trigger on_auth_user_created;

-- Profiles (insère manuellement puisque trigger désactivé pour seed)
insert into public.profiles (id, full_name, city, country_code, role, is_pro_enabled, location)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Aminata Touré', 'Abidjan', 'CI', 'client', false, st_makepoint(-4.024429, 5.345317)::geography),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'Kouadio Yao',   'Abidjan', 'CI', 'client', false, st_makepoint(-4.008256, 5.359952)::geography),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'Fatou Sow',     'Dakar',   'SN', 'client', false, st_makepoint(-17.467686, 14.716677)::geography),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'Moussa Diallo', 'Abidjan', 'CI', 'pro',    true,  st_makepoint(-4.030000, 5.340000)::geography),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 'Nadia Mbaye',   'Dakar',   'SN', 'pro',    true,  st_makepoint(-17.450000, 14.720000)::geography)
on conflict (id) do update set
  full_name = excluded.full_name,
  city = excluded.city,
  country_code = excluded.country_code,
  role = excluded.role,
  is_pro_enabled = excluded.is_pro_enabled,
  location = excluded.location;

-- Pros (KYC déjà approved)
insert into public.pros (id, display_name, bio, years_experience, kyc_status, is_visible, rating_avg, rating_count)
values
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'Plomberie Moussa', 'Plombier certifié, interventions rapides à Abidjan.', 12, 'approved', true, 4.7, 23),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 'Studio Nadia',     'Designer UI/UX et créatrice de marques.',             7,  'approved', true, 4.9, 11)
on conflict (id) do nothing;

-- Pro ↔ catégories
insert into public.pro_categories (pro_id, category_id)
select 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', id from public.categories where slug = 'plomberie'
on conflict do nothing;
insert into public.pro_categories (pro_id, category_id)
select 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', id from public.categories where slug = 'electricite'
on conflict do nothing;
insert into public.pro_categories (pro_id, category_id)
select 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', id from public.categories where slug = 'design'
on conflict do nothing;

-- Services
insert into public.services (pro_id, category_id, title, description, price_xof, duration_min, is_active)
select 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', id, 'Dépannage fuite urgent', 'Intervention sous 2h pour fuite d''eau', 15000, 90, true
from public.categories where slug = 'plomberie';
insert into public.services (pro_id, category_id, title, description, price_xof, duration_min, is_active)
select 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', id, 'Logo + charte graphique', 'Identité visuelle complète en 7 jours', 150000, null, true
from public.categories where slug = 'design';
