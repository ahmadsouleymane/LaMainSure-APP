// Data-access layer: typed Supabase queries + RPCs, mapped to the UI shapes
// the screens already consume (see lib/mock-data.ts for the type definitions).
import { supabase } from './supabase';
import type { Pro, Service, MyRequest, Review, Tone } from './mock-data';
import { SLUG_MAP } from './mock-data';
import type { Coords } from './location';

// ─── Categories ────────────────────────────────────────────────────────
export async function fetchCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('id, slug, name_fr')
    .order('sort_order');
  if (error) throw error;
  return data;
}

const tagsFromSlugs = (slugs: string[] | null): string[] =>
  (slugs ?? []).map((s) => SLUG_MAP[s] ?? s);

// ─── Search: pros nearby ─────────────────────────────────────────────────
export type ProListFilters = {
  coords: Coords;
  radiusKm?: number;
  categorySlug?: string | null;
  search?: string | null;
};

// Returns objects shaped like the UI `Pro` (partial: list-card fields only).
export async function fetchProsNearby(f: ProListFilters): Promise<Pro[]> {
  const { data, error } = await supabase.rpc('pros_nearby', {
    p_lat: f.coords.lat,
    p_lng: f.coords.lng,
    p_radius_km: f.radiusKm ?? 50,
    p_category_slug: f.categorySlug && f.categorySlug !== 'all' ? f.categorySlug : undefined,
    p_search: f.search?.trim() || undefined,
  });
  if (error) throw error;
  const rows = data ?? [];
  if (rows.length === 0) return [];

  // Fetch a starting price per pro in one query.
  const ids = rows.map((r) => r.pro_id);
  const { data: svc } = await supabase
    .from('services')
    .select('pro_id, price_xof')
    .in('pro_id', ids)
    .eq('is_active', true);
  const minPrice = new Map<string, number>();
  for (const s of svc ?? []) {
    if (s.price_xof == null) continue;
    const cur = minPrice.get(s.pro_id);
    if (cur == null || s.price_xof < cur) minPrice.set(s.pro_id, s.price_xof);
  }

  return rows.map((r) => {
    const price = minPrice.get(r.pro_id) ?? 0;
    return {
      id: r.pro_id,
      name: r.display_name,
      fullName: r.display_name,
      avatar: r.avatar_url ?? '',
      city: r.city ?? '',
      neighborhood: r.city ?? '',
      lat: r.lat ?? 0,
      lng: r.lng ?? 0,
      bio: r.bio ?? '',
      yearsExperience: 0,
      tags: tagsFromSlugs(r.categories),
      rating: Number(r.rating_avg ?? 0),
      reviews: r.rating_count ?? 0,
      distance: (Number(r.distance_km ?? 0)).toFixed(1).replace('.', ','),
      verified: true, // pros_nearby only returns visible (KYC-approved) pros
      accent: false,
      responseTime: '1 h',
      completedJobs: 0,
      services: [{ title: '', desc: '', price, durationMin: null }],
      availability: [],
      portfolio: 0,
    } satisfies Pro;
  });
}

// ─── Pro detail ──────────────────────────────────────────────────────────
export async function fetchProDetail(proId: string): Promise<Pro | null> {
  const { data: pro, error } = await supabase
    .from('pros')
    .select('id, display_name, bio, years_experience, rating_avg, rating_count, profile:profiles!pros_id_fkey(full_name, avatar_url, city), services(title, description, price_xof, duration_min, is_active), portfolio_items(id), pro_categories(category:categories(slug))')
    .eq('id', proId)
    .maybeSingle();
  if (error) throw error;
  if (!pro) return null;

  const services: Service[] = (pro.services ?? [])
    .filter((s) => s.is_active)
    .map((s) => ({
      title: s.title,
      desc: s.description ?? '',
      price: s.price_xof ?? 0,
      durationMin: s.duration_min ?? null,
    }));

  const tags = tagsFromSlugs(
    (pro.pro_categories ?? []).map((pc) => pc.category?.slug).filter(Boolean) as string[]
  );

  return {
    id: pro.id,
    name: pro.display_name,
    fullName: pro.profile?.full_name ?? pro.display_name,
    avatar: pro.profile?.avatar_url ?? '',
    city: pro.profile?.city ?? '',
    neighborhood: pro.profile?.city ?? '',
    lat: 0,
    lng: 0,
    bio: pro.bio ?? '',
    yearsExperience: pro.years_experience ?? 0,
    tags,
    rating: Number(pro.rating_avg ?? 0),
    reviews: pro.rating_count ?? 0,
    distance: '',
    verified: true,
    accent: false,
    responseTime: '1 h',
    completedJobs: 0,
    services: services.length ? services : [{ title: 'Sur devis', desc: '', price: 0, durationMin: null }],
    availability: [],
    portfolio: (pro.portfolio_items ?? []).length,
  } satisfies Pro;
}

