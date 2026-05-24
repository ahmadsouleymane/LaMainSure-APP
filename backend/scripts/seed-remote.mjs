// Seed the remote Supabase project with dev test data.
// Idempotent: re-running upserts profiles/pros/services and reuses existing auth users.
// Usage: node scripts/seed-remote.mjs   (reads backend/.env for SUPABASE_URL + SERVICE_ROLE)
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  readFileSync(join(here, '..', '.env'), 'utf8')
    .split('\n')
    .filter((l) => l && !l.trimStart().startsWith('#') && l.includes('='))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const URL = env.SUPABASE_URL;
const SR = env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !SR) throw new Error('SUPABASE_URL / SERVICE_ROLE manquant dans backend/.env');

const authHeaders = { apikey: SR, Authorization: `Bearer ${SR}`, 'Content-Type': 'application/json' };

async function api(path, opts = {}) {
  const res = await fetch(`${URL}${path}`, { ...opts, headers: { ...authHeaders, ...(opts.headers || {}) } });
  const text = await res.text();
  let body;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (!res.ok) throw new Error(`${opts.method || 'GET'} ${path} -> ${res.status}: ${text}`);
  return body;
}

// REST helpers (PostgREST) with merge-duplicates upsert.
const rest = (table, opts = {}) => api(`/rest/v1/${table}`, opts);
const upsert = (table, rows, onConflict) =>
  rest(`${table}${onConflict ? `?on_conflict=${onConflict}` : ''}`, {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(rows),
  });

async function ensureUser(email, fullName) {
  // Look up existing user by email via admin API.
  const list = await api(`/auth/v1/admin/users?per_page=200`);
  const users = list.users || list; // shape: { users: [...] }
  const found = (users || []).find((u) => u.email === email);
  if (found) return found.id;
  const created = await api('/auth/v1/admin/users', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password: 'password123',
      email_confirm: true,
      user_metadata: { full_name: fullName },
    }),
  });
  return created.id;
}

const pt = (lng, lat) => `SRID=4326;POINT(${lng} ${lat})`;

