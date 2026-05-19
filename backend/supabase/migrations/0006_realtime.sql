-- =========================================================================
-- 0006 — Realtime publication
-- =========================================================================
-- Active la diffusion temps réel sur les tables clés. Les clients abonnés
-- reçoivent les changements en push WebSocket. RLS s'applique : un client
-- ne reçoit que les rows qu'il a le droit de lire.

alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.bookings;
alter publication supabase_realtime add table public.notifications;
