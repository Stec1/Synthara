import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type DemoIdentityRole = 'fan' | 'creator';

interface DemoIdentityState {
  enabled: boolean;
  userId: string;
  role: DemoIdentityRole;
  setRole: (role: DemoIdentityRole) => void;
  toggleEnabled: (enabled: boolean) => void;
  resetDemoIdentity: () => void;
}

const defaultState: Pick<DemoIdentityState, 'enabled' | 'role' | 'userId'> = {
  enabled: true,
  userId: 'demo-user-001',
  role: 'fan',
};

export const useDemoIdentityStore = create<DemoIdentityState>()(
  persist(
    (set) => ({
      ...defaultState,
      setRole: (role) => set({ role }),
      toggleEnabled: (enabled) => set({ enabled }),
      resetDemoIdentity: () => set({ ...defaultState }),
    }),
    {
      name: 'demo-identity',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