// ─── My pro profile (pro editing their own page) ─────────────────────────
export type MyProService = { id: string; title: string; price: number; durationMin: number | null; active: boolean };
export type MyPro = {
  id: string;
  displayName: string;
  fullName: string;
  avatar: string;
  bio: string;
  tags: string[];
  serviceRadiusKm: number;
  isVisible: boolean;
  services: MyProService[];
};

export async function fetchMyPro(proId: string): Promise<MyPro | null> {
  const { data, error } = await supabase
    .from('pros')
    .select('id, display_name, bio, service_radius_km, is_visible, profile:profiles!pros_id_fkey(full_name, avatar_url), services(id, title, price_xof, duration_min, is_active), pro_categories(category:categories(slug))')
    .eq('id', proId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id,
    displayName: data.display_name,
    fullName: data.profile?.full_name ?? data.display_name,
    avatar: data.profile?.avatar_url ?? '',
    bio: data.bio ?? '',
    tags: tagsFromSlugs((data.pro_categories ?? []).map((pc) => pc.category?.slug).filter(Boolean) as string[]),
    serviceRadiusKm: data.service_radius_km ?? 20,
    isVisible: data.is_visible,
    services: (data.services ?? []).map((s) => ({
      id: s.id,
      title: s.title,
      price: s.price_xof ?? 0,
      durationMin: s.duration_min ?? null,
      active: s.is_active,
    })),
  };
}

export async function setProVisible(proId: string, isVisible: boolean) {
  const { error } = await supabase.from('pros').update({ is_visible: isVisible }).eq('id', proId);
  if (error) throw error;
}

export async function setServiceActive(serviceId: string, active: boolean) {
  const { error } = await supabase.from('services').update({ is_active: active }).eq('id', serviceId);
  if (error) throw error;
}

export async function updateProBio(proId: string, bio: string) {
  const { error } = await supabase.from('pros').update({ bio }).eq('id', proId);
  if (error) throw error;
}

// Primary category id of a pro (first associated category), or null.
export async function fetchProCategoryId(proId: string): Promise<string | null> {
  const { data } = await supabase.from('pro_categories').select('category_id').eq('pro_id', proId).limit(1).maybeSingle();
  return data?.category_id ?? null;
}

export async function createService(input: { proId: string; categoryId: string; title: string; description?: string; priceXof?: number | null; durationMin?: number | null }) {
  const { error } = await supabase.from('services').insert({
    pro_id: input.proId,
    category_id: input.categoryId,
    title: input.title,
    description: input.description ?? null,
    price_xof: input.priceXof ?? null,
    duration_min: input.durationMin ?? null,
    is_active: true,
  });
  if (error) throw error;
}

// ─── Reviews for a pro (public) ──────────────────────────────────────────
export async function fetchProReviews(proId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('id, rating, comment, created_at, author:profiles!reviews_author_id_fkey(full_name), booking:bookings!reviews_booking_id_fkey(category:categories(name_fr))')
    .eq('target_id', proId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    clientName: r.author?.full_name ?? 'Client',
    rating: r.rating,
    date: relativeDate(r.created_at),
    service: r.booking?.category?.name_fr ?? '',
    text: r.comment ?? '',
    proReply: null,
  }));
}

// ─── Pro dashboard stats ─────────────────────────────────────────────────
export type ProStats = {
  monthRevenue: number;
  acceptedRequests: number;
  pendingRequests: number;
  responseRate: number;
  averageRating: number;
  totalReviews: number;
};

