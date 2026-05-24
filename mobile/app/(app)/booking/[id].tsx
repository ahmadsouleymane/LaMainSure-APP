import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../../lib/theme';
import { fmtFcfa, type Pro } from '../../../lib/mock-data';
import { fetchProDetail, createBooking } from '../../../lib/api';
import { useUserLocation } from '../../../lib/location';
import { useProfile } from '../../../lib/profile';
import { AppHeader, Button, SectionTitle } from '../../../components/ui';

export default function Booking() {
  const router = useRouter();
  const { t } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const location = useUserLocation();
  const { profile } = useProfile();
  const [pro, setPro] = useState<Pro | null>(null);
  const [serviceIdx, setServiceIdx] = useState(0);
  const [slotIdx, setSlotIdx] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (id) fetchProDetail(id).then(setPro).catch(() => {}); }, [id]);

  if (!pro) {
    return (
      <View style={{ flex: 1, backgroundColor: t.paper }}>
        <AppHeader title="Réserver" onBack={() => router.back()} />
        <ActivityIndicator color={t.ink} style={{ marginTop: 40 }} />
      </View>
    );
  }

  const svc = pro.services[serviceIdx];
  const hasSlots = pro.availability.length > 0;
  const canSubmit = hasSlots ? slotIdx != null : true;

  const submit = async () => {
    if (submitting || !canSubmit) return;
    setSubmitting(true);
    try {
      await createBooking({
        proId: pro.id,
        description: `Réservation : ${svc.title}${slotIdx != null ? ` · ${pro.availability[slotIdx]}` : ''}`,
        address: profile?.city ?? null,
        coords: location.coords,
      });
      router.replace({ pathname: '/(app)/booking-confirmed', params: { proId: pro.id, slot: slotIdx != null ? pro.availability[slotIdx] : '', service: svc.title, price: String(svc.price) } });
    } catch (e) {
      Alert.alert('Erreur', e instanceof Error ? e.message : 'Réservation impossible.');
      setSubmitting(false);
    }
  };

  const summaryRow = (k: string, v: string, bold?: boolean) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 }}>
      <Text style={{ color: bold ? t.ink : t.fg2, fontSize: bold ? 16 : 14, fontWeight: bold ? '600' : '400' }}>{k}</Text>
      <Text style={{ color: t.ink, fontSize: bold ? 16 : 14, fontWeight: bold ? '700' : '500', textAlign: 'right' }}>{v}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: t.paper }}>
      <AppHeader title="Réserver" onBack={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <SectionTitle title="Service" />
        <View style={{ paddingHorizontal: 20, gap: 8 }}>
          {pro.services.map((s, i) => (
            <Pressable key={i} onPress={() => setServiceIdx(i)} style={{
              padding: 14, borderRadius: 12, backgroundColor: t.paper,
              borderWidth: 1.5, borderColor: i === serviceIdx ? t.ink : t.lineSoft,
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: t.ink, flex: 1 }}>{s.title}</Text>
                <Text style={{ fontSize: 15, fontWeight: '600', color: t.ink }}>{fmtFcfa(s.price)}</Text>
              </View>
              <Text style={{ fontSize: 13, color: t.fg2, marginTop: 4 }}>{s.desc}</Text>
            </Pressable>
          ))}
        </View>

        {hasSlots && <SectionTitle title="Créneau" />}
        <View style={{ paddingHorizontal: 20, flexDirection: 'row', flexWrap: 'wrap' }}>
          {pro.availability.map((slot, i) => (
            <View key={i} style={{ width: '50%', padding: 4 }}>
              <Pressable onPress={() => setSlotIdx(i)} style={{
                paddingVertical: 12, paddingHorizontal: 10, borderRadius: 10,
                borderWidth: 1.5, borderColor: i === slotIdx ? t.ink : t.line,
                backgroundColor: i === slotIdx ? t.ink : t.paper,
                alignItems: 'center',
              }}>
                <Text style={{ color: i === slotIdx ? t.paper : t.ink, fontSize: 13, fontWeight: '600' }}>{slot}</Text>
              </Pressable>
            </View>
          ))}
        </View>

        <SectionTitle title="Récapitulatif" />
        <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
          <View style={{ backgroundColor: t.paperSoft, borderRadius: 12, padding: 14 }}>
            {summaryRow('Service', svc.title)}
            {hasSlots && summaryRow('Créneau', slotIdx != null ? pro.availability[slotIdx] : '—')}
            {summaryRow('Artisan', pro.name)}
            <View style={{ height: 1, backgroundColor: t.line, marginVertical: 10 }} />
            {summaryRow('Total', fmtFcfa(svc.price), true)}
            <Text style={{ fontSize: 12, color: t.fg2, marginTop: 6 }}>Acompte 20 % à la réservation. Solde après la mission.</Text>
          </View>
        </View>
      </ScrollView>

      <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: t.lineSoft, backgroundColor: t.paper }}>
        <Button disabled={!canSubmit} loading={submitting} onPress={submit}>
          {!canSubmit ? 'Choisis un créneau' : svc.price > 0 ? `Payer l'acompte · ${fmtFcfa(Math.round(svc.price * 0.2))}` : 'Envoyer la demande'}
        </Button>
      </View>
    </View>
  );
}
