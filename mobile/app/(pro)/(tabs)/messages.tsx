import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme, fonts } from '../../../lib/theme';
import { PRO_CONVERSATIONS } from '../../../lib/mock-data';
import { Display, Icon } from '../../../components/ui';

export default function ProMessages() {
  const router = useRouter();
  const { t } = useTheme();
  const [query, setQuery] = useState('');
  const unreadTotal = PRO_CONVERSATIONS.reduce((a, c) => a + c.unread, 0);

  const list = PRO_CONVERSATIONS.filter((c) =>
    !query || c.clientName.toLowerCase().includes(query.toLowerCase()) || c.service.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.paper }} contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Display size={26}>Messages</Display>
          {unreadTotal > 0 && (
            <Text style={{ fontSize: 12, color: t.fg2, marginTop: 4 }}>
              {unreadTotal} message{unreadTotal > 1 ? 's' : ''} non lu{unreadTotal > 1 ? 's' : ''}
            </Text>
          )}
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: t.paperSoft }}>
          <Icon name="search" size={18} color={t.fg2} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Rechercher un client ou un service…"
            placeholderTextColor={t.fg3}
            style={{ flex: 1, fontSize: 15, fontFamily: fonts.sansRegular, color: t.ink, paddingVertical: 2 }}
          />
        </View>
      </View>

      <View>
        {list.length === 0 ? (
          <View style={{ paddingVertical: 60, alignItems: 'center', gap: 8 }}>
            <View style={{ width: 56, height: 56, borderRadius: 999, backgroundColor: t.paperSoft, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="message-circle" size={26} color={t.fg3} />
            </View>
            <Text style={{ color: t.fg2, fontSize: 14 }}>Aucune conversation.</Text>
          </View>
        ) : list.map((c, i) => (
          <Pressable
            key={c.id}
            onPress={() => router.push(`/(app)/chat/c1`)}
            style={({ pressed }) => ({
              flexDirection: 'row', gap: 12, paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center',
              borderTopWidth: i > 0 ? 1 : 0, borderTopColor: t.lineSoft,
              backgroundColor: pressed ? t.paperSoft : t.paper,
            })}>
            <View style={{ width: 48, height: 48, borderRadius: 999, backgroundColor: c.unread > 0 ? t.accent : t.paperSoft, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 15, fontFamily: fonts.sansBold, color: c.unread > 0 ? '#fff' : t.ink }}>{c.clientInitials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text numberOfLines={1} style={{ fontSize: 15, fontFamily: c.unread > 0 ? fonts.sansBold : fonts.sansSemibold, color: t.ink, flexShrink: 1 }}>
                  {c.clientName}
                </Text>
                <Text style={{ fontSize: 12, color: c.unread > 0 ? t.ink : t.fg3, fontFamily: c.unread > 0 ? fonts.sansSemibold : fonts.sansRegular, marginLeft: 8 }}>
                  {c.time}
                </Text>
              </View>
              <Text style={{ fontSize: 11, color: t.accent, fontFamily: fonts.sansMedium, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                {c.service}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 8 }}>
                <Text numberOfLines={1} style={{ flex: 1, fontSize: 14, color: c.unread > 0 ? t.ink : t.fg2, fontFamily: c.unread > 0 ? fonts.sansMedium : fonts.sansRegular }}>
                  {c.lastMessage}
                </Text>
                {c.unread > 0 && (
                  <View style={{ backgroundColor: t.accent, paddingHorizontal: 7, minWidth: 20, height: 20, borderRadius: 999, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#fff', fontSize: 11, fontFamily: fonts.sansBold }}>{c.unread}</Text>
                  </View>
                )}
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
