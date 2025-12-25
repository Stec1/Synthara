import React from 'react';
import { ScrollView, Text, View } from 'react-native';

import { useEventLogStore } from '../src/state/eventLog';
import { useGoldStore } from '../src/state/gold';
import { Card, Screen, SectionHeader, useTheme } from '../src/ui';

export default function DevAnalyticsScreen() {
  const { theme } = useTheme();
  const transactions = useGoldStore((state) => state.transactions);
  const perkInventory = useGoldStore((state) => state.perkInventory);
  const rewardTickets = useGoldStore((state) => state.rewardTickets);
  const eventLog = useEventLogStore((state) => state.lastEvents(10));

  const totals = React.useMemo(() => {
    const earned = transactions.filter((tx) => tx.type === 'earn').reduce((sum, tx) => sum + tx.amount, 0);
    const spent = transactions.filter((tx) => tx.type === 'spend').reduce((sum, tx) => sum + tx.amount, 0);
    const perksOwned = perkInventory.length;
    const ticketsClaimed = rewardTickets.filter((ticket) => ticket.status === 'CLAIMED').length;
    return { earned, spent, perksOwned, ticketsClaimed };
  }, [transactions, perkInventory, rewardTickets]);

  if (!__DEV__) {
    return (
      <Screen>
        <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>
          Analytics available in development only.
        </Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: theme.spacing.lg }}>
        <SectionHeader title="Dev Analytics" subtitle="Local-only summary for debugging" />

        <Card>
          <SectionHeader title="Economy Summary" subtitle="Preview balances and ownership" />
          <View style={{ gap: theme.spacing.sm }}>
            <Text style={[theme.typography.body, { color: theme.colors.text }]}>
              Total Gold earned: {totals.earned}
            </Text>
            <Text style={[theme.typography.body, { color: theme.colors.text }]}>
              Total Gold spent: {totals.spent}
            </Text>
            <Text style={[theme.typography.body, { color: theme.colors.text }]}>
              Perks owned: {totals.perksOwned}
            </Text>
            <Text style={[theme.typography.body, { color: theme.colors.text }]}>
              Reward tickets claimed: {totals.ticketsClaimed}
            </Text>
          </View>
        </Card>

        <Card>
          <SectionHeader title="Event Log" subtitle="Last 10 events (local)" />
          {eventLog.length === 0 ? (
            <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>No events logged yet.</Text>
          ) : (
            <View style={{ gap: theme.spacing.xs }}>
              {eventLog.map((event) => (
                <View key={event.id} style={{ paddingVertical: theme.spacing.xs, borderBottomWidth: 1, borderColor: theme.colors.border }}>
                  <Text style={[theme.typography.subtitle, { color: theme.colors.text }]}>{event.eventType}</Text>
                  <Text style={[theme.typography.caption, { color: theme.colors.subdued }]}>{new Date(event.ts).toLocaleString()}</Text>
                  {event.metadata ? (
                    <Text style={[theme.typography.caption, { color: theme.colors.subdued }]}>
                      {JSON.stringify(event.metadata)}
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>
          )}
        </Card>
      </ScrollView>
    </Screen>
  );
}