export async function fetchProStats(proId: string): Promise<ProStats> {
  const { data: bookings } = await supabase
    .from('bookings')
    .select('status, final_price_xof, completed_at')
    .eq('pro_id', proId);
  const { data: pro } = await supabase
    .from('pros')
    .select('rating_avg, rating_count')
    .eq('id', proId)
    .maybeSingle();

  const list = bookings ?? [];
  const now = new Date();
  const monthRevenue = list
    .filter((b) => b.status === 'completed' && b.completed_at && new Date(b.completed_at).getMonth() === now.getMonth() && new Date(b.completed_at).getFullYear() === now.getFullYear())
    .reduce((a, b) => a + (b.final_price_xof ?? 0), 0);
  const acceptedRequests = list.filter((b) => ['accepted', 'in_progress', 'completed'].includes(b.status)).length;
  const pendingRequests = list.filter((b) => ['requested', 'quoted'].includes(b.status)).length;
  const answered = list.filter((b) => b.status !== 'requested').length;
  const responseRate = list.length ? Math.round((answered / list.length) * 100) : 100;

  return {
    monthRevenue,
    acceptedRequests,
    pendingRequests,
    responseRate,
    averageRating: Number(pro?.rating_avg ?? 0),
    totalReviews: pro?.rating_count ?? 0,
  };
}

// ─── Bookings ────────────────────────────────────────────────────────────
const STATUS_UI: Record<string, { status: MyRequest['status']; label: string; tone: Tone }> = {
  requested: { status: 'pending', label: 'En attente', tone: 'warning' },
  quoted: { status: 'pending', label: 'Devis reçu', tone: 'info' },
  accepted: { status: 'confirmed', label: 'Confirmée', tone: 'success' },
  in_progress: { status: 'in-progress', label: 'En cours', tone: 'info' },
  completed: { status: 'done', label: 'Terminée', tone: 'neutral' },
  cancelled: { status: 'done', label: 'Annulée', tone: 'danger' },
  disputed: { status: 'done', label: 'Litige', tone: 'danger' },
};

export async function createBooking(input: {
  proId: string;
  description: string;
  serviceId?: string | null;
  categoryId?: string | null;
  photos?: string[];
  coords?: Coords | null;
  address?: string | null;
  scheduledAt?: string | null;
}) {
  const { data, error } = await supabase.rpc('create_booking', {
    p_pro_id: input.proId,
    p_description: input.description,
    p_service_id: input.serviceId ?? undefined,
    p_category_id: input.categoryId ?? undefined,
    p_photos: input.photos ?? [],
    p_lat: input.coords?.lat,
    p_lng: input.coords?.lng,
    p_address: input.address ?? undefined,
    p_scheduled_at: input.scheduledAt ?? undefined,
  });
  if (error) throw error;
  return data?.[0]; // { booking_id, conversation_id }
}

// Client side: "Mes demandes"
export async function fetchMyRequests(): Promise<MyRequest[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('id, pro_id, status, description, address_text, scheduled_at, quoted_price_xof, final_price_xof, created_at, pro:pros!bookings_pro_id_fkey(display_name), category:categories(name_fr)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((b) => {
    const ui = STATUS_UI[b.status] ?? STATUS_UI.requested;
    return {
      id: b.id,
      proId: b.pro_id,
      service: b.category?.name_fr ?? b.pro?.display_name ?? 'Demande',
      status: ui.status,
      statusLabel: ui.label,
      tone: ui.tone,
      date: b.scheduled_at ? formatDateTime(b.scheduled_at) : ui.label,
      address: b.address_text ?? '—',
      price: b.final_price_xof ?? b.quoted_price_xof ?? 0,
      createdAt: relativeDate(b.created_at),
    };
  });
}

// Pro side inbox ("Demandes")
export type ProInbox = {
  id: string;
  clientId: string;
  clientName: string;
  clientAvatar: string;
  service: string;
  description: string;
  address: string;
  photos: number;
  budget: string;
  createdAt: string;
  urgency?: string;
  status: 'new' | 'pending';
};

