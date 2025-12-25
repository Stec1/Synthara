import React from 'react';
import { Text, View } from 'react-native';

import { Badge, Card, Screen, SectionHeader, useTheme } from '../../src/ui';

export default function GameTab() {
  const { theme } = useTheme();

  return (
    <Screen>
      <View style={{ gap: theme.spacing.lg }}>
        <View style={{ gap: theme.spacing.xs }}>
          <Text style={[theme.typography.title, { color: theme.colors.text }]}>Games</Text>
          <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>
            Durak-inspired modes coming soon.
          </Text>
        </View>

        <View style={{ gap: theme.spacing.md }}>
          <SectionHeader title="Mode Queue" subtitle="Wireframe-only placeholders" />
          <Card>
            <Text style={[theme.typography.subtitle, { color: theme.colors.text }]}>
              Durak Arena
            </Text>
            <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>
              Gold required to enter. Matchmaking in progress.
            </Text>
            <Badge tone="primary" label="Requires Gold" />
          </Card>

          <Card>
            <Text style={[theme.typography.subtitle, { color: theme.colors.text }]}>
              Solo Challenges
            </Text>
            <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>
              Practice hands with your favorite AI models.
            </Text>
            <Badge tone="primary" label="Requires Gold" />
          </Card>
        </View>

        <Card muted>
          <SectionHeader
            title="Game Rewards"
            subtitle="Placeholder for drop and leaderboard summaries."
          />
          <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>
            Expect reward ladders, leaderboard callouts, and claim timers here. No mechanics are
            wired yet.
          </Text>
        </Card>
      </View>
    </Screen>
  );
}
