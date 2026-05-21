import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../../lib/theme';
import { PRO_INBOX, fmtFcfa } from '../../../lib/mock-data';
import { AppHeader, Avatar, Badge, Button, Display, Icon, PortfolioTile, SectionTitle } from '../../../components/ui';

export default function DemandeDetail() {
  const router = useRouter();
  const { t } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const d = PRO_INBOX.find((x) => x.id === id) || PRO_INBOX[0];

  const [view, setView] = useState<'detail' | 'propose'>('detail');
  const [price, setPrice] = useState(d.service.includes('chauffe-eau') ? '45000' : '20000');
  const [eta, setEta] = useState("Aujourd'hui · 14:00");
  const [note, setNote] = useState('');

  if (view === 'propose') {
    return (
      <View style={{ flex: 1, backgroundColor: t.paper }}>
        <AppHeader title="Proposer un devis" onBack={() => setView('detail')} />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
          <View style={{ paddingHorizontal: 20, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Avatar name={d.clientName} size={40} image={d.clientAvatar} />
            <View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: t.ink }}>{d.clientName}</Text>
              <Text style={{ fontSize: 12, color: t.fg2 }}>{d.service}</Text>
            </View>
          </View>

          <SectionTitle title="Montant proposé" />
          <View style={{ paddingHorizontal: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderColor: t.ink, backgroundColor: t.paper }}>
              <TextInput value={price} onChangeText={setPrice} keyboardType="numeric"
                style={{ flex: 1, fontSize: 20, fontWeight: '700', color: t.ink, fontFamily: 'RobotoMono_700Bold' }} />
              <Text style={{ fontSize: 14, color: t.fg2, fontWeight: '500' }}>FCFA</Text>
            </View>
            <Text style={{ fontSize: 12, color: t.fg2, marginTop: 6 }}>
              Tu reçois {fmtFcfa(Math.round(Number(price) * 0.85))} après la commission (15%).
            </Text>
          </View>

          <SectionTitle title="Disponibilité proposée" />
          <View style={{ paddingHorizontal: 20, flexDirection: 'row', flexWrap: 'wrap' }}>
            {["Aujourd'hui · 14:00", "Aujourd'hui · 16:30", 'Demain · 09:00', 'Demain · 14:00'].map((slot) => (
              <View key={slot} style={{ width: '50%', padding: 4 }}>
                <Pressable onPress={() => setEta(slot)} style={{
                  paddingVertical: 12, paddingHorizontal: 10, borderRadius: 10,
                  borderWidth: 1.5, borderColor: eta === slot ? t.ink : t.line,
                  backgroundColor: eta === slot ? t.ink : t.paper,
                  alignItems: 'center',
                }}>
                  <Text style={{ color: eta === slot ? t.paper : t.ink, fontSize: 13, fontWeight: '600' }}>{slot}</Text>
                </Pressable>
              </View>
            ))}
          </View>

          <SectionTitle title="Message (optionnel)" />
          <View style={{ paddingHorizontal: 20 }}>
            <TextInput value={note} onChangeText={setNote} multiline
              placeholder="Précisions sur l'intervention, ce qui est inclus, conditions…" placeholderTextColor={t.fg3}
              style={{ borderWidth: 1, borderColor: t.line, borderRadius: 10, padding: 14, fontSize: 15, color: t.ink, backgroundColor: t.paper, minHeight: 90, textAlignVertical: 'top' }} />
          </View>
        </ScrollView>

        <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: t.lineSoft, backgroundColor: t.paper }}>
          <Button onPress={() => router.back()}>Envoyer le devis</Button>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.paper }}>
      <AppHeader title="Demande" onBack={() => router.back()} right={
        <Pressable hitSlop={8}><Icon name="message-circle" size={22} color={t.ink} /></Pressable>
      } />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ paddingHorizontal: 20, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar name={d.clientName} size={56} image={d.clientAvatar} />
          <View style={{ flex: 1 }}>
            <Display size={20}>{d.clientName}</Display>
            <Text style={{ fontSize: 12, color: t.fg2, marginTop: 2 }}>{d.createdAt}</Text>
          </View>
          {d.urgency ? <Badge tone="danger">{d.urgency}</Badge> : null}
        </View>

        <SectionTitle title="Service demandé" />
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: t.ink }}>{d.service}</Text>
        </View>

        <SectionTitle title="Description" />
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 14, color: t.ink, lineHeight: 22 }}>{d.description}</Text>
        </View>

        {d.photos > 0 && (
          <>
            <SectionTitle title={`Photos · ${d.photos}`} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}>
              {Array.from({ length: d.photos }).map((_, i) => (
                <PortfolioTile key={i} tag="Plomberie" size={120} />
              ))}
            </ScrollView>
          </>
        )}

        <SectionTitle title="Détails" />
        <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
          <View style={{ backgroundColor: t.paperSoft, borderRadius: 12, padding: 14, gap: 10 }}>
            <DetailRow icon="map-pin" k="Adresse" v={d.address} />
            <DetailRow icon="wallet" k="Budget" v={d.budget} />
            <DetailRow icon="clock" k="Reçue" v={d.createdAt} />
          </View>
        </View>
      </ScrollView>

      <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: t.lineSoft, backgroundColor: t.paper, gap: 8 }}>
        <Button onPress={() => router.back()}>Accepter</Button>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button variant="outline" onPress={() => setView('propose')} style={{ flex: 1 }}>Proposer un devis</Button>
          <Button variant="ghost" onPress={() => router.back()} style={{ flex: 1 }}>Refuser</Button>
        </View>
      </View>
    </View>
  );
}

function DetailRow({ icon, k, v }: { icon: string; k: string; v: string }) {
  const { t } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
      <Icon name={icon} size={16} color={t.fg2} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 11, color: t.fg2, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.4 }}>{k}</Text>
        <Text style={{ fontSize: 14, color: t.ink, marginTop: 2 }}>{v}</Text>
      </View>
    </View>
  );
}