export async function fetchProInbox(): Promise<ProInbox[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('id, client_id, status, description, address_text, photos, quoted_price_xof, created_at, client:profiles!bookings_client_id_fkey(full_name, avatar_url), category:categories(name_fr)')
    .in('status', ['requested', 'quoted'])
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((b) => ({
    id: b.id,
    clientId: b.client_id,
    clientName: b.client?.full_name ?? 'Client',
    clientAvatar: b.client?.avatar_url ?? '',
    service: b.category?.name_fr ?? 'Demande',
    description: b.description,
    address: b.address_text ?? '—',
    photos: (b.photos ?? []).length,
    budget: b.quoted_price_xof ? `${b.quoted_price_xof.toLocaleString('fr-FR')} FCFA` : 'À discuter',
    createdAt: relativeDate(b.created_at),
    urgency: b.description.includes('[Urgent') ? 'Urgent' : undefined,
    status: b.status === 'requested' ? 'new' : 'pending',
  }));
}

export type BookingDetail = {
  id: string;
  status: string;
  description: string;
  address: string;
  photos: string[];
  scheduledAt: string | null;
  quotedPrice: number | null;
  finalPrice: number | null;
  createdAt: string;
  clientId: string;
  proId: string;
  clientName: string;
  clientAvatar: string;
  proName: string;
  service: string;
  conversationId: string | null;
};

export async function fetchBooking(id: string): Promise<BookingDetail | null> {
  const { data: b, error } = await supabase
    .from('bookings')
    .select('id, status, description, address_text, photos, scheduled_at, quoted_price_xof, final_price_xof, created_at, client_id, pro_id, client:profiles!bookings_client_id_fkey(full_name, avatar_url), pro:pros!bookings_pro_id_fkey(display_name), category:categories(name_fr), conversations(id)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!b) return null;
  return {
    id: b.id,
    status: b.status,
    description: b.description,
    address: b.address_text ?? '—',
    photos: b.photos ?? [],
    scheduledAt: b.scheduled_at,
    quotedPrice: b.quoted_price_xof,
    finalPrice: b.final_price_xof,
    createdAt: relativeDate(b.created_at),
    clientId: b.client_id,
    proId: b.pro_id,
    clientName: b.client?.full_name ?? 'Client',
    clientAvatar: b.client?.avatar_url ?? '',
    proName: b.pro?.display_name ?? 'Pro',
    service: b.category?.name_fr ?? 'Demande',
    conversationId: (Array.isArray(b.conversations) ? b.conversations[0] : b.conversations)?.id ?? null,
  };
}

// Booking workflow RPCs
export const sendQuote = (bookingId: string, priceXof: number) =>
  rpcVoid('send_quote', { p_booking_id: bookingId, p_price_xof: priceXof });
export const acceptQuote = (bookingId: string) =>
  rpcVoid('accept_quote', { p_booking_id: bookingId });
export const startWork = (bookingId: string) =>
  rpcVoid('start_work', { p_booking_id: bookingId });
export const completeBooking = (bookingId: string, finalPriceXof?: number) =>
  rpcVoid('complete_booking', { p_booking_id: bookingId, p_final_price_xof: finalPriceXof });
export const cancelBooking = (bookingId: string, reason?: string) =>
  rpcVoid('cancel_booking', { p_booking_id: bookingId, p_reason: reason });

async function rpcVoid(fn: 'send_quote' | 'accept_quote' | 'start_work' | 'complete_booking' | 'cancel_booking', args: Record<string, unknown>) {
  const { error } = await supabase.rpc(fn as any, args as any);
  if (error) throw error;
}

// ─── Chat / conversations ────────────────────────────────────────────────
export type ConversationSummary = {
  id: string;
  bookingId: string;
  otherName: string;
  otherAvatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  service: string;
};

export async function fetchConversations(myId: string): Promise<ConversationSummary[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('id, booking_id, booking:bookings!conversations_booking_id_fkey(client_id, pro_id, category:categories(name_fr), client:profiles!bookings_client_id_fkey(full_name, avatar_url), pro:pros!bookings_pro_id_fkey(display_name, profile:profiles!pros_id_fkey(avatar_url))), messages(body, created_at, sender_id, read_at)');
  if (error) throw error;
  const out: ConversationSummary[] = (data ?? []).map((c) => {
    const bk = c.booking;
    const amClient = bk?.client_id === myId;
    const msgs = [...(c.messages ?? [])].sort((a, b) => a.created_at.localeCompare(b.created_at));
    const last = msgs[msgs.length - 1];
    const unread = msgs.filter((m) => m.read_at == null && m.sender_id !== myId).length;
    return {
      id: c.id,
      bookingId: c.booking_id,
      otherName: amClient ? (bk?.pro?.display_name ?? 'Artisan') : (bk?.client?.full_name ?? 'Client'),
      otherAvatar: (amClient ? bk?.pro?.profile?.avatar_url : bk?.client?.avatar_url) ?? '',
      lastMessage: last?.body ?? 'Nouvelle conversation',
      time: last ? relativeDate(last.created_at) : '',
      unread,
      service: bk?.category?.name_fr ?? 'Demande',
    };
  });
  // Most recent first.
  return out.sort((a, b) => (b.time > a.time ? 1 : -1));
}

export type ChatMsg = { id: string; body: string; senderId: string; createdAt: string };

export async function fetchMessages(conversationId: string): Promise<ChatMsg[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('id, body, sender_id, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((m) => ({ id: m.id, body: m.body ?? '', senderId: m.sender_id, createdAt: m.created_at }));
}

export async function sendMessage(conversationId: string, senderId: string, body: string) {
  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: senderId, body })
    .select('id, body, sender_id, created_at')
    .single();
  if (error) throw error;
  return { id: data.id, body: data.body ?? '', senderId: data.sender_id, createdAt: data.created_at } as ChatMsg;
}

