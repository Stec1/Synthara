import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { getDemoModelById } from '../../data/demoModels';
import { useModelRegistryStore } from '../../state/modelRegistry';
import { Theme, useTheme } from '../../ui';

type MiniModelCardProps = {
  modelId: string;
  relation: 'owned' | 'followed';
};

export function MiniModelCard({ modelId, relation }: MiniModelCardProps) {
  const { theme } = useTheme();
  const router = useRouter();
  const registeredModel = useModelRegistryStore((state) => state.getModelById(modelId));
  const model = getDemoModelById(modelId);
  const title = registeredModel?.displayName ?? model?.name;
  const subtitle = registeredModel?.bio ?? model?.tagline;

  if (!title || !subtitle) return null;

  const styles = createStyles(theme);
  const relationLabel = relation === 'owned' ? 'Owned' : 'Following';

  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: '/profile/model/[modelId]', params: { modelId } })
      }
      style={styles.card}
    >
      <View style={{ flex: 1, gap: theme.spacing.xs }}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{relationLabel}</Text>
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle} numberOfLines={2}>
          {subtitle}
        </Text>
      </View>
      <View style={styles.affordance}>
        <Text style={styles.affordanceText}>View Passport</Text>
      </View>
    </Pressable>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      padding: theme.spacing.md,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    title: {
      ...theme.typography.subtitle,
      color: theme.colors.text,
    },
    subtitle: {
      ...theme.typography.body,
      color: theme.colors.subdued,
    },
    badge: {
      alignSelf: 'flex-start',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.primarySoft,
    },
    badgeText: {
      ...theme.typography.caption,
      color: theme.colors.text,
    },
    affordance: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.primarySoft,
    },
    affordanceText: {
      ...theme.typography.label,
      color: theme.colors.primary,
    },
  });
