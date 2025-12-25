import React, { useMemo } from 'react';
import { Text, View } from 'react-native';

import { HomeAuctionItem } from '../../data/homeFeed';
import { Badge, Card, useTheme } from '../../ui';
import { getDemoModelById } from '../../data/demoModels';

type Props = {
  auction: HomeAuctionItem;
};

export function AuctionCard({ auction }: Props) {
  const { theme } = useTheme();
  const model = getDemoModelById(auction.modelId);

  const endsText = useMemo(() => {
    if (!auction.endsAtISO) return null;
    const endsAt = new Date(auction.endsAtISO).getTime();
    const now = Date.now();
    const hours = Math.max(1, Math.round((endsAt - now) / (1000 * 60 * 60)));
    return endsAt > now ? `Ending in ${hours}h` : 'Ended';
  }, [auction.endsAtISO]);

  const statusTone: 'default' | 'primary' | 'warning' =
    auction.status === 'ending_soon'
      ? 'warning'
      : auction.status === 'live'
        ? 'primary'
        : 'default';

  return (
    <Card style={{ gap: theme.spacing.sm, padding: theme.spacing.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={[theme.typography.subtitle, { color: theme.colors.text }]}>
          {auction.title}
        </Text>
        <Badge tone={statusTone}>
          {auction.status === 'ending_soon' ? 'Ending Soon' : auction.status === 'live' ? 'Live' : 'Ended'}
        </Badge>
      </View>
      <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>
        {model?.name ?? 'Synthara Model'}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
        <Badge label={`Bid · ${auction.currentBidGold} Gold`} />
        {endsText ? <Badge tone="default" label={endsText} /> : null}
      </View>
    </Card>
  );
}
