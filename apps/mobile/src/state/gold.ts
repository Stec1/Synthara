import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { getEconomyMe, getInventoryMe } from '../api/client';
import { logEvent } from '../api/events';
import { RewardActionId, RewardPerkEffect, RewardPerkEffectType, calculateGoldPoints } from '../domain/rewardEngine';

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
  | 'earning_action'
  | 'reward_ticket';

export type PerkId =
  | 'perk_boost_daily'
  | 'perk_profile_badge'
  | 'perk_creator_drop_access'
  | 'perk_priority_matchmaking'
  | 'perk_daily_boost_20'
  | 'perk_earn_boost_10'
  | 'perk_daily_limit_plus_5';

export type PerkEffect = {
  type: RewardPerkEffectType;
  value: number;
  mode: 'add' | 'mul';
};

export type PerkDuration = {
  kind: 'PERMANENT' | 'TIME_LIMITED' | 'USES';
  value?: number;
};

export type PerkStackingRule = 'NONE' | 'ADDITIVE' | 'MULTIPLICATIVE';
export type PerkCategory = 'BOOST' | 'ACCESS' | 'COSMETIC' | 'GAME';

export interface PerkDefinition {
  id: PerkId;
  title: string;
  description: string;
  priceGold: number;
  roleGate?: UserRole;
  effects?: PerkEffect[];
  duration?: PerkDuration;
  stackingRule?: PerkStackingRule;
  category?: PerkCategory;
}

export type PerkInventorySource = 'SHOP_PURCHASE' | 'REWARD_TICKET' | 'ADMIN_GRANT';

export interface PerkInventoryItem {
  id: string;
  perkId: PerkId;
  acquiredAt: string;
  source: PerkInventorySource;
  expiresAt?: string;
  remainingUses?: number;
}

export type RewardTicketReward =
  | { kind: 'GOLD_POINTS'; amount: number }
  | { kind: 'PERK_ITEM'; perkId: PerkId }
  | { kind: 'NFT_PLACEHOLDER'; name: string; tier?: 'silver' | 'gold' | 'diamond' };

export type RewardTicketStatus = 'PENDING' | 'CLAIMED' | 'EXPIRED';

