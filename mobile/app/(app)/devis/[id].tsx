import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../../lib/theme';
import { PROS } from '../../../lib/mock-data';
import { AppHeader, Avatar, Button, Icon, SectionTitle } from '../../../components/ui';

export default function Devis() {
  const router = useRouter();
  const { t } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const pro = PROS.find((p) => p.id === id) || PROS[0];

  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<'urgent' | 'today' | 'normal'>('normal');
  const [address, setAddress] = useState('Cocody, Riviera 2');
  const [photoCount, setPhotoCount] = useState(2);
  const valid = description.trim().length >= 10 && address.trim().length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: t.paper }}>
      <AppHeader title="Demande de devis" onBack={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ paddingHorizontal: 20, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar name={pro.fullName} size={44} accent={pro.accent} image={pro.avatar} />
          <View>
            <Text style={{ fontSize: 14, fontWeight: '600', color: t.ink }}>{pro.name}</Text>
            <Text style={{ fontSize: 12, color: t.fg2 }}>{pro.tags.join(' · ')} · Répond en {pro.responseTime}</Text>
          </View>
        </View>

        <SectionTitle title="Décris ton besoin" />
        <View style={{ paddingHorizontal: 20 }}>
          <TextInput
            value={description} onChangeText={setDescription}
            placeholder="Que veux-tu faire faire ? Précise les détails utiles (taille de la pièce, urgence, contraintes…)"
            placeholderTextColor={t.fg3}
            multiline numberOfLines={5}
            style={{
              borderWidth: 1, borderColor: t.line, borderRadius: 10,
              padding: 14, fontSize: 15, color: t.ink, backgroundColor: t.paper,
              minHeight: 110, textAlignVertical: 'top',
            }}
          />
          <Text style={{ fontSize: 11, color: t.fg3, marginTop: 6, textAlign: 'right' }}>{description.length} / 500</Text>
        </View>

        <SectionTitle title="Photos (optionnel)" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}>
          {Array.from({ length: photoCount }).map((_, i) => (
            <View key={i} style={{ width: 84, height: 84, borderRadius: 10, backgroundColor: t.accentSoft, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <Icon name="image" size={20} color={t.accent} />
              <Pressable onPress={() => setPhotoCount((c) => Math.max(0, c - 1))} style={{
                position: 'absolute', top: -6, right: -6,
                width: 22, height: 22, borderRadius: 999, backgroundColor: t.ink,
                borderWidth: 2, borderColor: t.paper,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="x" size={12} color={t.paper} />
              </Pressable>
            </View>
          ))}
          <Pressable onPress={() => setPhotoCount((c) => c + 1)} style={{
            width: 84, height: 84, borderRadius: 10, backgroundColor: t.paperSoft,
            borderWidth: 1.5, borderStyle: 'dashed', borderColor: t.line,
            alignItems: 'center', justifyContent: 'center', gap: 4,
          }}>
            <Icon name="plus" size={22} color={t.fg2} />
            <Text style={{ fontSize: 10, color: t.fg2 }}>Ajouter</Text>
          </Pressable>
        </ScrollView>

        <SectionTitle title="Adresse" />
        <View style={{ paddingHorizontal: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: t.line, backgroundColor: t.paper }}>
            <Icon name="map-pin" size={18} color={t.accent} />
            <TextInput value={address} onChangeText={setAddress} placeholderTextColor={t.fg3}
              style={{ flex: 1, fontSize: 15, color: t.ink }} />
          </View>
        </View>

        <SectionTitle title="Urgence" />
        <View style={{ paddingHorizontal: 20, flexDirection: 'row', gap: 8 }}>
          {(['urgent', 'today', 'normal'] as const).map((opt) => {
            const meta = opt === 'urgent' ? { label: 'Urgent', desc: 'Sous 2h', icon: 'zap' } : opt === 'today' ? { label: "Aujourd'hui", desc: 'Avant 18h', icon: 'sun' } : { label: 'Flexible', desc: 'Cette semaine', icon: 'calendar' };
            const a = urgency === opt;
            return (
              <Pressable key={opt} onPress={() => setUrgency(opt)} style={{
                flex: 1, paddingVertical: 12, paddingHorizontal: 8, borderRadius: 10,
                borderWidth: 1.5, borderColor: a ? t.ink : t.line,
                backgroundColor: a ? t.ink : t.paper,
                alignItems: 'center', gap: 4,
              }}>
                <Icon name={meta.icon} size={18} color={a ? t.paper : t.ink} />
                <Text style={{ fontSize: 13, fontWeight: '600', color: a ? t.paper : t.ink }}>{meta.label}</Text>
                <Text style={{ fontSize: 11, opacity: 0.7, color: a ? t.paper : t.ink }}>{meta.desc}</Text>
              </Pressable>
            );
          })}
        </View>

        <SectionTitle title="Budget approximatif (optionnel)" />
        <View style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: t.line, backgroundColor: t.paper }}>
            <TextInput placeholder="ex : 30 000" placeholderTextColor={t.fg3} keyboardType="numeric"
              style={{ flex: 1, fontSize: 15, color: t.ink }} />
            <Text style={{ fontSize: 13, color: t.fg2 }}>FCFA</Text>
          </View>
        </View>
      </ScrollView>

      <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: t.lineSoft, backgroundColor: t.paper }}>
        <Button disabled={!valid} onPress={() => router.replace('/(app)/(tabs)/requests')}>
          {valid ? 'Envoyer la demande' : 'Décris ton besoin pour envoyer'}
        </Button>
      </View>
    </View>
  );
}
