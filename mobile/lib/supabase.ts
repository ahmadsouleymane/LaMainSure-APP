import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
  (Constants.expoConfig?.extra?.supabaseUrl as string | undefined);

const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  (Constants.expoConfig?.extra?.supabaseAnonKey as string | undefined);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase env manquant. Crée un .env avec EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_ANON_KEY (voir .env.example).'
  );
}

// SecureStore on iOS/Android stores values in Keychain / EncryptedSharedPreferences.
// SecureStore has a ~2KB per-value limit; Supabase sessions can exceed that, so we
// chunk the value across multiple keys.
const CHUNK_SIZE = 1800;

const SecureStoreChunkedAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    const head = await SecureStore.getItemAsync(key);
    if (!head) return null;
    if (!head.startsWith('chunked:')) return head;
    const count = parseInt(head.slice('chunked:'.length), 10);
    if (!Number.isFinite(count) || count <= 0) return null;
    const parts: string[] = [];
    for (let i = 0; i < count; i++) {
      const part = await SecureStore.getItemAsync(`${key}.${i}`);
      if (part == null) return null;
      parts.push(part);
    }
    return parts.join('');
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (value.length <= CHUNK_SIZE) {
      await SecureStore.setItemAsync(key, value);
      return;
    }
    const count = Math.ceil(value.length / CHUNK_SIZE);
    for (let i = 0; i < count; i++) {
      await SecureStore.setItemAsync(
        `${key}.${i}`,
        value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)
      );
    }
    await SecureStore.setItemAsync(key, `chunked:${count}`);
  },
  removeItem: async (key: string): Promise<void> => {
    const head = await SecureStore.getItemAsync(key);
    if (head?.startsWith('chunked:')) {
      const count = parseInt(head.slice('chunked:'.length), 10);
      if (Number.isFinite(count)) {
        for (let i = 0; i < count; i++) {
          await SecureStore.deleteItemAsync(`${key}.${i}`);
        }
      }
    }
    await SecureStore.deleteItemAsync(key);
  },
};

// Web has no SecureStore — fall back to in-memory (no persistence) to avoid
// putting tokens in localStorage. The mobile app is the only supported target.
const memoryStore = (() => {
  const map = new Map<string, string>();
  return {
    getItem: async (k: string) => map.get(k) ?? null,
    setItem: async (k: string, v: string) => {
      map.set(k, v);
    },
    removeItem: async (k: string) => {
      map.delete(k);
    },
  };
})();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === 'web' ? memoryStore : SecureStoreChunkedAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
});
