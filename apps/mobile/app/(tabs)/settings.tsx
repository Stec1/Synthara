import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { useGoldStore } from '../../src/state/gold';

export default function SettingsTab() {
  const walletAddress = useGoldStore((state) => state.walletAddress);
  const setWalletAddress = useGoldStore((state) => state.setWalletAddress);
  const apiSyncEnabled = useGoldStore((state) => state.apiSyncEnabled);
  const setApiSyncEnabled = useGoldStore((state) => state.setApiSyncEnabled);
  const syncFromApi = useGoldStore((state) => state.syncFromApi);
  const [walletInput, setWalletInput] = useState(walletAddress ?? '');
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);

  const walletSaved = useMemo(
    () => walletInput.trim().length > 0 && walletInput.trim() === (walletAddress ?? ''),
    [walletAddress, walletInput],
  );

  const handleSaveWallet = () => {
    const trimmed = walletInput.trim();
    setWalletAddress(trimmed.length > 0 ? trimmed : null);
  };

  const handleSync = async () => {
    setSyncLoading(true);
    const res = await syncFromApi();
    setSyncStatus(res.ok ? 'Synced snapshot' : res.reason ?? 'Sync failed');
    setSyncLoading(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.heading}>Settings</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Web3 Login</Text>
        <Text style={styles.body}>Placeholder for wallet connection and signing.</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Notifications</Text>
        <Text style={styles.body}>Opt into Gold drops and auction reminders.</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Wallet</Text>
        <Text style={styles.body}>Set a wallet address to unlock daily claims.</Text>
        <TextInput
          value={walletInput}
          onChangeText={setWalletInput}
          placeholder="0x..."
          placeholderTextColor="#656b7b"
          style={styles.input}
          autoCapitalize="none"
        />
        <View style={styles.rowBetween}>
          <Text style={styles.body}>
            {walletAddress ? `Current: ${walletAddress}` : 'Not connected'}
          </Text>
          <Pressable
            style={[styles.button, walletSaved && styles.buttonDisabled]}
            onPress={handleSaveWallet}
            disabled={walletSaved}
          >
            <Text style={[styles.buttonText, walletSaved && styles.buttonTextMuted]}>
              {walletSaved ? 'Saved' : 'Save'}
            </Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Economy API</Text>
        <Text style={styles.body}>Use read-only snapshots from the API when available.</Text>
        <View style={styles.rowBetween}>
          <Text style={styles.body}>Use API snapshot (read-only)</Text>
          <Switch
            value={apiSyncEnabled}
            onValueChange={setApiSyncEnabled}
            thumbColor={apiSyncEnabled ? '#f7c948' : '#37374a'}
            trackColor={{ false: '#1f1f2d', true: '#5c4900' }}
          />
        </View>
        <Pressable
          style={[styles.button, styles.syncButton]}
          onPress={handleSync}
          disabled={!apiSyncEnabled || syncLoading}
        >
          <Text
            style={[
              styles.buttonText,
              (!apiSyncEnabled || syncLoading) && styles.buttonTextMuted,
            ]}
          >
            {syncLoading ? 'Syncing...' : 'Sync now'}
          </Text>
        </Pressable>
        {syncStatus ? <Text style={styles.body}>{syncStatus}</Text> : null}
      </View>
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
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  card: {
    backgroundColor: '#15151f',
    padding: 14,
    borderRadius: 10,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#252537',
  },
  cardTitle: {
    color: '#f5f5f5',
    fontSize: 18,
    fontWeight: '700',
  },
  body: {
    color: '#c5cad3',
    marginTop: 4,
  },
  input: {
    backgroundColor: '#0b0b0f',
    borderWidth: 1,
    borderColor: '#252537',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 10,
    color: '#f5f5f5',
  },
  button: {
    backgroundColor: '#f7c948',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  buttonDisabled: {
    backgroundColor: '#2a2a36',
  },
  buttonText: {
    color: '#0b0b0f',
    fontWeight: '700',
  },
  buttonTextMuted: {
    color: '#8d93a3',
  },
  syncButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
});
