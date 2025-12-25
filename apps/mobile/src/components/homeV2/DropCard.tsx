import React, { useMemo } from 'react';
import { Text, View } from 'react-native';

import { HomeDropItem } from '../../data/homeFeed';
import { Badge, Card, useTheme } from '../../ui';
import { getDemoModelById } from '../../data/demoModels';

type Props = {
  drop: HomeDropItem;
};

export function DropCard({ drop }: Props) {
  const { theme } = useTheme();
  const model = getDemoModelById(drop.modelId);

  const endsText = useMemo(() => {
    if (!drop.endsAtISO) return null;
    const endsAt = new Date(drop.endsAtISO).getTime();
    const now = Date.now();
    const hours = Math.max(1, Math.round((endsAt - now) / (1000 * 60 * 60)));
    return endsAt > now ? `Ends in ${hours}h` : 'Ended';
  }, [drop.endsAtISO]);

  const statusTone: 'default' | 'primary' | 'warning' =
    drop.status === 'live' ? 'primary' : drop.status === 'soon' ? 'warning' : 'default';

  return (
    <Card
      style={{
        width: 260,
        gap: theme.spacing.sm,
        padding: theme.spacing.lg,
      }}
    >
      <View style={{ gap: theme.spacing.xs }}>
        <Text style={[theme.typography.subtitle, { color: theme.colors.text }]}>{drop.title}</Text>
        <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>
          {model?.name ?? 'Synthara Model'}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
        <Badge
          tone={statusTone}
          label={drop.status === 'live' ? 'Live' : drop.status === 'soon' ? 'Soon' : 'Ended'}
        />
        <Badge label={`${drop.priceGold} Gold`} />
      </View>
      {endsText ? (
        <Text style={[theme.typography.caption, { color: theme.colors.subdued }]}>{endsText}</Text>
      ) : null}
    </Card>
  );
}
