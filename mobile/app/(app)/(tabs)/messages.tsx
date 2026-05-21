import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../lib/theme';
import { CONVERSATIONS, PROS } from '../../../lib/mock-data';
import { Avatar, Display } from '../../../components/ui';

export default function Messages() {
  const router = useRouter();
  const { t } = useTheme();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.paper }} contentContainerStyle={{ paddingTop: 8 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 }}>
        <Display size={26}>Messages</Display>
      </View>
      <View>
        {CONVERSATIONS.map((c, i) => {
          const pro = PROS.find((p) => p.id === c.proId)!;
          return (
            <Pressable key={c.id} onPress={() => router.push(`/(app)/chat/${c.id}`)} style={{
              flexDirection: 'row', gap: 12, paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center',
              borderTopWidth: i > 0 ? 1 : 0, borderTopColor: t.lineSoft,
            }}>
              <Avatar name={pro.fullName} size={48} accent={pro.accent} image={pro.avatar} />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 15, fontWeight: c.unread ? '700' : '600', color: t.ink }}>{c.proName}</Text>
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
          );
        })}
      </View>
    </ScrollView>
  );
}
