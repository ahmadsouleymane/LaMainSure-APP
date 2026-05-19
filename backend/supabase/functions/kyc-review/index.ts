// Edge Function : kyc-review
// Endpoint admin pour approuver ou rejeter un dossier KYC d'un pro.
// Vérifie que l'appelant est admin (table profiles.role = 'admin').
//
// POST body : { pro_id: uuid, decision: 'approved' | 'rejected', reason?: string }
//
// Déploiement :
//   supabase functions deploy kyc-review
// (JWT vérifié par défaut — l'appelant doit envoyer son token)

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'missing auth' }, 401);

    // Identifie l'appelant via son JWT
    const callerClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: userData, error: userErr } = await callerClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: 'invalid token' }, 401);

    // Vérifie qu'il est admin
    const { data: prof } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userData.user.id)
      .single();
    if (prof?.role !== 'admin') return json({ error: 'forbidden' }, 403);

    const body = await req.json();
    const { pro_id, decision, reason } = body as {
      pro_id?: string;
      decision?: 'approved' | 'rejected';
      reason?: string;
    };
    if (!pro_id || (decision !== 'approved' && decision !== 'rejected')) {
      return json({ error: 'invalid payload' }, 400);
    }

    const { error: updErr } = await supabaseAdmin
      .from('pros')
      .update({
        kyc_status: decision,
        kyc_reviewed_at: new Date().toISOString(),
        kyc_reviewed_by: userData.user.id,
        is_visible: decision === 'approved',
      })
      .eq('id', pro_id);

    if (updErr) throw updErr;

    // Le pro est informé en realtime via sa subscription sur la table `pros`
    // (l'app mobile écoute le changement de kyc_status sur son propre row).

    return json({ ok: true, decision, reason: reason ?? null });
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
