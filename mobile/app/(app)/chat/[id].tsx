import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../../lib/theme';
import { CONVERSATIONS, MESSAGES_C1, PROS, type ChatMessage } from '../../../lib/mock-data';
import { Avatar, Icon } from '../../../components/ui';

export default function Chat() {
  const router = useRouter();
  const { t } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const conv = CONVERSATIONS.find((c) => c.id === id) || CONVERSATIONS[0];
  const pro = PROS.find((p) => p.id === conv.proId)!;
  const [messages, setMessages] = useState<ChatMessage[]>(MESSAGES_C1);
  const [text, setText] = useState('');

  const send = () => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { id: Date.now(), from: 'me', text: text.trim(), time: 'maintenant' }]);
    setText('');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: t.paper }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingTop: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: t.lineSoft }}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Icon name="chevron-left" size={28} color={t.ink} />
        </Pressable>
        <Avatar name={pro.fullName} size={32} accent={pro.accent} image={pro.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: t.ink }}>{pro.name}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: t.success }} />
            <Text style={{ fontSize: 11, color: t.success }}>en ligne</Text>
          </View>
        </View>
        <Pressable hitSlop={8}><Icon name="more-horizontal" size={22} color={t.ink} /></Pressable>
      </View>

      <ScrollView style={{ flex: 1, backgroundColor: t.paperSoft }} contentContainerStyle={{ padding: 14, gap: 6 }}>
        <View style={{ alignSelf: 'center', backgroundColor: t.paper, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, marginBottom: 6 }}>
          <Text style={{ fontSize: 11, color: t.fg3 }}>Aujourd'hui · 11:30</Text>
        </View>
        {messages.map((m) => {
          const mine = m.from === 'me';
          return (
            <View key={m.id} style={{
              alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '78%',
              backgroundColor: mine ? t.ink : t.paper,
              paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14,
            }}>
              <Text style={{ color: mine ? t.paper : t.ink, fontSize: 14, lineHeight: 19 }}>{m.text}</Text>
            </View>
          );
        })}
      </ScrollView>

      <View style={{ paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: t.lineSoft, backgroundColor: t.paper, flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
        <Pressable style={{ width: 38, height: 38, borderRadius: 999, backgroundColor: t.paperSoft, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="plus" size={20} color={t.ink} />
        </Pressable>
        <TextInput value={text} onChangeText={setText} onSubmitEditing={send} placeholder="Message" placeholderTextColor={t.fg3}
          style={{ flex: 1, borderWidth: 1, borderColor: t.line, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: t.ink, backgroundColor: t.paper }} />
        <Pressable onPress={send} style={{
          width: 38, height: 38, borderRadius: 999,
          backgroundColor: text.trim() ? t.ink : t.paperSoft,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="send" size={18} color={text.trim() ? t.paper : t.fg3} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
