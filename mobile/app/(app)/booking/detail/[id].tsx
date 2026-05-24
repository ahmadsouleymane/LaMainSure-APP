import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../../../lib/theme';
import { fmtFcfa } from '../../../../lib/mock-data';
import { fetchBooking, acceptQuote, cancelBooking, type BookingDetail } from '../../../../lib/api';
import { AppHeader, Avatar, Badge, Button, Icon, SectionTitle } from '../../../../components/ui';

const STATUS_LABEL: Record<string, { label: string; tone: 'success' | 'warning' | 'info' | 'neutral' | 'danger' }> = {
  requested: { label: 'En attente de devis', tone: 'warning' },
  quoted: { label: 'Devis reçu', tone: 'info' },
  accepted: { label: 'Confirmée', tone: 'success' },
  in_progress: { label: 'En cours', tone: 'info' },
  completed: { label: 'Terminée', tone: 'neutral' },
  cancelled: { label: 'Annulée', tone: 'danger' },
  disputed: { label: 'Litige', tone: 'danger' },
};

export default function BookingDetailScreen() {
  const router = useRouter();
  const { t } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [b, setB] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    if (!id) return;
    setLoading(true);
    fetchBooking(id).then(setB).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onAccept = async () => {
    if (!b || busy) return;
    setBusy(true);
    try { await acceptQuote(b.id); load(); }
    catch (e) { Alert.alert('Erreur', e instanceof Error ? e.message : 'Action impossible.'); }
    finally { setBusy(false); }
  };

  const onCancel = () => {
    if (!b) return;
    Alert.alert('Annuler la demande', 'Confirmer l\'annulation ?', [
      { text: 'Retour', style: 'cancel' },
      { text: 'Annuler la demande', style: 'destructive', onPress: async () => {
        setBusy(true);
        try { await cancelBooking(b.id); load(); }
        catch (e) { Alert.alert('Erreur', e instanceof Error ? e.message : 'Action impossible.'); }
        finally { setBusy(false); }
      } },
    ]);
  };

  if (loading || !b) {
    return (
      <View style={{ flex: 1, backgroundColor: t.paper }}>
        <AppHeader title="Demande" onBack={() => router.back()} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          {loading ? <ActivityIndicator color={t.ink} /> : <Text style={{ color: t.fg2 }}>Demande introuvable.</Text>}
        </View>
      </View>
    );
  }

  const st = STATUS_LABEL[b.status] ?? STATUS_LABEL.requested;
  const price = b.finalPrice ?? b.quotedPrice;
  const canAccept = b.status === 'quoted';
  const canCancel = ['requested', 'quoted', 'accepted'].includes(b.status);

  return (
    <View style={{ flex: 1, backgroundColor: t.paper }}>
      <AppHeader title="Demande" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 20, paddingTop: 8, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar name={b.proName} size={48} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: t.ink }}>{b.proName}</Text>
            <Text style={{ fontSize: 13, color: t.fg2 }}>{b.service}</Text>
          </View>
          <Badge tone={st.tone}>{st.label}</Badge>
        </View>

        <SectionTitle title="Détails" />
        <View style={{ paddingHorizontal: 20, gap: 10 }}>
          <Text style={{ fontSize: 14, color: t.ink, lineHeight: 21 }}>{b.description}</Text>
          <Row icon="map-pin" text={b.address} />
          {b.scheduledAt ? <Row icon="calendar" text={new Date(b.scheduledAt).toLocaleString('fr-FR')} /> : null}
          <Row icon="clock" text={`Créée ${b.createdAt}`} />
        </View>

        {price != null && (
          <>
            <SectionTitle title="Devis" />
            <View style={{ paddingHorizontal: 20 }}>
              <View style={{ backgroundColor: t.paperSoft, borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 14, color: t.fg2 }}>{b.status === 'completed' ? 'Montant final' : 'Montant proposé'}</Text>
                <Text style={{ fontSize: 18, fontWeight: '700', color: t.ink }}>{fmtFcfa(price)}</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <View style={{ flexDirection: 'row', gap: 10, padding: 16, borderTopWidth: 1, borderTopColor: t.lineSoft }}>
        {b.conversationId && (
          <Button variant="outline" style={{ flex: 1 }} onPress={() => router.push(`/(app)/chat/${b.conversationId}`)}>Message</Button>
        )}
        {canAccept && <Button style={{ flex: 1.4 }} loading={busy} onPress={onAccept}>Accepter le devis</Button>}
        {!canAccept && canCancel && <Button variant="danger" style={{ flex: 1 }} loading={busy} onPress={onCancel}>Annuler</Button>}
      </View>
    </View>
  );

  function Row({ icon, text }: { icon: string; text: string }) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Icon name={icon} size={14} color={t.fg2} />
        <Text style={{ fontSize: 13, color: t.fg2, flex: 1 }}>{text}</Text>
      </View>
    );
  }
}
