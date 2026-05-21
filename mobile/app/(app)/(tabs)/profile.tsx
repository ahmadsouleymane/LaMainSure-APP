import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../lib/auth';
import { useTheme } from '../../../lib/theme';
import { useRole } from '../../../lib/role';
import { Avatar, Badge, Button, Display, Icon } from '../../../components/ui';

export default function Profile() {
  const router = useRouter();
  const { t } = useTheme();
  const { session, signOut } = useAuth();
  const { role, toggle } = useRole();
  const email = session?.user.email || 'aminata@dev.test';

  const switchRole = () => {
    toggle();
    router.replace(role === 'client' ? '/(pro)' : '/(app)');
  };

  const rows: { icon: string; label: string; sub?: string; badge?: string }[] = [
    { icon: 'user', label: 'Mes informations' },
    { icon: 'map-pin', label: 'Mes adresses' },
    { icon: 'credit-card', label: 'Paiement' },
    { icon: 'bell', label: 'Notifications' },
    { icon: 'shield', label: 'Confidentialité & sécurité' },
    role === 'client'
      ? { icon: 'briefcase', label: 'Devenir artisan', badge: 'KYC' }
      : { icon: 'user-round', label: 'Mode client', sub: 'Chercher un artisan' },
    { icon: 'circle-help', label: 'Aide' },
    { icon: 'file-text', label: 'CGU & confidentialité' },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.paper }} contentContainerStyle={{ paddingTop: 8, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Avatar name="Aminata Touré" size={56} accent image="https://i.pravatar.cc/300?img=44" />
        <View style={{ flex: 1 }}>
          <Display size={20}>Aminata Touré</Display>
          <Text style={{ fontSize: 13, color: t.fg2, marginTop: 2 }}>{email} · Abidjan</Text>
        </View>
        <Icon name="chevron-right" size={20} color={t.fg3} />
      </View>

      <View style={{ paddingHorizontal: 20, paddingBottom: 14 }}>
        <Pressable onPress={switchRole} style={{
          backgroundColor: t.accentSoft, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12,
          flexDirection: 'row', alignItems: 'center', gap: 10,
        }}>
          <Icon name={role === 'client' ? 'briefcase' : 'user-round'} size={18} color={t.accentInk} />
          <Text style={{ flex: 1, color: t.accentInk, fontWeight: '600', fontSize: 14 }}>
            Passer en mode {role === 'client' ? 'artisan' : 'client'}
          </Text>
          <Icon name="chevron-right" size={16} color={t.accentInk} />
        </Pressable>
      </View>

      <View style={{ height: 8, backgroundColor: t.paperSoft }} />

      {rows.map((r, i) => (
        <View key={i} style={{
          flexDirection: 'row', alignItems: 'center', gap: 14,
          paddingHorizontal: 20, paddingVertical: 14,
          borderTopWidth: i > 0 ? 1 : 0, borderTopColor: t.lineSoft,
        }}>
          <Icon name={r.icon} size={20} color={t.ink} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, color: t.ink }}>{r.label}</Text>
            {r.sub ? <Text style={{ fontSize: 12, color: t.fg2, marginTop: 2 }}>{r.sub}</Text> : null}
          </View>
          {r.badge ? <Badge tone="warning">{r.badge}</Badge> : null}
          <Icon name="chevron-right" size={18} color={t.fg3} />
        </View>
      ))}

      <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
        <Button variant="danger" onPress={signOut}>Se déconnecter</Button>
        <Text style={{ textAlign: 'center', marginTop: 12, fontSize: 11, color: t.fg3 }}>La Main Sûre · v1.0.0</Text>
      </View>
    </ScrollView>
  );
}
