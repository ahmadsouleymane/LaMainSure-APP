import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '../../../lib/theme';
import { type Review } from '../../../lib/mock-data';
import { useProfile } from '../../../lib/profile';
import { fetchProReviews } from '../../../lib/api';
import { AppHeader, Avatar, CategoryChip, Icon, Rating } from '../../../components/ui';

export default function ProReviews() {
  const { t } = useTheme();
  const { profile } = useProfile();
  const [filter, setFilter] = useState<'all' | '5' | '4' | 'low'>('all');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    setLoading(true);
    fetchProReviews(profile.id).then(setReviews).catch(() => {}).finally(() => setLoading(false));
  }, [profile?.id]);

  const dist = {
    5: reviews.filter((r) => r.rating === 5).length,
    4: reviews.filter((r) => r.rating === 4).length,
    3: reviews.filter((r) => r.rating === 3).length,
    2: reviews.filter((r) => r.rating === 2).length,
    1: reviews.filter((r) => r.rating === 1).length,
  };
  const total = reviews.length;
  const avg = total > 0 ? reviews.reduce((a, r) => a + r.rating, 0) / total : 0;
  const list = reviews.filter((r) => {
    if (filter === 'all') return true;
    if (filter === 'low') return r.rating <= 3;
    return r.rating === parseInt(filter, 10);
  });

  return (
    <View style={{ flex: 1, backgroundColor: t.paper }}>
      <AppHeader title="Avis reçus" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
          <View style={{ backgroundColor: t.accentSoft, borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 18 }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 42, fontWeight: '700', color: t.ink, fontFamily: 'RobotoMono_700Bold' }}>{avg.toFixed(1).replace('.', ',')}</Text>
              <View style={{ marginTop: 4 }}><Rating value={avg} size={14} /></View>
              <Text style={{ fontSize: 11, color: t.fg2, marginTop: 4 }}>{total} avis</Text>
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              {[5, 4, 3, 2, 1].map((s) => {
                const n = (dist as Record<number, number>)[s] || 0;
                const pct = total > 0 ? (n / total) * 100 : 0;
                return (
                  <View key={s} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ width: 8, color: t.fg2, fontSize: 11 }}>{s}</Text>
                    <View style={{ flex: 1, height: 5, backgroundColor: t.paper, borderRadius: 999, overflow: 'hidden' }}>
                      <View style={{ width: `${pct}%`, height: '100%', backgroundColor: t.ink, borderRadius: 999 }} />
                    </View>
                    <Text style={{ width: 18, color: t.fg2, fontSize: 11, textAlign: 'right' }}>{n}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20, paddingBottom: 14 }}>
          {([
            { id: 'all', label: `Tous · ${total}` },
            { id: '5', label: `5 étoiles · ${dist[5]}` },
            { id: '4', label: `4 étoiles · ${dist[4]}` },
            { id: 'low', label: `À traiter · ${dist[3] + dist[2] + dist[1]}` },
          ] as const).map((f) => (
            <CategoryChip key={f.id} label={f.label} active={filter === f.id} onPress={() => setFilter(f.id)} />
          ))}
        </ScrollView>

        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          {loading ? (
            <ActivityIndicator color={t.ink} style={{ paddingVertical: 30 }} />
          ) : list.length === 0 ? (
            <Text style={{ paddingVertical: 24, textAlign: 'center', color: t.fg3, fontSize: 14 }}>Pas encore d'avis.</Text>
          ) : list.map((r) => (
            <View key={r.id} style={{ padding: 14, borderRadius: 12, borderWidth: 1, borderColor: t.lineSoft, backgroundColor: t.paper }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', flex: 1 }}>
                  <Avatar name={r.clientName} size={36} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: t.ink }}>{r.clientName}</Text>
                    <Text style={{ fontSize: 11, color: t.fg2, marginTop: 1 }}>{r.service} · {r.date}</Text>
                  </View>
                </View>
                <Rating value={r.rating} size={12} />
              </View>
              <Text style={{ fontSize: 14, color: t.ink, marginTop: 10, lineHeight: 21 }}>{r.text}</Text>
              {r.proReply ? (
                <View style={{ marginTop: 10, padding: 10, backgroundColor: t.paperSoft, borderRadius: 8, borderLeftWidth: 3, borderLeftColor: t.ink }}>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: t.fg2, textTransform: 'uppercase', letterSpacing: 0.4 }}>Ta réponse</Text>
                  <Text style={{ fontSize: 13, color: t.ink, marginTop: 4, lineHeight: 18 }}>{r.proReply}</Text>
                </View>
              ) : (
                <Pressable onPress={() => Alert.alert('Bientôt', 'La réponse aux avis arrive prochainement.')} style={{ marginTop: 10, alignSelf: 'flex-start', borderWidth: 1, borderColor: t.line, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Icon name="corner-down-right" size={14} color={t.ink} />
                  <Text style={{ color: t.ink, fontSize: 13, fontWeight: '500' }}>Répondre</Text>
                </Pressable>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
