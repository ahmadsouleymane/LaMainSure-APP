import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTheme, fonts } from '../../../lib/theme';
import { fetchProInbox, type ProInbox } from '../../../lib/api';
import { Avatar, Badge, Display, Icon } from '../../../components/ui';

type Filter = 'all' | 'new' | 'pending';

export default function ProDemandes() {
  const router = useRouter();
  const { t } = useTheme();
  const [filter, setFilter] = useState<Filter>('all');
  const [inbox, setInbox] = useState<ProInbox[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    let alive = true;
    setLoading(true);
    fetchProInbox().then((x) => { if (alive) setInbox(x); }).catch(() => {}).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []));

  const counts = {
    all: inbox.length,
    new: inbox.filter((d) => d.status === 'new').length,
    pending: inbox.filter((d) => d.status === 'pending').length,
  };
  const list = filter === 'all' ? inbox : inbox.filter((d) => d.status === filter);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.paper }} contentContainerStyle={{ paddingTop: 8, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 }}>
        <Display size={26}>Demandes</Display>
        <Text style={{ fontSize: 13, color: t.fg2, marginTop: 4 }}>
          {counts.new} nouvelle{counts.new > 1 ? 's' : ''} · {counts.pending} en attente
        </Text>
      </View>

      <View style={{ flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: t.lineSoft, gap: 4 }}>
        {([
          { id: 'all', label: `Toutes · ${counts.all}` },
          { id: 'new', label: `Nouvelles · ${counts.new}` },
          { id: 'pending', label: `En attente · ${counts.pending}` },
        ] as const).map((tab) => (
          <Pressable key={tab.id} onPress={() => setFilter(tab.id)} style={{
            paddingHorizontal: 12, paddingVertical: 10,
            borderBottomWidth: 2, borderBottomColor: filter === tab.id ? t.ink : 'transparent',
            marginBottom: -1,
          }}>
            <Text style={{ color: filter === tab.id ? t.ink : t.fg2, fontSize: 13, fontFamily: filter === tab.id ? fonts.sansSemibold : fonts.sansMedium }}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 14, gap: 10 }}>
        {loading ? (
          <ActivityIndicator color={t.ink} style={{ paddingVertical: 50 }} />
        ) : list.length === 0 ? (
          <View style={{ paddingVertical: 60, alignItems: 'center', gap: 8 }}>
            <View style={{ width: 56, height: 56, borderRadius: 999, backgroundColor: t.paperSoft, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="clipboard-list" size={26} color={t.fg3} />
            </View>
            <Text style={{ color: t.fg2, fontSize: 14 }}>Rien dans cette boîte.</Text>
          </View>
        ) : list.map((d) => {
          const isNew = d.status === 'new';
          return (
            <Pressable key={d.id} onPress={() => router.push(`/(pro)/demande/${d.id}`)} style={({ pressed }) => ({
              padding: 14, borderRadius: 12, borderWidth: 1, borderColor: isNew ? t.ink : t.lineSoft,
              backgroundColor: pressed ? t.paperSoft : t.paper, gap: 10,
            })}>
              {isNew && (
                <View style={{ position: 'absolute', top: -8, left: 14, backgroundColor: t.ink, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                  <Text style={{ color: t.paper, fontSize: 9, fontFamily: fonts.sansBold, letterSpacing: 0.5, textTransform: 'uppercase' }}>Nouveau</Text>
                </View>
              )}
              <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <Avatar name={d.clientName} size={40} image={d.clientAvatar} />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <Text numberOfLines={1} style={{ fontSize: 14, fontFamily: fonts.sansSemibold, color: t.ink, flexShrink: 1 }}>{d.clientName}</Text>
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
                {d.photos > 0 && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                    <Icon name="image" size={11} color={t.fg2} />
                    <Text style={{ fontSize: 11, color: t.fg2 }}>{d.photos} photo{d.photos > 1 ? 's' : ''}</Text>
                  </View>
                )}
                {d.urgency ? <Badge tone="danger">{d.urgency}</Badge> : null}
                <Text style={{ marginLeft: 'auto', fontSize: 11, color: t.ink, fontFamily: fonts.sansSemibold }}>{d.budget}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
