import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type LoggedEvent = {
  id: string;
  eventType: string;
  metadata?: Record<string, unknown>;
  ts: string;
};

type EventLogState = {
  events: LoggedEvent[];
  logLocalEvent: (eventType: string, metadata?: Record<string, unknown>) => void;
  lastEvents: (limit?: number) => LoggedEvent[];
};

export const useEventLogStore = create<EventLogState>()(
  persist(
    (set, get) => ({
      events: [],
      logLocalEvent: (eventType, metadata) => {
        const entry: LoggedEvent = {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          eventType,
          metadata,
          ts: new Date().toISOString(),
        };
        set((state) => ({
          events: [entry, ...state.events].slice(0, 50),
        }));
      },
      lastEvents: (limit = 10) => get().events.slice(0, limit),
    }),
    {
      name: 'synthara.events.log.v1',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
