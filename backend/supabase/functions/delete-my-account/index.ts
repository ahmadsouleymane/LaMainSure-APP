// Edge Function : delete-my-account
// Permet à un user authentifié de supprimer son compte (obligation RGPD).
// Supprime via auth.admin.deleteUser → cascade vers profiles → cascade vers toutes les tables.
//
// Déploiement :
//   supabase functions deploy delete-my-account

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'missing auth' }, 401);

    const callerClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: userData, error: userErr } = await callerClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: 'invalid token' }, 401);

    const userId = userData.user.id;

    // Vérifie qu'aucune mission en cours ne bloque la suppression
    const { count } = await supabaseAdmin
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .or(`client_id.eq.${userId},pro_id.eq.${userId}`)
      .in('status', ['accepted', 'in_progress', 'quoted']);

    if ((count ?? 0) > 0) {
      return json(
        { error: 'Tu as des missions en cours. Termine-les ou annule-les avant de supprimer ton compte.' },
        409
      );
    }

    const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (delErr) throw delErr;

    return json({ ok: true });
  } catch (e) {
    console.error(e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'content-type': 'application/json' },
  });
}
