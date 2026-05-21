import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { authErrorToFr, isValidEmail, passwordIssue } from '../../lib/errors';
import { useTheme } from '../../lib/theme';
import { Button, Display, TextField, TextLink, Wordmark } from '../../components/ui';

export default function Signup() {
  const router = useRouter();
  const { t } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function onSubmit() {
    setError(null); setInfo(null);
    if (!isValidEmail(email)) return setError('Email invalide.');
    const pw = passwordIssue(password);
    if (pw) return setError(pw);
    setLoading(true);
    const { data, error: err } = await supabase.auth.signUp({ email: email.trim().toLowerCase(), password });
    setLoading(false);
    if (err) return setError(authErrorToFr(err));
    if (!data.session) setInfo('Compte créé. Vérifie ton email pour confirmer ton adresse.');
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: t.paper }}>
      <View style={{ flex: 1, padding: 24, paddingTop: 56 }}>
        <View style={{ marginBottom: 32 }}><Wordmark height={36} /></View>
        <Display size={28} style={{ marginBottom: 6 }}>Créer un compte</Display>
        <Text style={{ fontSize: 14, color: t.fg2, marginBottom: 24 }}>Rejoins La Main Sûre</Text>

        <View style={{ gap: 12 }}>
          <TextField value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" autoCapitalize="none" editable={!loading} />
          <TextField value={password} onChangeText={setPassword} placeholder="Mot de passe (8+ caractères, lettres et chiffres)" secureTextEntry editable={!loading} />
          {error ? <Text style={{ color: t.danger, fontSize: 14 }}>{error}</Text> : null}
          {info ? <Text style={{ color: t.success, fontSize: 14 }}>{info}</Text> : null}
          <Button onPress={onSubmit} loading={loading} style={{ marginTop: 4 }}>Créer mon compte</Button>
        </View>

        <View style={{ alignItems: 'center', marginTop: 20 }}>
          <TextLink onPress={() => router.replace('/(auth)/login')}>J'ai déjà un compte</TextLink>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
