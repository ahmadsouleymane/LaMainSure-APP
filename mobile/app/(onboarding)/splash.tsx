import { useEffect } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

const MARK = require('../../assets/brand/brand-mark-dark.png');
const WORDMARK = require('../../assets/brand/brand-wordmark-teal.png');

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.replace('/(onboarding)/slides'), 1400);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <Pressable
      onPress={() => router.replace('/(onboarding)/slides')}
      style={{ flex: 1, backgroundColor: '#040f0f', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 28 }}>
      <Image source={MARK} style={{ width: 132, height: 132, resizeMode: 'contain' }} />
      <Image source={WORDMARK} style={{ height: 44, width: 44 * (2131 / 820), resizeMode: 'contain' }} />
      <View style={{ position: 'absolute', bottom: 56 }}>
        <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', letterSpacing: 1, textTransform: 'uppercase' }}>
          Artisans vérifiés · Côte d'Ivoire & Sénégal
        </Text>
      </View>
    </Pressable>
  );
}
