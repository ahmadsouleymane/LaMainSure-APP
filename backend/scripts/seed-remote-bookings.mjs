// Seed bookings / conversations / messages / reviews on the remote project.
// Idempotent-ish: wipes bookings between the seeded users then recreates them.
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
const H = { apikey: SR, Authorization: `Bearer ${SR}`, 'Content-Type': 'application/json' };

async function api(path, opts = {}) {
  const res = await fetch(`${URL}${path}`, { ...opts, headers: { ...H, ...(opts.headers || {}) } });
  const text = await res.text();
  if (!res.ok) throw new Error(`${opts.method || 'GET'} ${path} -> ${res.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}
const rest = (t, o = {}) => api(`/rest/v1/${t}`, o);
const insert = (t, rows) => rest(t, { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify(rows) });
const pt = (lng, lat) => `SRID=4326;POINT(${lng} ${lat})`;
const iso = (daysFromNow, hour = 10) => { const d = new Date(); d.setDate(d.getDate() + daysFromNow); d.setHours(hour, 0, 0, 0); return d.toISOString(); };

async function main() {
  const users = (await api('/auth/v1/admin/users?per_page=200')).users;
  const id = (email) => { const u = users.find((x) => x.email === email); if (!u) throw new Error(`user ${email}?`); return u.id; };
  const aminata = id('aminata@dev.test'), kouadio = id('kouadio@dev.test'), fatou = id('fatou@dev.test');
  const moussa = id('moussa.pro@dev.test'), nadia = id('nadia.pro@dev.test');
  const cats = await rest('categories?select=id,slug');
  const cat = (s) => cats.find((c) => c.slug === s).id;

  console.log('→ Nettoyage bookings existants…');
  await rest(`bookings?or=(client_id.in.(${aminata},${kouadio},${fatou}),pro_id.in.(${moussa},${nadia}))`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } });

  console.log('→ Bookings…');
  const b = (o) => ({
    client_id: null, pro_id: null, category_id: null, status: 'requested', description: '',
    address_text: null, location: null, photos: [], quoted_price_xof: null,
    final_price_xof: null, scheduled_at: null, completed_at: null, ...o,
  });
  const bookings = await insert('bookings', [
    b({ client_id: aminata, pro_id: moussa, category_id: cat('plomberie'), status: 'requested', description: "Fuite sous l'évier de la cuisine. L'eau coule depuis ce matin, j'ai fermé le robinet général.", address_text: 'Cocody, Riviera 2', location: pt(-3.99, 5.36), photos: ['https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400'] }),
    b({ client_id: kouadio, pro_id: moussa, category_id: cat('plomberie'), status: 'quoted', description: "Remplacement d'un chauffe-eau 80L. Le ballon actuel a 15 ans.", address_text: 'Marcory, Zone 4', location: pt(-3.99, 5.30), quoted_price_xof: 45000, scheduled_at: iso(1, 14) }),
    b({ client_id: fatou, pro_id: moussa, category_id: cat('plomberie'), status: 'accepted', description: 'Débouchage canalisation cuisine.', address_text: 'Yopougon, Niangon', location: pt(-4.08, 5.34), quoted_price_xof: 18000, scheduled_at: iso(2, 9) }),
    b({ client_id: aminata, pro_id: moussa, category_id: cat('plomberie'), status: 'completed', description: 'Réparation robinet salle de bain.', address_text: 'Cocody, Angré', location: pt(-3.98, 5.37), quoted_price_xof: 12000, final_price_xof: 12000, completed_at: iso(-7, 16) }),
    b({ client_id: fatou, pro_id: nadia, category_id: cat('design'), status: 'quoted', description: 'Logo + charte pour une boutique de mode en ligne.', address_text: 'À distance', quoted_price_xof: 150000 }),
  ]);
  const byDesc = (s) => bookings.find((b) => b.description.startsWith(s));
  const bReq = byDesc('Fuite'), bQuote = byDesc('Remplacement'), bAcc = byDesc('Débouchage'), bDone = byDesc('Réparation');

  console.log('→ Conversations + messages…');
  const convs = await insert('conversations', bookings.map((b) => ({ booking_id: b.id })));
  const convOf = (bId) => convs.find((c) => c.booking_id === bId).id;

  await insert('messages', [
    { conversation_id: convOf(bReq.id), sender_id: aminata, body: "Bonjour Moussa, j'ai une fuite sous l'évier de la cuisine.", created_at: iso(0, 9) },
    { conversation_id: convOf(bReq.id), sender_id: aminata, body: 'Tu peux passer aujourd’hui ?', created_at: iso(0, 9) },
    { conversation_id: convOf(bReq.id), sender_id: moussa, body: 'Salut ! Oui je peux passer dans l’après-midi. Tu es à quelle adresse exactement ?', created_at: iso(0, 11) },
    { conversation_id: convOf(bReq.id), sender_id: aminata, body: "Cocody, près de la pharmacie Riviera 2.", created_at: iso(0, 11) },
    { conversation_id: convOf(bQuote.id), sender_id: kouadio, body: "Je viens d'acheter le ballon, il fait 80L.", created_at: iso(-1, 10) },
    { conversation_id: convOf(bQuote.id), sender_id: moussa, body: 'Parfait, je te fais un devis à 45 000 FCFA pose comprise.', created_at: iso(-1, 12) },
    { conversation_id: convOf(bAcc.id), sender_id: fatou, body: 'Top, à demain alors.', created_at: iso(-1, 15) },
  ]);

  console.log('→ Reviews…');
  await insert('reviews', [
    { booking_id: bDone.id, author_id: aminata, target_id: moussa, rating: 5, comment: 'Très réactif et propre. Fuite réparée en 1h, je recommande.' },
  ]);

  console.log('✓ Bookings seed terminé.');
}
main().catch((e) => { console.error('✗', e.message); process.exit(1); });
