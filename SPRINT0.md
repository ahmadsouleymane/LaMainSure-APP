# Sprint 0 — Setup La Main Sûre

Structure du repo (monorepo simple, sans outil) :

```
mobile/    ← app Expo
backend/   ← Supabase (migrations SQL, futures Edge Functions)
```

## Ce qui est déjà en place (local)

**mobile/**
- `app.json` : nom `La Main Sûre`, slug `lamain-sure-app`, bundleId `com.lamainsure.app`, scheme `lamainsure`, permissions iOS + Android, plugins `expo-router` + `expo-secure-store`
- `package.json` : Expo SDK 51 + expo-router + `@supabase/supabase-js` + AsyncStorage + url-polyfill + scripts `db:*`
- `tsconfig.json` strict, `npm install` exécuté, typecheck OK
- `app/_layout.tsx` + `app/index.tsx` (expo-router, plus de `App.js`)
- `lib/supabase.ts` : client Supabase avec persistance via AsyncStorage
- `.env.example`

**backend/**
- `supabase/migrations/0001_init.sql` : 12 tables + PostGIS + triggers + **RLS sur tout** + seed catégories
- `.env.example` (pour service_role côté admin)

**Racine**
- `.gitignore` couvre les 2 sous-dossiers
- `README.md` + ce fichier

---

## Étapes manuelles à faire (toi)

### 1. Créer le projet Supabase (5 min)

1. https://supabase.com → **New project**
2. Nom : `lamain-sure-app`
3. Région : **West EU (Paris)** ou **West EU (Ireland)** (latence minimale pour l'Afrique de l'Ouest)
4. DB password : génère un mot de passe fort, **stocke-le dans 1Password / un coffre**
5. Plan Free pour démarrer

### 2. Remplir les clés (2 min)

Project Settings → **API** :
- copie **Project URL**
- copie **anon public** key
- copie **service_role** key (secret, jamais dans l'app)

```bash
cd mobile && cp .env.example .env
# édite mobile/.env → EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_ANON_KEY

cd ../backend && cp .env.example .env
# édite backend/.env → SUPABASE_URL + ANON + SERVICE_ROLE
```

### 3. Installer la CLI Supabase (5 min)

```bash
brew install supabase/tap/supabase
supabase --version
```

### 4. Lier et pousser la migration (3 min)

```bash
cd /Users/macbookair/Desktop/APP/backend
supabase login                              # ouvre le navigateur
supabase link --project-ref <PROJECT_REF>   # <REF> = partie avant .supabase.co
supabase db push                            # applique 0001_init.sql
```

### 5. Activer Auth Email (2 min)

Dashboard Supabase → **Authentication → Providers** → Email déjà activé, c'est suffisant pour Sprint 1.
(Phone / Google / Apple → à configurer dans un prochain sprint.)

### 6. Tester le démarrage app (3 min)

```bash
cd /Users/macbookair/Desktop/APP/mobile
npm run ios
```

Tu dois voir **"La Main Sûre — Sprint 0 — backend Supabase en place"** dans le simulateur.

Si erreur `Supabase env manquant` : vérifie `mobile/.env`, puis relance avec `npm run start -- --clear`.

### 7. Générer les types TS (1 min, optionnel mais recommandé)

```bash
cd mobile
npm run db:types
```

Crée `mobile/lib/database.types.ts` (gitignored, regénéré au besoin) — le client `supabase` deviendra typé.

---

## Vérifs après Sprint 0

- [ ] Projet Supabase créé, clés dans `mobile/.env` et `backend/.env`
- [ ] `supabase db push` passé sans erreur
- [ ] Dashboard Supabase → **Database → Tables** : 12 tables visibles
- [ ] **Database → Policies** : chaque table a des policies RLS
- [ ] **Database → Extensions** : `postgis` activée
- [ ] `npm run ios` ouvre l'app sans crash
- [ ] `cd mobile && npm run typecheck` → 0 erreur

---

## Sprint 1 (après validation)

- Écrans `mobile/app/(auth)/sign-in.tsx` + `sign-up.tsx`
- Hook `useSession`
- Onboarding : compléter `profiles` (nom, ville, géoloc)
- Bouton "Devenir pro" → crée ligne dans `pros`

Dis-moi quand les 7 étapes sont faites, on enchaîne.
