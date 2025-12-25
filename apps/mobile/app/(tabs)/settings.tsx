import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Switch, Text, TextInput, View } from 'react-native';

import { useDemoIdentity } from '../../src/hooks/useDemoIdentity';
import { useDemoIdentityStore } from '../../src/state/demoIdentity';
import { useGoldStore } from '../../src/state/gold';
import { Badge, Button, Card, Screen, SectionHeader, useTheme } from '../../src/ui';

export default function SettingsTab() {
  const walletAddress = useGoldStore((state) => state.walletAddress);
  const setWalletAddress = useGoldStore((state) => state.setWalletAddress);
  const apiSyncEnabled = useGoldStore((state) => state.apiSyncEnabled);
  const setApiSyncEnabled = useGoldStore((state) => state.setApiSyncEnabled);
  const inventoryApiEnabled = useGoldStore((state) => state.inventoryApiEnabled);
  const setInventoryApiEnabled = useGoldStore((state) => state.setInventoryApiEnabled);
  const syncFromApi = useGoldStore((state) => state.syncFromApi);
  const { enabled: demoEnabled, userId: demoUserId, isCreator, isFan } = useDemoIdentity();
  const setDemoRole = useDemoIdentityStore((state) => state.setRole);
  const toggleDemoEnabled = useDemoIdentityStore((state) => state.toggleEnabled);
  const [walletInput, setWalletInput] = useState(walletAddress ?? '');
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const { theme } = useTheme();

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
    <Screen>
      <View style={{ gap: theme.spacing.lg }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: theme.spacing.md,
          }}
        >
          <SectionHeader title="Settings" subtitle="UI-only placeholders" />
          {demoEnabled ? <Badge label="Demo Mode" tone="warning" /> : null}
        </View>

        <Card muted>
          <SectionHeader title="Web3 Login" subtitle="Wallet connection placeholder" />
          <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>
            Placeholder for wallet connection and signing.
          </Text>
        </Card>

        <Card>
          <SectionHeader title="Notifications" subtitle="Drops and auction reminders" />
          <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>
            Opt into Gold drops and auction reminders.
          </Text>
        </Card>

        <Card>
          <SectionHeader title="Demo Identity" subtitle="Local-only identity for preview and demos." />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: theme.spacing.md,
              marginTop: theme.spacing.sm,
            }}
          >
            <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>
              Enable Demo Mode
            </Text>
            <Switch
              value={demoEnabled}
              onValueChange={toggleDemoEnabled}
              thumbColor={demoEnabled ? theme.colors.primary : theme.colors.surfaceMuted}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primarySoft,
              }}
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              gap: theme.spacing.sm,
              marginTop: theme.spacing.md,
            }}
          >
            <Button
              label="Fan"
              onPress={() => setDemoRole('fan')}
              variant={isFan ? 'primary' : 'secondary'}
              disabled={!demoEnabled}
              style={!demoEnabled ? { opacity: 0.6 } : undefined}
            />
            <Button
              label="Creator"
              onPress={() => setDemoRole('creator')}
              variant={isCreator ? 'primary' : 'secondary'}
              disabled={!demoEnabled}
              style={!demoEnabled ? { opacity: 0.6 } : undefined}
            />
          </View>
          <Text
            style={[
              theme.typography.caption,
              { color: theme.colors.subdued, marginTop: theme.spacing.sm },
            ]}
          >
            User ID: {demoUserId}
          </Text>
        </Card>

        <Card>
          <SectionHeader title="Wallet" subtitle="Setup for daily claims" />
          <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>
            Set a wallet address to unlock daily claims.
          </Text>
          <TextInput
            value={walletInput}
            onChangeText={setWalletInput}
            placeholder="0x..."
            placeholderTextColor={theme.colors.subdued}
            style={{
              backgroundColor: theme.colors.input,
              borderWidth: 1,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.md,
              paddingHorizontal: theme.spacing.md,
              paddingVertical: theme.spacing.sm,
              marginTop: theme.spacing.sm,
              color: theme.colors.text,
            }}
            autoCapitalize="none"
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: theme.spacing.sm,
              gap: theme.spacing.sm,
            }}
          >
            <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>
              {walletAddress ? `Current: ${walletAddress}` : 'Not connected'}
            </Text>
            <Button
              label={walletSaved ? 'Saved' : 'Save'}
              onPress={handleSaveWallet}
              disabled={walletSaved}
              variant={walletSaved ? 'secondary' : 'primary'}
              style={walletSaved ? { opacity: 0.7 } : undefined}
            />
          </View>
        </Card>

        <Card>
          <SectionHeader title="Economy API" subtitle="Read-only snapshot mode" />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: theme.spacing.md,
            }}
          >
            <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>
              Use API snapshot (read-only)
            </Text>
            <Switch
              value={apiSyncEnabled}
              onValueChange={setApiSyncEnabled}
              thumbColor={apiSyncEnabled ? theme.colors.primary : theme.colors.surfaceMuted}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primarySoft,
              }}
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: theme.spacing.md,
              marginTop: theme.spacing.sm,
            }}
          >
            <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>
              Sync inventory from API
            </Text>
            <Switch
              value={inventoryApiEnabled}
              onValueChange={setInventoryApiEnabled}
              thumbColor={inventoryApiEnabled ? theme.colors.primary : theme.colors.surfaceMuted}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primarySoft,
              }}
            />
          </View>
          <Button
            label={syncLoading ? 'Syncing...' : 'Sync now'}
            onPress={handleSync}
            disabled={(!apiSyncEnabled && !inventoryApiEnabled) || syncLoading}
            variant="secondary"
            style={{ marginTop: theme.spacing.sm, alignSelf: 'flex-start' }}
            textStyle={
              (!apiSyncEnabled && !inventoryApiEnabled) || syncLoading
                ? { color: theme.colors.subdued }
                : undefined
            }
          />
          {syncStatus ? (
            <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>
              {syncStatus}
            </Text>
          ) : null}
        </Card>

        {__DEV__ ? (
          <Card>
            <SectionHeader title="Developer" subtitle="Local analytics summary" />
            <Button label="Open Analytics" onPress={() => router.push('/dev-analytics')} />
          </Card>
        ) : null}
      </View>
    </Screen>
  );
}
