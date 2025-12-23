import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type UserRole = 'fan' | 'creator' | 'admin';
export type GoldTxType = 'earn' | 'spend';
export type GoldReason =
  | 'daily_claim'
  | 'task'
  | 'gold_pass'
  | 'mint_nft'
  | 'perk_purchase'
  | 'demo_mint'
  | 'admin_airdrop'
  | 'creator_reward';

export type PerkId =
  | 'perk_boost_daily'
  | 'perk_profile_badge'
  | 'perk_creator_drop_access'
  | 'perk_priority_matchmaking';

export interface Perk {
  id: PerkId;
  title: string;
  description: string;
  priceGold: number;
  roleGate?: UserRole;
}

export type NftTier = 'silver' | 'gold' | 'diamond';

export interface GoldTransaction {
  id: string;
  ts: string;
  type: GoldTxType;
  amount: number;
  reason: GoldReason;
  note?: string;
}

export interface InventoryNft {
  id: string;
  name: string;
  tier: NftTier;
  createdAt: string;
  sourcePerkId?: PerkId;
}

export interface GoldPerkState {
  hasGoldPass: boolean;
  goldPassExpiresAt?: string;
}

export interface MockNFT {
  id: string;
  name: string;
  createdAt: string;
}

interface GoldLimitsState {
  lastDailyClaimAt?: string;
  tasksDoneToday: number;
  tasksDayKey: string;
}

export interface GoldState extends GoldLimitsState {
  role: UserRole;
  balance: number;
  perk: GoldPerkState;
  nfts: MockNFT[];
  ownedPerks: Record<PerkId, boolean>;
  inventory: InventoryNft[];
  transactions: GoldTransaction[];
  setRole: (role: UserRole) => void;
  earn: (amount: number, reason: GoldReason, note?: string) => void;
  spend: (amount: number, reason: GoldReason, note?: string) => boolean;
  claimDaily: () => { ok: boolean; error?: string };
  completeTask: () => { ok: boolean; error?: string };
  unlockGoldPass: () => boolean;
  buyPerk: (perkId: PerkId) => { ok: boolean; error?: string };
  mintMockNft: (input?: { tier?: NftTier; sourcePerkId?: PerkId }) => InventoryNft;
  adminAirdrop: () => boolean;
  creatorReward: () => boolean;
  canAfford: (price: number) => boolean;
  resetIfNewDay: () => void;
}

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const createTransaction = (type: GoldTxType, amount: number, reason: GoldReason, note?: string) =>
  ({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    ts: new Date().toISOString(),
    type,
    amount,
    reason,
    note,
  }) satisfies GoldTransaction;

const createOwnedPerks = (): Record<PerkId, boolean> => ({
  perk_boost_daily: false,
  perk_profile_badge: false,
  perk_creator_drop_access: false,
  perk_priority_matchmaking: false,
});

export const PERK_CATALOG: Perk[] = [
  {
    id: 'perk_boost_daily',
    title: 'Daily Booster',
    description: 'Earn +20 extra Gold on every daily claim.',
    priceGold: 25,
  },
  {
    id: 'perk_profile_badge',
    title: 'Profile Badge',
    description: 'Unlock an exclusive golden badge on your profile.',
    priceGold: 50,
  },
  {
    id: 'perk_creator_drop_access',
    title: 'Creator Drop Access',
    description: 'Early access to featured creator drops and raffles.',
    priceGold: 120,
  },
  {
    id: 'perk_priority_matchmaking',
    title: 'Priority Matchmaking',
    description: 'Skip queues and get matched faster in events.',
    priceGold: 250,
    roleGate: 'creator',
  },
];

const createInventoryNft = (input?: { tier?: NftTier; sourcePerkId?: PerkId }): InventoryNft => {
  const createdAt = new Date().toISOString();
  const tier = input?.tier ?? 'gold';
  return {
    id: `nft-${Date.now()}`,
    name: `Demo NFT #${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0')}`,
    tier,
    createdAt,
    sourcePerkId: input?.sourcePerkId,
  };
};

