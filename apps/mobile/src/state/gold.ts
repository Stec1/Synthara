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
  | 'admin_airdrop'
  | 'creator_reward';

export interface GoldTransaction {
  id: string;
  ts: string;
  type: GoldTxType;
  amount: number;
  reason: GoldReason;
  note?: string;
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
  transactions: GoldTransaction[];
  setRole: (role: UserRole) => void;
  earn: (amount: number, reason: GoldReason, note?: string) => void;
  spend: (amount: number, reason: GoldReason, note?: string) => boolean;
  claimDaily: () => { ok: boolean; error?: string };
  completeTask: () => { ok: boolean; error?: string };
  unlockGoldPass: () => boolean;
  mintMockNFT: () => boolean;
  adminAirdrop: () => boolean;
  creatorReward: () => boolean;
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

export const useGoldStore = create<GoldState>()(
  persist(
    (set, get) => ({
      role: 'fan',
      balance: 0,
      perk: { hasGoldPass: false },
      nfts: [],
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
      mintMockNFT: () => {
        const success = get().spend(250, 'mint_nft');
        if (!success) {
          return false;
        }
        const createdAt = new Date().toISOString();
        const newNFT: MockNFT = {
          id: `nft-${Date.now()}`,
          name: `Gold NFT #${Math.floor(Math.random() * 10000)
            .toString()
            .padStart(4, '0')}`,
          createdAt,
        };
        set((state) => ({
          nfts: [newNFT, ...state.nfts],
        }));
        return true;
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