async function main() {
  console.log('→ Catégories…');
  const cats = await rest('categories?select=id,slug');
  const catId = (slug) => {
    const c = cats.find((x) => x.slug === slug);
    if (!c) throw new Error(`catégorie introuvable: ${slug}`);
    return c.id;
  };

  console.log('→ Utilisateurs auth…');
  const U = {};
  for (const u of [
    ['aminata@dev.test', 'Aminata Touré'],
    ['kouadio@dev.test', 'Kouadio Yao'],
    ['fatou@dev.test', 'Fatou Sow'],
    ['moussa.pro@dev.test', 'Moussa Diallo'],
    ['nadia.pro@dev.test', 'Nadia Mbaye'],
  ]) {
    U[u[0]] = await ensureUser(u[0], u[1]);
    console.log(`   ${u[0]} = ${U[u[0]]}`);
  }

  console.log('→ Profiles…');
  await upsert('profiles', [
    { id: U['aminata@dev.test'], full_name: 'Aminata Touré', city: 'Abidjan', country_code: 'CI', role: 'client', is_pro_enabled: false, location: pt(-4.024429, 5.345317), avatar_url: 'https://i.pravatar.cc/300?img=44' },
    { id: U['kouadio@dev.test'], full_name: 'Kouadio Yao', city: 'Abidjan', country_code: 'CI', role: 'client', is_pro_enabled: false, location: pt(-4.008256, 5.359952), avatar_url: 'https://i.pravatar.cc/300?img=15' },
    { id: U['fatou@dev.test'], full_name: 'Fatou Sow', city: 'Dakar', country_code: 'SN', role: 'client', is_pro_enabled: false, location: pt(-17.467686, 14.716677), avatar_url: 'https://i.pravatar.cc/300?img=49' },
    { id: U['moussa.pro@dev.test'], full_name: 'Moussa Diallo', city: 'Abidjan', country_code: 'CI', role: 'pro', is_pro_enabled: true, location: pt(-3.9853, 5.3597), avatar_url: 'https://i.pravatar.cc/300?img=12' },
    { id: U['nadia.pro@dev.test'], full_name: 'Nadia Mbaye', city: 'Dakar', country_code: 'SN', role: 'pro', is_pro_enabled: true, location: pt(-17.5204, 14.7382), avatar_url: 'https://i.pravatar.cc/300?img=47' },
  ], 'id');

  console.log('→ Pros…');
  const moussa = U['moussa.pro@dev.test'];
  const nadia = U['nadia.pro@dev.test'];
  await upsert('pros', [
    { id: moussa, display_name: 'Plomberie Moussa', bio: "Plombier certifié, interventions rapides à Abidjan. 12 ans d'expérience, équipe de 3 personnes, devis gratuit.", years_experience: 12, service_radius_km: 30, kyc_status: 'approved', is_visible: true, rating_avg: 4.7, rating_count: 23 },
    { id: nadia, display_name: 'Studio Nadia', bio: 'Designer UI/UX et créatrice de marques. Identités visuelles, logos, sites vitrine. 7 ans sur des marques africaines.', years_experience: 7, service_radius_km: 50, kyc_status: 'approved', is_visible: true, rating_avg: 4.9, rating_count: 11 },
  ], 'id');

  console.log('→ Pro ↔ catégories…');
  await upsert('pro_categories', [
    { pro_id: moussa, category_id: catId('plomberie') },
    { pro_id: moussa, category_id: catId('electricite') },
    { pro_id: nadia, category_id: catId('design') },
    { pro_id: nadia, category_id: catId('dev-web') },
  ], 'pro_id,category_id');

  console.log('→ Services (reset & insert)…');
  // Services have no natural unique key; clear the seeded pros' services then insert.
  await rest(`services?pro_id=in.(${moussa},${nadia})`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } });
  await rest('services', {
    method: 'POST', headers: { Prefer: 'return=minimal' },
    body: JSON.stringify([
      { pro_id: moussa, category_id: catId('plomberie'), title: 'Dépannage fuite urgent', description: "Intervention sous 2h pour fuite d'eau", price_xof: 15000, duration_min: 90, is_active: true },
      { pro_id: moussa, category_id: catId('plomberie'), title: 'Installation chauffe-eau', description: 'Pose + raccordement complet, garantie 1 an', price_xof: 45000, duration_min: 180, is_active: true },
      { pro_id: moussa, category_id: catId('plomberie'), title: 'Débouchage canalisation', description: 'Furet pro, sans casse', price_xof: 18000, duration_min: 60, is_active: true },
      { pro_id: nadia, category_id: catId('design'), title: 'Logo + charte graphique', description: 'Identité visuelle complète en 7 jours', price_xof: 150000, duration_min: null, is_active: true },
      { pro_id: nadia, category_id: catId('dev-web'), title: 'Site vitrine 5 pages', description: 'Design + dev React, responsive', price_xof: 350000, duration_min: null, is_active: true },
    ]),
  });

  console.log('→ Portfolio (reset & insert)…');
  await rest(`portfolio_items?pro_id=in.(${moussa},${nadia})`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } });
  await rest('portfolio_items', {
    method: 'POST', headers: { Prefer: 'return=minimal' },
    body: JSON.stringify([
      { pro_id: moussa, image_url: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=600', caption: 'Réfection salle de bain', sort_order: 0 },
      { pro_id: moussa, image_url: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=600', caption: 'Chauffe-eau neuf', sort_order: 1 },
      { pro_id: nadia, image_url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600', caption: 'Identité de marque', sort_order: 0 },
    ]),
  });

  console.log('✓ Seed terminé.');
}

main().catch((e) => { console.error('✗', e.message); process.exit(1); });
