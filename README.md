# La Main Sûre

Marketplace mobile : particuliers ↔ pros vérifiés à travers l'Afrique.
Lancement public : **2026-06-11**.

## Structure du repo

```
.
├── mobile/     ← App Expo (React Native + expo-router + TypeScript)
│   ├── app/        ← routes expo-router (écrans)
│   ├── lib/        ← code partagé (client Supabase, helpers)
│   ├── app.json    ← config Expo (bundleId com.lamainsure.app)
│   └── .env        ← EXPO_PUBLIC_SUPABASE_URL + ANON_KEY (gitignored)
│
├── backend/    ← Supabase (Postgres + Auth + Storage + Edge Functions)
│   ├── supabase/
│   │   ├── migrations/   ← schéma SQL versionné (RLS, triggers, seed)
│   │   └── functions/    ← Edge Functions Deno (à venir Sprint 2+)
│   └── .env        ← clés service_role pour scripts admin (gitignored)
│
└── SPRINT0.md  ← guide de setup initial
```

## Quickstart

```bash
# Backend (une fois le projet Supabase créé sur supabase.com)
cd backend
supabase link --project-ref <REF>
supabase db push

# Mobile
cd mobile
cp .env.example .env   # remplir avec URL + anon key
npm install            # déjà fait
npm run ios
```

Voir `SPRINT0.md` pour le détail des étapes manuelles.
# LaMainSure-APP

---

## 👤 Auteur

**Ahmad Souleymane** — [@ahmadsouleymane](https://github.com/ahmadsouleymane)
