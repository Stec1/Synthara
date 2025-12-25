import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { DEMO_MODELS, getDemoModelById } from '../../data/demoModels';
import { DemoUserNftItem } from '../../data/demoUserAssets';
import { Theme, useTheme } from '../../ui';

type NftTierCardProps = {
  item: DemoUserNftItem;
};

const tierCopy: Record<DemoUserNftItem['tier'], { label: string; tone: 'diamond' | 'gold' }> = {
  diamond: { label: 'Diamond', tone: 'diamond' },
  gold: { label: 'Gold', tone: 'gold' },
};

export function NftTierCard({ item }: NftTierCardProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const router = useRouter();
  const model = getDemoModelById(item.modelId) ?? DEMO_MODELS[0];
  const tone = tierCopy[item.tier];

  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: '/profile/model/[modelId]', params: { modelId: model.id } })
      }
      style={[styles.card, item.tier === 'diamond' && styles.cardDiamond]}
    >
      <View style={styles.headerRow}>
        <View style={[styles.badge, item.tier === 'diamond' && styles.badgeDiamond]}>
          <Text style={styles.badgeText}>{tone.label}</Text>
        </View>
        {item.status !== 'owned' ? (
          <View style={styles.pillMuted}>
            <Text style={styles.pillText}>{item.status === 'locked' ? 'Locked' : 'Listed'}</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.label}>{item.label}</Text>
      <Text style={styles.modelName}>{model.name}</Text>
      <Text style={styles.subtitle} numberOfLines={2}>
        {model.tagline}
      </Text>
    </Pressable>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      padding: theme.spacing.md,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.primarySoft,
      gap: theme.spacing.sm,
    },
    cardDiamond: {
      borderColor: theme.colors.primary,
      shadowColor: '#000',
      shadowOpacity: 0.15,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    badge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.primarySoft,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    badgeDiamond: {
      borderColor: theme.colors.primary,
    },
    badgeText: {
      ...theme.typography.label,
      color: theme.colors.text,
    },
    label: {
      ...theme.typography.heading,
      color: theme.colors.primary,
    },
    modelName: {
      ...theme.typography.subtitle,
      color: theme.colors.text,
    },
    subtitle: {
      ...theme.typography.body,
      color: theme.colors.subdued,
    },
    pillMuted: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    pillText: {
      ...theme.typography.caption,
      color: theme.colors.subdued,
    },
  });
