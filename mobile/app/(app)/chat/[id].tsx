import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../../lib/theme';
import { fmtFcfa } from '../../../lib/mock-data';
import { useAuth } from '../../../lib/auth';
import {
  fetchConversationContext, fetchMessages, sendMessage, markMessagesRead, subscribeMessages, acceptQuote,
  type ChatMsg, type ConversationContext,
} from '../../../lib/api';
import { Avatar, Icon } from '../../../components/ui';

export default function Chat() {
  const router = useRouter();
  const { t } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const myId = session?.user.id ?? '';
  const [ctx, setCtx] = useState<ConversationContext | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView | null>(null);

  const refreshCtx = () => { if (id && myId) fetchConversationContext(id, myId).then(setCtx).catch(() => {}); };

  useEffect(() => {
    if (!id || !myId) return;
    setLoading(true);
    Promise.all([fetchConversationContext(id, myId), fetchMessages(id)])
      .then(([c, m]) => { setCtx(c); setMessages(m); })
      .catch(() => {})
      .finally(() => setLoading(false));
    markMessagesRead(id, myId).catch(() => {});
    const unsub = subscribeMessages(id, (m) => {
      setMessages((prev) => prev.some((x) => x.id === m.id) ? prev : [...prev, m]);
      if (m.senderId !== myId) markMessagesRead(id, myId).catch(() => {});
    });
    return unsub;
  }, [id, myId]);

  const send = async () => {
    const body = text.trim();
    if (!body || !id || !myId || sending) return;
    setText('');
    setSending(true);
    try {
      const m = await sendMessage(id, myId, body);
      setMessages((prev) => prev.some((x) => x.id === m.id) ? prev : [...prev, m]);
    } catch (e) {
      setText(body);
      Alert.alert('Erreur', e instanceof Error ? e.message : "Message non envoyé.");
    } finally {
      setSending(false);
    }
  };

  const onAcceptQuote = async () => {
    if (!ctx) return;
    try { await acceptQuote(ctx.bookingId); refreshCtx(); }
    catch (e) { Alert.alert('Erreur', e instanceof Error ? e.message : 'Action impossible.'); }
  };

  const showQuoteBanner = ctx?.amClient && ctx.status === 'quoted' && ctx.quotedPrice != null;

  return (
    <View style={{ flex: 1, backgroundColor: t.paper }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingTop: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: t.lineSoft }}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Icon name="chevron-left" size={28} color={t.ink} />
        </Pressable>
        <Avatar name={ctx?.otherName ?? ''} size={32} image={ctx?.otherAvatar || undefined} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: t.ink }}>{ctx?.otherName ?? '…'}</Text>
        </View>
      </View>

      {showQuoteBanner && (
        <Pressable onPress={onAcceptQuote} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: t.accentSoft }}>
          <Icon name="file-text" size={18} color={t.accentInk} />
          <Text style={{ flex: 1, color: t.accentInk, fontSize: 13, fontWeight: '600' }}>Devis reçu · {fmtFcfa(ctx!.quotedPrice!)}</Text>
          <View style={{ backgroundColor: t.accent, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>Accepter</Text>
          </View>
        </Pressable>
      )}

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1, backgroundColor: t.paperSoft }}
        contentContainerStyle={{ padding: 14, gap: 6 }}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
        {loading ? (
          <ActivityIndicator color={t.ink} style={{ marginTop: 30 }} />
        ) : messages.length === 0 ? (
          <Text style={{ textAlign: 'center', color: t.fg3, fontSize: 13, marginTop: 30 }}>Démarre la conversation.</Text>
        ) : messages.map((m) => {
          const mine = m.senderId === myId;
          return (
            <View key={m.id} style={{
              alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '78%',
              backgroundColor: mine ? t.ink : t.paper,
              paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14,
            }}>
              <Text style={{ color: mine ? t.paper : t.ink, fontSize: 14, lineHeight: 19 }}>{m.body}</Text>
            </View>
          );
        })}
      </ScrollView>

      <View style={{ paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: t.lineSoft, backgroundColor: t.paper, flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
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
    </View>
  );
}
