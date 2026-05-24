import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme, fonts } from '../../../lib/theme';
import { CATEGORIES } from '../../../lib/mock-data';
import { CategoryChip, Icon, ProCard } from '../../../components/ui';
import { useProFilter } from '../../../hooks/useProFilter';
import { useUserLocation } from '../../../lib/location';
import { MapSearchView } from '../../../components/map/MapSearchView';

type Mode = 'map' | 'list';

export default function Search() {
  const router = useRouter();
  const { t } = useTheme();
  const params = useLocalSearchParams<{ cat?: string }>();
  const [mode, setMode] = useState<Mode>('map');
  const location = useUserLocation();
  const filter = useProFilter(params.cat || 'all', location.coords);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => { if (params.cat) filter.setCat(params.cat); }, [params.cat]);

  if (mode === 'map') {
    return (
      <MapSearchView
        pros={filter.filtered}
        cat={filter.cat}
        onCatChange={filter.setCat}
        query={filter.query}
        onQueryChange={filter.setQuery}
        onSwitchToList={() => setMode('list')}
      />
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.paper }} contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 20, paddingVertical: 8, flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: t.paperSoft }}>
          <Icon name="search" size={18} color={t.fg2} />
          <TextInput
            value={filter.query} onChangeText={filter.setQuery}
            placeholder="Plombier, électricien…" placeholderTextColor={t.fg3}
            style={{ flex: 1, fontSize: 15, fontFamily: fonts.sansRegular, color: t.ink, paddingVertical: 2 }} />
        </View>
        <Pressable onPress={() => setFilterOpen((o) => !o)} style={{
          width: 44, height: 44, borderRadius: 12,
          backgroundColor: filterOpen ? t.ink : t.paperSoft,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="sliders-horizontal" size={20} color={filterOpen ? t.paper : t.ink} />
        </Pressable>
        <Pressable onPress={() => setMode('map')} style={{
          width: 44, height: 44, borderRadius: 12,
          backgroundColor: t.paperSoft,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="map" size={20} color={t.ink} />
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20, paddingBottom: 14 }}>
        {CATEGORIES.map((c) => (
          <CategoryChip key={c.slug} icon={c.icon} label={c.name} active={filter.cat === c.slug} onPress={() => filter.setCat(c.slug)} />
        ))}
      </ScrollView>

      {filterOpen && (
        <View style={{ marginHorizontal: 20, marginBottom: 14, padding: 14, backgroundColor: t.paperSoft, borderRadius: 12, gap: 12 }}>
          <View>
            <Text style={{ fontSize: 12, fontFamily: fonts.sansSemibold, color: t.fg2, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Trier par</Text>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {(['distance', 'rating', 'price'] as const).map((s) => (
                <Pressable key={s} onPress={() => filter.setSort(s)} style={{
                  flex: 1, paddingVertical: 8, borderRadius: 8,
                  borderWidth: 1, borderColor: filter.sort === s ? t.ink : t.line,
                  backgroundColor: filter.sort === s ? t.ink : t.paper,
                  alignItems: 'center',
                }}>
                  <Text style={{ color: filter.sort === s ? t.paper : t.ink, fontSize: 13, fontFamily: fonts.sansMedium }}>
                    {s === 'distance' ? 'Distance' : s === 'rating' ? 'Note' : 'Prix'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          <Pressable onPress={() => filter.setVerifiedOnly(!filter.verifiedOnly)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{
              width: 20, height: 20, borderRadius: 5,
              borderWidth: 1.5, borderColor: filter.verifiedOnly ? t.ink : t.line,
              backgroundColor: filter.verifiedOnly ? t.ink : 'transparent',
              alignItems: 'center', justifyContent: 'center',
            }}>
              {filter.verifiedOnly && <Icon name="check" size={14} color={t.paper} />}
            </View>
            <Text style={{ fontSize: 14, color: t.ink }}>Uniquement les artisans vérifiés</Text>
          </Pressable>
        </View>
      )}

      <Text style={{ paddingHorizontal: 20, paddingBottom: 6, fontSize: 13, color: t.fg2 }}>
        {filter.filtered.length} artisan{filter.filtered.length > 1 ? 's' : ''} {filter.cat !== 'all' ? `· ${CATEGORIES.find((c) => c.slug === filter.cat)?.name}` : '· toutes catégories'}
      </Text>

      <View style={{ paddingHorizontal: 20 }}>
        {filter.loading ? (
          <ActivityIndicator color={t.ink} style={{ paddingVertical: 40 }} />
        ) : filter.filtered.length === 0 ? (
          <Text style={{ paddingVertical: 40, textAlign: 'center', color: t.fg3, fontSize: 14 }}>Aucun artisan pour cette recherche.</Text>
        ) : filter.filtered.map((pro, i) => (
          <ProCard key={pro.id} pro={pro} divider={i < filter.filtered.length - 1} onPress={() => router.push(`/(app)/pro/${pro.id}`)} />
        ))}
      </View>
    </ScrollView>
  );
}

