import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { finishGamePreviewMatch, startGamePreviewMatch } from '../../src/api/client';
import { logEvent } from '../../src/api/events';
import { useEntitlementsStore } from '../../src/state/entitlements';
import { type RewardTicket, useGoldStore } from '../../src/state/gold';
import { Badge, Button, Card, Screen, SectionHeader, useTheme } from '../../src/ui';

export default function GameTab() {
  const canAccessGameRoom = useEntitlementsStore(
    (state) => state.entitlements.CAN_ACCESS_GAME_ROOM ?? false,
  );
  const { theme } = useTheme();
  const addRewardTicket = useGoldStore((state) => state.addRewardTicket);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [finishLoading, setFinishLoading] = useState<null | 'WIN' | 'LOSS' | 'DRAW'>(null);

  const actionDisabled = useMemo(() => loading || finishLoading !== null, [finishLoading, loading]);

  const handleStart = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const response = await startGamePreviewMatch();
      const startedId = response.data.matchId as string;
      setMatchId(startedId);
      setStatus('Match started. Play a quick preview round!');
      void logEvent('GAME_MATCH_STARTED', { matchId: startedId });
    } catch (_error) {
      setStatus('Failed to start match.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async (outcome: 'WIN' | 'LOSS' | 'DRAW') => {
    if (!matchId) {
      setStatus('Start a match first.');
      return;
    }
    setFinishLoading(outcome);
    try {
      const response = await finishGamePreviewMatch({ matchId, outcome, modelId: 'model-preview' });
      const payload = response.data as {
        rewardTicket?: RewardTicket;
        outcome: string;
      };
      setStatus('Preview match finished.');
      void logEvent('GAME_MATCH_FINISHED', { matchId, outcome });
      if (payload.rewardTicket) {
        const normalizedTicket: RewardTicket = {
          ...payload.rewardTicket,
          createdAt: payload.rewardTicket.createdAt ?? new Date().toISOString(),
          source: 'GAME_MATCH',
        };
        addRewardTicket(normalizedTicket);
        setStatus('Reward ticket received');
        void logEvent('REWARD_TICKET_CREATED', {
          matchId,
          ticketId: normalizedTicket.id,
          rewardKind: normalizedTicket.reward.kind,
        });
      }
      setMatchId(null);
    } catch (_error) {
      setStatus('Failed to finish match.');
    } finally {
      setFinishLoading(null);
    }
  };

  return (
    <Screen>
      <View style={{ gap: theme.spacing.lg }}>
        <View style={{ gap: theme.spacing.xs }}>
          <Text style={[theme.typography.title, { color: theme.colors.text }]}>Games</Text>
          <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>
            Durak-inspired modes coming soon.
          </Text>
        </View>

        {!canAccessGameRoom ? (
          <Card muted>
            <SectionHeader title="Game Room Locked" subtitle="Access gated by entitlement." />
            <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>
              Games unlock with the proper access entitlement. Stay tuned for upcoming events.
            </Text>
          </Card>
        ) : null}

        <View style={{ gap: theme.spacing.md }}>
          <SectionHeader title="Mode Queue" subtitle="Wireframe-only placeholders" />
          <Card>
            <Text style={[theme.typography.subtitle, { color: theme.colors.text }]}>Durak Arena</Text>
            <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>
              Gold required to enter. Matchmaking in progress.
            </Text>
            <Badge tone="primary" label="Requires Gold" />
          </Card>

          <Card style={{ gap: theme.spacing.sm }}>
            <SectionHeader title="Game Loop Preview" subtitle="Mock a quick match into rewards." />
            <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>
              Run a local-only preview of the game loop. Start a mock match, pick an outcome, and
              collect the resulting reward ticket without leaving this tab.
            </Text>
            <Button
              label={matchId ? 'Match Started' : 'Start Match (Preview)'}
              onPress={handleStart}
              disabled={actionDisabled || Boolean(matchId)}
            />
            {loading ? <ActivityIndicator color={theme.colors.primary} /> : null}
            {matchId ? (
              <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
                <Button
                  label="Win"
                  onPress={() => handleFinish('WIN')}
                  disabled={actionDisabled}
                  variant="primary"
                  style={{ flex: 1 }}
                />
                <Button
                  label="Loss"
                  onPress={() => handleFinish('LOSS')}
                  disabled={actionDisabled}
                  variant="secondary"
                  style={{ flex: 1 }}
                />
                <Button
                  label="Draw"
                  onPress={() => handleFinish('DRAW')}
                  disabled={actionDisabled}
                  variant="secondary"
                  style={{ flex: 1 }}
                />
              </View>
            ) : null}
            {finishLoading ? <ActivityIndicator color={theme.colors.primary} /> : null}
            {status ? (
              <Text style={[theme.typography.body, { color: theme.colors.text }]}>{status}</Text>
            ) : null}
          </Card>

          <Card muted>
            <SectionHeader title="Game Rewards" subtitle="Placeholder for drop and leaderboard summaries." />
            <Text style={[theme.typography.body, { color: theme.colors.subdued }]}>
              Expect reward ladders, leaderboard callouts, and claim timers here. No mechanics are wired
              yet.
            </Text>
          </Card>
        </View>
      </View>
    </Screen>
  );
}
