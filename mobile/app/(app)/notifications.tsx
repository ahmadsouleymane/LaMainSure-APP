import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../lib/theme';
import { fetchNotifications, markAllNotificationsRead, type AppNotification } from '../../lib/api';
import { AppHeader, Icon } from '../../components/ui';

const ICON: Record<string, string> = {
  message: 'message-circle', booking_status: 'clipboard-list', review: 'star', reminder: 'clock', system: 'bell',
};

export default function Notifications() {
  const router = useRouter();
  const { t } = useTheme();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchNotifications().then((n) => { setItems(n); markAllNotificationsRead().catch(() => {}); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: t.paper }}>
      <AppHeader title="Notifications" onBack={() => router.back()} />
      {loading ? (
        <ActivityIndicator color={t.ink} style={{ marginTop: 40 }} />
      ) : items.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 40 }}>
          <Icon name="bell" size={28} color={t.fg3} />
          <Text style={{ color: t.fg2, fontSize: 14, textAlign: 'center' }}>Aucune notification pour l'instant.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingVertical: 8 }} showsVerticalScrollIndicator={false}>
          {items.map((n, i) => (
            <View key={n.id} style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingVertical: 14, borderTopWidth: i > 0 ? 1 : 0, borderTopColor: t.lineSoft, backgroundColor: n.read ? t.paper : t.paperSoft }}>
              <View style={{ width: 38, height: 38, borderRadius: 999, backgroundColor: t.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={ICON[n.kind] ?? 'bell'} size={18} color={t.accentInk} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: t.ink, flex: 1 }}>{n.title}</Text>
                  <Text style={{ fontSize: 11, color: t.fg3 }}>{n.createdAt}</Text>
                </View>
                {n.body ? <Text style={{ fontSize: 13, color: t.fg2, marginTop: 2, lineHeight: 18 }}>{n.body}</Text> : null}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
