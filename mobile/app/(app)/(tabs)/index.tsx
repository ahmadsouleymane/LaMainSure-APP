import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../lib/theme';
import { CATEGORIES, PROS } from '../../../lib/mock-data';
import { Display, Icon, ProCard, SectionTitle } from '../../../components/ui';

export default function ClientHome() {
  const router = useRouter();
  const { t } = useTheme();
  const firstName = 'Aminata';
  const city = 'Abidjan';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.paper }} contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={{ fontSize: 12, color: t.fg2, letterSpacing: 0.2 }}>Bonjour</Text>
          <Display size={22}>{firstName}</Display>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: t.paperSoft, borderRadius: 999 }}>
          <Icon name="map-pin" size={14} color={t.accent} />
          <Text style={{ fontSize: 12, color: t.ink, fontWeight: '500' }}>{city}</Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, paddingVertical: 8 }}>
        <Pressable onPress={() => router.push('/(app)/(tabs)/search')} style={{
          flexDirection: 'row', alignItems: 'center', gap: 10,
          paddingHorizontal: 14, paddingVertical: 12,
          borderRadius: 12, backgroundColor: t.paperSoft,
        }}>
          <Icon name="search" size={18} color={t.fg2} />
          <Text style={{ color: t.fg2, fontSize: 15 }}>Plombier, électricien, designer…</Text>
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: 20, paddingVertical: 4 }}>
        <Pressable onPress={() => router.push('/(app)/(tabs)/requests')} style={{
          backgroundColor: t.accentSoft, borderRadius: 12,
          paddingVertical: 12, paddingHorizontal: 14,
          flexDirection: 'row', alignItems: 'center', gap: 12,
        }}>
          <View style={{ width: 36, height: 36, borderRadius: 999, backgroundColor: t.accent, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="clock" size={18} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: t.accentInk }}>Moussa arrive à 14:00</Text>
            <Text style={{ fontSize: 12, color: t.accentInk, opacity: 0.85, marginTop: 2 }}>Dépannage fuite · Cocody, Riviera 2</Text>
          </View>
          <Icon name="chevron-right" size={18} color={t.accentInk} />
        </Pressable>
      </View>

      <SectionTitle title="Catégories" right={<Text style={{ fontSize: 13, color: t.link }}>Tout voir</Text>} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, paddingVertical: 4 }}>
        {CATEGORIES.slice(1, 9).map((cat) => (
          <View key={cat.slug} style={{ width: '25%', padding: 4 }}>
            <Pressable
              onPress={() => router.push({ pathname: '/(app)/(tabs)/search', params: { cat: cat.slug } })}
              style={{ backgroundColor: t.paper, borderWidth: 1, borderColor: t.lineSoft, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 6, alignItems: 'center', gap: 8 }}>
              <View style={{ height: 38, width: 38, borderRadius: 999, backgroundColor: t.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={cat.icon} size={20} color={t.accentInk} />
              </View>
              <Text style={{ fontSize: 11, color: t.ink, fontWeight: '500', textAlign: 'center' }}>{cat.name}</Text>
            </Pressable>
          </View>
        ))}
      </View>

      <SectionTitle title="Artisans à proximité" right={<Text style={{ fontSize: 13, color: t.link }}>Tout voir</Text>} />
      <View style={{ paddingHorizontal: 20 }}>
        {PROS.slice(0, 4).map((pro, i) => (
          <ProCard key={pro.id} pro={pro} divider={i < 3} onPress={() => router.push(`/(app)/pro/${pro.id}`)} />
        ))}
      </View>
    </ScrollView>
  );
}