export async function markMessagesRead(conversationId: string, myId: string) {
  await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .neq('sender_id', myId)
    .is('read_at', null);
}

// Realtime subscription to new messages in a conversation. Returns an unsubscribe fn.
export function subscribeMessages(conversationId: string, onInsert: (m: ChatMsg) => void): () => void {
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
      (payload) => {
        const r = payload.new as { id: string; body: string | null; sender_id: string; created_at: string };
        onInsert({ id: r.id, body: r.body ?? '', senderId: r.sender_id, createdAt: r.created_at });
      }
    )
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}

export type ConversationContext = {
  conversationId: string;
  bookingId: string;
  status: string;
  amClient: boolean;
  otherName: string;
  otherAvatar: string;
  quotedPrice: number | null;
};

export async function fetchConversationContext(conversationId: string, myId: string): Promise<ConversationContext | null> {
  const { data, error } = await supabase
    .from('conversations')
    .select('id, booking_id, booking:bookings!conversations_booking_id_fkey(status, client_id, pro_id, quoted_price_xof, client:profiles!bookings_client_id_fkey(full_name, avatar_url), pro:pros!bookings_pro_id_fkey(display_name, profile:profiles!pros_id_fkey(avatar_url)))')
    .eq('id', conversationId)
    .maybeSingle();
  if (error) throw error;
  if (!data || !data.booking) return null;
  const bk = data.booking;
  const amClient = bk.client_id === myId;
  return {
    conversationId: data.id,
    bookingId: data.booking_id,
    status: bk.status,
    amClient,
    otherName: amClient ? (bk.pro?.display_name ?? 'Artisan') : (bk.client?.full_name ?? 'Client'),
    otherAvatar: (amClient ? bk.pro?.profile?.avatar_url : bk.client?.avatar_url) ?? '',
    quotedPrice: bk.quoted_price_xof,
  };
}

// ─── Notifications ───────────────────────────────────────────────────────
export type AppNotification = { id: string; kind: string; title: string; body: string | null; createdAt: string; read: boolean };

export async function fetchNotifications(): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('id, kind, title, body, read_at, created_at')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []).map((n) => ({
    id: n.id, kind: n.kind, title: n.title, body: n.body, createdAt: relativeDate(n.created_at), read: n.read_at != null,
  }));
}

export async function markAllNotificationsRead() {
  await supabase.from('notifications').update({ read_at: new Date().toISOString() }).is('read_at', null);
}

export async function countUnreadNotifications(): Promise<number> {
  const { count } = await supabase.from('notifications').select('id', { count: 'exact', head: true }).is('read_at', null);
  return count ?? 0;
}

// ─── Helpers ─────────────────────────────────────────────────────────────
export function relativeDate(iso: string): string {
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "À l'instant";
  if (min < 60) return `Il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `Il y a ${h} h`;
  const days = Math.floor(h / 24);
  if (days === 1) return 'Hier';
  if (days < 7) return `Il y a ${days} jours`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `Il y a ${weeks} sem.`;
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (sameDay(d, today)) return `Aujourd'hui · ${time}`;
  if (sameDay(d, tomorrow)) return `Demain · ${time}`;
  return `${d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} · ${time}`;
}
