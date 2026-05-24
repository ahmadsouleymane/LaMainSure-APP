import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTheme } from '../../../lib/theme';
import { useRole } from '../../../lib/role';
import { useAuth } from '../../../lib/auth';
import { useProfile } from '../../../lib/profile';
import { fetchMyPro, setProVisible, setServiceActive, updateProBio, type MyPro } from '../../../lib/api';
import { fmtFcfa } from '../../../lib/mock-data';
import { AppHeader, Avatar, Button, Icon, PortfolioTile, SectionTitle, TextField, ToggleSwitch } from '../../../components/ui';

export default function ProEdit() {
  const router = useRouter();
  const { t } = useTheme();
  const { role, toggle } = useRole();
  const { signOut } = useAuth();
  const { profile } = useProfile();
  const [zones, setZones] = useState(['Cocody', 'Riviera 2', 'Angré']);
  const [newZone, setNewZone] = useState('');
  const [pro, setPro] = useState<MyPro | null>(null);
  const [available, setAvailable] = useState(true);
  const [editingBio, setEditingBio] = useState(false);
  const [bioText, setBioText] = useState('');
  const [savingBio, setSavingBio] = useState(false);

  const reload = useCallback(() => {
    if (!profile) return;
    fetchMyPro(profile.id).then((p) => {
      if (!p) return;
      setPro(p);
      setAvailable(p.isVisible);
    }).catch(() => {});
  }, [profile?.id]);

  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  const services = pro?.services ?? [];

  const saveBio = async () => {
    if (!pro || savingBio) return;
    setSavingBio(true);
    try {
      await updateProBio(pro.id, bioText.trim());
      setPro((p) => p ? { ...p, bio: bioText.trim() } : p);
      setEditingBio(false);
    } catch (e) {
      Alert.alert('Erreur', e instanceof Error ? e.message : 'Enregistrement impossible.');
    } finally {
      setSavingBio(false);
    }
  };

  const addZone = () => {
    const z = newZone.trim();
    if (z && !zones.includes(z)) setZones((zs) => [...zs, z]);
    setNewZone('');
  };

  const portfolioSoon = () => Alert.alert('Bientôt', "L'ajout de photos de réalisations arrive très vite.");

  const toggleAvailable = async (v: boolean) => {
    setAvailable(v);
    if (pro) { try { await setProVisible(pro.id, v); } catch { setAvailable(!v); } }
  };

  const toggleService = async (serviceId: string, v: boolean) => {
    setPro((p) => p ? { ...p, services: p.services.map((s) => s.id === serviceId ? { ...s, active: v } : s) } : p);
    try { await setServiceActive(serviceId, v); } catch {
      setPro((p) => p ? { ...p, services: p.services.map((s) => s.id === serviceId ? { ...s, active: !v } : s) } : p);
    }
  };

  const switchRole = () => {
    toggle();
    router.replace(role === 'pro' ? '/(app)/(tabs)/search' : '/(pro)');
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.paperSoft }} contentContainerStyle={{ paddingBottom: 120 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <AppHeader title="Mon profil artisan" right={
        <Pressable hitSlop={8} onPress={() => profile && router.push(`/(app)/pro/${profile.id}`)}><Text style={{ fontSize: 14, fontWeight: '600', color: t.link }}>Voir</Text></Pressable>
      } />

      <View style={{ backgroundColor: t.paper }}>
        <View style={{ height: 100, backgroundColor: t.accent }} />
        <View style={{ paddingHorizontal: 20, paddingBottom: 16, marginTop: -40 }}>
          <Avatar name={pro?.fullName || profile?.full_name || ''} size={80} accent image={pro?.avatar || profile?.avatar_url || undefined} />
          <View style={{ marginTop: 10 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: t.ink, fontFamily: 'RobotoMono_700Bold', textTransform: 'uppercase', letterSpacing: -0.5 }}>{pro?.displayName || '—'}</Text>
            <Text style={{ fontSize: 13, color: t.fg2, marginTop: 2 }}>{[pro?.fullName, pro?.tags.join(', ')].filter(Boolean).join(' · ')}</Text>
          </View>
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
        <View style={{ backgroundColor: t.paper, borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: t.lineSoft }}>
          <View style={{ width: 36, height: 36, borderRadius: 999, backgroundColor: available ? t.successBg : t.paperSoft, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="circle-check" size={18} color={available ? t.success : t.fg2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: t.ink }}>{available ? 'Visible · disponible' : 'Masqué'}</Text>
            <Text style={{ fontSize: 12, color: t.fg2, marginTop: 2 }}>{available ? 'Ton profil apparaît dans les recherches' : "Tu n'apparais plus dans les recherches"}</Text>
          </View>
          <ToggleSwitch on={available} onChange={toggleAvailable} />
        </View>
      </View>

      <SectionTitle title="Présentation" right={
        <Pressable hitSlop={8} onPress={() => { setBioText(pro?.bio ?? ''); setEditingBio((e) => !e); }}>
          <Text style={{ fontSize: 13, color: t.link }}>{editingBio ? 'Annuler' : 'Modifier'}</Text>
        </Pressable>
      } />
      <View style={{ paddingHorizontal: 20 }}>
        {editingBio ? (
          <View style={{ gap: 10 }}>
            <TextField value={bioText} onChangeText={setBioText} placeholder="Présente ton activité, ton expérience…" multiline />
            <Button size="sm" loading={savingBio} onPress={saveBio}>Enregistrer</Button>
          </View>
        ) : (
          <View style={{ backgroundColor: t.paper, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: t.lineSoft }}>
            <Text style={{ fontSize: 14, color: t.ink, lineHeight: 21 }}>
              {pro?.bio || 'Ajoute une présentation pour rassurer tes clients.'}
            </Text>
          </View>
        )}
      </View>

      <SectionTitle title="Services & tarifs" right={
        <Pressable hitSlop={8} onPress={() => router.push('/(pro)/service-new')} style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
          <Icon name="plus" size={14} color={t.link} />
          <Text style={{ color: t.link, fontSize: 13, fontWeight: '500' }}>Ajouter</Text>
        </Pressable>
      } />
      <View style={{ paddingHorizontal: 20, gap: 8 }}>
        {services.length === 0 ? (
          <Text style={{ fontSize: 13, color: t.fg2, paddingVertical: 8 }}>Aucun service. Ajoute ta première offre.</Text>
        ) : services.map((s) => (
          <View key={s.id} style={{ backgroundColor: t.paper, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: t.lineSoft, flexDirection: 'row', alignItems: 'center', gap: 12, opacity: s.active ? 1 : 0.55 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: t.ink }}>{s.title}</Text>
              <Text style={{ fontSize: 12, color: t.fg2, marginTop: 2 }}>{fmtFcfa(s.price)}{s.durationMin ? ` · ${s.durationMin} min` : ''}</Text>
            </View>
            <ToggleSwitch on={s.active} onChange={(v) => toggleService(s.id, v)} />
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, borderWidth: 1, borderStyle: 'dashed', borderColor: t.line, minWidth: 130 }}>
            <Icon name="plus" size={12} color={t.fg2} />
            <TextInput
              value={newZone}
              onChangeText={setNewZone}
              onSubmitEditing={addZone}
              returnKeyType="done"
              placeholder="Ajouter une zone"
              placeholderTextColor={t.fg3}
              style={{ flex: 1, fontSize: 13, color: t.ink, paddingVertical: 4 }}
            />
          </View>
        </View>
        <Text style={{ fontSize: 12, color: t.fg2, marginTop: 8, paddingLeft: 4 }}>Rayon de {pro?.serviceRadiusKm ?? 20} km autour des zones sélectionnées.</Text>
      </View>

      <SectionTitle title="Réalisations" right={
        <Pressable hitSlop={8} onPress={portfolioSoon}><Text style={{ fontSize: 13, color: t.link, fontWeight: '500' }}>Gérer</Text></Pressable>
      } />
      <View style={{ paddingHorizontal: 20, flexDirection: 'row', flexWrap: 'wrap' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <View key={i} style={{ width: '25%', padding: 3 }}>
            <PortfolioTile tag={pro?.tags[0]} />
          </View>
        ))}
        <View style={{ width: '25%', padding: 3 }}>
          <Pressable onPress={portfolioSoon} style={{ aspectRatio: 1, borderRadius: 10, backgroundColor: t.paperSoft, borderWidth: 1.5, borderStyle: 'dashed', borderColor: t.line, alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <Icon name="plus" size={20} color={t.fg2} />
            <Text style={{ fontSize: 9, color: t.fg2 }}>Ajouter</Text>
          </Pressable>
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 24, gap: 10 }}>
        <Button variant="outline" onPress={switchRole}>Passer en mode client</Button>
        <Button variant="danger" onPress={signOut}>Se déconnecter</Button>
      </View>
    </ScrollView>
  );
}
