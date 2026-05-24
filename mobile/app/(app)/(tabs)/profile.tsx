import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../lib/auth';
import { useTheme } from '../../../lib/theme';
import { useRole } from '../../../lib/role';
import { useProfile } from '../../../lib/profile';
import { Avatar, Badge, Button, Display, Icon } from '../../../components/ui';

export default function Profile() {
  const router = useRouter();
  const { t } = useTheme();
  const { session, signOut } = useAuth();
  const { role, canBePro, toggle } = useRole();
  const { profile } = useProfile();
  const email = session?.user.email || '';
  const name = profile?.full_name || 'Mon profil';
  const city = profile?.city || '';

  const switchRole = () => {
    if (role === 'client' && !canBePro) {
      // Not yet a verified pro → start KYC onboarding instead of switching.
      router.push('/(onboarding)/role');
      return;
    }
    toggle();
    router.replace(role === 'client' ? '/(pro)' : '/(app)/(tabs)/search');
  };

  const go = (section: string) => router.push(`/(app)/account/${section}`);
  const rows: { icon: string; label: string; sub?: string; badge?: string; onPress: () => void }[] = [
    { icon: 'user', label: 'Mes informations', onPress: () => go('infos') },
    { icon: 'map-pin', label: 'Mes adresses', onPress: () => go('addresses') },
    { icon: 'credit-card', label: 'Paiement', onPress: () => go('payment') },
    { icon: 'bell', label: 'Notifications', onPress: () => go('notifications') },
    { icon: 'shield', label: 'Confidentialité & sécurité', onPress: () => go('privacy') },
    canBePro
      ? { icon: 'user-round', label: 'Mode client', sub: 'Chercher un artisan', onPress: switchRole }
      : { icon: 'briefcase', label: 'Devenir artisan', badge: 'KYC', onPress: switchRole },
    { icon: 'circle-help', label: 'Aide', onPress: () => go('help') },
    { icon: 'file-text', label: 'CGU & confidentialité', onPress: () => go('terms') },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.paper }} contentContainerStyle={{ paddingTop: 8, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <Pressable onPress={() => router.push('/(app)/account/infos')} style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Avatar name={name} size={56} accent image={profile?.avatar_url || undefined} />
        <View style={{ flex: 1 }}>
          <Display size={20}>{name}</Display>
          <Text style={{ fontSize: 13, color: t.fg2, marginTop: 2 }}>{[email, city].filter(Boolean).join(' · ')}</Text>
        </View>
        <Icon name="chevron-right" size={20} color={t.fg3} />
      </Pressable>

      <View style={{ paddingHorizontal: 20, paddingBottom: 14 }}>
        <Pressable onPress={switchRole} style={{
          backgroundColor: t.accentSoft, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12,
          flexDirection: 'row', alignItems: 'center', gap: 10,
        }}>
          <Icon name={role === 'client' ? 'briefcase' : 'user-round'} size={18} color={t.accentInk} />
          <Text style={{ flex: 1, color: t.accentInk, fontWeight: '600', fontSize: 14 }}>
            {role === 'client' ? (canBePro ? 'Passer en mode artisan' : 'Devenir artisan') : 'Passer en mode client'}
          </Text>
          <Icon name="chevron-right" size={16} color={t.accentInk} />
        </Pressable>
      </View>

      <View style={{ height: 8, backgroundColor: t.paperSoft }} />

      {rows.map((r, i) => (
        <Pressable key={i} onPress={r.onPress} style={({ pressed }) => ({
          flexDirection: 'row', alignItems: 'center', gap: 14,
          paddingHorizontal: 20, paddingVertical: 14,
          borderTopWidth: i > 0 ? 1 : 0, borderTopColor: t.lineSoft,
          backgroundColor: pressed ? t.paperSoft : t.paper,
        })}>
          <Icon name={r.icon} size={20} color={t.ink} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, color: t.ink }}>{r.label}</Text>
            {r.sub ? <Text style={{ fontSize: 12, color: t.fg2, marginTop: 2 }}>{r.sub}</Text> : null}
          </View>
          {r.badge ? <Badge tone="warning">{r.badge}</Badge> : null}
          <Icon name="chevron-right" size={18} color={t.fg3} />
        </Pressable>
      ))}

      <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
        <Button variant="danger" onPress={signOut}>Se déconnecter</Button>
        <Text style={{ textAlign: 'center', marginTop: 12, fontSize: 11, color: t.fg3 }}>La Main Sûre · v1.0.0</Text>
      </View>
    </ScrollView>
  );
}
