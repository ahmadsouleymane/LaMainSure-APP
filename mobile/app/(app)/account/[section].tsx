import { useState } from 'react';
import { Alert, Linking, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../../lib/theme';
import { useProfile } from '../../../lib/profile';
import { AppHeader, Button, SectionTitle, TextField, ToggleSwitch } from '../../../components/ui';

const TITLES: Record<string, string> = {
  infos: 'Mes informations',
  addresses: 'Mes adresses',
  payment: 'Paiement',
  notifications: 'Notifications',
  privacy: 'Confidentialité & sécurité',
  help: 'Aide',
  terms: 'CGU & confidentialité',
};

export default function AccountSection() {
  const router = useRouter();
  const { t } = useTheme();
  const { section } = useLocalSearchParams<{ section: string }>();
  const title = TITLES[section ?? ''] ?? 'Compte';

  return (
    <View style={{ flex: 1, backgroundColor: t.paper }}>
      <AppHeader title={title} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {section === 'infos' ? <InfosForm />
          : section === 'notifications' ? <NotificationsPanel />
          : section === 'help' ? <HelpPanel />
          : section === 'terms' ? <TermsPanel />
          : <ComingSoon title={title} />}
      </ScrollView>
    </View>
  );
}

function InfosForm() {
  const { t } = useTheme();
  const router = useRouter();
  const { profile, update } = useProfile();
  const [name, setName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [city, setCity] = useState(profile?.city ?? '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await update({ full_name: name.trim() || null, phone: phone.trim() || null, city: city.trim() || null });
      Alert.alert('Enregistré', 'Tes informations ont été mises à jour.');
      router.back();
    } catch (e) {
      Alert.alert('Erreur', e instanceof Error ? e.message : 'Enregistrement impossible.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ gap: 14 }}>
      <Field label="Nom complet"><TextField value={name} onChangeText={setName} placeholder="Ton nom" autoCapitalize="words" /></Field>
      <Field label="Téléphone"><TextField value={phone} onChangeText={setPhone} placeholder="+225 …" keyboardType="numeric" /></Field>
      <Field label="Ville"><TextField value={city} onChangeText={setCity} placeholder="Ta ville" autoCapitalize="words" /></Field>
      <Button loading={saving} onPress={save} style={{ marginTop: 4 }}>Enregistrer</Button>
    </View>
  );
}

function NotificationsPanel() {
  const { t } = useTheme();
  const [push, setPush] = useState(true);
  const [email, setEmail] = useState(false);
  const [promos, setPromos] = useState(false);
  const Row = ({ label, sub, on, set }: { label: string; sub: string; on: boolean; set: (v: boolean) => void }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: t.lineSoft }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, color: t.ink }}>{label}</Text>
        <Text style={{ fontSize: 12, color: t.fg2, marginTop: 2 }}>{sub}</Text>
      </View>
      <ToggleSwitch on={on} onChange={set} />
    </View>
  );
  return (
    <View>
      <Row label="Notifications push" sub="Demandes, devis, messages" on={push} set={setPush} />
      <Row label="E-mails" sub="Récapitulatifs et confirmations" on={email} set={setEmail} />
      <Row label="Offres & nouveautés" sub="Promotions occasionnelles" on={promos} set={setPromos} />
      <Text style={{ fontSize: 12, color: t.fg3, marginTop: 14 }}>Préférences enregistrées sur cet appareil.</Text>
    </View>
  );
}

function HelpPanel() {
  const { t } = useTheme();
  return (
    <View style={{ gap: 12 }}>
      <Text style={{ fontSize: 14, color: t.ink, lineHeight: 21 }}>Une question, un souci avec une mission ? On répond en français.</Text>
      <Button variant="outline" onPress={() => Linking.openURL('mailto:support@lamainsure.app')}>Écrire à support@lamainsure.app</Button>
      <Button variant="ghost" onPress={() => Linking.openURL('https://wa.me/2250700000000')}>Nous contacter sur WhatsApp</Button>
    </View>
  );
}

function TermsPanel() {
  const { t } = useTheme();
  return (
    <View style={{ gap: 12 }}>
      <SectionTitleInline text="Conditions d'utilisation" />
      <Text style={{ fontSize: 14, color: t.fg2, lineHeight: 21 }}>
        En utilisant La Main Sûre, tu acceptes de fournir des informations exactes, de respecter les autres
        utilisateurs et de régler les prestations convenues. La plateforme met en relation clients et artisans
        vérifiés mais n'est pas partie au contrat de prestation.
      </Text>
      <SectionTitleInline text="Confidentialité" />
      <Text style={{ fontSize: 14, color: t.fg2, lineHeight: 21 }}>
        Tes données (profil, localisation, messages) servent uniquement au fonctionnement du service et ne sont
        jamais revendues. Tu peux demander la suppression de ton compte à tout moment.
      </Text>
      <Button variant="outline" onPress={() => Linking.openURL('https://lamainsure.app/cgu')} style={{ marginTop: 6 }}>Lire la version complète</Button>
    </View>
  );
}

function ComingSoon({ title }: { title: string }) {
  const { t } = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingTop: 40, gap: 10 }}>
      <Text style={{ fontSize: 16, fontWeight: '600', color: t.ink }}>{title}</Text>
      <Text style={{ fontSize: 14, color: t.fg2, textAlign: 'center', lineHeight: 21 }}>
        Cette section arrive bientôt. On la prépare pour le lancement.
      </Text>
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

function SectionTitleInline({ text }: { text: string }) {
  const { t } = useTheme();
  return <Text style={{ fontSize: 15, fontWeight: '700', color: t.ink, marginTop: 4 }}>{text}</Text>;
}
