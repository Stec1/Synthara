import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

import { useModelDetail } from '../../src/api/hooks';
import { Badge, Button, Card, Screen, SectionHeader, useTheme } from '../../src/ui';

export default function ModelProfileScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const modelId = Number(params.id);
  const { data } = useModelDetail(Number.isNaN(modelId) ? undefined : modelId);
  const { theme } = useTheme();

  if (!modelId) {
    return (
      <Screen scroll={false}>
        <Card>
          <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>
            Missing model id
          </Text>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ gap: theme.spacing.lg }}>
        <View style={{ gap: theme.spacing.sm }}>
          <Text style={[theme.typography.title, { color: theme.colors.text }]}>
            {data?.name ?? 'Model Profile'}
          </Text>
          {data?.tagline ? (
            <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>
              {data.tagline}
            </Text>
          ) : null}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs }}>
            {data?.tags.map((tag) => (
              <Badge key={tag} tone="primary" label={`#${tag}`} />
            ))}
          </View>
        </View>

        <View style={{ gap: theme.spacing.md }}>
          <SectionHeader
            title="LoRA Vault"
            subtitle="Wireframe list of model-owned LoRAs."
          />
          {data?.loras?.length ? (
            data.loras.map((lora) => (
              <Card key={lora.id}>
                <Text style={[theme.typography.subtitle, { color: theme.colors.text }]}>
                  {lora.version}
                </Text>
                <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>
                  {lora.passport_metadata}
                </Text>
              </Card>
            ))
          ) : (
            <Card muted>
              <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>
                No assets yet.
              </Text>
            </Card>
          )}
        </View>

        <View style={{ gap: theme.spacing.md }}>
          <SectionHeader
            title="Gold Access"
            subtitle="GoldAccessCard placeholder per model."
          />
          <Card>
            <Text style={[theme.typography.subtitle, { color: theme.colors.text }]}>
              Gold Drop
            </Text>
            <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>
              {data?.gold.drop
                ? `${data.gold.drop.status} · ${data.gold.drop.remaining}/${data.gold.drop.supply} left`
                : 'No drop active'}
            </Text>
            <Button label="Buy Gold" variant="primary" />
          </Card>
          <Card>
            <Text style={[theme.typography.subtitle, { color: theme.colors.text }]}>
              Auction
            </Text>
            <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>
              {data?.gold.auction
                ? `Current bid ${data.gold.auction.current_bid}G · Ends ${new Date(
                    data.gold.auction.ends_at,
                  ).toLocaleString()}`
                : 'No auction live'}
            </Text>
            <Button label="Place Bid" variant="secondary" />
          </Card>
        </View>

        <Card muted>
          <SectionHeader
            title="Ownership"
            subtitle="OwnershipCard placeholder for this profile."
          />
          <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>
            Wallet link placeholder. Web3 connect coming soon.
          </Text>
        </Card>

        <Card>
          <SectionHeader title="Games" subtitle="Durak-inspired queue placeholder." />
          <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>
            Gold gated entry. Prototype coming soon.
          </Text>
          <Button label="Enter (mock)" variant="secondary" />
        </Card>
      </View>
    </Screen>
  );
}
