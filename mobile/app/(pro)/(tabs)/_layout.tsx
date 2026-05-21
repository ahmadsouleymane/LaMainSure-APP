import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, fonts } from '../../../lib/theme';
import { Icon } from '../../../components/ui';

export default function ProTabs() {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.ink,
        tabBarInactiveTintColor: t.fg3,
        tabBarStyle: {
          backgroundColor: t.paper,
          borderTopColor: t.lineSoft,
          paddingBottom: Math.max(insets.bottom, 6),
          paddingTop: 6,
          height: 56 + Math.max(insets.bottom, 6),
        },
        tabBarLabelStyle: { fontSize: 10, fontFamily: fonts.sansMedium },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Tableau', tabBarIcon: ({ color }) => <Icon name="home" size={22} color={color} /> }} />
      <Tabs.Screen name="demandes" options={{ title: 'Demandes', tabBarIcon: ({ color }) => <Icon name="clipboard-list" size={22} color={color} /> }} />
      <Tabs.Screen name="messages" options={{ title: 'Messages', tabBarIcon: ({ color }) => <Icon name="message-circle" size={22} color={color} /> }} />
      <Tabs.Screen name="reviews" options={{ title: 'Avis', tabBarIcon: ({ color }) => <Icon name="star" size={22} color={color} /> }} />
      <Tabs.Screen name="edit" options={{ title: 'Profil', tabBarIcon: ({ color }) => <Icon name="user" size={22} color={color} /> }} />
    </Tabs>
  );
}
