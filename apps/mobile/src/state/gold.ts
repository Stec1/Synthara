import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { getEconomyMe } from '../api/client';

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
  | 'creator_reward'
  | 'earning_action';

export type PerkId =
  | 'perk_boost_daily'
  | 'perk_profile_badge'
  | 'perk_creator_drop_access'
  | 'perk_priority_matchmaking'
  | 'perk_daily_boost_20'
  | 'perk_earn_boost_10'
  | 'perk_daily_limit_plus_5';

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
  lastDailyClaimAt: string | null;
  tasksDoneToday: number;
  tasksDayKey: string;
}

export interface EarningLogItem {
  id: string;
  type: string;
  amount: number;
  createdAt: string;
  note?: string;
}

export interface EarningAction {
  id: string;
  title: string;
  description: string;
  baseReward: number;
  cooldownSeconds: number;
  dailyLimit: number;
  roleGate?: UserRole;
}

export interface EarningActionStateEntry {
  lastUsedAt: string | null;
  usedTodayCount: number;
  todayKey: string;
}

export interface ActiveBoosts {
  dailyClaimMultiplier: number;
  earningMultiplier: number;
  dailyLimitBonus: number;
}

export interface GoldState extends GoldLimitsState {
  role: UserRole;
  balance: number;
  perk: GoldPerkState;
  nfts: MockNFT[];
  ownedPerks: Record<PerkId, boolean>;
  inventory: InventoryNft[];
  transactions: GoldTransaction[];
  walletAddress: string | null;
  dailyClaimStreak: number;
  earningLog: EarningLogItem[];
  actions: EarningAction[];
  actionState: Record<string, EarningActionStateEntry>;
  activeBoosts: ActiveBoosts;
  apiSyncEnabled: boolean;
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
  setWalletAddress: (address: string | null) => void;
  claimDailyFromWallet: () => { ok: boolean; added?: number; reason?: string };
  performEarningAction: (actionId: string) => { ok: boolean; added?: number; reason?: string };
  canUseAction: (actionId: string) => { ok: boolean; reason?: string };
  recomputeBoosts: () => void;
  setApiSyncEnabled: (enabled: boolean) => void;
  syncFromApi: () => Promise<{ ok: boolean; reason?: string }>;
  resetIfNewDay: () => void;
}
export const getTodayKey = () => {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
};

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
  perk_daily_boost_20: false,
  perk_earn_boost_10: false,
  perk_daily_limit_plus_5: false,
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
  {
    id: 'perk_daily_boost_20',
    title: 'Daily Boost +20%',
    description: 'Increase daily wallet claims by 20%.',
    priceGold: 120,
  },
  {
    id: 'perk_earn_boost_10',
    title: 'Earnings Boost +10%',
    description: 'All earning actions pay out 10% more Gold.',
    priceGold: 140,
  },
  {
    id: 'perk_daily_limit_plus_5',
    title: 'Daily Limits +5',
    description: 'Get 5 extra attempts on earning actions each day.',
    priceGold: 95,
  },
];

export const DEFAULT_ACTIONS: EarningAction[] = [
  {
    id: 'daily_check_in',
    title: 'Daily check-in',
    description: 'Log in to confirm your activity for the day.',
    baseReward: 25,
    cooldownSeconds: 0,
    dailyLimit: 1,
  },
  {
    id: 'watch_clip',
    title: 'Watch a clip',
    description: 'Watch short highlight reels.',
    baseReward: 5,
    cooldownSeconds: 60,
    dailyLimit: 10,
  },
  {
    id: 'share_profile',
    title: 'Share a profile',
    description: 'Share your favorite creator.',
    baseReward: 15,
    cooldownSeconds: 3600,
    dailyLimit: 3,
  },
  {
    id: 'win_game',
    title: 'Win a game',
    description: 'Finish a casual game session with a win.',
    baseReward: 10,
    cooldownSeconds: 0,
    dailyLimit: 20,
  },
  {
    id: 'creator_post',
    title: 'Creator post',
    description: 'Share a new drop or post (creator only).',
    baseReward: 20,
    cooldownSeconds: 600,
    dailyLimit: 10,
    roleGate: 'creator',
  },
];

export const defaultActiveBoosts: ActiveBoosts = {
  dailyClaimMultiplier: 1,
  earningMultiplier: 1,
  dailyLimitBonus: 0,
};

