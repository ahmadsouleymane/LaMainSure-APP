import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTheme } from '../../../lib/theme';
import { fmtFcfa, type MyRequest } from '../../../lib/mock-data';
import { fetchMyRequests } from '../../../lib/api';
import { Avatar, Badge, Display, Icon } from '../../../components/ui';

export default function Requests() {
  const router = useRouter();
  const { t } = useTheme();
  const [tab, setTab] = useState<'active' | 'done'>('active');
  const [requests, setRequests] = useState<MyRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    let alive = true;
    setLoading(true);
    fetchMyRequests().then((r) => { if (alive) setRequests(r); }).catch(() => {}).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []));

  const active = requests.filter((r) => r.status !== 'done');
  const done = requests.filter((r) => r.status === 'done');
  const list = tab === 'active' ? active : done;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.paper }} contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 }}>
        <Display size={26}>Mes demandes</Display>
      </View>

      <View style={{ flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: t.lineSoft }}>
        {([['active', `En cours · ${active.length}`], ['done', `Terminées · ${done.length}`]] as const).map(([id, label]) => (
          <Pressable key={id} onPress={() => setTab(id)} style={{
            paddingHorizontal: 14, paddingVertical: 10,
            borderBottomWidth: 2, borderBottomColor: tab === id ? t.ink : 'transparent',
            marginBottom: -1,
          }}>
            <Text style={{ color: tab === id ? t.ink : t.fg2, fontSize: 14, fontWeight: '600' }}>{label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 12, gap: 10 }}>
        {loading ? (
          <ActivityIndicator color={t.ink} style={{ paddingVertical: 40 }} />
        ) : list.length === 0 ? (
          <Text style={{ paddingVertical: 40, textAlign: 'center', color: t.fg3, fontSize: 14 }}>Rien ici pour l'instant.</Text>
        ) : list.map((r) => {
          return (
            <Pressable key={r.id} onPress={() => router.push(`/(app)/booking/detail/${r.id}`)} style={{
              padding: 14, borderRadius: 12, borderWidth: 1, borderColor: t.lineSoft, backgroundColor: t.paper, gap: 10,
            }}>
              <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                <Avatar name={r.service} size={42} />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: '600', color: t.ink, flexShrink: 1 }}>{r.service}</Text>
                    <Badge tone={r.tone}>{r.statusLabel}</Badge>
                  </View>
                  <Text style={{ fontSize: 13, color: t.fg2, marginTop: 2 }}>{r.date}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, paddingTop: 10, borderTopWidth: 1, borderTopColor: t.lineSoft }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Icon name="calendar" size={12} color={t.fg2} />
                  <Text style={{ fontSize: 12, color: t.fg2 }}>{r.date}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Icon name="map-pin" size={12} color={t.fg2} />
                  <Text style={{ fontSize: 12, color: t.fg2 }}>{r.address}</Text>
                </View>
                <Text style={{ marginLeft: 'auto', fontSize: 13, color: t.ink, fontWeight: '600' }}>{fmtFcfa(r.price)}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
