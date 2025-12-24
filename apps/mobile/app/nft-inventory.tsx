import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { InventoryNft, isPerkItemActive, useGoldStore } from '../src/state/gold';

const formatDateTime = (value: string) => new Date(value).toLocaleString();
const formatPerkInventoryLabel = (item: InventoryNft) =>
  item.isPlaceholder ? `${item.name} (placeholder)` : item.name;

export default function NftInventoryScreen() {
  const inventory = useGoldStore((state) => state.inventory);
  const perkInventory = useGoldStore((state) => state.perkInventory);
  const perkCatalog = useGoldStore((state) => state.perkCatalog);
  const rewardTickets = useGoldStore((state) => state.rewardTickets);
  const claimRewardTicket = useGoldStore((state) => state.claimRewardTicket);
  const mintMockNft = useGoldStore((state) => state.mintMockNft);
  const [lastMinted, setLastMinted] = useState<InventoryNft | null>(null);
  const [ticketStatus, setTicketStatus] = useState<string | null>(null);

  const perkTitleMap = useMemo(
    () =>
      perkCatalog.reduce<Record<string, string>>(
        (acc, perk) => ({ ...acc, [perk.id]: perk.title }),
        {},
      ),
    [perkCatalog],
  );

  const handleMint = () => {
    const minted = mintMockNft();
    setLastMinted(minted);
  };

  const handleClaimTicket = (ticketId: string) => {
    const res = claimRewardTicket(ticketId);
    setTicketStatus(res.ok ? 'Ticket claimed!' : res.error ?? 'Unable to claim');
  };

  const rewardSummary = (reward: (typeof rewardTickets)[number]['reward']) => {
    switch (reward.kind) {
      case 'GOLD_POINTS':
        return `+${reward.amount} Gold`;
      case 'PERK_ITEM':
        return `Perk: ${perkTitleMap[reward.perkId] ?? reward.perkId}`;
      case 'NFT_PLACEHOLDER':
        return `${reward.name} NFT (placeholder${reward.tier ? `, ${reward.tier}` : ''})`;
      default:
        return 'Reward';
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.heading}>NFT Inventory</Text>
      <Text style={styles.body}>
        Track your mock NFTs. This list is local-only and great for testing mint flows.
      </Text>

      <View style={styles.section}>
        <Text style={styles.subheading}>Perks Inventory</Text>
        {perkInventory.length === 0 ? (
          <Text style={styles.emptyText}>No perks acquired yet.</Text>
        ) : (
          <View style={styles.list}>
            {perkInventory.map((item) => {
              const active = isPerkItemActive(item, Date.now());
              const perkTitle = perkTitleMap[item.perkId] ?? item.perkId;
              return (
                <View key={item.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{perkTitle}</Text>
                    <Text style={active ? styles.statusActive : styles.statusExpired}>
                      {active ? 'Active' : 'Expired'}
                    </Text>
                  </View>
                  <Text style={styles.body}>Acquired: {formatDateTime(item.acquiredAt)}</Text>
                  <Text style={styles.body}>Source: {item.source}</Text>
                  {item.expiresAt ? (
                    <Text style={styles.body}>Expires: {formatDateTime(item.expiresAt)}</Text>
                  ) : null}
                  {item.remainingUses !== undefined ? (
                    <Text style={styles.body}>Uses left: {item.remainingUses}</Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.subheading}>Reward Tickets (Off-chain)</Text>
        {ticketStatus ? <Text style={styles.status}>{ticketStatus}</Text> : null}
        {rewardTickets.length === 0 ? (
          <Text style={styles.emptyText}>No tickets available.</Text>
        ) : (
          <View style={styles.list}>
            {rewardTickets.map((ticket) => (
              <View key={ticket.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{ticket.id}</Text>
                  <Text
                    style={
                      ticket.status === 'CLAIMED'
                        ? styles.statusActive
                        : ticket.status === 'EXPIRED'
                        ? styles.statusExpired
                        : styles.statusPending
                    }
                  >
                    {ticket.status}
                  </Text>
                </View>
                <Text style={styles.body}>Reward: {rewardSummary(ticket.reward)}</Text>
                <Text style={styles.body}>Source: {ticket.source}</Text>
                {ticket.expiresAt ? (
                  <Text style={styles.body}>Expires: {formatDateTime(ticket.expiresAt)}</Text>
                ) : null}
                {ticket.status === 'PENDING' ? (
                  <Pressable style={styles.primaryButton} onPress={() => handleClaimTicket(ticket.id)}>
                    <Text style={styles.primaryButtonText}>Claim</Text>
                  </Pressable>
                ) : null}
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.primaryButton} onPress={handleMint}>
          <Text style={styles.primaryButtonText}>Mint demo NFT</Text>
        </Pressable>
        {lastMinted ? (
          <Text style={styles.status}>
            Minted {lastMinted.name} ({lastMinted.tier})
          </Text>
        ) : null}
      </View>

      <View style={styles.summaryBox}>
        <Text style={styles.summaryLabel}>Total NFTs</Text>
        <Text style={styles.summaryValue}>{inventory.length}</Text>
      </View>

      {inventory.length === 0 ? (
        <Text style={styles.emptyText}>No NFTs minted yet.</Text>
      ) : (
        <View style={styles.list}>
          {inventory.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{formatPerkInventoryLabel(item)}</Text>
                <Text style={styles.tier}>{item.tier.toUpperCase()}</Text>
              </View>
              <Text style={styles.body}>Minted: {formatDateTime(item.createdAt)}</Text>
              {item.sourcePerkId ? (
                <Text style={styles.body}>Source perk: {item.sourcePerkId}</Text>
              ) : null}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0b0f',
  },
  heading: {
    color: '#f5f5f5',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
  },
  subheading: {
    color: '#f5f5f5',
    fontWeight: '700',
    marginBottom: 8,
  },
  body: {
    color: '#c5cad3',
  },
  section: {
    marginVertical: 10,
    gap: 8,
  },
  actions: {
    marginVertical: 12,
    gap: 6,
  },
  primaryButton: {
    backgroundColor: '#f7c948',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#0b0b0f',
    fontWeight: '700',
  },
  status: {
    color: '#7dd97c',
  },
  summaryBox: {
    backgroundColor: '#15151f',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#252537',
    marginBottom: 12,
  },
  summaryLabel: {
    color: '#8d93a3',
    marginBottom: 4,
  },
  summaryValue: {
    color: '#f5f5f5',
    fontSize: 20,
    fontWeight: '800',
  },
  emptyText: {
    color: '#8d93a3',
  },
  statusActive: {
    color: '#7dd97c',
    fontWeight: '700',
  },
  statusExpired: {
    color: '#f08c42',
    fontWeight: '700',
  },
  statusPending: {
    color: '#f7c948',
    fontWeight: '700',
  },
  list: {
    gap: 10,
  },
  card: {
    backgroundColor: '#15151f',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#252537',
    gap: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    color: '#f5f5f5',
    fontSize: 16,
    fontWeight: '800',
  },
  tier: {
    color: '#f7c948',
    fontWeight: '800',
  },
});
