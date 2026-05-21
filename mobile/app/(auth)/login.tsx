import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { authErrorToFr, isValidEmail } from '../../lib/errors';
import { useTheme } from '../../lib/theme';
import { Button, Display, TextField, TextLink, Wordmark } from '../../components/ui';

export default function Login() {
  const router = useRouter();
  const { t } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);
    if (!isValidEmail(email)) return setError('Email invalide.');
    if (password.length < 8) return setError('Mot de passe trop court.');
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    setLoading(false);
    if (err) setError(authErrorToFr(err));
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: t.paper }}>
      <View style={{ flex: 1, padding: 24, paddingTop: 56 }}>
        <View style={{ marginBottom: 32 }}><Wordmark height={36} /></View>
        <Display size={28} style={{ marginBottom: 6 }}>Se connecter</Display>
        <Text style={{ fontSize: 14, color: t.fg2, marginBottom: 24 }}>Bienvenue sur La Main Sûre</Text>

        <View style={{ gap: 12 }}>
          <TextField value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" autoCapitalize="none" editable={!loading} />
          <TextField value={password} onChangeText={setPassword} placeholder="Mot de passe" secureTextEntry editable={!loading} />
          {error ? <Text style={{ color: t.danger, fontSize: 14 }}>{error}</Text> : null}
          <Button onPress={onSubmit} loading={loading} style={{ marginTop: 4 }}>Se connecter</Button>
        </View>

        <View style={{ alignItems: 'center', gap: 12, marginTop: 20 }}>
          <TextLink onPress={() => router.push('/(auth)/reset')}>Mot de passe oublié ?</TextLink>
          <TextLink onPress={() => router.push('/(auth)/signup')}>Créer un compte</TextLink>
        </View>

        <View style={{ flex: 1 }} />

        <Text style={{ fontSize: 12, color: t.fg3, textAlign: 'center', marginTop: 24 }}>
          Une question ? <Text style={{ color: t.link }}>aide@lamainsure.app</Text>
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}
