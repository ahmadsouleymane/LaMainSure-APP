import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../lib/theme';
import { useRole } from '../../lib/role';
import { Display, Icon, Wordmark } from '../../components/ui';

export default function RoleChoice() {
  const router = useRouter();
  const { t } = useTheme();
  const { setRole } = useRole();

  const choose = (r: 'client' | 'pro') => {
    setRole(r);
    router.replace('/(auth)/login');
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.paper, padding: 24, paddingTop: 40 }}>
      <Wordmark height={32} />
      <View style={{ marginTop: 36 }}>
        <Display size={26}>Tu es ici pour…</Display>
        <Text style={{ fontSize: 14, color: t.fg2, marginTop: 6 }}>
          Tu pourras toujours basculer plus tard depuis ton profil.
        </Text>
      </View>

      <View style={{ flexDirection: 'column', gap: 12, marginTop: 28, flex: 1 }}>
        <RoleCard
          onPress={() => choose('client')}
          icon="search"
          title="Trouver un artisan"
          subtitle="Plomberie, design, couture… Tu cherches quelqu'un de fiable près de chez toi."
          accent
        />
        <RoleCard
          onPress={() => choose('pro')}
          icon="briefcase"
          title="Proposer mes services"
          subtitle="Tu es artisan ou indépendant·e. Reçois des demandes qualifiées, sans prospecter."
        />
      </View>

      <Text style={{ fontSize: 12, color: t.fg3, textAlign: 'center', marginTop: 16, lineHeight: 18 }}>
        En continuant tu acceptes les CGU et la politique de confidentialité.
      </Text>
    </View>
  );
}

function RoleCard({ icon, title, subtitle, onPress, accent }: { icon: string; title: string; subtitle: string; onPress: () => void; accent?: boolean }) {
  const { t } = useTheme();
  return (
    <Pressable onPress={onPress} style={{
      backgroundColor: t.paper, borderWidth: 1, borderColor: t.lineSoft,
      borderRadius: 14, padding: 18,
      flexDirection: 'row', alignItems: 'center', gap: 14,
      shadowColor: '#040f0f', shadowOpacity: t.isDark ? 0.4 : 0.06,
      shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 2,
    }}>
      <View style={{
        width: 52, height: 52, borderRadius: 12,
        backgroundColor: accent ? t.accent : t.ink,
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name={icon} size={24} color="#fff" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: t.ink }}>{title}</Text>
        <Text style={{ fontSize: 13, color: t.fg2, marginTop: 4, lineHeight: 18 }}>{subtitle}</Text>
      </View>
      <Icon name="chevron-right" size={20} color={t.fg3} />
    </Pressable>
  );
}
