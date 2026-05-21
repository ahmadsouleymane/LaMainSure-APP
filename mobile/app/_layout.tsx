import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Text as RNText, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  useFonts as useInterFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  RobotoMono_400Regular,
  RobotoMono_500Medium,
  RobotoMono_700Bold,
} from '@expo-google-fonts/roboto-mono';
import { AuthProvider, useAuth } from '../lib/auth';
import { ThemeProvider, useTheme } from '../lib/theme';
import { RoleProvider, useRole } from '../lib/role';

function AuthGate() {
  const { session, loading } = useAuth();
  const { role } = useRole();
  const { t } = useTheme();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const first = segments[0];
    const inAuth = first === '(auth)';
    const inOnboarding = first === '(onboarding)';
    if (!session && !inAuth && !inOnboarding) {
      router.replace('/(onboarding)/splash');
    } else if (session) {
      if (inAuth || inOnboarding) {
        router.replace(role === 'pro' ? '/(pro)' : '/(app)');
      }
    }
  }, [session, loading, segments, router, role]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: t.paper }}>
        <ActivityIndicator color={t.ink} />
      </View>
    );
  }
  return <Slot />;
}

// Apply Inter as the global default font for every <Text>. Components that
// set their own fontFamily (Display = Roboto Mono, badges = Inter SemiBold,
// etc.) still override this. fontWeight is preserved for native synthetic
// bolding where we didn't explicitly pick a weighted variant.
const TextAny = RNText as unknown as { defaultProps?: { style?: object } };
TextAny.defaultProps = TextAny.defaultProps || {};
TextAny.defaultProps.style = [TextAny.defaultProps.style, { fontFamily: 'Inter_400Regular' }];

export default function RootLayout() {
  const [fontsLoaded] = useInterFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    RobotoMono_400Regular,
    RobotoMono_500Medium,
    RobotoMono_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' }}>
        <ActivityIndicator color="#040f0f" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <RoleProvider>
            <AuthProvider>
              <StatusBar style="auto" />
              <SafeAreaShell />
            </AuthProvider>
          </RoleProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function SafeAreaShell() {
  const { t } = useTheme();
  const segments = useSegments();
  // Splash is full-bleed dark; everything else uses paper.
  const isSplash = segments[0] === '(onboarding)' && segments[1] === 'splash';
  const bg = isSplash ? '#040f0f' : t.paper;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={isSplash ? ['left', 'right'] : ['top', 'left', 'right']}>
      <AuthGate />
    </SafeAreaView>
  );
}
