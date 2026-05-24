import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTheme } from '../../../lib/theme';
import { fmtFcfa } from '../../../lib/mock-data';
import { useProfile } from '../../../lib/profile';
import { fetchProStats, fetchProInbox, type ProStats, type ProInbox } from '../../../lib/api';
import { Avatar, Badge, Display, Icon, SectionTitle } from '../../../components/ui';

const EMPTY_STATS: ProStats = { monthRevenue: 0, acceptedRequests: 0, pendingRequests: 0, responseRate: 100, averageRating: 0, totalReviews: 0 };

export default function ProDashboard() {
  const router = useRouter();
  const { t } = useTheme();
  const { profile } = useProfile();
  const [s, setS] = useState<ProStats>(EMPTY_STATS);
  const [inbox, setInbox] = useState<ProInbox[]>([]);
  const firstName = (profile?.full_name || '').split(' ')[0] || '';

  useFocusEffect(useCallback(() => {
    if (!profile) return;
    let alive = true;
    fetchProStats(profile.id).then((x) => { if (alive) setS(x); }).catch(() => {});
    fetchProInbox().then((x) => { if (alive) setInbox(x); }).catch(() => {});
    return () => { alive = false; };
  }, [profile?.id]));

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.paperSoft }} contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', backgroundColor: t.paper }}>
        <View>
          <Text style={{ fontSize: 12, color: t.fg2 }}>Bonjour</Text>
          <Display size={22}>{firstName || 'Artisan'}</Display>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
            <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: t.success }} />
            <Text style={{ fontSize: 12, color: t.fg2 }}>Disponible aujourd'hui</Text>
          </View>
        </View>
        <Pressable onPress={() => router.push('/(app)/notifications')} style={{ width: 40, height: 40, borderRadius: 999, backgroundColor: t.paperSoft, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <Icon name="bell" size={20} color={t.ink} />
          <View style={{ position: 'absolute', top: 6, right: 7, width: 8, height: 8, borderRadius: 999, backgroundColor: t.accent, borderWidth: 2, borderColor: t.paperSoft }} />
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: 20, paddingVertical: 4, paddingBottom: 20, backgroundColor: t.paper, borderBottomWidth: 1, borderBottomColor: t.lineSoft }}>
        <View style={{ backgroundColor: t.ink, borderRadius: 16, padding: 18 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <Text style={{ fontSize: 11, fontWeight: '600', color: '#fff', opacity: 0.6, textTransform: 'uppercase', letterSpacing: 0.5 }}>CA du mois</Text>
              <Text style={{ fontSize: 30, fontWeight: '700', color: '#fff', marginTop: 4, fontFamily: 'RobotoMono_700Bold' }}>
                {fmtFcfa(s.monthRevenue)}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
                <Icon name="check-circle" size={14} color="#7be095" />
                <Text style={{ fontSize: 12, color: '#fff', opacity: 0.6 }}>{s.acceptedRequests} mission{s.acceptedRequests > 1 ? 's' : ''} en cours ou terminées</Text>
              </View>
            </View>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '500' }}>Mai 2026</Text>
              <Icon name="chevron-down" size={14} color="#fff" />
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 3, alignItems: 'flex-end', height: 36, marginTop: 14 }}>
            {[28, 22, 38, 34, 42, 30, 48, 52, 38, 60, 55, 72, 58, 68].map((h, i) => (
              <View key={i} style={{ flex: 1, height: `${h}%`, backgroundColor: i === 13 ? '#fff' : 'rgba(255,255,255,0.35)', borderRadius: 2 }} />
            ))}
          </View>
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 6, flexDirection: 'row', gap: 8 }}>
        <KPITile icon="check-circle" value={String(s.acceptedRequests)} label="Acceptées" />
        <KPITile icon="clock" value={String(s.pendingRequests)} label="En attente" highlight />
        <KPITile icon="star" value={s.averageRating.toString().replace('.', ',')} label={`${s.totalReviews} avis`} />
      </View>

      <View style={{ paddingHorizontal: 20, paddingVertical: 8 }}>
        <View style={{ backgroundColor: t.paper, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: t.lineSoft }}>
          <Icon name="zap" size={18} color={t.success} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: t.ink }}>Taux de réponse {s.responseRate}%</Text>
            <Text style={{ fontSize: 11, color: t.fg2, marginTop: 2 }}>Reste réactif pour garder le badge "Répond vite"</Text>
          </View>
        </View>
      </View>

      <SectionTitle title={`Nouvelles demandes · ${inbox.filter((d) => d.status === 'new').length}`} right={
        <Pressable onPress={() => router.push('/(pro)/(tabs)/demandes')} hitSlop={8}>
          <Text style={{ fontSize: 13, color: t.link }}>Voir tout</Text>
        </Pressable>
      } />
      <View style={{ paddingHorizontal: 20, gap: 8 }}>
        {inbox.length === 0 && (
          <Text style={{ paddingVertical: 16, color: t.fg3, fontSize: 14 }}>Aucune nouvelle demande.</Text>
        )}
        {inbox.map((d) => {
          const isNew = d.status === 'new';
          return (
            <Pressable key={d.id} onPress={() => router.push(`/(pro)/demande/${d.id}`)} style={{
              padding: 14, borderRadius: 12, borderWidth: 1, borderColor: isNew ? t.ink : t.lineSoft, backgroundColor: t.paper, gap: 8,
            }}>
              {isNew && (
                <View style={{ position: 'absolute', top: -8, left: 14, backgroundColor: t.ink, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                  <Text style={{ color: t.paper, fontSize: 9, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' }}>Nouveau</Text>
                </View>
              )}
              <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <Avatar name={d.clientName} size={40} image={d.clientAvatar} />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: '600', color: t.ink, flexShrink: 1 }}>{d.clientName}</Text>
                    <Text style={{ fontSize: 11, color: t.fg3 }}>{d.createdAt}</Text>
                  </View>
                  <Text style={{ fontSize: 13, color: t.fg2, marginTop: 2 }}>{d.service}</Text>
                </View>
              </View>
              <Text numberOfLines={2} style={{ fontSize: 13, color: t.ink, lineHeight: 18 }}>{d.description}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                  <Icon name="map-pin" size={11} color={t.fg2} />
                  <Text style={{ fontSize: 11, color: t.fg2 }}>{d.address.split(' · ')[1] || d.address}</Text>
                </View>
                {d.urgency ? <Badge tone="danger">{d.urgency}</Badge> : null}
                <Text style={{ marginLeft: 'auto', fontSize: 11, color: t.ink, fontWeight: '600' }}>{d.budget}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

function KPITile({ icon, value, label, highlight }: { icon: string; value: string; label: string; highlight?: boolean }) {
  const { t } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: t.paper, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: t.lineSoft, gap: 4 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Icon name={icon} size={16} color={highlight ? t.accent : t.fg2} />
        {highlight && <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: t.accent }} />}
      </View>
      <Text style={{ fontSize: 22, fontWeight: '700', color: t.ink, fontFamily: 'RobotoMono_700Bold' }}>{value}</Text>
      <Text style={{ fontSize: 11, color: t.fg2, fontWeight: '500' }}>{label}</Text>
    </View>
  );
}