export const applyPerkBoosts = (ownedPerks: Record<PerkId, boolean>, role: UserRole) => {
  let boosts: ActiveBoosts = { ...defaultActiveBoosts };

  if (ownedPerks.perk_daily_boost_20) {
    boosts = { ...boosts, dailyClaimMultiplier: boosts.dailyClaimMultiplier * 1.2 };
  }
  if (ownedPerks.perk_earn_boost_10) {
    boosts = { ...boosts, earningMultiplier: boosts.earningMultiplier * 1.1 };
  }
  if (ownedPerks.perk_daily_limit_plus_5) {
    boosts = { ...boosts, dailyLimitBonus: boosts.dailyLimitBonus + 5 };
  }
  // legacy daily boost perk for compatibility
  if (ownedPerks.perk_boost_daily) {
    boosts = { ...boosts, dailyClaimMultiplier: boosts.dailyClaimMultiplier * 1.2 };
  }
  // creator-only perks still respect gating
  if (role !== 'creator' && ownedPerks.perk_priority_matchmaking) {
    boosts = { ...boosts };
  }

  return boosts;
};

export const calcDailyClaimAmount = (base: number, boosts: ActiveBoosts) =>
  Math.floor(base * boosts.dailyClaimMultiplier);

const parseKeyDate = (key: string) => {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
};

const getDayDiff = (fromKey: string, toKey: string) => {
  const from = parseKeyDate(fromKey).getTime();
  const to = parseKeyDate(toKey).getTime();
  return Math.round((to - from) / (24 * 60 * 60 * 1000));
};

