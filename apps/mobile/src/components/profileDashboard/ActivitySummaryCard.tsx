import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useEventLogStore } from '../../state/eventLog';
import { useGoldStore } from '../../state/gold';
import { Card, Theme, useTheme } from '../../ui';

type SummaryMetric = {
  label: string;
  value: string | number;
};

const formatNumber = (value: number | undefined) => {
  if (value === undefined) return '—';
  if (Number.isNaN(value)) return '—';
  return value;
};

export function ActivitySummaryCard() {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const transactions = useGoldStore((state) => state.transactions);
  const rewardTickets = useGoldStore((state) => state.rewardTickets);
  const perkInventory = useGoldStore((state) => state.perkInventory);
  const eventLog = useEventLogStore((state) => state.events);

  const goldEarned = useMemo(() => {
    if (transactions.length > 0) {
      return transactions.filter((tx) => tx.type === 'earn').reduce((acc, tx) => acc + tx.amount, 0);
    }
    const eventGold = eventLog.reduce((acc, event) => {
      if (event.metadata && typeof event.metadata.amount === 'number' && event.eventType.includes('GOLD')) {
        return acc + event.metadata.amount;
      }
      return acc;
    }, 0);
    return eventGold > 0 ? eventGold : undefined;
  }, [transactions, eventLog]);

  const goldSpent = useMemo(() => {
    if (transactions.length > 0) {
      return transactions.filter((tx) => tx.type === 'spend').reduce((acc, tx) => acc + tx.amount, 0);
    }
    return undefined;
  }, [transactions]);
  const rewardTicketsClaimed = useMemo(
    () => rewardTickets.filter((ticket) => ticket.status === 'CLAIMED').length,
    [rewardTickets],
  );
  const perksOwned = useMemo(
    () => perkInventory.filter((item) => !item.expiresAt || new Date(item.expiresAt) > new Date()).length,
    [perkInventory],
  );

  const metrics: SummaryMetric[] = [
    { label: 'Gold earned', value: formatNumber(goldEarned) },
    { label: 'Gold spent', value: formatNumber(goldSpent) },
    { label: 'Tickets claimed', value: formatNumber(rewardTicketsClaimed) },
    { label: 'Perks owned', value: formatNumber(perksOwned) },
  ];

  const hasEvents = eventLog.length > 0;

  return (
    <Card style={styles.card}>
      <View style={styles.metricsRow}>
        {metrics.map((metric) => (
          <View key={metric.label} style={styles.metricBox}>
            <Text style={styles.metricLabel}>{metric.label}</Text>
            <Text style={styles.metricValue}>{metric.value}</Text>
          </View>
        ))}
      </View>
      <View style={styles.noteRow}>
        <Text style={styles.noteText}>
          {hasEvents ? 'Live from your recent activity.' : 'Tracking will show once you start earning.'}
        </Text>
      </View>
    </Card>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      padding: theme.spacing.md,
      gap: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    metricsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.md,
    },
    metricBox: {
      flex: 1,
      minWidth: 120,
      padding: theme.spacing.sm,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: theme.spacing.xs,
    },
    metricLabel: {
      ...theme.typography.caption,
      color: theme.colors.subdued,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    metricValue: {
      ...theme.typography.heading,
      color: theme.colors.text,
    },
    noteRow: {
      paddingTop: theme.spacing.xs,
    },
    noteText: {
      ...theme.typography.body,
      color: theme.colors.subdued,
    },
  });
