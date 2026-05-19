-- =========================================================================
-- 0003 — RPC : recherche de pros à proximité (PostGIS)
-- =========================================================================
set search_path = public, extensions;

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
  categories       text[]
)
language sql stable security definer set search_path = public, extensions as $$
  with origin as (
    select st_makepoint(p_lng, p_lat)::geography as g
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
      st_distance(pf.location, (select g from origin)) / 1000.0 as distance_km
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
        p_search is null
        or pr.display_name ilike '%' || p_search || '%'
        or pr.bio ilike '%' || p_search || '%'
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
    )
  from filtered f
  order by f.distance_km asc, f.rating_avg desc
  limit p_limit offset p_offset;
$$;

grant execute on function public.pros_nearby(double precision, double precision, int, text, text, int, int) to anon, authenticated;
