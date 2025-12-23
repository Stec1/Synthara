import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';

import { useModels, useStartEmailAuth, useVerifyEmail } from '../../src/api/hooks';
import { useAuthStore } from '../../src/state/auth';
import { GoldWalletCard } from '../../src/components/GoldWalletCard';

export default function ProfileTab() {
  const token = useAuthStore((state) => state.token);
  const setToken = useAuthStore((state) => state.setToken);
  const { mutateAsync: startEmail } = useStartEmailAuth();
  const { mutateAsync: verifyEmail } = useVerifyEmail();
  const { data: models = [] } = useModels();

  const handleLogin = async () => {
    await startEmail('demo@synthara.ai');
    const { token: receivedToken } = await verifyEmail();
    setToken(receivedToken);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.heading}>My Profile</Text>
      <Text style={styles.body}>Role: creator (mocked)</Text>

      <GoldWalletCard />

      <View style={styles.authBox}>
        <Text style={styles.body}>Auth token: {token ?? 'not signed in'}</Text>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
          <Pressable style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Mock Email Login</Text>
          </Pressable>
          <Pressable style={[styles.button, styles.secondary]} onPress={() => setToken(null)}>
            <Text style={styles.secondaryText}>Sign Out</Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Saved Models</Text>
      {models.slice(0, 3).map((model) => (
        <Link
          key={model.id}
          href={{ pathname: '/profile/model', params: { id: String(model.id) } }}
          asChild
        >
          <Pressable style={styles.savedCard}>
            <Text style={styles.savedTitle}>{model.name}</Text>
            <Text style={styles.body}>{model.tagline}</Text>
          </Pressable>
        </Link>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0b0f',
  },
  heading: {
    color: '#f5f5f5',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  body: {
    color: '#c5cad3',
  },
  authBox: {
    backgroundColor: '#15151f',
    padding: 16,
    borderRadius: 12,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#252537',
  },
  button: {
    backgroundColor: '#f7c948',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  buttonText: {
    color: '#0b0b0f',
    fontWeight: '700',
  },
  secondary: {
    backgroundColor: '#1f1f2d',
  },
  secondaryText: {
    color: '#f5f5f5',
    fontWeight: '700',
  },
  sectionTitle: {
    color: '#f5f5f5',
    fontSize: 18,
    fontWeight: '700',
    marginVertical: 12,
  },
  savedCard: {
    backgroundColor: '#15151f',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#252537',
  },
  savedTitle: {
    color: '#f5f5f5',
    fontSize: 16,
    fontWeight: '700',
  },
});
