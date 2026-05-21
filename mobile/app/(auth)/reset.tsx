import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { authErrorToFr, isValidEmail } from '../../lib/errors';
import { useTheme } from '../../lib/theme';
import { Button, Display, TextField, TextLink, Wordmark } from '../../components/ui';

export default function Reset() {
  const router = useRouter();
  const { t } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onSubmit() {
    setError(null);
    if (!isValidEmail(email)) return setError('Email invalide.');
    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: 'lamainsure://reset' });
    setLoading(false);
    if (err && /rate limit|too many/i.test(err.message)) return setError(authErrorToFr(err));
    setSent(true);
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: t.paper }}>
      <View style={{ flex: 1, padding: 24, paddingTop: 56 }}>
        <View style={{ marginBottom: 32 }}><Wordmark height={36} /></View>
        <Display size={28} style={{ marginBottom: 6 }}>Mot de passe oublié</Display>
        <Text style={{ fontSize: 14, color: t.fg2, marginBottom: 24 }}>On t'envoie un lien de réinitialisation par email.</Text>

        <View style={{ gap: 12 }}>
          <TextField value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" autoCapitalize="none" editable={!loading && !sent} />
          {error ? <Text style={{ color: t.danger, fontSize: 14 }}>{error}</Text> : null}
          {sent ? <Text style={{ color: t.success, fontSize: 14 }}>Si un compte existe pour cet email, un lien vient d'être envoyé.</Text> : null}
          {!sent && <Button onPress={onSubmit} loading={loading} style={{ marginTop: 4 }}>Envoyer le lien</Button>}
        </View>

        <View style={{ alignItems: 'center', marginTop: 20 }}>
          <TextLink onPress={() => router.replace('/(auth)/login')}>Retour à la connexion</TextLink>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
