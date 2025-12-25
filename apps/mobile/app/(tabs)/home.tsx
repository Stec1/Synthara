import React from 'react';
import { Text, View } from 'react-native';

import { useModels } from '../../src/api/hooks';
import { ModelCard } from '../../src/components/ModelCard';
import {
  Badge,
  Card,
  Divider,
  Screen,
  SectionHeader,
  useTheme,
} from '../../src/ui';
import { useGoldStore } from '../../src/state/gold';

export default function HomeScreen() {
  const { data: models = [] } = useModels();
  const balance = useGoldStore((state) => state.balance);
  const { theme } = useTheme();

  return (
    <Screen>
      <View style={{ gap: theme.spacing.lg }}>
        <View style={{ gap: theme.spacing.sm }}>
          <Text style={[theme.typography.title, { color: theme.colors.text }]}>Synthara 3.0</Text>
          <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>
            Build, own, and play with AI influencer creators.
          </Text>
          <Badge tone="primary" label={`Gold Balance: ${balance}`} />
        </View>

        <View style={{ gap: theme.spacing.md }}>
          <SectionHeader title="Trending Models" subtitle="Fresh talent from the creator vault." />
          {models.length === 0 ? (
            <Card muted>
              <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>
                Models loading from the network.
              </Text>
            </Card>
          ) : null}
          {models.map((model) => (
            <ModelCard key={model.id} model={model} />
          ))}
        </View>

        <View style={{ gap: theme.spacing.md }}>
          <SectionHeader
            title="Gold Access"
            subtitle="GoldAccessCard placeholder for premium entry points."
          />
          <Card>
            <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>
              Early access queues and member-only drops will land here. Keep an eye on your pass
              status.
            </Text>
            <Divider />
            <Text style={[theme.typography.caption, { color: theme.colors.subdued }]}>
              Placeholder block only — no actions wired yet.
            </Text>
          </Card>
        </View>

        <View style={{ gap: theme.spacing.md }}>
          <SectionHeader title="Gold Drops Live" subtitle="Track fixed-price releases." />
          <Card>
            <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>
              Track fixed-price Gold drops and grab early access without leaving this screen.
            </Text>
          </Card>
        </View>

        <View style={{ gap: theme.spacing.md }}>
          <SectionHeader title="Auctions Ending Soon" subtitle="Diamond and Gold timers." />
          <Card>
            <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>
              Bid on Diamond and Gold auctions before timers expire. Upcoming bids will appear as a
              simple list here.
            </Text>
          </Card>
        </View>

        <View style={{ gap: theme.spacing.md }}>
          <SectionHeader
            title="Ownership"
            subtitle="OwnershipCard placeholder to recap your stakes."
          />
          <Card muted>
            <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>
              Showcase owned passes, shares, or collectibles once they are available in-app.
            </Text>
          </Card>
        </View>
      </View>
    </Screen>
  );
}
