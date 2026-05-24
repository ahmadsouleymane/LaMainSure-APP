// Seed many fictitious pros across African cities so the map/search is populated everywhere.
// Idempotent: reuses existing auth users (email pattern pro.<city>.<n>@dev.test) and
// resets these pros' services on each run. Safe to re-run.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  readFileSync(join(here, '..', '.env'), 'utf8')
    .split('\n').filter((l) => l && !l.trimStart().startsWith('#') && l.includes('='))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const URL = env.SUPABASE_URL, SR = env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !SR) throw new Error('SUPABASE_URL / SERVICE_ROLE manquant');
const H = { apikey: SR, Authorization: `Bearer ${SR}`, 'Content-Type': 'application/json' };

async function api(path, opts = {}) {
  const res = await fetch(`${URL}${path}`, { ...opts, headers: { ...H, ...(opts.headers || {}) } });
  const text = await res.text();
  if (!res.ok) throw new Error(`${opts.method || 'GET'} ${path} -> ${res.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : null;
}
const rest = (t, o = {}) => api(`/rest/v1/${t}`, o);
const upsert = (table, rows, onConflict) =>
  rest(`${table}${onConflict ? `?on_conflict=${onConflict}` : ''}`, {
    method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(rows),
  });
const pt = (lng, lat) => `SRID=4326;POINT(${lng} ${lat})`;
const jit = () => (Math.random() - 0.5) * 0.06; // ~±3km

// ── Villes (slug, nom, pays code, lat, lng) ─────────────────────────────
const CITIES = [
  ['abidjan','Abidjan','CI',5.3453,-4.0244],['yamoussoukro','Yamoussoukro','CI',6.8276,-5.2893],
  ['bouake','Bouaké','CI',7.6906,-5.0301],['daloa','Daloa','CI',6.8770,-6.4502],
  ['korhogo','Korhogo','CI',9.4580,-5.6294],['san-pedro','San-Pédro','CI',4.7485,-6.6363],
  ['gagnoa','Gagnoa','CI',6.1319,-5.9506],['man','Man','CI',7.4125,-7.5538],
  ['divo','Divo','CI',5.8390,-5.3573],['abengourou','Abengourou','CI',6.7297,-3.4964],
  ['grand-bassam','Grand-Bassam','CI',5.2118,-3.7387],['dabou','Dabou','CI',5.3257,-4.3770],
  ['agboville','Agboville','CI',5.9280,-4.2131],['soubre','Soubré','CI',5.7836,-6.5931],
  ['seguela','Séguéla','CI',7.9611,-6.6731],['odienne','Odienné','CI',9.5092,-7.5640],
  ['bondoukou','Bondoukou','CI',8.0402,-2.8000],['adzope','Adzopé','CI',6.1067,-3.8606],
  ['toumodi','Toumodi','CI',6.5524,-5.0192],['aboisso','Aboisso','CI',5.4675,-3.2072],
  ['dakar','Dakar','SN',14.6928,-17.4467],['thies','Thiès','SN',14.7886,-16.9260],
  ['saint-louis','Saint-Louis','SN',16.0179,-16.4896],['kaolack','Kaolack','SN',14.1592,-16.0729],
  ['bamako','Bamako','ML',12.6392,-8.0029],['sikasso','Sikasso','ML',11.3170,-5.6660],
  ['conakry','Conakry','GN',9.6412,-13.5784],['lome','Lomé','TG',6.1725,1.2314],
  ['cotonou','Cotonou','BJ',6.3654,2.4183],['ouagadougou','Ouagadougou','BF',12.3714,-1.5197],
  ['bobo-dioulasso','Bobo-Dioulasso','BF',11.1771,-4.2979],['niamey','Niamey','NE',13.5117,2.1251],
  ['lagos','Lagos','NG',6.5244,3.3792],['abuja','Abuja','NG',9.0765,7.3986],
  ['ibadan','Ibadan','NG',7.3776,3.9470],['accra','Accra','GH',5.6037,-0.1870],
  ['kumasi','Kumasi','GH',6.6885,-1.6244],['yaounde','Yaoundé','CM',3.8480,11.5021],
  ['douala','Douala','CM',4.0511,9.7679],['libreville','Libreville','GA',0.4162,9.4673],
  ['brazzaville','Brazzaville','CG',-4.2634,15.2429],['kinshasa','Kinshasa','CD',-4.4419,15.2663],
  ['casablanca','Casablanca','MA',33.5731,-7.5898],['rabat','Rabat','MA',34.0209,-6.8416],
  ['marrakech','Marrakech','MA',31.6295,-7.9811],['alger','Alger','DZ',36.7538,3.0588],
  ['tunis','Tunis','TN',36.8065,10.1815],['le-caire','Le Caire','EG',30.0444,31.2357],
  ['nairobi','Nairobi','KE',-1.2921,36.8219],['addis-abeba','Addis-Abeba','ET',9.0320,38.7469],
  ['kigali','Kigali','RW',-1.9441,30.0619],['dar-es-salaam','Dar es Salaam','TZ',-6.7924,39.2083],
  ['johannesburg','Johannesburg','ZA',-26.2041,28.0473],['le-cap','Le Cap','ZA',-33.9249,18.4241],
  ['luanda','Luanda','AO',-8.8390,13.2894],['antananarivo','Antananarivo','MG',-18.8792,47.5079],
];

const FIRST = ['Moussa','Awa','Kouadio','Aminata','Ibrahim','Fatou','Yao','Mariam','Serge','Nadia','Adama','Aïcha','Koffi','Bintou','Drissa','Salif','Rokia','Oumar','Kadidja','Seydou'];
const LAST = ['Diallo','Touré','Yao','Koné','Traoré','Mbaye','Camara','Bâ','Konaté','Diop','Sow','Cissé','Kouassi','Ouattara','Bamba','Coulibaly','Fofana','Sangaré'];

// Catégorie → préfixe entreprise, bio, services
const CATS = {
  plomberie:    { p:'Plomberie',  bio:'Plombier expérimenté, interventions rapides et propres.', svc:[['Dépannage fuite urgent','Intervention sous 2h',15000,90],['Installation sanitaire','Pose complète garantie',45000,180]] },
  electricite:  { p:'Élec',       bio:'Électricien certifié, mises aux normes et dépannages.', svc:[['Tableau électrique','Diagnostic + mise aux normes',60000,240],['Pose prises/interrupteurs','Par point, fournitures incluses',6000,45]] },
  menuiserie:   { p:'Atelier',    bio:'Menuisier ébéniste, meubles sur mesure et réparations.', svc:[['Meuble sur mesure','Bois local, finitions soignées',80000,null],['Réparation meuble','Charnières, pieds, finitions',12000,120]] },
  peinture:     { p:'Peintres',   bio:'Peinture intérieur/extérieur, enduits décoratifs.', svc:[['Peinture pièce 20 m²','2 couches, préparation murs',45000,300],['Façade maison','Devis sur visite',250000,null]] },
  couture:      { p:'Couture',    bio:'Couturière, retouches et créations sur mesure.', svc:[['Retouche vêtement','Ourlet, taille, fermeture',3500,30],['Tenue sur mesure','Wax ou bazin, finitions main',35000,null]] },
  coiffure:     { p:'Salon',      bio:'Coiffure à domicile, tresses, soins capillaires.', svc:[['Tresses africaines','Box braids, cornrows, twists',12000,240],['Soin capillaire','Diagnostic + masque + brushing',8000,90]] },
  design:       { p:'Studio',     bio:'Designer UI/UX et identités de marque.', svc:[['Logo + charte','Identité visuelle en 7 jours',150000,null],['Site vitrine','Design + dev responsive',350000,null]] },
  'dev-web':    { p:'Dev',        bio:'Développeur web & mobile, apps sur mesure.', svc:[['Site web','Vitrine ou e-commerce',300000,null],['App mobile','MVP React Native',800000,null]] },
  beatmaking:   { p:'Beats',      bio:'Beatmaker & ingé son, prod et mixage.', svc:[['Instrumental sur mesure','Prod + mix',50000,null],['Mixage/mastering','Par titre',30000,null]] },
  photographie: { p:'Lens',       bio:'Photographe mariages, portraits, événements.', svc:[['Portrait studio','1h, 10 photos retouchées',25000,60],['Reportage événement','Demi-journée, galerie livrée',180000,null]] },
};
const CAT_SLUGS = Object.keys(CATS);

const PER_CITY = 2;

async function fetchAllUsers() {
  const map = new Map();
  for (let page = 1; page <= 20; page++) {
    const res = await api(`/auth/v1/admin/users?per_page=200&page=${page}`);
    const users = res.users || [];
    for (const u of users) map.set(u.email, u.id);
    if (users.length < 200) break;
  }
  return map;
}

async function ensureUser(existing, email, fullName) {
  if (existing.has(email)) return existing.get(email);
  const created = await api('/auth/v1/admin/users', {
    method: 'POST',
    body: JSON.stringify({ email, password: 'password123', email_confirm: true, user_metadata: { full_name: fullName } }),
  });
  existing.set(email, created.id);
  return created.id;
}

async function main() {
  console.log('→ Catégories…');
  const cats = await rest('categories?select=id,slug');
  const catId = (slug) => cats.find((c) => c.slug === slug).id;

  console.log('→ Utilisateurs existants…');
  const existing = await fetchAllUsers();

  const profiles = [], pros = [], proCats = [], services = [], proIds = [];
  let idx = 0;

  console.log(`→ Génération de ${CITIES.length * PER_CITY} pros…`);
  for (const [cslug, cname, ccode, lat, lng] of CITIES) {
    for (let n = 0; n < PER_CITY; n++) {
      const email = `pro.${cslug}.${n}@dev.test`;
      const fn = `${FIRST[idx % FIRST.length]} ${LAST[(idx * 7) % LAST.length]}`;
      const catSlug = CAT_SLUGS[idx % CAT_SLUGS.length];
      const cat = CATS[catSlug];
      idx++;
      const id = await ensureUser(existing, email, fn);
      proIds.push(id);
      const plat = lat + jit(), plng = lng + jit();
      profiles.push({ id, full_name: fn, city: cname, country_code: ccode, role: 'pro', is_pro_enabled: true, location: pt(plng, plat), avatar_url: `https://i.pravatar.cc/300?img=${(idx % 70) + 1}` });
      pros.push({ id, display_name: `${cat.p} ${fn.split(' ')[0]}`, bio: cat.bio, years_experience: 3 + (idx % 15), kyc_status: 'approved', is_visible: true, rating_avg: (4 + (idx % 10) / 10).toFixed(2), rating_count: 3 + (idx % 40) });
      proCats.push({ pro_id: id, category_id: catId(catSlug) });
      for (const [title, desc, price, dur] of cat.svc) {
        services.push({ pro_id: id, category_id: catId(catSlug), title, description: desc, price_xof: price, duration_min: dur, is_active: true });
      }
      if (idx % 25 === 0) console.log(`   ${idx} pros préparés…`);
    }
  }

  console.log('→ Upsert profiles…'); await upsert('profiles', profiles, 'id');
  console.log('→ Upsert pros…'); await upsert('pros', pros, 'id');
  console.log('→ Upsert pro_categories…'); await upsert('pro_categories', proCats, 'pro_id,category_id');
  console.log('→ Reset & insert services…');
  // Supprime les services existants de ces pros puis réinsère (idempotent).
  const chunk = (arr, n) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));
  for (const c of chunk(proIds, 50)) {
    await rest(`services?pro_id=in.(${c.join(',')})`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } });
  }
  for (const c of chunk(services, 100)) {
    await rest('services', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(c) });
  }

  console.log(`✓ ${proIds.length} pros seedés sur ${CITIES.length} villes.`);
}
main().catch((e) => { console.error('✗', e.message); process.exit(1); });
