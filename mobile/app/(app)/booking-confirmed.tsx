import { Pressable, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../lib/theme';
import { PROS } from '../../lib/mock-data';
import { Button, Display, Icon } from '../../components/ui';

export default function BookingConfirmed() {
  const router = useRouter();
  const { t } = useTheme();
  const { proId, slot, service } = useLocalSearchParams<{ proId?: string; slot?: string; service?: string }>();
  const pro = PROS.find((p) => p.id === proId);

  return (
    <View style={{ flex: 1, backgroundColor: t.paper, padding: 24, paddingBottom: 40, justifyContent: 'center', alignItems: 'center', gap: 14 }}>
      <View style={{ width: 80, height: 80, borderRadius: 999, backgroundColor: t.successBg, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="check" size={36} color={t.success} />
      </View>
      <Display size={24}>Réservation envoyée</Display>
      <Text style={{ fontSize: 15, color: t.fg2, lineHeight: 22, textAlign: 'center' }}>
        {pro?.name || "L'artisan"} a reçu ta demande pour confirmer. Tu recevras une notification dès qu'il accepte.
      </Text>
      {service ? (
        <View style={{ marginTop: 8, padding: 14, backgroundColor: t.paperSoft, borderRadius: 12, alignSelf: 'stretch' }}>
          <Row k="Service" v={service} />
          {slot ? <Row k="Créneau" v={slot} /> : null}
          {pro ? <Row k="Artisan" v={pro.name} /> : null}
        </View>
      ) : null}
      <View style={{ alignSelf: 'stretch', gap: 10, marginTop: 8 }}>
        <Button onPress={() => router.replace('/(app)/chat/c1')}>Envoyer un message</Button>
        <Pressable onPress={() => router.replace('/(app)/(tabs)')}>
          <Text style={{ color: t.link, fontSize: 14, textAlign: 'center', paddingVertical: 8 }}>Retour à l'accueil</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  const { t } = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
      <Text style={{ color: t.fg2, fontSize: 14 }}>{k}</Text>
      <Text style={{ color: t.ink, fontSize: 14, fontWeight: '500' }}>{v}</Text>
    </View>
  );
}