export interface RewardTicket {
  id: string;
  createdAt: string;
  source: 'GAME_MATCH' | 'EVENT' | 'ADMIN';
  status: RewardTicketStatus;
  expiresAt?: string;
  reward: RewardTicketReward;
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
  isPlaceholder?: boolean;
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
  id: RewardActionId;
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

interface ModelActionTracker {
  dayKeyUTC: string;
  modelIds: string[];
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
  inventory: InventoryNft[];
  perkInventory: PerkInventoryItem[];
  rewardTickets: RewardTicket[];
  perkCatalog: PerkDefinition[];
  transactions: GoldTransaction[];
  walletAddress: string | null;
  dailyClaimStreak: number;
  earningLog: EarningLogItem[];
  actions: EarningAction[];
  actionState: Record<string, EarningActionStateEntry>;
  activeBoosts: ActiveBoosts;
  viewedModelsToday: ModelActionTracker;
  sharedModelsToday: ModelActionTracker;
  apiSyncEnabled: boolean;
  inventoryApiEnabled: boolean;
  setRole: (role: UserRole) => void;
  earn: (amount: number, reason: GoldReason, note?: string) => void;
  spend: (amount: number, reason: GoldReason, note?: string) => boolean;
  claimDaily: () => { ok: boolean; error?: string };
  completeTask: () => { ok: boolean; error?: string };
  unlockGoldPass: () => boolean;
  buyPerk: (perkId: PerkId) => { ok: boolean; error?: string };
  mintMockNft: (input?: { tier?: NftTier; sourcePerkId?: PerkId; isPlaceholder?: boolean; name?: string }) => InventoryNft;
  claimRewardTicket: (ticketId: string) => { ok: boolean; error?: string };
  adminAirdrop: () => boolean;
  creatorReward: () => boolean;
  canAfford: (price: number) => boolean;
  setWalletAddress: (address: string | null) => void;
  claimDailyFromWallet: () => { ok: boolean; added?: number; reason?: string };
  performEarningAction: (
    actionId: string,
    params?: { modelId?: string },
  ) => { ok: boolean; added?: number; reason?: string };
  canUseAction: (actionId: string, params?: { modelId?: string }) => { ok: boolean; reason?: string };
  recomputeBoosts: () => void;
  getOwnedPerks: () => Record<PerkId, boolean>;
  getActivePerkEffects: (now?: number) => RewardPerkEffect[];
  setApiSyncEnabled: (enabled: boolean) => void;
  setInventoryApiEnabled: (enabled: boolean) => void;
  addRewardTicket: (ticket: RewardTicket) => void;
  syncFromApi: () => Promise<{ ok: boolean; reason?: string }>;
  resetIfNewDay: () => void;
}

export const getTodayKey = () => {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
};

export const getUtcDayKey = () => new Date().toISOString().slice(0, 10);

export const canClaimDailyUtc = (
  lastIso: string | null,
): { ok: boolean; remainingMs?: number } => {
  if (!lastIso) {
    return { ok: true };
  }
  const last = new Date(lastIso).getTime();
  if (Number.isNaN(last)) {
    return { ok: true };
  }
  const elapsed = Date.now() - last;
  const remaining = 24 * 60 * 60 * 1000 - elapsed;
  if (remaining > 0) {
    return { ok: false, remainingMs: remaining };
  }
  return { ok: true };
};

export const formatRemaining = (ms: number) => {
  const hours = Math.floor(ms / (60 * 60 * 1000));
  const minutes = Math.ceil((ms - hours * 60 * 60 * 1000) / (60 * 1000));
  if (hours <= 0 && minutes <= 0) {
    return 'seconds';
  }
  if (hours <= 0) {
    return `${minutes}m`;
  }
  return `${hours}h ${minutes % 60}m`;
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

const createInventoryNft = (input?: {
  tier?: NftTier;
  sourcePerkId?: PerkId;
  isPlaceholder?: boolean;
  name?: string;
}): InventoryNft => {
  const createdAt = new Date().toISOString();
  const tier = input?.tier ?? 'gold';
  return {
    id: `nft-${Date.now()}`,
    name: input?.isPlaceholder
      ? input.name ?? `Reward NFT ${Math.floor(Math.random() * 1000)}`
      : `Demo NFT #${Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, '0')}`,
    tier,
    createdAt,
    sourcePerkId: input?.sourcePerkId,
    isPlaceholder: input?.isPlaceholder,
  };
};

const createMockRewardTickets = (): RewardTicket[] => {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  return [
    {
      id: 'ticket-gold-1',
      createdAt: new Date(now - oneDay).toISOString(),
      source: 'GAME_MATCH',
      status: 'PENDING',
      expiresAt: new Date(now + 7 * oneDay).toISOString(),
      reward: { kind: 'GOLD_POINTS', amount: 150 },
    },
    {
      id: 'ticket-perk-1',
      createdAt: new Date(now - 2 * oneDay).toISOString(),
      source: 'EVENT',
      status: 'PENDING',
      expiresAt: new Date(now + 5 * oneDay).toISOString(),
      reward: { kind: 'PERK_ITEM', perkId: 'perk_earn_boost_10' },
    },
    {
      id: 'ticket-nft-1',
      createdAt: new Date(now - 3 * oneDay).toISOString(),
      source: 'ADMIN',
      status: 'CLAIMED',
      reward: { kind: 'NFT_PLACEHOLDER', name: 'Mystery Drop', tier: 'gold' },
    },
  ];
};

const createPerkInventoryItem = (
  perk: PerkDefinition,
  source: PerkInventorySource,
  now: number,
): PerkInventoryItem => {
  const expiresAt =
    perk.duration?.kind === 'TIME_LIMITED' && perk.duration.value
      ? new Date(now + perk.duration.value * 1000).toISOString()
      : undefined;
  const remainingUses = perk.duration?.kind === 'USES' ? perk.duration.value : undefined;
  return {
    id: `perk-item-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    perkId: perk.id,
    acquiredAt: new Date(now).toISOString(),
    source,
    expiresAt,
    remainingUses,
  };
};

const defaultActiveBoosts: ActiveBoosts = {
  dailyClaimMultiplier: 1,
  earningMultiplier: 1,
  dailyLimitBonus: 0,
};

export const PERK_CATALOG: PerkDefinition[] = [
  {
    id: 'perk_boost_daily',
    title: 'Daily Booster',
    description: 'Earn +20 extra Gold on every daily claim.',
    priceGold: 25,
    effects: [{ type: 'DAILY_CLAIM_BONUS', value: 20, mode: 'add' }],
    duration: { kind: 'TIME_LIMITED', value: 7 * 24 * 60 * 60 },
    stackingRule: 'NONE',
    category: 'BOOST',
  },
  {
    id: 'perk_profile_badge',
    title: 'Profile Badge',
    description: 'Unlock an exclusive golden badge on your profile.',
    priceGold: 50,
    stackingRule: 'NONE',
    duration: { kind: 'PERMANENT' },
    category: 'COSMETIC',
  },
  {
    id: 'perk_creator_drop_access',
    title: 'Creator Drop Access',
    description: 'Early access to featured creator drops and raffles.',
    priceGold: 120,
    stackingRule: 'NONE',
    duration: { kind: 'PERMANENT' },
    category: 'ACCESS',
  },
  {
    id: 'perk_priority_matchmaking',
    title: 'Priority Matchmaking',
    description: 'Skip queues and get matched faster in events.',
    priceGold: 250,
    roleGate: 'creator',
    stackingRule: 'NONE',
    duration: { kind: 'PERMANENT' },
    category: 'GAME',
  },
  {
    id: 'perk_daily_boost_20',
    title: 'Daily Boost +20%',
    description: 'Increase daily wallet claims by 20%.',
    priceGold: 120,
    effects: [{ type: 'DAILY_CLAIM_MULTIPLIER', value: 0.2, mode: 'mul' }],
    duration: { kind: 'TIME_LIMITED', value: 3 * 24 * 60 * 60 },
    stackingRule: 'ADDITIVE',
    category: 'BOOST',
  },
  {
    id: 'perk_earn_boost_10',
    title: 'Earnings Boost +10%',
    description: 'All earning actions pay out 10% more Gold.',
    priceGold: 140,
    effects: [{ type: 'EARNING_MULTIPLIER', value: 0.1, mode: 'mul' }],
    duration: { kind: 'PERMANENT' },
    stackingRule: 'MULTIPLICATIVE',
    category: 'BOOST',
  },
  {
    id: 'perk_daily_limit_plus_5',
    title: 'Daily Limits +5',
    description: 'Get 5 extra attempts on earning actions each day.',
    priceGold: 95,
    effects: [{ type: 'DAILY_LIMIT_BONUS', value: 5, mode: 'add' }],
    duration: { kind: 'USES', value: 50 },
    stackingRule: 'ADDITIVE',
    category: 'BOOST',
  },
];

const ACTION_ID_MAP: Record<string, RewardActionId> = {
  daily_check_in: 'DAILY_CHECK_IN',
  win_game: 'WIN_MATCH',
  share_profile: 'SHARE_PROFILE',
  watch_clip: 'VIEW_MODEL_PROFILE',
  creator_post: 'COMPLETE_SESSION',
};

export const DEFAULT_ACTIONS: EarningAction[] = [
  {
    id: 'DAILY_CHECK_IN',
    title: 'Daily check-in',
    description: 'Log in to confirm your activity for the day.',
    baseReward: 25,
    cooldownSeconds: 0,
    dailyLimit: 1,
  },
  {
    id: 'PLAY_MATCH',
    title: 'Play a match',
    description: 'Complete any casual match.',
    baseReward: 8,
    cooldownSeconds: 0,
    dailyLimit: 20,
  },
  {
    id: 'WIN_MATCH',
    title: 'Win a match',
    description: 'Finish a casual game session with a win.',
    baseReward: 10,
    cooldownSeconds: 0,
    dailyLimit: 20,
  },
  {
    id: 'COMPLETE_SESSION',
    title: 'Complete a session',
    description: 'Finish a scheduled session or drop.',
    baseReward: 12,
    cooldownSeconds: 0,
    dailyLimit: 10,
  },
  {
    id: 'VIEW_MODEL_PROFILE',
    title: 'View a model profile',
    description: 'Check out a creator or model profile.',
    baseReward: 5,
    cooldownSeconds: 60,
    dailyLimit: 5,
  },
  {
    id: 'SHARE_PROFILE',
    title: 'Share a profile',
    description: 'Share your favorite creator.',
    baseReward: 15,
    cooldownSeconds: 3600,
    dailyLimit: 3,
  },
];

const ensureModelTracker = (tracker?: ModelActionTracker) => {
  const dayKeyUTC = getUtcDayKey();
  if (!tracker || tracker.dayKeyUTC !== dayKeyUTC) {
    return { dayKeyUTC, modelIds: [] };
  }
  return tracker;
};

const createDefaultActionState = (
  todayKey: string,
  actions: EarningAction[] = DEFAULT_ACTIONS,
): Record<string, EarningActionStateEntry> =>
  actions.reduce<Record<string, EarningActionStateEntry>>(
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

const normalizeActionId = (actionId: string): RewardActionId | null => {
  if (DEFAULT_ACTIONS.some((action) => action.id === actionId)) {
    return actionId as RewardActionId;
  }
  return ACTION_ID_MAP[actionId] ?? null;
};

const getCanonicalAction = (actionId: RewardActionId): EarningAction =>
  DEFAULT_ACTIONS.find((action) => action.id === actionId) ?? DEFAULT_ACTIONS[0];

const normalizeActions = (incoming?: EarningAction[]) => {
  const next: Partial<Record<RewardActionId, EarningAction>> = {};
  incoming?.forEach((action) => {
    const mappedId = normalizeActionId(action.id);
    if (!mappedId) return;
    next[mappedId] = { ...getCanonicalAction(mappedId), ...action, id: mappedId };
  });
  DEFAULT_ACTIONS.forEach((action) => {
    if (!next[action.id]) {
      next[action.id] = action;
    }
  });
  return Object.values(next) as EarningAction[];
};

const migrateActionState = (
  existing: Record<string, EarningActionStateEntry>,
  actions: EarningAction[],
  todayKey: string,
) => {
  const migrated: Record<string, EarningActionStateEntry> = {};
  actions.forEach((action) => {
    const existingEntry =
      existing[action.id] ??
      Object.entries(existing).find(([key]) => normalizeActionId(key) === action.id)?.[1];
    migrated[action.id] = existingEntry
      ? ensureActionStateEntry(action.id, { [action.id]: existingEntry }, todayKey)
      : ensureActionStateEntry(action.id, {}, todayKey);
  });
  return migrated;
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

const buildPerkInventoryFromLegacy = (ownedPerks?: Record<PerkId, boolean>): PerkInventoryItem[] => {
  if (!ownedPerks) return [];
  const now = Date.now();
  const entries: PerkInventoryItem[] = [];
  Object.entries(ownedPerks).forEach(([perkId, owned]) => {
    if (!owned) return;
    const perk = PERK_CATALOG.find((item) => item.id === perkId);
    if (!perk) return;
    entries.push(createPerkInventoryItem(perk, 'SHOP_PURCHASE', now));
  });
  return entries;
};

export const isPerkItemActive = (item: PerkInventoryItem, now: number) => {
  if (item.expiresAt && new Date(item.expiresAt).getTime() < now) {
    return false;
  }
  if (item.remainingUses !== undefined && item.remainingUses <= 0) {
    return false;
  }
  return true;
};

const aggregatePerkEffects = (
  perkInventory: PerkInventoryItem[],
  catalog: PerkDefinition[],
  now: number,
): RewardPerkEffect[] => {
  type Acc = {
    addValue: number;
    mulValue: number;
    mulFactor: number;
    strongestAdd?: PerkEffect;
    strongestMul?: PerkEffect;
  };
  const acc: Partial<Record<RewardPerkEffectType, Acc>> = {};
  perkInventory.forEach((item) => {
    if (!isPerkItemActive(item, now)) return;
    const perk = catalog.find((entry) => entry.id === item.perkId);
    if (!perk?.effects || perk.effects.length === 0) return;
    const stackingRule: PerkStackingRule = perk.stackingRule ?? 'ADDITIVE';
    perk.effects.forEach((effect) => {
      const bucket = (acc[effect.type] = acc[effect.type] ?? {
        addValue: 0,
        mulValue: 0,
        mulFactor: 1,
      });
      if (stackingRule === 'NONE') {
        if (effect.mode === 'mul') {
          if (!bucket.strongestMul || Math.abs(effect.value) > Math.abs(bucket.strongestMul.value)) {
            bucket.strongestMul = effect;
          }
        } else {
          if (!bucket.strongestAdd || Math.abs(effect.value) > Math.abs(bucket.strongestAdd.value)) {
            bucket.strongestAdd = effect;
          }
        }
        return;
      }
      if (stackingRule === 'ADDITIVE') {
        if (effect.mode === 'mul') {
          bucket.mulValue += effect.value;
        } else {
          bucket.addValue += effect.value;
        }
        return;
      }
      // MULTIPLICATIVE
      if (effect.mode === 'mul') {
        bucket.mulFactor *= 1 + effect.value;
      } else {
        bucket.addValue += effect.value;
      }
    });
  });

  return Object.entries(acc).flatMap(([type, bucket]) => {
    if (!bucket) return [];
    const addValue = bucket.addValue + (bucket.strongestAdd?.value ?? 0);
    const mulBase = bucket.mulValue + (bucket.strongestMul?.value ?? 0);
    const combinedMultiplier = (1 + mulBase) * bucket.mulFactor - 1;
    const effects: RewardPerkEffect[] = [];
    if (addValue !== 0) {
      effects.push({ type: type as RewardPerkEffectType, value: addValue, mode: 'add' });
    }
    if (combinedMultiplier !== 0) {
      effects.push({ type: type as RewardPerkEffectType, value: combinedMultiplier, mode: 'mul' });
    }
    return effects;
  });
};

export const getPerkEffectsForOwned = (
  perkInventory: PerkInventoryItem[],
  catalog: PerkDefinition[] = PERK_CATALOG,
  now = Date.now(),
) => aggregatePerkEffects(perkInventory, catalog, now);

const deriveActiveBoostsFromEffects = (effects: RewardPerkEffect[]): ActiveBoosts =>
  effects.reduce<ActiveBoosts>(
    (acc, effect) => {
      switch (effect.type) {
        case 'DAILY_CLAIM_MULTIPLIER':
          return { ...acc, dailyClaimMultiplier: acc.dailyClaimMultiplier + effect.value };
        case 'EARNING_MULTIPLIER':
          return { ...acc, earningMultiplier: acc.earningMultiplier + effect.value };
        case 'DAILY_LIMIT_BONUS':
          return { ...acc, dailyLimitBonus: acc.dailyLimitBonus + effect.value };
        case 'DAILY_CLAIM_BONUS':
        default:
          return acc;
      }
    },
    { ...defaultActiveBoosts },
  );

export const applyPerkBoosts = (
  perkInventory: PerkInventoryItem[],
  catalog: PerkDefinition[] = PERK_CATALOG,
) => {
  const effects = getPerkEffectsForOwned(perkInventory, catalog);
  return deriveActiveBoostsFromEffects(effects);
};

export const calcDailyClaimAmount = (
  base: number,
  perkEffects: RewardPerkEffect[] = [],
  streak?: number,
  streakAdd?: number,
  streakCap?: number,
) =>
  calculateGoldPoints('DAILY_CLAIM', {
    baseReward: base,
    streak,
    streakAdd,
    streakCap,
    perkEffects: perkEffects ?? [],
    isGoldHolder: false,
  }).finalGold;

const createOwnedPerks = (): Record<PerkId, boolean> => ({
  perk_boost_daily: false,
  perk_profile_badge: false,
  perk_creator_drop_access: false,
  perk_priority_matchmaking: false,
  perk_daily_boost_20: false,
  perk_earn_boost_10: false,
  perk_daily_limit_plus_5: false,
});

export const useGoldStore = create<GoldState>()(
  persist(
    (set, get) => ({
      role: 'fan',
      balance: 0,
      perk: { hasGoldPass: false },
      nfts: [],
      inventory: [],
      perkInventory: [],
      rewardTickets: createMockRewardTickets(),
      perkCatalog: PERK_CATALOG,
      transactions: [],
      lastDailyClaimAt: null,
      tasksDoneToday: 0,
      tasksDayKey: getTodayKey(),
      walletAddress: null,
      dailyClaimStreak: 0,
      earningLog: [],
      actions: DEFAULT_ACTIONS,
      actionState: createDefaultActionState(getTodayKey(), DEFAULT_ACTIONS),
      activeBoosts: { ...defaultActiveBoosts },
      viewedModelsToday: { dayKeyUTC: getUtcDayKey(), modelIds: [] },
      sharedModelsToday: { dayKeyUTC: getUtcDayKey(), modelIds: [] },
      apiSyncEnabled: false,
      inventoryApiEnabled: false,
      setRole: (role) => {
        set({ role });
        get().recomputeBoosts();
      },
      earn: (amount, reason, note) => {
        void logEvent('GOLD_EARNED', { amount, reason, note });
        set((state) => ({
          balance: state.balance + amount,
          transactions: [createTransaction('earn', amount, reason, note), ...state.transactions],
        }));
      },
      spend: (amount, reason, note) => {
        const state = get();
        if (state.balance < amount) {
          return false;
        }
        void logEvent('GOLD_SPENT', { amount, reason, note });
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
        const perk = get().perkCatalog.find((item) => item.id === perkId);
        if (!perk) {
          return { ok: false, error: 'Unknown perk' };
        }
        const state = get();
        const now = Date.now();
        const existingItems = state.perkInventory.filter((item) => item.perkId === perkId);
        const hasPermanent = existingItems.some((item) => !item.expiresAt && item.remainingUses === undefined);
        const hasActive = existingItems.some((item) => isPerkItemActive(item, now));

        if (perk.stackingRule === 'NONE' && (hasPermanent || hasActive)) {
          return { ok: false, error: 'Perk already active' };
        }
        if (!state.canAfford(perk.priceGold)) {
          return { ok: false, error: 'Not enough Gold' };
        }

        const spent = state.spend(perk.priceGold, 'perk_purchase', `Bought ${perk.title}`);
        if (!spent) {
          return { ok: false, error: 'Not enough Gold' };
        }

        const newItem = createPerkInventoryItem(perk, 'SHOP_PURCHASE', now);
        void logEvent('PERK_PURCHASED', { perkId, price: perk.priceGold });
        set((current) => ({
          perkInventory: [newItem, ...current.perkInventory],
        }));
        get().recomputeBoosts();
        return { ok: true };
      },
      mintMockNft: (input) => {
        const newNFT: InventoryNft = createInventoryNft(input);
        const txReason: GoldReason = input?.isPlaceholder ? 'reward_ticket' : 'demo_mint';
        set((state) => ({
          inventory: [newNFT, ...state.inventory],
          nfts: [newNFT, ...state.nfts],
          transactions: [
            createTransaction(
              'earn',
              0,
              txReason,
              newNFT.isPlaceholder ? 'Received reward NFT' : 'Minted demo NFT',
            ),
            ...state.transactions,
          ],
        }));
        return newNFT;
      },
      claimRewardTicket: (ticketId) => {
        const state = get();
        const ticket = state.rewardTickets.find((item) => item.id === ticketId);
        if (!ticket) {
          return { ok: false, error: 'Ticket not found' };
        }
        if (ticket.status !== 'PENDING') {
          return { ok: false, error: 'Ticket already processed' };
        }
        const now = Date.now();
        if (ticket.expiresAt && new Date(ticket.expiresAt).getTime() < now) {
          set(({ rewardTickets }) => ({
            rewardTickets: rewardTickets.map((t) => (t.id === ticketId ? { ...t, status: 'EXPIRED' } : t)),
          }));
          return { ok: false, error: 'Ticket expired' };
        }

        const reward = ticket.reward;
        if (reward.kind === 'GOLD_POINTS') {
          get().earn(reward.amount, 'reward_ticket', 'Claimed reward ticket');
        } else if (reward.kind === 'PERK_ITEM') {
          const perk = state.perkCatalog.find((entry) => entry.id === reward.perkId);
          if (perk) {
            const newItem = createPerkInventoryItem(perk, 'REWARD_TICKET', now);
            set((current) => ({ perkInventory: [newItem, ...current.perkInventory] }));
          }
        } else if (reward.kind === 'NFT_PLACEHOLDER') {
          get().mintMockNft({
            tier: reward.tier,
            isPlaceholder: true,
            name: reward.name,
          });
        }

        set(({ rewardTickets }) => ({
          rewardTickets: rewardTickets.map((t) =>
            t.id === ticketId ? { ...t, status: 'CLAIMED' } : t,
          ),
        }));
        void logEvent('REWARD_CLAIMED', { ticketId, reward: ticket.reward.kind });
        get().recomputeBoosts();
        return { ok: true };
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
        const cooldown = canClaimDailyUtc(state.lastDailyClaimAt);
        if (!cooldown.ok) {
          const remaining = cooldown.remainingMs ?? 0;
          return { ok: false, reason: `Cooldown ${formatRemaining(remaining)}` };
        }
        const lastClaimMs = state.lastDailyClaimAt ? new Date(state.lastDailyClaimAt).getTime() : 0;
        const elapsed = lastClaimMs ? Date.now() - lastClaimMs : Infinity;
        const streak =
          elapsed >= 24 * 60 * 60 * 1000 && elapsed <= 48 * 60 * 60 * 1000
            ? state.dailyClaimStreak + 1
            : 1;
        const perkEffects = state.getActivePerkEffects();
        const { finalGold } = calculateGoldPoints('DAILY_CLAIM', {
          baseReward: 25,
          streak,
          perkEffects,
          streakAdd: 0,
          isGoldHolder: false,
        });
        const nowIso = new Date().toISOString();
        set({
          lastDailyClaimAt: nowIso,
          dailyClaimStreak: streak,
          earningLog: [
            {
              id: `${Date.now()}-daily`,
              type: 'daily_claim',
              amount: finalGold,
              createdAt: nowIso,
            },
            ...state.earningLog,
          ],
        });
        get().earn(finalGold, 'daily_claim');
        return { ok: true, added: finalGold };
      },
      performEarningAction: (actionId, params) => {
        const normalizedId = normalizeActionId(actionId);
        const check = normalizedId ? get().canUseAction(normalizedId, params) : { ok: false };
        if (!check.ok || !normalizedId) {
          return check;
        }
        const state = get();
        const action =
          state.actions.find((item) => item.id === normalizedId) ?? getCanonicalAction(normalizedId);
        const perkEffects = state.getActivePerkEffects();
        const { finalGold } = calculateGoldPoints(normalizedId, {
          baseReward: action.baseReward,
          perkEffects,
          isGoldHolder: false,
        });
        const nowIso = new Date().toISOString();
        const todayKey = getTodayKey();
        const updateTracker = (tracker: ModelActionTracker, modelId?: string) => {
          if (!modelId) return tracker;
          const ensured = ensureModelTracker(tracker);
          if (ensured.modelIds.includes(modelId)) return ensured;
          return { ...ensured, modelIds: [...ensured.modelIds, modelId] };
        };

        set((current) => {
          const ensuredState = ensureActionStateEntry(normalizedId, current.actionState, todayKey);
          return {
            balance: current.balance + finalGold,
            transactions: [
              createTransaction('earn', finalGold, 'earning_action', `Action ${action.title}`),
              ...current.transactions,
            ],
            actionState: {
              ...current.actionState,
              [normalizedId]: {
                lastUsedAt: nowIso,
                usedTodayCount:
                  (ensuredState.todayKey === todayKey ? ensuredState.usedTodayCount : 0) + 1,
                todayKey,
              },
            },
            earningLog: [
              {
                id: `${Date.now()}-${normalizedId}`,
                type: `action:${normalizedId}`,
                amount: finalGold,
                createdAt: nowIso,
                note: action.title,
              },
              ...current.earningLog,
            ],
            viewedModelsToday:
              normalizedId === 'VIEW_MODEL_PROFILE'
                ? updateTracker(current.viewedModelsToday, params?.modelId)
                : current.viewedModelsToday,
            sharedModelsToday:
              normalizedId === 'SHARE_PROFILE'
                ? updateTracker(current.sharedModelsToday, params?.modelId)
                : current.sharedModelsToday,
          };
        });

        return { ok: true, added: finalGold };
      },
      canUseAction: (actionId, params) => {
        const state = get();
        const normalizedId = normalizeActionId(actionId);
        if (!normalizedId) {
          return { ok: false, reason: 'Unknown action' };
        }
        const action =
          state.actions.find((item) => item.id === normalizedId) ?? getCanonicalAction(normalizedId);
        if (action.roleGate && action.roleGate !== state.role) {
          return { ok: false, reason: 'Role restricted' };
        }
        const todayKey = getTodayKey();
        const entry = ensureActionStateEntry(normalizedId, state.actionState);
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
        if (normalizedId === 'VIEW_MODEL_PROFILE') {
          const tracker = ensureModelTracker(state.viewedModelsToday);
          if (!params?.modelId) {
            return { ok: false, reason: 'Model required' };
          }
          if (tracker.modelIds.includes(params.modelId)) {
            return { ok: false, reason: 'Unique models only' };
          }
          if (tracker.modelIds.length >= limit) {
            return { ok: false, reason: 'Daily limit reached' };
          }
        }
        if (normalizedId === 'SHARE_PROFILE') {
          const tracker = ensureModelTracker(state.sharedModelsToday);
          if (!params?.modelId) {
            return { ok: false, reason: 'Model required' };
          }
          if (tracker.modelIds.includes(params.modelId)) {
            return { ok: false, reason: 'Already shared today' };
          }
          if (tracker.modelIds.length >= limit) {
            return { ok: false, reason: 'Daily limit reached' };
          }
        }
        if (usedToday >= limit) {
          return { ok: false, reason: 'Daily limit reached' };
        }
        return { ok: true };
      },
      recomputeBoosts: () => {
        const state = get();
        const boosts = applyPerkBoosts(state.perkInventory, state.perkCatalog);
        set({ activeBoosts: boosts });
      },
      getOwnedPerks: () => {
        const now = Date.now();
        const owned: Record<PerkId, boolean> = { ...createOwnedPerks() };
        get().perkInventory.forEach((item) => {
          if (isPerkItemActive(item, now)) {
            owned[item.perkId] = true;
          }
        });
        return owned;
      },
      getActivePerkEffects: (now) => {
        const state = get();
        return getPerkEffectsForOwned(state.perkInventory, state.perkCatalog, now ?? Date.now());
      },
      setApiSyncEnabled: (enabled) => set({ apiSyncEnabled: enabled }),
      setInventoryApiEnabled: (enabled) => set({ inventoryApiEnabled: enabled }),
      addRewardTicket: (ticket) => {
        set((state) => {
          const existing = state.rewardTickets.find((item) => item.id === ticket.id);
          const nextTickets = existing
            ? state.rewardTickets.map((item) => (item.id === ticket.id ? { ...item, ...ticket } : item))
            : [ticket, ...state.rewardTickets];
          return { rewardTickets: nextTickets };
        });
      },
      syncFromApi: async () => {
        const state = get();
        if (!state.apiSyncEnabled && !state.inventoryApiEnabled) {
          return { ok: false, reason: 'API sync disabled' };
        }
        try {
          const [economyResponse, inventoryResponse] = await Promise.all([
            state.apiSyncEnabled ? getEconomyMe() : null,
            state.inventoryApiEnabled ? getInventoryMe() : null,
          ]);
          const data = economyResponse?.data ?? {};
          const apiInventory = inventoryResponse?.data as InventoryNft[] | undefined;
          const incomingActions = Array.isArray(data.earningActions)
            ? data.earningActions
            : Array.isArray(data.actions)
            ? data.actions
            : undefined;
          const nextOwnedPerks = data.ownedPerks
            ? ({ ...createOwnedPerks(), ...data.ownedPerks } as Record<PerkId, boolean>)
            : undefined;
          const perkInventory = Array.isArray(data.perkInventory)
            ? (data.perkInventory as PerkInventoryItem[])
            : Array.isArray(data.inventorySnapshot?.perks)
            ? (data.inventorySnapshot.perks as PerkInventoryItem[])
            : undefined;
          const rewardTickets = Array.isArray(data.rewardTickets)
            ? (data.rewardTickets as RewardTicket[])
            : undefined;
          set((current) => {
            const normalizedActions = normalizeActions(incomingActions ?? current.actions);
            const migratedPerks =
              perkInventory && perkInventory.length > 0
                ? perkInventory
                : current.perkInventory.length > 0
                ? current.perkInventory
                : buildPerkInventoryFromLegacy(
                    nextOwnedPerks ??
                      (current as unknown as { ownedPerks?: Record<PerkId, boolean> }).ownedPerks,
                  );
            const baseInventory = Array.isArray(data.inventory)
              ? (data.inventory as InventoryNft[])
              : current.inventory;
            const mergedWithLocal = [
              ...current.inventory,
              ...baseInventory.filter(
                (item) => !current.inventory.some((existing) => existing.id === item.id),
              ),
            ];
            const mergedInventory =
              apiInventory && apiInventory.length > 0
                ? [
                    ...mergedWithLocal,
                    ...apiInventory.filter(
                      (item) => !mergedWithLocal.some((existing) => existing.id === item.id),
                    ),
                  ]
                : mergedWithLocal;
            return {
              balance: typeof data.balance === 'number' ? data.balance : current.balance,
              perkInventory: migratedPerks,
              inventory: mergedInventory,
              nfts: mergedInventory,
              rewardTickets: rewardTickets ?? current.rewardTickets,
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
              actions: normalizedActions,
              actionState: migrateActionState(current.actionState, normalizedActions, getTodayKey()),
            };
          });
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
        const normalizedActions = normalizeActions(updatedState.actions);
        const refreshed: Record<string, EarningActionStateEntry> = {};
        const allActionIds = new Set([
          ...Object.keys(existingActionState),
          ...normalizedActions.map((a) => a.id),
        ]);
        allActionIds.forEach((key) => {
          const normalizedId = normalizeActionId(key);
          if (!normalizedId) return;
          refreshed[normalizedId] = ensureActionStateEntry(
            normalizedId,
            existingActionState,
            todayKey,
          );
        });
        set({
          actions: normalizedActions,
          actionState: refreshed,
          viewedModelsToday: ensureModelTracker(updatedState.viewedModelsToday),
          sharedModelsToday: ensureModelTracker(updatedState.sharedModelsToday),
        });
      },
    }),
    {
      name: 'synthara.gold.v1',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.actions = normalizeActions(state.actions);
          state.actionState = migrateActionState(
            state.actionState ?? {},
            state.actions ?? DEFAULT_ACTIONS,
            getTodayKey(),
          );
          state.viewedModelsToday = ensureModelTracker(state.viewedModelsToday);
          state.sharedModelsToday = ensureModelTracker(state.sharedModelsToday);
          if (!state.perkInventory || state.perkInventory.length === 0) {
            const legacyOwnedPerks = (state as unknown as { ownedPerks?: Record<PerkId, boolean> }).ownedPerks;
            state.perkInventory = buildPerkInventoryFromLegacy(legacyOwnedPerks);
          }
          state.rewardTickets = state.rewardTickets ?? createMockRewardTickets();
          state.perkCatalog = state.perkCatalog ?? PERK_CATALOG;
          state.inventoryApiEnabled = state.inventoryApiEnabled ?? false;
          state.recomputeBoosts?.();
        }
      },
    },
  ),
);
