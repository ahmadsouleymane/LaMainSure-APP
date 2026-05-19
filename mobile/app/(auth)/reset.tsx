import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Link } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { authErrorToFr, isValidEmail } from '../../lib/errors';

export default function Reset() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onSubmit() {
    setError(null);
    if (!isValidEmail(email)) {
      setError('Email invalide.');
      return;
    }
    setLoading(true);
    // Toujours afficher "envoyé" même si l'email n'existe pas, pour éviter
    // l'énumération de comptes.
    const { error: err } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: 'lamainsure://reset' }
    );
    setLoading(false);
    if (err && !/rate limit|too many/i.test(err.message)) {
      // Affiche seulement les erreurs de rate-limit; sinon on prétend succès.
      setSent(true);
      return;
    }
    if (err) {
      setError(authErrorToFr(err));
      return;
    }
    setSent(true);
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Mot de passe oublié</Text>
        <Text style={styles.subtitle}>On t'envoie un lien de réinitialisation par email.</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
          value={email}
          onChangeText={setEmail}
          editable={!loading && !sent}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {sent ? (
          <Text style={styles.info}>Si un compte existe pour cet email, un lien vient d'être envoyé.</Text>
        ) : null}

        {!sent && (
          <Pressable
            accessibilityRole="button"
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={onSubmit}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Envoyer le lien</Text>}
          </Pressable>
        )}

        <Link href="/(auth)/login" style={styles.link}>
          <Text style={styles.linkText}>Retour à la connexion</Text>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 24 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
    color: '#000',
  },
  error: { color: '#c00', marginBottom: 12, fontSize: 14 },
  info: { color: '#0a7a3c', marginBottom: 12, fontSize: 14 },
  btn: {
    backgroundColor: '#111',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  link: { marginTop: 16, alignSelf: 'center' },
  linkText: { color: '#0a66c2', fontSize: 14 },
});
