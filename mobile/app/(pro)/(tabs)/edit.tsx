import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../lib/theme';
import { useRole } from '../../../lib/role';
import { useAuth } from '../../../lib/auth';
import { AppHeader, Avatar, Button, Icon, PortfolioTile, SectionTitle, ToggleSwitch } from '../../../components/ui';

export default function ProEdit() {
  const router = useRouter();
  const { t } = useTheme();
  const { role, toggle } = useRole();
  const { signOut } = useAuth();
  const [zones, setZones] = useState(['Cocody', 'Riviera 2', 'Angré']);
  const [available, setAvailable] = useState(true);
  const [services, setServices] = useState([
    { title: 'Dépannage fuite urgent', price: '15 000', durationMin: 90, active: true },
    { title: 'Installation chauffe-eau', price: '45 000', durationMin: 180, active: true },
    { title: 'Débouchage canalisation', price: '18 000', durationMin: 60, active: false },
  ]);

  const switchRole = () => {
    toggle();
    router.replace(role === 'pro' ? '/(app)' : '/(pro)');
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.paperSoft }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <AppHeader title="Mon profil artisan" right={
        <Pressable hitSlop={8}><Text style={{ fontSize: 14, fontWeight: '600', color: t.link }}>Voir</Text></Pressable>
      } />

      <View style={{ backgroundColor: t.paper }}>
        <View style={{ height: 100, backgroundColor: t.accent }} />
        <View style={{ paddingHorizontal: 20, paddingBottom: 16, marginTop: -40 }}>
          <Avatar name="Moussa Diallo" size={80} accent image="https://i.pravatar.cc/300?img=12" />
          <View style={{ marginTop: 10 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: t.ink, fontFamily: 'RobotoMono_700Bold', textTransform: 'uppercase', letterSpacing: -0.5 }}>Plomberie Moussa</Text>
            <Text style={{ fontSize: 13, color: t.fg2, marginTop: 2 }}>Moussa Diallo · Plomberie, Électricité</Text>
          </View>
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
        <View style={{ backgroundColor: t.paper, borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: t.lineSoft }}>
          <View style={{ width: 36, height: 36, borderRadius: 999, backgroundColor: available ? t.successBg : t.paperSoft, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="circle-check" size={18} color={available ? t.success : t.fg2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: t.ink }}>{available ? "Disponible aujourd'hui" : 'Indisponible'}</Text>
            <Text style={{ fontSize: 12, color: t.fg2, marginTop: 2 }}>{available ? 'Tu reçois des nouvelles demandes' : 'Tu ne reçois plus de nouvelles demandes'}</Text>
          </View>
          <ToggleSwitch on={available} onChange={setAvailable} />
        </View>
      </View>

      <SectionTitle title="Présentation" right={<Text style={{ fontSize: 13, color: t.link }}>Modifier</Text>} />
      <View style={{ paddingHorizontal: 20 }}>
        <View style={{ backgroundColor: t.paper, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: t.lineSoft }}>
          <Text style={{ fontSize: 14, color: t.ink, lineHeight: 21 }}>
            Plombier certifié, interventions rapides à Abidjan. 12 ans d'expérience, équipe de 3 personnes, devis gratuit.
          </Text>
        </View>
      </View>

      <SectionTitle title="Services & tarifs" right={
        <Pressable hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
          <Icon name="plus" size={14} color={t.link} />
          <Text style={{ color: t.link, fontSize: 13, fontWeight: '500' }}>Ajouter</Text>
        </Pressable>
      } />
      <View style={{ paddingHorizontal: 20, gap: 8 }}>
        {services.map((s, i) => (
          <View key={i} style={{ backgroundColor: t.paper, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: t.lineSoft, flexDirection: 'row', alignItems: 'center', gap: 12, opacity: s.active ? 1 : 0.55 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: t.ink }}>{s.title}</Text>
              <Text style={{ fontSize: 12, color: t.fg2, marginTop: 2 }}>{s.price} FCFA · {s.durationMin} min</Text>
            </View>
            <ToggleSwitch on={s.active} onChange={(v) => {
              const copy = [...services]; copy[i] = { ...copy[i], active: v }; setServices(copy);
            }} />
          </View>
        ))}
      </View>

      <SectionTitle title="Zones d'intervention" />
      <View style={{ paddingHorizontal: 20 }}>
        <View style={{ backgroundColor: t.paper, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: t.lineSoft, flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {zones.map((z) => (
            <View key={z} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: t.paperSoft }}>
              <Text style={{ fontSize: 13, color: t.ink, fontWeight: '500' }}>{z}</Text>
              <Pressable hitSlop={6} onPress={() => setZones((zs) => zs.filter((x) => x !== z))}>
                <Icon name="x" size={12} color={t.fg2} />
              </Pressable>
            </View>
          ))}
          <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderStyle: 'dashed', borderColor: t.line }}>
            <Icon name="plus" size={12} color={t.fg2} />
            <Text style={{ fontSize: 13, color: t.fg2, fontWeight: '500' }}>Ajouter une zone</Text>
          </Pressable>
        </View>
        <Text style={{ fontSize: 12, color: t.fg2, marginTop: 8, paddingLeft: 4 }}>Rayon de 8 km autour des zones sélectionnées.</Text>
      </View>

      <SectionTitle title="Réalisations · 6 photos" right={<Text style={{ fontSize: 13, color: t.link, fontWeight: '500' }}>Gérer</Text>} />
      <View style={{ paddingHorizontal: 20, flexDirection: 'row', flexWrap: 'wrap' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <View key={i} style={{ width: '25%', padding: 3 }}>
            <PortfolioTile tag="Plomberie" />
          </View>
        ))}
        <View style={{ width: '25%', padding: 3 }}>
          <View style={{ aspectRatio: 1, borderRadius: 10, backgroundColor: t.paperSoft, borderWidth: 1.5, borderStyle: 'dashed', borderColor: t.line, alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <Icon name="plus" size={20} color={t.fg2} />
            <Text style={{ fontSize: 9, color: t.fg2 }}>Ajouter</Text>
          </View>
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 24, gap: 10 }}>
        <Button variant="outline" onPress={switchRole}>Passer en mode client</Button>
        <Button variant="danger" onPress={signOut}>Se déconnecter</Button>
      </View>
    </ScrollView>
  );
}
