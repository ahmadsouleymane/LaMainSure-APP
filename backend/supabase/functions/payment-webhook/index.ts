// Edge Function : payment-webhook
// Webhook générique pour les providers de paiement (Stripe, CinetPay, Wave, Orange Money…).
// Reçoit les events, vérifie la signature, met à jour la table payments.
//
// Quand tu choisis ton provider, remplace verifySignature() par la vraie logique
// (HMAC SHA256 pour CinetPay / Wave, Stripe.webhooks.constructEvent pour Stripe, etc.).
//
// Déploiement :
//   supabase functions deploy payment-webhook --no-verify-jwt
//   supabase secrets set PAYMENT_WEBHOOK_SECRET=...
//
// URL à configurer côté provider :
//   https://<project-ref>.supabase.co/functions/v1/payment-webhook

import { corsHeaders } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';

const WEBHOOK_SECRET = Deno.env.get('PAYMENT_WEBHOOK_SECRET');

type IncomingEvent = {
  provider: 'stripe' | 'cinetpay' | 'wave' | 'orange_money' | 'flutterwave' | 'manual';
  external_ref: string;
  booking_id: string;
  payer_id: string;
  payee_id: string;
  amount_xof: number;
  currency?: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded' | 'cancelled';
};

async function verifySignature(req: Request, rawBody: string): Promise<boolean> {
  // Placeholder. Branche la vraie vérif provider-spécifique ici.
  // Stripe : Stripe.webhooks.constructEvent(rawBody, sig, WEBHOOK_SECRET)
  // CinetPay / Wave : HMAC SHA256 du body avec WEBHOOK_SECRET
  if (!WEBHOOK_SECRET) return true; // dev only — passe sans signature
  const sig = req.headers.get('x-signature') || req.headers.get('x-webhook-signature');
  if (!sig) return false;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(WEBHOOK_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(rawBody));
  const hex = Array.from(new Uint8Array(mac)).map((b) => b.toString(16).padStart(2, '0')).join('');
  return hex === sig;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const rawBody = await req.text();

  const valid = await verifySignature(req, rawBody);
  if (!valid) {
    return new Response(JSON.stringify({ error: 'invalid signature' }), {
      status: 401,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    });
  }

  try {
    const event = JSON.parse(rawBody) as IncomingEvent;

    if (!event.provider || !event.external_ref || !event.booking_id) {
      return new Response(JSON.stringify({ error: 'missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      });
    }

    // Upsert pour idempotence (un même webhook peut être renvoyé plusieurs fois)
    const { error } = await supabaseAdmin
      .from('payments')
      .upsert(
        {
          booking_id: event.booking_id,
          payer_id: event.payer_id,
          payee_id: event.payee_id,
          provider: event.provider,
          amount_xof: event.amount_xof,
          currency: event.currency ?? 'XOF',
          status: event.status,
          external_ref: event.external_ref,
          external_payload: JSON.parse(rawBody),
          succeeded_at: event.status === 'succeeded' ? new Date().toISOString() : null,
        },
        { onConflict: 'provider,external_ref' }
      );

    if (error) throw error;

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    });
  }
});
