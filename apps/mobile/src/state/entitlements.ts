import { EntitlementKey } from '@synthara/shared';
import { create } from 'zustand';

import { getEntitlements } from '../api/client';
import { isPerkItemActive, useGoldStore } from './gold';

type EntitlementMap = Record<EntitlementKey, boolean>;

type EntitlementsState = {
  entitlements: EntitlementMap;
  lastSyncedAt?: string;
  apiEnabled: boolean;
  syncEntitlementsFromApi: () => Promise<{ ok: boolean; reason?: string }>;
  refreshFromLocal: () => void;
  hasEntitlement: (key: EntitlementKey) => boolean;
  setApiEnabled: (enabled: boolean) => void;
};

const createEmptyEntitlements = (): EntitlementMap => ({
  CAN_CLAIM_DAILY_GOLD: true,
  CAN_USE_EARNING_ACTIONS: true,
  HAS_ACTIVE_GOLD_PASS: false,
  CAN_ACCESS_GAME_ROOM: false,
  CAN_CLAIM_REWARD_TICKET: false,
  CAN_VIEW_LORA_PASSPORT: false,
});

const deriveLocalEntitlements = (): { entitlements: EntitlementMap; updatedAt: string } => {
  const state = useGoldStore.getState();
  const now = Date.now();
  const hasGoldPassFromPerkInventory = state.perkInventory.some(
    (item) => (item.perkId as string) === 'perk_gold_pass' && isPerkItemActive(item, now),
  );
  const hasGoldPass =
    hasGoldPassFromPerkInventory ||
    (state.perk.hasGoldPass &&
      (!state.perk.goldPassExpiresAt || new Date(state.perk.goldPassExpiresAt).getTime() > now));

  const entitlements = createEmptyEntitlements();
  entitlements.HAS_ACTIVE_GOLD_PASS = hasGoldPass;
  entitlements.CAN_CLAIM_REWARD_TICKET = state.rewardTickets.some((ticket) => ticket.status === 'PENDING');
  entitlements.CAN_ACCESS_GAME_ROOM = hasGoldPass;
  entitlements.CAN_VIEW_LORA_PASSPORT = hasGoldPass;

  return { entitlements, updatedAt: new Date().toISOString() };
};

export const useEntitlementsStore = create<EntitlementsState>((set, get) => ({
  entitlements: deriveLocalEntitlements().entitlements,
  lastSyncedAt: undefined,
  apiEnabled: true,
  setApiEnabled: (enabled) => set({ apiEnabled: enabled }),
  refreshFromLocal: () => {
    const fallback = deriveLocalEntitlements();
    set({ entitlements: fallback.entitlements, lastSyncedAt: fallback.updatedAt });
  },
  syncEntitlementsFromApi: async () => {
    const state = get();
    if (!state.apiEnabled) {
      const fallback = deriveLocalEntitlements();
      set({ entitlements: fallback.entitlements, lastSyncedAt: fallback.updatedAt });
      return { ok: false, reason: 'API disabled' };
    }
    try {
      const response = await getEntitlements();
      const payload = response.data as {
        entitlements?: { key: EntitlementKey; value: boolean }[];
        updatedAt?: string;
      };
      const mapped = createEmptyEntitlements();
      payload.entitlements?.forEach((item) => {
        mapped[item.key] = Boolean(item.value);
      });
      set({
        entitlements: mapped,
        lastSyncedAt: payload.updatedAt ?? new Date().toISOString(),
      });
      return { ok: true };
    } catch (error) {
      const fallback = deriveLocalEntitlements();
      set({ entitlements: fallback.entitlements, lastSyncedAt: fallback.updatedAt });
      return { ok: false, reason: 'Failed to sync entitlements' };
    }
  },
  hasEntitlement: (key) => {
    const entitlements = get().entitlements;
    return entitlements[key] ?? deriveLocalEntitlements().entitlements[key] ?? false;
  },
}));

useGoldStore.subscribe(() => {
  useEntitlementsStore.getState().refreshFromLocal();
});
