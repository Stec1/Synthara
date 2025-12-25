import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useEntitlementsStore } from '../../state/entitlements';
import { Theme, useTheme } from '../../ui';

type Chip = {
  key: string;
  label: string;
  active: boolean;
};

export function AccessChipRow() {
  const { theme } = useTheme();
  const entitlements = useEntitlementsStore((state) => state.entitlements);
  const styles = createStyles(theme);

  const chips: Chip[] = [
    { key: 'CAN_ACCESS_GAME_ROOM', label: 'Game Access', active: entitlements.CAN_ACCESS_GAME_ROOM },
    { key: 'HAS_ACTIVE_GOLD_PASS', label: 'Gold Pass', active: entitlements.HAS_ACTIVE_GOLD_PASS },
    {
      key: 'CAN_VIEW_LORA_PASSPORT',
      label: 'LoRA Passport',
      active: entitlements.CAN_VIEW_LORA_PASSPORT,
    },
    {
      key: 'CAN_CLAIM_REWARD_TICKET',
      label: 'Reward Claims',
      active: entitlements.CAN_CLAIM_REWARD_TICKET,
    },
  ];

  return (
    <View style={styles.container}>
      {chips.map((chip) => (
        <View key={chip.key} style={[styles.chip, chip.active && styles.chipActive]}>
          <Text style={[styles.chipText, chip.active && styles.chipTextActive]}>{chip.label}</Text>
        </View>
      ))}
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    chip: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radius.pill,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceMuted,
    },
    chipActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primarySoft,
    },
    chipText: {
      ...theme.typography.label,
      color: theme.colors.subdued,
    },
    chipTextActive: {
      color: theme.colors.text,
    },
  });
