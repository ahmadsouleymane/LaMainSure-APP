import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../lib/theme';
import { ONBOARDING } from '../../lib/mock-data';
import { Button, Display, Icon, Wordmark } from '../../components/ui';

export default function Slides() {
  const router = useRouter();
  const { t } = useTheme();
  const [idx, setIdx] = useState(0);
  const slide = ONBOARDING[idx];
  const last = idx === ONBOARDING.length - 1;

  const finish = () => router.replace('/(onboarding)/role');

  return (
    <View style={{ flex: 1, backgroundColor: t.paper, padding: 24, paddingTop: 56 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Wordmark height={28} />
        {!last && (
          <Pressable onPress={finish} hitSlop={10}>
            <Text style={{ color: t.fg2, fontSize: 14, padding: 8 }}>Passer</Text>
          </Pressable>
        )}
      </View>

      <View style={{ flex: 1, justifyContent: 'center', gap: 20, paddingVertical: 20 }}>
        <View style={{
          width: 132, height: 132, borderRadius: 999,
          backgroundColor: t.accent,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name={slide.icon} size={56} color="#fff" />
        </View>
        <Display size={30}>{slide.title}</Display>
        <Text style={{ fontSize: 16, color: t.fg2, lineHeight: 24 }}>{slide.body}</Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center', marginBottom: 20 }}>
        {ONBOARDING.map((_, i) => (
          <View key={i} style={{
            width: i === idx ? 22 : 6, height: 6, borderRadius: 999,
            backgroundColor: i === idx ? t.accent : t.line,
          }} />
        ))}
      </View>

      {last
        ? <Button onPress={finish}>Commencer</Button>
        : <Button onPress={() => setIdx(idx + 1)}>Suivant</Button>}
    </View>
  );
}