const getTodayKeyForIso = (iso: string) => {
  const date = new Date(iso);
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

const ensureActionStateEntry = (
  actionId: string,
  actionState: Record<string, EarningActionStateEntry>,
  todayKey = getTodayKey(),
): EarningActionStateEntry => {
  const entry = actionState[actionId];
  if (!entry || entry.todayKey !== todayKey) {
    return { lastUsedAt: null, usedTodayCount: 0, todayKey };
  }
  return entry;
};

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

const createDefaultActionState = (todayKey: string): Record<string, EarningActionStateEntry> =>
  DEFAULT_ACTIONS.reduce<Record<string, EarningActionStateEntry>>(
    (acc, action) => ({
      ...acc,
      [action.id]: {
        lastUsedAt: null,
        usedTodayCount: 0,
        todayKey,
      },
    }),
    {},
  );

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
      lastDailyClaimAt: null,
      tasksDoneToday: 0,
      tasksDayKey: getTodayKey(),
      walletAddress: null,
      dailyClaimStreak: 0,
      earningLog: [],
      actions: DEFAULT_ACTIONS,
      actionState: createDefaultActionState(getTodayKey()),
      activeBoosts: applyPerkBoosts(createOwnedPerks(), 'fan'),
      apiSyncEnabled: false,
      setRole: (role) => {
        set({ role });
        get().recomputeBoosts();
      },
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
        const result = get().claimDailyFromWallet();
        if (!result.ok) {
          return { ok: false, error: result.reason };
        }
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
        get().recomputeBoosts();
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
      setWalletAddress: (address) => set({ walletAddress: address }),
      claimDailyFromWallet: () => {
        const state = get();
        if (!state.walletAddress) {
          return { ok: false, reason: 'Wallet not connected' };
        }
        const todayKey = getTodayKey();
        const lastClaimKey = state.lastDailyClaimAt
          ? getTodayKeyForIso(state.lastDailyClaimAt)
          : null;
        if (lastClaimKey === todayKey) {
          return { ok: false, reason: 'Claimed already today' };
        }
        const boosts = state.activeBoosts;
        const added = calcDailyClaimAmount(25, boosts);
        const streak =
          lastClaimKey && getDayDiff(lastClaimKey, todayKey) === 1
            ? state.dailyClaimStreak + 1
            : 1;
        const nowIso = new Date().toISOString();
        set({
          lastDailyClaimAt: nowIso,
          dailyClaimStreak: streak,
          earningLog: [
            {
              id: `${Date.now()}-daily`,
              type: 'daily_claim',
              amount: added,
              createdAt: nowIso,
            },
            ...state.earningLog,
          ],
        });
        get().earn(added, 'daily_claim');
        return { ok: true, added };
      },
      performEarningAction: (actionId) => {
        const check = get().canUseAction(actionId);
        if (!check.ok) {
          return check;
        }
        const state = get();
        const action = state.actions.find((item) => item.id === actionId);
        if (!action) {
          return { ok: false, reason: 'Unknown action' };
        }
        const boosts = state.activeBoosts;
        const added = Math.floor(action.baseReward * boosts.earningMultiplier);
        const nowIso = new Date().toISOString();
        const todayKey = getTodayKey();

        set((current) => ({
          balance: current.balance + added,
          transactions: [
            createTransaction('earn', added, 'earning_action', `Action ${action.title}`),
            ...current.transactions,
          ],
          actionState: {
            ...current.actionState,
            [actionId]: (() => {
              const base = ensureActionStateEntry(actionId, current.actionState, todayKey);
              return {
                lastUsedAt: nowIso,
                usedTodayCount:
                  (base.todayKey === todayKey ? base.usedTodayCount : 0) + 1,
                todayKey,
              };
            })(),
          },
          earningLog: [
            {
              id: `${Date.now()}-${actionId}`,
              type: `action:${actionId}`,
              amount: added,
              createdAt: nowIso,
              note: action.title,
            },
            ...current.earningLog,
          ],
        }));

        return { ok: true, added };
      },
      canUseAction: (actionId) => {
        const state = get();
        const action = state.actions.find((item) => item.id === actionId);
        if (!action) {
          return { ok: false, reason: 'Unknown action' };
        }
        if (action.roleGate && action.roleGate !== state.role) {
          return { ok: false, reason: 'Role restricted' };
        }
        const todayKey = getTodayKey();
        const entry = ensureActionStateEntry(actionId, state.actionState);
        const lastUsedAt = entry.lastUsedAt ? new Date(entry.lastUsedAt).getTime() : null;
        if (lastUsedAt) {
          const diff = Date.now() - lastUsedAt;
          const remaining = action.cooldownSeconds * 1000 - diff;
          if (remaining > 0) {
            return { ok: false, reason: `Cooldown ${Math.ceil(remaining / 1000)}s` };
          }
        }
        const limit = action.dailyLimit + state.activeBoosts.dailyLimitBonus;
        const usedToday = entry.todayKey === todayKey ? entry.usedTodayCount : 0;
        if (usedToday >= limit) {
          return { ok: false, reason: 'Daily limit reached' };
        }
        return { ok: true };
      },
      recomputeBoosts: () => {
        const state = get();
        const boosts = applyPerkBoosts(state.ownedPerks, state.role);
        set({ activeBoosts: boosts });
      },
      setApiSyncEnabled: (enabled) => set({ apiSyncEnabled: enabled }),
      syncFromApi: async () => {
        const state = get();
        if (!state.apiSyncEnabled) {
          return { ok: false, reason: 'API sync disabled' };
        }
        try {
          const response = await getEconomyMe();
          const data = response.data ?? {};
          const incomingActions = Array.isArray(data.earningActions)
            ? data.earningActions
            : Array.isArray(data.actions)
            ? data.actions
            : undefined;
          const nextOwnedPerks = data.ownedPerks
            ? ({ ...createOwnedPerks(), ...data.ownedPerks } as Record<PerkId, boolean>)
            : undefined;
          set((current) => ({
            balance: typeof data.balance === 'number' ? data.balance : current.balance,
            ownedPerks: nextOwnedPerks ?? current.ownedPerks,
            inventory: Array.isArray(data.inventory) ? data.inventory : current.inventory,
            nfts: Array.isArray(data.inventory) ? data.inventory : current.nfts,
            walletAddress:
              data.walletAddress !== undefined ? (data.walletAddress as string | null) : current.walletAddress,
            lastDailyClaimAt:
              data.lastDailyClaimAt !== undefined
                ? (data.lastDailyClaimAt as string | null)
                : current.lastDailyClaimAt,
            dailyClaimStreak:
              typeof data.dailyClaimStreak === 'number'
                ? data.dailyClaimStreak
                : current.dailyClaimStreak,
            earningLog: Array.isArray(data.earningLog) ? data.earningLog : current.earningLog,
            actions: incomingActions ?? current.actions,
          }));
          get().recomputeBoosts();
          return { ok: true };
        } catch (error) {
          return { ok: false, reason: 'Failed to sync from API' };
        }
      },
      resetIfNewDay: () => {
        const todayKey = getTodayKey();
        const state = get();
        if (state.tasksDayKey !== todayKey) {
          set({
            tasksDoneToday: 0,
            tasksDayKey: todayKey,
          });
        }
        const updatedState = get();
        const existingActionState = updatedState.actionState;
        const refreshed: Record<string, EarningActionStateEntry> = {};
        const allActionIds = new Set([
          ...Object.keys(existingActionState),
          ...updatedState.actions.map((a) => a.id),
        ]);
        allActionIds.forEach((key) => {
          refreshed[key] = ensureActionStateEntry(key, existingActionState, todayKey);
        });
        set({ actionState: refreshed });
      },
    }),
    {
      name: 'synthara.gold.v1',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.recomputeBoosts?.();
      },
    },
  ),
);
