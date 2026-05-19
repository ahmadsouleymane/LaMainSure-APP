// Edge Function : notify-push
// Lit les notifications non envoyées (sent_at IS NULL) et les pousse via Expo Push.
// Peut être déclenchée :
//   - par un Database Webhook sur INSERT into notifications (recommandé, temps réel)
//   - par un cron toutes les minutes en fallback
//
// Déploiement :
//   supabase functions deploy notify-push --no-verify-jwt
//   supabase secrets set EXPO_ACCESS_TOKEN=...   (optionnel, requis si Expo enhanced security activé)
//
// Database Webhook à créer côté dashboard :
//   Table: public.notifications, Event: INSERT, Method: POST, URL: <fn-url>

import { corsHeaders } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const EXPO_ACCESS_TOKEN = Deno.env.get('EXPO_ACCESS_TOKEN'); // optionnel

type PendingRow = {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  data: Record<string, unknown>;
  expo_push_token: string | null;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    // Récupère jusqu'à 100 notifications en attente, avec leur push token
    const { data: pending, error } = await supabaseAdmin
      .from('notifications')
      .select('id, user_id, title, body, data, profiles!inner(expo_push_token)')
      .is('sent_at', null)
      .limit(100);

    if (error) throw error;

    const rows: PendingRow[] = (pending ?? []).map((r: any) => ({
      id: r.id,
      user_id: r.user_id,
      title: r.title,
      body: r.body,
      data: r.data,
      expo_push_token: r.profiles?.expo_push_token ?? null,
    }));

    const sendable = rows.filter((r) => r.expo_push_token && r.expo_push_token.startsWith('ExponentPushToken'));

    if (sendable.length > 0) {
      const messages = sendable.map((r) => ({
        to: r.expo_push_token,
        sound: 'default',
        title: r.title,
        body: r.body ?? '',
        data: { ...r.data, notification_id: r.id },
      }));

      const headers: Record<string, string> = {
        'content-type': 'application/json',
        accept: 'application/json',
        'accept-encoding': 'gzip, deflate',
      };
      if (EXPO_ACCESS_TOKEN) headers.authorization = `Bearer ${EXPO_ACCESS_TOKEN}`;

      const resp = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(messages),
      });
      if (!resp.ok) {
        const t = await resp.text();
        console.error('Expo push failed', resp.status, t);
      }
    }

    // Marque tout (sendable + skipped) comme traité pour ne pas reboucler
    const ids = rows.map((r) => r.id);
    if (ids.length > 0) {
      await supabaseAdmin.from('notifications').update({ sent_at: new Date().toISOString() }).in('id', ids);
    }

    return new Response(
      JSON.stringify({ processed: rows.length, pushed: sendable.length }),
      { headers: { ...corsHeaders, 'content-type': 'application/json' } }
    );
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    });
  }
});
