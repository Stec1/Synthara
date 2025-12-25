import React from 'react';
import { ScrollView, Text, View } from 'react-native';

import { useModels } from '../../src/api/hooks';
import { DEMO_MODELS } from '../../src/data/demoModels';
import { getHomeFeed } from '../../src/data/homeFeed';
import { AuctionCard } from '../../src/components/homeV2/AuctionCard';
import { DropCard } from '../../src/components/homeV2/DropCard';
import { FeaturedModelCard } from '../../src/components/homeV2/FeaturedModelCard';
import { HeroBanner } from '../../src/components/homeV2/HeroBanner';
import { HorizontalModelCarousel } from '../../src/components/homeV2/HorizontalModelCarousel';
import { Badge, Card, Screen, SectionHeader, useTheme } from '../../src/ui';

export default function HomeScreen() {
  const { data: models = [] } = useModels();
  const { theme } = useTheme();
  const feed = getHomeFeed();

  return (
    <Screen>
      <View style={{ gap: theme.spacing.xl }}>
        <HeroBanner />

        <View style={{ gap: theme.spacing.md }}>
          <SectionHeader title="Featured Model" subtitle="Ready-to-own spotlight." />
          <FeaturedModelCard modelId={feed.featuredModelId} />
        </View>

        <View style={{ gap: theme.spacing.md }}>
          <SectionHeader title="Trending Models" subtitle="Tap a passport for instant context." />
          {models.length === 0 ? (
            <Card muted>
              <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>
                Live models sync in the background. Demo passports stay ready to explore.
              </Text>
            </Card>
          ) : (
            <Card
              style={{
                gap: theme.spacing.sm,
                backgroundColor: theme.colors.surfaceMuted,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                <Badge tone="primary" label="Live feed" />
                <Text style={[theme.typography.caption, { color: theme.colors.subdued }]}>
                  Network models refreshed
                </Text>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
                {models.slice(0, 3).map((model) => (
                  <Badge key={model.id} label={model.name} />
                ))}
              </View>
            </Card>
          )}
          <HorizontalModelCarousel models={DEMO_MODELS} />
        </View>

        <View style={{ gap: theme.spacing.md }}>
          <SectionHeader title="Gold Drops Live" subtitle="Fixed-price releases in motion." />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: theme.spacing.md, paddingRight: theme.spacing.lg }}
          >
            {feed.drops.map((drop) => (
              <DropCard key={drop.id} drop={drop} />
            ))}
          </ScrollView>
        </View>

        <View style={{ gap: theme.spacing.md }}>
          <SectionHeader title="Auctions Ending Soon" subtitle="Diamond and Gold timers." />
          <View style={{ gap: theme.spacing.md }}>
            {feed.auctions.map((auction) => (
              <AuctionCard key={auction.id} auction={auction} />
            ))}
          </View>
        </View>
      </View>
    </Screen>
  );
}
