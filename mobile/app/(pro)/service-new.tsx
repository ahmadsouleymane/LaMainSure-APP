import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../lib/theme';
import { useProfile } from '../../lib/profile';
import { fetchProCategoryId, createService } from '../../lib/api';
import { AppHeader, Button, TextField } from '../../components/ui';

export default function ServiceNew() {
  const router = useRouter();
  const { t } = useTheme();
  const { profile } = useProfile();
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [catId, setCatId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (profile) fetchProCategoryId(profile.id).then(setCatId).catch(() => {}); }, [profile?.id]);

  const valid = title.trim().length >= 3 && !!catId;

  const save = async () => {
    if (!valid || !profile || !catId || saving) return;
    setSaving(true);
    try {
      await createService({
        proId: profile.id,
        categoryId: catId,
        title: title.trim(),
        description: desc.trim() || undefined,
        priceXof: price.trim() ? Number(price.replace(/\s/g, '')) : null,
        durationMin: duration.trim() ? Number(duration) : null,
      });
      router.back();
    } catch (e) {
      Alert.alert('Erreur', e instanceof Error ? e.message : 'Création impossible.');
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.paper }}>
      <AppHeader title="Nouveau service" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 120 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Field label="Intitulé"><TextField value={title} onChangeText={setTitle} placeholder="ex : Dépannage fuite urgent" /></Field>
        <Field label="Description"><TextField value={desc} onChangeText={setDesc} placeholder="Ce qui est inclus…" multiline /></Field>
        <Field label="Prix (FCFA) — laisser vide si sur devis"><TextField value={price} onChangeText={setPrice} placeholder="ex : 15000" keyboardType="numeric" /></Field>
        <Field label="Durée (min) — optionnel"><TextField value={duration} onChangeText={setDuration} placeholder="ex : 90" keyboardType="numeric" /></Field>
        <Button loading={saving} disabled={!valid} onPress={save} style={{ marginTop: 4 }}>
          {valid ? 'Ajouter le service' : 'Donne un intitulé'}
        </Button>
        {!catId && <Text style={{ fontSize: 12, color: t.fg2 }}>Astuce : ajoute d'abord une catégorie à ton profil.</Text>}
      </ScrollView>
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const { t } = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 12, color: t.fg2, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</Text>
      {children}
    </View>
  );
}