export const useGoldStore = create<GoldState>()(
  persist(
    (set, get) => ({
      role: 'fan',
      balance: 0,
      perk: { hasGoldPass: false },
      nfts: [],
      ownedPerks: createOwnedPerks(),
      inventory: [],
      transactions: [],
      lastDailyClaimAt: undefined,
      tasksDoneToday: 0,
      tasksDayKey: getTodayKey(),
      setRole: (role) => set({ role }),
      earn: (amount, reason, note) =>
        set((state) => ({
          balance: state.balance + amount,
          transactions: [createTransaction('earn', amount, reason, note), ...state.transactions],
        })),
      spend: (amount, reason, note) => {
        const state = get();
        if (state.balance < amount) {
          return false;
        }
        set({
          balance: state.balance - amount,
          transactions: [createTransaction('spend', amount, reason, note), ...state.transactions],
        });
        return true;
      },
      claimDaily: () => {
        const state = get();
        if (state.lastDailyClaimAt) {
          const lastClaim = new Date(state.lastDailyClaimAt).getTime();
          const now = Date.now();
          if (now - lastClaim < 24 * 60 * 60 * 1000) {
            return { ok: false, error: 'Daily claim available every 24 hours' };
          }
        }
        set({
          lastDailyClaimAt: new Date().toISOString(),
        });
        get().earn(50, 'daily_claim');
        return { ok: true };
      },
      completeTask: () => {
        const state = get();
        state.resetIfNewDay();
        const updatedState = get();
        if (updatedState.tasksDoneToday >= 5) {
          return { ok: false, error: 'Daily task limit reached' };
        }
        set({
          tasksDoneToday: updatedState.tasksDoneToday + 1,
        });
        get().earn(20, 'task');
        return { ok: true };
      },
      unlockGoldPass: () => {
        const success = get().spend(300, 'gold_pass');
        if (!success) {
          return false;
        }
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        set({
          perk: {
            hasGoldPass: true,
            goldPassExpiresAt: expiresAt,
          },
        });
        return true;
      },
      buyPerk: (perkId) => {
        const perk = PERK_CATALOG.find((item) => item.id === perkId);
        if (!perk) {
          return { ok: false, error: 'Unknown perk' };
        }
        const state = get();
        const ownedPerks = { ...createOwnedPerks(), ...state.ownedPerks };
        if (ownedPerks[perkId]) {
          return { ok: false, error: 'Perk already owned' };
        }
        if (!state.canAfford(perk.priceGold)) {
          return { ok: false, error: 'Not enough Gold' };
        }

        const spent = state.spend(perk.priceGold, 'perk_purchase', `Bought ${perk.title}`);
        if (!spent) {
          return { ok: false, error: 'Not enough Gold' };
        }

        set((current) => ({
          ownedPerks: { ...createOwnedPerks(), ...current.ownedPerks, [perkId]: true },
        }));
        return { ok: true };
      },
      mintMockNft: (input) => {
        const newNFT: InventoryNft = createInventoryNft(input);
        set((state) => ({
          inventory: [newNFT, ...state.inventory],
          nfts: [newNFT, ...state.nfts],
          transactions: [
            createTransaction('earn', 0, 'demo_mint', 'Minted demo NFT'),
            ...state.transactions,
          ],
        }));
        return newNFT;
      },
      adminAirdrop: () => {
        const state = get();
        if (state.role !== 'admin') {
          return false;
        }
        get().earn(1000, 'admin_airdrop');
        return true;
      },
      creatorReward: () => {
        const state = get();
        if (state.role !== 'creator') {
          return false;
        }
        get().earn(100, 'creator_reward');
        return true;
      },
      canAfford: (price) => get().balance >= price,
      resetIfNewDay: () => {
        const todayKey = getTodayKey();
        const state = get();
        if (state.tasksDayKey !== todayKey) {
          set({
            tasksDoneToday: 0,
            tasksDayKey: todayKey,
          });
        }
      },
    }),
    {
      name: 'synthara.gold.v1',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
