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
import { useEntitlementsStore } from '../state/entitlements';
import { calculateGoldPoints } from '../domain/rewardEngine';
import { Card, Divider, Theme, useTheme } from '../ui';

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
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

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
  const canClaimDailyEntitlement = useEntitlementsStore(
    (state) => state.entitlements.CAN_CLAIM_DAILY_GOLD ?? false,
  );

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
  const claimBlocked = !canClaimDailyEntitlement || !dailyClaimAvailability.ok;
  const claimHint =
    !canClaimDailyEntitlement && walletAddress
      ? 'Daily claim locked. Missing entitlement.'
      : claimBlocked && dailyClaimAvailability.remainingMs !== undefined
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
    <Card style={{ gap: theme.spacing.md }}>
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
              styles={styles}
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

        <Divider />

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
    </Card>
  );
}

type WalletStyles = ReturnType<typeof createStyles>;

function ActionButton({
  label,
  disabled,
  onPress,
  hint,
  styles,
}: {
  label: string;
  disabled?: boolean;
  onPress: () => void;
  hint?: string;
  styles: WalletStyles;
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

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    title: {
      ...theme.typography.heading,
      color: theme.colors.text,
    },
    balance: {
      ...theme.typography.heading,
      color: theme.colors.primary,
    },
    subdued: {
      ...theme.typography.body,
      color: theme.colors.subdued,
      marginBottom: theme.spacing.xs,
    },
    roleRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    roleButton: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
    },
    roleButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    roleText: {
      ...theme.typography.label,
      color: theme.colors.subdued,
    },
    roleTextActive: {
      color: theme.colors.inverseText,
    },
    actions: {
      gap: theme.spacing.sm,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    streak: {
      ...theme.typography.label,
      color: theme.colors.primary,
    },
    walletRow: {
      backgroundColor: theme.colors.surfaceMuted,
      padding: theme.spacing.md,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: theme.spacing.xs,
    },
    dailyBox: {
      gap: theme.spacing.xs,
    },
    actionWrapper: {
      gap: theme.spacing.xs,
    },
    actionButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radius.md,
      alignItems: 'center',
    },
    actionButtonDisabled: {
      backgroundColor: theme.colors.surfaceMuted,
    },
    actionText: {
      ...theme.typography.label,
      color: theme.colors.inverseText,
    },
    actionTextDisabled: {
      color: theme.colors.subdued,
    },
    hint: {
      ...theme.typography.caption,
      color: theme.colors.subdued,
    },
    perkBox: {
      backgroundColor: theme.colors.surfaceMuted,
      padding: theme.spacing.md,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: theme.spacing.xs,
    },
    subheading: {
      ...theme.typography.subtitle,
      color: theme.colors.text,
    },
    body: {
      ...theme.typography.body,
      color: theme.colors.subdued,
    },
    link: {
      ...theme.typography.label,
      color: theme.colors.primary,
    },
    navLinks: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    navButton: {
      flex: 1,
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radius.md,
      alignItems: 'center',
    },
    navButtonText: {
      ...theme.typography.label,
      color: theme.colors.inverseText,
    },
    navButtonSecondary: {
      flex: 1,
      backgroundColor: theme.colors.surfaceMuted,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radius.md,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    navButtonSecondaryText: {
      ...theme.typography.label,
      color: theme.colors.text,
    },
    transactions: {
      gap: theme.spacing.xs,
    },
    earnRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      backgroundColor: theme.colors.surfaceMuted,
      padding: theme.spacing.md,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    actionTitle: {
      ...theme.typography.subtitle,
      color: theme.colors.text,
      marginBottom: 2,
    },
    rewardText: {
      ...theme.typography.label,
      color: theme.colors.success,
      marginTop: theme.spacing.xs,
    },
    earnButton: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.primary,
    },
    earnButtonSmall: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.primary,
    },
    earnButtonDisabled: {
      backgroundColor: theme.colors.surfaceMuted,
    },
    earnButtonText: {
      ...theme.typography.label,
      color: theme.colors.inverseText,
    },
    boostChips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
    },
    chip: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      backgroundColor: theme.colors.surfaceMuted,
      borderRadius: theme.radius.pill,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    chipText: {
      ...theme.typography.caption,
      color: theme.colors.text,
    },
    txRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    txReason: {
      ...theme.typography.body,
      color: theme.colors.subdued,
      textTransform: 'capitalize',
    },
    txAmount: {
      ...theme.typography.body,
      fontWeight: '700',
    },
    txEarn: {
      color: theme.colors.success,
    },
    txSpend: {
      color: theme.colors.warning,
    },
  });
