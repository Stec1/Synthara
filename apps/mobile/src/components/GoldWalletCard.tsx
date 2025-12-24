import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';

import {
  calcDailyClaimAmount,
  canClaimDailyUtc,
  formatRemaining,
  getPerkEffectsForOwned,
  useGoldStore,
  UserRole,
} from '../state/gold';
import { calculateGoldPoints } from '../domain/rewardEngine';

const roles: UserRole[] = ['fan', 'creator', 'admin'];

const formatDate = (value?: string) => {
  if (!value) return 'Not active';
  return new Date(value).toLocaleDateString();
};

const shorten = (value: string) =>
  value.length > 12 ? `${value.slice(0, 6)}…${value.slice(-4)}` : value;

export function GoldWalletCard() {
  const router = useRouter();
  const [claimStatus, setClaimStatus] = useState<string | null>(null);
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  const role = useGoldStore((state) => state.role);
  const balance = useGoldStore((state) => state.balance);
  const perk = useGoldStore((state) => state.perk);
  const perkInventory = useGoldStore((state) => state.perkInventory);
  const perkCatalog = useGoldStore((state) => state.perkCatalog);
  const lastDailyClaimAt = useGoldStore((state) => state.lastDailyClaimAt);
  const dailyClaimStreak = useGoldStore((state) => state.dailyClaimStreak);
  const walletAddress = useGoldStore((state) => state.walletAddress);
  const actions = useGoldStore((state) => state.actions);
  const activeBoosts = useGoldStore((state) => state.activeBoosts);
  const earningLog = useGoldStore((state) => state.earningLog);
  const setRole = useGoldStore((state) => state.setRole);
  const claimDailyFromWallet = useGoldStore((state) => state.claimDailyFromWallet);
  const performEarningAction = useGoldStore((state) => state.performEarningAction);
  const canUseAction = useGoldStore((state) => state.canUseAction);
  const unlockGoldPass = useGoldStore((state) => state.unlockGoldPass);

  const perkEffects = useMemo(
    () => getPerkEffectsForOwned(perkInventory, perkCatalog),
    [perkInventory, perkCatalog],
  );
  const dailyClaimAvailability = useMemo(
    () => canClaimDailyUtc(lastDailyClaimAt),
    [lastDailyClaimAt],
  );
  const nextStreak = useMemo(() => {
    if (!lastDailyClaimAt) return 1;
    const last = new Date(lastDailyClaimAt).getTime();
    const elapsed = Date.now() - last;
    if (elapsed >= 24 * 60 * 60 * 1000 && elapsed <= 48 * 60 * 60 * 1000) {
      return dailyClaimStreak + 1;
    }
    if (elapsed > 48 * 60 * 60 * 1000) {
      return 1;
    }
    return Math.max(dailyClaimStreak, 1);
  }, [dailyClaimStreak, lastDailyClaimAt]);
  const dailyClaimAmount = useMemo(
    () => calcDailyClaimAmount(25, perkEffects, nextStreak, 0),
    [nextStreak, perkEffects],
  );
  const claimBlocked = !dailyClaimAvailability.ok;
  const claimHint = claimBlocked && dailyClaimAvailability.remainingMs !== undefined
    ? `Claim available in ${formatRemaining(dailyClaimAvailability.remainingMs)}`
    : 'Claim once every 24h (UTC)';
  const boostsChips = useMemo(() => {
    const chips: string[] = [];
    if (activeBoosts.dailyClaimMultiplier !== 1) {
      chips.push(`Daily x${activeBoosts.dailyClaimMultiplier.toFixed(1)}`);
    }
    if (activeBoosts.earningMultiplier !== 1) {
      chips.push(`Earnings x${activeBoosts.earningMultiplier.toFixed(1)}`);
    }
    if (activeBoosts.dailyLimitBonus !== 0) {
      chips.push(`Daily limits +${activeBoosts.dailyLimitBonus}`);
    }
    return chips;
  }, [activeBoosts]);
  const recentEarnings = useMemo(() => earningLog.slice(0, 5), [earningLog]);

  const handleDailyClaim = () => {
    const res = claimDailyFromWallet();
    if (res.ok) {
      setClaimStatus(`Claimed +${res.added ?? 0} Gold`);
    } else {
      setClaimStatus(res.reason ?? 'Unable to claim');
    }
  };

  const handleAction = (id: string, title: string, modelId?: string) => {
    const res = performEarningAction(id, modelId ? { modelId } : undefined);
    if (res.ok) {
      setActionStatus(`Earned +${res.added ?? 0} from ${title}`);
    } else {
      setActionStatus(res.reason ?? 'Action unavailable');
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Gold Wallet</Text>
        <Text style={styles.balance}>{balance} Gold</Text>
      </View>
      <Text style={styles.subdued}>Role</Text>
      <View style={styles.roleRow}>
        {roles.map((option) => (
          <Pressable
            key={option}
            onPress={() => setRole(option)}
            style={[styles.roleButton, role === option && styles.roleButtonActive]}
          >
            <Text style={[styles.roleText, role === option && styles.roleTextActive]}>
              {option.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.actions}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.subheading}>Daily claim</Text>
          {dailyClaimStreak > 0 && (
            <Text style={styles.streak}>Streak: {dailyClaimStreak}d</Text>
          )}
        </View>
        {!walletAddress ? (
          <View style={styles.walletRow}>
            <Text style={styles.body}>Connect wallet to claim daily Gold.</Text>
            <Pressable onPress={() => router.push('/(tabs)/settings')}>
              <Text style={styles.link}>Go to Settings</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.dailyBox}>
            <Text style={styles.body}>Wallet: {shorten(walletAddress)}</Text>
            <ActionButton
              label={`Claim daily +${dailyClaimAmount}`}
              onPress={handleDailyClaim}
              disabled={claimBlocked}
              hint={claimHint}
            />
            {claimStatus ? <Text style={styles.hint}>{claimStatus}</Text> : null}
          </View>
        )}

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.subheading}>Earn Gold</Text>
          {actionStatus ? <Text style={styles.hint}>{actionStatus}</Text> : null}
        </View>
        {actions.slice(0, 5).map((action) => {
          const modelId =
            action.id === 'VIEW_MODEL_PROFILE' || action.id === 'SHARE_PROFILE'
              ? 'demo-model'
              : undefined;
          const check = canUseAction(action.id, modelId ? { modelId } : undefined);
          const reward = calculateGoldPoints(action.id, {
            baseReward: action.baseReward,
            perkEffects,
            isGoldHolder: false,
          }).finalGold;
          return (
            <View key={action.id} style={styles.earnRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.body}>{action.description}</Text>
                <Text style={styles.rewardText}>Earn +{reward} Gold</Text>
              </View>
              <Pressable
                onPress={() => handleAction(action.id, action.title, modelId)}
                disabled={!check.ok}
                style={[styles.earnButton, !check.ok && styles.earnButtonDisabled]}
              >
                <Text style={[styles.earnButtonText, !check.ok && styles.actionTextDisabled]}>
                  {check.ok ? 'Earn' : check.reason}
                </Text>
              </Pressable>
            </View>
          );
        })}

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.subheading}>Gold Pass</Text>
          <Pressable
            onPress={() => unlockGoldPass()}
            disabled={balance < 300 || perk.hasGoldPass}
            style={[styles.earnButtonSmall, (balance < 300 || perk.hasGoldPass) && styles.earnButtonDisabled]}
          >
            <Text
              style={[styles.earnButtonText, (balance < 300 || perk.hasGoldPass) && styles.actionTextDisabled]}
            >
              {perk.hasGoldPass ? 'Active' : 'Unlock (300)'}
            </Text>
          </Pressable>
        </View>
        <Text style={styles.body}>
          {perk.hasGoldPass
            ? `Active until ${formatDate(perk.goldPassExpiresAt)}`
            : 'Not active'}
        </Text>
      </View>

      {boostsChips.length > 0 ? (
        <View style={styles.perkBox}>
          <Text style={styles.subheading}>Active boosts</Text>
          <View style={styles.boostChips}>
            {boostsChips.map((chip) => (
              <View key={chip} style={styles.chip}>
                <Text style={styles.chipText}>{chip}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.navLinks}>
        <Link href="/gold-shop" asChild>
          <Pressable style={styles.navButton}>
            <Text style={styles.navButtonText}>Open Gold Shop</Text>
          </Pressable>
        </Link>
        <Link href="/nft-inventory" asChild>
          <Pressable style={styles.navButtonSecondary}>
            <Text style={styles.navButtonSecondaryText}>Open NFT Inventory</Text>
          </Pressable>
        </Link>
      </View>

      <View style={styles.transactions}>
        <Text style={styles.subheading}>Recent Activity</Text>
        {recentEarnings.length === 0 ? (
          <Text style={styles.subdued}>No earnings yet</Text>
        ) : (
          recentEarnings.map((log) => (
            <View key={log.id} style={styles.txRow}>
              <Text style={styles.txReason}>{log.type.replace('action:', '')}</Text>
              <Text style={[styles.txAmount, styles.txEarn]}>
                +{log.amount}
              </Text>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

function ActionButton({
  label,
  disabled,
  onPress,
  hint,
}: {
  label: string;
  disabled?: boolean;
  onPress: () => void;
  hint?: string;
}) {
  return (
    <View style={styles.actionWrapper}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={[styles.actionButton, disabled && styles.actionButtonDisabled]}
      >
        <Text style={[styles.actionText, disabled && styles.actionTextDisabled]}>{label}</Text>
      </Pressable>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#15151f',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#252537',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    color: '#f5f5f5',
    fontSize: 18,
    fontWeight: '800',
  },
  balance: {
    color: '#f7c948',
    fontSize: 18,
    fontWeight: '800',
  },
  subdued: {
    color: '#8d93a3',
    marginBottom: 4,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#1f1f2d',
    borderWidth: 1,
    borderColor: '#252537',
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#f7c948',
    borderColor: '#f7c948',
  },
  roleText: {
    color: '#c5cad3',
    fontWeight: '700',
  },
  roleTextActive: {
    color: '#0b0b0f',
  },
  actions: {
    gap: 8,
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streak: {
    color: '#f7c948',
    fontWeight: '700',
  },
  walletRow: {
    backgroundColor: '#1b1b26',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#252537',
    gap: 6,
  },
  dailyBox: {
    gap: 6,
  },
  actionWrapper: {
    gap: 4,
  },
  actionButton: {
    backgroundColor: '#f7c948',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonDisabled: {
    backgroundColor: '#2a2a36',
  },
  actionText: {
    color: '#0b0b0f',
    fontWeight: '700',
  },
  actionTextDisabled: {
    color: '#8d93a3',
  },
  hint: {
    color: '#8d93a3',
    fontSize: 12,
  },
  perkBox: {
    backgroundColor: '#1b1b26',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#252537',
    marginBottom: 12,
  },
  subheading: {
    color: '#f5f5f5',
    fontWeight: '700',
    marginBottom: 4,
  },
  body: {
    color: '#c5cad3',
  },
  link: {
    color: '#f7c948',
    fontWeight: '700',
  },
  navLinks: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  navButton: {
    flex: 1,
    backgroundColor: '#f7c948',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  navButtonText: {
    color: '#0b0b0f',
    fontWeight: '700',
  },
  navButtonSecondary: {
    flex: 1,
    backgroundColor: '#1f1f2d',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#252537',
  },
  navButtonSecondaryText: {
    color: '#f5f5f5',
    fontWeight: '700',
  },
  transactions: {
    gap: 6,
  },
  earnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1b1b26',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#252537',
  },
  actionTitle: {
    color: '#f5f5f5',
    fontWeight: '700',
    marginBottom: 2,
  },
  rewardText: {
    color: '#7dd97c',
    fontWeight: '700',
    marginTop: 4,
  },
  earnButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#f7c948',
  },
  earnButtonSmall: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f7c948',
  },
  earnButtonDisabled: {
    backgroundColor: '#2a2a36',
  },
  earnButtonText: {
    color: '#0b0b0f',
    fontWeight: '700',
  },
  boostChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#252537',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#37374a',
  },
  chipText: {
    color: '#f5f5f5',
    fontWeight: '700',
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  txReason: {
    color: '#c5cad3',
    textTransform: 'capitalize',
  },
  txAmount: {
    fontWeight: '700',
  },
  txEarn: {
    color: '#7dd97c',
  },
  txSpend: {
    color: '#f08c42',
  },
});
