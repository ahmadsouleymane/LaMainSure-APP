// Edge Function : export-my-data
// Renvoie en JSON toutes les données associées à l'utilisateur (RGPD).
//
// Déploiement :
//   supabase functions deploy export-my-data

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST' && req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

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

    const uid = userData.user.id;

    const [profile, pro, services, portfolio, bookings, reviews, messages, notifications, payments] =
      await Promise.all([
        supabaseAdmin.from('profiles').select('*').eq('id', uid).maybeSingle(),
        supabaseAdmin.from('pros').select('*').eq('id', uid).maybeSingle(),
        supabaseAdmin.from('services').select('*').eq('pro_id', uid),
        supabaseAdmin.from('portfolio_items').select('*').eq('pro_id', uid),
        supabaseAdmin.from('bookings').select('*').or(`client_id.eq.${uid},pro_id.eq.${uid}`),
        supabaseAdmin.from('reviews').select('*').or(`author_id.eq.${uid},target_id.eq.${uid}`),
        supabaseAdmin.from('messages').select('*').eq('sender_id', uid),
        supabaseAdmin.from('notifications').select('*').eq('user_id', uid),
        supabaseAdmin.from('payments').select('*').or(`payer_id.eq.${uid},payee_id.eq.${uid}`),
      ]);

    const payload = {
      exported_at: new Date().toISOString(),
      user_id: uid,
      email: userData.user.email,
      profile: profile.data,
      pro: pro.data,
      services: services.data,
      portfolio: portfolio.data,
      bookings: bookings.data,
      reviews: reviews.data,
      messages: messages.data,
      notifications: notifications.data,
      payments: payments.data,
    };

    return new Response(JSON.stringify(payload, null, 2), {
      headers: {
        ...corsHeaders,
        'content-type': 'application/json',
        'content-disposition': `attachment; filename="lamain-sure-export-${uid}.json"`,
      },
    });
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
