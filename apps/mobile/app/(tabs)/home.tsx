import React, { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AutoSwipeCarousel } from '../../src/components/homeAvarK/AutoSwipeCarousel';
import { BottomMenuOverlay } from '../../src/components/homeAvarK/BottomMenuOverlay';
import { FloatingBurgerButton } from '../../src/components/homeAvarK/FloatingBurgerButton';
import { GlassModelCard } from '../../src/components/homeAvarK/GlassModelCard';
import { SyntharaHeader } from '../../src/components/homeAvarK/SyntharaHeader';
import { AuctionCard } from '../../src/components/homeV2/AuctionCard';
import { DropCard } from '../../src/components/homeV2/DropCard';
import { FeaturedModelCard } from '../../src/components/homeV2/FeaturedModelCard';
import { HeroBanner } from '../../src/components/homeV2/HeroBanner';
import { HorizontalModelCarousel } from '../../src/components/homeV2/HorizontalModelCarousel';
import { useModels } from '../../src/api/hooks';
import { DEMO_MODELS } from '../../src/data/demoModels';
import { getHomeFeed } from '../../src/data/homeFeed';
import { Badge, Card, Divider, Screen, SectionHeader, useTheme } from '../../src/ui';

const trendingImageSources = (() => {
  try {
    return [
      require('../../assets/models/trending_1.png'),
      require('../../assets/models/trending_2.png'),
      require('../../assets/models/trending_3.png'),
    ];
  } catch (error) {
    return [];
  }
})();

const featuredImageSource = (() => {
  try {
    return require('../../assets/models/featured.png');
  } catch (error) {
    return undefined;
  }
})();

export default function HomeScreen() {
  const router = useRouter();
  const { data: models = [] } = useModels();
  const { theme } = useTheme();
  const feed = getHomeFeed();
  const [menuVisible, setMenuVisible] = useState(false);

  const trendingModels = useMemo(
    () => (models.length > 0 ? models.slice(0, 3) : DEMO_MODELS.slice(0, 3)),
    [models],
  );
  const featuredModel = useMemo(() => models[0] ?? DEMO_MODELS[0], [models]);

  const handleModelPress = (id: number | string) =>
    router.push({ pathname: '/profile/model', params: { id: String(id) } });

  return (
    <Screen scroll={false} style={{ backgroundColor: '#05050d' }}>
      <View style={{ flex: 1 }}>
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#05050d',
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: -140,
            right: -60,
            width: 260,
            height: 260,
            borderRadius: 200,
            backgroundColor: 'rgba(88,64,255,0.22)',
            opacity: 0.7,
          }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: -100,
            left: -60,
            width: 240,
            height: 240,
            borderRadius: 200,
            backgroundColor: 'rgba(247,201,72,0.12)',
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.45)',
          }}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: theme.spacing.xxl * 2,
            gap: theme.spacing.xl,
          }}
        >
          <SyntharaHeader />

          <View style={{ gap: theme.spacing.sm }}>
            <Text style={[theme.typography.caption, { color: 'rgba(255,255,255,0.6)' }]}>
              Trending passports
            </Text>
            <AutoSwipeCarousel
              items={trendingModels}
              renderItem={({ item, index }) => (
                <GlassModelCard
                  model={item}
                  variant="trending"
                  imageSource={trendingImageSources[index]}
                  onPress={() => handleModelPress(item.id)}
                />
              )}
            />
          </View>

          <View style={{ gap: theme.spacing.md }}>
            <Text style={[theme.typography.caption, { color: 'rgba(255,255,255,0.6)' }]}>
              Featured
            </Text>
            <GlassModelCard
              model={featuredModel}
              variant="featured"
              imageSource={featuredImageSource}
              onPress={() => handleModelPress(featuredModel.id)}
            />
          </View>

          <Divider />

          <View style={{ gap: theme.spacing.md }}>
            <SectionHeader title="Marketplace pulse" subtitle="Stay close to the drops." />
            <HeroBanner />

            <Card style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)' }}>
              <View style={{ gap: theme.spacing.sm }}>
                <SectionHeader title="Featured Model" subtitle="Ready-to-own spotlight." />
                <FeaturedModelCard modelId={feed.featuredModelId} />
              </View>
            </Card>

            <Card style={{ gap: theme.spacing.md, backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)' }}>
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
            </Card>

            <Card style={{ gap: theme.spacing.md, backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)' }}>
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
            </Card>

            <Card style={{ gap: theme.spacing.md, backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)' }}>
              <SectionHeader title="Auctions Ending Soon" subtitle="Diamond and Gold timers." />
              <View style={{ gap: theme.spacing.md }}>
                {feed.auctions.map((auction) => (
                  <AuctionCard key={auction.id} auction={auction} />
                ))}
              </View>
            </Card>
          </View>
        </ScrollView>

        <FloatingBurgerButton onPress={() => setMenuVisible(true)} />
        <BottomMenuOverlay
          visible={menuVisible}
          onClose={() => setMenuVisible(false)}
          onNavigate={(route) => {
            setMenuVisible(false);
            if (route === 'profile') {
              router.push('/profile');
            } else if (route === 'game') {
              router.push('/game');
            } else if (route === 'settings') {
              router.push('/settings');
            } else {
              router.push('/about');
            }
          }}
        />
      </View>
    </Screen>
  );
}
