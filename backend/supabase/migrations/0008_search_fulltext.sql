-- =========================================================================
-- 0008 — Full-text search FR sur pros + services
-- =========================================================================
-- Améliore la recherche par mot-clé : « plombier urgent », « designer logo »
-- bénéficient du stemming français et de l'indexation GIN.
set search_path = public, extensions;

-- ---------- Colonnes générées tsvector ----------------------------------
alter table public.pros
  add column search_vector tsvector
  generated always as (
    to_tsvector('french', coalesce(display_name, '') || ' ' || coalesce(bio, ''))
  ) stored;

create index pros_search_gin on public.pros using gin (search_vector);

alter table public.services
  add column search_vector tsvector
  generated always as (
    to_tsvector('french', coalesce(title, '') || ' ' || coalesce(description, ''))
  ) stored;

create index services_search_gin on public.services using gin (search_vector);

-- ---------- Met à jour pros_nearby pour utiliser le full-text ----------
-- La signature de retour change (ajout de la colonne `rank`),
-- donc on droppe l'ancienne version avant de la recréer.
drop function if exists public.pros_nearby(double precision, double precision, int, text, text, int, int);

create or replace function public.pros_nearby(
  p_lat            double precision,
  p_lng            double precision,
  p_radius_km      int default 20,
  p_category_slug  text default null,
  p_search         text default null,
  p_limit          int default 50,
  p_offset         int default 0
)
returns table (
  pro_id           uuid,
  display_name     text,
  bio              text,
  avatar_url       text,
  city             text,
  country_code     text,
  rating_avg       numeric,
  rating_count     int,
  distance_km      double precision,
  categories       text[],
  rank             real
)
language sql stable security definer set search_path = public, extensions as $$
  with origin as (
    select st_makepoint(p_lng, p_lat)::geography as g
  ),
  q as (
    select case when p_search is null or length(trim(p_search)) = 0
                then null
                else websearch_to_tsquery('french', p_search)
           end as ts
  ),
  filtered as (
    select
      pr.id,
      pr.display_name,
      pr.bio,
      pf.avatar_url,
      pf.city,
      pf.country_code,
      pr.rating_avg,
      pr.rating_count,
      st_distance(pf.location, (select g from origin)) / 1000.0 as distance_km,
      case when (select ts from q) is null
           then 0::real
           else ts_rank(pr.search_vector, (select ts from q))
      end as rank
    from public.pros pr
    join public.profiles pf on pf.id = pr.id
    where pr.is_visible = true
      and pf.location is not null
      and st_dwithin(pf.location, (select g from origin), p_radius_km * 1000)
      and (
        p_category_slug is null
        or exists (
          select 1
          from public.pro_categories pc
          join public.categories c on c.id = pc.category_id
          where pc.pro_id = pr.id and c.slug = p_category_slug
        )
      )
      and (
        (select ts from q) is null
        or pr.search_vector @@ (select ts from q)
      )
  )
  select
    f.id,
    f.display_name,
    f.bio,
    f.avatar_url,
    f.city,
    f.country_code,
    f.rating_avg,
    f.rating_count,
    f.distance_km,
    coalesce(
      array(
        select c.slug
        from public.pro_categories pc
        join public.categories c on c.id = pc.category_id
        where pc.pro_id = f.id
      ),
      '{}'::text[]
    ),
    f.rank
  from filtered f
  order by f.rank desc, f.distance_km asc, f.rating_avg desc
  limit p_limit offset p_offset;
$$;

grant execute on function public.pros_nearby(double precision, double precision, int, text, text, int, int) to anon, authenticated;
