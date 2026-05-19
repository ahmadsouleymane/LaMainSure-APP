// Edge Function : report-webhook
// Reçoit les nouveaux signalements (via Database Webhook sur INSERT into reports)
// et notifie Slack/Discord pour que l'équipe modération réagisse vite.
//
// Déploiement :
//   supabase functions deploy report-webhook --no-verify-jwt
//   supabase secrets set MODERATION_WEBHOOK_URL=https://hooks.slack.com/services/...
//
// Database Webhook : table public.reports, INSERT, POST vers cette function.

import { corsHeaders } from '../_shared/cors.ts';

const WEBHOOK_URL = Deno.env.get('MODERATION_WEBHOOK_URL');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    if (!WEBHOOK_URL) {
      console.warn('MODERATION_WEBHOOK_URL not set, skipping');
      return new Response('skipped', { headers: corsHeaders });
    }

    const payload = await req.json();
    const row = payload.record ?? payload.new ?? payload;

    const text =
      `🚨 *Nouveau signalement* — raison: \`${row.reason}\`\n` +
      `Reporter: ${row.reporter_id}\n` +
      (row.target_user_id ? `Cible (user): ${row.target_user_id}\n` : '') +
      (row.target_message_id ? `Cible (message): ${row.target_message_id}\n` : '') +
      (row.details ? `Détails: ${row.details}\n` : '') +
      `Report id: ${row.id}`;

    const resp = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!resp.ok) {
      console.error('webhook failed', resp.status, await resp.text());
    }

    return new Response('ok', { headers: corsHeaders });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    });
  }
});
