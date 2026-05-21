import { useEffect, useMemo, useRef, useState } from 'react';
import { Linking, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import MapView, { Marker, type Region } from 'react-native-maps';
import BottomSheet, { BottomSheetFlatList, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { useTheme, fonts } from '../../lib/theme';
import { CATEGORIES, type Pro, ICON_FOR_TAG } from '../../lib/mock-data';
import { distanceKm, formatKm, useUserLocation } from '../../lib/location';
import { CategoryChip, Icon, ProCard } from '../ui';
import { ProMarker } from './ProMarker';

type Props = {
  pros: Pro[];
  cat: string;
  onCatChange: (slug: string) => void;
  query: string;
  onQueryChange: (q: string) => void;
  onSwitchToList: () => void;
};

const DELTA = { latitudeDelta: 0.06, longitudeDelta: 0.06 };

export function MapSearchView({ pros, cat, onCatChange, query, onQueryChange, onSwitchToList }: Props) {
  const router = useRouter();
  const { t } = useTheme();
  const location = useUserLocation();
  const mapRef = useRef<MapView | null>(null);
  const sheetRef = useRef<BottomSheet>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const initialRegion: Region = useMemo(() => ({
    latitude: location.coords.lat,
    longitude: location.coords.lng,
    ...DELTA,
  }), [location.coords.lat, location.coords.lng]);

  // On suit la région courante pour pouvoir zoomer/dézoomer en gardant le centre.
  const regionRef = useRef<Region>(initialRegion);

  function zoomBy(factor: number) {
    const r = regionRef.current;
    const next: Region = {
      latitude: r.latitude,
      longitude: r.longitude,
      latitudeDelta: Math.max(0.002, Math.min(80, r.latitudeDelta * factor)),
      longitudeDelta: Math.max(0.002, Math.min(80, r.longitudeDelta * factor)),
    };
    regionRef.current = next;
    mapRef.current?.animateToRegion(next, 250);
  }

  // Recentre la carte quand on récupère la vraie position.
  useEffect(() => {
    if (!location.isFallback && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.coords.lat,
        longitude: location.coords.lng,
        ...DELTA,
      }, 600);
    }
  }, [location.isFallback, location.coords.lat, location.coords.lng]);

  const snapPoints = useMemo(() => ['18%', '55%', '92%'], []);

  function focusPro(pro: Pro) {
    setSelectedId(pro.id);
    mapRef.current?.animateToRegion({
      latitude: pro.lat,
      longitude: pro.lng,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    }, 450);
    sheetRef.current?.snapToIndex(1);
  }

  function recenter() {
    if (location.status === 'denied') {
      Linking.openSettings();
      return;
    }
    mapRef.current?.animateToRegion({
      latitude: location.coords.lat,
      longitude: location.coords.lng,
      ...DELTA,
    }, 500);
  }

  const sortedByDistance = useMemo(() => {
    return [...pros].map((p) => ({ ...p, _km: distanceKm(location.coords, { lat: p.lat, lng: p.lng }) }))
      .sort((a, b) => a._km - b._km);
  }, [pros, location.coords]);

  return (
    <View style={{ flex: 1, backgroundColor: t.paper }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={initialRegion}
        showsUserLocation={!location.isFallback}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
        onPress={() => setSelectedId(null)}
        onRegionChangeComplete={(r) => { regionRef.current = r; }}>
        {pros.map((pro) => (
          <Marker
            key={pro.id}
            coordinate={{ latitude: pro.lat, longitude: pro.lng }}
            onPress={(e) => { e.stopPropagation?.(); focusPro(pro); }}
            anchor={{ x: 0.5, y: 1 }}
            tracksViewChanges={selectedId === pro.id}>
            <ProMarker tag={pro.tags[0]} selected={selectedId === pro.id} />
          </Marker>
        ))}
      </MapView>

      {/* Search bar + categories overlay */}
      <View style={{ position: 'absolute', top: 8, left: 0, right: 0, paddingHorizontal: 16, gap: 10 }} pointerEvents="box-none">
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <View style={{
            flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
            paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14,
            backgroundColor: t.paper,
            shadowColor: '#040f0f', shadowOpacity: 0.12, shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 }, elevation: 4,
          }}>
            <Icon name="search" size={18} color={t.fg2} />
            <TextInput
              value={query}
              onChangeText={onQueryChange}
              placeholder="Plombier, électricien…"
              placeholderTextColor={t.fg3}
              style={{ flex: 1, fontSize: 15, fontFamily: fonts.sansRegular, color: t.ink, paddingVertical: 2 }}
            />
          </View>
          <Pressable onPress={onSwitchToList} style={{
            width: 44, height: 44, borderRadius: 12, backgroundColor: t.paper,
            alignItems: 'center', justifyContent: 'center',
            shadowColor: '#040f0f', shadowOpacity: 0.12, shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 }, elevation: 4,
          }}>
            <Icon name="list" size={20} color={t.ink} />
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 8 }}>
          {CATEGORIES.map((c) => (
            <CategoryChip key={c.slug} icon={c.icon} label={c.name} active={cat === c.slug} onPress={() => onCatChange(c.slug)} />
          ))}
        </ScrollView>
      </View>

      {/* Zoom + Recenter FABs */}
      <View style={{ position: 'absolute', right: 16, bottom: 220, gap: 8 }}>
        <View style={{
          borderRadius: 12, overflow: 'hidden', backgroundColor: t.paper,
          shadowColor: '#040f0f', shadowOpacity: 0.18, shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 }, elevation: 4,
        }}>
          <Pressable
            onPress={() => zoomBy(0.5)}
            style={({ pressed }) => ({
              width: 48, height: 44, alignItems: 'center', justifyContent: 'center',
              backgroundColor: pressed ? t.paperSoft : t.paper,
              borderBottomWidth: 1, borderBottomColor: t.lineSoft,
            })}>
            <Icon name="plus" size={22} color={t.ink} />
          </Pressable>
          <Pressable
            onPress={() => zoomBy(2)}
            style={({ pressed }) => ({
              width: 48, height: 44, alignItems: 'center', justifyContent: 'center',
              backgroundColor: pressed ? t.paperSoft : t.paper,
            })}>
            <Icon name="minus" size={22} color={t.ink} />
          </Pressable>
        </View>
        <Pressable
          onPress={recenter}
          style={({ pressed }) => ({
            width: 48, height: 48, borderRadius: 12,
            backgroundColor: pressed ? t.paperSoft : t.paper,
            alignItems: 'center', justifyContent: 'center',
            shadowColor: '#040f0f', shadowOpacity: 0.18, shadowRadius: 8,
            shadowOffset: { width: 0, height: 3 }, elevation: 4,
          })}>
          <Icon name={location.status === 'denied' ? 'map-pin-off' : 'locate'} size={22} color={t.ink} />
        </Pressable>
      </View>

      {/* Out-of-service banner (Africa-only) */}
      {!location.inService && location.status === 'granted' && (
        <View style={{
          position: 'absolute', left: 16, right: 16, bottom: 280,
          backgroundColor: t.ink, borderRadius: 12,
          padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10,
        }}>
          <Icon name="map-pin-off" size={18} color={t.paper} />
          <Text style={{ flex: 1, color: t.paper, fontFamily: fonts.sansMedium, fontSize: 13 }}>
            Service réservé à l'Afrique. On t'affiche Abidjan en exploration.
          </Text>
        </View>
      )}

      {/* Permission banner (only when denied) */}
      {location.status === 'denied' && (
        <View style={{
          position: 'absolute', left: 16, right: 16, bottom: 280,
          backgroundColor: t.warningBg, borderRadius: 12,
          padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10,
        }}>
          <Icon name="alert-circle" size={18} color={t.warning} />
          <Text style={{ flex: 1, color: t.warning, fontFamily: fonts.sansMedium, fontSize: 13 }}>
            Active la localisation pour voir les artisans près de toi.
          </Text>
          <Pressable onPress={() => Linking.openSettings()} hitSlop={8}>
            <Text style={{ color: t.warning, fontFamily: fonts.sansSemibold, fontSize: 13 }}>Réglages</Text>
          </Pressable>
        </View>
      )}

      {/* Bottom sheet */}
      <BottomSheet
        ref={sheetRef}
        snapPoints={snapPoints}
        index={0}
        backgroundStyle={{ backgroundColor: t.paper }}
        handleIndicatorStyle={{ backgroundColor: t.line, width: 44 }}>
        {selectedId ? (
          <BottomSheetScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}>
            <SelectedHeader count={pros.length} />
            {sortedByDistance
              .filter((p) => p.id === selectedId)
              .map((pro) => (
                <ProCard key={pro.id} pro={pro} divider={false} onPress={() => router.push(`/(app)/pro/${pro.id}`)} />
              ))}
            <Text style={{ fontSize: 13, color: t.fg2, marginTop: 16, marginBottom: 8, fontFamily: fonts.sansMedium }}>
              Autres artisans à proximité
            </Text>
            {sortedByDistance.filter((p) => p.id !== selectedId).map((pro, i, arr) => (
              <ProCard key={pro.id} pro={pro} divider={i < arr.length - 1} onPress={() => focusPro(pro)} />
            ))}
          </BottomSheetScrollView>
        ) : (
          <BottomSheetFlatList
            data={sortedByDistance}
            keyExtractor={(p) => p.id}
            ListHeaderComponent={
              <View style={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 15, fontFamily: fonts.sansSemibold, color: t.ink }}>
                  {pros.length} artisan{pros.length > 1 ? 's' : ''} à proximité
                </Text>
                {!location.isFallback && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Icon name="map-pin" size={12} color={t.accent} />
                    <Text style={{ fontSize: 12, color: t.fg2, fontFamily: fonts.sansMedium }}>Autour de toi</Text>
                  </View>
                )}
              </View>
            }
            renderItem={({ item, index }) => (
              <View style={{ paddingHorizontal: 20 }}>
                <Pressable onPress={() => focusPro(item)}>
                  <ProCard pro={item} divider={index < sortedByDistance.length - 1} onPress={() => focusPro(item)} />
                </Pressable>
                {item._km != null && (
                  <Text style={{ fontSize: 11, color: t.fg3, marginTop: -10, marginBottom: 8, fontFamily: fonts.sansMedium }}>
                    à {formatKm(item._km)}
                  </Text>
                )}
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 80 }}
            ListEmptyComponent={
              <Text style={{ paddingHorizontal: 20, paddingVertical: 24, color: t.fg3, textAlign: 'center' }}>
                Aucun artisan pour cette recherche.
              </Text>
            }
          />
        )}
      </BottomSheet>
    </View>
  );
}

function SelectedHeader({ count }: { count: number }) {
  const { t } = useTheme();
  return (
    <Text style={{ fontSize: 13, color: t.fg2, paddingTop: 4, paddingBottom: 10, fontFamily: fonts.sansMedium }}>
      Artisan sélectionné · {count} au total
    </Text>
  );
}

