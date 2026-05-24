import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTheme } from '../../../lib/theme';
import { useAuth } from '../../../lib/auth';
import { fetchConversations, type ConversationSummary } from '../../../lib/api';
import { Avatar, Display } from '../../../components/ui';

export default function Messages() {
  const router = useRouter();
  const { t } = useTheme();
  const { session } = useAuth();
  const myId = session?.user.id ?? '';
  const [convs, setConvs] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    if (!myId) return;
    let alive = true;
    setLoading(true);
    fetchConversations(myId).then((c) => { if (alive) setConvs(c); }).catch(() => {}).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [myId]));

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.paper }} contentContainerStyle={{ paddingTop: 8 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 }}>
        <Display size={26}>Messages</Display>
      </View>
      {loading ? (
        <ActivityIndicator color={t.ink} style={{ marginTop: 40 }} />
      ) : convs.length === 0 ? (
        <Text style={{ paddingHorizontal: 20, paddingVertical: 40, textAlign: 'center', color: t.fg3, fontSize: 14 }}>Aucune conversation pour l'instant.</Text>
      ) : (
        <View>
          {convs.map((c, i) => (
            <Pressable key={c.id} onPress={() => router.push(`/(app)/chat/${c.id}`)} style={{
              flexDirection: 'row', gap: 12, paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center',
              borderTopWidth: i > 0 ? 1 : 0, borderTopColor: t.lineSoft,
            }}>
              <Avatar name={c.otherName} size={48} image={c.otherAvatar || undefined} />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 15, fontWeight: c.unread ? '700' : '600', color: t.ink }}>{c.otherName}</Text>
                  <Text style={{ fontSize: 12, color: c.unread ? t.ink : t.fg3, fontWeight: c.unread ? '600' : '400' }}>{c.time}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: 8 }}>
                  <Text numberOfLines={1} style={{ flex: 1, fontSize: 14, color: c.unread ? t.ink : t.fg2, fontWeight: c.unread ? '500' : '400' }}>{c.lastMessage}</Text>
                  {c.unread > 0 && (
                    <View style={{ backgroundColor: t.accent, paddingHorizontal: 7, minWidth: 18, height: 18, borderRadius: 999, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>{c.unread}</Text>
                    </View>
                  )}
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
