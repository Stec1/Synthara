import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';

import { useGoldStore, UserRole } from '../state/gold';

const roles: UserRole[] = ['fan', 'creator', 'admin'];

const formatDate = (value?: string) => {
  if (!value) return 'Not active';
  return new Date(value).toLocaleDateString();
};

const getDailyStatus = (lastDailyClaimAt?: string) => {
  if (!lastDailyClaimAt) return { available: true, hint: 'Ready to claim' };
  const now = Date.now();
  const last = new Date(lastDailyClaimAt).getTime();
  const diff = now - last;
  if (diff >= 24 * 60 * 60 * 1000) {
    return { available: true, hint: 'Ready to claim' };
  }
  const hours = Math.ceil((24 * 60 * 60 * 1000 - diff) / (60 * 60 * 1000));
  return { available: false, hint: `Available in ${hours}h` };
};

export function GoldWalletCard() {
  const role = useGoldStore((state) => state.role);
  const balance = useGoldStore((state) => state.balance);
  const perk = useGoldStore((state) => state.perk);
  const tasksDoneToday = useGoldStore((state) => state.tasksDoneToday);
  const lastDailyClaimAt = useGoldStore((state) => state.lastDailyClaimAt);
  const transactions = useGoldStore((state) => state.transactions);
  const setRole = useGoldStore((state) => state.setRole);
  const claimDaily = useGoldStore((state) => state.claimDaily);
  const completeTask = useGoldStore((state) => state.completeTask);
  const unlockGoldPass = useGoldStore((state) => state.unlockGoldPass);
  const mintMockNft = useGoldStore((state) => state.mintMockNft);
  const adminAirdrop = useGoldStore((state) => state.adminAirdrop);
  const creatorReward = useGoldStore((state) => state.creatorReward);

  const dailyStatus = useMemo(() => getDailyStatus(lastDailyClaimAt), [lastDailyClaimAt]);
  const taskLimitReached = tasksDoneToday >= 5;
  const recentTransactions = useMemo(() => transactions.slice(0, 5), [transactions]);

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
        <ActionButton
          label="Claim Daily +50"
          onPress={() => claimDaily()}
          disabled={!dailyStatus.available}
          hint={!dailyStatus.available ? dailyStatus.hint : undefined}
        />
        <ActionButton
          label={`Quick Task +20 (${tasksDoneToday}/5 today)`}
          onPress={() => completeTask()}
          disabled={taskLimitReached}
          hint={taskLimitReached ? 'Daily task cap reached' : undefined}
        />
        <ActionButton
          label="Unlock Gold Pass (300)"
          onPress={() => unlockGoldPass()}
          disabled={balance < 300 || perk.hasGoldPass}
          hint={perk.hasGoldPass ? `Active until ${formatDate(perk.goldPassExpiresAt)}` : undefined}
        />
        <ActionButton
          label="Mint Demo NFT"
          onPress={() => mintMockNft()}
        />
        {role === 'admin' && (
          <ActionButton label="Admin Airdrop +1000" onPress={() => adminAirdrop()} />
        )}
        {role === 'creator' && (
          <ActionButton label="Creator Reward +100" onPress={() => creatorReward()} />
        )}
      </View>

      <View style={styles.perkBox}>
        <Text style={styles.subheading}>Gold Pass</Text>
        <Text style={styles.body}>
          {perk.hasGoldPass
            ? `Active until ${formatDate(perk.goldPassExpiresAt)}`
            : 'Not active'}
        </Text>
      </View>

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
        {recentTransactions.length === 0 ? (
          <Text style={styles.subdued}>No transactions yet</Text>
        ) : (
          recentTransactions.map((tx) => (
            <View key={tx.id} style={styles.txRow}>
              <Text style={styles.txReason}>{tx.reason}</Text>
              <Text style={[styles.txAmount, tx.type === 'earn' ? styles.txEarn : styles.txSpend]}>
                {tx.type === 'earn' ? '+' : '-'}
                {tx.amount}
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
