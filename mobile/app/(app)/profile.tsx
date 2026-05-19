import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../lib/auth';

export default function Profile() {
  const { session, signOut } = useAuth();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil</Text>
      <Text style={styles.email}>{session?.user.email}</Text>
      <Pressable accessibilityRole="button" style={styles.btn} onPress={signOut}>
        <Text style={styles.btnText}>Se déconnecter</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', padding: 24 },
  title: { fontSize: 24, fontWeight: '700' },
  email: { fontSize: 14, color: '#666', marginTop: 8, marginBottom: 32 },
  btn: { backgroundColor: '#c00', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 24 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
