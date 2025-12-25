import React from 'react';
import { Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';

import { useModels, useStartEmailAuth, useVerifyEmail } from '../../src/api/hooks';
import { GoldWalletCard } from '../../src/components/GoldWalletCard';
import { DEMO_MODELS } from '../../src/data/demoModels';
import { useAuthStore } from '../../src/state/auth';
import { useGoldStore } from '../../src/state/gold';
import { Badge, Button, Card, Divider, Screen, SectionHeader, useTheme } from '../../src/ui';

export default function ProfileTab() {
  const token = useAuthStore((state) => state.token);
  const setToken = useAuthStore((state) => state.setToken);
  const { mutateAsync: startEmail } = useStartEmailAuth();
  const { mutateAsync: verifyEmail } = useVerifyEmail();
  const role = useGoldStore((state) => state.role);
  const { data: models = [] } = useModels();
  const { theme } = useTheme();
  const router = useRouter();

  const handleLogin = async () => {
    await startEmail('demo@synthara.ai');
    const { token: receivedToken } = await verifyEmail();
    setToken(receivedToken);
  };

  return (
    <Screen>
      <View style={{ gap: theme.spacing.lg }}>
        <View style={{ gap: theme.spacing.xs }}>
          <Text style={[theme.typography.title, { color: theme.colors.text }]}>My Profile</Text>
          <Badge label={`Role: ${role ?? 'creator'}`} tone="primary" />
        </View>

        <GoldWalletCard />

        <Card>
          <SectionHeader title="Authentication" subtitle="Mock email login flow" />
          <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>
            Auth token: {token ?? 'not signed in'}
          </Text>
          <View style={{ flexDirection: 'row', gap: theme.spacing.md, flexWrap: 'wrap' }}>
            <Button label="Mock Email Login" onPress={handleLogin} />
            <Button label="Sign Out" variant="secondary" onPress={() => setToken(null)} />
          </View>
        </Card>

        <Card>
          <SectionHeader
            title="Demo Models"
            subtitle="Jump directly into the model passport story."
          />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
            <Button
              label="Open Ember Rayne Passport"
              onPress={() =>
                router.push({
                  pathname: '/profile/model/[modelId]',
                  params: { modelId: DEMO_MODELS[0].id },
                })
              }
            />
            <Button
              label="Open Another Model Passport"
              variant="secondary"
              onPress={() =>
                router.push({
                  pathname: '/profile/model/[modelId]',
                  params: { modelId: DEMO_MODELS[1]?.id ?? 'model-lyra-shift' },
                })
              }
            />
          </View>
        </Card>

        <View style={{ gap: theme.spacing.md }}>
          <SectionHeader
            title="Saved Models"
            subtitle="Recently viewed and bookmarked creators."
          />
          {models.slice(0, 3).map((model) => (
            <Link
              key={model.id}
              href={{ pathname: '/profile/model', params: { id: String(model.id) } }}
              asChild
            >
              <Card muted>
                <Text style={[theme.typography.subtitle, { color: theme.colors.text }]}>
                  {model.name}
                </Text>
                <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>
                  {model.tagline}
                </Text>
              </Card>
            </Link>
          ))}
        </View>

        <Card muted>
          <SectionHeader
            title="Ownership"
            subtitle="OwnershipCard placeholder to summarize your stakes."
          />
          <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>
            Wallet-linked ownership recaps and perks will render here. No business logic is wired in
            yet.
          </Text>
          <Divider />
          <Text style={[theme.typography.caption, { color: theme.colors.subdued }]}>
            Placeholder only. Connectors and balances remain mocked.
          </Text>
        </Card>
      </View>
    </Screen>
  );
}
