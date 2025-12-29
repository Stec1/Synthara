import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type LocalNftItem = {
  id: string;
  modelId: string;
  tier: 'diamond' | 'gold';
  label: string;
  status: 'owned' | 'listed' | 'locked';
  acquiredAtISO: string;
  source: 'mint_mock' | 'demo' | 'reward';
  createdByUserId: string;
};

type LocalInventoryState = {
  nfts: LocalNftItem[];
  addNft: (item: LocalNftItem) => void;
  getNfts: () => LocalNftItem[];
};

export const useLocalInventoryStore = create<LocalInventoryState>()(
  persist(
    (set, get) => ({
      nfts: [],
      addNft: (item) =>
        set((state) =>
          state.nfts.some((nft) => nft.id === item.id)
            ? state
            : {
                nfts: [item, ...state.nfts],
              },
        ),
      getNfts: () => get().nfts,
    }),
    {
      name: 'synthara.localInventory.v1',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
