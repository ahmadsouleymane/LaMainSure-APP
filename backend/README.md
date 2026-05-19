# Backend La Main Sûre

Backend complet sur **Supabase** : Postgres (PostGIS, pg_cron, full-text FR),
Auth (email uniquement), Storage, Realtime, Edge Functions (Deno).

## Structure

```
backend/supabase/
├── config.toml                       ← config CLI + Auth + templates email + Edge Functions
├── migrations/
│   ├── 0001_init.sql                 ← 13 tables + RLS + triggers + seed catégories
│   ├── 0002_storage.sql              ← 4 buckets + policies
│   ├── 0003_rpc_search.sql           ← pros_nearby() (PostGIS)
│   ├── 0004_rpc_booking.sql          ← create_booking, send_quote, accept_quote, complete, cancel
│   ├── 0005_cron_notifications.sql   ← table notifications + triggers auto + pg_cron rappels J-1
│   ├── 0006_realtime.sql             ← publications realtime (messages, bookings, notifications)
│   ├── 0007_payments.sql             ← table payments + payment_status sur bookings
│   └── 0008_search_fulltext.sql      ← tsvector FR + GIN sur pros & services
├── functions/
│   ├── _shared/         ← cors + supabaseAdmin
│   ├── notify-push/     ← envoi push Expo (déclenché par DB webhook)
│   ├── report-webhook/  ← notif Slack/Discord sur signalement
│   ├── payment-webhook/ ← webhook générique providers paiement
│   ├── kyc-review/      ← endpoint admin KYC
│   ├── delete-my-account/ ← suppression de compte RGPD
│   └── export-my-data/  ← export JSON de toutes les données user (RGPD)
├── templates/           ← templates email FR (HTML)
│   ├── confirmation.html
│   ├── recovery.html
│   ├── magic_link.html
│   ├── email_change.html
│   └── invite.html
├── tests/
│   └── rls.test.sql     ← scénarios RLS (alice/bob/charlie)
└── seed.sql             ← données dev (auto-chargé par `db reset`)
```

## État actuel

**Appliqué en cloud** (`supabase db push` exécuté) :
- ✅ Migrations 0001 → 0006
- ✅ Edge Functions notify-push, report-webhook, kyc-review déployées
- ✅ Webhooks DB sur `notifications` INSERT et `reports` INSERT

**Reste à appliquer** :
- 🚧 Migrations 0007, 0008 : `supabase db push`
- 🚧 Edge Functions payment-webhook, delete-my-account, export-my-data : `supabase functions deploy ...`
- 🚧 Templates email à copier dans Dashboard → Auth → Email Templates (cf. section dédiée)

## Push des nouvelles migrations + functions

```bash
cd backend

# Migrations 0007 + 0008
supabase db push

# Edge Functions
supabase functions deploy payment-webhook --no-verify-jwt
supabase functions deploy delete-my-account
supabase functions deploy export-my-data
```

## Templates email FR

Les templates HTML sont dans `supabase/templates/`. Le `config.toml` les
référence pour le dev local. Pour la **prod**, il faut les copier manuellement
dans le dashboard cloud :

**Dashboard** → **Authentication** → **Email Templates** → pour chaque template :
1. Sélectionne le type (Confirm signup, Reset password, Magic Link, Change Email Address, Invite User)
2. Copie le contenu HTML du fichier correspondant dans `templates/`
3. Mets à jour le sujet :
   - Confirm signup → `Confirme ton inscription à La Main Sûre`
   - Reset password → `Réinitialiser ton mot de passe — La Main Sûre`
   - Magic Link → `Ton lien de connexion — La Main Sûre`
   - Change Email Address → `Confirme ta nouvelle adresse email — La Main Sûre`
   - Invite User → `Tu es invité·e sur La Main Sûre`
4. Sauve.

## Database Webhooks (Dashboard)

Déjà créés :
- `notifications` INSERT → `notify-push`
- `reports` INSERT → `report-webhook`

Pas de webhook DB pour les paiements : c'est le **provider externe** (Stripe etc.)
qui POST sur `payment-webhook`.

## Secrets

```bash
# Paiements (quand tu auras choisi un provider)
supabase secrets set PAYMENT_WEBHOOK_SECRET=...

# Modération (optionnel)
supabase secrets set MODERATION_WEBHOOK_URL=https://hooks.slack.com/...

# Expo (optionnel — utile si Expo enhanced security activé)
supabase secrets set EXPO_ACCESS_TOKEN=...
```

## Tests RLS

En local (nécessite Docker + `supabase start`) :
```bash
supabase db reset
psql "$(supabase status -o json | jq -r .DB_URL)" -f supabase/tests/rls.test.sql
```

Tous les `PASS` doivent s'afficher, aucun `FAIL`.

## Storage : convention de chemin

| Bucket            | Path                                      | Visibilité |
|-------------------|-------------------------------------------|------------|
| avatars           | `{userId}/{filename}`                     | public     |
| portfolio         | `{userId}/{filename}`                     | public     |
| kyc-docs          | `{userId}/{filename}`                     | privé      |
| chat-attachments  | `{conversationId}/{senderId}/{filename}`  | privé      |

Les policies RLS sur `storage.objects` se basent sur `storage.foldername(name)`
pour vérifier la propriété.

## Génération des types TS pour le frontend

```bash
cd ../mobile
npm run db:types   # crée mobile/lib/database.types.ts (gitignored)
```

## Auth — choix de design

- **Email + mot de passe uniquement** côté V1.
- Pas d'OTP téléphone (volontairement skippé pour éviter le coût Twilio en MVP).
- Google / Apple OAuth : peuvent être ajoutés plus tard via Dashboard → Auth → Providers.

## Workflow ajout de migration

```bash
# Créer un fichier supabase/migrations/00XX_nom.sql
# (ou : supabase db diff -f nom — nécessite supabase start local)

# Tester en local d'abord
supabase db reset

# Pousser en prod
supabase db push
```

⚠️ **Ne jamais éditer une migration déjà appliquée en prod.** Toujours en créer une nouvelle.

## Sécurité — checklist avant lancement public

- [ ] Plan **Pro** activé ($25/mois) pour Point-in-Time Recovery
- [ ] `PAYMENT_WEBHOOK_SECRET` configuré + signature provider-spécifique branchée
- [ ] Templates email copiés en Dashboard
- [ ] Email confirmations activées (`enable_confirmations = true` ✓)
- [ ] Site URL et redirect URLs vérifiées (`lamainsure://`)
- [ ] Politique de confidentialité + CGU liées dans l'app
- [ ] Endpoint `delete-my-account` testé
- [ ] Tests RLS passent
